
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

const SIMULATED_OTP = "123456"; // For demonstration purposes

export default function OtpVerifyPage() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setIsVerified, phoneNumber } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!phoneNumber) {
      // If no phone number, redirect back to phone entry
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

    // Simulate API call to verify OTP
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (otp === SIMULATED_OTP) {
      setIsVerified(true);
      toast({
        title: "Verification Successful!",
        description: "You can now access CivicConnect.",
      });
      router.replace('/'); // Redirect to dashboard or main app page
    } else {
      toast({
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };
  
  const handleResendOtp = async () => {
    toast({
      title: "OTP Resent (Simulated)",
      description: `A new OTP has been "sent" to ${phoneNumber}. Please use 123456.`,
    });
  };


  if (!phoneNumber) {
    // Still loading or redirected
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
            A 6-digit code was sent to <span className="font-semibold">{phoneNumber}</span>.
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
            <Button variant="link" className="p-0 h-auto" onClick={handleResendOtp} disabled={isLoading}>
              Resend Code
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
