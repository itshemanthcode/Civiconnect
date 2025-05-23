import { config } from 'dotenv';
config();

import '@/ai/flows/prioritize-reports.ts';
import '@/ai/flows/generate-issue-image-flow.ts'; // Added new flow
