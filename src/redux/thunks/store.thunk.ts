import { createAsyncThunk } from '@reduxjs/toolkit';
import { createStore, CreateStoreData, CreateStoreResponse, verifyStore, StoreVerificationResponse } from '@services/identityService';

export interface CreateStoreWithHubSpotParams {
  storeName: string;
  serviceType: 'store' | 'shipping' | 'payments';
  userData: {
    email: string;
    phone?: string;
    country?: string;
  };
}

export interface CreateStoreResult {
  storeId: string;
  serviceType: 'store' | 'shipping' | 'payments';
}

export interface VerifyStoreResult {
  id: number;
  services: Record<string, any>;
  url: string;
}

// Clean store creation thunk - only handles store creation
export const createStoreThunk = createAsyncThunk<
  CreateStoreResult,
  CreateStoreWithHubSpotParams,
  { rejectValue: string }
>(
  'store/create',
  async ({ storeName, serviceType, userData }, { rejectWithValue }) => {
    try {
      if (!userData?.email) {
        return rejectWithValue('User data not provided');
      }

      // Prepare store data
      const storeData: CreateStoreData = {
        store_name: storeName,
        email: userData.email,
        phone_number: userData.phone,
        origin: serviceType,
        country: userData.country || 'MX'
      };

      console.log('Creating store with data:', storeData);

      // Create store via identity service
      const response = await createStore(storeData);

      if (response.metadata.status !== 'success') {
        return rejectWithValue(response.metadata.message || 'Failed to create store');
      }

      const storeId = response.data.inserted_id;
      console.log('Store created successfully with ID:', storeId);

      return {
        storeId,
        serviceType
      };

    } catch (error) {
      console.error('Error in createStoreThunk:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }
);

// Store verification thunk - handles store verification
export const verifyStoreThunk = createAsyncThunk<
  VerifyStoreResult,
  { storeId: number },
  { rejectValue: string }
>(
  'store/verify',
  async ({ storeId }, { rejectWithValue }) => {
    try {
      console.log('Verifying store with ID:', storeId);

      // Verify store via identity service
      const response = await verifyStore(storeId);

      if (response.metadata.status !== 'success') {
        return rejectWithValue(response.metadata.message || 'Failed to verify store');
      }

      console.log('Store verified successfully:', response.data);

      return response.data;

    } catch (error) {
      console.error('Error in verifyStoreThunk:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Store verification failed'
      );
    }
  }
);
