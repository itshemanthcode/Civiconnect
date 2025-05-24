
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
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const router = useRouter();
  const { setIsVerified, phoneNumber } = useAuth(); // phoneNumber comes from context
  const { toast } = useToast();

  useEffect(() => {
    if (!phoneNumber) {
      toast({
        title: "Phone number missing",
        description: "Please enter your phone number first.",
        variant: "destructive",
      });
      router.replace('/verify/phone');
    }
  }, [phoneNumber, router, toast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!phoneNumber) {
      toast({ title: "Error", description: "Phone number not found.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setIsVerified(true);
        toast({
          title: "Verification Successful!",
          description: data.message || "You can now access CivicConnect.",
        });
        router.replace('/'); 
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid or expired OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
       toast({
        title: "Network Error",
        description: "Could not connect to the server. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    if (!phoneNumber) {
      toast({ title: "Error", description: "Phone number not found to resend OTP.", variant: "destructive" });
      return;
    }
    setIsResendingOtp(true);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "OTP Resent (Simulated)",
          description: data.message || `A new OTP has been "sent" to ${phoneNumber}.`,
        });
      } else {
        toast({
          title: "Failed to Resend OTP",
          description: data.message || "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast({
        title: "Network Error",
        description: "Could not resend OTP. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsResendingOtp(false);
    }
  };

  if (!phoneNumber) {
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
            A 6-digit code was "sent" to <span className="font-semibold">{phoneNumber}</span>.
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
            <Button type="submit" className="w-full" disabled={isLoading || isResendingOtp}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the code?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={handleResendOtp} disabled={isLoading || isResendingOtp}>
              {isResendingOtp ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
              {isResendingOtp ? 'Resending...' : 'Resend Code'}
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
