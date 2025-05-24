
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ConfirmationResult, User } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Import Firebase auth instance
import { signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  isVerified: boolean | null; // null when loading
  setIsVerified: (verified: boolean) => void;
  phoneNumber: string | null;
  setPhoneNumber: (phone: string | null) => void;
  firebaseUser: User | null;
  confirmationResult: ConfirmationResult | null;
  setConfirmationResult: (result: ConfirmationResult | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerifiedState] = useState<boolean | null>(null);
  const [phoneNumber, setPhoneNumberState] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [confirmationResult, setConfirmationResultState] = useState<ConfirmationResult | null>(null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // If Firebase has a user, consider them verified in our app context.
        // You might have additional checks here if needed.
        setIsVerifiedState(true);
        setPhoneNumberState(user.phoneNumber); // Firebase user object has phoneNumber
        localStorage.setItem('isCivicConnectVerified', 'true');
        if(user.phoneNumber) localStorage.setItem('civicConnectPhoneNumber', user.phoneNumber);
      } else {
        // No Firebase user, not verified in our app context.
        setIsVerifiedState(false);
        // Keep phone number from localStorage if it was set during OTP initiation
        const storedPhoneNumber = localStorage.getItem('civicConnectPhoneNumber');
        setPhoneNumberState(storedPhoneNumber);
        localStorage.removeItem('isCivicConnectVerified'); // Or set to 'false'
      }
      setLoadingAuthState(false);
    });

    // Fallback for initial load if onAuthStateChanged is slow or not yet fired
    // and we want to respect localStorage faster for UI rendering.
    // This helps avoid flicker if localStorage is already set.
    if (isVerified === null) { // Only if not already set by onAuthStateChanged
        const storedIsVerified = localStorage.getItem('isCivicConnectVerified');
        setIsVerifiedState(storedIsVerified === 'true');
        const storedPhoneNumber = localStorage.getItem('civicConnectPhoneNumber');
        setPhoneNumberState(storedPhoneNumber);
    }


    return () => unsubscribe();
  }, [isVerified]); // Added isVerified to dependency array to re-evaluate local storage if it changes externally


  const setIsVerified = (verified: boolean) => {
    setIsVerifiedState(verified);
    localStorage.setItem('isCivicConnectVerified', verified.toString());
    if (!verified) {
      localStorage.removeItem('civicConnectPhoneNumber'); // Clearing phone on un-verify
      setPhoneNumberState(null);
    }
  };

  const setPhoneNumberContext = (phone: string | null) => {
    setPhoneNumberState(phone);
    if (phone) {
      localStorage.setItem('civicConnectPhoneNumber', phone);
    } else {
      localStorage.removeItem('civicConnectPhoneNumber');
    }
  };
  
  const setConfirmationResult = (result: ConfirmationResult | null) => {
    setConfirmationResultState(result);
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setting firebaseUser to null
      // and isVerified to false.
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
    }
    // Explicitly clear app-specific states and localStorage
    setIsVerifiedState(false);
    setPhoneNumberState(null);
    setConfirmationResultState(null);
    localStorage.removeItem('isCivicConnectVerified');
    localStorage.removeItem('civicConnectPhoneNumber');
  };

  if (loadingAuthState && isVerified === null) {
    // Still determining auth state, perhaps show a global loader or return null
    // For now, let children render, AppStructureClient handles its own loading state
  }

  return (
    <AuthContext.Provider value={{ 
        isVerified, 
        setIsVerified, 
        phoneNumber, 
        setPhoneNumber: setPhoneNumberContext, 
        firebaseUser, 
        confirmationResult, 
        setConfirmationResult, 
        logout 
    }}>
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
