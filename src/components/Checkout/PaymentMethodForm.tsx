'use client'

import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { CustomInput, CheckBox, Button } from '@t1-org/t1components';
import { CheckoutFormData } from '@/interfaces/checkout';

const imgVisaLogotipo = "http://localhost:3845/assets/5b76bbfd14fac2c22325e24d069b07bfc030e752.svg";
const imgMastercard = "http://localhost:3845/assets/df211b8720bf4ae94cae7077edd06adb88c15539.svg";
const imgAmex = "http://localhost:3845/assets/ae916c338cf13a5d492410be8ba77a52f2d0c26e.svg";
const imgCarnet = "http://localhost:3845/assets/90bfd2f7ad87febe0e3d819ed060d5e8b5801e92.svg";
const imgT1PagosLogo1 = "http://localhost:3845/assets/fc41d224a9a72949bf86d07175b06f3dfa9406db.svg";
const imgT1PagosLogo2 = "http://localhost:3845/assets/44847f9286a0f3427e74497bb9c4cedb55d38990.svg";

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

  const handleCardNumberChange = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 16);
  };

  const handleExpirationChange = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const handleCVVChange = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  return (
    <div className="flex flex-col h-[655px] items-center justify-between w-[400px]">
      <div className="flex flex-col gap-[32px] items-end justify-end w-full">
        <div className="flex flex-col gap-[15px] items-start w-full">
          <p className="font-['Manrope'] font-semibold leading-normal text-[#4c4c4c] text-[20px] text-nowrap whitespace-pre">
            Método de pago
          </p>
        </div>

        <div className="flex flex-col gap-[20px] items-start w-full">
          <div className="flex flex-wrap gap-[20px] items-start w-full">
            <div className="flex flex-col gap-[16px] grow items-start">
              {/* Card Number Section */}
              <div className="flex flex-col gap-[15px] items-start justify-end w-full">
                <div className="relative w-full">
                  <Controller
                    name="cardNumber"
                    control={control}
                    rules={{
                      required: 'Requerido',
                      minLength: { value: 16, message: 'Deben ser 16 dígitos' },
                      maxLength: { value: 16, message: 'Deben ser 16 dígitos' }
                    }}
                    render={({ field: { onChange, value, ...rest } }) => (
                      <CustomInput
                        {...rest}
                        label="Datos de tarjeta"
                        placeholder="0000 0000 0000 0000"
                        value={value}
                        onChange={(e) => onChange(handleCardNumberChange(e.target.value))}
                        fullWidth
                        textFieldProps={{
                          error: Boolean(errors.cardNumber),
                          helperText: errors.cardNumber?.message || ' '
                        }}
                      />
                    )}
                  />

                  {/* Card Logos */}
                  <div className="absolute right-[10px] top-[32px] flex gap-[3.2px] items-center">
                    <div className="bg-white border-[#cccccc] border-[0.32px] border-solid h-[16px] rounded-[1.6px] w-[21.6px] flex items-center justify-center">
                      <img alt="Visa" className="h-[11.2px] w-[18.4px]" src={imgVisaLogotipo} />
                    </div>
                    <div className="bg-[#252525] border-[#252525] border-[0.32px] border-solid h-[16px] rounded-[1.6px] w-[21.6px] flex items-center justify-center overflow-hidden">
                      <img alt="Mastercard" className="h-[7.2px] w-[12.4px]" src={imgMastercard} />
                    </div>
                    <div className="h-[16px] w-[21.988px]">
                      <img alt="American Express" className="h-full w-full" src={imgAmex} />
                    </div>
                    <div className="bg-white border-[#dbdbdb] border-[0.4px] border-solid h-[16px] rounded-[1.6px] w-[21.6px] flex items-center justify-center">
                      <img alt="Carnet" className="h-[10.399px] w-[18.838px]" src={imgCarnet} />
                    </div>
                  </div>
                </div>

                {/* Expiration and CVV */}
                <div className="flex gap-[10px] items-start w-full">
                  <div className="flex-1">
                    <Controller
                      name="expirationDate"
                      control={control}
                      rules={{
                        required: 'Requerido',
                        minLength: { value: 4, message: 'Deben ser 4 dígitos' },
                        maxLength: { value: 4, message: 'Deben ser 4 dígitos' }
                      }}
                      render={({ field: { onChange, value, ...rest } }) => (
                        <CustomInput
                          {...rest}
                          placeholder="MM/AA"
                          value={value}
                          onChange={(e) => onChange(handleExpirationChange(e.target.value))}
                          fullWidth
                          textFieldProps={{
                            error: Boolean(errors.expirationDate),
                            helperText: errors.expirationDate?.message || ' '
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Controller
                      name="cvv"
                      control={control}
                      rules={{
                        required: 'Requerido',
                        minLength: { value: 3, message: 'Mínimo 3 dígitos' },
                        maxLength: { value: 4, message: 'Máximo 4 dígitos' }
                      }}
                      render={({ field: { onChange, value, ...rest } }) => (
                        <CustomInput
                          {...rest}
                          placeholder="CVV"
                          value={value}
                          onChange={(e) => onChange(handleCVVChange(e.target.value))}
                          fullWidth
                          textFieldProps={{
                            error: Boolean(errors.cvv),
                            helperText: errors.cvv?.message || ' '
                          }}
                        />
                      )}
                    />

                    {/* CVV Icon */}
                    <div className="absolute right-[10px] top-[9px]">
                      <div className="border border-[#4c4c4c] border-solid h-[16.365px] rounded-[3px] w-[24.807px] relative">
                        <div className="bg-[#4c4c4c] h-[3.096px] w-[23.852px] absolute left-[0.48px] top-[3.98px]" />
                        <p className="font-['Manrope'] font-semibold text-[#4c4c4c] text-[6px] absolute left-[12.17px] top-[11.01px] translate-y-[-50%]">
                          123
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <Controller
                name="fullName"
                control={control}
                rules={{
                  required: 'Requerido'
                }}
                render={({ field }) => (
                  <CustomInput
                    {...field}
                    label="Nombre completo"
                    placeholder=""
                    fullWidth
                    textFieldProps={{
                      error: Boolean(errors.fullName),
                      helperText: errors.fullName?.message || ' '
                    }}
                  />
                )}
              />
            </div>
          </div>

          {/* Billing Info Checkbox */}
          <div className="flex flex-col gap-[15px] items-start w-full">
            <div className="flex gap-[6px] items-center">
              <Controller
                name="addBillingInfo"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <>
                    <CheckBox
                      checked={value}
                      onChange={(_, checked) => onChange(checked)}
                    />
                    <p className="font-['Manrope'] font-normal leading-normal text-[14px] text-[#4c4c4c] text-nowrap whitespace-pre">
                      Añadir datos de facturación
                    </p>
                  </>
                )}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col gap-[12px] items-start w-full">
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
          <p className="font-['Manrope'] font-normal leading-normal text-[#4c4c4c] text-[11px] text-center w-full">
            Al suscribirte aceptas los términos y condiciones de pago establecidos por T1tienda.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-[8px] items-center w-[380px]">
        <div className="flex gap-px items-end">
          <p className="font-['Manrope'] font-medium leading-normal text-[#828282] text-[10px] text-center text-nowrap whitespace-pre">
            Con tecnología de
          </p>
          <div className="h-[15px] overflow-clip w-[43.571px] relative flex items-center">
            <div className="h-[15px] w-[15.357px] overflow-clip">
              <img alt="" className="block max-w-none h-full" src={imgT1PagosLogo1} />
            </div>
            <img alt="" className="h-[7.1px] ml-[-1px]" src={imgT1PagosLogo2} />
          </div>
        </div>
        <div className="flex font-['Manrope'] font-bold gap-[16px] items-center justify-center leading-normal text-[10px] text-center text-nowrap whitespace-pre">
          <p className="text-[#4c4c4c]">
            Términos y condiciones
          </p>
          <p className="text-[#c3c3c3]">
            |
          </p>
          <p className="text-[#4c4c4c]">
            Políticas de privacidad
          </p>
        </div>
      </div>
    </div>
  );
}
