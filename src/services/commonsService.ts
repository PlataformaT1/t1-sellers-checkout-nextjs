'use server';

const url = process.env.COMMONS_URL;

export interface RegimenFiscal {
  clave: string;
  descripcion: string;
  fisica: boolean;
  moral: boolean;
}

export interface RegimenFiscalResponse {
  success: boolean;
  message: string;
  data: {
    data: RegimenFiscal[];
  };
  timestamp: string;
}

export interface UsoCFDI {
  clave: string;
  descripcion: string;
  aplica_fisica: boolean;
  aplica_moral: boolean;
  regimen_fiscal: string;
}

export interface UsoCFDIResponse {
  success: boolean;
  message: string;
  data: {
    data: UsoCFDI[];
  };
  timestamp: string;
}

/**
 * Fetch regimenes fiscales from SAT catalog
 * @param persona - FISICA or MORAL
 */
export async function getRegimenesFiscales(persona: 'FISICA' | 'MORAL'): Promise<RegimenFiscalResponse | null> {
  try {
    const response = await fetch(`${url}/sat/regimenes-fiscales?persona=${persona}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'force-cache' // Cache the catalog data
    });

    if (!response.ok) {
      console.error('Error fetching regimenes fiscales:', response.statusText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching regimenes fiscales:', error);
    return null;
  }
}

/**
 * Fetch usos de CFDI from SAT catalog
 * @param persona - FISICA or MORAL
 * @param regimen - Regimen fiscal code
 */
export async function getUsosCFDI(persona: 'FISICA' | 'MORAL', regimen: string): Promise<UsoCFDIResponse | null> {
  try {
    const response = await fetch(`${url}/sat/usos-cfdi?persona=${persona}&regimen=${regimen}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'force-cache' // Cache the catalog data
    });

    if (!response.ok) {
      console.error('Error fetching usos CFDI:', response.statusText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching usos CFDI:', error);
    return null;
  }
}
