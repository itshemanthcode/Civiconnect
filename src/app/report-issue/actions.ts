"use server";

import { z } from 'zod';
import { prioritizeIssueReports, type PrioritizeIssueReportsOutput } from '@/ai/flows/prioritize-reports';
import type { Issue } from '@/types'; // Assuming types are defined
import { mockUsers } from '@/lib/mockData'; // For mock reporterId

const ReportIssueFormSchema = z.object({
  description: z.string().min(10),
  // image: z.any().optional(), // Assuming image handling is complex and mocked for now
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  address: z.string().optional(),
  timestamp: z.string().optional(), // ISO string
});

interface SubmitIssueResult {
    success: boolean;
    issueId?: string;
    aiAnalysis?: PrioritizeIssueReportsOutput;
    error?: string;
}

export async function submitIssue(formData: FormData): Promise<SubmitIssueResult> {
  const rawFormData = {
    description: formData.get('description'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    address: formData.get('address'),
    timestamp: formData.get('timestamp'),
    // image handling would be here
  };

  const validation = ReportIssueFormSchema.safeParse(rawFormData);

  if (!validation.success) {
    console.error("Form validation failed:", validation.error.flatten().fieldErrors);
    return { success: false, error: "Invalid form data. " + validation.error.flatten().fieldErrors.description?.[0] };
  }

  const { description, latitude, longitude, address, timestamp }_ = validation.data;
  const parsedTimestamp = timestamp || new Date().toISOString();
  const parsedLatitude = parseFloat(latitude || '0');
  const parsedLongitude = parseFloat(longitude || '0');
  
  try {
    // 1. Prioritize with AI
    const aiResult = await prioritizeIssueReports({ reportText: description });

    // 2. (Mock) Save the issue to a database
    const newIssue: Issue = {
      id: `issue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      description,
      // imageUrl: "mock-image-url.png" // if image was processed
      timestamp: parsedTimestamp,
      gpsLocation: {
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        address: address,
      },
      status: 'Reported',
      upvotes: 0,
      verifications: 0,
      reporterId: mockUsers[0].id, // Mock reporter
      aiAnalysis: aiResult,
    };

    console.log("New issue (mock save):", newIssue);
    // In a real app: await db.issues.create(newIssue);

    return { success: true, issueId: newIssue.id, aiAnalysis: aiResult };

  } catch (error) {
    console.error("Error submitting issue:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during submission.";
    return { success: false, error: errorMessage };
  }
}
