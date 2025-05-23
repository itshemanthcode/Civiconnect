
"use client";

import type { Issue } from '@/types';
import { mockIssues } from '@/lib/mockData';
import IssueCard from '@/components/issues/IssueCard';
import { generateIssueImage } from '@/ai/flows/generate-issue-image-flow';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 3; // Number of items to load each time

export default function DashboardPage() {
  const [allRawIssues, setAllRawIssues] = useState<Issue[]>([]);
  const [displayedIssues, setDisplayedIssues] = useState<Issue[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Simulate fetching all raw issue data (metadata only)
    // In a real app, this would be an API call to get issue list without images.
    const sortedIssues = [...mockIssues].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setAllRawIssues(sortedIssues);
    setIsLoading(false);
  }, []);

  const generateImagesForBatch = async (issuesBatch: Issue[]): Promise<Issue[]> => {
    return Promise.all(
      issuesBatch.map(async (issue) => {
        if (issue.imageUrl && issue.imageUrl.startsWith('https://placehold.co') && issue.imageAiHint) {
          try {
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
  };

  useEffect(() => {
    if (allRawIssues.length === 0 || isLoading) return;

    const loadInitialBatch = async () => {
      setIsLoadingMore(true);
      const initialBatchRaw = allRawIssues.slice(0, ITEMS_PER_PAGE);
      const initialBatchWithImages = await generateImagesForBatch(initialBatchRaw);
      setDisplayedIssues(initialBatchWithImages);
      setCurrentPage(1);
      setHasMore(allRawIssues.length > ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    };

    loadInitialBatch();
  }, [allRawIssues, isLoading]); // Depend on isLoading to run after initial raw issues are set

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    const nextBatchRaw = allRawIssues.slice(startIndex, endIndex);
    if (nextBatchRaw.length === 0) {
      setHasMore(false);
      setIsLoadingMore(false);
      return;
    }

    const nextBatchWithImages = await generateImagesForBatch(nextBatchRaw);
    
    setDisplayedIssues(prevIssues => [...prevIssues, ...nextBatchWithImages]);
    setCurrentPage(nextPage);
    setHasMore(allRawIssues.length > endIndex);
    setIsLoadingMore(false);
  };

  if (isLoading && displayedIssues.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Community Reports</h1>
      
      {displayedIssues.length === 0 && !isLoadingMore && (
        <p className="text-muted-foreground">No issues reported yet. Be the first to report an issue!</p>
      )}

      <div className="grid grid-cols-1 gap-6">
        {displayedIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>

      {isLoadingMore && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading more reports...</p>
        </div>
      )}

      {hasMore && !isLoadingMore && (
        <div className="flex justify-center pt-4">
          <Button onClick={handleLoadMore} variant="outline" className="shadow-md">
            Load More
          </Button>
        </div>
      )}
       {!hasMore && displayedIssues.length > 0 && (
        <p className="text-center text-muted-foreground pt-4">You've reached the end of the reports.</p>
      )}
    </div>
  );
}
