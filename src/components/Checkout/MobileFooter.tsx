import React from 'react';
import Image from 'next/image';
import PaymentsIcon from 'assets/checkout/payments-icon.svg';

const handleGoToLanding = (path: string) => {
  window.open(`https://t1.com${path}`, '_blank');
};

export default function MobileFooter() {
  return (
    <div className="lg:hidden bg-white box-border content-stretch flex flex-col gap-[12px] items-center px-[15px] py-[10px] w-full">
      <div className="content-stretch flex flex-col gap-[8px] items-center w-full">
        {/* T1Pagos branding */}
        <div className="flex gap-[2px] items-center justify-center">
          <p className="font-medium leading-[normal] text-[#828282] text-[10px] text-nowrap m-0">
            Con tecnología de
          </p>
          <Image src={PaymentsIcon} alt='payments' width={43} height={15} />
        </div>

        {/* Terms and Privacy links */}
        <div className="content-stretch flex font-bold gap-[16px] items-center justify-center leading-[normal] text-[10px] text-center text-nowrap w-full whitespace-pre">
          <p className="relative shrink-0 text-[#4c4c4c]" onClick={() => handleGoToLanding('/mx/legal/terminos-t1tiendas')}>Términos y condiciones</p>
          <p className="relative shrink-0 text-[#c3c3c3]">|</p>
          <p className="relative shrink-0 text-[#4c4c4c]" onClick={() => handleGoToLanding('/mx/legal/excepcion-legal')}>Políticas de privacidad</p>
        </div>
      </div>
    </div>
  );
}
