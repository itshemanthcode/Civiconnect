import Link from 'next/link';
import Image from 'next/image';
import type { Issue } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MapPin, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';

interface IssueCardProps {
  issue: Issue;
}

export default function IssueCard({ issue }: IssueCardProps) {
  const timeAgo = formatDistanceToNow(new Date(issue.timestamp), { addSuffix: true });

  return (
    <Link href={`/issues/${issue.id}`} className="block hover:shadow-lg transition-shadow duration-200 rounded-lg">
      <Card className="overflow-hidden h-full flex flex-col">
        {issue.imageUrl && (
          <div className="relative w-full h-48">
            <Image
              src={issue.imageUrl}
              alt={issue.description.substring(0, 50)}
              layout="fill"
              objectFit="cover"
              data-ai-hint={issue.imageAiHint || "civic issue"}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-lg line-clamp-2">{issue.aiAnalysis?.issueType || 'Reported Issue'}</CardTitle>
          <div className="flex items-center text-xs text-muted-foreground pt-1">
            <Clock className="h-3 w-3 mr-1" />
            {timeAgo}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">{issue.description}</p>
          <div className="mt-3 flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{issue.gpsLocation.address || `Lat: ${issue.gpsLocation.latitude.toFixed(3)}, Lon: ${issue.gpsLocation.longitude.toFixed(3)}`}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-4">
          <StatusBadge status={issue.status} />
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="flex items-center">
              <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
              {issue.upvotes}
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
