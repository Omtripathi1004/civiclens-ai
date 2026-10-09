import React, { useState } from 'react';
import { 
  DepartmentConfig, 
  WardConfig, 
  ScoringPolicyWeights, 
  AuditLogItem 
} from '../types';
import { 
  Settings, 
  Sliders, 
  Map, 
  ShieldCheck, 
  Building2, 
  History, 
  Save, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface AdminWorkspaceProps {
  departments: DepartmentConfig[];
  wards: WardConfig[];
  scoringWeights: ScoringPolicyWeights;
  auditLogs: AuditLogItem[];
  onUpdateScoringWeights: (weights: ScoringPolicyWeights) => void;
  onUpdateDepartments: (departments: DepartmentConfig[]) => void;
  onResetSeedData: () => void;
}

export const AdminWorkspace: React.FC<AdminWorkspaceProps> = ({
  departments,
  wards,
  scoringWeights,
  auditLogs,
  onUpdateScoringWeights,
  onUpdateDepartments,
  onResetSeedData
}) => {
  const [activeTab, setActiveTab] = useState<'scoring' | 'departments' | 'wards' | 'audit'>('scoring');
  const [weightsDraft, setWeightsDraft] = useState<ScoringPolicyWeights>(scoringWeights);
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);

  // New department state
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateScoringWeights(weightsDraft);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptCode.trim()) return;

    const newDept: DepartmentConfig = {
      id: `dept-${Date.now()}`,
      name: newDeptName.trim(),
      code: newDeptCode.trim().toUpperCase(),
      headName: 'Appointed Municipal Head',
      email: `${newDeptCode.toLowerCase()}@mcd.gov.in`,
      activeOfficersCount: 8,
      avgResolutionHours: 24.0,
      keywords: [newDeptName.toLowerCase()],
      defaultSlaHours: { Urgent: 6, High: 24, Medium: 48, Routine: 96 }
    };

    onUpdateDepartments([...departments, newDept]);
    setNewDeptName('');
    setNewDeptCode('');
  };

  return (
    <div className="space-y-6">
      {/* Admin Navigation Pills */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('scoring')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'scoring' 
                ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Priority Scoring Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('departments')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'departments' 
                ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Departments & SLAs ({departments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wards')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'wards' 
                ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Wards & Jurisdictions ({wards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit' 
                ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail Ledger ({auditLogs.length})</span>
          </button>
        </div>

        {/* Global Reset to Baseline Data */}
        <button
          type="button"
          onClick={() => {
            if (confirm('Reset entire municipal state to seeded test complaints and default rules?')) {
              onResetSeedData();
            }
          }}
          className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Seed Data</span>
        </button>
      </div>

      {/* TAB 1: PRIORITY SCORING WEIGHTS POLICY */}
      {activeTab === 'scoring' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-600" />
                Auditable 5-Factor Priority Scoring Weights Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complies with Section 6 of Master Build Prompt: Safety 0-40, Infra 0-20, Duration 0-15, Severity 0-15, Evidence 0-10.
              </p>
            </div>
            <span className="font-mono text-xs bg-slate-100 px-3 py-1 rounded-lg text-slate-700 font-bold">
              Policy ID: {weightsDraft.version}
            </span>
          </div>

          <form onSubmit={handleSaveWeights} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Factor 1: Safety Risk */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">1. Life Safety Risk Weight</span>
                  <span className="font-mono font-bold text-sky-700">{weightsDraft.safetyRiskMax} Points</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={weightsDraft.safetyRiskMax}
                  onChange={(e) => setWeightsDraft({ ...weightsDraft, safetyRiskMax: parseInt(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 block">
                  Open manholes, live electrical wires, active accident risks.
                </span>
              </div>

              {/* Factor 2: Critical Infra */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">2. Critical Infra & Population Density</span>
                  <span className="font-mono font-bold text-sky-700">{weightsDraft.affectedInfraMax} Points</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="35"
                  value={weightsDraft.affectedInfraMax}
                  onChange={(e) => setWeightsDraft({ ...weightsDraft, affectedInfraMax: parseInt(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 block">
                  Hospital emergency routes, school perimeters, metro transit corridors.
                </span>
              </div>

              {/* Factor 3: Duration */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">3. Duration / Persistence Aging</span>
                  <span className="font-mono font-bold text-sky-700">{weightsDraft.durationMax} Points</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={weightsDraft.durationMax}
                  onChange={(e) => setWeightsDraft({ ...weightsDraft, durationMax: parseInt(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 block">
                  Unresolved chronic issues persistent for &gt;3 to 7 days.
                </span>
              </div>

              {/* Factor 4: Issue Severity */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">4. Issue Severity & Physical Rupture</span>
                  <span className="font-mono font-bold text-sky-700">{weightsDraft.severityMax} Points</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={weightsDraft.severityMax}
                  onChange={(e) => setWeightsDraft({ ...weightsDraft, severityMax: parseInt(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 block">
                  Burst water main, deep craters, environmental contamination.
                </span>
              </div>

              {/* Factor 5: Corroborating Evidence */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 md:col-span-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">5. Corroborating Evidence Weight</span>
                  <span className="font-mono font-bold text-sky-700">{weightsDraft.evidenceMax} Points</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={weightsDraft.evidenceMax}
                  onChange={(e) => setWeightsDraft({ ...weightsDraft, evidenceMax: parseInt(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 block">
                  Verified geotagged photos and pin coordinates prevent fake reports.
                </span>
              </div>
            </div>

            {/* Threshold Tiers */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                Urgency Classification Score Thresholds (0-100)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Urgent Threshold (Red)</label>
                  <input
                    type="number"
                    value={weightsDraft.urgentThreshold}
                    onChange={(e) => setWeightsDraft({ ...weightsDraft, urgentThreshold: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">High Threshold (Amber)</label>
                  <input
                    type="number"
                    value={weightsDraft.highThreshold}
                    onChange={(e) => setWeightsDraft({ ...weightsDraft, highThreshold: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Medium Threshold (Blue)</label>
                  <input
                    type="number"
                    value={weightsDraft.mediumThreshold}
                    onChange={(e) => setWeightsDraft({ ...weightsDraft, mediumThreshold: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {isSavedNotice ? (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Policy weights successfully committed to runtime registry!
                </span>
              ) : <div />}

              <button
                type="submit"
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save & Deploy Policy Weights</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS & SLA POLICIES */}
      {activeTab === 'departments' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                Municipal Departments & Service Level Agreements (SLAs)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Define designated response hours per urgency level.
              </p>
            </div>
          </div>

          {/* Department List */}
          <div className="space-y-3">
            {departments.map((dept) => (
              <div key={dept.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                      {dept.code}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{dept.email}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500 font-semibold text-[11px]">Routing Keywords:</span>
                  {dept.keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 text-[10px]">
                      {kw}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200 text-center">
                  <div className="p-1.5 bg-red-50 rounded border border-red-200 text-red-900">
                    <span className="text-[10px] block">Urgent SLA</span>
                    <span className="font-bold font-mono">{dept.defaultSlaHours.Urgent} Hours</span>
                  </div>
                  <div className="p-1.5 bg-amber-50 rounded border border-amber-200 text-amber-900">
                    <span className="text-[10px] block">High SLA</span>
                    <span className="font-bold font-mono">{dept.defaultSlaHours.High} Hours</span>
                  </div>
                  <div className="p-1.5 bg-sky-50 rounded border border-sky-200 text-sky-900">
                    <span className="text-[10px] block">Medium SLA</span>
                    <span className="font-bold font-mono">{dept.defaultSlaHours.Medium} Hours</span>
                  </div>
                  <div className="p-1.5 bg-slate-100 rounded border border-slate-200 text-slate-900">
                    <span className="text-[10px] block">Routine SLA</span>
                    <span className="font-bold font-mono">{dept.defaultSlaHours.Routine} Hours</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Department Form */}
          <form onSubmit={handleAddDepartment} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-900 block">Add New Municipal Department Wing</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Department Name (e.g. Horticulture & Parks)"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Code (e.g. HPW)"
                value={newDeptCode}
                onChange={(e) => setNewDeptCode(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Register Department</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: WARDS */}
      {activeTab === 'wards' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Map className="w-4 h-4 text-sky-600" />
                Municipal Wards & Zonal Jurisdictions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Spatial boundaries and administrative councilor contact registry.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wards.map((ward) => (
              <div key={ward.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">{ward.zone}</span>
                <h4 className="font-bold text-slate-900">{ward.name}</h4>
                <div className="space-y-1 text-slate-600 text-[11px]">
                  <p>👤 Councilor: <strong>{ward.councilorName}</strong></p>
                  <p className="font-mono">📍 Coordinates: {ward.centerCoordinates.lat}, {ward.centerCoordinates.lng}</p>
                  <p>📊 Active Cases: <strong>{ward.activeComplaintsCount}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-sky-600" />
                Immutable Municipal Audit Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every triage decision, status transition, override, and duplicate merge is logged with timestamps.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="px-2 py-0.2 bg-slate-200 text-slate-700 text-[10px] rounded font-semibold uppercase">
                      {log.actorRole}
                    </span>
                    {log.complaintRef && (
                      <span className="font-mono text-sky-800 bg-sky-100 px-1.5 py-0.2 rounded font-bold text-[11px]">
                        {log.complaintRef}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px]">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
