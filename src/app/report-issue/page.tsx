
import dynamic from 'next/dynamic';

// Dynamically import ReportIssueForm with SSR turned off
const ReportIssueForm = dynamic(() => import('@/components/issues/ReportIssueForm'), {
  ssr: false,
  loading: () => <p>Loading form...</p> // Optional: add a loading state
});

export default function ReportIssuePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Report New Issue</h1>
        <p className="text-muted-foreground">
          Help improve your community by reporting infrastructure problems.
        </p>
      </header>
      <ReportIssueForm />
    </div>
  );
}
