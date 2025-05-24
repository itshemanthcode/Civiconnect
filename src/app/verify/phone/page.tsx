
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, Loader2 } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';

// Ensure this function is declared or imported if it's going to be used by RecaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function PhoneEntryPage() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setPhoneNumber, setConfirmationResult } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && auth) { // Ensure auth is initialized
      if (!window.recaptchaVerifier) {
        // Ensure the container exists and is visible
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (recaptchaContainer) {
            // Option 1: Visible reCAPTCHA
             window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
               'size': 'normal', // 'invisible' is also an option but needs to be tied to button click
               'callback': (response: any) => {
                 // reCAPTCHA solved, allow signInWithPhoneNumber.
                 console.log("reCAPTCHA solved:", response);
               },
               'expired-callback': () => {
                 // Response expired. Ask user to solve reCAPTCHA again.
                 toast({ title: "reCAPTCHA Expired", description: "Please solve the reCAPTCHA again.", variant: "destructive"});
                 window.recaptchaVerifier?.render().then((widgetId) => {
                    if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
                        grecaptcha.reset(widgetId);
                    }
                 });
               }
             });
             window.recaptchaVerifier.render().catch(error => {
                console.error("Error rendering reCAPTCHA:", error);
                toast({ title: "reCAPTCHA Error", description: "Could not render reCAPTCHA. Ensure it is enabled for your Firebase project and domain.", variant: "destructive" });
             });
        } else {
            console.error("reCAPTCHA container not found")
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, toast]); // Add toast to dependencies

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Basic E.164 format validation (adjust regex as needed for your specific country codes)
    if (!phone.match(/^\+[1-9]\d{1,14}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number in E.164 format (e.g., +19876543210).",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    if (!window.recaptchaVerifier) {
      toast({ title: "reCAPTCHA Error", description: "reCAPTCHA not initialized. Please wait or refresh.", variant: "destructive"});
      setIsLoading(false);
      return;
    }

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation); // Store confirmation result in context
      setPhoneNumber(phone); // Store phone number in context
      
      toast({
        title: "OTP Sent",
        description: `An OTP has been sent to ${phone}.`,
      });
      router.push('/verify/otp');
    } catch (error: any) {
      console.error("Error sending OTP with Firebase:", error);
      let errorMessage = "Failed to send OTP. Please try again.";
      if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many requests. Please try again later.";
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = "Invalid phone number provided.";
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = "reCAPTCHA verification failed. Please try again.";
      } else if (error.message?.includes('reCAPTCHA')) {
        errorMessage = "reCAPTCHA error. Please ensure it's configured correctly or try again.";
      }
      
      toast({
        title: "OTP Sending Failed",
        description: errorMessage,
        variant: "destructive",
      });
      // Reset reCAPTCHA if it exists and an error occurred
      if (window.recaptchaVerifier && typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
        try {
            const widgetId = (window.recaptchaVerifier as any).widgetId; // Accessing widgetId if available
            if (widgetId !== undefined) {
               grecaptcha.reset(widgetId);
            } else {
                // Fallback if widgetId is not directly accessible, try to re-render
                window.recaptchaVerifier.clear(); // Clear previous instance
                await window.recaptchaVerifier.render();
            }
        } catch (rcError) {
            console.error("Error resetting reCAPTCHA:", rcError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
           <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Verify Your Phone</CardTitle>
          <CardDescription>Enter your phone number (e.g., +1XXXYYYZZZZ) to receive a verification code.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +19876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            {/* Container for reCAPTCHA */}
            <div id="recaptcha-container" className="my-4 flex justify-center"></div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        </CardContent>
         <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            We need to verify your phone number to ensure community safety and accountability. Standard messaging rates may apply.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
