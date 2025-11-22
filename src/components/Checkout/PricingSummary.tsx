import React from 'react';
import T1StoreLogo from './T1StoreLogo';
import { PlanData } from '@interfaces/checkout';
import Image from 'next/image';
import imgInfoIcon from '@assets/icons/info-icon.svg';
import Divider from '@mui/material/Divider';
import { Skeleton } from '@mui/material';
import { numberFormat } from '@utils/utils';

interface PricingSummaryProps {
  planData: PlanData;
  isLoadingPreview?: boolean;
  samePlanAndCycle?: boolean;
}

export default function PricingSummary({ planData, isLoadingPreview = false, samePlanAndCycle = false }: PricingSummaryProps) {
  return (
    <div className="content-stretch flex flex-col gap-[20px] lg:gap-[35px] items-start lg:items-start items-center relative shrink-0 w-full">
      {/* Logo - only show on desktop */}
      <div className="hidden lg:block">
        <T1StoreLogo />
      </div>

      {/* Plan Info - responsive layout */}
      <div className="box-border content-stretch flex flex-col gap-[15px] items-center lg:items-start md:pb-[20px] lg:pb-[11px] pt-0 px-0 relative shrink-0 w-full lg:w-[358px]">
        <div className="content-stretch flex gap-[15px] items-center lg:items-start justify-center lg:justify-start relative shrink-0 w-full">
          <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-center lg:items-start min-h-px min-w-px relative shrink-0">
            <p className="font-normal lg:font-normal leading-[normal] relative shrink-0 text-[16px] text-black text-nowrap whitespace-pre">
              {planData.name}
            </p>
            <div className="content-stretch flex gap-[8px] lg:gap-[15px] items-center relative shrink-0 w-full justify-center lg:justify-start">
              <p className="font-bold leading-[normal] relative shrink-0 text-[#4c4c4c] text-[36px] lg:text-[48px] text-nowrap whitespace-pre">
                {numberFormat(planData.price)}
              </p>
              <div className="flex flex-col font-medium h-[38px] lg:h-[50px] justify-end leading-[0] relative shrink-0 text-[17px] lg:text-[20px] text-[#4c4c4c] w-[105px]">
                <p className="leading-[normal]">{planData.currency} / {planData.period}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop only - Downgrade Notice and Breakdown */}
      <div className="hidden lg:flex flex-col gap-[35px] w-full">
        {/* Downgrade Notice - only show for downgrades */}
        {(planData.downgradeNotice && !samePlanAndCycle) && (
          <div className="bg-[rgba(33,128,255,0.1)] box-border content-stretch flex gap-[12px] items-center p-[10px] relative rounded-[10px] shrink-0 w-full">
            <div className="basis-0 content-stretch flex gap-[8px] grow items-center min-h-px min-w-px relative shrink-0">
              <div className="overflow-clip relative shrink-0 size-[24px]">
                <Image
                  src={imgInfoIcon}
                  alt="info"
                  width={24}
                  height={24}
                  className="block max-w-none size-full"
                />
              </div>
              <p className="basis-0 font-medium grow leading-[normal] min-h-px min-w-px relative shrink-0 text-[12px] text-[#2180ff]">
                <span>Tu suscripción a {planData.downgradeNotice.newPlanName} por </span>
                <span className="font-bold">{numberFormat(planData.total)}</span>
                <span> aplicará a partir del </span>
                <span className="font-bold">{planData.downgradeNotice.effectiveDate}</span>
                <span>, hasta entonces mantendrás tu {planData.downgradeNotice.currentPlanName}</span>
              </p>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        {isLoadingPreview ? (
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: '10px' }} />
          </div>
        ) : (
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
          <div className="h-px relative shrink-0 w-full">
            <div className="absolute inset-0">
              <Divider />
            </div>
          </div>
          <div className="content-stretch flex items-center justify-between relative shrink-0 text-[#4c4c4c] text-[12px] w-full">
            <p className="font-normal leading-[normal] relative shrink-0 w-[61.333px]">
              Subtotal
            </p>
            <p className="font-semibold leading-[30px] relative shrink-0 text-right w-[75.389px]">
              {numberFormat(planData.subtotal)}
            </p>
          </div>
          {/* Credit line - only show for upgrades with prorated amount */}
          {planData.credit && (
            <>
              <Divider className='w-full' />
              <div className="content-stretch flex items-center justify-between relative shrink-0 text-[#4c4c4c] text-[12px] w-full">
                <p className="font-normal leading-[normal] relative shrink-0 text-nowrap whitespace-pre">
                  {planData.credit.label}
                </p>
                <p className="font-semibold leading-[30px] relative shrink-0 text-right w-[75.389px]">
                  {numberFormat(planData.credit.amount)}
                </p>
              </div>
            </>
          )}
          <div className="h-px relative shrink-0 w-full">
            <div className="absolute inset-0">
             <Divider />
            </div>
          </div>
          <div className="content-stretch flex items-center justify-between relative shrink-0 text-[#4c4c4c] text-[12px] w-full">
            <p className="font-normal leading-[normal] relative shrink-0 w-[112.444px]">
              Impuestos (IVA)
            </p>
            <p className="font-semibold leading-[30px] relative shrink-0 text-right w-[60.056px]">
              {numberFormat(planData.tax)}
            </p>
          </div>
          <div className="h-px relative shrink-0 w-full">
            <div className="absolute inset-0">
              <Divider />
            </div>
          </div>
          <div className="content-stretch flex font-bold items-center justify-between relative shrink-0 text-[#4c4c4c] text-[14px] w-full">
            <p className="leading-[normal] relative shrink-0 w-[44.722px]">
              Total
            </p>
            <p className="leading-[30px] relative shrink-0 text-right w-[88.167px]">
              {numberFormat(planData.total)}
            </p>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
