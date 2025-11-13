import { redirect } from 'next/navigation';

interface RootPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RootPage({ searchParams }: RootPageProps) {
  const params = await searchParams;

  // Has store param - redirect to checkout with all params
  if (params.store && params.store !== 'null') {
    const urlParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => urlParams.append(key, v));
        } else {
          urlParams.set(key, value);
        }
      }
    });

    const queryString = urlParams.toString();
    redirect(`/checkout?${queryString}`);
  }

  // No valid params - redirect to invalid access
  redirect('/invalid-access');
}