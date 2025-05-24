
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { KeyRound, Loader2 } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function OtpVerifyPage() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [isResendingOtp, setIsResendingOtp] = useState(false); // Resend logic needs to be Firebase compatible
  const router = useRouter();
  const { setIsVerified, phoneNumber, confirmationResult, firebaseUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (firebaseUser) { // If already logged in via Firebase (e.g. page refresh after login)
        setIsVerified(true);
        router.replace('/');
    } else if (!confirmationResult && !phoneNumber) { // If no confirmationResult and no phone number, something went wrong
      toast({
        title: "Verification Error",
        description: "Could not find phone number or verification session. Please start over.",
        variant: "destructive",
      });
      router.replace('/verify/phone');
    }
  }, [confirmationResult, phoneNumber, router, toast, firebaseUser, setIsVerified]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!confirmationResult) {
      toast({ title: "Error", description: "Verification session not found. Please try sending OTP again.", variant: "destructive" });
      setIsLoading(false);
      router.replace('/verify/phone');
      return;
    }
    if (!otp || otp.length !== 6) {
        toast({ title: "Invalid OTP", description: "Please enter a 6-digit OTP.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    try {
      await confirmationResult.confirm(otp);
      // User is signed in with Firebase at this point.
      // onAuthStateChanged in AuthContext will update firebaseUser and isVerified.
      toast({
        title: "Verification Successful!",
        description: "You have successfully verified your phone number.",
      });
      // AppStructureClient will redirect to '/' if isVerified becomes true.
      // Explicit redirect can be a fallback or for immediate navigation.
      router.replace('/'); 
    } catch (error: any) {
      console.error("Error verifying OTP with Firebase:", error);
      let errorMessage = "Invalid or expired OTP. Please try again.";
       if (error.code === 'auth/invalid-verification-code') {
        errorMessage = "Invalid OTP. Please check the code and try again.";
      } else if (error.code === 'auth/code-expired') {
        errorMessage = "OTP has expired. Please request a new one.";
      } else if (error.code === 'auth/session-expired') {
        errorMessage = "Verification session has expired. Please request a new OTP.";
         router.replace('/verify/phone');
      }
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resend OTP logic needs to re-trigger signInWithPhoneNumber with a new reCAPTCHA.
  // This is more complex and for simplicity, we will ask user to go back.
  const handleGoBackToResend = () => {
    router.replace('/verify/phone');
  };

  if (!phoneNumber && !confirmationResult && !firebaseUser) { // Show loader if initial checks are pending
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Enter Verification Code</CardTitle>
          <CardDescription>
            A 6-digit code was sent to <span className="font-semibold">{phoneNumber || "your phone"}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="otp">OTP Code</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  className="pl-10 tracking-[0.3em] text-center"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the code?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={handleGoBackToResend} disabled={isLoading}>
              Request new code
            </Button>
          </p>
           <Link href="/verify/phone" className="text-sm text-primary hover:underline">
             Change phone number
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
