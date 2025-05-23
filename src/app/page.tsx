import type { Issue } from '@/types';
import { mockIssues } from '@/lib/mockData';
import IssueCard from '@/components/issues/IssueCard';
import { generateIssueImage } from '@/ai/flows/generate-issue-image-flow';

// Simulate fetching issues and generate images if they are placeholders.
async function getIssuesWithGeneratedImages(): Promise<Issue[]> {
  // Simulate API delay
  // await new Promise(resolve => setTimeout(resolve, 500));

  const issuesWithImages = await Promise.all(
    mockIssues.map(async (issue) => {
      if (issue.imageUrl && issue.imageUrl.startsWith('https://placehold.co') && issue.imageAiHint) {
        try {
          // console.log(`Dashboard: Generating image for hint: ${issue.imageAiHint}`);
          const imageResult = await generateIssueImage({ prompt: issue.imageAiHint });
          if (imageResult.imageDataUri) {
            return { ...issue, imageUrl: imageResult.imageDataUri };
          }
        } catch (error) {
          console.error(`Dashboard: Failed to generate image for '${issue.imageAiHint}':`, error);
          // Keep placeholder if generation fails
        }
      }
      return issue;
    })
  );

  return issuesWithImages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export default async function DashboardPage() {
  const issues = await getIssuesWithGeneratedImages();

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
