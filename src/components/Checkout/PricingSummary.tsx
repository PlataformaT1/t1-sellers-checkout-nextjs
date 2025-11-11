import React from 'react';
import T1StoreLogo from './T1StoreLogo';
import { PlanData } from '@/interfaces/checkout';

const imgHr = "http://localhost:3845/assets/37bed75e02f5b46466d7b3e5774137f405e8096b.svg";

interface PricingSummaryProps {
  planData: PlanData;
}

export default function PricingSummary({ planData }: PricingSummaryProps) {
  return (
    <div className="flex flex-col gap-[35px] items-start w-full">
      <T1StoreLogo />

      <div className="box-border flex flex-col gap-[15px] items-start pb-[11px] pt-0 px-0 w-full max-w-[358px]">
        <div className="flex gap-[15px] items-start w-full">
          <div className="flex flex-col gap-[4px] items-start grow">
            <p className="font-['Manrope'] font-normal leading-normal text-[16px] text-black text-nowrap whitespace-pre">
              {planData.name}
            </p>
            <div className="flex gap-[15px] items-center w-full">
              <p className="font-['Manrope'] font-bold leading-normal text-[#4c4c4c] text-[48px] text-nowrap whitespace-pre">
                ${planData.price.toFixed(2)}
              </p>
              <div className="flex flex-col h-[50px] justify-end font-['Manrope'] font-medium text-[20px] text-[#4c4c4c]">
                <p className="leading-normal">{planData.currency} / {planData.period}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[8px] items-start w-full max-w-[443px]">
        <div className="h-px w-full">
          <img alt="" className="block max-w-none w-full h-full" src={imgHr} />
        </div>
        <div className="flex items-center justify-between w-full text-[#4c4c4c] text-[12px]">
          <p className="font-['Manrope'] font-normal leading-normal">
            Subtotal
          </p>
          <p className="font-['Manrope'] font-semibold leading-[30px] text-right">
            ${planData.subtotal.toFixed(2)}
          </p>
        </div>
        <div className="h-px w-full">
          <img alt="" className="block max-w-none w-full h-full" src={imgHr} />
        </div>
        <div className="flex items-center justify-between w-full text-[#4c4c4c] text-[12px]">
          <p className="font-['Manrope'] font-normal leading-normal">
            Impuestos (IVA)
          </p>
          <p className="font-['Manrope'] font-semibold leading-[30px] text-right">
            ${planData.tax.toFixed(2)}
          </p>
        </div>
        <div className="h-px w-full">
          <img alt="" className="block max-w-none w-full h-full" src={imgHr} />
        </div>
        <div className="flex font-['Manrope'] font-bold items-center justify-between w-full text-[#4c4c4c] text-[14px]">
          <p className="leading-normal">
            Total
          </p>
          <p className="leading-[30px] text-right">
            ${planData.total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
