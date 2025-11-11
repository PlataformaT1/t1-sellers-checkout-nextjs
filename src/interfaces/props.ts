import { Session } from "next-auth";
import { ReactNode } from "react";

export interface AuthTokenI extends Session {
    user: {
        id: string;
        sub: string;
        sid: string;
        name: string;
        email: string;
        error?: string;
        phone?: string;
    }
    access_token: string;
    expires: string;
    id_token: string;
    refresh_token: string;
    jti: string;
    error: string | null;
    permissions?: any;
}

export interface ProvidersI {
    children: ReactNode
}