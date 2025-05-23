
"use client";

import { useState, useEffect, ComponentType, Suspense } from 'react';
// We don't import ReportIssueForm props type here to avoid pulling it into server analysis prematurely.
// We'll assume it takes no specific props for this loader, or define a placeholder.
interface ReportIssueFormProps {} // Placeholder for ReportIssueForm props

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <p className="text-lg font-semibold text-primary mb-2">Preparing form...</p>
    <p className="text-muted-foreground">Please wait.</p>
  </div>
);

const DynamicImportLoadingFallback = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-semibold text-primary mb-2">Loading form interface...</p>
        <p className="text-muted-foreground">Please stand by.</p>
    </div>
);

export default function ReportIssueFormLoader() {
  // State to hold the dynamically imported component
  const [ClientLoadedForm, setClientLoadedForm] = useState<ComponentType<ReportIssueFormProps> | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after the component mounts.
    // We import 'next/dynamic' and then use it to load ReportIssueForm.
    import('next/dynamic').then(mod => {
      const dynamic = mod.default;
      const ReportIssueForm = dynamic(() => import('@/components/issues/ReportIssueForm'), {
        ssr: false, // Ensure it's not server-side rendered
        loading: () => <DynamicImportLoadingFallback />, // Loading state for the dynamic import itself
      });
      setClientLoadedForm(() => ReportIssueForm); // Set the loaded component to state
    });
  }, []); // Empty dependency array ensures this runs once on mount

  if (!ClientLoadedForm) {
    // Show a generic loading fallback until the dynamic import process starts and ClientLoadedForm is set
    return <LoadingFallback />;
  }

  // Once ClientLoadedForm is available, render it.
  // Suspense can be used as an additional layer, though `dynamic` has its own `loading`.
  return (
    <Suspense fallback={<DynamicImportLoadingFallback />}>
      <ClientLoadedForm />
    </Suspense>
  );
}
