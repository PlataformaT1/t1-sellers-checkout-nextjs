'use client'

import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { CustomInput, CheckBox, Button } from '@t1-org/t1components';
import { CheckoutFormData } from '@interfaces/checkout';
import CardIcon from 'assets/checkout/card-icon.svg';
import VisaIcon from 'assets/checkout/visa-icon.svg';
import MasterIcon from 'assets/checkout/master-icon.svg';
import AmexIcon from 'assets/checkout/amex-icon.svg';
import CarnetIcon from 'assets/checkout/carnet-icon.svg';
import PaymentsIcon from 'assets/checkout/payments-icon.svg';
import Image from 'next/image';

interface PaymentMethodFormProps {
  control: Control<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  isValid: boolean;
  isPending: boolean;
  onSubmit: () => void;
}

export default function PaymentMethodForm({
  control,
  errors,
  isValid,
  isPending,
  onSubmit
}: PaymentMethodFormProps) {

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const handleCardNumberChange = (value: string) => {
    // Remove all non-numeric characters and limit to 16 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    return cleaned;
  };

  // Format expiration date as MM/YY
  const formatExpiration = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
  };

  const handleExpirationChange = (value: string) => {
    // Remove all non-numeric characters and limit to 4 digits
    let cleaned = value.replace(/\D/g, '').slice(0, 4);

    // If first digit is not 0 or 1, prepend 0 automatically
    if (cleaned.length === 1 && cleaned !== '0' && cleaned !== '1') {
      cleaned = '0' + cleaned;
    }

    return cleaned;
  };

  const handleCVVChange = (value: string) => {
    // Remove all non-numeric characters and limit to 4 digits (AMEX can have 4)
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    return cleaned;
  };

  // Prevent + and - keys in numeric inputs
  const handlePreventPlusMinusKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  return (
    <div className="content-stretch flex flex-col h-[655px] items-center justify-between relative w-[400px]">
      <div className="content-stretch flex flex-col gap-[32px] items-end justify-end relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[15px] items-start relative shrink-0 w-full">
          <p className="font-semibold leading-[normal] relative shrink-0 text-[#4c4c4c] text-[20px] text-nowrap whitespace-pre">
            Método de pago
          </p>
        </div>

        <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
          <div className="content-start flex flex-wrap gap-[20px] items-start relative shrink-0 w-full">
            <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0">
              {/* Card Number Section */}
              <div className="content-stretch flex flex-col gap-[15px] items-start justify-end relative shrink-0 w-full">
                <div className="relative w-full">
                  <Controller
                    name="cardNumber"
                    control={control}
                    rules={{
                      required: 'Requerido',
                      validate: {
                        isNumeric: (value) => !value || /^\d+$/.test(value) || 'Solo números',
                        length: (value) => !value || value.length === 16 || 'Número de tarjeta incompleto'
                      }
                    }}
                    render={({ field: { onChange, value } }) => (
                      <CustomInput
                        label="Datos de tarjeta"
                        textFieldProps={{
                          placeholder: "0000 0000 0000 0000",
                          value: formatCardNumber(value || ''),
                          onChange: (e) => onChange(handleCardNumberChange(e.target.value)),
                          onKeyDown: handlePreventPlusMinusKeys,
                          inputMode: 'numeric',
                          fullWidth: true,
                          error: Boolean(errors.cardNumber),
                          helperText: errors.cardNumber?.message,
                          FormHelperTextProps: {
                            sx: {
                              fontWeight: 300,
                              fontSize: '12px',
                              color: '#db362b',
                              marginTop: '6px',
                              marginLeft: 0
                            }
                          },
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#db362b'
                              }
                            }
                          }
                        }}
                      />
                    )}
                  />

                  {/* Card Logos */}
                  <div className="absolute right-[10px] top-[32px] flex gap-[3.2px] items-center z-10 pointer-events-none">
                    <Image alt="Visa" width={21} height={16} src={VisaIcon} />
                    <Image alt="Mastercard" width={21} height={16} src={MasterIcon} />
                    <Image alt="American Express" width={21} height={16} src={AmexIcon} />
                    <Image alt="Carnet" width={21} height={16} src={CarnetIcon} />
                  </div>
                </div>

                {/* Expiration and CVV */}
                <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full">
                  <div className="basis-0 content-stretch flex flex-col gap-[6px] grow items-start min-h-px min-w-px relative shrink-0">
                    <Controller
                      name="expirationDate"
                      control={control}
                      rules={{
                        required: 'Requerido',
                        validate: {
                          isNumeric: (value) => !value || /^\d+$/.test(value) || 'Solo números',
                          length: (value) => !value || value.length === 4 || 'Fecha de vencimiento incompleta',
                          validMonth: (value) => {
                            if (value && value.length >= 2) {
                              const month = parseInt(value.slice(0, 2));
                              return (month >= 1 && month <= 12) || 'Mes inválido';
                            }
                            return true;
                          }
                        }
                      }}
                      render={({ field: { onChange, value } }) => (
                        <CustomInput
                          textFieldProps={{
                            placeholder: "MM/AA",
                            value: formatExpiration(value || ''),
                            onChange: (e) => onChange(handleExpirationChange(e.target.value)),
                            onKeyDown: handlePreventPlusMinusKeys,
                            inputMode: 'numeric',
                            fullWidth: true,
                            error: Boolean(errors.expirationDate),
                            helperText: errors.expirationDate?.message,
                            FormHelperTextProps: {
                              sx: {
                                fontWeight: 300,
                                fontSize: '12px',
                                color: '#db362b',
                                marginTop: '6px',
                                marginLeft: 0
                              }
                            },
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#db362b'
                                }
                              }
                            }
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="basis-0 content-stretch flex flex-col gap-[6px] grow items-start min-h-px min-w-px relative shrink-0">
                    <div className="relative w-full">
                      <Controller
                        name="cvv"
                        control={control}
                        rules={{
                          required: 'Requerido',
                          validate: {
                            isNumeric: (value) => !value || /^\d+$/.test(value) || 'Solo números',
                            length: (value) => !value || (value.length === 3 || value.length === 4) || 'CVV incompleto'
                          }
                        }}
                        render={({ field: { onChange, value } }) => (
                          <CustomInput
                            textFieldProps={{
                              placeholder: "CVV",
                              value: value,
                              onChange: (e) => onChange(handleCVVChange(e.target.value)),
                              onKeyDown: handlePreventPlusMinusKeys,
                              inputMode: 'numeric',
                              fullWidth: true,
                              error: Boolean(errors.cvv),
                              helperText: errors.cvv?.message,
                              FormHelperTextProps: {
                                sx: {
                                  fontWeight: 300,
                                  fontSize: '12px',
                                  color: '#db362b',
                                  marginTop: '6px',
                                  marginLeft: 0
                                }
                              },
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#db362b'
                                  }
                                }
                              }
                            }}
                          />
                        )}
                      />

                      {/* CVV Icon */}
                      <div className="absolute right-[10px] top-[9px] pointer-events-none z-10">
                        <Image src={CardIcon} alt='card' width={26} height={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                <Controller
                  name="fullName"
                  control={control}
                  rules={{
                    required: 'Requerido'
                  }}
                  render={({ field: { onChange, value } }) => (
                    <CustomInput
                      label="Nombre completo"
                      textFieldProps={{
                        placeholder: "",
                        value: value,
                        onChange: onChange,
                        fullWidth: true,
                        error: Boolean(errors.fullName),
                        helperText: errors.fullName?.message,
                        FormHelperTextProps: {
                          sx: {
                            fontWeight: 300,
                            fontSize: '12px',
                            color: '#db362b',
                            marginTop: '6px',
                            marginLeft: 0
                          }
                        },
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#db362b'
                            }
                          }
                        }
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Billing Info Checkbox */}
          <div className="content-stretch flex flex-col gap-[15px] items-start relative shrink-0 w-full">
            <Controller
              name="addBillingInfo"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="content-stretch flex items-center relative shrink-0 ml-[-10px] leading-0">
                  <CheckBox
                    checked={value}
                    onChange={(_, checked) => onChange(checked)}
                    sx={{
                      margin: 0
                    }}
                  />
                  <p className="font-normal leading-[normal] relative shrink-0 text-[14px] text-[#4c4c4c] text-nowrap whitespace-pre m-0">
                    Añadir datos de facturación
                  </p>
                </div>
              )}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
          <Button
            onClick={onSubmit}
            disabled={!isValid || isPending}
            loading={isPending}
            className="!w-full !h-[36px]"
            style={{
              background: !isValid || isPending
                ? 'linear-gradient(90deg, rgb(241, 176, 169) 0%, rgb(241, 176, 169) 100%)'
                : undefined
            }}
          >
            Suscribirse
          </Button>
          <p className="font-normal leading-[normal] relative shrink-0 text-[#4c4c4c] text-[11px] text-center w-full">
            Al suscribirte aceptas los términos y condiciones de pago establecidos por T1tienda.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-[380px]">
        <div className="flex gap-[5px] items-center">
          <p className="font-medium leading-[normal] text-[#828282] text-[10px] text-nowrap m-0">
            Con tecnología de
          </p>
          <Image src={PaymentsIcon} alt='payments' width={43} height={15} />
        </div>
        <div className="content-stretch flex font-bold gap-[16px] items-center justify-center leading-[normal] relative shrink-0 text-[10px] text-center text-nowrap w-full whitespace-pre">
          <p className="relative shrink-0 text-[#4c4c4c] m-0">
            Términos y condiciones
          </p>
          <p className="relative shrink-0 text-[#c3c3c3] m-0">
            |
          </p>
          <p className="relative shrink-0 text-[#4c4c4c] m-0">
            Políticas de privacidad
          </p>
        </div>
      </div>
    </div>
  );
}
