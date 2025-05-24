
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
    grecaptcha?: {
      reset: (widgetId?: number) => void;
      // Add other grecaptcha methods if needed
    };
  }
}

export default function PhoneEntryPage() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setPhoneNumber, setConfirmationResult } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && auth) { 
      if (!window.recaptchaVerifier) {
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (recaptchaContainer) {
             window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
               'size': 'normal', 
               'callback': (response: any) => {
                 console.log("reCAPTCHA solved:", response);
               },
               'expired-callback': () => {
                 toast({ title: "reCAPTCHA Expired", description: "Please solve the reCAPTCHA again.", variant: "destructive"});
                 if (window.recaptchaVerifier) {
                    const widgetId = (window.recaptchaVerifier as any).widgetId;
                    if (typeof window.grecaptcha !== 'undefined' && window.grecaptcha.reset && widgetId !== undefined) {
                        window.grecaptcha.reset(widgetId);
                    } else {
                        // Fallback if widgetId is not directly accessible or grecaptcha not fully loaded
                        window.recaptchaVerifier.render().catch(console.error);
                    }
                 }
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
  }, [auth, toast]); 

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
  
    // Allow '+' only at the beginning, and only digits otherwise
    if (inputValue.startsWith('+')) {
      // Allow user to type their own country code, ensure rest are digits
      inputValue = '+' + inputValue.substring(1).replace(/[^\d]/g, '');
    } else {
      // If no '+', strip all non-digits
      inputValue = inputValue.replace(/[^\d]/g, '');
    }
    
    // If the input becomes 10 digits long, doesn't start with '+', 
    // and looks like a typical Indian mobile number (starts with 6,7,8, or 9)
    if (!inputValue.startsWith('+') && inputValue.length === 10 && /^[6-9]\d{9}$/.test(inputValue)) {
      setPhone('+91' + inputValue);
    } else {
      // Otherwise, update with the cleaned input
      setPhone(inputValue);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Final validation for E.164 format before submitting
    if (!phone.match(/^\+[1-9]\d{1,14}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number in E.164 format (e.g., +919876543210).",
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
      setConfirmationResult(confirmation); 
      setPhoneNumber(phone); 
      
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
        errorMessage = "Invalid phone number provided to Firebase.";
      } else if (error.code === 'auth/captcha-check-failed' || error.message?.includes('reCAPTCHA')) {
        errorMessage = "reCAPTCHA verification failed. Please try again.";
      }
      
      toast({
        title: "OTP Sending Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (window.recaptchaVerifier && typeof window.grecaptcha !== 'undefined' && window.grecaptcha.reset) {
        try {
            const widgetId = (window.recaptchaVerifier as any).widgetId; 
            if (widgetId !== undefined) {
               window.grecaptcha.reset(widgetId);
            } else {
                window.recaptchaVerifier.clear(); 
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
          <CardDescription>Enter your phone number (e.g., +91XXXXXXXXXX) to receive a verification code.</CardDescription>
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
                  placeholder="e.g., +919876543210 or 9876543210"
                  value={phone}
                  onChange={handlePhoneChange}
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
