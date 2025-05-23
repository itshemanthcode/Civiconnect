
"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react'; // Or a more specific loading component

// Dynamically import ReportIssueForm with SSR turned off
const ReportIssueForm = dynamic(() => import('@/components/issues/ReportIssueForm'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading form...</p>
    </div>
  ),
});

export default function ReportIssueFormLoader() {
  return <ReportIssueForm />;
}
