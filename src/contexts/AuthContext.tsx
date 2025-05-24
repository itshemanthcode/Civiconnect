
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isVerified: boolean | null; // null when loading from localStorage
  setIsVerified: (verified: boolean) => void;
  phoneNumber: string | null;
  setPhoneNumber: (phone: string | null) => void;
  logout: () => void; // Added logout function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerifiedState] = useState<boolean | null>(null);
  const [phoneNumber, setPhoneNumberState] = useState<string | null>(null);

  useEffect(() => {
    // Load verification status from localStorage on mount
    const storedIsVerified = localStorage.getItem('isCivicConnectVerified');
    setIsVerifiedState(storedIsVerified === 'true');

    const storedPhoneNumber = localStorage.getItem('civicConnectPhoneNumber');
    setPhoneNumberState(storedPhoneNumber);
  }, []);

  const setIsVerified = (verified: boolean) => {
    setIsVerifiedState(verified);
    localStorage.setItem('isCivicConnectVerified', verified.toString());
    if (!verified) {
      // Clear phone number if un-verifying (also handled by logout)
      localStorage.removeItem('civicConnectPhoneNumber');
      setPhoneNumberState(null);
    }
  };

  const setPhoneNumber = (phone: string | null) => {
    setPhoneNumberState(phone);
    if (phone) {
      localStorage.setItem('civicConnectPhoneNumber', phone);
    } else {
      localStorage.removeItem('civicConnectPhoneNumber');
    }
  };

  const logout = () => {
    setIsVerifiedState(false);
    setPhoneNumberState(null);
    localStorage.removeItem('isCivicConnectVerified');
    localStorage.removeItem('civicConnectPhoneNumber');
    // The AppStructureClient will handle redirection to /verify/phone
  };


  return (
    <AuthContext.Provider value={{ isVerified, setIsVerified, phoneNumber, setPhoneNumber, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

