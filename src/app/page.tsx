import type { Issue } from '@/types';
import { mockIssues } from '@/lib/mockData';
import IssueCard from '@/components/issues/IssueCard';

// Simulate fetching issues. In a real app, this would be an API call.
async function getIssues(): Promise<Issue[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockIssues.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export default async function DashboardPage() {
  const issues = await getIssues();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Community Reports</h1>
      
      {issues.length === 0 && (
        <p className="text-muted-foreground">No issues reported yet. Be the first to report an issue!</p>
      )}

      <div className="grid grid-cols-1 gap-6">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
