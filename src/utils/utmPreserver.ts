/**
 * Middleware UTM utilities for preserving UTM parameters through authentication flow
 */

export interface UTMParams {
  [key: string]: string;
}

export interface PreservedParams {
  [key: string]: string | undefined;
  service?: string;
  service_to_contract?: string;
  original_path?: string;
}

/**
 * Extract ALL UTM parameters dynamically from URL search params
 * This captures any parameter that starts with 'utm_'
 */
export function extractUTMParams(searchParams: URLSearchParams): UTMParams {
  const utmParams: UTMParams = {};
  
  // Dynamically extract ALL parameters that start with 'utm_'
  for (const [key, value] of searchParams.entries()) {
    if (key.toLowerCase().startsWith('utm_')) {
      utmParams[key] = value;
    }
  }

  return utmParams;
}

/**
 * Extract service parameters from URL search params
 * Only allows PAYMENTS, STORE, and SHIPPING services
 */
export function extractServiceParams(searchParams: URLSearchParams): { service?: string; service_to_contract?: string } {
  const allowedServices = ['PAYMENTS', 'STORE', 'SHIPPING'];
  
  const service = searchParams.get('service');
  const serviceToContract = searchParams.get('service_to_contract');
  
  // Validate and filter services
  const validService = service && allowedServices.includes(service.toUpperCase()) ? service : undefined;
  const validServiceToContract = serviceToContract && allowedServices.includes(serviceToContract.toUpperCase()) ? serviceToContract : undefined;
  
  return {
    service: validService,
    service_to_contract: validServiceToContract
  };
}

/**
 * Check if URL has any UTM parameters (completely dynamic)
 */
export function hasUTMParams(searchParams: URLSearchParams): boolean {
  // Check if ANY parameter starts with 'utm_'
  for (const [key] of searchParams.entries()) {
    if (key.toLowerCase().startsWith('utm_')) {
      return true;
    }
  }
  return false;
}

/**
 * Build preserved parameters object for storage
 */
export function buildPreservedParams(
  searchParams: URLSearchParams, 
  pathname: string
): PreservedParams | null {
  const utmParams = extractUTMParams(searchParams);
  const serviceParams = extractServiceParams(searchParams);
  
  // Only preserve if we have UTM params or service params
  if (Object.keys(utmParams).length === 0 && !serviceParams.service && !serviceParams.service_to_contract) {
    return null;
  }

  return {
    ...utmParams,
    ...serviceParams,
    original_path: pathname
  };
}

/**
 * Reconstruct URL with preserved parameters
 */
export function reconstructURLWithParams(basePath: string, preservedParams: PreservedParams): string {
  const url = new URL(basePath, 'http://localhost'); // Base URL doesn't matter for pathname + search
  
  // Add all preserved parameters back to URL
  Object.entries(preservedParams).forEach(([key, value]) => {
    if (value && key !== 'original_path') {
      url.searchParams.set(key, value);
    }
  });

  return url.pathname + url.search;
}

/**
 * Cookie name for storing preserved parameters
 */
export const PRESERVED_PARAMS_COOKIE = 'preserved_params';

/**
 * Cookie options for preserved parameters
 */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 3600, // 1 hour
  path: '/'
};
