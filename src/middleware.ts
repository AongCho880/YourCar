
import { clerkMiddleware } from "@clerk/nextjs/server";
import type { AuthObject, NextRequest } from '@clerk/nextjs/server';
import type { NextFetchEvent } from 'next/server';

export default clerkMiddleware(
  (auth: AuthObject, req: NextRequest, evt: NextFetchEvent) => {
    // This is the auth handler.
    // For routes listed in `publicRoutes`, Clerk's protection logic is bypassed.
    // For routes NOT in `publicRoutes`, Clerk's default behavior (e.g., redirect to sign-in)
    // will apply because this handler doesn't return a custom Response to override it.
    // No explicit auth().protect() is needed here for default behavior.
  },
  {
    publicRoutes: ["/", "/cars/(.*)"],
    // ignoredRoutes: [] // Optional: if you had specific routes Clerk should completely ignore
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
