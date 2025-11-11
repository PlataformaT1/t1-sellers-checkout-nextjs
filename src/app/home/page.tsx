import { redirect } from 'next/navigation';

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Await the searchParams promise
  const params = await searchParams;
  
  // Preserve all URL parameters when redirecting
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
  const redirectUrl = queryString ? `/?${queryString}` : '/';
  
  redirect(redirectUrl);
}
