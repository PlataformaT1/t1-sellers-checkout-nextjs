'use server';

import { auth } from "@auth";
import { AuthTokenI } from "@interfaces/props";
import { redirect } from "next/navigation";
import { getUserAccessCached } from "./userAccessService";

const url = process.env.IDENTITY_URL;

export const request = async <T>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET', path: string, body?: Record<string, any> | FormData | null): Promise<T> => {
    const session = await auth() as AuthTokenI;
    
    if (!session) {
        const signInUrl = `${process.env.AUTH_URL}/api/auth/signIn?callbackUrl=${encodeURIComponent('/')}`;
        
        redirect(signInUrl);
    }

    const response = await fetch(url + path, {
        method,
        headers: {
            'Content-Type': body instanceof FormData ? '' : 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        },
        body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined
    });
    
    console.log('IDENTITY URL', url + path);
    if (!response.ok) {
        const error = await response.json();
        console.error(error);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
};

export const getUserAccess = async <T>(store: number): Promise<T> => {
    const session = await auth() as AuthTokenI;
    const email = session?.user?.email;

    if (!session) {
        const signInUrl = `${process.env.AUTH_URL}/api/auth/signIn?callbackUrl=${encodeURIComponent('/')}`;
        
        redirect(signInUrl);
    }
    const response = await getUserAccessCached(session.access_token, `${store}`, email);

    return response;
};

export interface CreateStoreData {
    store_name: string;
    email: string;
    phone_number?: string;
    origin: 'store' | 'shipping' | 'payments';
    country?: string;
}

export interface CreateStoreResponse {
    data: {
        inserted_id: string;
    };
    metadata: {
        status: string;
        message?: string;
    };
}

export interface StoreVerificationResponse {
    data: {
        id: number;
        services: Record<string, any>;
        url: string;
    };
    metadata: {
        status: string;
        message?: string;
    };
}

export const createStore = async (storeData: CreateStoreData): Promise<CreateStoreResponse> => {
    return request<CreateStoreResponse>('POST', '/stores', storeData);
};

export const verifyStore = async (storeId: number): Promise<StoreVerificationResponse> => {
    return request<StoreVerificationResponse>('GET', `/stores/${storeId}`);
};

export interface ServiceData {
    id_seller: number;
    store_name: string;
    services: {
        payments: {
            payment_id: string;
        };
    };
}

export interface GetServiceResponse {
    data: ServiceData;
    metadata: {
        status: string;
        message?: string;
    };
}

export const getStoreData = async (storeId: number): Promise<GetServiceResponse> => {
    return request<GetServiceResponse>('GET', `stores/${storeId}`);
};
