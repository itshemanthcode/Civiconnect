
"use client";

import dynamic from 'next/dynamic';

// Dynamically import ReportIssueForm with SSR turned off
const ReportIssueForm = dynamic(() => import('@/components/issues/ReportIssueForm'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {/* Simplified loading indicator */}
      <p className="text-lg font-semibold text-primary mb-2">Loading Form...</p>
      <p className="text-muted-foreground">Please wait a moment.</p>
    </div>
  ),
});

export default function ReportIssueFormLoader() {
  return <ReportIssueForm />;
}
