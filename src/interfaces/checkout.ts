import { GetFiscalDataResponse } from "@services/walletService";

export interface CheckoutFormData {
  // Card payment fields (for new card)
  cardNumber?: string;
  expirationDate?: string;
  cvv?: string;
  fullName?: string;

  // Saved card fields
  savedCardId?: string;

  // Billing info
  addBillingInfo: boolean;
  billingName?: string;
  rfc?: string;
  taxRegime?: string;
  postalCode?: string;
  cfdiUse?: string;
}

export interface PlanData {
  name: string;
  price: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  period: string;
  // Optional credit from previous plan (for upgrades)
  credit?: {
    label: string;  // e.g., "Créditos por plan Básico"
    amount: number; // negative value for credit
  };
  // Optional downgrade notice (for downgrades)
  downgradeNotice?: {
    newPlanName: string;     // e.g., "plan Básico"
    newPlanPrice: number;    // e.g., 399.00
    effectiveDate: string;   // e.g., "22 Nov"
    currentPlanName: string; // e.g., "plan Avanzado"
  };
}

export interface FetchedPlanData {
  id: string;
  name: string;
  price: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  period: string;
  cycle: string;
  trialDays?: number;
}

export interface CheckoutFormProps {
  searchParams?: {
    store?: string;
    id?: string;
    cycle?: string;
    redirect?: string;
  };
  serviceData?: {
    id_seller: number;
    store_name: string;
    services: {
      payments: {
        payment_id: string;
      };
    };
  } | null;
  paymentCards?: any[] | null;
  fiscalData?: GetFiscalDataResponse | null;
  planData?: FetchedPlanData | null;
  userId: number | null;
  redirectUrl: string;
  userEmail?: string;
  userPhone?: string;
}

export interface SavedCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expirationDate: string; // Format: MM/YY
  isExpired: boolean;
}
