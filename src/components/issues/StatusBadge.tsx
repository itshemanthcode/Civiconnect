import type { IssueStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusColors: Record<IssueStatus, string> = {
    Reported: 'bg-yellow-500 hover:bg-yellow-600',
    Verified: 'bg-blue-500 hover:bg-blue-600',
    Notified: 'bg-purple-500 hover:bg-purple-600',
    Resolved: 'bg-green-500 hover:bg-green-600',
  };

  return (
    <Badge className={cn('text-white', statusColors[status], className)}>
      {status}
    </Badge>
  );
}
