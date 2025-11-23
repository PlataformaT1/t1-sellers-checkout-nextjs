'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@t1-org/t1components';
import T1StoreLogo from './T1StoreLogo';
import { Divider } from '@mui/material';
import { numberFormat } from '@utils/utils';
import CheckCircleIcon from '@assets/icons/check-circle-fill.svg';
import PaymentsIcon from 'assets/checkout/payments-icon.svg';
import VisaIcon from 'assets/checkout/visa-icon.svg';
import MasterIcon from 'assets/checkout/master-icon.svg';
import AmexIcon from 'assets/checkout/amex-icon.svg';
import CarnetIcon from 'assets/checkout/carnet-icon.svg';

interface SuccessViewProps {
  planName: string;
  subtotal: number;
  tax: number;
  total: number;
  cardBrand: string;
  cardLast4: string;
  isUpdate: boolean;
  onContinue: () => void;
}

// Mapping of card brands to icons
const cardBrandIcons: Record<string, any> = {
  'visa': VisaIcon,
  'mastercard': MasterIcon,
  'master-card': MasterIcon,
  'american-express': AmexIcon,
  'amex': AmexIcon,
  'carnet': CarnetIcon
};

export default function SuccessView({
  planName,
  subtotal,
  tax,
  total,
  cardBrand,
  cardLast4,
  isUpdate,
  onContinue
}: SuccessViewProps) {
  const cardIcon = cardBrandIcons[cardBrand.toLowerCase()] || MasterIcon;
  const successMessage = isUpdate
    ? `¡Se actualizó tu suscripción a ${planName}!`
    : `¡Se completó tu suscripción a ${planName}!`;

  return (
    <div className="bg-white min-h-screen w-full flex flex-col items-center justify-start lg:justify-center relative px-[14px] lg:px-0 py-[20px] lg:py-0">
      {/* Logo */}
      <div className="flex md:justify-center mb-[30px] lg:mb-0 lg:absolute lg:top-[60px] lg:left-1/2 lg:-translate-x-1/2 w-full">
        <T1StoreLogo />
      </div>

      {/* Main content card */}
      <div className="bg-white lg:rounded-[10px] lg:shadow-[0px_0px_5px_1px_rgba(0,0,0,0.1)] w-full lg:w-[557px] max-w-full lg:max-w-[90%] p-0 lg:p-8 flex flex-col items-center gap-[15px] md:gap-[15px]">
        {/* Success icon */}
        <div className="w-[45px] h-[45px]">
          <Image
            src={CheckCircleIcon}
            alt="Success"
            width={45}
            height={45}
          />
        </div>

        {/* Success message */}
        <p className="font-bold text-[20px] text-[#4c4c4c] text-center leading-normal max-w-[274px] lg:max-w-none">
          {successMessage}
        </p>

        {/* Payment summary box */}
        <div className="bg-white border border-[#e7e7e7] rounded-[10px] w-full max-w-[330px] lg:max-w-[460px] px-[16px] lg:px-[23px] py-[12px] lg:py-[18px] flex flex-col gap-[6px] lg:gap-[10px] mt-[44px]">
          {/* Payment method */}
          <div className="flex items-center justify-between text-[12px] lg:text-[14px] text-[#4c4c4c] w-full">
            <p className="font-normal leading-[normal]">Método de pago</p>
            <div className="flex items-center gap-[10px]">
              <Image
                src={cardIcon}
                alt={cardBrand}
                width={25}
                height={16}
              />
              <p className="font-semibold leading-[30px] text-right whitespace-nowrap">**** {cardLast4}</p>
            </div>
          </div>

          <Divider sx={{ borderColor: '#e7e7e7' }} />

          {/* Subtotal */}
          <div className="flex items-center justify-between text-[12px] lg:text-[14px] text-[#4c4c4c] w-full">
            <p className="font-normal leading-[normal]">Subtotal</p>
            <p className="font-semibold leading-[30px] text-right whitespace-nowrap">{numberFormat(subtotal)}</p>
          </div>

          <Divider sx={{ borderColor: '#e7e7e7' }} />

          {/* Tax */}
          <div className="flex items-center justify-between text-[12px] lg:text-[14px] text-[#4c4c4c] w-full">
            <p className="font-normal leading-[normal]">Impuestos (IVA)</p>
            <p className="font-semibold leading-[30px] text-right whitespace-nowrap">{numberFormat(tax)}</p>
          </div>

          <Divider sx={{ borderColor: '#e7e7e7' }} />

          {/* Total */}
          <div className="flex items-center justify-between text-[14px] text-[#4c4c4c] font-bold w-full">
            <p className="leading-[normal]">Total</p>
            <p className="leading-[30px] text-right whitespace-nowrap">{numberFormat(total)}</p>
          </div>
        </div>
      </div>

      {/* Continue button - outside card */}
      <Button
        onClick={onContinue}
        variant="text"
        className="!mt-[63px] md:!mt-[30px] !text-[14px]"
      >
        Volver a T1tienda
      </Button>

      {/* Footer */}
      <div className="absolute bottom-8 flex gap-1 items-center justify-center">
        <p className="font-normal text-[14px] text-[#4c4c4c]">Powered by</p>
        <Image
          src={PaymentsIcon}
          alt="T1 Pagos"
          width={67}
          height={21}
        />
      </div>
    </div>
  );
}
