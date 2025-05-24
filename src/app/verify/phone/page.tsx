
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, Loader2 } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { useToast } from '@/hooks/use-toast';

export default function PhoneEntryPage() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setPhoneNumber } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!phone.match(/^\d{10,15}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number (10-15 digits).",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPhoneNumber(phone); // Store phone number in context/localStorage
        toast({
          title: "OTP Sent (Simulated)",
          description: data.message, // Message from API
        });
        router.push('/verify/otp');
      } else {
        toast({
          title: "Failed to Send OTP",
          description: data.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please check your internet connection.",
        variant: "destructive",
      });
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
          <CardDescription>Enter your phone number to receive a verification code.</CardDescription>
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
                  placeholder="e.g., 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        </CardContent>
         <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            We need to verify your phone number to ensure community safety and accountability.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
