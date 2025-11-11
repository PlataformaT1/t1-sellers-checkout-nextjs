import { ResponseIdentityI } from '@interfaces/api';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getUserSessions,
  revokeUserSession,
  changeUserPassword,
  getUserIdentityProviders,
  sendWhatsappOtp,
  sendEmailOtp,
  checkEmailVerificationStatus,
  sendEmailVerification,
  getPasswordLastUpdated,
  getForgottenRedirect,
  getUserAttributes
} from '@services/authService';
import { getUserAccess, request } from "@services/identityService";

/* export const getUserSessionThunk = createAsyncThunk(
  'user/getUserSession',
  async (params: { storeId: number }) : Promise<any> => {
    const { storeId } = params;

    try {
      const response : any = await getUserLogued(Number(storeId));
      console.log('response en thunk', response);
      return response;
    } catch (error) {
      console.error('Error fetching user session:', error);
      throw new Error(`Failed to fetch user session for store ${storeId}: ${error}`);
    }
    
  }
); */

export const getUserSessionLightWeightThunk = createAsyncThunk(
  'user/getUserSessionLightWeight',
  async (): Promise<any> => {
    try {
      const response = await request('GET', `/users_mini`) as ResponseIdentityI<any>;
      return response;
    } catch (error) {
      console.error('Error fetching user session:', error);
      throw new Error(`Failed to fetch user session: ${error}`);
    }

  }
);

/* export const updateUserSessionThunk = createAsyncThunk(
  'user/updateUserSession',
  async (params: { storeId: number, data: any }) : Promise<any> => {
    const { storeId, data } = params;

    try {
      const response : any = await updateUserLogued(Number(storeId), data);
      return response;
    } catch (error) {
      throw new Error(`Failed to update user session for store ${storeId}: ${error}`);
    }
  }
); */

export const getDevicesThunk = createAsyncThunk(
  'user/getDevices',
  async (): Promise<any> => {
    try {
      const response: any = await getUserSessions();
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch devices: ${error}`);
    }
  }
);

export const revokeUserSessionThunk = createAsyncThunk(
  'user/revokeUserSession',
  async (params: { sessionId: string }): Promise<any> => {
    const { sessionId } = params;

    try {
      const response: any = await revokeUserSession(sessionId);
      return response;
    } catch (error) {
      throw new Error(`Failed to revoke user session for session ${sessionId}: ${error}`);
    }
  }
);

export const changeUserPasswordThunk = createAsyncThunk(
  'user/changeUserPassword',
  async (params: { currentPassword: string, newPassword: string }): Promise<any> => {
    const { currentPassword, newPassword } = params;

    try {
      const response: any = await changeUserPassword(currentPassword, newPassword);

      return response;
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

export const getUserIdentityProvidersThunk = createAsyncThunk(
  'user/getUserIdentityProviders',
  async (): Promise<any> => {
    try {
      const response: any = await getUserIdentityProviders();
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch user identity providers: ${error}`);
    }
  }
);

export const sendWhatsappOtpThunk = createAsyncThunk(
  'user/sendWhatsappOtp',
  async (): Promise<any> => {
    try {
      const response: any = await sendWhatsappOtp();
      return response;
    } catch (error) {
      throw new Error(`Failed to send WhatsApp OTP: ${error}`);
    }
  }
);

export const sendEmailOtpThunk = createAsyncThunk(
  'user/sendEmailOtp',
  async (): Promise<any> => {
    try {
      const response: any = await sendEmailOtp();
      return response;
    } catch (error) {
      throw new Error(`Failed to send Email OTP: ${error}`);
    }
  }
);

export const checkEmailVerificationStatusThunk = createAsyncThunk(
  'user/checkEmailVerificationStatus',
  async (): Promise<any> => {
    try {
      const response: any = await checkEmailVerificationStatus();
      return response;
    } catch (error) {
      throw new Error(`Failed to check email verification status: ${error}`);
    }
  }
);

export const sendEmailVerificationThunk = createAsyncThunk(
  'user/sendEmailVerification',
  async (): Promise<any> => {
    try {
      const response: any = await sendEmailVerification();
      return response;
    } catch (error) {
      throw new Error(`Failed to send email verification: ${error}`);
    }
  }
);

export const getPasswordLastUpdatedThunk = createAsyncThunk(
  'user/getPasswordLastUpdated',
  async (): Promise<any> => {
    try {
      const response: any = await getPasswordLastUpdated();
      return response;
    } catch (error) {
      throw new Error(`Failed to get password last updated: ${error}`);
    }
  }
);

export const getForgottenRedirectThunk = createAsyncThunk('store/getForgottenRedirectThunk', async () => {
  const response = await getForgottenRedirect();
  return response;
});

export const getUserAttributesThunk = createAsyncThunk(
  'user/getUserAttributesThunk',
  async (): Promise<any> => {
    const response: any = await getUserAttributes();
    return response;
  }
);

export const getUserAccessThunk = createAsyncThunk(
  'user/getUserRole',
  async (params: { storeId: number }): Promise<any> => {
    try {
      const response = await getUserAccess(params.storeId) as ResponseIdentityI<any>;
      return response;
    } catch (error) {
      console.error('Error fetching user session:', error);
      throw new Error(`Failed to fetch user session: ${error}`);
    }

  }
);