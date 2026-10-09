export type UserRole = 'citizen' | 'officer' | 'supervisor' | 'admin';

export type PriorityLevel = 'Routine' | 'Medium' | 'High' | 'Urgent';

export type ComplaintStatus = 
  | 'submitted'
  | 'triaged'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'reopened'
  | 'closed';

export interface PriorityBreakdown {
  safetyRisk: number; // 0-40
  affectedInfra: number; // 0-20
  duration: number; // 0-15
  severity: number; // 0-15
  corroboratingEvidence: number; // 0-10
}

export interface PriorityScore {
  total: number;
  label: PriorityLevel;
  breakdown: PriorityBreakdown;
  ruleIds: string[];
  explanation: string;
  policyVersion: string;
}

export interface AIExtraction {
  issueCategory: string;
  shortSummary: string;
  affectedAsset: string;
  locationText: string;
  ward: string;
  duration: string;
  impact: string;
  safetyIndicators: string[];
  missingFields: string[];
  suggestedDepartment: string;
  confidencePerField: {
    category: number;
    summary: number;
    asset: number;
    ward: number;
    department: number;
    overall: number;
  };
  modelUsed: string;
  extractedAt: string;
}

export interface DuplicateCandidate {
  targetId: string;
  targetRef: string;
  targetTitle: string;
  textSimilarity: number;
  geoDistanceMeters: number;
  timeDiffHours: number;
  overallScore: number;
  reason: string;
  status: 'Candidate' | 'Linked' | 'Dismissed';
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  notes?: string;
  evidenceUrl?: string;
}

export interface InternalNote {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface CitizenContact {
  name: string;
  phoneMasked: string;
  emailMasked: string;
  preferredLang: string;
  notifyChannel: 'WhatsApp' | 'SMS' | 'Email';
}

export interface EvidenceFile {
  id: string;
  name: string;
  url: string;
  size: string;
  uploadedAt: string;
  mimeType: string;
}

export interface Complaint {
  id: string;
  trackingNumber: string; // e.g. "MCD-2026-X8K9L2"
  title: string;
  rawDescription: string;
  category: string;
  status: ComplaintStatus;
  ward: string;
  city: string;
  locationText: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  createdAt: string;
  updatedAt: string;
  citizenContact: CitizenContact;
  evidencePhotos: EvidenceFile[];
  aiExtraction: AIExtraction;
  priorityScore: PriorityScore;
  department: string;
  departmentConfidence: number;
  assignedOfficer: string | null;
  slaDeadline: string;
  slaHours: number;
  slaStatus: 'On Track' | 'At Risk' | 'Overdue';
  duplicates: DuplicateCandidate[];
  timeline: TimelineEvent[];
  internalNotes: InternalNote[];
  resolutionEvidence?: {
    text: string;
    photoUrl?: string;
    closedBy: string;
    closedAt: string;
  };
  clarificationRequests?: {
    id: string;
    requestedAt: string;
    officerQuestion: string;
    citizenReply?: string;
    resolved: boolean;
  }[];
}

export interface DepartmentConfig {
  id: string;
  name: string;
  code: string;
  headName: string;
  email: string;
  activeOfficersCount: number;
  avgResolutionHours: number;
  keywords: string[];
  defaultSlaHours: {
    Urgent: number;
    High: number;
    Medium: number;
    Routine: number;
  };
}

export interface WardConfig {
  id: string;
  name: string;
  zone: string;
  councilorName: string;
  centerCoordinates: { lat: number; lng: number };
  activeComplaintsCount: number;
}

export interface ScoringPolicyWeights {
  version: string;
  safetyRiskMax: number; // default 40
  affectedInfraMax: number; // default 20
  durationMax: number; // default 15
  severityMax: number; // default 15
  evidenceMax: number; // default 10
  urgentThreshold: number; // default 80
  highThreshold: number; // default 60
  mediumThreshold: number; // default 30
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  complaintRef?: string;
  details: string;
}
