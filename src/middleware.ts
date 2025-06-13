
// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: [
    '/', // Make the homepage public
    '/cars/(.*)', // Make individual car detail pages public
    // Add any other public API routes or webhook handlers here if needed
  ],
  // ignoredRoutes: ['/api/webhooks/clerk'], // Example: if you had Clerk webhooks
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
