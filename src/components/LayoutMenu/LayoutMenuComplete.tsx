import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { StoreI } from '@interfaces/user';
import { LayoutMenu, MenuState } from '@t1-org/t1components';
import { getIdentityUser, getUserStores } from '@redux/thunks/user.thunk';
import { setReduceSidebar } from '@redux/reducers/layout.reducer';
import { getUserSessionLightWeightThunk } from '@redux/thunks/userSession.thunk';
import { mockMenuPaths } from '@utils/menupath';


function LayoutMenuComplete({ children }: { children: ReactNode }) {
    const dispatch = useAppDispatch();
    const { data: session, status }: any = useSession();
    const userInfo = useAppSelector(state => state.userReducer.info);
    const getStoresState = useAppSelector(state => state.userReducer.getUserStores.status);
    const stores = useAppSelector(state => state.userReducer.stores);
    const getUserAttributesState = useAppSelector((state) => state.userSessionReducer.getUserAttributes);
    const { updateUserSession, userSessionLightWeight } = useAppSelector(state => state.userSessionReducer);
    const [currentStore, setCurrentStore] = useState<StoreI>();
    const [logoColor, setlogoColor] = useState<string>();
    const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

    const redirectUrl = `${process.env.NEXT_PUBLIC_WORKSPACE_URL}/?service_to_contract=STORE`;

    useEffect(() => {

        if (userSessionLightWeight && userSessionLightWeight.metadata.status == 'success') {
            setlogoColor(userSessionLightWeight.data.logo_color);
            setLogoUrl(userSessionLightWeight.data.logo_url);
        }

    }, [userSessionLightWeight, updateUserSession, getUserAttributesState]);

    useEffect(() => {
        if (userInfo.storeId) {
            dispatch(getUserSessionLightWeightThunk());
            dispatch(getUserStores());
        }
    }, [userInfo.storeId]); //eslint-disable-line

    useEffect(() => {
        if (!userInfo.storeId) return;
        const found = stores.find((item) => item.id == userInfo.storeId);
        if (!found) return;
        setCurrentStore(found as any);
    }, [userInfo.storeId, stores]);


    const logOutHandle = () => signOut({ redirect: true, callbackUrl: "/" });

    const handleChange = async (value: number) => {
        const baseUrl = `${window.location.origin}${window.location.pathname}`;

        window.history.replaceState({}, '', `${baseUrl}?store=${value}`);

        window.location.reload();
    };

    const menuCallbacks: any = useMemo(() => ({
        onMenuStateChange: (state: MenuState) => {
        },
        onToggleOpen: (isOpen: boolean) => {
            console.log('Menu open changed:', isOpen);
        },
        onToggleReduced: (isReduced: boolean) => {
            console.log('Menu reduced changed:', isReduced);
            dispatch(setReduceSidebar(isReduced));
        },
        onMobileStateChange: (isMobile: boolean) => {
            console.log('Mobile state changed:', isMobile);
        }
    }), []);

    const t1SelectorConfig = {
        paymentBaseUrl: `${process.env.NEXT_PUBLIC_PAYMENTS_URL}${userInfo.storeId}`,
        shippingBaseUrl: `${process.env.NEXT_PUBLIC_SHIPPING_URL}?store=${userInfo.storeId}`,
        storeBaseUrl: `${process.env.NEXT_PUBLIC_STORE_URL}?store=${userInfo.storeId}`,
        payment: true,
        store: true,
        shipping: true,
        itemsOrder: ["store", "shipping", "payment"] as ("store" | "payment" | "shipping")[]
    };

    const navbarProps = {
        user: {
            email: session && session.user && session.user.email,
            name: session && session.user && session.user.name
        },
        stores: stores,
        currentStore: currentStore,
        shippingBannerTitle: 'base',
        showBalance: false,
        showSearchInput: false,
        accountUrl: redirectUrl,
        t1SelectorConfig: t1SelectorConfig,
        colorProfile: logoColor,
        iconProfile: logoUrl,
        texts: {
            logout: 'Cerrar sesión',
        },
        onLogout: () => logOutHandle(),
        onStoreChange: handleChange,
    };

    const sidebarProps = {
        shippingBannerTitle: 'cuenta',
        menuPaths: mockMenuPaths,
        showCreateButton: false,
        showBalance: false,
        showInfoBand: false,
        currentUserId: userInfo.storeId?.toString() || '',
        currentStore: currentStore,
        createStoreUrl: redirectUrl,
        restrictedPaths: [],
        onStoreChange: handleChange,
        defaultAutoNavigateToFirstSubPath: true
    };

    return (
        <LayoutMenu
            config={{}}
            navBarProps={navbarProps}
            sideBarProps={sidebarProps}
            menuCallbacks={menuCallbacks}
        >
            {children}
        </LayoutMenu>
    );
}

export default LayoutMenuComplete;