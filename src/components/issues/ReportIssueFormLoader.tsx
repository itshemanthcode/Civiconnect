
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReportIssueForm with SSR turned off
// The component itself is named ReportIssueForm, but we assign it to a const
// for clarity in this loader.
const DynamicallyLoadedReportIssueForm = dynamic(() => import('@/components/issues/ReportIssueForm'), {
  ssr: false, // This is crucial
  loading: () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-lg font-semibold text-primary mb-2">Loading form...</p>
      <p className="text-muted-foreground">Please wait a moment.</p>
    </div>
  ),
});

export default function ReportIssueFormLoader() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component mounts
    setIsClient(true);
  }, []);

  // Conditionally render the dynamically imported component.
  // On the server and during the initial client render (before useEffect runs),
  // this will render the loading fallback.
  // After mount (isClient is true), it will render the actual form component.
  if (!isClient) {
    // This loading state will be shown on the server and during initial client render.
    // It's similar to the 'loading' prop of the dynamic import but ensures
    // DynamicallyLoadedReportIssueForm is not even in the VDOM tree initially.
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-semibold text-primary mb-2">Preparing form...</p>
        <p className="text-muted-foreground">Please wait.</p>
      </div>
    );
  }

  // Now that we're on the client and mounted, render the form.
  // The `dynamic` import's own `loading` prop will handle the phase
  // where `DynamicallyLoadedReportIssueForm`'s code is being fetched.
  return <DynamicallyLoadedReportIssueForm />;
}
