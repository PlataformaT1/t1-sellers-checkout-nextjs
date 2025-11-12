// Fiscal Data interfaces - matching API response structure
export interface FiscalDataAddressI {
  street: string;
  outer_number: string;
  inside_number: string;
  zip: string;
  suburb: string;
  town: string;
  state: string;
}

export interface FiscalDataTaxInformationI {
  address: FiscalDataAddressI;
  business_name: string;
  curp: string;
  regimen: string;
  regimen_capital: string;
  regimen_type: string;
  rfc: string;
  tax_certificate: string;
  taxpayer_type: string;
}

export interface FiscalDataContactI {
  name: string;
  phone: string;
  email: string;
}

export interface FiscalDataAccountInformationI {
  tax_information: boolean;
  articles_of_incorporation: boolean;
  bank_information: boolean;
  industry_information: boolean;
}

export interface FiscalDataI {
  seller_id: number;
  business_name: string;
  contact: FiscalDataContactI;
  country: string;
  currency: string;
  tax_information: FiscalDataTaxInformationI;
  account_information: FiscalDataAccountInformationI;
  created_at: string;
  updated_at: string;
}

// Mapped interface for display
export interface MappedBillingInfoI {
  razonSocial: string;
  rfc: string;
  regimenFiscal: string;
  tipoContribuyente: string;
  direccion: string;
}

export interface FiscalDataResponseI {
  success: boolean;
  data: FiscalDataI;
  message?: string;
}
