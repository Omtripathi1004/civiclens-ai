import React, { useState } from 'react';
import { Complaint, DepartmentConfig, AuditLogItem } from '../types';
import { 
  Users, 
  Clock, 
  AlertOctagon, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  RefreshCw, 
  ShieldAlert, 
  BarChart3,
  Flame
} from 'lucide-react';

interface SupervisorWorkspaceProps {
  complaints: Complaint[];
  departments: DepartmentConfig[];
  onUpdateComplaint: (complaint: Complaint) => void;
  onAddAuditLog: (log: AuditLogItem) => void;
}

export const SupervisorWorkspace: React.FC<SupervisorWorkspaceProps> = ({
  complaints,
  departments,
  onUpdateComplaint,
  onAddAuditLog
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');

  // Escalation criteria: Priority === Urgent OR slaStatus === 'Overdue' or 'At Risk'
  const escalatedComplaints = complaints.filter(
    (c) => c.priorityScore.label === 'Urgent' || c.slaStatus === 'At Risk' || c.slaStatus === 'Overdue'
  );

  // Reassign to specific department
  const handleQuickEscalate = (complaint: Complaint, targetDeptName: string) => {
    const updated: Complaint = {
      ...complaint,
      department: targetDeptName,
      slaStatus: 'At Risk',
      timeline: [
        ...complaint.timeline,
        {
          id: `t-esc-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Zonal Supervisor Escalation Cell',
          action: 'Priority Escalation Triggered',
          notes: `Supervisor fast-tracked ticket to ${targetDeptName} under emergency municipal protocol.`
        }
      ]
    };
    onUpdateComplaint(updated);
    onAddAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Department Supervisor',
      actorRole: 'supervisor',
      action: 'Emergency Escalation',
      complaintRef: complaint.trackingNumber,
      details: `Escalated ticket ${complaint.trackingNumber} to ${targetDeptName}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Escalation Queue</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{escalatedComplaints.length}</span>
            <span className="text-xs text-red-600 font-semibold">Requiring Supervisor Oversight</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">At-Risk SLA Tickets</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {complaints.filter(c => c.slaStatus === 'At Risk').length}
            </span>
            <span className="text-xs text-amber-600 font-semibold">&lt; 3h Remaining to Breach</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Deployed Field Officers</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {departments.reduce((acc, d) => acc + d.activeOfficersCount, 0)}
            </span>
            <span className="text-xs text-slate-500">Across 5 Civic Wings</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Overall SLA Compliance</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">94.2%</span>
            <span className="text-xs text-emerald-600 font-semibold">Above City Target (90%)</span>
          </div>
        </div>
      </div>

      {/* Department Workload Distribution Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              Department Workload & Squad Capacity Balancer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live case distribution, mean turnaround time, and active field officers.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Live Sync</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const deptComplaints = complaints.filter(c => c.department === dept.name);
            const urgentCount = deptComplaints.filter(c => c.priorityScore.label === 'Urgent').length;
            const resolvedCount = deptComplaints.filter(c => c.status === 'resolved').length;
            const loadRatio = Math.min(100, Math.round((deptComplaints.length / 15) * 100));

            return (
              <div key={dept.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">{dept.code}</span>
                    <h4 className="text-xs font-bold text-slate-900">{dept.name}</h4>
                    <span className="text-[11px] text-slate-500 block">{dept.headName}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[11px] font-bold rounded-md font-mono">
                    {deptComplaints.length} Cases
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Workload Capacity</span>
                    <span className="font-semibold text-slate-800">{loadRatio}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${loadRatio > 75 ? 'bg-amber-500' : 'bg-sky-500'}`}
                      style={{ width: `${loadRatio}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px] border-t border-slate-200">
                  <div className="p-1 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 block">Officers</span>
                    <span className="font-bold text-slate-800">{dept.activeOfficersCount}</span>
                  </div>
                  <div className="p-1 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 block">Urgent</span>
                    <span className="font-bold text-red-600">{urgentCount}</span>
                  </div>
                  <div className="p-1 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 block">Avg SLA</span>
                    <span className="font-bold text-slate-800">{dept.avgResolutionHours}h</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Escalation & Overdue Action Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Priority Escalation & Supervisor Overrides
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Urgent civic grievances requiring fast-tracked dispatch or cross-department reallocation.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
            {escalatedComplaints.length} In Focus
          </span>
        </div>

        <div className="space-y-3">
          {escalatedComplaints.map((c) => (
            <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 flex-1 min-w-[280px]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {c.trackingNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.priorityScore.label === 'Urgent' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Score: {c.priorityScore.total}/100 ({c.priorityScore.label})
                  </span>
                  <span className="text-xs text-slate-500">📍 {c.ward}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-1">{c.rawDescription}</p>
                <div className="text-[10px] text-slate-500">
                  Current Dept: <strong>{c.department}</strong> • SLA Status: <span className="text-red-600 font-bold">{c.slaStatus}</span>
                </div>
              </div>

              {/* Fast-track Reassignment Controls */}
              <div className="flex items-center gap-2">
                <select
                  defaultValue={c.department}
                  id={`reassign-${c.id}`}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const sel = document.getElementById(`reassign-${c.id}`) as HTMLSelectElement;
                    if (sel) handleQuickEscalate(c, sel.value);
                  }}
                  className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Reassign & Fast-track</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
