'use client'

import React, { startTransition, useActionState, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Drawer } from '@mui/material';
import PricingSummary from './PricingSummary';
import SavedPaymentMethodForm from './SavedPaymentMethodForm';
import ErrorDialog from './ErrorDialog';
import MobileHeader from './MobileHeader';
import MobileFooter from './MobileFooter';
import { CheckoutFormData, CheckoutFormProps, PlanData, SavedCard } from '@interfaces/checkout';
import { createPaymentCardAction } from '@services/paymentMethodsService';
import { createSubscriptionAction, changeSubscriptionAction, updateSubscriptionPaymentMethodAction } from '@services/subscriptionService';
import { PaymentMethod } from '@interfaces/paymentMethods';
import { saveFiscalDataAction } from '@services/fiscalDataService';

export default function CheckoutForm({
  searchParams,
  serviceData,
  paymentCards,
  fiscalData,
  planData: fetchedPlanData,
  currentSubscription,
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
        period: fetchedPlanData.period,
        ...(fetchedPlanData.downgradeNotice && { downgradeNotice: fetchedPlanData.downgradeNotice })
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
    type: 'subscription' | 'card-then-subscription' | 'upgrade' | null;
    data: CheckoutFormData | null;
  }>({ type: null, data: null });

  // Error dialog state
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Mobile "Ver detalle" dropdown state
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);

  // State to track if we're redirecting (keeps button disabled until redirect)
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Action state for card creation
  const [createCardState, createCardAction, createCardPending] = useActionState(createPaymentCardAction, undefined);

  // Action state for subscription
  const [subscriptionState, subscriptionAction, subscriptionPending] = useActionState(
    createSubscriptionAction,
    undefined
  );

  // Action state for change subscription (upgrade/downgrade/billing cycle change)
  const [changeState, changeAction, changePending] = useActionState(
    changeSubscriptionAction,
    undefined
  );

  // Action state for payment method update
  const [updatePaymentState, updatePaymentAction, updatePaymentPending] = useActionState(
    updateSubscriptionPaymentMethodAction,
    undefined
  );

  // State to track pending upgrade after payment method update
  const [pendingUpgradeAfterPaymentUpdate, setPendingUpgradeAfterPaymentUpdate] = useState<{
    data: CheckoutFormData | null;
  }>({ data: null });

  // State to track payment-only update (same plan + same cycle, only payment changed)
  const [pendingPaymentOnlyUpdate, setPendingPaymentOnlyUpdate] = useState(false);

  // Action state for fiscal data save
  const [saveFiscalDataState, dispatchSaveFiscalData, saveFiscalDataPending] = useActionState(
    saveFiscalDataAction,
    undefined
  );

  // Find the default card for initial value (skip if expired)
  const getDefaultCardId = () => {
    if (!paymentCards) return '';

    // PRIORITY 1: Use payment method from current subscription (for upgrades/downgrades)
    if (currentSubscription?.payment_id) {
      const subscriptionCard = paymentCards.find(
        card => card.id === currentSubscription.payment_id
      );
      // Only use it if it exists and is not expired
      if (subscriptionCard && !subscriptionCard.isExpired) {
        return subscriptionCard.id;
      }
    }

    // PRIORITY 2: Fallback to default card from service
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

  // Helper function to check if user selected same plan and same cycle
  const isSamePlanAndCycle = (): boolean => {
    if (!currentSubscription || !fetchedPlanData) {
      return false;
    }

    return currentSubscription.plan_id === fetchedPlanData.id &&
           currentSubscription.billing_cycle === fetchedPlanData.cycle;
  };

  // Helper function to check if payment method needs updating for subscription upgrades
  const needsPaymentMethodUpdate = (selectedCardId: string): boolean => {
    // Only relevant if user has current subscription and is using a saved card
    if (!currentSubscription?.payment_id || !selectedCardId) {
      return false;
    }

    // Check if selected card is different from subscription's payment method
    return selectedCardId !== currentSubscription.payment_id;
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

  // Watch the selected card ID to determine if button should be disabled
  const selectedCardId = useWatch({ control, name: 'savedCardId' });

  // Determine if submit button should be disabled
  // Disable when: same plan + same cycle + same payment method (nothing to update)
  const isSubmitDisabled = Boolean(
    isSamePlanAndCycle() &&
    selectedCardId &&
    !needsPaymentMethodUpdate(selectedCardId)
  );

  // Determine if this is a subscription change (update) vs new subscription
  const isSubscriptionChange = Boolean(currentSubscription);

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
            cardId: createdCardId,
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
      // Keep button disabled while redirecting
      setIsRedirecting(true);
      // Redirect to the success URL
      window.location.href = redirectUrl;
    } else if (subscriptionState && !subscriptionState.success) {
      console.error('Failed to create subscription:', subscriptionState.error);
      // Show error dialog
      setErrorMessage(subscriptionState.error || 'Error al crear la suscripción. Por favor, intenta nuevamente.');
      setErrorDialogOpen(true);
    }
  }, [subscriptionState, redirectUrl]);

  // Handle change subscription success - redirect
  useEffect(() => {
    if (changeState?.success) {
      console.log('Subscription changed successfully! Redirecting...');
      // Keep button disabled while redirecting
      setIsRedirecting(true);
      // Redirect to the success URL
      window.location.href = redirectUrl;
    } else if (changeState && !changeState.success) {
      console.error('Failed to change subscription:', changeState.error);
      // Show error dialog
      setErrorMessage(changeState.error || 'Error al actualizar la suscripción. Por favor, intenta nuevamente.');
      setErrorDialogOpen(true);
    }
  }, [changeState, redirectUrl]);

  // Handle payment method update success - proceed with upgrade or redirect
  useEffect(() => {
    if (updatePaymentState?.success) {
      // Check if this is a payment-only update (same plan + same cycle)
      if (pendingPaymentOnlyUpdate) {
        console.log('Payment method updated successfully! Redirecting...');
        // Keep button disabled while redirecting
        setIsRedirecting(true);
        // Redirect to success URL
        window.location.href = redirectUrl;
        setPendingPaymentOnlyUpdate(false);
      } else if (pendingUpgradeAfterPaymentUpdate.data) {
        // This is a payment update before a plan change
        console.log('Payment method updated successfully! Proceeding with plan change...');

        if (currentSubscription && fetchedPlanData) {
          // Now change the subscription
          startTransition(() => {
            changeAction({
              subscriptionId: currentSubscription.cronos_subscription_id,
              newPlanId: fetchedPlanData.id,
              billingCycle: fetchedPlanData.cycle
            });
          });
        }

        // Reset pending state
        setPendingUpgradeAfterPaymentUpdate({ data: null });
      }
    } else if (updatePaymentState && !updatePaymentState.success) {
      console.error('Failed to update payment method:', updatePaymentState.error);
      // Show error dialog
      setErrorMessage(updatePaymentState.error || 'Error al actualizar el método de pago. Por favor, intenta nuevamente.');
      setErrorDialogOpen(true);
      // Reset pending states
      setPendingUpgradeAfterPaymentUpdate({ data: null });
      setPendingPaymentOnlyUpdate(false);
    }
  }, [updatePaymentState, pendingUpgradeAfterPaymentUpdate, pendingPaymentOnlyUpdate, currentSubscription, fetchedPlanData, redirectUrl]);

  // Handle fiscal data save success - proceed with subscription/card creation
  useEffect(() => {
    if (saveFiscalDataState?.success && pendingAfterFiscalSave.type && pendingAfterFiscalSave.data) {
      console.log('Fiscal data saved successfully! Proceeding with', pendingAfterFiscalSave.type);

      const data = pendingAfterFiscalSave.data;

      if (pendingAfterFiscalSave.type === 'upgrade' && currentSubscription) {
        // Check if payment method needs updating before upgrade
        if (data.savedCardId && needsPaymentMethodUpdate(data.savedCardId)) {
          console.log('Payment method changed - updating before upgrade...');
          setPendingUpgradeAfterPaymentUpdate({ data });

          startTransition(() => {
            updatePaymentAction({
              subscriptionId: currentSubscription.cronos_subscription_id,
              paymentId: data.savedCardId!
            });
          });
        } else {
          // Change subscription directly
          startTransition(() => {
            changeAction({
              subscriptionId: currentSubscription.cronos_subscription_id,
              newPlanId: fetchedPlanData!.id,
              billingCycle: fetchedPlanData!.cycle
            });
          });
        }
      } else if (pendingAfterFiscalSave.type === 'subscription' && data.savedCardId) {
        // Create subscription with saved card
        startTransition(() => {
          subscriptionAction({
            userId: userId!,
            shopId: sellerId,
            planId: fetchedPlanData!.id,
            cardId: data.savedCardId!,
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

    // Detect if this is same plan and same cycle (payment-only update scenario)
    const samePlanAndCycle = isSamePlanAndCycle();

    // Detect if this is an upgrade/downgrade
    const isUpgradeOrDowngrade = currentSubscription &&
      (currentSubscription.plan_id !== fetchedPlanData.id ||
       currentSubscription.billing_cycle !== fetchedPlanData.cycle);

    console.log('Same plan and cycle:', samePlanAndCycle);
    console.log('Is upgrade/downgrade:', isUpgradeOrDowngrade);
    if (isUpgradeOrDowngrade) {
      console.log('Current plan:', currentSubscription.plan_id, currentSubscription.billing_cycle);
      console.log('New plan:', fetchedPlanData.id, fetchedPlanData.cycle);
    }

    // Handle same plan + same cycle scenario
    if (samePlanAndCycle && data.savedCardId && currentSubscription) {
      // Only update payment method if it changed
      if (needsPaymentMethodUpdate(data.savedCardId)) {
        console.log('Same plan/cycle - updating payment method only...');
        setPendingPaymentOnlyUpdate(true);

        startTransition(() => {
          updatePaymentAction({
            subscriptionId: currentSubscription.cronos_subscription_id,
            paymentId: data.savedCardId!
          });
        });
        return;
      } else {
        // Same plan, same cycle, same payment method - nothing to do
        console.log('Same plan/cycle/payment - nothing to update');
        return;
      }
    }

    // Check if user checked the "Añadir datos de facturación" checkbox
    // Only save fiscal data if checkbox is checked AND user doesn't already have it
    const needToSaveFiscalData = data.addBillingInfo === true &&
                                  !fiscalData?.mappedBillingInfo;

    // If checkbox is checked, save fiscal data first
    if (needToSaveFiscalData) {
      console.log('Saving fiscal data first...');

      // Determine what to do after fiscal data is saved
      let nextAction: 'subscription' | 'card-then-subscription' | 'upgrade';
      if (isUpgradeOrDowngrade) {
        nextAction = 'upgrade';
      } else {
        nextAction = data.savedCardId ? 'subscription' : 'card-then-subscription';
      }

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

    // If using saved card, create subscription or upgrade immediately
    if (data.savedCardId) {
      if (isUpgradeOrDowngrade && currentSubscription) {
        // Check if payment method needs updating before upgrade
        if (needsPaymentMethodUpdate(data.savedCardId)) {
          console.log('Payment method changed - updating before upgrade...');
          setPendingUpgradeAfterPaymentUpdate({ data });

          startTransition(() => {
            updatePaymentAction({
              subscriptionId: currentSubscription.cronos_subscription_id,
              paymentId: data.savedCardId!
            });
          });
        } else {
          // Call change subscription endpoint directly
          startTransition(() => {
            changeAction({
              subscriptionId: currentSubscription.cronos_subscription_id,
              newPlanId: fetchedPlanData.id,
              billingCycle: fetchedPlanData.cycle
            });
          });
        }
      } else {
        // Call regular subscription endpoint
        startTransition(() => {
          subscriptionAction({
            userId: userId,
            shopId: sellerId,
            planId: fetchedPlanData.id,
            cardId: data.savedCardId!,
            planName: fetchedPlanData.name,
            billingCycle: fetchedPlanData.cycle,
            currency: fetchedPlanData.currency
          });
        });
      }
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
      <div className="w-full min-h-screen flex flex-col lg:flex-row lg:items-center lg:justify-center py-0 lg:py-[58px] px-0 lg:px-4">
        {/* Mobile Header - only on mobile */}
        <MobileHeader
          isOpen={mobileDetailsOpen}
          onToggle={() => setMobileDetailsOpen(!mobileDetailsOpen)}
        />

        <form
          onSubmit={handleSubmit(submit)}
          className="flex flex-col lg:flex-row gap-[24px] lg:gap-[80px] w-full lg:max-w-[1290px] flex-1"
        >
          {/* Left Panel - Pricing Summary (Desktop) / Plan Info (Mobile) */}
          <div className="flex justify-center lg:justify-start px-[14px] lg:px-0 pt-[12px] pb-[20px] lg:pt-0 border-b border-[#e7e7e7] lg:border-b-0">
            <PricingSummary planData={planData} />
          </div>

          {/* Right Panel - Payment Form */}
          <div className="flex-1 flex justify-center lg:justify-end ">
            <div className="lg:rounded-[10px] lg:shadow-[0px_0px_5px_1px_rgba(0,0,0,0.1)] p-[0px_20px] md:p-[12px_20px] lg:p-[39px_79px] flex md:items-center justify-center w-full lg:w-auto">
              <SavedPaymentMethodForm
                control={control}
                errors={errors}
                isValid={isValid}
                isPending={createCardPending || subscriptionPending || changePending || updatePaymentPending || saveFiscalDataPending || isRedirecting}
                isDisabled={isSubmitDisabled}
                isSubscriptionChange={isSubscriptionChange}
                onSubmit={handleSubmit(submit)}
                savedCards={savedCards}
                savedBillingInfo={fiscalData?.mappedBillingInfo || null}
              />
            </div>
          </div>
        </form>

        {/* Mobile Footer - only on mobile */}
        <MobileFooter />
      </div>

      {/* Mobile Price Breakdown Drawer - only on mobile */}
      <Drawer
        anchor="top"
        open={mobileDetailsOpen}
        onClose={() => setMobileDetailsOpen(false)}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
            borderTopLeftRadius: '0',
            borderTopRightRadius: '0',
            maxHeight: '50vh'
          }
        }}
      >
        <div className="bg-white w-full">
          {/* Header replica with logo and Ver detalle button */}
          <MobileHeader
            isOpen={mobileDetailsOpen}
            onToggle={() => setMobileDetailsOpen(false)}
          />

          <div className="px-[20px] py-[20px] flex flex-col gap-[12px]">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-[#4c4c4c] text-[12px]">
              <p className="font-normal leading-[normal]">Subtotal</p>
              <p className="font-semibold leading-[30px] text-right">${planData.subtotal.toFixed(2)}</p>
            </div>
            <div className="h-px w-full bg-[#e7e7e7]" />

            {/* Credit line - only show for upgrades/downgrades */}
            {planData.credit && (
              <>
                <div className="flex items-center justify-between text-[#4c4c4c] text-[12px]">
                  <p className="font-normal leading-[normal]">{planData.credit.label}</p>
                  <p className="font-semibold leading-[30px] text-right">${planData.credit.amount.toFixed(2)}</p>
                </div>
                <div className="h-px w-full bg-[#e7e7e7]" />
              </>
            )}

            {/* Impuestos (IVA) */}
            <div className="flex items-center justify-between text-[#4c4c4c] text-[12px]">
              <p className="font-normal leading-[normal]">Impuestos (IVA)</p>
              <p className="font-semibold leading-[30px] text-right">${planData.tax.toFixed(2)}</p>
            </div>
            <div className="h-px w-full bg-[#e7e7e7]" />

            {/* Total */}
            <div className="flex items-center justify-between text-[#4c4c4c] text-[14px] font-bold">
              <p className="leading-[normal]">Total</p>
              <p className="leading-[30px] text-right">${planData.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </Drawer>

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
