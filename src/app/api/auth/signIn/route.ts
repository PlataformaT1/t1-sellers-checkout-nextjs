import { signIn } from '@auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // This will automatically redirect to Keycloak
  await signIn('keycloak', {
    redirectTo: callbackUrl,
  });
}