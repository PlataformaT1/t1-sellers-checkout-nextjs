/**
 * Global service parameter handler
 * Ensures only PAYMENTS, STORE, and SHIPPING are allowed
 * Defaults to STORE when no valid service is present
 */

export enum AllowedServices {
  STORE = 'STORE',
  SHIPPING = 'SHIPPING',
  PAYMENTS = 'PAYMENTS'
}

export interface ServiceParamResult {
  service: AllowedServices;
  wasDefaulted: boolean;
}

/**
 * Validates and normalizes service parameters
 * @param serviceParam - The service parameter from URL or other source
 * @returns ServiceParamResult with validated service and whether it was defaulted
 */
export function validateAndNormalizeService(serviceParam?: string | null): ServiceParamResult {
  // If no service param provided, default to STORE
  if (!serviceParam) {
    return {
      service: AllowedServices.STORE,
      wasDefaulted: true
    };
  }

  // Convert to uppercase for comparison
  const normalizedParam = serviceParam.toUpperCase();

  // Check if it's one of the allowed services
  if (Object.values(AllowedServices).includes(normalizedParam as AllowedServices)) {
    return {
      service: normalizedParam as AllowedServices,
      wasDefaulted: false
    };
  }

  // If not allowed, default to STORE
  console.warn(`Invalid service parameter "${serviceParam}" provided. Defaulting to STORE.`);
  return {
    service: AllowedServices.STORE,
    wasDefaulted: true
  };
}

/**
 * Extracts and validates service parameter from URL search params
 * Supports both 'service' and 'service_to_contract' parameter names
 * @param searchParams - URLSearchParams object
 * @returns ServiceParamResult with validated service
 */
export function extractServiceFromParams(searchParams: URLSearchParams): ServiceParamResult {
  const serviceParam = searchParams.get('service') || searchParams.get('service_to_contract');
  return validateAndNormalizeService(serviceParam);
}

/**
 * Updates URL with the correct service parameter
 * Removes any invalid service parameters and ensures STORE is set if needed
 * @param url - Current URL
 * @param forceService - Optional service to force (useful for redirects)
 * @returns Updated URL string
 */
export function updateUrlWithValidService(url: string, forceService?: AllowedServices): string {
  try {
    const urlObj = new URL(url);
    const currentService = urlObj.searchParams.get('service') || urlObj.searchParams.get('service_to_contract');
    
    // Remove both possible service parameter names
    urlObj.searchParams.delete('service');
    urlObj.searchParams.delete('service_to_contract');
    
    // Determine which service to use
    const serviceToUse = forceService || validateAndNormalizeService(currentService).service;
    
    // Set the service parameter
    urlObj.searchParams.set('service', serviceToUse);
    
    return urlObj.toString();
  } catch (error) {
    console.error('Error updating URL with valid service:', error);
    return url;
  }
}

/**
 * Gets the appropriate ID tag based on service type
 * @param service - The service type
 * @param context - Context where the tag is used ('new_store', 'stores_list', etc.)
 * @returns ID tag string
 */
export function getServiceIdTag(service: AllowedServices, context: 'new_store' | 'stores_list' = 'new_store'): string {
  const contextSuffix = context === 'new_store' ? '_new_store_1' : '_stores_1';
  
  switch (service) {
    case AllowedServices.SHIPPING:
      return `T1E${contextSuffix}`;
    case AllowedServices.PAYMENTS:
      return `T1PAY${contextSuffix}`;
    case AllowedServices.STORE:
    default:
      return `T1S${contextSuffix}`;
  }
}

/**
 * Gets the redirect URL for a service type
 * @param service - The service type
 * @param storeId - The store ID
 * @returns Redirect URL
 */
export function getServiceRedirectUrl(service: AllowedServices, storeId: string): string {
  switch (service) {
    case AllowedServices.STORE:
      return `${process.env.NEXT_PUBLIC_STORE_URL}${storeId}`;
    case AllowedServices.PAYMENTS:
      return `${process.env.NEXT_PUBLIC_PAYMENTS_URL}${storeId}`;
    case AllowedServices.SHIPPING:
      return `${process.env.NEXT_PUBLIC_SHIPPING_URL}${storeId}`;
    default:
      return `${process.env.NEXT_PUBLIC_STORE_URL}${storeId}`;
  }
}

/**
 * Middleware helper to ensure valid service parameters in URLs
 * @param searchParams - URLSearchParams from request
 * @param pathname - Current pathname
 * @returns Object with shouldRedirect flag and redirectUrl if needed
 */
export function validateServiceInUrl(searchParams: URLSearchParams, pathname: string): {
  shouldRedirect: boolean;
  redirectUrl?: string;
} {
  const { service, wasDefaulted } = extractServiceFromParams(searchParams);
  
  // If service was defaulted or invalid params were found, we need to redirect
  const hasInvalidParams = searchParams.get('service') !== service || 
                          (searchParams.has('service_to_contract') && searchParams.get('service_to_contract') !== service);
  
  if (wasDefaulted || hasInvalidParams) {
    const newUrl = new URL(pathname, 'http://localhost');
    
    // Copy all valid parameters except service-related ones
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'service' && key !== 'service_to_contract') {
        newUrl.searchParams.set(key, value);
      }
    }
    
    // Set the validated service
    newUrl.searchParams.set('service', service);
    
    return {
      shouldRedirect: true,
      redirectUrl: newUrl.pathname + newUrl.search
    };
  }
  
  return { shouldRedirect: false };
}

export default {
  AllowedServices,
  validateAndNormalizeService,
  extractServiceFromParams,
  updateUrlWithValidService,
  getServiceIdTag,
  getServiceRedirectUrl,
  validateServiceInUrl
};
