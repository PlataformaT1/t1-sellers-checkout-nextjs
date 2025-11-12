import dayjs from 'dayjs';
import { CardExpiryCheck } from '@interfaces/paymentMethods';

/**
 * Validates a credit card number using the Luhn algorithm
 * @param cardNumber - The card number to validate (digits only)
 * @returns true if valid, false otherwise
 */
export function validateCardNumberLuhn(cardNumber: string): boolean {
  // Remove any non-digit characters
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  // Loop through digits from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validates card number format and length
 * @param cardNumber - The card number (can include spaces)
 * @returns true if valid format
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');
  return /^\d{13,19}$/.test(cleaned) && validateCardNumberLuhn(cleaned);
}

/**
 * Validates expiration date format (MM/YY)
 * @param expiration - The expiration date string
 * @returns true if valid format and not expired
 */
export function validateExpirationDate(expiration: string): boolean {
  const cleaned = expiration.replace(/\D/g, '');

  if (cleaned.length !== 4) {
    return false;
  }

  const month = parseInt(cleaned.slice(0, 2), 10);
  const year = parseInt(`20${cleaned.slice(2)}`, 10);

  // Check valid month
  if (month < 1 || month > 12) {
    return false;
  }

  // Check not expired
  const now = dayjs();
  const expiryDate = dayjs().year(year).month(month - 1).endOf('month');

  return expiryDate.isAfter(now);
}

/**
 * Validates CVV format
 * @param cvv - The CVV code
 * @param cardType - Optional card type (amex has 4 digits)
 * @returns true if valid format
 */
export function validateCVV(cvv: string, cardType?: string): boolean {
  const cleaned = cvv.replace(/\D/g, '');
  const isAmex = cardType?.toLowerCase().includes('amex') || cardType?.toLowerCase().includes('american');

  if (isAmex) {
    return /^\d{4}$/.test(cleaned);
  }

  return /^\d{3,4}$/.test(cleaned);
}

/**
 * Checks if a card is expired or expiring soon
 * @param expirationMonth - Month as string (1-12 or 01-12)
 * @param expirationYear - Full year as number (e.g., 2025)
 * @returns Object with expired status and days left
 */
export function checkCardExpiry(expirationMonth: string, expirationYear: number): CardExpiryCheck {
  const now = dayjs();
  const month = parseInt(expirationMonth, 10);
  const expiryDate = dayjs().year(expirationYear).month(month - 1).endOf('month');

  const expired = expiryDate.isBefore(now);
  const daysLeft = expiryDate.diff(now, 'day');
  const almostExpired = daysLeft <= 30 && daysLeft > 0;

  return {
    expired,
    daysLeft: Math.max(0, daysLeft),
    almostExpired
  };
}

/**
 * Validates ZIP code format (5 digits for Mexico)
 * @param zip - The ZIP code
 * @returns true if valid format
 */
export function validateZipCode(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

/**
 * Validates phone number format
 * @param phone - The phone number
 * @returns true if valid format (10 digits)
 */
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^\d{10}$/.test(cleaned);
}

/**
 * Validates full name (at least first and last name)
 * @param name - The full name
 * @returns true if contains at least 2 words
 */
export function validateFullName(name: string): boolean {
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/);
  return words.length >= 2 && words.every(word => word.length > 0);
}

/**
 * Gets the card brand from the card number
 * @param cardNumber - The card number (can include spaces)
 * @returns The card brand or 'unknown'
 */
export function getCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');

  if (/^4/.test(cleaned)) {
    return 'visa';
  }

  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
    return 'mastercard';
  }

  if (/^3[47]/.test(cleaned)) {
    return 'american-express';
  }

  if (/^6(?:011|5)/.test(cleaned)) {
    return 'discover';
  }

  return 'unknown';
}

/**
 * Validates complete credit card form data
 * @param data - The form data to validate
 * @returns Object with validation results
 */
export function validateCreditCardForm(data: {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  fullName: string;
  zip: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!validateCardNumber(data.cardNumber)) {
    errors.cardNumber = 'Número de tarjeta inválido';
  }

  if (!validateExpirationDate(data.expirationDate)) {
    errors.expirationDate = 'Fecha de vencimiento inválida o expirada';
  }

  const cardBrand = getCardBrand(data.cardNumber);
  if (!validateCVV(data.cvv, cardBrand)) {
    errors.cvv = 'CVV inválido';
  }

  if (!validateFullName(data.fullName)) {
    errors.fullName = 'Ingresa nombre y apellido';
  }

  if (!validateZipCode(data.zip)) {
    errors.zip = 'Código postal inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
