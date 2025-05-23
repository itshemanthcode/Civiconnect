"use client";

import type { Issue } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import { ThumbsUp, MapPin, Clock, UserCircle2, Brain, BarChart3, FileText, Lightbulb } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface IssueDetailsCardProps {
  issue: Issue;
}

export default function IssueDetailsCard({ issue: initialIssue }: IssueDetailsCardProps) {
  const [issue, setIssue] = useState(initialIssue);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const { toast } = useToast();

  const handleUpvote = async () => {
    setIsUpvoting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIssue(prev => ({ ...prev, upvotes: prev.upvotes + 1, verifications: prev.verifications + 1 }));
    toast({ title: "Issue Upvoted!", description: "Your vote has been counted."});
    setIsUpvoting(false);
  };
  
  const formattedTimestamp = format(new Date(issue.timestamp), "MMMM d, yyyy 'at' h:mm a");

  return (
    <Card className="w-full overflow-hidden">
      {issue.imageUrl && (
        <div className="relative w-full h-64 sm:h-80 bg-muted">
          <Image
            src={issue.imageUrl}
            alt={`Image for issue: ${issue.description.substring(0,30)}`}
            layout="fill"
            objectFit="contain" // Changed to contain to show full image
            className="p-2"
            data-ai-hint={issue.imageAiHint || "civic issue report"}
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl">{issue.aiAnalysis?.issueType || 'Civic Issue Report'}</CardTitle>
          <StatusBadge status={issue.status} />
        </div>
        <CardDescription className="flex flex-col space-y-1 text-xs text-muted-foreground pt-1">
           <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" /> Reported: {formattedTimestamp}</span>
           <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1.5" /> Location: {issue.gpsLocation.address || `Lat: ${issue.gpsLocation.latitude.toFixed(3)}, Lon: ${issue.gpsLocation.longitude.toFixed(3)}`}</span>
           <span className="flex items-center"><UserCircle2 className="h-3.5 w-3.5 mr-1.5" /> Reporter ID: {issue.reporterId}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground mb-1">Description</h3>
          <p className="text-sm text-foreground">{issue.description}</p>
        </div>
        
        {issue.aiAnalysis && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary" />
                AI Analysis
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-start">
                  <Lightbulb className="h-4 w-4 mr-2 mt-0.5 text-accent flex-shrink-0" />
                  <div><strong>Type:</strong> {issue.aiAnalysis.issueType}</div>
                </div>
                <div className="flex items-start">
                  <BarChart3 className="h-4 w-4 mr-2 mt-0.5 text-accent flex-shrink-0" />
                  <div><strong>Severity:</strong> {issue.aiAnalysis.severity} ({issue.aiAnalysis.priorityScore}/100)</div>
                </div>
                <div className="flex items-start col-span-1 sm:col-span-2">
                  <FileText className="h-4 w-4 mr-2 mt-0.5 text-accent flex-shrink-0" />
                  <div><strong>Reason:</strong> {issue.aiAnalysis.reason}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-base px-3 py-1.5">
            <ThumbsUp className="h-4 w-4 mr-2" />
            {issue.upvotes} Upvotes
          </Badge>
          <Badge variant="outline" className="text-base px-3 py-1.5">
            {issue.verifications} Verifications
          </Badge>
        </div>
        <Button onClick={handleUpvote} disabled={isUpvoting} className="w-full sm:w-auto">
          {isUpvoting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ThumbsUp className="h-4 w-4 mr-2" />}
          {isUpvoting ? 'Voting...' : 'Upvote & Verify'}
        </Button>
      </CardFooter>
    </Card>
  );
}
