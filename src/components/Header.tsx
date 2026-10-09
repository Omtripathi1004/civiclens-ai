import React from 'react';
import { UserRole } from '../types';
import { 
  Building, 
  User, 
  Shield, 
  Users, 
  Settings, 
  BarChart3, 
  Sparkles, 
  HelpCircle,
  MapPin
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  currentView: 'portal' | 'analytics';
  onRoleChange: (role: UserRole) => void;
  onViewChange: (view: 'portal' | 'analytics') => void;
  onOpenDemoTour: () => void;
  activeTicketsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentView,
  onRoleChange,
  onViewChange,
  onOpenDemoTour,
  activeTicketsCount
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Brand Bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  CivicLens AI
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-300">
                  GOVTECH 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                AI Civic Complaint Triage, Explainable Routing & SLA Resolution
              </p>
            </div>
          </div>

          {/* Right Controls: Interactive Demo Tour & Live Badge */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenDemoTour}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Guided Demo Tour</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Mappls GIS Active</span>
            </div>
          </div>
        </div>

        {/* Navigation & Persona Switcher Tabs */}
        <div className="flex items-center justify-between border-t border-slate-100 py-2 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1">
            {/* Citizen Persona */}
            <button
              type="button"
              onClick={() => { onRoleChange('citizen'); onViewChange('portal'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentRole === 'citizen' && currentView === 'portal'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </button>

            {/* Officer Persona */}
            <button
              type="button"
              onClick={() => { onRoleChange('officer'); onViewChange('portal'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentRole === 'officer' && currentView === 'portal'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Officer Queue</span>
              {activeTicketsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  currentRole === 'officer' ? 'bg-sky-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {activeTicketsCount}
                </span>
              )}
            </button>

            {/* Supervisor Persona */}
            <button
              type="button"
              onClick={() => { onRoleChange('supervisor'); onViewChange('portal'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentRole === 'supervisor' && currentView === 'portal'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Supervisor & SLA</span>
            </button>

            {/* Admin Persona */}
            <button
              type="button"
              onClick={() => { onRoleChange('admin'); onViewChange('portal'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentRole === 'admin' && currentView === 'portal'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin & Policies</span>
            </button>

            {/* City Analytics */}
            <button
              type="button"
              onClick={() => onViewChange('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentView === 'analytics'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>City Analytics</span>
            </button>
          </div>

          {/* Active Jurisdiction Tag */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Configured for: <strong>Delhi MCD • Bengaluru BBMP • Mumbai BMC</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
