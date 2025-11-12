'use server';

import { GetPlanResponse, CreateSubscriptionRequest, CreateSubscriptionResponse } from "@interfaces/subscription";

const url = process.env.SUBSCRIPTION_URL;

export const getPlanById = async (planId: string): Promise<GetPlanResponse | null> => {
  try {
    const response = await fetch(`${url}/suscriptions/plans/${planId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('SUBSCRIPTION URL', `${url}/suscriptions/plans/${planId}`);

    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching plan:', error);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching plan data:', error);
    return null;
  }
};

export interface CreateSubscriptionState {
  success: boolean;
  error?: string;
  message?: string;
}

export const createSubscriptionAction = async (
  prevState: CreateSubscriptionState | undefined,
  formData: {
    userId: number;
    shopId: number;
    planId: string;
    customerId: string;
    paymentId: string;
    planName: string;
    billingCycle: string;
    currency: string;
  }
): Promise<CreateSubscriptionState> => {
  try {
    const requestBody: CreateSubscriptionRequest = {
      user_id: null,
      seller_id: formData.userId,
      shop_id: formData.shopId,
      service_type: "store",
      plan_id: formData.planId,
      customer_id: formData.customerId,
      payment_id: formData.paymentId,
      payment_method: "tarjeta",
      billing_cycle: formData.billingCycle,
      country_code: "MX",
      currency: formData.currency,
      metadata: {
        source: "web"
      }
    };

    console.log('Creating subscription with:', requestBody);

    const response = await fetch(`${url}/suscriptions/subscribe-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('SUBSCRIPTION CREATE URL', `${url}/suscriptions/subscribe-simple`);

    if (!response.ok) {
      const error = await response.json();
      console.error('Error creating subscription:', error);

      // Extract error message from API response structure
      // Check metaData.message first, then fall back to generic message
      const errorMessage = error?.metaData?.message || error?.message || 'Error al crear la suscripción';

      return {
        success: false,
        error: errorMessage
      };
    }

    const result: CreateSubscriptionResponse = await response.json();

    return {
      success: true,
      message: result.message || 'Suscripción creada exitosamente'
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    // For network errors or unexpected errors, use generic message
    return {
      success: false,
      error: 'Error al crear la suscripción. Por favor, intenta nuevamente.'
    };
  }
};
