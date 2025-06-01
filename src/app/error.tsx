"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4 text-center">
      <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold mb-2 font-headline">Oops! Something went wrong.</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        We encountered an unexpected issue. Please try again, or contact support if the problem persists.
      </p>
      {error?.message && (
         <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md mb-4">Error: {error.message}</p>
      )}
      <Button
        onClick={() => reset()}
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        Try Again
      </Button>
    </div>
  );
}
