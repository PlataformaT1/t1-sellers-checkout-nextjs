import { request } from './identityService';

// Fiscal data save interfaces
export interface SaveFiscalDataPayload {
  taxpayer_type: 'fisica' | 'moral';
  rfc: string;
  business_name: string;
  address: {
    zip: string;
  };
}

export interface SaveFiscalDataState {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Server action to save fiscal/billing data
 * @param prevState - Previous state from useActionState
 * @param formData - Fiscal data to save
 */
export async function saveFiscalDataAction(
  prevState: SaveFiscalDataState | undefined,
  formData: {
    storeId: number;
    data: SaveFiscalDataPayload;
  }
): Promise<SaveFiscalDataState> {
  try {
    const response = await request<any>(
      'PATCH',
      `tax_information/${formData.storeId}`,
      formData.data
    );

    if ((response as any)?.__error) {
      throw new Error((response as any).message || 'Error al guardar información fiscal');
    }

    return {
      success: true,
      message: 'Información fiscal guardada exitosamente'
    };
  } catch (error: any) {
    console.error('Error saving fiscal data:', error);
    return {
      success: false,
      error: error.message || 'Error al guardar la información fiscal',
      message: 'Error al guardar la información fiscal. Por favor, intenta nuevamente.'
    };
  }
}
