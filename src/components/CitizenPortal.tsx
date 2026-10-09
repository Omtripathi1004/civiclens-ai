import React, { useState, useEffect } from 'react';
import { 
  Complaint, 
  CitizenContact, 
  AIExtraction, 
  PriorityScore, 
  EvidenceFile 
} from '../types';
import { 
  extractFieldsFromText, 
  computeExplainablePriority, 
  calculateSlaDeadline,
  MUNICIPAL_CATEGORIES 
} from '../services/aiTriageEngine';
import { findDuplicateCandidates } from '../services/duplicateEngine';
import { MapPicker } from './MapPicker';
import { 
  Sparkles, 
  Send, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  FileText, 
  MapPin, 
  ShieldCheck, 
  RefreshCw, 
  HelpCircle, 
  MessageSquare, 
  RotateCcw,
  Sliders,
  Check,
  ChevronRight,
  ExternalLink,
  Save,
  WifiOff
} from 'lucide-react';

interface CitizenPortalProps {
  complaints: Complaint[];
  onAddComplaint: (complaint: Complaint) => void;
  onUpdateComplaint: (complaint: Complaint) => void;
}

const CITIZEN_SAMPLE_PRESETS = [
  {
    title: 'Open Manhole outside School',
    text: 'There is a completely uncovered deep manhole right outside the main gate of Government Girls Senior Secondary School on Ring Road Lajpat Nagar Ward 14. Severe dirty sewage water is spilling across the footpath for 2 days. Children and elders are at risk of falling in!',
    ward: 'Ward 14 - Lajpat Nagar Central',
    coords: { lat: 28.5684, lng: 77.2442 },
    photo: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Garbage Dump Overflow in Market',
    text: 'Huge community garbage dumpster overflowing on Ajmal Khan Road Karol Bagh Ward 28 near metro gate. Piles of rotten waste and plastic bags have covered half the road for past 3 days, foul stench everywhere and stray cows eating plastic.',
    ward: 'Ward 28 - Karol Bagh Market',
    coords: { lat: 28.6524, lng: 77.1912 },
    photo: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'High-Voltage Wire Sparking on Path',
    text: 'A streetlight low tension electric cable snapped during winds last evening and is hanging onto the pedestrian sidewalk in Rohini Sector 9 Ward 52. Live sparks are flashing repeatedly. Immediate electrocution threat.',
    ward: 'Ward 52 - Rohini Sector 9',
    coords: { lat: 28.7122, lng: 77.1198 },
    photo: ''
  }
];

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  complaints,
  onAddComplaint,
  onUpdateComplaint
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'track' | 'drafts'>('submit');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(MUNICIPAL_CATEGORIES[0]);
  const [ward, setWard] = useState('Ward 14 - Lajpat Nagar Central');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>({ lat: 28.5684, lng: 77.2442 });
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceName, setEvidenceName] = useState('');

  // Citizen Contact
  const [citizenName, setCitizenName] = useState('Ananya Sen');
  const [citizenPhone, setCitizenPhone] = useState('+91 98101-23456');
  const [preferredLang, setPreferredLang] = useState('English');
  const [notifyChannel, setNotifyChannel] = useState<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');

  // AI Extraction preview
  const [aiPreview, setAiPreview] = useState<AIExtraction | null>(null);
  const [priorityPreview, setPriorityPreview] = useState<PriorityScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Submission result
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Tracking tab states
  const [searchRef, setSearchRef] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState<Complaint | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Clarification / Reopening states
  const [clarificationText, setClarificationText] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);

  // Offline Draft simulation
  const [savedDraft, setSavedDraft] = useState<boolean>(false);

  // Run AI analysis on demand or when description reaches a minimum length
  const handleAnalyzeText = () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const extraction = extractFieldsFromText(description, ward);
      const score = computeExplainablePriority(
        description, 
        Boolean(evidenceUrl), 
        Boolean(coordinates)
      );
      setAiPreview(extraction);
      setPriorityPreview(score);
      setCategory(extraction.issueCategory);
      setIsAnalyzing(false);
    }, 450);
  };

  const handleApplyPreset = (preset: typeof CITIZEN_SAMPLE_PRESETS[0]) => {
    setTitle(preset.title);
    setDescription(preset.text);
    setWard(preset.ward);
    setCoordinates(preset.coords);
    if (preset.photo) {
      setEvidenceUrl(preset.photo);
      setEvidenceName('defect_evidence_photo.jpg');
    } else {
      setEvidenceUrl('');
      setEvidenceName('');
    }
    // trigger auto analyze
    setTimeout(() => {
      const extraction = extractFieldsFromText(preset.text, preset.ward);
      const score = computeExplainablePriority(
        preset.text, 
        Boolean(preset.photo), 
        Boolean(preset.coords)
      );
      setAiPreview(extraction);
      setPriorityPreview(score);
      setCategory(extraction.issueCategory);
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !title.trim()) return;

    // AI extraction & priority calculation
    const extraction = aiPreview || extractFieldsFromText(description, ward);
    const score = priorityPreview || computeExplainablePriority(
      description, 
      Boolean(evidenceUrl), 
      Boolean(coordinates)
    );

    // Non-guessable public reference
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const cityCode = ward.includes('Indiranagar') ? 'BBMP' : ward.includes('Andheri') ? 'BMC' : 'MCD';
    const trackingRef = `${cityCode}-2026-${randomSuffix}`;

    const { deadlineIso, hours } = calculateSlaDeadline(score.label);

    const evidencePhotos: EvidenceFile[] = evidenceUrl ? [
      {
        id: `ev-${Date.now()}`,
        name: evidenceName || 'citizen_upload.jpg',
        url: evidenceUrl,
        size: '2.1 MB',
        uploadedAt: new Date().toISOString(),
        mimeType: 'image/jpeg'
      }
    ] : [];

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      trackingNumber: trackingRef,
      title: title.trim(),
      rawDescription: description.trim(),
      category: extraction.issueCategory || category,
      status: 'submitted',
      ward: ward,
      city: cityCode === 'BBMP' ? 'Bengaluru BBMP' : cityCode === 'BMC' ? 'Mumbai BMC' : 'Delhi MCD',
      locationText: extraction.locationText || `${ward}, Municipal Zone`,
      coordinates: coordinates,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      citizenContact: {
        name: citizenName,
        phoneMasked: citizenPhone.replace(/(\+91 \d{5}-)(\d+)/, '$1XXXXX'),
        emailMasked: 'ananya.s***@gmail.com',
        preferredLang: preferredLang,
        notifyChannel: notifyChannel
      },
      evidencePhotos,
      aiExtraction: extraction,
      priorityScore: score,
      department: extraction.suggestedDepartment,
      departmentConfidence: extraction.confidencePerField.department,
      assignedOfficer: null,
      slaDeadline: deadlineIso,
      slaHours: hours,
      slaStatus: 'On Track',
      duplicates: [],
      timeline: [
        {
          id: `t-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: `Citizen (${citizenName})`,
          action: 'Complaint Registered',
          notes: `Public reference issued: ${trackingRef}. Awaiting officer triage.`
        },
        {
          id: `t-ai-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'CivicLens AI Agent',
          action: 'Explainable AI Triage & Routing Completed',
          notes: `Assigned priority: ${score.label} (${score.total}/100). Auto-routed to ${extraction.suggestedDepartment}.`
        }
      ],
      internalNotes: []
    };

    // Calculate duplicate candidates against existing repository
    const duplicates = findDuplicateCandidates(
      {
        id: newComplaint.id,
        description: newComplaint.rawDescription,
        category: newComplaint.category,
        coordinates: newComplaint.coordinates,
        createdAt: newComplaint.createdAt
      },
      complaints
    );
    newComplaint.duplicates = duplicates;

    onAddComplaint(newComplaint);
    setSubmittedRef(trackingRef);
    setTrackedComplaint(newComplaint);
  };

  const handleTrackLookup = (refToSearch?: string) => {
    const target = (refToSearch || searchRef).trim().toUpperCase();
    if (!target) return;
    const match = complaints.find(
      (c) => c.trackingNumber.toUpperCase() === target || c.id === target
    );
    if (match) {
      setTrackedComplaint(match);
      setTrackingError(null);
    } else {
      setTrackedComplaint(null);
      setTrackingError(`No registered complaint found matching "${target}". Please verify the reference format (e.g. MCD-2026-X8K9L2).`);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('civiclens_citizen_draft', JSON.stringify({
      title,
      description,
      ward,
      coordinates,
      timestamp: new Date().toISOString()
    }));
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 3000);
  };

  const handleAddClarification = () => {
    if (!trackedComplaint || !clarificationText.trim()) return;
    const updated: Complaint = {
      ...trackedComplaint,
      timeline: [
        ...trackedComplaint.timeline,
        {
          id: `t-clar-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Citizen Clarification',
          action: 'Citizen Added Clarification Details',
          notes: clarificationText.trim()
        }
      ]
    };
    onUpdateComplaint(updated);
    setTrackedComplaint(updated);
    setClarificationText('');
  };

  const handleRequestReopen = () => {
    if (!trackedComplaint || !reopenReason.trim()) return;
    const updated: Complaint = {
      ...trackedComplaint,
      status: 'reopened',
      timeline: [
        ...trackedComplaint.timeline,
        {
          id: `t-reopen-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Citizen Appeal',
          action: 'Reopening Requested',
          notes: `Reason: ${reopenReason.trim()}`
        }
      ]
    };
    onUpdateComplaint(updated);
    setTrackedComplaint(updated);
    setReopenReason('');
    setShowReopenModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Citizen Navigation Sub-bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab('submit'); setSubmittedRef(null); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'submit' 
                ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>File Civic Complaint</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'track' 
                ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Status & Updates</span>
            {complaints.length > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[10px] rounded-full">
                {complaints.length}
              </span>
            )}
          </button>
        </div>

        {/* Civic Information Badge */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 pr-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Section 4 Compliant: Non-sequential IDs • Offline Resilient</span>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL / BANNER */}
      {submittedRef && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-sm text-slate-800 animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Complaint Successfully Registered with Indian Municipal Corporation!
                </h3>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-300">
                  AI Auto-Triage Active
                </span>
              </div>
              
              <div className="p-3 bg-white border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-500 block">Your Non-Guessable Public Reference:</span>
                  <span className="text-xl font-extrabold font-mono text-sky-700 tracking-wide select-all">
                    {submittedRef}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(submittedRef);
                      alert(`Copied tracking reference ${submittedRef} to clipboard!`);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition-colors cursor-pointer"
                  >
                    Copy Reference
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('track');
                      setSearchRef(submittedRef);
                      handleTrackLookup(submittedRef);
                    }}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View Live Timeline</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Updates will be sent to your masked contact ({citizenPhone}) via <strong>{notifyChannel}</strong>. Responsible department: <strong>{trackedComplaint?.department}</strong>. Estimated resolution SLA: <strong>{trackedComplaint?.slaHours} Hours</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: FILE COMPLAINT */}
      {activeTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    Submit Civic Grievance
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plain-language complaints allowed. AI will extract structured data and calculate priority.
                  </p>
                </div>

                {/* Demo Preset Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-500">Demo Fill:</span>
                  {CITIZEN_SAMPLE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="text-[11px] px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md font-medium transition-colors cursor-pointer"
                    >
                      Preset #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Complaint Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Issue Title / Headline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deep Pothole on 100ft road near Metro gate"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Complaint Description (Plain text) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <span>Plain-Language Description</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAnalyzeText}
                      disabled={isAnalyzing || !description.trim()}
                      className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      {isAnalyzing ? 'Extracting...' : 'Preview AI Triage'}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe what happened in natural language... (e.g. Water pipeline burst flooding road since yesterday, dirty sewage mixing near school gate, two people slipped)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-all leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Supports English, Hindi, Hinglish. User text is treated as untrusted data.</span>
                    <span>{description.length} chars</span>
                  </div>
                </div>

                {/* Ward and Category Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Municipal Ward / Jurisdiction
                    </label>
                    <select
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    >
                      <option value="Ward 14 - Lajpat Nagar Central">Ward 14 - Lajpat Nagar Central (Delhi)</option>
                      <option value="Ward 28 - Karol Bagh Market">Ward 28 - Karol Bagh Market (Delhi)</option>
                      <option value="Ward 52 - Rohini Sector 9">Ward 52 - Rohini Sector 9 (Delhi)</option>
                      <option value="Ward 77 - Indiranagar 100ft Rd">Ward 77 - Indiranagar (Bengaluru)</option>
                      <option value="Ward 91 - Andheri West Station">Ward 91 - Andheri West (Mumbai)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Issue Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    >
                      {MUNICIPAL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 8 Addendum: Mappls Map Pinning */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-600" />
                      Pin Issue Location on Map
                    </span>
                    <span className="text-[11px] font-normal text-slate-500">Mappls GIS Coordinates</span>
                  </label>
                  <MapPicker
                    coordinates={coordinates}
                    onCoordinatesChange={setCoordinates}
                    locationText={ward}
                  />
                </div>

                {/* Evidence Photo Upload */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-sky-600" />
                    Attach Photographic Evidence (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      placeholder="Paste image URL or use demo preset above"
                      value={evidenceUrl}
                      onChange={(e) => {
                        setEvidenceUrl(e.target.value);
                        setEvidenceName(e.target.value ? 'citizen_evidence.jpg' : '');
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                    {evidenceUrl && (
                      <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        <img src={evidenceUrl} alt="Evidence preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Uploads are scrubbed of private EXIF data and stored in encrypted object store.
                  </span>
                </div>

                {/* Citizen Contact & Notification Preferences */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    Contact & Notification Preferences
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Citizen Name</label>
                      <input
                        type="text"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Mobile (Masked)</label>
                      <input
                        type="text"
                        value={citizenPhone}
                        onChange={(e) => setCitizenPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Notification Channel</label>
                      <select
                        value={notifyChannel}
                        onChange={(e) => setNotifyChannel(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                      >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="SMS">SMS Alerts</option>
                        <option value="Email">Email</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savedDraft ? 'Draft Saved Locally!' : 'Save Draft'}</span>
                    </button>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Offline-ready draft queue
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Grievance to Municipality</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* AI Pre-Submission Intelligence Sidebar (4 Columns) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Live AI Extraction Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">AI Extraction Analysis</h3>
                    <p className="text-[10px] text-slate-500">Real-time structured parser</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold rounded-md">
                  Schema v3.2
                </span>
              </div>

              {aiPreview ? (
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                      Target Municipal Department:
                    </span>
                    <span className="font-bold text-slate-900 block">
                      {aiPreview.suggestedDepartment}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium">
                      {(aiPreview.confidencePerField.department * 100).toFixed(0)}% Routing Confidence
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                      Extracted Asset & Impact:
                    </span>
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-700 text-[11px] border border-slate-200/60">
                      <strong>Asset:</strong> {aiPreview.affectedAsset}
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-700 text-[11px] border border-slate-200/60">
                      <strong>Impact:</strong> {aiPreview.impact}
                    </div>
                  </div>

                  {/* Safety Indicators */}
                  {aiPreview.safetyIndicators.length > 0 && (
                    <div>
                      <span className="text-[10px] text-red-600 uppercase tracking-wider font-semibold block mb-1">
                        Safety Flags Detected ({aiPreview.safetyIndicators.length}):
                      </span>
                      <div className="space-y-1">
                        {aiPreview.safetyIndicators.map((s, i) => (
                          <div key={i} className="text-[11px] bg-red-50 text-red-800 border border-red-200 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium">
                            <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Fields Audit */}
                  {aiPreview.missingFields.length > 0 && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                      <span className="font-bold block mb-1">Optional Details Missing:</span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {aiPreview.missingFields.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 space-y-2">
                  <Sparkles className="w-6 h-6 mx-auto text-slate-300" />
                  <p className="text-xs">
                    Type a description or click a demo preset to see AI extraction details and priority score preview.
                  </p>
                </div>
              )}
            </div>

            {/* Explainable 5-Factor Priority Score Preview */}
            {priorityPreview && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-sky-600" />
                    <h3 className="text-xs font-bold text-slate-900">Explainable Priority</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    priorityPreview.label === 'Urgent' ? 'bg-red-100 text-red-800 border border-red-300' :
                    priorityPreview.label === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    priorityPreview.label === 'Medium' ? 'bg-sky-100 text-sky-800 border border-sky-300' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {priorityPreview.label} ({priorityPreview.total}/100)
                  </span>
                </div>

                {/* 5 Factor Breakdown Meters */}
                <div className="space-y-2 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Safety Risk (Max 40)</span>
                      <span className="font-bold font-mono">{priorityPreview.breakdown.safetyRisk}/40</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${(priorityPreview.breakdown.safetyRisk / 40) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Critical Infra / People (Max 20)</span>
                      <span className="font-mono font-bold">{priorityPreview.breakdown.affectedInfra}/20</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(priorityPreview.breakdown.affectedInfra / 20) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Duration / Persistence (Max 15)</span>
                      <span className="font-mono font-bold">{priorityPreview.breakdown.duration}/15</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(priorityPreview.breakdown.duration / 15) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Issue Severity (Max 15)</span>
                      <span className="font-mono font-bold">{priorityPreview.breakdown.severity}/15</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(priorityPreview.breakdown.severity / 15) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Corroborating Evidence (Max 10)</span>
                      <span className="font-mono font-bold">{priorityPreview.breakdown.corroboratingEvidence}/10</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(priorityPreview.breakdown.corroboratingEvidence / 10) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg text-[10px] text-slate-600">
                  <span className="font-semibold text-slate-800">Policy Explanation: </span>
                  {priorityPreview.explanation}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TRACK STATUS & LIVE TIMELINE */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          {/* Tracking Search Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="max-w-2xl mx-auto space-y-3">
              <label className="block text-xs font-bold text-slate-800 text-center">
                Track Municipal Complaint by Non-Guessable Reference ID
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. MCD-2026-X8K9L2 or BBMP-2026-F9H3K1"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleTrackLookup()}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>

              {/* Sample Quick Tracking Pills */}
              <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] text-slate-500">Quick track demo cases:</span>
                {complaints.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSearchRef(c.trackingNumber);
                      handleTrackLookup(c.trackingNumber);
                    }}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono rounded-md border border-slate-300 transition-colors cursor-pointer"
                  >
                    {c.trackingNumber}
                  </button>
                ))}
              </div>

              {trackingError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{trackingError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tracked Complaint Details & Full Status Timeline */}
          {trackedComplaint && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Header card */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-mono font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-lg">
                      {trackedComplaint.trackingNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      trackedComplaint.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      trackedComplaint.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                      trackedComplaint.status === 'reopened' ? 'bg-purple-100 text-purple-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {trackedComplaint.status.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md">
                      {trackedComplaint.city}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {trackedComplaint.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    📍 {trackedComplaint.locationText} ({trackedComplaint.ward})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">SLA Commitment</span>
                  <span className="text-sm font-bold text-slate-800">
                    {trackedComplaint.slaHours} Hours Resolution Window
                  </span>
                  <span className="text-[11px] text-amber-600 font-semibold block">
                    Deadline: {new Date(trackedComplaint.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Grid with Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Responsible Department</span>
                  <p className="text-xs font-bold text-slate-900">{trackedComplaint.department}</p>
                  <p className="text-[11px] text-slate-500">
                    Officer: {trackedComplaint.assignedOfficer || 'Assigned to Ward Squad'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Assigned Priority</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{trackedComplaint.priorityScore.label}</span>
                    <span className="text-xs font-mono text-slate-600">({trackedComplaint.priorityScore.total}/100)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {trackedComplaint.priorityScore.explanation}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Citizen Notification Channel</span>
                  <p className="text-xs font-bold text-slate-900">
                    {trackedComplaint.citizenContact.notifyChannel} ({trackedComplaint.citizenContact.phoneMasked})
                  </p>
                  <p className="text-[11px] text-emerald-700">✓ SMS & WhatsApp Bot Connected</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600" />
                  Audit-Verified Status Progression
                </h4>

                <div className="relative pl-6 border-l-2 border-sky-300 space-y-6">
                  {trackedComplaint.timeline.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-4 border-sky-600"></div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">{item.action}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                          {item.actor}
                        </span>
                        {item.notes && (
                          <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                            {item.notes}
                          </p>
                        )}
                        {item.evidenceUrl && (
                          <div className="mt-2">
                            <span className="text-[11px] font-bold text-emerald-700 block mb-1">
                              ✓ Resolution Photo Evidence Submitted:
                            </span>
                            <img 
                              src={item.evidenceUrl} 
                              alt="Resolution evidence" 
                              className="h-28 rounded-lg border border-slate-200 object-cover shadow-2xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citizen Actions: Add Clarification or Request Reopening */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-xs font-bold text-slate-900">
                    Citizen Response & Feedback Controls
                  </h4>
                  {trackedComplaint.status === 'resolved' && (
                    <button
                      type="button"
                      onClick={() => setShowReopenModal(true)}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Request Case Reopening (If issue recurs)</span>
                    </button>
                  )}
                </div>

                {/* Clarification input */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Add Further Clarification / Landmark Details for Field Team
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. The leak is directly under the big banyan tree next to house #14B..."
                      value={clarificationText}
                      onChange={(e) => setClarificationText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddClarification}
                      disabled={!clarificationText.trim()}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Post Clarification
                    </button>
                  </div>
                </div>

                {/* Reopen Modal */}
                {showReopenModal && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-purple-900 block">
                      Civic Quality Assurance: Appeal Resolution / Request Reopening
                    </span>
                    <textarea
                      rows={2}
                      placeholder="Explain why the resolution was insufficient (e.g. Patch broke again within 24 hours)..."
                      value={reopenReason}
                      onChange={(e) => setReopenReason(e.target.value)}
                      className="w-full p-2.5 bg-white border border-purple-300 rounded-lg text-xs text-slate-800 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRequestReopen}
                        disabled={!reopenReason.trim()}
                        className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Submit Reopening Request
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReopenModal(false)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
