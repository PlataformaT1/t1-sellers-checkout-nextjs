/**
 * Formats a card number with spaces every 4 digits for display
 * @param cardNumber - The card number (digits only or with spaces)
 * @returns Formatted card number (e.g., "4111 1111 1111 1111")
 */
export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '').slice(0, 16);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
}

/**
 * Formats expiration date as MM/YY
 * @param value - The raw expiration value (MMYY or MM/YY)
 * @returns Formatted expiration (MM/YY)
 */
export function formatExpiration(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 3) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Cleans and formats card number input (removes non-digits, limits to 16)
 * @param value - The input value
 * @returns Cleaned card number (digits only, max 16)
 */
export function cleanCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16);
}

/**
 * Cleans and formats expiration date input with auto-prepend of 0 for invalid months
 * @param value - The input value
 * @returns Cleaned expiration (digits only, max 4)
 */
export function cleanExpiration(value: string): string {
  let cleaned = value.replace(/\D/g, '').slice(0, 4);

  // If first digit is not 0 or 1, prepend 0 automatically
  if (cleaned.length === 1 && cleaned !== '0' && cleaned !== '1') {
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

/**
 * Cleans CVV input (removes non-digits, limits to 4)
 * @param value - The input value
 * @returns Cleaned CVV (digits only, max 4)
 */
export function cleanCVV(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

/**
 * Masks a card number showing only last 4 digits
 * @param cardNumber - The full card number
 * @param last4 - Optional, if you already have last 4 digits
 * @returns Masked card number (e.g., "**** **** **** 1234")
 */
export function maskCardNumber(cardNumber?: string, last4?: string): string {
  if (last4) {
    return `**** **** **** ${last4}`;
  }

  if (cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    const lastFour = cleaned.slice(-4);
    return `**** **** **** ${lastFour}`;
  }

  return '**** **** **** ****';
}

/**
 * Formats phone number for display (XXX) XXX-XXXX
 * @param phone - The phone number (10 digits)
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Gets a display name for card brand
 * @param brand - The brand code from API
 * @returns Display name
 */
export function getCardBrandDisplayName(brand: string): string {
  const brandMap: Record<string, string> = {
    'visa': 'Visa',
    'mastercard': 'Mastercard',
    'master-card': 'Mastercard',
    'american-express': 'American Express',
    'amex': 'American Express',
    'discover': 'Discover',
    'diners': 'Diners Club',
    'jcb': 'JCB',
    'carnet': 'Carnet'
  };

  return brandMap[brand.toLowerCase()] || brand;
}

/**
 * Formats expiration month/year for display
 * @param month - Month (1-12 or 01-12)
 * @param year - Full year (e.g., 2025)
 * @returns Formatted expiration (e.g., "12/25")
 */
export function formatExpirationDisplay(month: string | number, year: number): string {
  const monthStr = String(month).padStart(2, '0');
  const yearStr = String(year).slice(-2);
  return `${monthStr}/${yearStr}`;
}

/**
 * Gets card type from brand (for API submission)
 * @param brand - The detected card brand
 * @returns Card type code
 */
export function getCardTypeCode(brand: string): string {
  const brandLower = brand.toLowerCase();

  if (brandLower.includes('amex') || brandLower.includes('american')) {
    return 'credit_card';
  }

  // Default to credit_card, can be overridden by BIN verification
  return 'credit_card';
}

/**
 * Formats currency amount for display
 * @param amount - The amount
 * @param currency - Currency code (default MXN)
 * @returns Formatted amount (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
