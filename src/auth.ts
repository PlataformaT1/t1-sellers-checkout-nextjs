import { checkIfTokenIsRevoked, refreshAccessToken } from "@services/authService";
import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { jwtDecode } from "jwt-decode";

const keycloakConfig = JSON.parse(`${process.env.KEYCLOAK}`);

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Keycloak({
			clientId: keycloakConfig.clientId,
			clientSecret: keycloakConfig.clientSecret,
			issuer: `${keycloakConfig.url}/realms/${keycloakConfig.realm}`,
			wellKnown: `${keycloakConfig.url}/realms/${keycloakConfig.realm}/.well-known/openid-configuration`,
			token: `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
			authorization: {
				params: {
					scope: 'openid email profile phone'
				}
			}
		})
	],
	callbacks: {
		async jwt({ token, user, account }: any) { //eslint-disable-line
			if (account) {
				return {
					access_token: account.access_token, //eslint-disable-line
					id_token: account.id_token, //eslint-disable-line
					expires_at: account.expires_at, //eslint-disable-line
					refresh_token: account.refresh_token, //eslint-disable-line
					user,
					error: null
				};
			}

			if (Date.now() < (token.expires_at as number * 1000)) {
				return token;
			}

			try {
				if (!account) throw { error: 'empty_token' };

				const refreshedToken = await refreshAccessToken(token);
				return {
					...refreshedToken,
					user: token.user,
					error: null
				};
			} catch (error: any) {
				return {
					...token,
					error: error.error === 'invalid_grant' ? 'invalid_grant' : error.error === 'empty_token' ? error.error : 'invalid_grant'
				};
			}
		},
		async session({ session, token }: any) {
			if (!token.access_token) return {};

			const isTokenRevoked = await checkIfTokenIsRevoked(token);
			const phone = token.access_token ? (jwtDecode(token.access_token) as { phone_number: string }).phone_number : '';
			const sub = token.access_token ? (jwtDecode(token.access_token) as { sub: string }).sub : '';
			const sid = token.access_token ? (jwtDecode(token.access_token) as { sid: string }).sid : '';

			if (isTokenRevoked) {
				try {
					console.error('Token is revoked and got refreshed for user: ', token.user);

					const refreshedToken = await refreshAccessToken(token);
					return {
						...refreshedToken,
						user: {
							...token.user,
							phone: phone,
							sub: sub,
							sid: sid
						},
						error: null
					};
				} catch (error: any) {
					console.error('Token is revoked for user:', token.user);

					return {
						...token,
						error: 'revoked_grant',
					};
				}
			}

			return {
				...session,
				user: {
					...token.user,
					phone: phone,
					sub: sub,
					sid: sid
				},
				error: token.error,
				access_token: token.access_token, //eslint-disable-line
				id_token: token.id_token, //eslint-disable-line
				expires_at: token.expires_at, //eslint-disable-line
				permissions: token.permissions // Store permissions in session
			};
		}
	},
	session: {
		maxAge: 365 * 24 * 60 * 60, // 1 year, not important for Keycloak
		updateAge: 24 * 60 * 60 // Update daily
	},
	events: {
		async signOut({ token }: any) {
			if (token.id_token) {
				const params = new URLSearchParams({
					id_token_hint: token.id_token as string //eslint-disable-line
				});
				try {
					await fetch(`${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout?${params}`, { method: 'GET' });
				} catch (error) {
					console.error('Logout error:', error);
				}
			}
		}
	},
	useSecureCookies: process.env.AUTH_URL?.includes('https')
});