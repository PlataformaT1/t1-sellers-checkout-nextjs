'use client';

import '@styles/globals.scss';
import React, { Suspense, useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { ProvidersI } from '@interfaces/props';
import { theme } from '@t1-org/t1components';
import { createTheme } from '@mui/material/styles';
import { Manrope } from 'next/font/google';
import { SessionProvider, signOut, useSession } from 'next-auth/react';
import ReduxProvider from '@components/ReduxProvider';
import LayoutMenuComplete from '@components/LayoutMenu/LayoutMenuComplete';
import { useAppSelector } from '@redux/hooks';
import styles from '@styles/Layout.module.scss';
import { useAppDispatch } from '@store/index';
import { usePathname, useSearchParams } from 'next/navigation';
import { getStore } from '@services/authService';
import { setUserInfoSuccess } from '@redux/reducers/user.reducer';
import { CssBaseline } from '@mui/material';


// Componente interno que usa Redux hooks
function LayoutContent({ children }: { children: React.ReactNode }) {
	const dispatch = useAppDispatch();
	const pathname = usePathname();
	const { data: session, status }: any = useSession();
	const searchParams = useSearchParams();
	const [storeId, setStoreId] = useState<string | null>(null);

	useEffect(() => {
		if (session && session.error) {
			signOut({ callbackUrl: '/' });
		}
	}, [session]);

	useEffect(() => {
		if (storeId !== null) return;

		setTimeout(async () => {
			const store = await getStore();
			setStoreId(searchParams.get('store') || store || '');
		});
	}, [searchParams]); //eslint-disable-line

	useEffect(() => {
		if (status === 'loading' || pathname.includes('signIn') || storeId === null) return;

		console.log('Trying with storeId: ' + storeId);
		if (storeId) {
			dispatch(setUserInfoSuccess({ storeId: storeId }));
			return;
		}
	}, [status, storeId]); //eslint-disable-line

	return (
		<React.Suspense>
			<main>
				{children}
			</main>
		</React.Suspense>
	);
}

export const fontManrope = Manrope({ subsets: ['latin'] });

export const themeCustom = createTheme({
	...theme,
	typography: {
		fontFamily: fontManrope.style.fontFamily
	}
});

export default function Providers({ children }: ProvidersI) {
	return (
		<ReduxProvider>
			<SessionProvider>
				<ThemeProvider theme={themeCustom}>
					<CssBaseline />
					<Suspense fallback={<div>Loading...</div>}>
						<LayoutContent>
							{children}
						</LayoutContent>
					</Suspense>
				</ThemeProvider>
			</SessionProvider>
		</ReduxProvider>
	);
}
