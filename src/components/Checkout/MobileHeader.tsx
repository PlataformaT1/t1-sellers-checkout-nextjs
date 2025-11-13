import React from 'react';
import Image from 'next/image';

const imgT1Logo = "http://localhost:3845/assets/10e741a83a1e33c7f894449df9b236e840d91ae0.svg";
const imgChevronDown = "http://localhost:3845/assets/e890fa5c22c12645713c131086cd29ef5120a8c6.svg";

export default function MobileHeader() {
  return (
    <div className="lg:hidden bg-white box-border content-stretch flex items-end justify-between px-[12px] py-[15px] w-full">
      {/* T1Store Logo */}
      <div className="h-[30px] overflow-clip relative shrink-0 w-[90px]">
        <div className="absolute h-[30px] left-0 overflow-clip top-0 w-[30.714px]">
          <div className="absolute inset-[11.9%_10.21%_9.76%_6.98%]">
            <Image
              src={imgT1Logo}
              alt="T1"
              width={25}
              height={24}
              className="block max-w-none size-full"
            />
          </div>
        </div>
        <p className="absolute font-semibold leading-[normal] left-[29.29px] text-[19.29px] text-black text-nowrap top-[3.57px] whitespace-pre">
          tienda
        </p>
      </div>

      {/* Ver detalle button */}
      <div className="content-stretch flex gap-[10px] items-center">
        <p className="font-bold leading-[24px] text-[12px] text-black text-center text-nowrap whitespace-pre">
          Ver detalle
        </p>
        <div className="flex items-center justify-center w-[16px] h-[16px]">
          <div className="rotate-[270deg]">
            <Image
              src={imgChevronDown}
              alt="Chevron"
              width={5}
              height={9}
              className="block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
