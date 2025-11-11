import React from 'react';

const imgGroup = "http://localhost:3845/assets/6037608f4bdb48a9544d9c91750ea4718c65a3c5.svg";

export default function T1StoreLogo() {
  return (
    <div className="h-[42px] overflow-clip relative w-[126px]">
      <div className="absolute h-[42px] left-0 overflow-clip top-0 w-[43px]">
        <div className="absolute h-[42px] left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[43px]" />
        <div className="absolute inset-[11.9%_10.21%_9.76%_6.98%]">
          <img alt="T1 Logo" className="block max-w-none size-full" src={imgGroup} />
        </div>
      </div>
      <p className="absolute font-['Manrope'] font-semibold leading-normal left-[41px] text-[27px] text-black text-nowrap top-[5px] whitespace-pre">
        tienda
      </p>
    </div>
  );
}
