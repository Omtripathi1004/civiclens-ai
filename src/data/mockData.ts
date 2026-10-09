import { Complaint, DepartmentConfig, WardConfig, AuditLogItem } from '../types';

export const SEEDED_DEPARTMENTS: DepartmentConfig[] = [
  {
    id: 'dept-eng',
    name: 'Engineering & Public Works',
    code: 'EPW',
    headName: 'Er. Rajesh Varma (Chief Engineer)',
    email: 'ce.works@mcd.delhi.gov.in',
    activeOfficersCount: 14,
    avgResolutionHours: 18.4,
    keywords: ['pothole', 'road', 'tar', 'flyover', 'divider', 'sidewalk', 'paver', 'craters', 'sinkhole'],
    defaultSlaHours: { Urgent: 6, High: 24, Medium: 48, Routine: 96 }
  },
  {
    id: 'dept-swm',
    name: 'Solid Waste Management',
    code: 'SWM',
    headName: 'Dr. Anita Deshmukh (Addl. Director SWM)',
    email: 'dir.swm@mcd.delhi.gov.in',
    activeOfficersCount: 22,
    avgResolutionHours: 8.2,
    keywords: ['garbage', 'waste', 'dump', 'dustbin', 'kachra', 'trash', 'debris', 'litter', 'compost'],
    defaultSlaHours: { Urgent: 4, High: 12, Medium: 24, Routine: 48 }
  },
  {
    id: 'dept-water',
    name: 'Water Supply & Sewerage',
    code: 'WSS',
    headName: 'Er. Sandeep Pillai (Executive Engg Water)',
    email: 'ee.water@mcd.delhi.gov.in',
    activeOfficersCount: 18,
    avgResolutionHours: 14.6,
    keywords: ['water', 'leakage', 'pipe', 'pipeline', 'sewer', 'drain', 'manhole', 'gutter', 'overflow', 'jala'],
    defaultSlaHours: { Urgent: 6, High: 18, Medium: 36, Routine: 72 }
  },
  {
    id: 'dept-elec',
    name: 'Electrical & Street Lighting',
    code: 'ESL',
    headName: 'Er. Pradeep Sharma (Superintending Engg)',
    email: 'se.elec@mcd.delhi.gov.in',
    activeOfficersCount: 12,
    avgResolutionHours: 11.0,
    keywords: ['light', 'pole', 'dark', 'wire', 'sparking', 'electric', 'bulb', 'led', 'cable', 'transformer'],
    defaultSlaHours: { Urgent: 4, High: 16, Medium: 32, Routine: 72 }
  },
  {
    id: 'dept-health',
    name: 'Public Health & Sanitation',
    code: 'PHS',
    headName: 'Dr. Meenakshi Sundaram (MHO)',
    email: 'mho.health@mcd.delhi.gov.in',
    activeOfficersCount: 16,
    avgResolutionHours: 21.5,
    keywords: ['mosquito', 'dengue', 'malaria', 'stagnant', 'fogging', 'spraying', 'hygiene', 'carcass'],
    defaultSlaHours: { Urgent: 8, High: 24, Medium: 48, Routine: 96 }
  }
];

export const SEEDED_WARDS: WardConfig[] = [
  {
    id: 'ward-14',
    name: 'Ward 14 - Lajpat Nagar Central',
    zone: 'South Zone',
    councilorName: 'Smt. Kavita Mehra',
    centerCoordinates: { lat: 28.5672, lng: 77.2433 },
    activeComplaintsCount: 24
  },
  {
    id: 'ward-28',
    name: 'Ward 28 - Karol Bagh Market',
    zone: 'Central Zone',
    councilorName: 'Shri Harish Khurana',
    centerCoordinates: { lat: 28.6517, lng: 77.1906 },
    activeComplaintsCount: 31
  },
  {
    id: 'ward-52',
    name: 'Ward 52 - Rohini Sector 9',
    zone: 'North Zone',
    councilorName: 'Smt. Vandana Gupta',
    centerCoordinates: { lat: 28.7112, lng: 77.1189 },
    activeComplaintsCount: 17
  },
  {
    id: 'ward-77',
    name: 'Ward 77 - Indiranagar 100ft Rd',
    zone: 'East Zone (Bengaluru)',
    councilorName: 'Shri R. Venkatesh',
    centerCoordinates: { lat: 12.9719, lng: 77.6412 },
    activeComplaintsCount: 19
  },
  {
    id: 'ward-91',
    name: 'Ward 91 - Andheri West Station',
    zone: 'K-West Zone (Mumbai)',
    councilorName: 'Smt. Pratima Patil',
    centerCoordinates: { lat: 19.1197, lng: 72.8464 },
    activeComplaintsCount: 28
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-001',
    trackingNumber: 'MCD-2026-X8K9L2',
    title: 'Open Manhole and Heavy Gutter Overflow Near School Gate',
    rawDescription: 'There is a completely open deep manhole right outside DAV Public School main gate on Ring Road service lane in Ward 14 Lajpat Nagar. School buses and small children pass here every morning. Dirty sewage water is flooding 50 meters of the road. Two two-wheelers already skidded yesterday!',
    category: 'Drainage & Sewer Overflow',
    status: 'assigned',
    ward: 'Ward 14 - Lajpat Nagar Central',
    city: 'Delhi MCD',
    locationText: 'Opposite DAV Public School Gate 2, Ring Road Service Lane, Lajpat Nagar',
    coordinates: { lat: 28.5684, lng: 77.2442 },
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    citizenContact: {
      name: 'Rohan Malhotra',
      phoneMasked: '+91 98110-XXXXX',
      emailMasked: 'rohan.m***@gmail.com',
      preferredLang: 'English',
      notifyChannel: 'WhatsApp'
    },
    evidencePhotos: [
      {
        id: 'ev-1',
        name: 'open_manhole_school_gate.jpg',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
        size: '2.4 MB',
        uploadedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        mimeType: 'image/jpeg'
      }
    ],
    aiExtraction: {
      issueCategory: 'Drainage & Sewer Overflow',
      shortSummary: 'Uncovered deep manhole and severe sewage flooding outside DAV Public School Gate 2',
      affectedAsset: 'Main Trunk Sewer Chamber / Manhole Cover Missing',
      locationText: 'DAV Public School Gate 2, Ring Road Service Lane',
      ward: 'Ward 14 - Lajpat Nagar Central',
      duration: 'Active for > 24 hours with incident reports',
      impact: 'Immediate life-safety fall risk for school students and two-wheeler skids',
      safetyIndicators: [
        'Uncovered manhole posing fatal fall hazard',
        'Immediate vicinity of active school/children zone',
        'Documented vehicle skidding/pedestrian hazard'
      ],
      missingFields: [],
      suggestedDepartment: 'Water Supply & Sewerage',
      confidencePerField: {
        category: 0.96,
        summary: 0.94,
        asset: 0.92,
        ward: 0.98,
        department: 0.95,
        overall: 0.95
      },
      modelUsed: 'CivicLens Structured Extractor v3.2',
      extractedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    priorityScore: {
      total: 92,
      label: 'Urgent',
      breakdown: {
        safetyRisk: 38,
        affectedInfra: 18,
        duration: 11,
        severity: 15,
        corroboratingEvidence: 10
      },
      ruleIds: [
        'SEC-RISK-OPEN-CHAMBER-38',
        'INFRA-SCHOOL-ZONE-18',
        'DUR-MULTI-DAY-11',
        'SEV-PHYSICAL-DEFECT-HIGH-14',
        'EVID-PHOTO-GPS-VERIFIED-10'
      ],
      explanation: 'Uncovered deep chamber fall hazard (38/40) • Immediate vicinity of active school zone (18/20) • Documented incident history • Verified photo and GPS coordinates attached',
      policyVersion: 'MUNICIPAL-POLICY-2026.4'
    },
    department: 'Water Supply & Sewerage',
    departmentConfidence: 0.95,
    assignedOfficer: 'Er. Sandeep Pillai (Executive Engg)',
    slaDeadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    slaHours: 6,
    slaStatus: 'At Risk',
    duplicates: [
      {
        targetId: 'cmp-002',
        targetRef: 'MCD-2026-B4T9Z1',
        targetTitle: 'Broken drain chamber cover near school bus stand',
        textSimilarity: 78,
        geoDistanceMeters: 45,
        timeDiffHours: 1.5,
        overallScore: 91,
        reason: 'High confidence duplicate: Same defect located 45m away with 78% vocabulary overlap reported 1.5h apart.',
        status: 'Candidate'
      }
    ],
    timeline: [
      {
        id: 't-1',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        actor: 'Citizen (Rohan M.)',
        action: 'Complaint Registered',
        notes: 'Submitted via Web Mobile Portal with GPS & photo evidence.'
      },
      {
        id: 't-2',
        timestamp: new Date(Date.now() - 3.8 * 3600 * 1000).toISOString(),
        actor: 'CivicLens AI Agent',
        action: 'AI Triage & Prioritization Completed',
        notes: 'Extracted structured safety flags. Computed Urgent priority (Score 92/100). Auto-routed to Water Supply & Sewerage.'
      },
      {
        id: 't-3',
        timestamp: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
        actor: 'Supervisor (Central Control Room)',
        action: 'Assigned to Field Unit',
        notes: 'Assigned to Emergency Sewerage Response Team #4 led by Er. Sandeep Pillai.'
      }
    ],
    internalNotes: [
      {
        id: 'n-1',
        author: 'Supervisor Central',
        role: 'supervisor',
        text: 'School principal also called zonal emergency cell. Team instructed to erect temporary barricading within 45 mins while concrete slab replacement arrives.',
        timestamp: new Date(Date.now() - 2.2 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'cmp-002',
    trackingNumber: 'MCD-2026-B4T9Z1',
    title: 'Broken drain chamber cover near school bus stand',
    rawDescription: 'Big open gutter chamber right where school buses pick up students near Ring Road Lajpat Nagar. Foul water leaking all over the footpath.',
    category: 'Drainage & Sewer Overflow',
    status: 'triaged',
    ward: 'Ward 14 - Lajpat Nagar Central',
    city: 'Delhi MCD',
    locationText: 'Near Ring Road bus stop and DAV school perimeter',
    coordinates: { lat: 28.5687, lng: 77.2445 },
    createdAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    citizenContact: {
      name: 'Sunita Mehra',
      phoneMasked: '+91 98712-XXXXX',
      emailMasked: 's.mehra***@yahoo.in',
      preferredLang: 'Hindi',
      notifyChannel: 'SMS'
    },
    evidencePhotos: [],
    aiExtraction: {
      issueCategory: 'Drainage & Sewer Overflow',
      shortSummary: 'Gutter chamber cover damaged near school bus pickup',
      affectedAsset: 'Drain Chamber Slab',
      locationText: 'Ring Road bus stop, Lajpat Nagar',
      ward: 'Ward 14 - Lajpat Nagar Central',
      duration: 'Reported today',
      impact: 'Footpath obstruction and child safety',
      safetyIndicators: ['Uncovered manhole posing fatal fall hazard'],
      missingFields: [],
      suggestedDepartment: 'Water Supply & Sewerage',
      confidencePerField: {
        category: 0.94,
        summary: 0.91,
        asset: 0.89,
        ward: 0.95,
        department: 0.93,
        overall: 0.92
      },
      modelUsed: 'CivicLens Structured Extractor v3.2',
      extractedAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString()
    },
    priorityScore: {
      total: 84,
      label: 'Urgent',
      breakdown: {
        safetyRisk: 38,
        affectedInfra: 18,
        duration: 7,
        severity: 14,
        corroboratingEvidence: 7
      },
      ruleIds: ['SEC-RISK-OPEN-CHAMBER-38', 'INFRA-SCHOOL-ZONE-18', 'SEV-PHYSICAL-DEFECT-HIGH-14'],
      explanation: 'Open chamber in school zone • Suggested merging with MCD-2026-X8K9L2',
      policyVersion: 'MUNICIPAL-POLICY-2026.4'
    },
    department: 'Water Supply & Sewerage',
    departmentConfidence: 0.93,
    assignedOfficer: null,
    slaDeadline: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
    slaHours: 6,
    slaStatus: 'On Track',
    duplicates: [
      {
        targetId: 'cmp-001',
        targetRef: 'MCD-2026-X8K9L2',
        targetTitle: 'Open Manhole and Heavy Gutter Overflow Near School Gate',
        textSimilarity: 78,
        geoDistanceMeters: 45,
        timeDiffHours: 1.5,
        overallScore: 91,
        reason: 'Spatial clustering: Located 45m away in same municipal ward within 1.5h reporting window.',
        status: 'Candidate'
      }
    ],
    timeline: [
      {
        id: 't-20',
        timestamp: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
        actor: 'Citizen (Sunita M.)',
        action: 'Complaint Registered',
        notes: 'Submitted via Hindi portal interface.'
      }
    ],
    internalNotes: []
  },
  {
    id: 'cmp-003',
    trackingNumber: 'MCD-2026-Y4M2Q8',
    title: 'Severe Garbage Overflow and Stray Cattle Blocking Market Road',
    rawDescription: 'Massive overflow of municipal community bin at Karol Bagh Ajmal Khan road junction near metro gate 3. Garbage has spilled halfway across the carriageway for 3 days. Foul stench making shopkeepers unable to work, stray cows and dogs scattering plastic bags.',
    category: 'Solid Waste & Garbage',
    status: 'in_progress',
    ward: 'Ward 28 - Karol Bagh Market',
    city: 'Delhi MCD',
    locationText: 'Ajmal Khan Road Junction near Metro Gate 3, Karol Bagh',
    coordinates: { lat: 28.6524, lng: 77.1912 },
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    citizenContact: {
      name: 'Vipin Gupta (Karol Bagh Vyapar Mandal)',
      phoneMasked: '+91 93120-XXXXX',
      emailMasked: 'kb.traders***@gmail.com',
      preferredLang: 'English',
      notifyChannel: 'WhatsApp'
    },
    evidencePhotos: [
      {
        id: 'ev-3',
        name: 'overflowing_bin_ajmal_khan.jpg',
        url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
        size: '1.8 MB',
        uploadedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        mimeType: 'image/jpeg'
      }
    ],
    aiExtraction: {
      issueCategory: 'Solid Waste & Garbage',
      shortSummary: 'Severe garbage overflow spilling onto carriageway at Ajmal Khan Road junction',
      affectedAsset: 'Municipal Secondary Dumpster / Dhalao',
      locationText: 'Ajmal Khan Road Junction, Metro Gate 3',
      ward: 'Ward 28 - Karol Bagh Market',
      duration: 'Active for 2 - 4 days',
      impact: 'Major commuter disruption on high-density commercial transit corridor',
      safetyIndicators: ['Immediate vicinity of sensitive public infrastructure'],
      missingFields: [],
      suggestedDepartment: 'Solid Waste Management',
      confidencePerField: {
        category: 0.98,
        summary: 0.95,
        asset: 0.94,
        ward: 0.97,
        department: 0.98,
        overall: 0.96
      },
      modelUsed: 'CivicLens Structured Extractor v3.2',
      extractedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
    },
    priorityScore: {
      total: 68,
      label: 'High',
      breakdown: {
        safetyRisk: 15,
        affectedInfra: 16,
        duration: 11,
        severity: 14,
        corroboratingEvidence: 12
      },
      ruleIds: ['INFRA-TRANSIT-HUB-16', 'DUR-MULTI-DAY-11', 'SEV-HYGIENE-ENVIRONMENT-09', 'EVID-PHOTO-GPS-VERIFIED-10'],
      explanation: 'High transit & footfall market corridor (16/20) • Prolonged uncollected garbage (>3 days) • Corroborated with photo evidence',
      policyVersion: 'MUNICIPAL-POLICY-2026.4'
    },
    department: 'Solid Waste Management',
    departmentConfidence: 0.98,
    assignedOfficer: 'Dr. Anita Deshmukh (Addl. Director SWM)',
    slaDeadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    slaHours: 24,
    slaStatus: 'On Track',
    duplicates: [],
    timeline: [
      {
        id: 't-31',
        timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        actor: 'Citizen (Vipin G.)',
        action: 'Complaint Registered'
      },
      {
        id: 't-32',
        timestamp: new Date(Date.now() - 17.5 * 3600 * 1000).toISOString(),
        actor: 'CivicLens AI Agent',
        action: 'AI Auto-Triage: High Priority Assigned'
      },
      {
        id: 't-33',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        actor: 'Officer (Dr. Anita Deshmukh)',
        action: 'Status Updated: In Progress',
        notes: 'Tipper truck and mechanical loader unit dispatched under Sanitary Inspector Ward 28.'
      }
    ],
    internalNotes: [
      {
        id: 'n-31',
        author: 'Dr. Anita Deshmukh',
        role: 'officer',
        text: 'Morning concessionaire missed route due to hydraulic breakdown. Backup compactor truck arriving at 11:30 AM.',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'cmp-004',
    trackingNumber: 'MCD-2026-D3W8N7',
    title: 'Exposed High-Voltage Cable Sparking After Storm',
    rawDescription: 'A streetlight wire snapped during heavy winds last night and is dangling right onto the pedestrian walkway near Rohini Sector 9 D-Block market. Sparks are flying every few minutes. Extremely dangerous, children playing nearby.',
    category: 'Streetlights & Electrical Hazards',
    status: 'assigned',
    ward: 'Ward 52 - Rohini Sector 9',
    city: 'Delhi MCD',
    locationText: 'Opposite D-Block Community Center & Market, Rohini Sec 9',
    coordinates: { lat: 28.7122, lng: 77.1198 },
    createdAt: new Date(Date.now() - 1.2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0.5 * 3600 * 1000).toISOString(),
    citizenContact: {
      name: 'Pooja Aggarwal',
      phoneMasked: '+91 97170-XXXXX',
      emailMasked: 'p.aggarwal***@outlook.com',
      preferredLang: 'English',
      notifyChannel: 'WhatsApp'
    },
    evidencePhotos: [],
    aiExtraction: {
      issueCategory: 'Streetlights & Electrical Hazards',
      shortSummary: 'Snapped high-voltage streetlight wire sparking on pedestrian walkway',
      affectedAsset: 'Low-Tension Overhead Distribution Wire / Pole #RH-904',
      locationText: 'D-Block Community Center, Rohini Sec 9',
      ward: 'Ward 52 - Rohini Sector 9',
      duration: 'Reported within last 24 hours',
      impact: 'Immediate electrocution fatality risk for pedestrians and children',
      safetyIndicators: [
        'High-risk live electrical hazard exposed',
        'Immediate vicinity of sensitive public infrastructure'
      ],
      missingFields: [],
      suggestedDepartment: 'Electrical & Street Lighting',
      confidencePerField: {
        category: 0.99,
        summary: 0.97,
        asset: 0.95,
        ward: 0.98,
        department: 0.99,
        overall: 0.98
      },
      modelUsed: 'CivicLens Structured Extractor v3.2',
      extractedAt: new Date(Date.now() - 1.2 * 3600 * 1000).toISOString()
    },
    priorityScore: {
      total: 96,
      label: 'Urgent',
      breakdown: {
        safetyRisk: 40,
        affectedInfra: 18,
        duration: 7,
        severity: 15,
        corroboratingEvidence: 16
      },
      ruleIds: ['SEC-RISK-LIVE-WIRE-40', 'INFRA-SCHOOL-ZONE-18', 'SEV-PHYSICAL-DEFECT-HIGH-14'],
      explanation: 'Critical life-safety electrical hazard (40/40) • Sparking live wire in dense residential community walkway',
      policyVersion: 'MUNICIPAL-POLICY-2026.4'
    },
    department: 'Electrical & Street Lighting',
    departmentConfidence: 0.99,
    assignedOfficer: 'Er. Pradeep Sharma',
    slaDeadline: new Date(Date.now() + 2.8 * 3600 * 1000).toISOString(),
    slaHours: 4,
    slaStatus: 'On Track',
    duplicates: [],
    timeline: [
      {
        id: 't-41',
        timestamp: new Date(Date.now() - 1.2 * 3600 * 1000).toISOString(),
        actor: 'Citizen (Pooja A.)',
        action: 'Emergency Citizen Alert'
      },
      {
        id: 't-42',
        timestamp: new Date(Date.now() - 1.1 * 3600 * 1000).toISOString(),
        actor: 'CivicLens AI Agent',
        action: 'Automated Emergency Escalation: Priority 96/100 (Urgent)'
      },
      {
        id: 't-43',
        timestamp: new Date(Date.now() - 0.5 * 3600 * 1000).toISOString(),
        actor: 'Supervisor',
        action: 'Dispatched Feeder Cut-off Squad'
      }
    ],
    internalNotes: [
      {
        id: 'n-41',
        author: 'Er. Pradeep Sharma',
        role: 'officer',
        text: 'Coordinated with TPDDL discom sub-station to trip feeder #3 remotely while our lineman isolates the snapped span.',
        timestamp: new Date(Date.now() - 0.4 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'cmp-005',
    trackingNumber: 'BBMP-2026-F9H3K1',
    title: 'Dangerous Deep Crater Pothole on 100ft Road Indiranagar',
    rawDescription: 'A 1.5 foot deep pothole right after 12th Main junction on 100ft road Indiranagar. Multiple delivery riders have fallen during evening peak traffic. The bituminous layer has completely caved in due to recent rains.',
    category: 'Roads & Potholes',
    status: 'resolved',
    ward: 'Ward 77 - Indiranagar 100ft Rd',
    city: 'Bengaluru BBMP',
    locationText: '100ft Road, 100m past 12th Main Signal, Indiranagar',
    coordinates: { lat: 12.9725, lng: 77.6421 },
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    citizenContact: {
      name: 'Aditya Rao',
      phoneMasked: '+91 99450-XXXXX',
      emailMasked: 'aditya.r***@gmail.com',
      preferredLang: 'English',
      notifyChannel: 'WhatsApp'
    },
    evidencePhotos: [
      {
        id: 'ev-5',
        name: 'crater_pothole_indiranagar.jpg',
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        size: '2.1 MB',
        uploadedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        mimeType: 'image/jpeg'
      }
    ],
    aiExtraction: {
      issueCategory: 'Roads & Potholes',
      shortSummary: 'Severe 1.5ft road depression and asphalt collapse on 100ft road corridor',
      affectedAsset: 'Asphalt Carriageway / Bituminous Pavement',
      locationText: '100ft Road near 12th Main Junction',
      ward: 'Ward 77 - Indiranagar 100ft Rd',
      duration: 'Active for 2 - 4 days',
      impact: 'Major commuter disruption on high-density transit corridor',
      safetyIndicators: [
        'Documented vehicle skidding/pedestrian risk'
      ],
      missingFields: [],
      suggestedDepartment: 'Engineering & Public Works',
      confidencePerField: {
        category: 0.98,
        summary: 0.96,
        asset: 0.95,
        ward: 0.96,
        department: 0.97,
        overall: 0.96
      },
      modelUsed: 'CivicLens Structured Extractor v3.2',
      extractedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    },
    priorityScore: {
      total: 75,
      label: 'High',
      breakdown: {
        safetyRisk: 30,
        affectedInfra: 14,
        duration: 11,
        severity: 14,
        corroboratingEvidence: 10
      },
      ruleIds: ['SEC-RISK-ACCIDENT-HISTORY-30', 'INFRA-COMMERCIAL-ARTERIAL-14', 'SEV-PHYSICAL-DEFECT-HIGH-14'],
      explanation: 'High vehicular accident risk on arterial roadway (30/40) • Documented two-wheeler falls • Rapid cold-mix patch executed',
      policyVersion: 'MUNICIPAL-POLICY-2026.4'
    },
    department: 'Engineering & Public Works',
    departmentConfidence: 0.97,
    assignedOfficer: 'Er. Rajesh Varma',
    slaDeadline: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    slaHours: 24,
    slaStatus: 'On Track',
    duplicates: [],
    timeline: [
      {
        id: 't-51',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        actor: 'Citizen (Aditya R.)',
        action: 'Complaint Registered'
      },
      {
        id: 't-52',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        actor: 'Officer (Er. Rajesh Varma)',
        action: 'Work Order Dispatched: Hot-mix Pothole Jetpatcher'
      },
      {
        id: 't-53',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        actor: 'Officer (Er. Rajesh Varma)',
        action: 'Complaint Resolved',
        notes: 'Pothole milled and filled with 50mm Dense Bituminous Macadam + WMM base. Road leveled and compacted with vibratory roller.',
        evidenceUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80'
      }
    ],
    internalNotes: [],
    resolutionEvidence: {
      text: 'Pothole compacted with 50mm bitumen mix. Pre and post geotagged photos logged into municipal engineering audit ledger.',
      photoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
      closedBy: 'Er. Rajesh Varma',
      closedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    }
  },
  {
    id: 'cmp-006',
    trackingNumber: 'BMC-2026-P2V5K9',
    title: 'Potable Drinking Water Pipeline Burst Flooding S.V. Road',
    rawDescription: 'Clean municipal drinking water is gushing out like a fountain from a main pipeline rupture on S.V. Road opposite Andheri West railway station. Thousands of liters of water wasting while the entire lane is submerged under 1 foot of water.',
    category: 'Water Supply & Pipeline Leakage',
    status: 'assigned',
    ward: 'Ward 91 - Andheri West Station',
    city: 'Mumbai BMC',
    locationText: 'S.V. Road opposite Andheri West Railway Station Exit 2',
    coordinates: { lat: 19.1205, lng: 72.8472 },
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    citizenContact: {
      name: 'Farhan Sayed',
      phoneMasked: '+91 98200-XXXXX',
      emailMasked: 'farhan.s***@gmail.com',
      preferredLang: 'English',
      notifyChannel: 'SMS'
    },
    evidencePhotos: [],
    aiExtraction: {
      issueCategory: 'Water Supply & Pipeline Leakage',
      shortSummary: 'Main potable water distribution line burst with heavy wastage and road flooding',
      affectedAsset: '300mm Cast Iron Potable Water Distribution Line',
      locationText: 'S.V. Road, opposite Andheri Station',
      ward: 'Ward 91 - Andheri West Station',
      duration: 'Reported within last 24 hours',
      impact: 'Critical municipal water loss and arterial commuter flooding',
      safetyIndicators: ['Severe street flooding blocking traffic'],
      missingFields: [],
      suggestedDepartment: 'Water Supply & Sewerage',
      confidencePerField: {
        category: 0.98,
        summary: 0.96,
        asset: 0.94,
        ward: 0.98,
        department: 0.97,
        overall: 0.96
      },
      modelUsed: 'CivicLens Structured Extractor v3.2',
      extractedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    },
    priorityScore: {
      total: 82,
      label: 'Urgent',
      breakdown: {
        safetyRisk: 22,
        affectedInfra: 16,
        duration: 7,
        severity: 15,
        corroboratingEvidence: 12
      },
      ruleIds: ['INFRA-TRANSIT-HUB-16', 'SEC-RISK-STREET-FLOOD-22', 'SEV-PHYSICAL-DEFECT-HIGH-14'],
      explanation: 'Critical potable water main loss next to major railway transit station • Urgent valve isolation ordered',
      policyVersion: 'MUNICIPAL-POLICY-2026.4'
    },
    department: 'Water Supply & Sewerage',
    departmentConfidence: 0.97,
    assignedOfficer: 'Er. Sandeep Pillai',
    slaDeadline: new Date(Date.now() + 0.5 * 3600 * 1000).toISOString(),
    slaHours: 6,
    slaStatus: 'At Risk',
    duplicates: [],
    timeline: [
      {
        id: 't-61',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        actor: 'Citizen (Farhan S.)',
        action: 'Complaint Registered'
      },
      {
        id: 't-62',
        timestamp: new Date(Date.now() - 5.5 * 3600 * 1000).toISOString(),
        actor: 'CivicLens AI Agent',
        action: 'Urgent Priority Assigned (82/100)'
      }
    ],
    internalNotes: [
      {
        id: 'n-61',
        author: 'Er. Sandeep Pillai',
        role: 'officer',
        text: 'Valve gate isolated at 09:15 AM to stop wastage. Repair clamps being welded onto the 300mm pipe.',
        timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    actor: 'Admin (System Setup)',
    actorRole: 'admin',
    action: 'Policy Initialized',
    details: 'Deployed MUNICIPAL-POLICY-2026.4 with 5-factor explainable weight scoring.'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    actor: 'Citizen (Rohan M.)',
    actorRole: 'citizen',
    action: 'Complaint Submission',
    complaintRef: 'MCD-2026-X8K9L2',
    details: 'Submitted verified complaint with 1 attachment and precise GPS coordinates.'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3.8 * 3600 * 1000).toISOString(),
    actor: 'CivicLens AI Worker',
    actorRole: 'officer',
    action: 'AI Triage Generated',
    complaintRef: 'MCD-2026-X8K9L2',
    details: 'Extracted safety flags: Uncovered manhole, School zone. Assigned Urgent priority (Score 92).'
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    actor: 'Supervisor Control Room',
    actorRole: 'supervisor',
    action: 'Officer Assigned',
    complaintRef: 'MCD-2026-X8K9L2',
    details: 'Assigned to Er. Sandeep Pillai (Water Supply & Sewerage).'
  },
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    actor: 'Er. Rajesh Varma',
    actorRole: 'officer',
    action: 'Complaint Resolved',
    complaintRef: 'BBMP-2026-F9H3K1',
    details: 'Uploaded resolution evidence photo; verified road patch completion.'
  }
];
