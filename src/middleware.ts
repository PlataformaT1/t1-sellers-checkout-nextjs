import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@auth';
import { AuthTokenI } from '@interfaces/props';
import {
	reconstructURLWithParams,
	PRESERVED_PARAMS_COOKIE,
	PreservedParams
} from '@utils/utmPreserver';

export async function middleware(request: NextRequest) {
	try {
		const finalResponse = NextResponse.next();

		// Helper function to create auth redirect URL with preserved parameters
		const createAuthRedirectUrl = (fallbackPath: string = '/') => {
			return `${process.env.AUTH_URL}/api/auth/signIn?callbackUrl=${encodeURIComponent(fallbackPath)}`;
		};


		const defaultAuthUrl = createAuthRedirectUrl();

		if (request.url.includes('MissingCSRF')) {
			return NextResponse.redirect(defaultAuthUrl);
		}

		if (request.method !== 'GET') return NextResponse.next();
		if (request.headers.get('next-action')) return NextResponse.next();
		if (request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.startsWith('/favicon.ico') || request.nextUrl.pathname.endsWith('.ico') || request.nextUrl.pathname.endsWith('.png') || request.nextUrl.pathname.endsWith('.css') || request.nextUrl.pathname.endsWith('.js')) {
			return finalResponse;
		}

		if ((request.url.includes('signIn') || request.url.includes('signin') || request.url.includes('signOut') || request.url.includes('signout') || request.url.includes('error') || request.url.includes('/api'))) {
			finalResponse.cookies.delete('redirected');

			// Check if this is a callback from auth and we have preserved params
			if (request.url.includes('api/auth/callback') || request.url.includes('signin')) {
				// Check for preserved parameters in cookies and restore them
				const preservedParamsCookie = request.cookies.get(PRESERVED_PARAMS_COOKIE);
				if (preservedParamsCookie) {
					try {
						const preservedParams: PreservedParams = JSON.parse(preservedParamsCookie.value);
						console.log('Restoring preserved params after auth:', preservedParams);

						// Clear the cookie since we're using it
						finalResponse.cookies.delete(PRESERVED_PARAMS_COOKIE);

						// If we have an original path, redirect there with params
						if (preservedParams.original_path) {
							const restoredUrl = reconstructURLWithParams(preservedParams.original_path, preservedParams);
							return NextResponse.redirect(new URL(restoredUrl, request.url));
						}
					} catch (error) {
						console.error('Error parsing preserved params:', error);
					}
				}
			}

			if (request.url.includes('api/auth/error')) {
				const errorUrl = `${process.env.AUTH_URL}/auth/error`;
				return NextResponse.redirect(errorUrl);
			}

			if (request.url.includes('api/auth/signin?error')) {
				return NextResponse.redirect(createAuthRedirectUrl());
			}

			if (request.url.includes('api/auth/signout')) {
				return NextResponse.redirect(createAuthRedirectUrl());
			}

			if (request.url.includes('error=login_required')) {
				return NextResponse.redirect(createAuthRedirectUrl());
			}

			if (request.url.includes('/auth/error')) {
				return NextResponse.redirect(createAuthRedirectUrl());
			}

			return finalResponse;
		}

		const session = await auth() as AuthTokenI;

		if (!session || (session && session.error) || !session.access_token) {
			const response = NextResponse.redirect(createAuthRedirectUrl());

			return response;
		}

		return NextResponse.next();
	} catch (error) {
		console.error('Middleware error:', error);
		const url = `${process.env.AUTH_URL}/api/auth/logout`;
		return NextResponse.redirect(url);
	}
}

export default auth(async (req: NextRequest) => {
	return middleware(req);
});

export const config = {
	matcher: [
		{
			source: '/((?!_next/|api/(?!auth/signin|auth/session|auth/error)|favicon.ico).*)',
			has: [
				{
					type: 'header',
					key: 'accept',
					value: '.*(text/html|application/json|\\*/\\*).*'
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
