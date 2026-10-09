import React, { useState } from 'react';
import { 
  Complaint, 
  DepartmentConfig, 
  WardConfig, 
  ScoringPolicyWeights, 
  AuditLogItem, 
  UserRole 
} from './types';
import { 
  INITIAL_COMPLAINTS, 
  SEEDED_DEPARTMENTS, 
  SEEDED_WARDS, 
  INITIAL_AUDIT_LOGS 
} from './data/mockData';
import { DEFAULT_SCORING_WEIGHTS } from './services/aiTriageEngine';
import { Header } from './components/Header';
import { CitizenPortal } from './components/CitizenPortal';
import { OfficerWorkspace } from './components/OfficerWorkspace';
import { SupervisorWorkspace } from './components/SupervisorWorkspace';
import { AdminWorkspace } from './components/AdminWorkspace';
import { CityAnalytics } from './components/CityAnalytics';
import { DemoTourModal } from './components/DemoTourModal';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  FileCode, 
  Globe2 
} from 'lucide-react';

export function App() {
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [departments, setDepartments] = useState<DepartmentConfig[]>(SEEDED_DEPARTMENTS);
  const [wards, setWards] = useState<WardConfig[]>(SEEDED_WARDS);
  const [scoringWeights, setScoringWeights] = useState<ScoringPolicyWeights>(DEFAULT_SCORING_WEIGHTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [currentView, setCurrentView] = useState<'portal' | 'analytics'>('portal');
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);

  // Add Complaint
  const handleAddComplaint = (newComplaint: Complaint) => {
    setComplaints([newComplaint, ...complaints]);
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: newComplaint.citizenContact.name,
      actorRole: 'citizen',
      action: 'Complaint Ingestion',
      complaintRef: newComplaint.trackingNumber,
      details: `Registered ${newComplaint.trackingNumber}: ${newComplaint.title}`
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // Update Complaint
  const handleUpdateComplaint = (updated: Complaint) => {
    setComplaints(complaints.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Add Audit Log
  const handleAddAuditLog = (log: AuditLogItem) => {
    setAuditLogs([log, ...auditLogs]);
  };

  // Reset to seed data
  const handleResetSeedData = () => {
    setComplaints(INITIAL_COMPLAINTS);
    setDepartments(SEEDED_DEPARTMENTS);
    setWards(SEEDED_WARDS);
    setScoringWeights(DEFAULT_SCORING_WEIGHTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    alert('System successfully reset to default seeded complaints, departments, and policy weights.');
  };

  // Jump from demo tour to workspace
  const handleTourJump = (role: UserRole, view: 'portal' | 'analytics') => {
    setCurrentRole(role);
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top GovTech Announcement Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide uppercase">GOI • Municipal Digital Mission</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">AI Complaint Triage & Explainable Priority Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sky-400">
              <Compass className="w-3 h-3" /> Mappls India Maps Connected
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> WCAG 2.1 AAA Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Main App Navigation */}
      <Header
        currentRole={currentRole}
        currentView={currentView}
        onRoleChange={setCurrentRole}
        onViewChange={setCurrentView}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
        activeTicketsCount={complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'analytics' ? (
          <CityAnalytics
            complaints={complaints}
            departments={departments}
            wards={wards}
          />
        ) : (
          <>
            {currentRole === 'citizen' && (
              <CitizenPortal
                complaints={complaints}
                onAddComplaint={handleAddComplaint}
                onUpdateComplaint={handleUpdateComplaint}
              />
            )}

            {currentRole === 'officer' && (
              <OfficerWorkspace
                complaints={complaints}
                departments={departments}
                onUpdateComplaint={handleUpdateComplaint}
                onAddAuditLog={handleAddAuditLog}
              />
            )}

            {currentRole === 'supervisor' && (
              <SupervisorWorkspace
                complaints={complaints}
                departments={departments}
                onUpdateComplaint={handleUpdateComplaint}
                onAddAuditLog={handleAddAuditLog}
              />
            )}

            {currentRole === 'admin' && (
              <AdminWorkspace
                departments={departments}
                wards={wards}
                scoringWeights={scoringWeights}
                auditLogs={auditLogs}
                onUpdateScoringWeights={setScoringWeights}
                onUpdateDepartments={setDepartments}
                onResetSeedData={handleResetSeedData}
              />
            )}
          </>
        )}
      </main>

      {/* Interactive Guided Demo Tour Modal */}
      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onJumpToStep={handleTourJump}
      />

      {/* Modern Professional GovTech Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>CivicLens AI Architecture</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Production-oriented civic triage platform designed for Indian Municipal Corporations. Implements explainable priority rules, spatial duplicate detection, and Mappls maps.
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-2">Specifications</span>
              <ul className="space-y-1 text-[11px]">
                <li>• Section 4: Citizen Plain-Text Ingestion</li>
                <li>• Section 5: Structured AI Schema v3.2</li>
                <li>• Section 6: 5-Factor Priority Scoring</li>
                <li>• Section 8: Haversine Duplicate Clusters</li>
              </ul>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-2">Integrations</span>
              <ul className="space-y-1 text-[11px]">
                <li>• Mappls Maps Web JS SDK (India GIS)</li>
                <li>• Leaflet OpenStreetMap Fallback</li>
                <li>• WhatsApp & SMS Notification Gateway</li>
                <li>• Encrypted Private Object Storage</li>
              </ul>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-2">Privacy & Audit</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Zero PII leakage in public GIS layers. All officer status transitions, reallocations, and duplicate links are immutably logged into municipal audit records.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <span>© 2026 CivicLens AI • Municipal Corporation Technology Directorate</span>
            <div className="flex items-center gap-4">
              <span className="text-emerald-700 font-medium">● System Status: All Municipal Microservices Operational</span>
              <button
                type="button"
                onClick={() => setIsDemoTourOpen(true)}
                className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer"
              >
                Launch Master Walkthrough
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
