import { ResponseIdentityI } from '@interfaces/api';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { logout } from '@services/authService';
import { request } from '@services/identityService';

export const getUserStores = createAsyncThunk('user/getUserStores', async (): Promise<ResponseIdentityI<any>> => {
	const response = await request('GET', `/stores/users`) as ResponseIdentityI<any>;
	return response;
});

export const getIdentityUser = createAsyncThunk('user/getIdentityUser', async (): Promise<ResponseIdentityI<any>> => {
	const response = await request('GET', `/stores/users`) as ResponseIdentityI<any>;
	return response;
});

export const logoutThunk = createAsyncThunk('user/logout', async (params: { avoidKeycloakLogout: boolean }): Promise<any> => {
	const response = await logout(params.avoidKeycloakLogout);
	return response;
});