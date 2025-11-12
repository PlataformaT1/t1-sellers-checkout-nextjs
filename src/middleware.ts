import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@auth';
import { AuthTokenI } from '@interfaces/props';
import { cookies } from 'next/headers';
import { deleteCookie } from 'cookies-next';
import { getUserAccessCached } from '@services/userAccessService';
import { updateUserStore } from '@services/authService';

const redirectUrl = `${process.env.NEXT_PUBLIC_ONBOARDING_URL}?service=SHIPPING`;
const accountRedirectUrl = `${process.env.NEXT_PUBLIC_T1_ACCOUNT_LINK}{SHOPID}&redirectUri=/my-accesses`;
const keycloakConfig = JSON.parse(`${process.env.KEYCLOAK}`);
const retries = 5;

export async function middleware(request: NextRequest) {
	try {
		if (request.url.includes('MissingCSRF')) return NextResponse.redirect(redirectUrl);
		if (request.method !== 'GET') return NextResponse.next();
		if (request.headers.get('next-action')) return NextResponse.next();

		const finalResponse = NextResponse.next();
		// Don't delete cookies on every request - only when needed!
		if (request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.startsWith('/favicon.svg') || request.nextUrl.pathname.endsWith('.ico') || request.nextUrl.pathname.endsWith('.png') || request.nextUrl.pathname.endsWith('.css') || request.nextUrl.pathname.endsWith('.js')) {
			return finalResponse;
		}
		if ((request.url.includes('signIn') || request.url.includes('signin') || request.url.includes('signOut') || request.url.includes('signout') || request.url.includes('error') || request.url.includes('/api'))) {
			finalResponse.cookies.delete('redirected');

			if (request.url.includes('api/auth/error')) {
				const errorUrl = `${process.env.AUTH_URL}/auth/error`;
				return NextResponse.redirect(errorUrl);
			}

			if (request.url.includes('api/auth/signin?error')) {
				const signInUrl = `${process.env.AUTH_URL}/auth/signIn?callbackUrl=${encodeURIComponent('/')}`;
				return NextResponse.redirect(signInUrl);
			}

			if (request.url.includes('api/auth/signout')) {
				const signInUrl = `${process.env.AUTH_URL}/auth/signIn?callbackUrl=${encodeURIComponent('/')}`;
				return NextResponse.redirect(signInUrl);
			}

			if (request.url.includes('error=login_required')) {
				const signInUrl = `${process.env.AUTH_URL}/auth/signIn?callbackUrl=${encodeURIComponent('/')}`;
				return NextResponse.redirect(signInUrl);
			}

			if (request.url.includes('/auth/error')) {
				const signInUrl = `${process.env.AUTH_URL}/auth/signIn?callbackUrl=${encodeURIComponent('/')}`;
				return NextResponse.redirect(signInUrl);
			}

			return finalResponse;
		}

		const session = await auth() as AuthTokenI;
		const store = (await cookies()).get('store');
		let storeId = request.nextUrl.searchParams.get('store') || store?.value || '';

		if (session && !session.error && store && store.value === storeId) {
			if (request.nextUrl.searchParams.get('store')) {
				try {
					const responseData = await getUserAccessCached(session.access_token, storeId, session.user.email);
					const hasAccess: any[] = responseData?.data?.has_access;

					if (!hasAccess) {
						const url = `${process.env.AUTH_URL}/auth/signIn?callbackUrl=${encodeURIComponent('/?store=' + storeId)}`;
						const response = NextResponse.redirect(url);

						response.cookies.set('store', '', {
							expires: new Date(0),
							httpOnly: true,
							path: '/'
						});

						deleteCookies(request, response);
						return response;
					}
					if (responseData?.data?.permissions) {
						session.permissions = responseData.data.permissions;
					}

					if (session.user.sub) updateUserStore(session.user.sub, storeId);
					const response = NextResponse.next();

					return response;
				} catch (error) {
					console.error('Token validation failed:', error);
					const signInUrl = `${process.env.AUTH_URL}/auth/signIn?callbackUrl=${encodeURIComponent('/?store=' + storeId)}`;
					return NextResponse.redirect(signInUrl);
				}
			}
		}

		if (request.nextUrl.pathname === '/' && (!request.nextUrl.searchParams.get('store') || request.nextUrl.searchParams.get('store') === 'null')) {
			const redirected = (await cookies()).get('redirected');

			if (!session) {
				if (request.nextUrl.searchParams.get('code')) {
					console.log('Redirecting to sign in');
					const signInUrl = `${process.env.AUTH_URL}/auth/signIn?callbackUrl=${encodeURIComponent('/')}`;
					return NextResponse.redirect(signInUrl);
				}
				if (!redirected) {
					const url = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth?client_id=${keycloakConfig.clientId}&redirect_uri=${encodeURIComponent(`${process.env.AUTH_URL}/`)}&response_type=code&scope=openid&prompt=none`;
					const response = NextResponse.redirect(url);
					response.cookies.set('redirected', 'true', {
						httpOnly: true,
						path: '/',
						maxAge: 5
					});

					return response;
				}
			}
			if (session) {
				const homeUrl = `${process.env.AUTH_URL}`;

				if (store) {
					return NextResponse.redirect(`${homeUrl}/?store=${store.value}`);
				}

				return NextResponse.redirect(redirectUrl);
			}

			return NextResponse.next();
		}

		if (!session || session.error) {
			const signInUrl = `${process.env.AUTH_URL}/auth/signIn?callbackUrl=${encodeURIComponent('/?store=' + storeId)}`;
			let response = NextResponse.redirect(signInUrl);

			response.cookies.set('store', storeId, {
				httpOnly: true,
				path: '/',
				maxAge: 60 * 60 * 24 * 7, // 1 week
			});

			return response;
		}

		if (session && !storeId) {
			const response = NextResponse.redirect(redirectUrl);
			deleteCookies(request, response);

			return response;
		}

		const responseData = await getUserAccessCached(session.access_token, storeId, session.user.email);
		const hasAccess: any[] = responseData?.data?.has_access;

		if (hasAccess) {
			storeId = responseData.data.seller_id || storeId;

			let response = NextResponse.next();

			response.cookies.set('store', storeId, {
				httpOnly: true,
				path: '/',
				maxAge: 60 * 60 * 24 * 7, // 1 week
			});

			response.headers.set('x-store-id', storeId.toString());

			return response;
		}

		const retried = (await cookies()).get('retried');
		const currentRetries = retried ? parseInt(retried.value) : 0;
		const maxRetries = 2;

		if (!hasAccess && currentRetries < maxRetries) {
			const url = `${process.env.AUTH_URL}/auth/signIn?callbackUrl=${encodeURIComponent('/?store=' + storeId)}`;
			const response = NextResponse.redirect(url);

			response.cookies.set('retried', (currentRetries + 1).toString(), {
				httpOnly: true,
				path: '/',
				maxAge: 10
			});

			deleteCookies(request, response);
			return response;
		}

		if (storeId) throw `User not authorized on store: ${storeId}`;
		throw 'User not allowed on pages admin';
	} catch (error: any) {
		let url = process.env.AUTH_URL + '/auth/signOut';
		if (error && (error === 'Failed to refresh token' || error.error === 'invalid_grant') && request.nextUrl.searchParams.get('store')) {
			url = process.env.AUTH_URL + `/auth/signIn?callbackUrl=${encodeURIComponent('/?store=' + request.nextUrl.searchParams.get('store'))}`;
		}
		if (error && error.error === 'corrupt_grant' || error.error === 'failed_retries') {
			const session = await auth() as AuthTokenI;
			if (session && session.user && session.user.error === 'empty_token') return NextResponse.next();

			const response = NextResponse.redirect(redirectUrl);
			deleteCookies(request, response);
			console.error(`${new Date()} - Failed request to identity with token: `, session);
			console.error(error);

			return response;
		}
		if (error && typeof (error) === 'string' && error.includes('User not authorized on store')) {
			url = accountRedirectUrl.replace('{SHOPID}', request.nextUrl.searchParams.get('store') || '');
		}
		console.error(`${new Date()} - Main middleware error with store ${request.nextUrl.searchParams.get('store')}, redirected to ${url} with error: `, error);
		return NextResponse.redirect(url);
	}
}

export default auth(async (request: NextRequest) => {
	return middleware(request);
});

export const config = {
	matcher: [
		{
			source: '/((?!_next/|api/(?!auth/signin|auth/session|auth/error)|favicon.svg).*)',
			has: [
				{
					type: 'header',
					key: 'accept',
					value: '.*text/html.*',
				}
			],
			missing: [
				{ type: 'header', key: 'next-action' }
			]
		},
		// Add specific matcher for auth session endpoint
		{
			source: '/api/auth/session',
		},
		// Signin error route
		{
			source: '/api/auth/signin',
			has: [
				{
					type: 'query',
					key: 'error',
					value: 'MissingCSRF',
				}
			]
		},
		// Auth error route
		{
			source: '/api/auth/error',
			has: [
				{
					type: 'query',
					key: 'error',
				}
			]
		},
		{
			source: '/auth/error',
			has: [
				{
					type: 'query',
					key: 'error',
				}
			]
		}
	]
};

async function fetchWithRetries(url: string, options: any) {
	let attempts = 0;
	while (attempts < retries) {
		try {
			const response = await fetch(url, options);
			if (response.status === 200) return response;
			attempts++;
		} catch (error) {
			console.error('Retry error:', error);
			attempts++;
		}
	}
	throw 'Failed to fetch identity data after multiple attempts';
}

export function deleteCookies(request: any, response: any) {
	// APPROACH 1: Delete ALL cookies that match the session token pattern
	// This is more reliable than trying to guess exact cookie names and chunks
	const allCookies = request.cookies.getAll();

	for (const cookie of allCookies) {
		// Check if this is a session token cookie (including chunks like .0, .1, etc.)
		if (cookie.name.includes('authjs.session-token') ||
			cookie.name.includes('next-auth.session-token')) {

			console.log(`Deleting session cookie: ${cookie.name}`);

			// Delete using multiple approaches to ensure it works
			// 1. Basic deletion with expires
			response.cookies.set(cookie.name, '', {
				expires: new Date(0),
				maxAge: 0,
				httpOnly: true,
				path: '/'
			});

			// 2. Try with secure flag if it's a secure cookie
			if (cookie.name.includes('__Secure-')) {
				response.cookies.set(cookie.name, '', {
					expires: new Date(0),
					maxAge: 0,
					httpOnly: true,
					secure: true,
					path: '/'
				});
			}

			// 3. Try with sameSite
			response.cookies.set(cookie.name, '', {
				expires: new Date(0),
				maxAge: 0,
				httpOnly: true,
				secure: cookie.name.includes('__Secure-'),
				sameSite: 'lax',
				path: '/'
			});
		}

		// Also delete other auth-related cookies
		if (cookie.name.includes('authjs.pkce') ||
			cookie.name.includes('next-auth.pkce') ||
			cookie.name.includes('authjs.callback-url') ||
			cookie.name.includes('next-auth.callback-url') ||
			cookie.name.includes('authjs.csrf-token') ||
			cookie.name.includes('next-auth.csrf-token')) {

			response.cookies.set(cookie.name, '', {
				expires: new Date(0),
				maxAge: 0,
				path: '/'
			});
		}
	}

	// APPROACH 2: Also try deleting with cookies-next library for specific patterns
	// Try to delete using cookies-next as well (belt and suspenders approach)
	const sessionPatterns = [
		'authjs.session-token',
		'__Secure-authjs.session-token',
		'next-auth.session-token',
		'__Secure-next-auth.session-token'
	];

	for (const pattern of sessionPatterns) {
		// Delete base cookie
		deleteCookie(pattern, {
			req: request,
			res: response,
			httpOnly: true,
			secure: pattern.includes('__Secure-'),
			sameSite: 'lax',
			path: '/'
		});

		// Delete up to 20 chunks (in case of very large sessions)
		for (let i = 0; i < 20; i++) {
			deleteCookie(`${pattern}.${i}`, {
				req: request,
				res: response,
				httpOnly: true,
				secure: pattern.includes('__Secure-'),
				sameSite: 'lax',
				path: '/'
			});
		}
	}
}