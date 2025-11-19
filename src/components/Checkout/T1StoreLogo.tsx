import React from 'react';
import imgT1Logo from '@assets/logos/t1.svg';
import Image from 'next/image';

function T1Logotipo() {
  return (
    <div className="absolute h-[42px] left-0 overflow-clip top-0 w-[43px]">
      <div className="absolute h-[42px] left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[43px]" />
      <div className="absolute inset-[11.9%_10.21%_9.76%_6.98%]">
        <Image alt="T1 Logo" className="block max-w-none size-full" src={imgT1Logo} width={43} height={42} />
      </div>
    </div>
  );
}

export default function T1StoreLogo() {
  return (
    <div className="h-[42px] overflow-clip relative shrink-0 w-[126px]">
      <T1Logotipo />
      <p className="absolute font-semibold leading-[normal] left-[41px] text-[27px] text-black text-nowrap top-[5px] whitespace-pre">
        tienda
      </p>
    </div>
  );
}
