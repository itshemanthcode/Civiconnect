
import type { Issue, UserProfile, IssueStatus } from '@/types';
import { Award, ShieldCheck, Zap } from 'lucide-react';

export const mockUsers: UserProfile[] = [
  {
    id: 'user1',
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    imageAiHint: 'profile woman',
    points: 1250,
    badges: [
      { name: 'Pothole Patroller', icon: Award, description: 'Reported 10+ potholes' },
      { name: 'Community Verifier', icon: ShieldCheck, description: 'Verified 20+ issues' },
    ],
    issuesReported: 12, // Initial value
    issuesVerified: 28, // Initial value
  },
  {
    id: 'user2',
    name: 'Bob The Builder',
    email: 'bob@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    imageAiHint: 'profile man',
    points: 800,
    badges: [
      { name: 'Streetlight Savior', icon: Zap, description: 'Reported 5+ broken streetlights' },
    ],
    issuesReported: 5,
    issuesVerified: 10,
  },
];

const generateRandomCoordinates = () => ({
  latitude: 34.0522 + (Math.random() - 0.5) * 0.1, // Los Angeles area
  longitude: -118.2437 + (Math.random() - 0.5) * 0.1,
  address: `${Math.floor(Math.random()*1000) + 100} Main St, Anytown, USA`
});

const issueStatuses: IssueStatus[] = ["Reported", "Verified", "Notified", "Resolved"];

export const mockIssues: Issue[] = [
  {
    id: 'issue1',
    description: 'Large pothole on Elm Street near the intersection with Oak Ave. Causing traffic slowdowns and potential vehicle damage.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageAiHint: 'pothole road',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    gpsLocation: generateRandomCoordinates(),
    status: 'Verified',
    upvotes: 23,
    verifications: 15,
    reporterId: 'user1',
    aiAnalysis: {
      issueType: 'Pothole',
      severity: 'High',
      priorityScore: 85,
      reason: 'Reported as large and causing traffic issues, indicating high impact.',
    },
  },
  {
    id: 'issue2',
    description: 'Streetlight out at the park entrance on Pine St. It\'s very dark at night, posing a safety concern for park visitors.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageAiHint: 'streetlight night',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    gpsLocation: generateRandomCoordinates(),
    status: 'Notified',
    upvotes: 12,
    verifications: 8,
    reporterId: 'user2',
    aiAnalysis: {
      issueType: 'Broken Streetlight',
      severity: 'Medium',
      priorityScore: 60,
      reason: 'Safety concern due to darkness, but localized to park entrance.',
    },
  },
  {
    id: 'issue3',
    description: 'Overflowing garbage can at the bus stop on 3rd Avenue. Smells bad and attracts pests.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageAiHint: 'garbage trash',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    gpsLocation: generateRandomCoordinates(),
    status: 'Reported',
    upvotes: 5,
    verifications: 2,
    reporterId: 'user1',
    aiAnalysis: {
      issueType: 'Garbage Dump',
      severity: 'Low',
      priorityScore: 30,
      reason: 'Sanitation issue, localized, requires routine cleanup.',
    },
  },
  {
    id: 'issue4',
    description: 'Waterlogging on Maple Drive after recent rain. Difficult for pedestrians to pass.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageAiHint: 'water puddle',
    timestamp: new Date().toISOString(),
    gpsLocation: generateRandomCoordinates(),
    status: 'Resolved',
    upvotes: 30,
    verifications: 25,
    reporterId: 'user2',
    aiAnalysis: {
      issueType: 'Waterlogging',
      severity: 'Medium',
      priorityScore: 55,
      reason: 'Temporary accessibility issue, dependent on weather and drainage.',
    },
  },
];
