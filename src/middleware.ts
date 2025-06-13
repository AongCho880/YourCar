// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that should be public (accessible without authentication)
const isPublicRoute = createRouteMatcher([
  '/', // Make the homepage public
  '/cars/(.*)', // Make individual car detail pages public
  // Add any other public routes here, e.g., '/about', '/contact'
]);

// Define routes that are part of the authentication flow (Clerk's own pages)
const isAuthRoute = createRouteMatcher([
  '/admin/sign-in(.*)',
  '/admin/sign-up(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // If it's not a public route and not an auth route, protect it.
  if (!isPublicRoute(req) && !isAuthRoute(req)) {
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
