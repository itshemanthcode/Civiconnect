
"use server";

import { z } from 'zod';
import type { Issue, AIAnalysis } from '@/types'; 
import { mockUsers, mockIssues } from '@/lib/mockData'; 
// import { prioritizeIssueReports, type PrioritizeIssueReportsOutput } from '@/ai/flows/prioritize-reports';

const ReportIssueFormSchema = z.object({
  reportType: z.string().min(1, "Report type is required."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  address: z.string().optional(),
  timestamp: z.string().optional(), // ISO string
  // Image is handled via FormData, not explicitly in schema for direct parsing
});

interface SubmitIssueResult {
    success: boolean;
    issueId?: string;
    aiAnalysis?: AIAnalysis;
    error?: string;
}

// Helper function to convert File to Data URI
async function fileToDataUri(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${file.type};base64,${base64}`;
}

// Helper to generate AI hint from description
function generateAiHintFromDescription(description: string): string {
  // Take first 1-2 words from description for the hint
  const words = description.trim().split(/\s+/);
  if (words.length === 1) return words[0].toLowerCase();
  if (words.length >= 2) return `${words[0].toLowerCase()} ${words[1].toLowerCase()}`;
  return "reported issue"; // fallback
}

export async function submitIssue(formData: FormData): Promise<SubmitIssueResult> {
  const rawFormData = {
    reportType: formData.get('reportType'),
    description: formData.get('description'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    address: formData.get('address'),
    timestamp: formData.get('timestamp'),
  };

  const validation = ReportIssueFormSchema.safeParse(rawFormData);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const errorMessage = 
      fieldErrors.reportType?.[0] || 
      fieldErrors.description?.[0] || 
      "Invalid form data.";
    return { success: false, error: errorMessage };
  }
  
  const { reportType, description, latitude, longitude, address, timestamp } = validation.data;
  const imageFile = formData.get('image') as File | null;
  
  let imageUrl: string | undefined = undefined;
  let imageAiHint: string | undefined = undefined;

  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await fileToDataUri(imageFile);
      // Generate AI hint even for uploaded images for accessibility/alt text
      imageAiHint = generateAiHintFromDescription(description); 
    } catch (e) {
      console.error("Error converting image to Data URI:", e);
      return { success: false, error: "Failed to process uploaded image."};
    }
  } else {
    // No image uploaded, use placeholder and generate hint for AI image gen
    imageUrl = 'https://placehold.co/600x400.png'; 
    imageAiHint = generateAiHintFromDescription(description);
  }

  const newIssueId = `issue${Date.now()}`;
  
  let issueAiAnalysis: AIAnalysis | undefined = undefined;
  
  // Use the user-selected reportType for aiAnalysis.issueType
  // The prioritizeIssueReports flow is commented out, so we are using mock analysis
  issueAiAnalysis = {
    issueType: reportType, // Use selected type
    severity: "Medium", // Could be refined by AI later if enabled
    priorityScore: Math.floor(Math.random() * 30) + 50, // Random score 50-80
    reason: `Severity and priority determined by simplified mock analysis. User classified as: ${reportType}.`
  };
  /*
  // If prioritizeIssueReports flow was active:
  try {
    const aiResult = await prioritizeIssueReports({ reportText: description });
    issueAiAnalysis = {
      issueType: aiResult.issueType, // AI could confirm or refine user's type
      severity: aiResult.severity,
      priorityScore: aiResult.priorityScore,
      reason: aiResult.reason,
    };
  } catch (error) {
    console.error("Error getting AI analysis for issue text:", error);
    // Fallback if AI analysis fails
    issueAiAnalysis = {
      issueType: reportType, // Fallback to user selected type
      severity: "Unknown",
      priorityScore: 0,
      reason: "AI analysis failed. User classified as: " + reportType
    };
  }
  */

  const newIssue: Issue = {
    id: newIssueId,
    description,
    imageUrl,
    imageAiHint, // Store the hint
    timestamp: timestamp || new Date().toISOString(),
    gpsLocation: {
      latitude: parseFloat(latitude || '0'),
      longitude: parseFloat(longitude || '0'),
      address: address || `Lat: ${parseFloat(latitude || '0').toFixed(3)}, Lon: ${parseFloat(longitude || '0').toFixed(3)}`,
    },
    status: 'Reported',
    upvotes: 0,
    verifications: 0,
    reporterId: mockUsers[0]?.id || 'user_anon', 
    aiAnalysis: issueAiAnalysis,
  };

  mockIssues.unshift(newIssue); 

  console.log("New issue submitted and added to mockData:", newIssue.id);
  return { 
    success: true, 
    issueId: newIssueId,
    aiAnalysis: issueAiAnalysis,
  };
}

    