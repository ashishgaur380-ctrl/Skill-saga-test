import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/academic')) {
    // Authentication is intentionally not inferred from client state.
    // Firebase session verification will be connected here.
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = { matcher: ['/academic/:path*'] };
