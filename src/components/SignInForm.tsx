import { SignIn } from '@clerk/clerk-react';
import ClerkProviderWrapper from './ClerkProviderWrapper';

interface SignInFormProps {
  returnUrl: string;
}

export default function SignInForm({ returnUrl }: SignInFormProps) {
  return (
    <ClerkProviderWrapper>
      <div className="w-full">
        <SignIn 
          afterSignInUrl={returnUrl}
          redirectUrl={returnUrl}
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary-dark',
              footerActionLink: 'text-primary hover:text-primary-dark'
            }
          }}
        />
      </div>
    </ClerkProviderWrapper>
  );
} 