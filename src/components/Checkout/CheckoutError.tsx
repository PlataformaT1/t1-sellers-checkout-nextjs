'use client'

import { Button } from '@t1-org/t1components';
import { useRouter } from 'next/navigation';

interface CheckoutErrorProps {
  message: string;
  description?: string;
}

export default function CheckoutError({ message, description }: CheckoutErrorProps) {
  const router = useRouter();

  return (
    <div className="bg-white w-full min-h-screen flex items-center justify-center py-[58px] px-4">
      <div className="flex flex-col items-center justify-center gap-[32px] max-w-[500px]">
        {/* Error Icon */}
        <div className="w-[80px] h-[80px] rounded-full bg-[#fef0ef] flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 10V20M20 26.667H20.0167M35 20C35 28.2843 28.2843 35 20 35C11.7157 35 5 28.2843 5 20C5 11.7157 11.7157 5 20 5C28.2843 5 35 11.7157 35 20Z" stroke="#db362b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Error Message */}
        <div className="flex flex-col gap-[12px] items-center text-center">
          <h1 className="font-semibold text-[24px] leading-[32px] text-[#4c4c4c]">
            {message}
          </h1>
          {description && (
            <p className="font-normal text-[14px] leading-[20px] text-[#828282]">
              {description}
            </p>
          )}
        </div>

        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          className="!w-[200px] !h-[40px]"
        >
          Volver
        </Button>
      </div>
    </div>
  );
}
