import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This default export is required by Next.js if a middleware.ts file exists.
// It currently does nothing and allows all requests to pass through.
export default function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Optional: Define a config to specify which paths the middleware runs on.
// By default, it runs on all paths.
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// };