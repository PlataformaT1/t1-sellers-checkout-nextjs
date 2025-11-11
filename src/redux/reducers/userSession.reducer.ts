import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getDevicesThunk,
  revokeUserSessionThunk,
  changeUserPasswordThunk,
  getUserIdentityProvidersThunk,
  sendWhatsappOtpThunk,
  sendEmailOtpThunk,
  checkEmailVerificationStatusThunk,
  sendEmailVerificationThunk,
  getPasswordLastUpdatedThunk,
  getForgottenRedirectThunk,
  getUserSessionLightWeightThunk,
  getUserAttributesThunk,
  getUserAccessThunk
} from '@redux/thunks/userSession.thunk';

interface UserSessionI {
  userSession: any,
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  loading: boolean,
  error: string | null,
  countries: any[]
  getCountries: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  },
  devices: any[],
  getDevices: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  },
  revokeUserSession: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    data: any | null;
  },
  changeUserPassword: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    data: any | null;
  },
  userIdentityProviders: any[]
  getUserIdentityProviders: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  },
  sendWhatsappOtp: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    data: any | null;
  },
  sendEmailOtp: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    data: any | null;
  },
  uploadMedia: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    data: any | null;
  },
  updateLanguageRegion: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    data: any | null;
  },
  updateUserSession: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    data: any | null;
  },
  checkEmailVerificationStatus: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    data: any | null;
  },
  sendEmailVerificationAsync: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    data: any | null;
  },
  getPasswordLastUpdated: {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    data: any | null;
  },
  getForgottenRedirect: {
    status: 'idle' | 'loading' | 'error' | 'succeeded',
    error: string | null
  },
  forgottenRedirect: string;
  getUserSessionLightWeight: {
    status: 'idle' | 'loading' | 'error' | 'succeeded',
    error: string | null
  },
  userSessionLightWeight: any,
  formModified: boolean,
  getUserAttributes: {
    status: 'idle' | 'loading' | 'error' | 'succeeded',
    error: string | null
  },
  userAttributes: any,
  getUserAccess: {
    status: 'idle' | 'loading' | 'error' | 'succeeded',
    error: string | null
  },
  userAccess: any,
  sendUserAccessThunk: {
    status: 'idle' | 'loading' | 'error' | 'succeeded',
    error: string | null
  }
}

const initialState: UserSessionI = {
  userSession: null,
  status: 'idle',
  loading: false,
  error: null,
  countries: [],
  getCountries: {
    status: 'idle',
    error: null
  },
  devices: [],
  getDevices: {
    status: 'idle',
    error: null
  },
  revokeUserSession: {
    status: 'idle',
    error: null,
    data: null
  },
  changeUserPassword: {
    status: 'idle',
    error: null,
    data: null
  },
  userIdentityProviders: [],
  getUserIdentityProviders: {
    status: 'idle',
    error: null
  },
  sendWhatsappOtp: {
    status: 'idle',
    error: null,
    data: null
  },
  sendEmailOtp: {
    status: 'idle',
    error: null,
    data: null
  },
  uploadMedia: {
    status: 'idle',
    error: null,
    data: null
  },
  updateLanguageRegion: {
    status: 'idle',
    error: null,
    data: null
  },
  updateUserSession: {
    status: 'idle',
    error: null,
    data: null
  },
  checkEmailVerificationStatus: {
    status: 'idle',
    error: null,
    data: null
  },
  sendEmailVerificationAsync: {
    status: 'idle',
    error: null,
    data: null
  },
  getPasswordLastUpdated: {
    status: 'idle',
    error: null,
    data: null
  },
  getForgottenRedirect: {
    status: 'idle',
    error: null
  },
  forgottenRedirect: '',
  getUserSessionLightWeight: {
    status: 'idle',
    error: null
  },
  userSessionLightWeight: null,
  formModified: false,
  getUserAttributes: {
    status: 'idle',
    error: null
  },
  userAttributes: null,
  getUserAccess: {
    status: 'idle',
    error: null
  },
  userAccess: null,
  sendUserAccessThunk: {
    status: 'idle',
    error: null
  }
};

export const userSessionSlice = createSlice({
  name: 'userSession',
  initialState: initialState,
  reducers: {
    setUserSession: (state, action: PayloadAction<any>) => {
      state.userSession = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFormModified: (state, action: PayloadAction<boolean>) => {
      state.formModified = action.payload;
    },
    resetUserSession: (state) => {
      state.userSession = null;
      state.status = 'idle';
      state.loading = false;
      state.error = null;
    },
    resetUpdateUserSession: (state) => {
      state.updateUserSession = {
        status: 'idle',
        error: null,
        data: null
      };
    },
    resetUpdateLanguageRegion: (state) => {
      state.updateLanguageRegion = {
        status: 'idle',
        error: null,
        data: null
      };
    }
  },
  extraReducers: (builder) => {
    //GET DEVICES
    builder.addCase(getDevicesThunk.pending, (state) => {
      state.getDevices.status = 'loading';
    });
    builder.addCase(getDevicesThunk.rejected, (state, action) => {
      state.getDevices.status = 'failed';
      state.getDevices.error = action.error.message as string;
    });
    builder.addCase(getDevicesThunk.fulfilled, (state, action) => {
      state.getDevices.status = 'succeeded';
      state.devices = action.payload;
    });
    //REVOKE USER SESSION
    builder.addCase(revokeUserSessionThunk.pending, (state) => {
      state.revokeUserSession.status = 'loading';
    });
    builder.addCase(revokeUserSessionThunk.rejected, (state, action) => {
      state.revokeUserSession.status = 'failed';
      state.revokeUserSession.error = action.error.message as string;
    });
    builder.addCase(revokeUserSessionThunk.fulfilled, (state, action) => {
      state.revokeUserSession.status = 'succeeded';
      const sessionId = action.meta.arg.sessionId;
      state.revokeUserSession.data = action.payload;
      // Optionally, you can remove the session from the devices array
      //state.devices = state.devices.filter((device) => device.id !== sessionId);
    });
    //CHANGE USER PASSWORD
    builder.addCase(changeUserPasswordThunk.pending, (state) => {
      state.changeUserPassword.status = 'loading';
    });
    builder.addCase(changeUserPasswordThunk.rejected, (state, action) => {
      state.changeUserPassword.status = 'failed';
      state.changeUserPassword.error = action.error.message as string;
    });
    builder.addCase(changeUserPasswordThunk.fulfilled, (state, action) => {
      state.changeUserPassword.status = 'succeeded';
      // Handle successful password change if needed
      state.changeUserPassword.data = action.payload;
    });

    //GET USER IDENTITY PROVIDERS
    builder.addCase(getUserIdentityProvidersThunk.pending, (state) => {
      state.getUserIdentityProviders.status = 'loading';
    });
    builder.addCase(getUserIdentityProvidersThunk.rejected, (state, action) => {
      state.getUserIdentityProviders.status = 'failed';
      state.getUserIdentityProviders.error = action.error.message as string;
    });
    builder.addCase(getUserIdentityProvidersThunk.fulfilled, (state, action) => {
      state.getUserIdentityProviders.status = 'succeeded';
      state.userIdentityProviders = action.payload;
    });

    //SEND WHATSAPP OTP
    builder.addCase(sendWhatsappOtpThunk.pending, (state) => {
      state.sendWhatsappOtp.status = 'loading';
    });
    builder.addCase(sendWhatsappOtpThunk.rejected, (state, action) => {
      state.sendWhatsappOtp.status = 'failed';
      state.sendWhatsappOtp.error = action.error.message as string;
    });
    builder.addCase(sendWhatsappOtpThunk.fulfilled, (state, action) => {
      state.sendWhatsappOtp.status = 'succeeded';
      // Handle successful OTP sending if needed
      state.sendWhatsappOtp.data = action.payload;
    });
    //SEND EMAIL OTP
    builder.addCase(sendEmailOtpThunk.pending, (state) => {
      state.sendEmailOtp.status = 'loading';
    });
    builder.addCase(sendEmailOtpThunk.rejected, (state, action) => {
      state.sendEmailOtp.status = 'failed';
      state.sendEmailOtp.error = action.error.message as string;
    });
    builder.addCase(sendEmailOtpThunk.fulfilled, (state, action) => {
      state.sendEmailOtp.status = 'succeeded';
      // Handle successful OTP sending if needed
      state.sendEmailOtp.data = action.payload;
    });
    //CHECK EMAIL VERIFICATION STATUS
    builder.addCase(checkEmailVerificationStatusThunk.pending, (state) => {
      state.checkEmailVerificationStatus.status = 'loading';
    });
    builder.addCase(checkEmailVerificationStatusThunk.rejected, (state, action) => {
      state.checkEmailVerificationStatus.status = 'failed';
      state.checkEmailVerificationStatus.error = action.error.message as string;
    });
    builder.addCase(checkEmailVerificationStatusThunk.fulfilled, (state, action) => {
      state.checkEmailVerificationStatus.status = 'succeeded';
      // Handle successful media upload if needed
      state.checkEmailVerificationStatus.data = action.payload;
    });
    //SEND EMAIL VERIFICATION
    builder.addCase(sendEmailVerificationThunk.pending, (state) => {
      state.sendEmailVerificationAsync.status = 'loading';
    });
    builder.addCase(sendEmailVerificationThunk.rejected, (state, action) => {
      state.sendEmailVerificationAsync.status = 'failed';
      state.sendEmailVerificationAsync.error = action.error.message as string;
    });
    builder.addCase(sendEmailVerificationThunk.fulfilled, (state, action) => {
      state.sendEmailVerificationAsync.status = 'succeeded';
      // Handle successful media upload if needed
      state.sendEmailVerificationAsync.data = action.payload;
    });
    //GET PASSWORD LAST UPDATED
    builder.addCase(getPasswordLastUpdatedThunk.pending, (state) => {
      state.getPasswordLastUpdated.status = 'loading';
    });
    builder.addCase(getPasswordLastUpdatedThunk.rejected, (state, action) => {
      state.getPasswordLastUpdated.status = 'failed';
      state.getPasswordLastUpdated.error = action.error.message as string;
    });
    builder.addCase(getPasswordLastUpdatedThunk.fulfilled, (state, action) => {
      state.getPasswordLastUpdated.status = 'succeeded';
      // Handle successful media upload if needed
      state.getPasswordLastUpdated.data = action.payload;
    });
    // GET FORGOTTEN PASSWORD REDIRECT
    builder.addCase(getForgottenRedirectThunk.pending, (state) => {
      state.getForgottenRedirect.status = 'loading';
    });
    builder.addCase(getForgottenRedirectThunk.rejected, (state, action) => {
      state.getForgottenRedirect.status = 'error';
      if (action.error.message) state.getForgottenRedirect.error = action.error.message;
    });
    builder.addCase(getForgottenRedirectThunk.fulfilled, (state, action) => {
      state.getForgottenRedirect.status = 'succeeded';
      state.forgottenRedirect = action.payload;
    });
    // GET FORGOTTEN PASSWORD REDIRECT
    builder.addCase(getUserSessionLightWeightThunk.pending, (state) => {
      state.getUserSessionLightWeight.status = 'loading';
    });
    builder.addCase(getUserSessionLightWeightThunk.rejected, (state, action) => {
      state.getUserSessionLightWeight.status = 'error';
      if (action.error.message) state.getUserSessionLightWeight.error = action.error.message;
    });
    builder.addCase(getUserSessionLightWeightThunk.fulfilled, (state, action) => {
      state.getUserSessionLightWeight.status = 'succeeded';
      state.userSessionLightWeight = action.payload;
    });
    // GET USER ATTRIBUTES
    builder.addCase(getUserAttributesThunk.pending, (state) => {
      state.getUserAttributes.status = 'loading';
    });
    builder.addCase(getUserAttributesThunk.rejected, (state, action) => {
      state.getUserAttributes.status = 'error';
      if (action.error.message) state.getUserAttributes.error = action.error.message;
    });
    builder.addCase(getUserAttributesThunk.fulfilled, (state, action) => {
      state.getUserAttributes.status = 'succeeded';
      state.userAttributes = action.payload;
    });
    // GET USER ROLE
    builder.addCase(getUserAccessThunk.pending, (state) => {
      state.getUserAccess.status = 'loading';
    });
    builder.addCase(getUserAccessThunk.rejected, (state, action) => {
      state.getUserAccess.status = 'error';
      if (action.error.message) state.getUserAccess.error = action.error.message;
    });
    builder.addCase(getUserAccessThunk.fulfilled, (state, action) => {
      state.getUserAccess.status = 'succeeded';
      state.userAccess = action.payload;
    });
  }
});

export const {
  setUserSession,
  setLoading,
  setError,
  resetUserSession,
  resetUpdateUserSession,
  resetUpdateLanguageRegion,
  setFormModified
} = userSessionSlice.actions;
export default userSessionSlice.reducer;