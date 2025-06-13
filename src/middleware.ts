// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Updated to match the new guidelines for protected routes.
// The default behavior of clerkMiddleware is to protect all routes.
// We can define public routes if needed, or use createRouteMatcher for specific protected routes.

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isAdminRoute(req)) {
    auth().protect();
  }
  // For other routes, they are public by default unless configured otherwise.
  // If you want to make all routes private by default and only specify public ones:
  // export default clerkMiddleware();
  // Then define public routes in the config below or using `publicRoutes` in clerkMiddleware.
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
