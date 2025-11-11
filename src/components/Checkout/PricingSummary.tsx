import React from 'react';
import T1StoreLogo from './T1StoreLogo';
import { PlanData } from '@interfaces/checkout';

const imgHr = "http://localhost:3845/assets/37bed75e02f5b46466d7b3e5774137f405e8096b.svg";

interface PricingSummaryProps {
  planData: PlanData;
}

export default function PricingSummary({ planData }: PricingSummaryProps) {
  return (
    <div className="content-stretch flex flex-col gap-[35px] items-start relative shrink-0">
      <T1StoreLogo />

      <div className="box-border content-stretch flex flex-col gap-[15px] items-start pb-[11px] pt-0 px-0 relative shrink-0 w-[358px]">
        <div className="content-stretch flex gap-[15px] items-start relative shrink-0 w-full">
          <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start min-h-px min-w-px relative shrink-0">
            <p className="font-normal leading-[normal] relative shrink-0 text-[16px] text-black text-nowrap whitespace-pre">
              {planData.name}
            </p>
            <div className="content-stretch flex gap-[15px] items-center relative shrink-0 w-full">
              <p className="font-bold leading-[normal] relative shrink-0 text-[#4c4c4c] text-[48px] text-nowrap whitespace-pre">
                ${planData.price.toFixed(2)}
              </p>
              <div className="flex flex-col font-medium h-[50px] justify-end leading-[0] relative shrink-0 text-[20px] text-[#4c4c4c] w-[105px]">
                <p className="leading-[normal]">{planData.currency} / {planData.period}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
        <div className="h-px relative shrink-0 w-[442.827px]">
          <div className="absolute inset-0">
            <img alt="" className="block max-w-none size-full" src={imgHr} />
          </div>
        </div>
        <div className="content-stretch flex items-center justify-between relative shrink-0 text-[#4c4c4c] text-[12px] w-[428.358px]">
          <p className="font-normal leading-[normal] relative shrink-0 w-[61.333px]">
            Subtotal
          </p>
          <p className="font-semibold leading-[30px] relative shrink-0 text-right w-[75.389px]">
            ${planData.subtotal.toFixed(2)}
          </p>
        </div>
        <div className="h-px relative shrink-0 w-[442.827px]">
          <div className="absolute inset-0">
            <img alt="" className="block max-w-none size-full" src={imgHr} />
          </div>
        </div>
        <div className="content-stretch flex items-center justify-between relative shrink-0 text-[#4c4c4c] text-[12px] w-[429.056px]">
          <p className="font-normal leading-[normal] relative shrink-0 w-[112.444px]">
            Impuestos (IVA)
          </p>
          <p className="font-semibold leading-[30px] relative shrink-0 text-right w-[60.056px]">
            ${planData.tax.toFixed(2)}
          </p>
        </div>
        <div className="h-px relative shrink-0 w-[442.827px]">
          <div className="absolute inset-0">
            <img alt="" className="block max-w-none size-full" src={imgHr} />
          </div>
        </div>
        <div className="content-stretch flex font-bold items-center justify-between relative shrink-0 text-[#4c4c4c] text-[14px] w-[429.335px]">
          <p className="leading-[normal] relative shrink-0 w-[44.722px]">
            Total
          </p>
          <p className="leading-[30px] relative shrink-0 text-right w-[88.167px]">
            ${planData.total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
