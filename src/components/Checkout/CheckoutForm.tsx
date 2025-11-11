'use client'

import React, { startTransition, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import PricingSummary from './PricingSummary';
import PaymentMethodForm from './PaymentMethodForm';
import { CheckoutFormData, CheckoutFormProps, PlanData } from '@/interfaces/checkout';

export default function CheckoutForm({ searchParams }: CheckoutFormProps) {
  // Get plan data from search params or use defaults
  const getPlanData = (): PlanData => {
    if (!searchParams) {
      return {
        name: 'Plan Intermedio',
        price: 458.85,
        subtotal: 399.00,
        tax: 59.85,
        total: 458.85,
        currency: 'MXN',
        period: 'Mes'
      };
    }

    return {
      name: searchParams.planName || 'Plan Intermedio',
      price: searchParams.price ? Number(searchParams.price) : 458.85,
      subtotal: searchParams.subtotal ? Number(searchParams.subtotal) : 399.00,
      tax: searchParams.tax ? Number(searchParams.tax) : 59.85,
      total: searchParams.total ? Number(searchParams.total) : 458.85,
      currency: searchParams.currency || 'MXN',
      period: searchParams.period || 'Mes'
    };
  };

  const planData = getPlanData();

  const { handleSubmit, control, formState: { errors, isValid } } = useForm<CheckoutFormData>({
    defaultValues: {
      cardNumber: '',
      expirationDate: '',
      cvv: '',
      fullName: '',
      addBillingInfo: false
    },
    mode: 'onChange'
  });

  // TODO: Replace with actual server action
  const mockCheckoutAction = async (data: CheckoutFormData) => {
    console.log('Checkout data:', data);
    return { success: true };
  };

  const [checkoutState, checkoutFormAction, checkoutPending] = useActionState(
    mockCheckoutAction,
    undefined
  );

  const submit = (data: CheckoutFormData) => {
    console.log('Form submitted:', data);
    startTransition(() => checkoutFormAction(data));
  };

  return (
    <div className="bg-white w-full min-h-screen flex items-start justify-center py-[58px] px-4">
      <form
        onSubmit={handleSubmit(submit)}
        className="flex flex-col lg:flex-row gap-[100px] lg:gap-[80px] w-full max-w-[1290px]"
      >
        {/* Left Panel - Pricing Summary */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <PricingSummary planData={planData} />
        </div>

        {/* Right Panel - Payment Form */}
        <div className="flex-1 flex justify-center lg:justify-start">
          <div className="bg-white rounded-[10px] shadow-[0px_0px_5px_1px_rgba(0,0,0,0.1)] p-[39px_79px] flex items-center justify-center">
            <PaymentMethodForm
              control={control}
              errors={errors}
              isValid={isValid}
              isPending={checkoutPending}
              onSubmit={handleSubmit(submit)}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
