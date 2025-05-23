
export type IssueStatus = "Reported" | "Verified" | "Notified" | "Resolved";

export interface AIAnalysis {
  issueType: string;
  severity: string;
  priorityScore: number;
  reason: string;
}

export interface Issue {
  id: string;
  description: string;
  imageUrl?: string;
  imageAiHint?: string;
  timestamp: string; // ISO string
  gpsLocation: {
    latitude: number;
    longitude: number;
    address?: string; // Optional address string
  };
  status: IssueStatus;
  upvotes: number;
  verifications: number;
  reporterId: string;
  aiAnalysis?: AIAnalysis;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  imageAiHint?: string;
  points: number;
  badges: Array<{ name: string; icon: React.ElementType; description: string }>;
  issuesReported: number;
  issuesVerified: number;
}
