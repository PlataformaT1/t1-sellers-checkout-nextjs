import React from 'react';
import Image from 'next/image';

const imgT1LogoSmall = "http://localhost:3845/assets/91658a5681c232f6b1c5e4c5f997ec8385758192.svg";
const imgPagosText = "http://localhost:3845/assets/c305c88987fcd8e3a6f2257e1d6bc50d39570496.svg";

export default function MobileFooter() {
  return (
    <div className="lg:hidden bg-white box-border content-stretch flex flex-col gap-[12px] items-center px-[15px] py-[10px] w-full">
      <div className="content-stretch flex flex-col gap-[8px] items-center w-full">
        {/* T1Pagos branding */}
        <div className="content-stretch flex gap-px items-end">
          <p className="font-medium leading-[normal] text-[#828282] text-[10px] text-center text-nowrap whitespace-pre">
            Con tecnología de{' '}
          </p>
          <div className="h-[15px] overflow-clip relative shrink-0 w-[43.571px] flex items-center">
            <div className="absolute left-0 bottom-0 overflow-clip w-[15.357px] h-[15px]">
              <Image
                src={imgT1LogoSmall}
                alt="T1"
                width={15}
                height={15}
                className="block max-w-none size-full"
              />
            </div>
            <div className="absolute left-[15.357px] bottom-[2.65px] h-[7.808px] w-[27.214px]">
              <Image
                src={imgPagosText}
                alt="pagos"
                width={27}
                height={8}
                className="block max-w-none size-full"
              />
            </div>
          </div>
        </div>

        {/* Terms and Privacy links */}
        <div className="content-stretch flex font-bold gap-[16px] items-center justify-center leading-[normal] text-[10px] text-center text-nowrap w-full whitespace-pre">
          <p className="relative shrink-0 text-[#4c4c4c]">Términos y condiciones</p>
          <p className="relative shrink-0 text-[#c3c3c3]">|</p>
          <p className="relative shrink-0 text-[#4c4c4c]">Políticas de privacidad</p>
        </div>
      </div>
    </div>
  );
}
