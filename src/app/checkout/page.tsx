import CheckoutForm from "@components/Checkout/CheckoutForm";
import CheckoutError from "@components/Checkout/CheckoutError";
import { getStoreData } from "@services/identityService";
import { getPaymentCards } from "@services/paymentMethodsService";
import { getFiscalData } from "@services/walletService";
import { getPlanById } from "@services/subscriptionService";
import { auth } from "@auth";
import { AuthTokenI } from "@interfaces/props";
import { getUserAccessCached } from "@services/userAccessService";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export const fetchCache = "force-no-store";
export const runtime = 'nodejs';
export const revalidate = 0;

interface CheckoutPageProps {
  searchParams?: Promise<{
    store?: string;    // Store ID (required)
    id?: string;       // Plan ID (required)
    cycle?: string;    // 'monthly' or 'annual' (required)
    redirect?: string; // Redirect URL after success (required)
  }>;
}

export default async function CheckoutPage(props: CheckoutPageProps) {
  const searchParams = await props.searchParams;

  // Validate required parameters
  if (!searchParams?.store) {
    return (
      <CheckoutError
        message="Parámetro de tienda requerido"
        description="No se proporcionó el ID de la tienda. Por favor, verifica el enlace e intenta nuevamente."
      />
    );
  }

  if (!searchParams?.id) {
    return (
      <CheckoutError
        message="Plan no especificado"
        description="No se proporcionó el ID del plan. Por favor, selecciona un plan e intenta nuevamente."
      />
    );
  }

  if (!searchParams?.cycle) {
    return (
      <CheckoutError
        message="Ciclo de facturación requerido"
        description="No se especificó si el plan es mensual o anual. Por favor, verifica el enlace e intenta nuevamente."
      />
    );
  }

  // Validate cycle value
  if (searchParams.cycle !== 'monthly' && searchParams.cycle !== 'annual') {
    return (
      <CheckoutError
        message="Ciclo de facturación inválido"
        description="El ciclo de facturación debe ser 'monthly' o 'annual'."
      />
    );
  }

  // Validate redirect URL
  if (!searchParams?.redirect) {
    return (
      <CheckoutError
        message="URL de redirección requerida"
        description="No se proporcionó la URL de redirección. Por favor, verifica el enlace e intenta nuevamente."
      />
    );
  }

  // Get session for user data
  const session = await auth() as AuthTokenI;

  const storeId = Number(searchParams.store);

  let serviceData = null;
  let paymentCards = null;
  let fiscalData = null;
  let planData = null;
  let userId = null;

  try {
    // Fetch plan data
    const planResponse = await getPlanById(searchParams.id);

    if (!planResponse?.data?.plan) {
      return (
        <CheckoutError
          message="Plan no encontrado"
          description="No se pudo encontrar el plan especificado. Por favor, verifica el ID del plan e intenta nuevamente."
        />
      );
    }

    const plan = planResponse.data.plan;

    // Get pricing for the user's country (default to MX)
    const countryData = plan.country_availability.find(c => c.country_code === 'MX') || plan.country_availability[0];

    if (!countryData) {
      return (
        <CheckoutError
          message="Plan no disponible"
          description="Este plan no está disponible en tu país."
        />
      );
    }

    const isAnnual = searchParams.cycle === 'annual';
    const price = isAnnual ? countryData.price_annual : countryData.price_monthly;
    const subtotal = price;
    const tax = subtotal * countryData.tax_rate;
    const total = subtotal + tax;

    planData = {
      id: plan.plan_id,
      name: plan.display_name,
      price: total,
      subtotal: subtotal,
      tax: tax,
      total: total,
      currency: countryData.currency,
      period: isAnnual ? 'Año' : 'Mes',
      cycle: searchParams.cycle,
      trialDays: plan.trial_days
    };

    // Fetch service data to get payment ID
    if (storeId) {
      const userResponse = await getUserAccessCached(session.access_token, storeId?.toString(), session.user.email);
      userId = userResponse?.data?.user_id || null;
      
      const serviceResponse = await getStoreData(storeId);
      serviceData = serviceResponse.data;

      // Fetch payment cards if we have a payment ID
      if (serviceData?.services?.payments?.payment_id) {
        const cardsResponse = await getPaymentCards(serviceData.services.payments.payment_id);
        paymentCards = cardsResponse.data || [];
      }

      // Fetch fiscal data for billing information
      if (serviceData?.id_seller) {
        fiscalData = await getFiscalData(serviceData.id_seller);
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return (
      <CheckoutError
        message="Error al cargar el checkout"
        description="Ocurrió un error al cargar la información. Por favor, intenta nuevamente."
      />
    );
  }

  return (
    <CheckoutForm
      searchParams={searchParams}
      serviceData={serviceData}
      paymentCards={paymentCards}
      fiscalData={fiscalData}
      planData={planData}
      userId={userId}
      redirectUrl={searchParams.redirect}
      userEmail={session?.user?.email || ''}
      userPhone={session?.user?.phone || ''}
    />
  );
}
