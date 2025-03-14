declare global {
  interface Window {
    Clerk?: {
      signOut: () => Promise<void>;
      user?: any;
      load: () => Promise<void>;
    };
  }
}

import { SignInButton } from "./SignInButton";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

const AuthButtons = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (window.Clerk) {
        await window.Clerk.load();
        setIsSignedIn(!!window.Clerk.user);
      }
    };
    checkAuth();
  }, []);

  const handleSignOut = () => {
    window.Clerk?.signOut().then(() => {
      window.location.href = '/';
    });
  };

  if (!isSignedIn) {
    return <SignInButton />;
  }

  return (
    <div className="flex gap-4 items-center">
      <a
        href="/admin"
        className="text-sm font-medium text-gray-700 hover:text-primary"
      >
        Dashboard
      </a>
      <Button
        variant="outline"
        className="font-semibold"
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
    </div>
  );
}

export default AuthButtons; 