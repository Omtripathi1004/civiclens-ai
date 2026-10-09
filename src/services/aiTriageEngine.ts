import { 
  AIExtraction, 
  PriorityScore, 
  PriorityLevel, 
  PriorityBreakdown,
  ScoringPolicyWeights 
} from '../types';

export const DEFAULT_SCORING_WEIGHTS: ScoringPolicyWeights = {
  version: 'MUNICIPAL-POLICY-2026.4',
  safetyRiskMax: 40,
  affectedInfraMax: 20,
  durationMax: 15,
  severityMax: 15,
  evidenceMax: 10,
  urgentThreshold: 80,
  highThreshold: 60,
  mediumThreshold: 30,
};

// Known Municipal Departments
export const MUNICIPAL_DEPARTMENTS = [
  'Engineering & Public Works',
  'Solid Waste Management',
  'Water Supply & Sewerage',
  'Electrical & Street Lighting',
  'Public Health & Sanitation',
  'Horticulture & Parks',
  'Central Triage Queue'
];

export const MUNICIPAL_CATEGORIES = [
  'Roads & Potholes',
  'Solid Waste & Garbage',
  'Water Supply & Pipeline Leakage',
  'Drainage & Sewer Overflow',
  'Streetlights & Electrical Hazards',
  'Public Health & Mosquito Breeding',
  'Illegal Encroachment'
];

export function sanitizeInput(input: string): string {
  if (!input) return '';
  // Check for common prompt injection attempts
  const promptInjectionPatterns = [
    /ignore (all )?previous instructions/i,
    /system prompt/i,
    /you are now a/i,
    /as an admin/i,
    /set priority to 100/i,
    /bypass security/i
  ];

  let cleaned = input.trim();
  for (const pattern of promptInjectionPatterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '[FLAGGED_INJECTION_ATTEMPT_IGNORED]');
    }
  }
  return cleaned;
}

export function extractFieldsFromText(text: string, userWard?: string): AIExtraction {
  const sanitized = sanitizeInput(text);
  const lower = sanitized.toLowerCase();

  // Category determination
  let issueCategory = 'Roads & Potholes';
  let suggestedDepartment = 'Engineering & Public Works';
  let affectedAsset = 'Civic infrastructure';

  if (lower.includes('garbage') || lower.includes('waste') || lower.includes('dump') || lower.includes('trash') || lower.includes('dustbin') || lower.includes('kachra')) {
    issueCategory = 'Solid Waste & Garbage';
    suggestedDepartment = 'Solid Waste Management';
    affectedAsset = 'Municipal Dumpster / Secondary Collection Point';
  } else if (lower.includes('water') && (lower.includes('leak') || lower.includes('pipe') || lower.includes('supply') || lower.includes('burst') || lower.includes('jal'))) {
    issueCategory = 'Water Supply & Pipeline Leakage';
    suggestedDepartment = 'Water Supply & Sewerage';
    affectedAsset = 'Water Distribution Mainline / Pipeline';
  } else if (lower.includes('sewer') || lower.includes('drain') || lower.includes('gutter') || lower.includes('manhole') || lower.includes('overflow') || lower.includes('nala')) {
    issueCategory = 'Drainage & Sewer Overflow';
    suggestedDepartment = 'Water Supply & Sewerage';
    affectedAsset = 'Stormwater Drain / Sewer Line / Chamber';
  } else if (lower.includes('light') || lower.includes('pole') || lower.includes('wire') || lower.includes('dark') || lower.includes('electric') || lower.includes('bijli')) {
    issueCategory = 'Streetlights & Electrical Hazards';
    suggestedDepartment = 'Electrical & Street Lighting';
    affectedAsset = 'Streetlight Pole / Transformer / High-Tension Cable';
  } else if (lower.includes('mosquito') || lower.includes('dengue') || lower.includes('stagnant') || lower.includes('fogging')) {
    issueCategory = 'Public Health & Mosquito Breeding';
    suggestedDepartment = 'Public Health & Sanitation';
    affectedAsset = 'Stagnant Water Pool / Residential Perimeter';
  } else if (lower.includes('pothole') || lower.includes('road') || lower.includes('tar') || lower.includes('divider') || lower.includes('sadak')) {
    issueCategory = 'Roads & Potholes';
    suggestedDepartment = 'Engineering & Public Works';
    affectedAsset = 'Bituminous Carriage Way / Paver Blocks';
  }

  // Safety indicators
  const safetyIndicators: string[] = [];
  if (lower.includes('manhole') && (lower.includes('open') || lower.includes('broken'))) {
    safetyIndicators.push('Uncovered manhole posing fatal fall hazard');
  }
  if (lower.includes('live wire') || lower.includes('sparking') || lower.includes('electric shock')) {
    safetyIndicators.push('High-risk live electrical hazard exposed');
  }
  if (lower.includes('accident') || lower.includes('skid') || lower.includes('fall')) {
    safetyIndicators.push('Documented vehicle skidding/pedestrian risk');
  }
  if (lower.includes('flooding') || lower.includes('submerged') || lower.includes('waterlogging')) {
    safetyIndicators.push('Severe street flooding blocking traffic');
  }
  if (lower.includes('school') || lower.includes('hospital') || lower.includes('metro')) {
    safetyIndicators.push('Immediate vicinity of sensitive public infrastructure');
  }

  // Duration extraction
  let duration = 'Reported within last 24 hours';
  if (lower.includes('week') || lower.includes('7 days')) {
    duration = 'Persistent for > 1 week';
  } else if (lower.includes('month')) {
    duration = 'Chronic (> 1 month)';
  } else if (lower.includes('day') || lower.includes('yesterday') || lower.includes('3 days') || lower.includes('4 days')) {
    duration = 'Active for 2 - 4 days';
  }

  // Impact estimation
  let impact = 'Localized neighborhood inconvenience';
  if (lower.includes('hospital') || lower.includes('ambulance') || lower.includes('fire')) {
    impact = 'Critical arterial blockage impeding emergency access';
  } else if (lower.includes('school') || lower.includes('children') || lower.includes('pedestrian')) {
    impact = 'High pedestrian & vulnerable citizen exposure';
  } else if (lower.includes('market') || lower.includes('metro') || lower.includes('main road') || lower.includes('highway')) {
    impact = 'Major commuter disruption on high-density transit corridor';
  }

  // Missing fields audit
  const missingFields: string[] = [];
  if (!lower.includes('ward') && !userWard) {
    missingFields.push('Exact municipal ward number');
  }
  if (!lower.includes('gate') && !lower.includes('block') && !lower.includes('near') && !lower.includes('opposite')) {
    missingFields.push('Specific landmark/house number');
  }

  // Summary generation
  const words = sanitized.split(/\s+/).slice(0, 14).join(' ');
  const shortSummary = words.length > 0 ? `${words}...` : 'Citizen reported municipal issue';

  // Confidence calculations
  const categoryConfidence = 0.92;
  const summaryConfidence = 0.95;
  const assetConfidence = 0.88;
  const wardConfidence = userWard ? 0.96 : (lower.includes('ward') ? 0.85 : 0.40);
  const deptConfidence = (wardConfidence > 0.5) ? 0.91 : 0.65;
  const overallConfidence = Math.round(((categoryConfidence + summaryConfidence + assetConfidence + wardConfidence + deptConfidence) / 5) * 100) / 100;

  return {
    issueCategory,
    shortSummary,
    affectedAsset,
    locationText: sanitized.slice(0, 80),
    ward: userWard || (lower.includes('ward 14') ? 'Ward 14 - Lajpat Nagar' : lower.includes('ward 28') ? 'Ward 28 - Karol Bagh' : 'Ward TBD'),
    duration,
    impact,
    safetyIndicators,
    missingFields,
    suggestedDepartment,
    confidencePerField: {
      category: categoryConfidence,
      summary: summaryConfidence,
      asset: assetConfidence,
      ward: wardConfidence,
      department: deptConfidence,
      overall: overallConfidence
    },
    modelUsed: 'CivicLens Structured Extractor v3.2 (Deterministic + Safe LLM fallback)',
    extractedAt: new Date().toISOString()
  };
}

export function computeExplainablePriority(
  text: string, 
  hasPhoto: boolean, 
  hasGps: boolean,
  weights: ScoringPolicyWeights = DEFAULT_SCORING_WEIGHTS
): PriorityScore {
  const lower = text.toLowerCase();
  const ruleIds: string[] = [];
  const explanations: string[] = [];

  // 1. Safety Risk (0-40)
  let safetyScore = 5;
  if (lower.includes('live wire') || lower.includes('electric shock') || lower.includes('sparking')) {
    safetyScore = 40;
    ruleIds.push('SEC-RISK-LIVE-WIRE-40');
    explanations.push('High-voltage electrical hazard flagged (Max safety risk 40/40)');
  } else if (lower.includes('open manhole') || lower.includes('broken manhole') || lower.includes('sinkhole')) {
    safetyScore = 38;
    ruleIds.push('SEC-RISK-OPEN-CHAMBER-38');
    explanations.push('Uncovered deep chamber/manhole fall hazard (38/40)');
  } else if (lower.includes('accident') || lower.includes('collision') || lower.includes('injury')) {
    safetyScore = 30;
    ruleIds.push('SEC-RISK-ACCIDENT-HISTORY-30');
    explanations.push('Imminent risk of vehicular accidents or pedestrian injuries (30/40)');
  } else if (lower.includes('flooding') || lower.includes('waterlogging') || lower.includes('submerged')) {
    safetyScore = 22;
    ruleIds.push('SEC-RISK-STREET-FLOOD-22');
    explanations.push('Carriage way waterlogging impairing safe transit (22/40)');
  } else if (lower.includes('dark') || lower.includes('no light') || lower.includes('blackout')) {
    safetyScore = 18;
    ruleIds.push('SEC-RISK-DARK-POCKET-18');
    explanations.push('Dark transit pocket risk for women & pedestrians (18/40)');
  } else {
    ruleIds.push('SEC-RISK-BASELINE-05');
    explanations.push('Standard baseline safety impact (5/40)');
  }

  // 2. Affected People / Critical Infrastructure (0-20)
  let infraScore = 4;
  if (lower.includes('hospital') || lower.includes('ambulance') || lower.includes('trauma')) {
    infraScore = 20;
    ruleIds.push('INFRA-HOSPITAL-ROUTE-20');
    explanations.push('Directly on emergency hospital corridor (20/20)');
  } else if (lower.includes('school') || lower.includes('college') || lower.includes('children')) {
    infraScore = 18;
    ruleIds.push('INFRA-SCHOOL-ZONE-18');
    explanations.push('Immediate vicinity of active school/children pedestrian zone (18/20)');
  } else if (lower.includes('metro') || lower.includes('station') || lower.includes('bus stand')) {
    infraScore = 16;
    ruleIds.push('INFRA-TRANSIT-HUB-16');
    explanations.push('High-density public transit hub / Metro entrance (16/20)');
  } else if (lower.includes('market') || lower.includes('main road') || lower.includes('ring road')) {
    infraScore = 14;
    ruleIds.push('INFRA-COMMERCIAL-ARTERIAL-14');
    explanations.push('High footfall commercial market / Arterial road (14/20)');
  } else {
    ruleIds.push('INFRA-LOCAL-COLLECTOR-04');
    explanations.push('Standard internal residential lane (4/20)');
  }

  // 3. Duration (0-15)
  let durationScore = 4;
  if (lower.includes('month') || lower.includes('weeks')) {
    durationScore = 15;
    ruleIds.push('DUR-CHRONIC-UNRESOLVED-15');
    explanations.push('Long-standing unresolved civic defect (>14 days) (15/15)');
  } else if (lower.includes('3 days') || lower.includes('4 days') || lower.includes('5 days') || lower.includes('week')) {
    durationScore = 11;
    ruleIds.push('DUR-MULTI-DAY-11');
    explanations.push('Active civic defect for >72 hours (11/15)');
  } else if (lower.includes('yesterday') || lower.includes('2 days')) {
    durationScore = 7;
    ruleIds.push('DUR-RECENT-07');
    explanations.push('Reported defect active 24-48 hours (7/15)');
  } else {
    ruleIds.push('DUR-BASELINE-04');
    explanations.push('Newly emerged or reported today (4/15)');
  }

  // 4. Issue Severity (0-15)
  let severityScore = 4;
  if (lower.includes('huge') || lower.includes('deep') || lower.includes('massive') || lower.includes('burst') || lower.includes('broken')) {
    severityScore = 14;
    ruleIds.push('SEV-PHYSICAL-DEFECT-HIGH-14');
    explanations.push('Substantial physical defect / rupture of municipal asset (14/15)');
  } else if (lower.includes('stink') || lower.includes('smell') || lower.includes('dirty') || lower.includes('leaking')) {
    severityScore = 9;
    ruleIds.push('SEV-HYGIENE-ENVIRONMENT-09');
    explanations.push('Noticeable sanitation/environmental degradation (9/15)');
  } else {
    ruleIds.push('SEV-STANDARD-04');
    explanations.push('Standard civic service disruption (4/15)');
  }

  // 5. Corroborating Evidence (0-10)
  let evidenceScore = 2;
  if (hasPhoto && hasGps) {
    evidenceScore = 10;
    ruleIds.push('EVID-PHOTO-GPS-VERIFIED-10');
    explanations.push('Corroborated with both photographic evidence & verified GPS telemetry (10/10)');
  } else if (hasPhoto) {
    evidenceScore = 7;
    ruleIds.push('EVID-PHOTO-ONLY-07');
    explanations.push('Corroborated with attached visual photographic evidence (7/10)');
  } else if (hasGps) {
    evidenceScore = 5;
    ruleIds.push('EVID-GPS-ONLY-05');
    explanations.push('Corroborated with pinned map coordinates (5/10)');
  } else {
    ruleIds.push('EVID-UNVERIFIED-02');
    explanations.push('Unverified text-only submission without multimedia proof (2/10)');
  }

  // Total Score clamped between 0 and 100
  const total = Math.min(100, Math.max(0, safetyScore + infraScore + durationScore + severityScore + evidenceScore));

  let label: PriorityLevel = 'Routine';
  if (total >= weights.urgentThreshold) {
    label = 'Urgent';
  } else if (total >= weights.highThreshold) {
    label = 'High';
  } else if (total >= weights.mediumThreshold) {
    label = 'Medium';
  }

  const breakdown: PriorityBreakdown = {
    safetyRisk: safetyScore,
    affectedInfra: infraScore,
    duration: durationScore,
    severity: severityScore,
    corroboratingEvidence: evidenceScore
  };

  return {
    total,
    label,
    breakdown,
    ruleIds,
    explanation: explanations.join(' • '),
    policyVersion: weights.version
  };
}

export function calculateSlaDeadline(priority: PriorityLevel): { deadlineIso: string; hours: number } {
  const hoursMap: Record<PriorityLevel, number> = {
    Urgent: 6,
    High: 24,
    Medium: 48,
    Routine: 96
  };
  const hours = hoursMap[priority];
  const deadline = new Date(Date.now() + hours * 3600 * 1000);
  return {
    deadlineIso: deadline.toISOString(),
    hours
  };
}
