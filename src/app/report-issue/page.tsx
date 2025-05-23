
"use client"; // Make the page itself a client component

import ReportIssueFormLoader from '@/components/issues/ReportIssueFormLoader';

export default function ReportIssuePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Report New Issue</h1>
        <p className="text-muted-foreground">
          Help improve your community by reporting infrastructure problems.
        </p>
      </header>
      <ReportIssueFormLoader />
    </div>
  );
}
