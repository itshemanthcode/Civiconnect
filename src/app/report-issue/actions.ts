
"use server";

import { z } from 'zod';
import type { Issue, AIAnalysis } from '@/types'; 
import { mockUsers, mockIssues } from '@/lib/mockData'; 
// import { prioritizeIssueReports, type PrioritizeIssueReportsOutput } from '@/ai/flows/prioritize-reports'; // Keep commented if causing chunk issues

const ReportIssueFormSchema = z.object({
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
    aiAnalysis?: AIAnalysis; // Keep this if prioritizeIssueReports is used, otherwise remove or make optional
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
  return description.split(/\s+/).slice(0, 2).join(' ').toLowerCase() || "reported issue";
}

export async function submitIssue(formData: FormData): Promise<SubmitIssueResult> {
  const rawFormData = {
    description: formData.get('description'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    address: formData.get('address'),
    timestamp: formData.get('timestamp'),
  };

  const validation = ReportIssueFormSchema.safeParse(rawFormData);

  if (!validation.success) {
    const descriptionError = validation.error.flatten().fieldErrors.description?.[0];
    const errorMessage = descriptionError ? `Invalid description: ${descriptionError}` : "Invalid form data.";
    return { success: false, error: errorMessage };
  }
  
  const { description, latitude, longitude, address, timestamp } = validation.data;
  const imageFile = formData.get('image') as File | null;
  
  let imageUrl: string | undefined = undefined;
  let imageAiHint: string | undefined = undefined;

  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await fileToDataUri(imageFile);
      imageAiHint = generateAiHintFromDescription(description);
    } catch (e) {
      console.error("Error converting image to Data URI:", e);
      // Proceed without image if conversion fails, or return error
      return { success: false, error: "Failed to process uploaded image."};
    }
  } else {
    // No image uploaded, use placeholder and generate hint for AI image gen
    imageUrl = 'https://placehold.co/600x400.png'; // Default placeholder
    imageAiHint = generateAiHintFromDescription(description);
  }

  const newIssueId = `issue${Date.now()}`;
  
  // --- AI Analysis (Text) ---
  // This part can be re-enabled if the chunk loading error is resolved
  // For now, we'll mock it or skip it if prioritizeIssueReports is commented out.
  let issueAiAnalysis: AIAnalysis | undefined = undefined;
  /*
  try {
    // If prioritizeIssueReports is available and working:
    // const aiResult = await prioritizeIssueReports({ reportText: description });
    // issueAiAnalysis = {
    //   issueType: aiResult.issueType,
    //   severity: aiResult.severity,
    //   priorityScore: aiResult.priorityScore,
    //   reason: aiResult.reason,
    // };

    // Mock analysis if prioritizeIssueReports is commented out:
    issueAiAnalysis = {
      issueType: "General Report (Mock)",
      severity: "Medium (Mock)",
      priorityScore: 50,
      reason: "AI text analysis is currently in simplified mode."
    };
  } catch (error) {
    console.error("Error getting AI analysis for issue text:", error);
    // Fallback if AI analysis fails
    issueAiAnalysis = {
      issueType: "Uncategorized",
      severity: "Unknown",
      priorityScore: 0,
      reason: "AI analysis failed or was not run."
    };
  }
  */
  // Simplified mock analysis:
   issueAiAnalysis = {
      issueType: description.split(" ")[0] || "Issue", // Simple type from first word
      severity: "Medium",
      priorityScore: Math.floor(Math.random() * 30) + 50, // Random score 50-80
      reason: "Severity and priority determined by simplified mock analysis."
    };


  const newIssue: Issue = {
    id: newIssueId,
    description,
    imageUrl,
    imageAiHint,
    timestamp: timestamp || new Date().toISOString(),
    gpsLocation: {
      latitude: parseFloat(latitude || '0'),
      longitude: parseFloat(longitude || '0'),
      address: address || `Lat: ${parseFloat(latitude || '0').toFixed(3)}, Lon: ${parseFloat(longitude || '0').toFixed(3)}`,
    },
    status: 'Reported',
    upvotes: 0,
    verifications: 0,
    reporterId: mockUsers[0]?.id || 'user_anon', // Default to first mock user or anonymous
    aiAnalysis: issueAiAnalysis,
  };

  mockIssues.unshift(newIssue); // Add to the beginning of the array

  console.log("New issue submitted and added to mockData:", newIssue.id);
  return { 
    success: true, 
    issueId: newIssueId,
    aiAnalysis: issueAiAnalysis,
  };
}
