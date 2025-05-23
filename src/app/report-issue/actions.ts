
"use server";

import { z } from 'zod';
// Comment out AI flow and other complex imports for diagnostics
// import { prioritizeIssueReports, type PrioritizeIssueReportsOutput } from '@/ai/flows/prioritize-reports';
// import type { Issue } from '@/types'; 
// import { mockUsers } from '@/lib/mockData'; 

const ReportIssueFormSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters long."),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  address: z.string().optional(),
  timestamp: z.string().optional(), // ISO string
});

interface SubmitIssueResult {
    success: boolean;
    issueId?: string;
    // aiAnalysis?: PrioritizeIssueReportsOutput; // Temporarily removed
    error?: string;
}

export async function submitIssue(formData: FormData): Promise<SubmitIssueResult> {
  const rawFormData = {
    description: formData.get('description'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    address: formData.get('address'),
    timestamp: formData.get('timestamp'),
  };

  console.log("Simplified submitIssue called with rawFormData:", rawFormData);

  const validation = ReportIssueFormSchema.safeParse(rawFormData);

  if (!validation.success) {
    console.error("Form validation failed:", validation.error.flatten().fieldErrors);
    // Ensure a more specific error message if description is missing/short
    const descriptionError = validation.error.flatten().fieldErrors.description?.[0];
    const errorMessage = descriptionError ? `Invalid description: ${descriptionError}` : "Invalid form data.";
    return { success: false, error: errorMessage };
  }
  
  // Simulate success without AI call or mock data interaction
  // This is to test if the AI flow import is causing the chunk loading issue.
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate some async work

  console.log("Simplified submitIssue successful (mock).");
  return { 
    success: true, 
    issueId: `temp-issue-${Date.now()}`,
    // aiAnalysis: { // Mock AI analysis if needed for the toast, or remove from toast
    //   issueType: "N/A (Diagnostic)",
    //   severity: "N/A",
    //   priorityScore: 0,
    //   reason: "Diagnostic mode: AI analysis bypassed."
    // }
  };
}
