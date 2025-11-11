'use server';
import { getToken } from "next-auth/jwt";
import { cookies } from 'next/headers';  // To manipulate cookies directly
import { jwtDecode } from "jwt-decode";
import { redirect } from "next/navigation";
import { auth } from "@auth";
import { AuthTokenI } from "@interfaces/props";

const keycloakConfig = JSON.parse(`${process.env.KEYCLOAK}`);
const keycloakAdminConfig = JSON.parse(`${process.env.KEYCLOAK_ADMIN_CREDENTIALS}`);
const logoutRedirectUrl = process.env.NEXT_PUBLIC_WORKSPACE_URL + '/?service=STORE';

export const logout = async (avoidKeycloakLogout: boolean): Promise<void> => {
	try {
		const session = await auth() as AuthTokenI;

		if (!session) {
			console.log('No active session found on logout');
			deleteCookies();
			redirect(logoutRedirectUrl);
		}

		try {
			if (!avoidKeycloakLogout) {
				const currentSessionId = session.user.sid;

				if (currentSessionId) {
					console.log(`Terminating current session: ${currentSessionId}`);
					await revokeUserSession(currentSessionId);
					console.log('Successfully terminated current Keycloak session');
				} else {
					console.warn('No session ID found, falling back to front-channel logout only');
				}
			}
		} catch (error) {
			console.error('Error with single session logout:', error);
		}

		deleteCookies();

		if (session.id_token) {
			const params = new URLSearchParams({
				id_token_hint: session.id_token,
				post_logout_redirect_uri: logoutRedirectUrl,
				client_id: keycloakConfig.clientId
			});

			const frontChannelLogoutUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout?${params}`;
			console.log('Redirecting to front-channel logout URL:', frontChannelLogoutUrl);

			redirect(frontChannelLogoutUrl);
			return;
		}

		console.log('Fallback fired');
		redirect(logoutRedirectUrl);
	} catch (error: any) {
		if (!error.digest?.startsWith('NEXT_REDIRECT')) {
			console.error('Error during front-channel logout process:', error);
		}
		deleteCookies();
		redirect(logoutRedirectUrl);
	}
};

export const getTokenService = async (whole: boolean = false): Promise<any> => {
	try {
		let secureCookie = false;
		const cookieStore = await cookies();
		let tokenParts = [];
		for (const cookie of cookieStore.getAll()) {
			if (cookie.name.startsWith('__Secure-next-auth.session-token.')) secureCookie = true;
			if (cookie.name.startsWith('next-auth.session-token.') || cookie.name.startsWith('__Secure-next-auth.session-token.')) {
				tokenParts.push(cookie);
			}
		}
		tokenParts.sort((a, b) => {
			const indexA = parseInt(a.name.split('.').pop() || '0', 10);
			const indexB = parseInt(b.name.split('.').pop() || '0', 10);
			return indexA - indexB;
		});
		const fullToken = tokenParts.map(part => part.value).join('');
		let token = await getToken({ req: { cookies: secureCookie ? { '__Secure-next-auth.session-token': fullToken } : { 'next-auth.session-token': fullToken } } as unknown as Parameters<typeof getToken>[0] as any, secret: process.env.AUTH_SECRET }) as any;
		if (!token) return '';
		token = await checkToken(token);
		if (whole) return token;
		return token as string;
	} catch (error: any) {
		//If there's no session but a cookie is present, remove it
		if (error && (error === 'Failed to refresh token' || error.error === 'invalid_grant')) {
			deleteCookies();
			return '';
		}
		throw error;
	}
};


const checkToken = async (token: any) => {
	try {
		const refreshedToken = await refreshAccessToken(token);
		return refreshedToken;
	} catch (error) {
		console.log('Failed to refresh token on auth.ts');
		console.log(token);
		throw error;
	}
};

export const refreshAccessToken = async (token: any) => {
	const response = await fetch(`${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`, {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: keycloakConfig.clientId, //eslint-disable-line
			client_secret: keycloakConfig.clientSecret, //eslint-disable-line
			grant_type: 'refresh_token', //eslint-disable-line
			refresh_token: token.refresh_token //eslint-disable-line
		}),
		method: 'POST',
	});

	if (response.status !== 200) {
		const body = await response.json();
		throw body;
	}

	const refreshToken = await response.json();
	return {
		...token,
		access_token: refreshToken.access_token, //eslint-disable-line
		decoded: jwtDecode(refreshToken.access_token),
		id_token: refreshToken.id_token, //eslint-disable-line
		expires_at: Math.floor(Date.now() / 1000) + refreshToken.expires_in, //eslint-disable-line
		refresh_token: refreshToken.refresh_token //eslint-disable-line
	};
};

const deleteCookies = async () => {
	const cookieStore = await cookies();
	const allCookies = cookieStore.getAll();

	for (const cookie of allCookies) {
		if (cookie.name.includes('authjs.session-token') || cookie.name.includes('next-auth.session-token')) {
			cookieStore.delete(cookie.name);
		}
	}
	cookieStore.delete('__Host-next-auth.csrf-token');
	cookieStore.delete('next-auth.csrf-token');
	cookieStore.delete('store');
	cookieStore.delete('redirect');
};

export const updateUserStore = async (sub: string, store: string) => {
	const adminToken = await getAdminAccessToken();
	const url = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/users/${sub}`;

	const currentUserResponse = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${adminToken}`,
		},
		method: 'GET',
	});

	if (!currentUserResponse.ok) {
		console.error('Failed to fetch user data: ', currentUserResponse.status);
		throw new Error('Failed to fetch user data');
	}

	const currentUser = await currentUserResponse.json();

	const updatedAttributes = {
		...currentUser.attributes,
		current_store: [store]
	};

	const response = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${adminToken}`,
		},
		method: 'PUT',
		body: JSON.stringify({
			...currentUser,
			attributes: updatedAttributes,
		}),
	});

	if (response.status !== 200 && response.status !== 204) {
		console.error('Failed to update user: ', response.status);
	}

	return;
};

export const getAdminAccessToken = async (): Promise<string> => {
	const url = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			grant_type: 'client_credentials', //eslint-disable-line
			client_id: keycloakAdminConfig.clientId, //eslint-disable-line
			client_secret: keycloakAdminConfig.clientSecret //eslint-disable-line
		})
	});

	const data = await response.json();
	return data.access_token;
};

export const getLegacyAccessToken = async (): Promise<string> => {
	const url = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			grant_type: 'client_credentials', //eslint-disable-line
			client_id: keycloakAdminConfig.clientId, //eslint-disable-line
			client_secret: keycloakAdminConfig.clientSecret //eslint-disable-line
		})
	});

	const data = await response.json();
	return data.access_token;
};

export const getStore = async (): Promise<any | null> => {
	try {
		const store = (await cookies()).get('store');

		return store?.value || '';
	} catch (error) {
		throw error;
	}
};

export const getUserSessions = async (): Promise<any[]> => {
	const session = await auth() as AuthTokenI;
	const adminToken = await getAdminAccessToken();
	const url = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/enhanced-sessions/user-sessions/${session.user.sub}`;
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${adminToken}`,
			'Accept': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch user sessions: ${response.statusText}`);
	}

	return await response.json();
};

export const revokeUserSession = async (sessionId: string): Promise<boolean> => {
	const adminToken = await getAdminAccessToken();
	const url = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/sessions/${sessionId}`;

	const response = await fetch(url, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${adminToken}`,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to revoke session: ${response.statusText}`);
	}

	return true;
};

export const getUserIdentityProviders = async (): Promise<any[]> => {
	const session = await auth() as AuthTokenI;
	const adminToken = await getAdminAccessToken();
	const url = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/users/${session.user.sub}/federated-identity`;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${adminToken}`,
			'Accept': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch user identity providers: ${response.statusText}`);
	}

	return await response.json();
};

export const changeUserPassword = async (currentPassword: string, newPassword: string) => {
	const session = await auth() as AuthTokenI;
	const adminToken = await getAdminAccessToken();
	const url = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/users/${session.user.sub}/reset-password`;

	const verification = await verifyCurrentPasswordWithLocking(currentPassword);

	if (!verification.success) {
		if (verification.remainingAttempts === 0) {
			return {
				success: false,
				message: 'You have failed more than 3 times, we temporarily blocked the process. If you do not remember your current password, try recovering your password.',
				status: 403
			};
		} else {
			return {
				success: false,
				message: `The current password does not match. The password could not be updated.`,
				status: 400
			};
		}
	}

	const response = await fetch(url, {
		method: 'PUT',
		headers: {
			'Authorization': `Bearer ${adminToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			type: 'password',
			value: newPassword,
			temporary: false
		})
	});

	if (!response.ok) {
		return {
			success: false,
			message: `Failed to change password: ${response.statusText}`,
			status: 400
		};
	}

	return {
		success: true,
		message: 'Password updated successfully!',
		status: 200
	};
};

export const sendWhatsappOtp = async (): Promise<any> => {
	const session = await auth() as AuthTokenI;
	const url = `${process.env.OTP_SERVICE_URL}send-sms/whatsapp`;

	if (!session?.user?.phone) {
		throw new Error('User phone not found');
	}

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			phone: session.user.phone
		})
	});

	if (!response.ok) {
		throw new Error(`Failed to send OTP: ${response.statusText}`);
	}

	const data = await response.json();

	return data;
};

export const sendEmailOtp = async (): Promise<any> => {
	try {
		const session = await auth() as AuthTokenI;

		if (!session?.user?.email) {
			throw new Error('User email not found');
		}

		const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
		const expirationTime = Date.now() + (15 * 60 * 1000); // 15 minutes expiration

		const otpData = {
			emailOtp: otpCode,
			emailOtpExpiration: expirationTime.toString()
		};

		const emailResponse = await fetch(`${process.env.AUTH_URL}/api/email/route`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				to: session.user.email,
				name: session.user.name,
				otp: otpCode
			})
		});

		if (!emailResponse.ok) {
			throw new Error(`Failed to send email: ${emailResponse.statusText}`);
		}

		return otpData;
	} catch (error) {
		console.error('Error sending email OTP:', error);
		throw error;
	}
};

export async function checkEmailVerificationStatus(): Promise<boolean> {
	try {
		const session = await auth() as AuthTokenI;
		const adminToken = await getAdminAccessToken();
		const url = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/users/${session.user.sub}`;

		const response = await fetch(url, {
			headers: {
				'Authorization': `Bearer ${adminToken}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch user data');
		}

		const userData = await response.json();
		return userData.emailVerified || false;
	} catch (error) {
		console.error('Error checking verification status:', error);
		throw error;
	}
}

export async function sendEmailVerification(): Promise<any> {
	try {
		const session = await auth() as AuthTokenI;
		if (!session?.user?.sub) {
			throw new Error('User ID not found');
		}

		const adminToken = await getAdminAccessToken();
		const url = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/users/${session.user.sub}/execute-actions-email`;

		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${adminToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(['VERIFY_EMAIL'])
		});

		if (!response.ok) {
			throw new Error(`Failed to trigger email verification: ${response.statusText}`);
		}

		return { success: true, message: "Verification email sent successfully" };
	} catch (error) {
		console.error('Error sending verification email:', error);
		throw error;
	}
}

export async function getPasswordLastUpdated(): Promise<any> {
	try {
		const session = await auth() as AuthTokenI;
		if (!session?.user?.sub) {
			throw new Error('User ID not found');
		}

		const adminToken = await getAdminAccessToken();

		const url = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/users/${session.user.sub}/credentials`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${adminToken}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch user credentials: ${response.statusText}`);
		}

		const credentials = await response.json();

		const passwordCredential = credentials.find((cred: { type: string }) => cred.type === 'password');

		if (!passwordCredential) {
			return null;
		}

		return {              //Fixing the return type
			passwordLastUpdate: new Date(passwordCredential.createdDate || passwordCredential.createdTimestamp)
		};
	} catch (error) {
		console.error('Error getting password last updated date:', error);
		throw error;
	}
}

export async function verifyCurrentPassword(password: string): Promise<boolean> {
	try {
		const session = await auth() as AuthTokenI;
		if (!session?.user?.email) {
			throw new Error('User not authenticated');
		}

		const url = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;

		const formData = new URLSearchParams({
			client_id: keycloakConfig.clientId,
			client_secret: keycloakConfig.clientSecret,
			grant_type: 'password',
			username: session.user.email,
			password: password
		});

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: formData
		});

		if (response.ok) {
			try {
				const tokenData = await response.json();
				if (tokenData.refresh_token) {
					const logoutUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout`;
					await fetch(logoutUrl, {
						method: 'POST',
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
						body: new URLSearchParams({
							client_id: keycloakConfig.clientId,
							client_secret: keycloakConfig.clientSecret,
							refresh_token: tokenData.refresh_token
						})
					});
				}
			} catch (error) {
				console.error('Failed to cleanup verification session:', error);
			}
		}

		return response.ok;
	} catch (error) {
		console.error('Error verifying password:', error);
		return false;
	}
}

export async function verifyCurrentPasswordWithLocking(password: string): Promise<{ success: boolean; remainingAttempts: number | null; isLocked: boolean }> {
	try {
		const session = await auth() as AuthTokenI;
		if (!session?.user?.sub) {
			throw new Error('User not authenticated');
		}

		const adminToken = await getAdminAccessToken();
		const userId = session.user.sub;

		const userUrl = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/users/${userId}`;
		const userResponse = await fetch(userUrl, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${adminToken}`,
				'Accept': 'application/json'
			}
		});

		if (!userResponse.ok) {
			throw new Error('Failed to fetch user data');
		}

		const userData = await userResponse.json();

		if (userData.enabled === false) {
			return { success: false, remainingAttempts: 0, isLocked: true };
		}

		const realmUrl = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}`;
		const realmResponse = await fetch(realmUrl, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${adminToken}`,
				'Accept': 'application/json'
			}
		});

		if (!realmResponse.ok) {
			throw new Error('Failed to fetch realm settings');
		}

		const realmData = await realmResponse.json();
		const maxFailureAttempts = realmData.bruteForceProtected ? realmData.failureFactor : 3;

		const isPasswordValid = await verifyCurrentPassword(password);

		if (isPasswordValid) {
			const bruteForceUrl = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/attack-detection/brute-force/users/${userId}`;
			await fetch(bruteForceUrl, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${adminToken}`
				}
			});

			return { success: true, remainingAttempts: null, isLocked: false };
		} else {
			const bruteForceUrl = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/attack-detection/brute-force/users/${userId}`;
			const bruteForceResponse = await fetch(bruteForceUrl, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${adminToken}`,
					'Accept': 'application/json'
				}
			});

			let currentFailures = 0;
			let isLocked = false;

			if (bruteForceResponse.ok) {
				const bruteForceData = await bruteForceResponse.json();
				currentFailures = bruteForceData.numFailures || 0;
				isLocked = bruteForceData.disabled || false;
			}

			const recordFailureUrl = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/attack-detection/brute-force/users/${userId}/record-failed-login`;
			await fetch(recordFailureUrl, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${adminToken}`,
					'Content-Type': 'application/json'
				}
			});

			currentFailures++;
			const remainingAttempts = Math.max(0, maxFailureAttempts - currentFailures);

			isLocked = remainingAttempts <= 0;

			return { success: false, remainingAttempts, isLocked };
		}
	} catch (error) {
		console.error('Error verifying password with Keycloak locking:', error);
		return { success: false, remainingAttempts: null, isLocked: false };
	}
}

export const getForgottenRedirect = async (preserveUTM: boolean = true): Promise<string> => {
	try {
		let redirectUrl = `${process.env.NEXT_PUBLIC_WORKSPACE_URL}/?service=STORE`;
		
		// Add UTM parameters from cookie if preserveUTM is true and we're in browser environment
		if (preserveUTM && typeof window !== 'undefined') {
			const { UTMManager } = await import('../utils/utmManager');
			const baseParams = { service: 'STORE' };
			const queryString = UTMManager.buildQueryStringWithUTM(baseParams);
			redirectUrl = `${process.env.NEXT_PUBLIC_WORKSPACE_URL}/?${queryString}`;
		}

		const url = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth?client_id=${keycloakConfig.clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=openid&hint2=forgotten`;

		return url;
	} catch (error) {
		// console.error(error);
		return '';
	}
};

export async function checkIfTokenIsRevoked(token: AuthTokenI) {
	try {
		const introspectionEndpoint = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token/introspect`;
		const params = new URLSearchParams();
		params.append('token', token.access_token);
		params.append('client_id', keycloakConfig.clientId);
		params.append('client_secret', keycloakConfig.clientSecret);

		const response = await fetch(introspectionEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: params.toString(),
		});

		const data = await response.json();
		return !data.active;
	} catch (error) {
		console.error('Error checking token validity:', error);

		await new Promise(resolve => setTimeout(resolve, 5000));
		return checkIfTokenIsRevoked(token);
	}
}

export const getUserAttributes = async (): Promise<any> => {
	try {
		const session = await auth() as AuthTokenI;
		const targetUserId = session?.user?.sub;

		if (!targetUserId) {
			throw new Error('User ID not found');
		}

		const adminToken = await getAdminAccessToken();
		const url = `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/users/${targetUserId}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${adminToken}`,
				'Accept': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch user attributes: ${response.statusText}`);
		}

		const userData = await response.json();
		return userData.attributes || {};
	} catch (error) {
		console.error('Error retrieving user attributes:', error);
		throw error;
	}
};
