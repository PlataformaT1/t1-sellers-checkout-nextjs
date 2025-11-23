export interface SuccessPageParams {
  planName: string;
  subtotal: number;
  tax: number;
  total: number;
  cardBrand: string;
  cardLast4: string;
  redirectUrl: string;
  isUpdate: boolean; // true for "actualizar", false for "suscribirse"
}