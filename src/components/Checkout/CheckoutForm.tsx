'use client'

import React, { startTransition, useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PricingSummary from './PricingSummary';
import SavedPaymentMethodForm from './SavedPaymentMethodForm';
import ErrorDialog from './ErrorDialog';
import { CheckoutFormData, CheckoutFormProps, PlanData, SavedCard } from '@interfaces/checkout';
import { createPaymentCardAction } from '@services/paymentMethodsService';
import { createSubscriptionAction } from '@services/subscriptionService';
import { PaymentMethod } from '@interfaces/paymentMethods';
import { saveFiscalDataAction } from '@services/fiscalDataService';

export default function CheckoutForm({
  searchParams,
  serviceData,
  paymentCards,
  fiscalData,
  planData: fetchedPlanData,
  userId,
  redirectUrl,
  userEmail = '',
  userPhone = ''
}: CheckoutFormProps) {
  // Get plan data from fetched plan data
  const getPlanData = (): PlanData => {
    // Plan data should always be provided by the page after validation
    if (fetchedPlanData) {
      return {
        name: fetchedPlanData.name,
        price: fetchedPlanData.price,
        subtotal: fetchedPlanData.subtotal,
        tax: fetchedPlanData.tax,
        total: fetchedPlanData.total,
        currency: fetchedPlanData.currency,
        period: fetchedPlanData.period
      };
    }

    // This should never happen as the page validates params first
    // But provide a fallback just in case
    return {
      name: 'Plan',
      price: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
      currency: 'MXN',
      period: 'Mes'
    };
  };

  const planData = getPlanData();

  // Extract service info from props
  const sellerId = serviceData?.id_seller || 0;
  const paymentId = serviceData?.services?.payments?.payment_id || '';
  const storeName = serviceData?.store_name || '';

  // State to track if we need to subscribe after card creation
  const [pendingSubscription, setPendingSubscription] = useState(false);
  const [newCardId, setNewCardId] = useState<string>('');

  // State to track pending operations after fiscal data save
  const [pendingAfterFiscalSave, setPendingAfterFiscalSave] = useState<{
    type: 'subscription' | 'card-then-subscription' | null;
    data: CheckoutFormData | null;
  }>({ type: null, data: null });

  // Error dialog state
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Action state for card creation
  const [createCardState, createCardAction, createCardPending] = useActionState(createPaymentCardAction, undefined);

  // Action state for subscription
  const [subscriptionState, subscriptionAction, subscriptionPending] = useActionState(
    createSubscriptionAction,
    undefined
  );

  // Action state for fiscal data save
  const [saveFiscalDataState, dispatchSaveFiscalData, saveFiscalDataPending] = useActionState(
    saveFiscalDataAction,
    undefined
  );

  // Find the default card for initial value (skip if expired)
  const getDefaultCardId = () => {
    if (!paymentCards) return '';

    const defaultCard = paymentCards.find(card => card.default);
    if (!defaultCard) return '';

    // Check if default card is expired
    const expiryYear = defaultCard.expiration_year;
    const expiryMonth = parseInt(defaultCard.expiration_month);
    const expiryDate = new Date(expiryYear, expiryMonth, 0, 23, 59, 59, 999);
    const isExpired = expiryDate < new Date();

    // Don't auto-select if expired
    return isExpired ? '' : defaultCard.id;
  };

  const { handleSubmit, control, formState: { errors, isValid } } = useForm<CheckoutFormData>({
    defaultValues: {
      cardNumber: '',
      expirationDate: '',
      cvv: '',
      fullName: '',
      addBillingInfo: false,
      savedCardId: getDefaultCardId()
    },
    mode: 'onChange'
  });

  // Helper function to convert PaymentMethod to SavedCard
  const convertToSavedCard = (method: PaymentMethod): SavedCard => {
    const now = new Date();
    const expiryYear = method.expiration_year;
    const expiryMonth = parseInt(method.expiration_month);

    // Set expiry date to the last moment of the expiration month
    // Using day 0 of next month gives us the last day of the current month
    const expiryDate = new Date(expiryYear, expiryMonth, 0, 23, 59, 59, 999);

    return {
      id: method.id,
      brand: method.brand as 'visa' | 'mastercard' | 'amex',
      last4: method.termination,
      expirationDate: `${method.expiration_month}/${method.expiration_year.toString().slice(2)}`,
      isExpired: expiryDate < now
    };
  };

  // Convert payment cards from props to SavedCard format
  const savedCards: SavedCard[] = paymentCards
    ? paymentCards.map(convertToSavedCard)
    : [];

  // Handle successful card creation - then create subscription
  useEffect(() => {
    if (createCardState?.success && pendingSubscription) {
      console.log('Card created successfully! Creating subscription...');

      // Get the new card ID from the created card
      const createdCardId = createCardState.cardId || newCardId;

      if (createdCardId && userId && fetchedPlanData) {
        // Create subscription with the new card
        startTransition(() => {
          subscriptionAction({
            userId: userId,
            shopId: sellerId,
            planId: fetchedPlanData.id,
            customerId: paymentId,
            paymentId: createdCardId,
            planName: fetchedPlanData.name,
            billingCycle: fetchedPlanData.cycle,
            currency: fetchedPlanData.currency
          });
        });

        setPendingSubscription(false);
      }
    } else if (createCardState && !createCardState.success) {
      console.error('Failed to create card:', createCardState.error);
      setPendingSubscription(false);
      // Show error dialog
      setErrorMessage(createCardState.error || 'Error al crear la tarjeta. Por favor, intenta nuevamente.');
      setErrorDialogOpen(true);
    }
  }, [createCardState, pendingSubscription, userId, fetchedPlanData, paymentId, searchParams, newCardId]);

  // Handle subscription success - redirect
  useEffect(() => {
    if (subscriptionState?.success) {
      console.log('Subscription created successfully! Redirecting...');
      // Redirect to the success URL
      window.location.href = redirectUrl;
    } else if (subscriptionState && !subscriptionState.success) {
      console.error('Failed to create subscription:', subscriptionState.error);
      // Show error dialog
      setErrorMessage(subscriptionState.error || 'Error al crear la suscripción. Por favor, intenta nuevamente.');
      setErrorDialogOpen(true);
    }
  }, [subscriptionState, redirectUrl]);

  // Handle fiscal data save success - proceed with subscription/card creation
  useEffect(() => {
    if (saveFiscalDataState?.success && pendingAfterFiscalSave.type && pendingAfterFiscalSave.data) {
      console.log('Fiscal data saved successfully! Proceeding with', pendingAfterFiscalSave.type);

      const data = pendingAfterFiscalSave.data;

      if (pendingAfterFiscalSave.type === 'subscription' && data.savedCardId) {
        // Create subscription with saved card
        startTransition(() => {
          subscriptionAction({
            userId: userId!,
            shopId: sellerId,
            planId: fetchedPlanData!.id,
            customerId: paymentId,
            paymentId: data.savedCardId!,
            planName: fetchedPlanData!.name,
            billingCycle: fetchedPlanData!.cycle,
            currency: fetchedPlanData!.currency
          });
        });
      } else if (pendingAfterFiscalSave.type === 'card-then-subscription' &&
                 data.cardNumber && data.expirationDate && data.cvv && data.fullName) {
        // Create new card first, then subscription
        setPendingSubscription(true);

        startTransition(() => {
          createCardAction({
            cardData: {
              name: data.fullName!,
              cardNumber: data.cardNumber!,
              deadline: data.expirationDate!,
              cvv: data.cvv!,
              country: 'MEX',
              address: '',
              neighborhood: '',
              zip: data.postalCode || '',
              phone: userPhone,
              city: '',
              state: '',
              type: 'credit_card',
              secondary: false
            },
            t1PaymentId: paymentId,
            sellerId: sellerId,
            email: userEmail,
            storeName: storeName,
            phone: userPhone
          });
        });
      }

      // Reset pending state
      setPendingAfterFiscalSave({ type: null, data: null });
    } else if (saveFiscalDataState && !saveFiscalDataState.success) {
      console.error('Failed to save fiscal data:', saveFiscalDataState.error);
      // Show error dialog
      setErrorMessage(saveFiscalDataState.error || 'Error al guardar la información fiscal. Por favor, intenta nuevamente.');
      setErrorDialogOpen(true);
      // Reset pending state
      setPendingAfterFiscalSave({ type: null, data: null });
    }
  }, [saveFiscalDataState, pendingAfterFiscalSave, userId, fetchedPlanData, paymentId, searchParams, sellerId, userEmail, storeName, userPhone]);

  const submit = (data: CheckoutFormData) => {
    console.log('Form submitted:', data);

    // Validate required data
    if (!userId || !fetchedPlanData) {
      console.error('Missing required data for subscription');
      return;
    }

    // Check if user checked the "Añadir datos de facturación" checkbox
    // Only save fiscal data if checkbox is checked AND user doesn't already have it
    const needToSaveFiscalData = data.addBillingInfo === true &&
                                  !fiscalData?.mappedBillingInfo;

    // If checkbox is checked, save fiscal data first
    if (needToSaveFiscalData) {
      console.log('Saving fiscal data first...');

      // Determine what to do after fiscal data is saved
      const nextAction: 'subscription' | 'card-then-subscription' =
        data.savedCardId ? 'subscription' : 'card-then-subscription';

      setPendingAfterFiscalSave({ type: nextAction, data });

      startTransition(() => {
        dispatchSaveFiscalData({
          storeId: sellerId,
          data: {
            taxpayer_type: data.taxRegime as 'fisica' | 'moral',
            rfc: data.rfc!,
            business_name: data.billingName!,
            address: {
              zip: data.postalCode!
            }
          }
        });
      });
      return;
    }

    // If using saved card, create subscription immediately
    if (data.savedCardId) {
      startTransition(() => {
        subscriptionAction({
          userId: userId,
          shopId: sellerId,
          planId: fetchedPlanData.id,
          customerId: paymentId,
          paymentId: data.savedCardId!,
          planName: fetchedPlanData.name,
          billingCycle: fetchedPlanData.cycle,
          currency: fetchedPlanData.currency
        });
      });
      return;
    }

    // If adding new card, create it first, then subscription
    if (data.cardNumber && data.expirationDate && data.cvv && data.fullName) {
      setPendingSubscription(true);

      startTransition(() => {
        createCardAction({
          cardData: {
            name: data.fullName!,
            cardNumber: data.cardNumber!,
            deadline: data.expirationDate!,
            cvv: data.cvv!,
            country: 'MEX',
            address: '',
            neighborhood: '',
            zip: data.postalCode || '',
            phone: userPhone,
            city: '',
            state: '',
            type: 'credit_card',
            secondary: false
          },
          t1PaymentId: paymentId,
          sellerId: sellerId,
          email: userEmail,
          storeName: storeName,
          phone: userPhone
        });
      });
    }
  };

  return (
    <>
      <div className="bg-white w-full min-h-screen flex items-center justify-center py-[58px] px-4">
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
              <SavedPaymentMethodForm
                control={control}
                errors={errors}
                isValid={isValid}
                isPending={createCardPending || subscriptionPending || saveFiscalDataPending}
                onSubmit={handleSubmit(submit)}
                savedCards={savedCards}
                savedBillingInfo={fiscalData?.mappedBillingInfo || null}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Error Dialog */}
      <ErrorDialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        title="Error"
        message={errorMessage}
      />
    </>
  );
}
