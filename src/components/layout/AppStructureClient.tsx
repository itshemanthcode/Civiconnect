
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Loader2 } from 'lucide-react';

const AUTH_ROUTES = ['/verify/phone', '/verify/otp', '/auth/signin'];

export default function AppStructureClient({ children }: { children: React.ReactNode }) {
  const { isVerified } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isVerified === null) {
      // Still loading auth state from localStorage
      return;
    }

    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (!isVerified && !isAuthRoute) {
      router.replace('/verify/phone');
    } else if (isVerified) {
      // If verified and on any OTP verification page or the sign-in page, redirect to home
      if (pathname === '/verify/phone' || pathname === '/verify/otp' || pathname === '/auth/signin') {
        router.replace('/');
      }
    }
  }, [isVerified, pathname, router]);

  if (isVerified === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthPageLayout = AUTH_ROUTES.includes(pathname);

  // If on an auth route (like /verify/phone, /verify/otp, or /auth/signin) AND not yet OTP verified,
  // render the page content directly without the main app layout.
  // The useEffect will handle redirects if needed (e.g. verified user trying to access /auth/signin).
  if (isAuthPageLayout && !isVerified) {
    return <>{children}</>;
  }
  
  // If not verified and not on an auth route, user should be redirected by useEffect.
  // This is a fallback display while redirect is pending.
  if (!isVerified && !isAuthPageLayout) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
         <p className="ml-2 text-muted-foreground">Redirecting to verification...</p>
      </div>
    );
  }

  // If execution reaches here, the user is OTP verified (and not on an auth page they should be redirected from)
  // OR they are on /auth/signin (which will be redirected by useEffect if they are verified).
  // In either case, if not redirected, show the main app layout.
  if (isVerified) {
     // If OTP verified and on an OTP page, useEffect handles redirect.
     // For other pages, show main layout.
     // This condition implicitly means `pathname` is not `/verify/phone` or `/verify/otp` or `/auth/signin` if `isVerified` is true,
     // because the `useEffect` would have redirected.
     if (pathname !== '/verify/phone' && pathname !== '/verify/otp' && pathname !== '/auth/signin') {
        return (
            <div className="flex flex-col flex-grow max-w-2xl w-full mx-auto bg-card shadow-lg">
              <Header />
              <main className="flex-grow overflow-y-auto p-4 pb-20">
                {children}
              </main>
              <BottomNav />
            </div>
        );
     }
     // If on /auth/signin and verified, useEffect will redirect. While redirecting, show minimal content.
     // Same for /verify/* pages if somehow reached while verified before redirect.
     return <>{children}</>; 
  }
  
  // Fallback for any other unhandled cases (e.g., if on /auth/signin and not verified, handled by the first return).
  // This primarily covers the case where `pathname === '/auth/signin'` and `isVerified` is false,
  // which is already handled by `isAuthPageLayout && !isVerified`.
  // This default fallback is more of a safety net.
  return (
     <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading application...</p>
      </div>
  );
}
