import { UserButton } from '@clerk/clerk-react';
import ClerkProviderWrapper from './ClerkProviderWrapper';

export default function UserProfile() {
  return (
    <ClerkProviderWrapper>
      <UserButton 
        afterSignOutUrl="/"
        appearance={{
          elements: {
            rootBox: "relative inline-block",
            userButtonTrigger: "focus:outline-none focus:ring-2 focus:ring-primary"
          }
        }}
      />
    </ClerkProviderWrapper>
  );
} 