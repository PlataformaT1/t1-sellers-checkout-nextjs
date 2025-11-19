'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Control, Controller, FieldErrors, useWatch } from 'react-hook-form';
import { MenuItem, Select } from '@mui/material';
import { CustomInput, CheckBox, Button } from '@t1-org/t1components';
import { CheckoutFormData, SavedCard } from '@interfaces/checkout';
import { MappedBillingInfoI } from '@interfaces/invoice';
import VisaIcon from 'assets/checkout/visa-icon.svg';
import MasterIcon from 'assets/checkout/master-icon.svg';
import AmexIcon from 'assets/checkout/amex-icon.svg';
import CardIcon from 'assets/checkout/card-icon.svg';
import CarnetIcon from 'assets/checkout/carnet-icon.svg';
import PaymentsIcon from 'assets/checkout/payments-icon.svg';
import Image from 'next/image';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Skeleton } from '@mui/material';
import valid from 'card-validator';
import type { CardNumberVerification } from 'card-validator/dist/card-number';
import { getRegimenesFiscales, getUsosCFDI, type RegimenFiscal, type UsoCFDI } from '@services/commonsService';

interface SavedPaymentMethodFormProps {
  control: Control<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  isValid: boolean;
  isPending: boolean;
  isDisabled?: boolean;
  isSubscriptionChange?: boolean;
  isFiscalDataLoading?: boolean;
  isPaymentCardsLoading?: boolean;
  onSubmit: () => void;
  savedCards: SavedCard[];
  savedBillingInfo: MappedBillingInfoI | null;
}

export default function SavedPaymentMethodForm({
  control,
  errors,
  isValid,
  isPending,
  isDisabled = false,
  isSubscriptionChange = false,
  isFiscalDataLoading = false,
  isPaymentCardsLoading = false,
  onSubmit,
  savedCards,
  savedBillingInfo
}: SavedPaymentMethodFormProps) {

  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [cardValidation, setCardValidation] = useState<CardNumberVerification | null>(null);

  // State for SAT catalogs
  const [rfcValue, setRfcValue] = useState('');
  const [personaType, setPersonaType] = useState<'FISICA' | 'MORAL' | null>(null);
  const [regimenesFiscales, setRegimenesFiscales] = useState<RegimenFiscal[]>([]);
  const [usosCFDI, setUsosCFDI] = useState<UsoCFDI[]>([]);
  const [loadingRegimenes, setLoadingRegimenes] = useState(false);
  const [loadingUsos, setLoadingUsos] = useState(false);
  const rfcDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Automatically show new card form when no saved cards are available
  useEffect(() => {
    if (!isPaymentCardsLoading) {
      setShowNewCardForm(savedCards.length === 0);
    }
  }, [savedCards.length, isPaymentCardsLoading]);

  // Reset card validation when switching back to saved cards
  useEffect(() => {
    if (!showNewCardForm) {
      setCardValidation(null);
    }
  }, [showNewCardForm]);

  // Validate card number immediately (card-validator is fast)
  const validateCardNumber = (value: string) => {
    if (value.length >= 4) {
      const validation = valid.number(value);
      if (validation && validation.card) {
        setCardValidation(validation);
      } else {
        setCardValidation(null);
      }
    } else {
      setCardValidation(null);
    }
  };

  // Watch taxRegime field value
  const taxRegimeValue = useWatch({ control, name: 'taxRegime' });

  // Debounced RFC validation to determine persona type and fetch regimenes
  useEffect(() => {
    // Clear existing timer
    if (rfcDebounceTimerRef.current) {
      clearTimeout(rfcDebounceTimerRef.current);
    }

    // Set new timer
    rfcDebounceTimerRef.current = setTimeout(async () => {
      if (rfcValue.length === 12 || rfcValue.length === 13) {
        const persona: 'FISICA' | 'MORAL' = rfcValue.length === 13 ? 'FISICA' : 'MORAL';
        setPersonaType(persona);

        // Fetch regimenes fiscales for this persona type
        setLoadingRegimenes(true);
        const response = await getRegimenesFiscales(persona);
        if (response?.data?.data) {
          setRegimenesFiscales(response.data.data);
        }
        setLoadingRegimenes(false);
      } else {
        setPersonaType(null);
        setRegimenesFiscales([]);
        setUsosCFDI([]);
      }
    }, 500);

    // Cleanup
    return () => {
      if (rfcDebounceTimerRef.current) {
        clearTimeout(rfcDebounceTimerRef.current);
      }
    };
  }, [rfcValue]);

  // Fetch usos CFDI when regimen changes
  useEffect(() => {
    if (personaType && taxRegimeValue) {
      setLoadingUsos(true);
      getUsosCFDI(personaType, taxRegimeValue).then(response => {
        if (response?.data?.data) {
          setUsosCFDI(response.data.data);
        }
        setLoadingUsos(false);
      });
    } else {
      setUsosCFDI([]);
    }
  }, [personaType, taxRegimeValue]);

  const getCardIcon = (brand: 'visa' | 'mastercard' | 'amex') => {
    switch (brand) {
      case 'visa':
        return VisaIcon;
      case 'mastercard':
        return MasterIcon;
      case 'amex':
        return AmexIcon;
      default:
        return VisaIcon;
    }
  };

  // Map card validator types to our icons
  const getCardIconByType = (type: string) => {
    switch (type) {
      case 'visa':
        return VisaIcon;
      case 'mastercard':
        return MasterIcon;
      case 'american-express':
        return AmexIcon;
      default:
        return null;
    }
  };

  // All card logos to show when no card detected
  const allCardLogos = [VisaIcon, MasterIcon, AmexIcon, CarnetIcon];

  // Format card number with spaces every 4 digits (or Amex format: 4-6-5)
  const formatCardNumber = (value: string) => {
    const isAmex = cardValidation?.card?.type === 'american-express';
    const maxLength = isAmex ? 15 : 16;
    const cleaned = value.replace(/\D/g, '').slice(0, maxLength);

    if (isAmex) {
      // Format as 4-6-5 for American Express
      if (cleaned.length <= 4) return cleaned;
      if (cleaned.length <= 10) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 10)} ${cleaned.slice(10)}`;
    } else {
      // Format as 4-4-4-4 for other cards
      const groups = cleaned.match(/.{1,4}/g);
      return groups ? groups.join(' ') : cleaned;
    }
  };

  const handleCardNumberChange = (value: string) => {
    const maxLength = cardValidation?.card?.type === 'american-express' ? 15 : 16;
    const cleaned = value.replace(/\D/g, '').slice(0, maxLength);
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
    let cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length === 1 && cleaned !== '0' && cleaned !== '1') {
      cleaned = '0' + cleaned;
    }
    return cleaned;
  };

  const handleCVVChange = (value: string) => {
    // American Express uses 4-digit CID, others use 3-digit CVV
    const maxLength = cardValidation?.card?.type === 'american-express' ? 4 : 3;
    const cleaned = value.replace(/\D/g, '').slice(0, maxLength);
    return cleaned;
  };

  const handlePreventPlusMinusKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  return (
    <div className="content-stretch flex flex-col lg:h-[655px] items-center justify-between relative w-full lg:w-[400px]">
      <div className="content-stretch flex flex-col gap-[25px] items-center justify-end relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[15px] items-start relative shrink-0 w-full">
          <p className="font-semibold leading-[normal] relative shrink-0 text-[#4c4c4c] text-[20px] text-nowrap whitespace-pre">
            Método de pago
          </p>
        </div>

        <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
          {/* Header - show different text based on state */}
          {isPaymentCardsLoading ? (
            /* Show skeleton while loading payment cards */
            <div className="bg-white content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              <Skeleton variant="text" width={220} height={20} />
              <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: '10px' }} />
            </div>
          ) : showNewCardForm ? (
            <div className="content-stretch flex gap-[20px] items-start leading-[normal] relative shrink-0 text-[14px] text-[#4c4c4c] w-full">
              <p className="basis-0 font-semibold grow min-h-px min-w-px relative shrink-0 whitespace-pre-wrap">
                Agregar  nueva tarjeta
              </p>
              {savedCards.length > 0 && (
                <p
                  onClick={() => setShowNewCardForm(false)}
                  className="font-bold relative shrink-0 text-nowrap whitespace-pre cursor-pointer"
                >
                  Cancelar
                </p>
              )}
            </div>
          ) : (
            /* Saved Card Selector */
            <div className="bg-white content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex gap-[6px] items-end relative shrink-0">
                <p className="font-semibold leading-[normal] relative shrink-0 text-[#4c4c4c] text-[12px] text-nowrap whitespace-pre">
                  Selecciona o agrega un método de pago
                </p>
              </div>

              <Controller
                name="savedCardId"
                control={control}
                rules={{
                  required: showNewCardForm ? false : 'Selecciona un método de pago'
                }}
                render={({ field: { onChange, value } }) => {
                  return (
                    <Select
                      value={value || ''}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        if (selectedValue === 'new_card') {
                          setShowNewCardForm(true);
                          onChange('');
                        } else {
                          onChange(selectedValue);
                        }
                      }}
                      displayEmpty
                      IconComponent={KeyboardArrowDownIcon}
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <span className="text-[#9e9e9e] text-[12px] font-normal">
                              Selecciona o agrega un método de pago
                            </span>
                          );
                        }
                        const card = savedCards.find(c => c.id === selected);
                        if (!card) return null;
                        return (
                          <div className="flex items-center gap-[8px]">
                            <Image
                              alt={card.brand}
                              width={32}
                              height={20}
                              src={getCardIcon(card.brand)}
                              className="object-contain"
                            />
                            <p className="font-medium leading-[16px] text-[#4c4c4c] text-[12px] m-0">
                              •••• {card.last4}
                            </p>
                          </div>
                        );
                      }}
                      sx={{
                        width: '100%',
                        height: '50px',
                        minHeight: '50px',
                        borderRadius: '10px',
                        '& .MuiOutlinedInput-root': {
                          height: '50px',
                          minHeight: '50px'
                        },
                        '& .MuiSelect-select': {
                          height: '50px !important',
                          minHeight: '50px !important',
                          padding: '10px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          boxSizing: 'border-box'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e7e7e7',
                          borderRadius: '10px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e7e7e7'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e7e7e7',
                          borderWidth: '1px'
                        }
                      }}
                    >
                      {savedCards.map(card => (
                        <MenuItem
                          key={card.id}
                          value={card.id}
                          disabled={card.isExpired}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-[8px]">
                              <Image
                                alt={card.brand}
                                width={32}
                                height={20}
                                src={getCardIcon(card.brand)}
                                className="object-contain"
                              />
                              <p className={`font-medium leading-[16px] text-[12px] m-0 whitespace-nowrap ${
                                card.isExpired ? 'text-[#9e9e9e]' : 'text-[#4c4c4c]'
                              }`}>
                                •••• {card.last4}
                              </p>
                            </div>
                            <p className={`font-medium leading-[normal] text-[12px] text-right m-0 whitespace-nowrap ${
                              card.isExpired ? 'text-[#db362b]' : 'text-[#4c4c4c]'
                            }`}>
                              {card.isExpired ? 'Vencida' : `Vigencia ${card.expirationDate}`}
                            </p>
                          </div>
                        </MenuItem>
                      ))}
                      {savedCards.length > 0 && (
                        <MenuItem value="new_card">
                          <p className="font-semibold leading-[normal] text-[#4c4c4c] text-[12px] m-0">
                            + Agregar nueva tarjeta
                          </p>
                        </MenuItem>
                      )}
                    </Select>
                  );
                }}
              />
            </div>
          )}

          {/* New Card Form - show when "Agregar nueva tarjeta" is selected */}
          {showNewCardForm && !isPaymentCardsLoading && (
            <div className="content-start flex flex-wrap gap-[20px] items-start relative shrink-0 w-full">
              <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0">
                <div className="content-stretch flex flex-col gap-[15px] items-start justify-end relative shrink-0 w-full">
                  <div className="relative w-full">
                    <Controller
                      name="cardNumber"
                      control={control}
                      rules={{
                        required: showNewCardForm ? 'Requerido' : false,
                        validate: showNewCardForm ? {
                          isNumeric: (value) => !value || /^\d+$/.test(value) || 'Solo números',
                          length: (value) => {
                            if (!value) return true;
                            const expectedLength = cardValidation?.card?.type === 'american-express' ? 15 : 16;
                            return value.length === expectedLength || 'Número de tarjeta incompleto';
                          }
                        } : undefined
                      }}
                      render={({ field: { onChange, value } }) => (
                        <CustomInput
                          label="Datos de tarjeta"
                          textFieldProps={{
                            placeholder: "0000 0000 0000 0000",
                            value: formatCardNumber(value || ''),
                            onChange: (e) => {
                              const cleaned = handleCardNumberChange(e.target.value);
                              onChange(cleaned);
                              validateCardNumber(cleaned);
                            },
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

                    {/* Card Logos - Show detected card or all cards */}
                    <div className="absolute right-[10px] top-[32px] flex gap-[3.2px] items-center z-10 pointer-events-none">
                      {cardValidation?.card ? (
                        // Show only the detected card logo
                        getCardIconByType(cardValidation.card.type) && (
                          <Image
                            alt={cardValidation.card.type}
                            width={21}
                            height={16}
                            src={getCardIconByType(cardValidation.card.type)!}
                          />
                        )
                      ) : (
                        // Show all card logos
                        allCardLogos.map((logo, index) => (
                          <Image
                            key={index}
                            alt="card-type"
                            width={21}
                            height={16}
                            src={logo}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Expiration and CVV */}
                  <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full">
                    <div className="basis-0 content-stretch flex flex-col gap-[6px] grow items-start min-h-px min-w-px relative shrink-0">
                      <Controller
                        name="expirationDate"
                        control={control}
                        rules={{
                          required: showNewCardForm ? 'Requerido' : false,
                          validate: showNewCardForm ? {
                            isNumeric: (value) => !value || /^\d+$/.test(value) || 'Solo números',
                            length: (value) => !value || value.length === 4 || 'Fecha de vencimiento incompleta',
                            validMonth: (value) => {
                              if (value && value.length >= 2) {
                                const month = parseInt(value.slice(0, 2));
                                return (month >= 1 && month <= 12) || 'Mes inválido';
                              }
                              return true;
                            }
                          } : undefined
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
                            required: showNewCardForm ? 'Requerido' : false,
                            validate: showNewCardForm ? {
                              isNumeric: (value) => !value || /^\d+$/.test(value) || 'Solo números',
                              length: (value) => {
                                if (!value) return true;
                                const expectedLength = cardValidation?.card?.type === 'american-express' ? 4 : 3;
                                return value.length === expectedLength || 'CVV incompleto';
                              }
                            } : undefined
                          }}
                          render={({ field: { onChange, value } }) => (
                            <CustomInput
                              textFieldProps={{
                                placeholder: "CVV",
                                value: value || '',
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
                      required: showNewCardForm ? 'Requerido' : false
                    }}
                    render={({ field: { onChange, value } }) => (
                      <CustomInput
                        label="Nombre completo"
                        textFieldProps={{
                          placeholder: "",
                          value: value || '',
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
          )}

          {/* Billing Info Section */}
          <div className="content-stretch flex flex-col gap-[15px] items-start relative shrink-0 w-full">
            {savedBillingInfo ? (
              /* Display saved billing info - always show if it exists */
              <div className="content-stretch flex flex-col gap-[6px] items-start justify-center relative shrink-0">
                <p className="font-normal leading-[normal] relative shrink-0 text-[14px] text-[#4c4c4c] text-nowrap whitespace-pre">
                  Facturaremos tu plan a:
                </p>
                <p className="font-normal leading-[normal] relative shrink-0 text-[#4c4c4c] text-[14px]">
                  <span>{savedBillingInfo.razonSocial}</span>
                  <span>  •  RFC: {savedBillingInfo.rfc}</span>
                </p>
              </div>
            ) : isFiscalDataLoading ? (
              /* Show skeleton while loading fiscal data */
              <div className="content-stretch flex items-center relative shrink-0 leading-0">
                <Skeleton variant="text" width={180} height={40} />
              </div>
            ) : (
              /* Checkbox for adding billing info - only show if no saved billing info */
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
            )}

            {/* Billing Fields - Only show when checkbox is checked and no saved billing info */}
            {!savedBillingInfo && (
              <Controller
                name="addBillingInfo"
                control={control}
                render={({ field: { value: showBilling } }) => (
                  <>
                    {showBilling && (
                      <div className="box-border content-stretch flex flex-col gap-[10px] items-start md:pb-[10px] pt-0 px-0 relative shrink-0 w-full">
                      {/* Nombre o razón social */}
                      <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full">
                        <Controller
                          name="billingName"
                          control={control}
                          rules={{
                            required: showBilling ? 'Requerido' : false
                          }}
                          render={({ field: { onChange, value } }) => (
                            <CustomInput
                              textFieldProps={{
                                placeholder: "Nombre o razón social",
                                value: value || '',
                                onChange: onChange,
                                fullWidth: true,
                                error: Boolean(errors.billingName),
                                helperText: errors.billingName?.message,
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
                                    height: '35px',
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

                      {/* RFC */}
                      <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full">
                        <Controller
                          name="rfc"
                          control={control}
                          rules={{
                            required: showBilling ? 'Requerido' : false,
                            validate: showBilling ? {
                              length: (value) => !value || (value.length >= 12 && value.length <= 13) || 'RFC incompleto'
                            } : undefined
                          }}
                          render={({ field: { onChange, value } }) => (
                            <CustomInput
                              textFieldProps={{
                                placeholder: "RFC",
                                value: value || '',
                                onChange: (e) => {
                                  const upperValue = e.target.value.toUpperCase();
                                  onChange(upperValue);
                                  setRfcValue(upperValue);
                                },
                                fullWidth: true,
                                error: Boolean(errors.rfc),
                                helperText: errors.rfc?.message,
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
                                    height: '35px',
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

                      {/* Régimen fiscal & Código Postal */}
                      <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full">
                        <div className="basis-0 content-stretch flex flex-col grow items-start justify-center min-h-px min-w-px relative shrink-0">
                          <Controller
                            name="taxRegime"
                            control={control}
                            rules={{
                              required: showBilling ? 'Requerido' : false
                            }}
                            render={({ field: { onChange, value } }) => (
                              <Select
                                value={value || ''}
                                onChange={onChange}
                                displayEmpty
                                IconComponent={KeyboardArrowDownIcon}
                                error={Boolean(errors.taxRegime)}
                                disabled={loadingRegimenes || regimenesFiscales.length === 0}
                                sx={{
                                  width: '100%',
                                  height: '35px',
                                  '& .MuiSelect-select': {
                                    padding: '0 10px',
                                    fontSize: '12px',
                                    color: '#4c4c4c'
                                  },
                                  '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#db362b'
                                  }
                                }}
                              >
                                <MenuItem value="">
                                  {loadingRegimenes ? 'Cargando...' : 'Régimen fiscal'}
                                </MenuItem>
                                {regimenesFiscales.map((regimen) => (
                                  <MenuItem key={regimen.clave} value={regimen.clave}>
                                    {regimen.clave} - {regimen.descripcion}
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          />
                        </div>

                        <div className="basis-0 content-stretch flex flex-col grow items-start justify-center min-h-px min-w-px relative shrink-0">
                          <Controller
                            name="postalCode"
                            control={control}
                            rules={{
                              required: showBilling ? 'Requerido' : false,
                              validate: showBilling ? {
                                isNumeric: (value) => !value || /^\d+$/.test(value) || 'Solo números',
                                length: (value) => !value || value.length === 5 || 'Código postal debe contener 5 dígitos'
                              } : undefined
                            }}
                            render={({ field: { onChange, value } }) => (
                              <CustomInput
                                textFieldProps={{
                                  placeholder: "Código Postal",
                                  value: value || '',
                                  onChange: (e) => {
                                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 5);
                                    onChange(cleaned);
                                  },
                                  fullWidth: true,
                                  inputMode: 'numeric',
                                  error: Boolean(errors.postalCode),
                                  helperText: errors.postalCode?.message,
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
                                      height: '35px',
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

                      {/* Uso de CFDI */}
                      <div className="content-stretch flex flex-col items-start justify-center min-w-[290px] relative shrink-0 w-full">
                        <Controller
                          name="cfdiUse"
                          control={control}
                          rules={{
                            required: showBilling ? 'Requerido' : false
                          }}
                          render={({ field: { onChange, value } }) => (
                            <Select
                              value={value || ''}
                              onChange={onChange}
                              displayEmpty
                              IconComponent={KeyboardArrowDownIcon}
                              error={Boolean(errors.cfdiUse)}
                              disabled={loadingUsos || usosCFDI.length === 0}
                              sx={{
                                width: '100%',
                                height: '35px',
                                '& .MuiSelect-select': {
                                  padding: '0 15px',
                                  fontSize: '12px',
                                  color: '#4c4c4c'
                                },
                                '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#db362b'
                                }
                              }}
                            >
                              <MenuItem value="">
                                {loadingUsos ? 'Cargando...' : 'Uso de CFDI'}
                              </MenuItem>
                              {usosCFDI.map((uso) => (
                                <MenuItem key={uso.clave} value={uso.clave}>
                                  {uso.clave} - {uso.descripcion}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                    )}
                  </>
                )}
              />
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
          <Button
            onClick={onSubmit}
            disabled={!isValid || isPending || isDisabled}
            loading={isPending}
            className="!w-full !h-[36px]"
            style={{
              background: !isValid || isPending || isDisabled
                ? 'linear-gradient(90deg, rgb(241, 176, 169) 0%, rgb(241, 176, 169) 100%)'
                : undefined
            }}
          >
            {isSubscriptionChange ? 'Actualizar' : 'Suscribirse'}
          </Button>
          {isDisabled && (
            <p className="font-normal leading-[normal] relative shrink-0 text-[#4c4c4c] text-[11px] text-center w-full">
              Ya tienes este plan activo con este método de pago
            </p>
          )}
          {!isDisabled && (
            <p className="font-normal leading-[normal] relative shrink-0 text-[#4c4c4c] text-[11px] text-center w-full">
              Al suscribirte aceptas los términos y condiciones de pago establecidos por T1tienda.
            </p>
          )}
        </div>
      </div>

      {/* Footer - Desktop only */}
      <div className="hidden lg:flex content-stretch flex-col gap-[8px] items-center relative shrink-0 w-full lg:w-[380px]">
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
