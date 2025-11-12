'use server';

import { auth } from "@auth";
import { AuthTokenI } from "@interfaces/props";
import {
  PaymentMethodsResponse,
  AddPaymentCardFormData,
  CreateCardState,
  GetPaymentCardsState,
  SetDefaultCardState,
  DeleteCardState,
  CardByBinResponse,
  PaymentMethodActionState
} from "@interfaces/paymentMethods";
import * as fernet from 'fernet';

const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL;
const encryptionKey = 'zSeIgcLFjk_aFdnmG0XcpdAy4LlMoetQifSANrFj_l0='; // TODO: Move to env variable

/**
 * Internal request function for payment service API calls
 */
const request = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  path: string,
  body?: Record<string, any> | null
): Promise<T> => {
  const session = await auth() as AuthTokenI;

  if (!session) {
    throw new Error('No session found.');
  }

  const response = await fetch(paymentServiceUrl + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  // Special handling for card creation errors
  if (!response.ok) {
    const error = await response.json();
    console.error('Payment service error:', error);

    if (path.includes('/t1-store-global-invoice/card')) {
      return error as T;
    }

    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Encrypts JSON data using Fernet encryption
 */
function encryptJson(jsonData: Object, key: string): string | null {
  try {
    const secret = new fernet.Secret(key);
    const token = new fernet.Token({
      secret,
      time: Date.now(),
    });

    const jsonString = JSON.stringify(jsonData);
    const encrypted = token.encode(jsonString);
    return encrypted;
  } catch (error) {
    console.error(`Error encrypting data: ${error}`);
    return null;
  }
}

/**
 * Direct function to get payment cards (for server-side fetching)
 * @param paymentId - The payment ID from user's service data
 */
export async function getPaymentCards(paymentId: string): Promise<PaymentMethodsResponse> {
  return await request<PaymentMethodsResponse>(
    'GET',
    `/t1-store-global-invoice/cards/${paymentId}`
  );
}

/**
 * Server action to get all payment cards for a user
 * @param prevState - Previous state from useActionState
 * @param paymentId - The payment ID from user's service data
 */
export async function getPaymentCardsAction(
  prevState: GetPaymentCardsState | undefined,
  paymentId: string
): Promise<GetPaymentCardsState> {
  try {
    const response = await getPaymentCards(paymentId);

    return {
      success: true,
      data: response
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch payment cards'
    };
  }
}

/**
 * Server action to create a new payment card
 * @param prevState - Previous state from useActionState
 * @param formData - Form data including card details and user info
 */
export async function createPaymentCardAction(
  prevState: CreateCardState | undefined,
  formData: {
    cardData: AddPaymentCardFormData;
    t1PaymentId: string;
    sellerId: number;
    email: string;
    storeName: string;
    phone: string;
  }
): Promise<CreateCardState> {
  try {
    const { cardData, t1PaymentId, sellerId, email, storeName, phone } = formData;

    // Handle both MM/YY and MMYY formats
    let month, year;
    if (cardData.deadline.includes('/')) {
      [month, year] = cardData.deadline.split('/');
    } else {
      // Handle MMYY format (4 digits without slash)
      month = cardData.deadline.slice(0, 2);
      year = cardData.deadline.slice(2);
    }

    // Prepare data for encryption
    const dataForEncrypt = {
      service: "store",
      creado_por: email,
      seller: {
        id: sellerId,
        nombre: storeName,
      },
      tarjeta_info: {
        nombre: cardData.name,
        pan: cardData.cardNumber,
        cvv2: cardData.cvv,
        expiracion_mes: Number(month),
        expiracion_anio: Number(year),
        direccion: {
          linea1: cardData.address,
          cp: cardData.zip,
          telefono: {
            numero: phone,
          },
          municipio: cardData.city,
          ciudad: cardData.city,
          estado: cardData.state,
          pais: cardData.country,
        },
        cliente_id: t1PaymentId,
        default: false,
        cargo_unico: false,
        type: cardData.type,
      },
    };

    const encryptedData = encryptJson(dataForEncrypt, encryptionKey);

    if (!encryptedData) {
      return {
        success: false,
        error: 'Failed to encrypt card data',
        message: 'Error al cifrar los datos de la tarjeta'
      };
    }

    // Create card
    const response: any = await request(
      'POST',
      '/t1-store-global-invoice/card',
      {
        encrypted_data: encryptedData,
        created_by: email,
        type: cardData.type
      }
    );

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to create card',
        message: response.message || 'Ha ocurrido un error inesperado, intenta con otro método de pago.',
        cvv_err: response.cvv_err || false
      };
    }

    // If secondary/backup flag is set, make additional request
    if (cardData.secondary && response.data?.seller_id && response.data?.id) {
      await request(
        'PUT',
        `/t1-store-global-invoice/cards/seller/${response.data.seller_id}/card/${response.data.id}/backup`,
        {
          backup: true,
          updated_by: email
        }
      );
    }

    return {
      success: true,
      message: 'Tarjeta agregada exitosamente',
      cardId: response.data?.id
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create payment card',
      message: 'Ha ocurrido un error inesperado, intenta con otro método de pago.'
    };
  }
}

/**
 * Server action to set a card as the default payment method
 * @param prevState - Previous state from useActionState
 * @param params - Card ID, seller ID, and email
 */
export async function setDefaultPaymentMethodAction(
  prevState: SetDefaultCardState | undefined,
  params: {
    cardId: string;
    sellerId: number;
    email: string;
  }
): Promise<SetDefaultCardState> {
  try {
    const response = await request(
      'PUT',
      `/t1-store-global-invoice/cards/seller/${params.sellerId}/card/${params.cardId}/default`,
      {
        updated_by: params.email
      }
    );

    return {
      success: true,
      cardId: params.cardId
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to set default payment method',
      cardId: params.cardId
    };
  }
}

/**
 * Server action to set a card as backup payment method
 * @param prevState - Previous state from useActionState
 * @param params - Card ID, seller ID, email, and backup flag
 */
export async function setBackupPaymentMethodAction(
  prevState: PaymentMethodActionState | undefined,
  params: {
    cardId: string;
    sellerId: number;
    email: string;
    backup: boolean;
  }
): Promise<PaymentMethodActionState> {
  try {
    const response = await request(
      'PUT',
      `/t1-store-global-invoice/cards/seller/${params.sellerId}/card/${params.cardId}/backup`,
      {
        backup: params.backup,
        updated_by: params.email
      }
    );

    return {
      success: true,
      message: params.backup ? 'Tarjeta configurada como respaldo' : 'Tarjeta removida como respaldo'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to set backup payment method'
    };
  }
}

/**
 * Server action to delete a payment card
 * @param prevState - Previous state from useActionState
 * @param cardId - The card ID to delete
 */
export async function deletePaymentMethodAction(
  prevState: DeleteCardState | undefined,
  cardId: string
): Promise<DeleteCardState> {
  try {
    await request(
      'DELETE',
      `/t1-store-global-invoice/card/${cardId}`
    );

    return {
      success: true,
      message: 'Tarjeta eliminada con éxito'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete payment card',
      message: 'Error al eliminar la tarjeta'
    };
  }
}

/**
 * Server action to verify card type by BIN (Bank Identification Number)
 * @param prevState - Previous state from useActionState
 * @param bin - First 6-8 digits of the card number
 */
export async function verifyCardByBinAction(
  prevState: PaymentMethodActionState | undefined,
  bin: string
): Promise<PaymentMethodActionState> {
  try {
    const response = await request<CardByBinResponse>(
      'GET',
      `/t1-store-global-invoice/bin/verify?bin=${bin}`
    );

    return {
      success: response.success,
      data: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to verify card',
      data: null
    };
  }
}

/**
 * Server action to edit an existing payment card
 * @param prevState - Previous state from useActionState
 * @param formData - Updated card data
 */
export async function editPaymentCardAction(
  prevState: PaymentMethodActionState | undefined,
  formData: {
    cardId: string;
    cardData: Partial<AddPaymentCardFormData>;
    email: string;
  }
): Promise<PaymentMethodActionState> {
  try {
    const { cardId, cardData, email } = formData;
    let month, year;

    if (cardData.deadline) {
      [month, year] = cardData.deadline.split('/');
    }

    const updateData: any = {
      updated_by: email
    };

    if (cardData.name) updateData.nombre = cardData.name;
    if (month) updateData.expiracion_mes = Number(month);
    if (year) updateData.expiracion_anio = Number(`20${year}`);
    if (cardData.address || cardData.zip || cardData.city || cardData.state) {
      updateData.direccion = {
        ...(cardData.address && { linea1: cardData.address }),
        ...(cardData.zip && { cp: cardData.zip }),
        ...(cardData.city && { ciudad: cardData.city }),
        ...(cardData.state && { estado: cardData.state }),
        pais: cardData.country || "MEX"
      };
    }

    await request(
      'PUT',
      `/t1-store-global-invoice/card/${cardId}`,
      updateData
    );

    return {
      success: true,
      message: 'Tarjeta actualizada exitosamente'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to edit payment card',
      message: 'Error al actualizar la tarjeta'
    };
  }
}
