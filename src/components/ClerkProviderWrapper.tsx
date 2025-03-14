import { ClerkProvider } from '@clerk/clerk-react';
import type { PropsWithChildren } from 'react';

export default function ClerkProviderWrapper({ children }: PropsWithChildren) {
  if (!import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing Clerk Publishable Key');
  }

  return (
    <ClerkProvider 
      publishableKey={import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </ClerkProvider>
  );
} 