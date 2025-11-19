import React from 'react';
import Image from 'next/image';
import imgT1Logo from '@assets/logos/t1.svg';
import imgChevronDown from '@assets/icons/chevron-down.svg';
interface MobileHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MobileHeader({ isOpen, onToggle }: MobileHeaderProps) {
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
      <div
        className="content-stretch flex gap-[10px] items-center cursor-pointer"
        onClick={onToggle}
      >
        <p className="font-bold leading-[24px] text-[12px] text-black text-center text-nowrap whitespace-pre">
          Ver detalle
        </p>
        <div className="flex items-center justify-center w-[16px] h-[16px]">
          <div
            className={`transition-transform duration-300 ${
              isOpen ? 'rotate-[180deg]' : 'rotate-[360deg]'
            }`}
          >
            <Image
              src={imgChevronDown}
              alt="Chevron"
              width={9}
              height={8}
              className="block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
