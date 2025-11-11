export interface CheckoutFormData {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  fullName: string;
  addBillingInfo: boolean;
}

export interface PlanData {
  name: string;
  price: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  period: string;
}

export interface CheckoutFormProps {
  searchParams?: {
    planId?: string;
    planName?: string;
    price?: string;
    subtotal?: string;
    tax?: string;
    total?: string;
    currency?: string;
    period?: string;
  };
}
