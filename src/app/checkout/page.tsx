import CheckoutForm from "@/components/Checkout/CheckoutForm";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export const fetchCache = "force-no-store";
export const runtime = 'nodejs';
export const revalidate = 0;

interface CheckoutPageProps {
  searchParams?: Promise<{
    planId?: string;
    planName?: string;
    price?: string;
    subtotal?: string;
    tax?: string;
    total?: string;
    currency?: string;
    period?: string;
  }>;
}

export default async function CheckoutPage(props: CheckoutPageProps) {
  const searchParams = await props.searchParams;

  return <CheckoutForm searchParams={searchParams} />;
}
