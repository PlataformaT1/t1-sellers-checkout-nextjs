'use server';

import { GetPlanResponse, CreateSubscriptionRequest, CreateSubscriptionResponse, CurrentSubscriptionResponse } from "@interfaces/subscription";

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

export const getCurrentSubscription = async (shopId: number): Promise<CurrentSubscriptionResponse | null> => {
  try {
    const response = await fetch(`${url}/suscriptions/subscriptions/by-shop/${shopId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('CURRENT SUBSCRIPTION URL', `${url}/suscriptions/subscriptions/by-shop/${shopId}`);

    if (!response.ok) {
      // If no subscription found (404), return null instead of throwing
      if (response.status === 404) {
        console.log('No current subscription found for shop:', shopId);
        return null;
      }
      const error = await response.json();
      console.error('Error fetching current subscription:', error);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching current subscription:', error);
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

export const changeSubscriptionAction = async (
  prevState: CreateSubscriptionState | undefined,
  formData: {
    subscriptionId: string;
    newPlanId?: string;
    billingCycle: string;
  }
): Promise<CreateSubscriptionState> => {
  try {
    // Build request body based on what's changing
    const requestBody: {
      new_plan_id?: string;
      new_billing_cycle: string;
    } = {
      new_billing_cycle: formData.billingCycle
    };

    // Only include new_plan_id if it's provided (plan change)
    if (formData.newPlanId) {
      requestBody.new_plan_id = formData.newPlanId;
    }

    console.log('Changing subscription with:', requestBody);

    const response = await fetch(`${url}/suscriptions/subscriptions/${formData.subscriptionId}/change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('SUBSCRIPTION CHANGE URL', `${url}/suscriptions/subscriptions/${formData.subscriptionId}/change`);

    if (!response.ok) {
      const error = await response.json();
      console.error('Error changing subscription:', error);

      // Extract error message from API response structure
      const errorMessage = error?.metaData?.message || error?.message || 'Error al actualizar la suscripción';

      return {
        success: false,
        error: errorMessage
      };
    }

    const result = await response.json();

    return {
      success: true,
      message: result.message || 'Suscripción actualizada exitosamente'
    };
  } catch (error) {
    console.error('Error changing subscription:', error);
    return {
      success: false,
      error: 'Error al actualizar la suscripción. Por favor, intenta nuevamente.'
    };
  }
};

export const updateSubscriptionPaymentMethodAction = async (
  prevState: CreateSubscriptionState | undefined,
  formData: {
    subscriptionId: string;
    paymentId: string;
  }
): Promise<CreateSubscriptionState> => {
  try {
    const requestBody = {
      payment_id: formData.paymentId
    };

    console.log('Updating subscription payment method:', requestBody);

    const response = await fetch(`${url}/suscriptions/subscriptions/${formData.subscriptionId}/payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('SUBSCRIPTION PAYMENT UPDATE URL', `${url}/suscriptions/subscriptions/${formData.subscriptionId}/payment`);

    if (!response.ok) {
      const error = await response.json();
      console.error('Error updating payment method:', error);

      const errorMessage = error?.metaData?.message || error?.message || 'Error al actualizar el método de pago';

      return {
        success: false,
        error: errorMessage
      };
    }

    const result = await response.json();

    return {
      success: true,
      message: result.message || 'Método de pago actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error updating payment method:', error);
    return {
      success: false,
      error: 'Error al actualizar el método de pago. Por favor, intenta nuevamente.'
    };
  }
};
