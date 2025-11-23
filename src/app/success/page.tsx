'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SuccessView from '@components/Checkout/SuccessView';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Get URL parameters
  const planName = searchParams.get('planName') || 'plan básico mensual';
  const subtotal = parseFloat(searchParams.get('subtotal') || '0');
  const tax = parseFloat(searchParams.get('tax') || '0');
  const total = parseFloat(searchParams.get('total') || '0');
  const cardBrand = searchParams.get('cardBrand') || 'mastercard';
  const cardLast4 = searchParams.get('cardLast4') || '0000';
  const redirectUrl = searchParams.get('redirectUrl') || '/';
  const isUpdate = searchParams.get('isUpdate') === 'true';

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleContinue = () => {
    // Redirect to the original redirect URL
    window.location.href = redirectUrl;
  };

  // Prevent SSR mismatch
  if (!isClient) {
    return (
      <div className="bg-white min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t1-red"></div>
      </div>
    );
  }

  return (
    <SuccessView
      planName={planName}
      subtotal={subtotal}
      tax={tax}
      total={total}
      cardBrand={cardBrand}
      cardLast4={cardLast4}
      isUpdate={isUpdate}
      onContinue={handleContinue}
    />
  );
}
