'use server';

import { auth } from "@auth";
import { AuthTokenI } from "@interfaces/props";
import { redirect } from "next/navigation";
import { getStore } from "./authService";
import { FiscalDataResponseI, FiscalDataI, MappedBillingInfoI } from "@interfaces/invoice";

const url = process.env.WALLET_URL;

export const request = async <T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', path: string, body?: Record<string, any> | FormData | null): Promise<T> => {
  const session = await auth() as AuthTokenI;

  if (!session) {
    const signInUrl = `${process.env.AUTH_URL}/api/auth/signIn?callbackUrl=${encodeURIComponent('/')}`;
    redirect(signInUrl);
  }

  const sellerId = await getStore();

  const response = await fetch(url + path, {
    method,
    headers: {
      'Content-Type': body instanceof FormData ? '' : 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'seller_id': sellerId,
    },
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined
  });

  console.log('WALLET URL', url + path);
  if (!response.ok) {
    const error = await response.json();
    console.error(error);
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Helper function to map fiscal data API response to BillingInfo format
const mapFiscalDataToBillingInfo = (fiscalData: FiscalDataI): MappedBillingInfoI => {
  const { tax_information } = fiscalData;
  const address = tax_information.address;

  // Format address string
  const addressParts = [
    address.street,
    `${address.outer_number}${address.inside_number !== 'S/N' ? ` Int. ${address.inside_number}` : ''}`,
    address.suburb,
    address.state,
    `C.P. ${address.zip}`
  ].filter(part => part && part.trim() !== '');

  const formattedAddress = addressParts.join(', ');

  // Map taxpayer type from English to Spanish
  const tipoContribuyenteMap: { [key: string]: string } = {
    'moral': 'Persona Moral',
    'fisica': 'Persona Física'
  };

  return {
    razonSocial: tax_information.business_name || fiscalData.business_name,
    rfc: tax_information.rfc,
    regimenFiscal: tax_information.regimen || 'No especificado',
    tipoContribuyente: tipoContribuyenteMap[tax_information.taxpayer_type] || tax_information.taxpayer_type,
    direccion: formattedAddress
  };
};

export interface GetFiscalDataResponse extends FiscalDataResponseI {
  mappedBillingInfo: MappedBillingInfoI | null;
}

export const getFiscalData = async (sellerId: number): Promise<GetFiscalDataResponse | null> => {
  try {
    const url = `/wallet/invoice/sellers/${sellerId}/fiscal-data`;

    const response = await request<FiscalDataResponseI>('GET', url);

    // Transform the response data to include mapped billing info
    const mappedBillingInfo = response.success && response.data
      ? mapFiscalDataToBillingInfo(response.data)
      : null;

    return {
      ...response,
      mappedBillingInfo
    };
  } catch (error) {
    console.error('Error fetching fiscal data:', error);
    return null;
  }
};

export interface GetFiscalDataState {
  success: boolean;
  data?: GetFiscalDataResponse;
  error?: string;
}

/**
 * Server action to get fiscal data for a seller
 * @param prevState - Previous state from useActionState
 * @param sellerId - The seller ID
 */
export async function getFiscalDataAction(
  prevState: GetFiscalDataState | undefined,
  sellerId: number
): Promise<GetFiscalDataState> {
  try {
    const response = await getFiscalData(sellerId);

    if (!response) {
      return {
        success: false,
        error: 'Failed to fetch fiscal data'
      };
    }

    return {
      success: true,
      data: response
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch fiscal data'
    };
  }
}
