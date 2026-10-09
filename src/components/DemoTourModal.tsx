import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Send, 
  Sliders, 
  Link2, 
  ShieldCheck, 
  BarChart2, 
  CheckCircle2, 
  MapPin,
  ExternalLink
} from 'lucide-react';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep: (role: UserRole, view: 'portal' | 'analytics') => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: 'Citizen Plain-Language Grievance Ingestion',
    role: 'citizen' as UserRole,
    view: 'portal' as const,
    icon: Send,
    description: 'Citizens can report issues in plain conversational text or voice. CivicLens accepts unstructured input, scrubs prompt injections, allows Mappls map coordinate pinning, and issues a non-guessable tracking reference (e.g. MCD-2026-X8K9L2).',
    badge: 'Section 4: Core Citizen Workflow',
    highlight: 'Try clicking "Demo Fill: Preset #1" on the Citizen form to see real-time AI field extraction and pin dropping!'
  },
  {
    step: 2,
    title: 'Structured AI Extraction & Confidence Analysis',
    role: 'citizen' as UserRole,
    view: 'portal' as const,
    icon: Sparkles,
    description: 'The extraction engine maps plain text into standard municipal fields: Issue Category, Affected Asset, Location Landmark, Ward, Duration, and Safety Risk Indicators with field-level confidence ratings.',
    badge: 'Section 5: AI Complaint Extraction',
    highlight: 'Live schema validation rejects hallucinations. If details conflict, it flags for human officer review.'
  },
  {
    step: 3,
    title: 'Auditable 5-Factor Explainable Priority Scoring',
    role: 'officer' as UserRole,
    view: 'portal' as const,
    icon: Sliders,
    description: 'Never rely on black-box AI for public safety! CivicLens computes a mathematical score (0-100) using 5 configurable municipal factors: Safety Risk (0-40), Critical Infra (0-20), Duration (0-15), Severity (0-15), and Corroborating Evidence (0-10).',
    badge: 'Section 6: Explainable Priority Scoring',
    highlight: 'Every score returns human-readable rule IDs (e.g. SEC-RISK-OPEN-CHAMBER-38) so officers understand exactly why a case is Urgent.'
  },
  {
    step: 4,
    title: 'Spatial & Semantic Duplicate Detection Engine',
    role: 'officer' as UserRole,
    view: 'portal' as const,
    icon: Link2,
    description: 'Using Haversine geographic distance (meters), vocabulary similarity, and time-window rules, CivicLens identifies clusters (e.g. same broken pipe reported by 3 neighbors). An authorized officer can Link or Dismiss while preserving all citizen tracking references.',
    badge: 'Section 8: Duplicate Detection',
    highlight: 'Inspect ticket MCD-2026-X8K9L2 in the Officer Queue to test the interactive Duplicate linking action!'
  },
  {
    step: 5,
    title: 'Officer Queue, Resolution Proof & SLA Escalation',
    role: 'supervisor' as UserRole,
    view: 'portal' as const,
    icon: ShieldCheck,
    description: 'Field officers transition tickets from Triaged to In-Progress to Resolved, attaching photo proof of completion. Supervisors monitor SLA breach risks and dynamically balance squad workloads across departments.',
    badge: 'Section 9: Officer & Supervisor Workspaces',
    highlight: 'Switch to the Supervisor tab to view live squad capacity and emergency escalation overrides.'
  },
  {
    step: 6,
    title: 'City-Level Operational Analytics & Hotspots',
    role: 'admin' as UserRole,
    view: 'analytics' as const,
    icon: BarChart2,
    description: 'Aggregates city-wide performance: category distribution, ward resolution benchmarks, and spatial complaint density layers without leaking citizen PII.',
    badge: 'Section 10 & 16: City Analytics & Governance',
    highlight: 'Switch between Delhi MCD, Bengaluru BBMP, and Mumbai BMC to inspect multi-city metrics.'
  }
];

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  onJumpToStep
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const current = TOUR_STEPS[currentStepIndex];
  const IconComponent = current.icon;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNavigateToWorkspace = () => {
    onJumpToStep(current.role, current.view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-50 via-slate-50 to-emerald-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">CivicLens AI Master Tour</h3>
              <p className="text-[11px] text-slate-500">
                Step {current.step} of {TOUR_STEPS.length} • {current.badge}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="text-base font-bold text-slate-900">{current.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{current.description}</p>
            </div>
          </div>

          {/* Highlight Callout Box */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Try this in the UI:</span>
              <span>{current.highlight}</span>
            </div>
          </div>

          {/* Direct Jump Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNavigateToWorkspace}
              className="w-full py-2.5 px-4 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Jump directly to this workspace screen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStepIndex ? 'w-6 bg-sky-600' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
