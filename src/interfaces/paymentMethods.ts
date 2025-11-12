export interface PaymentMethod {
  termination: string;
  name: string;
  brand: string;
  client_id: string;
  default: boolean;
  validated_charge: boolean;
  backup: boolean;
  single_charge: boolean;
  creation_date: string;
  expiration_month: string;
  expiration_year: number;
  type: string;
  recurrencia_id?: string;
  status: 'active' | 'inactive' | string;
  id: string;
  address?: PaymentMethodAddress;
}

export interface PaymentMethodAddress {
  line1: string;
  line2: string;
  postal_code: string;
  city: string;
  state: string;
  country: string;
  municipality: string;
  reference_1: string;
  reference_2: string;
  longitude: number;
  latitude: number;
  phone: {
    type: string;
    country_code: string;
    area_code: string;
    prefix: string;
    number: string;
    extension: number;
  };
}

export interface PaymentMethodsResponse {
  success: boolean;
  data: PaymentMethod[];
  count: number;
  request_id: string;
}

export interface AddPaymentCardFormData {
  cardId?: string;
  name: string;
  country: string;
  address: string;
  neighborhood: string;
  zip: string;
  phone: string;
  city: string;
  cardNumber: string;
  state?: string;
  deadline: string; // MM/YY format
  cvv: string;
  secondary?: boolean; // If true, sets as backup card
  type: string; // credit_card, debit_card, etc.
}

export interface CardByBinInfo {
  clave: string; // Card type code
  descripcion: string;
  nombre: string;
}

export interface CardByBinResponse {
  success: boolean;
  data: CardByBinInfo[];
}

// Server Action State Types
export interface PaymentMethodActionState {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
}

export interface GetPaymentCardsState {
  success: boolean;
  error?: string;
  data?: PaymentMethodsResponse;
}

export interface CreateCardState {
  success: boolean;
  error?: string;
  message?: string;
  cvv_err?: boolean;
  cardId?: string;
}

export interface SetDefaultCardState {
  success: boolean;
  error?: string;
  cardId?: string;
}

export interface DeleteCardState {
  success: boolean;
  error?: string;
  message?: string;
}

// Utility Types
export interface CardExpiryCheck {
  expired: boolean;
  daysLeft: number;
  almostExpired: boolean;
}
