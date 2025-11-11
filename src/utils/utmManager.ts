'use client';

export interface UTMParams {
  [key: string]: string;
}

export class UTMManager {
  private static readonly UTM_COOKIE_NAME = 'utm_tracking_data';
  private static readonly UTM_COOKIE_EXPIRY_DAYS = 30;
  private static readonly UTM_PREFIX = 'utm_';

  /**
   * Extract all UTM parameters from URL search params
   */
  static extractUTMParams(searchParams: URLSearchParams): UTMParams {
    const utmParams: UTMParams = {};
    
    for (const [key, value] of searchParams.entries()) {
      if (key.toLowerCase().startsWith(this.UTM_PREFIX)) {
        utmParams[key] = value;
      }
    }
    
    return utmParams;
  }

  /**
   * Save UTM parameters to cookie
   */
  static saveUTMToCookie(utmParams: UTMParams): void {
    if (Object.keys(utmParams).length === 0) return;

    try {
      const utmData = {
        params: utmParams,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : ''
      };

      const cookieValue = encodeURIComponent(JSON.stringify(utmData));
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.UTM_COOKIE_EXPIRY_DAYS);

      document.cookie = `${this.UTM_COOKIE_NAME}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
      
      console.log('UTM parameters saved to cookie:', utmParams);
    } catch (error) {
      console.error('Error saving UTM parameters to cookie:', error);
    }
  }

  /**
   * Get UTM parameters from cookie
   */
  static getUTMFromCookie(): UTMParams | null {
    if (typeof document === 'undefined') return null;

    try {
      const cookies = document.cookie.split(';');
      const utmCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${this.UTM_COOKIE_NAME}=`)
      );

      if (!utmCookie) return null;

      const cookieValue = utmCookie.split('=')[1];
      const decodedValue = decodeURIComponent(cookieValue);
      const utmData = JSON.parse(decodedValue);

      return utmData.params || null;
    } catch (error) {
      console.error('Error reading UTM parameters from cookie:', error);
      return null;
    }
  }

  /**
   * Store UTM parameters in cookie (alias for saveUTMToCookie)
   */
  static storeUTMInCookie(utmParams: UTMParams): void {
    this.saveUTMToCookie(utmParams);
  }

  /**
   * Delete UTM cookie
   */
  static deleteUTMCookie(): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${this.UTM_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    console.log('UTM cookie deleted');
  }

  /**
   * Debug UTM state - logs current UTM data to console
   * Useful for development and troubleshooting
   */
  static debugUTMState(): void {
    if (typeof window === 'undefined') return;

    console.group('🎯 UTM Manager Debug State');
    console.log('Current URL:', window.location.href);
    console.log('UTM Cookie Data:', this.getUTMFromCookie());
    console.log('URL Parameters:', Object.fromEntries(new URLSearchParams(window.location.search)));
    console.log('Middleware Preserved Params:', this.getPreservedParamsFromCookie());
    console.groupEnd();
  }

  /**
   * Get preserved parameters from middleware cookie
   * This is used when parameters are restored after authentication
   */
  static getPreservedParamsFromCookie(): Record<string, string> | null {
    if (typeof window === 'undefined') return null;

    try {
      const preservedCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('preserved_params='));

      if (!preservedCookie) return null;

      const cookieValue = preservedCookie.split('=')[1];
      return JSON.parse(decodeURIComponent(cookieValue));
    } catch (error) {
      console.error('Error parsing preserved params cookie:', error);
      return null;
    }
  }

  /**
   * Enhanced initialization that checks for middleware-preserved parameters
   * This should be called on app initialization to restore UTM data after auth
   */
  static initializeWithMiddlewareSupport(searchParams?: URLSearchParams): void {
    if (typeof window === 'undefined') return;

    // First, try to get preserved params from middleware
    const preservedParams = this.getPreservedParamsFromCookie();
    
    if (preservedParams) {
      console.log('🔄 Restoring UTM data from middleware preservation:', preservedParams);
      
      // Extract UTM params from preserved data
      const utmData: Record<string, string> = {};
      Object.entries(preservedParams).forEach(([key, value]) => {
        if (key.startsWith('utm_') && value) {
          utmData[key] = value;
        }
      });

      // Store UTM data in cookie
      if (Object.keys(utmData).length > 0) {
        this.storeUTMInCookie(utmData);
      }

      // Clear the preserved params cookie since we've used it
      document.cookie = 'preserved_params=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    // Then process current URL parameters as normal
    if (searchParams) {
      this.processURLParams(searchParams);
    } else if (window.location.search) {
      this.processURLParams(new URLSearchParams(window.location.search));
    }
  }

  /**
   * Get UTM data for sending to service (includes metadata)
   */
  static getUTMDataForService(): any | null {
    if (typeof document === 'undefined') return null;

    try {
      const cookies = document.cookie.split(';');
      const utmCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${this.UTM_COOKIE_NAME}=`)
      );

      if (!utmCookie) return null;

      const cookieValue = utmCookie.split('=')[1];
      const decodedValue = decodeURIComponent(cookieValue);
      return JSON.parse(decodedValue);
    } catch (error) {
      console.error('Error reading UTM data for service:', error);
      return null;
    }
  }

  /**
   * Process URL parameters and handle UTM tracking
   */
  static processURLParams(searchParams: URLSearchParams): {
    utmParams: UTMParams;
    otherParams: Record<string, string>;
  } {
    const utmParams = this.extractUTMParams(searchParams);
    const otherParams: Record<string, string> = {};

    // Extract non-UTM parameters
    for (const [key, value] of searchParams.entries()) {
      if (!key.toLowerCase().startsWith(this.UTM_PREFIX)) {
        otherParams[key] = value;
      }
    }

    // Save UTM parameters to cookie if any exist
    if (Object.keys(utmParams).length > 0) {
      this.saveUTMToCookie(utmParams);
    }

    return { utmParams, otherParams };
  }

  /**
   * Get combined UTM parameters (from URL and cookie, with URL taking priority)
   */
  static getCombinedUTMParams(searchParams: URLSearchParams): UTMParams {
    const urlUTMParams = this.extractUTMParams(searchParams);
    const cookieUTMParams = this.getUTMFromCookie() || {};

    // URL parameters take priority over cookie parameters
    return { ...cookieUTMParams, ...urlUTMParams };
  }

  /**
   * Build query string with UTM parameters preserved
   */
  static buildQueryStringWithUTM(baseParams: Record<string, any>, includeUTMFromCookie: boolean = true): string {
    const params = new URLSearchParams();

    // Add base parameters
    Object.entries(baseParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    // Add UTM parameters from cookie if requested
    if (includeUTMFromCookie) {
      const utmParams = this.getUTMFromCookie();
      if (utmParams) {
        Object.entries(utmParams).forEach(([key, value]) => {
          if (value && !params.has(key)) { // Don't override existing params
            params.append(key, value);
          }
        });
      }
    }

    return params.toString();
  }

  /**
   * Send UTM data to service and optionally delete cookie
   */
  static async sendUTMToService(serviceUrl: string, deleteAfterSend: boolean = true): Promise<boolean> {
    const utmData = this.getUTMDataForService();
    
    if (!utmData) {
      console.log('No UTM data to send');
      return false;
    }

    try {
      const response = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          utm_data: utmData,
          sent_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('UTM data sent successfully to service');
        
        if (deleteAfterSend) {
          this.deleteUTMCookie();
        }
        
        return true;
      } else {
        console.error('Failed to send UTM data to service:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error sending UTM data to service:', error);
      return false;
    }
  }

}

export default UTMManager;
