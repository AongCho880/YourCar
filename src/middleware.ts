// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that should be public
const isPublicRoute = createRouteMatcher([
  '/', // Make the homepage public
  '/cars/(.*)', // Make individual car detail pages public
  // Add any other public API routes or webhook handlers here if needed
]);

export default clerkMiddleware((auth, req) => {
  // If the route is not public, then protect it.
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
