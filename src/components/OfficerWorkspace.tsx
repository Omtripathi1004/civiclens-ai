import React, { useState } from 'react';
import { 
  Complaint, 
  ComplaintStatus, 
  PriorityLevel, 
  DepartmentConfig, 
  AuditLogItem 
} from '../types';
import { OfficerMapView } from './OfficerMapView';
import { 
  Filter, 
  SlidersHorizontal, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Link2, 
  MapPin, 
  Eye, 
  Sparkles, 
  MessageSquare, 
  Send, 
  FileCheck, 
  UserPlus, 
  ShieldCheck, 
  ExternalLink, 
  Camera, 
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface OfficerWorkspaceProps {
  complaints: Complaint[];
  departments: DepartmentConfig[];
  onUpdateComplaint: (complaint: Complaint) => void;
  onAddAuditLog: (log: AuditLogItem) => void;
}

export const OfficerWorkspace: React.FC<OfficerWorkspaceProps> = ({
  complaints,
  departments,
  onUpdateComplaint,
  onAddAuditLog
}) => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(complaints[0] || null);
  const [activeFilterStatus, setActiveFilterStatus] = useState<string>('all');
  const [activeFilterPriority, setActiveFilterPriority] = useState<string>('all');
  const [activeFilterWard, setActiveFilterWard] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Drawer / Inspection states
  const [newInternalNote, setNewInternalNote] = useState<string>('');
  const [resolutionText, setResolutionText] = useState<string>('');
  const [resolutionPhoto, setResolutionPhoto] = useState<string>('https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80');
  const [clarificationQuestion, setClarificationQuestion] = useState<string>('');
  const [departmentOverride, setDepartmentOverride] = useState<string>('');

  // Filtering
  const filteredComplaints = complaints.filter((c) => {
    if (activeFilterStatus !== 'all' && c.status !== activeFilterStatus) return false;
    if (activeFilterPriority !== 'all' && c.priorityScore.label !== activeFilterPriority) return false;
    if (activeFilterWard !== 'all' && !c.ward.includes(activeFilterWard)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.trackingNumber.toLowerCase().includes(q) ||
        c.rawDescription.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Action: Change Status
  const handleStatusChange = (newStatus: ComplaintStatus) => {
    if (!selectedComplaint) return;
    const isResolving = newStatus === 'resolved';

    const updated: Complaint = {
      ...selectedComplaint,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      resolutionEvidence: isResolving ? {
        text: resolutionText.trim() || 'Work order completed and verified on-site by municipal engineering crew.',
        photoUrl: resolutionPhoto,
        closedBy: 'Officer In-Charge',
        closedAt: new Date().toISOString()
      } : selectedComplaint.resolutionEvidence,
      timeline: [
        ...selectedComplaint.timeline,
        {
          id: `t-stat-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Municipal Field Officer',
          action: `Status Updated to ${newStatus.toUpperCase()}`,
          notes: isResolving ? (resolutionText.trim() || 'Completed resolution on site') : `Status transitioned to ${newStatus}`,
          evidenceUrl: isResolving ? resolutionPhoto : undefined
        }
      ]
    };

    onUpdateComplaint(updated);
    setSelectedComplaint(updated);

    onAddAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Municipal Officer',
      actorRole: 'officer',
      action: `Status Changed to ${newStatus}`,
      complaintRef: updated.trackingNumber,
      details: `Officer updated complaint ${updated.trackingNumber} status to ${newStatus}`
    });
  };

  // Action: Add Internal Note
  const handleAddInternalNote = () => {
    if (!selectedComplaint || !newInternalNote.trim()) return;
    const note = {
      id: `n-${Date.now()}`,
      author: 'Officer (Current Session)',
      role: 'officer',
      text: newInternalNote.trim(),
      timestamp: new Date().toISOString()
    };
    const updated: Complaint = {
      ...selectedComplaint,
      internalNotes: [...selectedComplaint.internalNotes, note]
    };
    onUpdateComplaint(updated);
    setSelectedComplaint(updated);
    setNewInternalNote('');

    onAddAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Officer',
      actorRole: 'officer',
      action: 'Internal Note Added',
      complaintRef: updated.trackingNumber,
      details: `Added note: "${note.text.slice(0, 40)}..."`
    });
  };

  // Action: Confirm Duplicate Link
  const handleLinkDuplicate = (targetRef: string) => {
    if (!selectedComplaint) return;
    const updatedDuplicates = selectedComplaint.duplicates.map((d) =>
      d.targetRef === targetRef ? { ...d, status: 'Linked' as const } : d
    );
    const updated: Complaint = {
      ...selectedComplaint,
      duplicates: updatedDuplicates,
      timeline: [
        ...selectedComplaint.timeline,
        {
          id: `t-dup-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Municipal Officer',
          action: 'Duplicate Complaint Linked',
          notes: `Confirmed linked cluster with complaint reference ${targetRef}. Both citizen tracking references preserved.`
        }
      ]
    };
    onUpdateComplaint(updated);
    setSelectedComplaint(updated);

    onAddAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Officer',
      actorRole: 'officer',
      action: 'Linked Duplicate',
      complaintRef: selectedComplaint.trackingNumber,
      details: `Linked complaint ${selectedComplaint.trackingNumber} with parent ${targetRef} with full audit trail.`
    });
  };

  // Action: Dismiss Candidate
  const handleDismissDuplicate = (targetRef: string) => {
    if (!selectedComplaint) return;
    const updatedDuplicates = selectedComplaint.duplicates.map((d) =>
      d.targetRef === targetRef ? { ...d, status: 'Dismissed' as const } : d
    );
    const updated: Complaint = {
      ...selectedComplaint,
      duplicates: updatedDuplicates
    };
    onUpdateComplaint(updated);
    setSelectedComplaint(updated);
  };

  // Action: Override Department
  const handleApplyDepartmentOverride = () => {
    if (!selectedComplaint || !departmentOverride) return;
    const updated: Complaint = {
      ...selectedComplaint,
      department: departmentOverride,
      timeline: [
        ...selectedComplaint.timeline,
        {
          id: `t-ovr-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Municipal Officer Override',
          action: 'Department Routing Reassigned',
          notes: `Reassigned from ${selectedComplaint.department} to ${departmentOverride}`
        }
      ]
    };
    onUpdateComplaint(updated);
    setSelectedComplaint(updated);

    onAddAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Officer',
      actorRole: 'officer',
      action: 'Department Reassigned',
      complaintRef: updated.trackingNumber,
      details: `Reassigned to ${departmentOverride}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filters & View Toggle */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by ref (e.g. MCD-2026), title, keyword or ward..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Queue List ({filteredComplaints.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span>GIS Map View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-slate-100">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Filters:
          </span>

          <select
            value={activeFilterPriority}
            onChange={(e) => setActiveFilterPriority(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-xs"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent Only (80+)</option>
            <option value="High">High (60-79)</option>
            <option value="Medium">Medium (30-59)</option>
            <option value="Routine">Routine (&lt;30)</option>
          </select>

          <select
            value={activeFilterStatus}
            onChange={(e) => setActiveFilterStatus(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="triaged">Triaged</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="reopened">Reopened</option>
          </select>

          <select
            value={activeFilterWard}
            onChange={(e) => setActiveFilterWard(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-xs"
          >
            <option value="all">All Wards</option>
            <option value="Lajpat">Ward 14 (Lajpat Nagar)</option>
            <option value="Karol">Ward 28 (Karol Bagh)</option>
            <option value="Rohini">Ward 52 (Rohini)</option>
            <option value="Indiranagar">Ward 77 (Indiranagar)</option>
            <option value="Andheri">Ward 91 (Andheri)</option>
          </select>

          {(activeFilterPriority !== 'all' || activeFilterStatus !== 'all' || activeFilterWard !== 'all' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setActiveFilterPriority('all');
                setActiveFilterStatus('all');
                setActiveFilterWard('all');
                setSearchTerm('');
              }}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold cursor-pointer underline ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* If Map View is active, render top GIS Map */}
      {viewMode === 'map' && (
        <OfficerMapView
          complaints={filteredComplaints}
          onSelectComplaint={(c) => setSelectedComplaint(c)}
          selectedComplaintId={selectedComplaint?.id}
        />
      )}

      {/* Main Workspace: Left Column List + Right Column Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Complaint Cards List (5 Columns) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
            <span>Showing {filteredComplaints.length} municipal tickets</span>
            <span>Sorted by Urgency & SLA</span>
          </div>

          <div className="space-y-2.5 max-h-[820px] overflow-y-auto pr-1">
            {filteredComplaints.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400">
                <p className="text-sm font-semibold">No complaints match current filters</p>
                <p className="text-xs mt-1">Try resetting the filters above.</p>
              </div>
            ) : (
              filteredComplaints.map((item) => {
                const isSelected = selectedComplaint?.id === item.id;
                const isUrgent = item.priorityScore.label === 'Urgent';
                const hasDuplicates = item.duplicates && item.duplicates.length > 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedComplaint(item)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-sky-50/70 border-sky-400 shadow-sm ring-1 ring-sky-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {item.trackingNumber}
                        </span>
                        {hasDuplicates && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md border border-amber-300">
                            <Link2 className="w-2.5 h-2.5" />
                            Dup ({item.duplicates.length})
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          item.priorityScore.label === 'Urgent'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : item.priorityScore.label === 'High'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : item.priorityScore.label === 'Medium'
                            ? 'bg-sky-100 text-sky-800 border border-sky-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {item.priorityScore.label} ({item.priorityScore.total})
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                      {item.rawDescription}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.ward.split('-')[0]}
                      </span>
                      <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.status.toUpperCase()}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Inspector & Workflow Console (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedComplaint ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-extrabold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded">
                      {selectedComplaint.trackingNumber}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800">
                      {selectedComplaint.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500">
                      {selectedComplaint.ward}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedComplaint.title}
                  </h3>
                </div>

                {/* Priority Badge */}
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold ${
                    selectedComplaint.priorityScore.label === 'Urgent' ? 'bg-red-100 text-red-900 border border-red-300' :
                    selectedComplaint.priorityScore.label === 'High' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    selectedComplaint.priorityScore.label === 'Medium' ? 'bg-sky-100 text-sky-900 border border-sky-300' :
                    'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {selectedComplaint.priorityScore.label} Priority ({selectedComplaint.priorityScore.total}/100)
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    SLA: {selectedComplaint.slaHours}h ({selectedComplaint.slaStatus})
                  </span>
                </div>
              </div>

              {/* Status Update Quick Bar */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700">Advance Workflow Status:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('triaged')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
                  >
                    Mark Triaged
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('in_progress')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 cursor-pointer"
                  >
                    Mark In-Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('resolved')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    Resolve & Attach Proof
                  </button>
                </div>
              </div>

              {/* Original Report & Evidence */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Original Citizen Report
                </span>
                <p className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                  "{selectedComplaint.rawDescription}"
                </p>

                {/* Evidence Photos */}
                {selectedComplaint.evidencePhotos.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Citizen Uploaded Evidence ({selectedComplaint.evidencePhotos.length}):
                    </span>
                    <div className="flex gap-2">
                      {selectedComplaint.evidencePhotos.map((photo) => (
                        <a
                          key={photo.id}
                          href={photo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative h-24 w-32 rounded-lg overflow-hidden border border-slate-300 block shadow-2xs"
                        >
                          <img src={photo.url} alt="Evidence" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-semibold transition-opacity">
                            View Full Photo
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Extraction Confidence Breakdown */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    AI Triage Extraction Confidence
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {(selectedComplaint.aiExtraction.confidencePerField.overall * 100).toFixed(0)}% Mean Reliability
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Category</span>
                    <span className="font-bold font-mono text-slate-900">
                      {(selectedComplaint.aiExtraction.confidencePerField.category * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Summary</span>
                    <span className="font-bold font-mono text-slate-900">
                      {(selectedComplaint.aiExtraction.confidencePerField.summary * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Asset</span>
                    <span className="font-bold font-mono text-slate-900">
                      {(selectedComplaint.aiExtraction.confidencePerField.asset * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Department</span>
                    <span className="font-bold font-mono text-slate-900">
                      {(selectedComplaint.aiExtraction.confidencePerField.department * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Routing & Department Reassignment */}
                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-sky-800 font-semibold block uppercase">Assigned Department</span>
                    <span className="font-bold text-slate-900">{selectedComplaint.department}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <select
                      value={departmentOverride || selectedComplaint.department}
                      onChange={(e) => setDepartmentOverride(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded-md text-xs text-slate-800"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleApplyDepartmentOverride}
                      className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-md font-semibold cursor-pointer"
                    >
                      Reassign
                    </button>
                  </div>
                </div>
              </div>

              {/* Explainable Priority Score Breakdown */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Explainable Priority Score Breakdown (Rule-Based Policy v2026.4)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-center">
                  <div className="p-2 bg-red-50 text-red-900 rounded-lg border border-red-200">
                    <span className="text-[10px] text-red-700 block">Safety (40)</span>
                    <span className="font-bold font-mono text-sm">{selectedComplaint.priorityScore.breakdown.safetyRisk}</span>
                  </div>
                  <div className="p-2 bg-amber-50 text-amber-900 rounded-lg border border-amber-200">
                    <span className="text-[10px] text-amber-700 block">Infra (20)</span>
                    <span className="font-bold font-mono text-sm">{selectedComplaint.priorityScore.breakdown.affectedInfra}</span>
                  </div>
                  <div className="p-2 bg-sky-50 text-sky-900 rounded-lg border border-sky-200">
                    <span className="text-[10px] text-sky-700 block">Duration (15)</span>
                    <span className="font-bold font-mono text-sm">{selectedComplaint.priorityScore.breakdown.duration}</span>
                  </div>
                  <div className="p-2 bg-indigo-50 text-indigo-900 rounded-lg border border-indigo-200">
                    <span className="text-[10px] text-indigo-700 block">Severity (15)</span>
                    <span className="font-bold font-mono text-sm">{selectedComplaint.priorityScore.breakdown.severity}</span>
                  </div>
                  <div className="p-2 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 block">Evidence (10)</span>
                    <span className="font-bold font-mono text-sm">{selectedComplaint.priorityScore.breakdown.corroboratingEvidence}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5">Audit Explanation:</span>
                  {selectedComplaint.priorityScore.explanation}
                </div>
              </div>

              {/* Duplicate Candidates Resolver (Section 8 Master Prompt) */}
              {selectedComplaint.duplicates && selectedComplaint.duplicates.length > 0 && (
                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-amber-600" />
                      Duplicate Candidates Detected ({selectedComplaint.duplicates.length})
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Officer approval required to link; citizen refs preserved
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedComplaint.duplicates.map((dup, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900">{dup.targetRef}</span>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-md text-[10px]">
                            {dup.overallScore}% Duplicate Probability
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-normal">
                          {dup.reason}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                          <span className="text-[10px] text-slate-500 font-mono">
                            Status: <strong>{dup.status}</strong>
                          </span>
                          {dup.status === 'Candidate' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleLinkDuplicate(dup.targetRef)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                              >
                                Link as Duplicate
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDismissDuplicate(dup.targetRef)}
                                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                              >
                                Dismiss Candidate
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Officer Notes & Resolution Proof */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Internal Officer Notes ({selectedComplaint.internalNotes.length})
                </span>

                {selectedComplaint.internalNotes.map((note) => (
                  <div key={note.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-bold text-slate-800">{note.author}</span>
                      <span className="font-mono">{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-700">{note.text}</p>
                  </div>
                ))}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add internal municipal notes (not visible to citizen)..."
                    value={newInternalNote}
                    onChange={(e) => setNewInternalNote(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddInternalNote}
                    disabled={!newInternalNote.trim()}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-400">
              Select a complaint from the left queue to view details and take action.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
