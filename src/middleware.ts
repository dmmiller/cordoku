import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { CORD_USER_COOKIE, NEXT_URL_HEADER } from './constants';

// middleware that :
// check if user is login
// if not, adds the url user was trying to get to to the header
export function middleware(request: NextRequest) {
  const user = request.cookies.get(CORD_USER_COOKIE);
  if (!user) {
    const nextUrl = request.nextUrl.pathname;
    console.log('not authenticated; trying to go to', nextUrl);
    request.headers.set(NEXT_URL_HEADER, nextUrl);
    return NextResponse.rewrite(new URL('/signin', request.url));
  } 
  console.log('authenticated as', user);
}

