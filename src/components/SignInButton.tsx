import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <Button
      variant="outline"
      className="font-semibold"
      onClick={() => window.location.href = '/sign-in'}
    >
      Sign In
    </Button>
  );
} 