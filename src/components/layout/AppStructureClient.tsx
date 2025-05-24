
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Loader2 } from 'lucide-react';

const AUTH_ROUTES = ['/verify/phone', '/verify/otp', '/auth/signin']; // Existing signin kept accessible

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
    } else if (isVerified && (pathname === '/verify/phone' || pathname === '/verify/otp')) {
      // If verified and on a verification page, redirect to home
      router.replace('/');
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

  if (isAuthPageLayout && !isVerified) {
    // For phone/otp verification pages or signin page when not yet verified via OTP
    return <>{children}</>;
  }
  
  if (!isVerified && !isAuthPageLayout) {
     // This case should be handled by the redirect, but as a fallback, show loader or minimal content
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
         <p className="ml-2 text-muted-foreground">Redirecting to verification...</p>
      </div>
    );
  }


  // Verified user or on sign-in page (even if not OTP verified yet)
  if (isVerified || pathname === '/auth/signin') {
      const showMainLayout = !AUTH_ROUTES.some(route => pathname.startsWith(route)) || (pathname === '/auth/signin' && isVerified);
      // Simplified logic: if it's /auth/signin, it uses its own layout.
      // If it's /verify/* and user is NOT verified, it uses its own layout (handled above).
      // Otherwise, if verified, use main app layout.

      if (pathname === '/verify/phone' || pathname === '/verify/otp') {
        // Should have been redirected if verified, or handled by `isAuthPageLayout && !isVerified`
        // This path is mostly for when `isVerified` becomes true and redirect is pending.
        return <>{children}</>;
      }


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
  
  // Default fallback, should ideally not be reached if logic above is correct
  return (
     <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading application...</p>
      </div>
  );
}
