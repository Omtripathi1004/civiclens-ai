import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint } from '../types';
import { MapPin, ShieldAlert, Layers, Eye } from 'lucide-react';

interface OfficerMapViewProps {
  complaints: Complaint[];
  onSelectComplaint?: (complaint: Complaint) => void;
  selectedComplaintId?: string | null;
}

export const OfficerMapView: React.FC<OfficerMapViewProps> = ({
  complaints,
  onSelectComplaint,
  selectedComplaintId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered at Delhi NCR / North India municipal centroid
    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.2090],
      zoom: 12,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | Mappls-Compliant Municipal Layer',
      maxZoom: 19
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const validItems = complaints.filter((c) => c.coordinates && c.coordinates.lat && c.coordinates.lng);
    const bounds = L.latLngBounds([]);

    validItems.forEach((c) => {
      if (!c.coordinates) return;

      // Color based on priority
      let color = '#0284c7'; // Medium
      if (c.priorityScore.label === 'Urgent') color = '#ef4444';
      else if (c.priorityScore.label === 'High') color = '#f59e0b';
      else if (c.priorityScore.label === 'Routine') color = '#10b981';

      const isSelected = c.id === selectedComplaintId;

      const markerIcon = L.divIcon({
        className: 'officer-marker',
        html: `
          <div style="background-color: ${color}; width: ${isSelected ? '36px' : '28px'}; height: ${isSelected ? '36px' : '28px'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: ${isSelected ? '3px solid #ffffff' : '2px solid #ffffff'}; transform: translate(-50%, -50%); transition: all 0.2s;">
            <span style="color: white; font-size: 11px; font-weight: bold;">${c.priorityScore.total}</span>
          </div>
        `,
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14]
      });

      const marker = L.marker([c.coordinates.lat, c.coordinates.lng], { icon: markerIcon });

      // Safe summary popup adhering to strict privacy rules (no citizen contact or internal notes)
      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 210px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-family: monospace; font-weight: bold; color: #0f172a; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${c.trackingNumber}</span>
            <span style="background: ${color}20; color: ${color}; font-weight: bold; padding: 2px 6px; border-radius: 9999px; font-size: 10px;">${c.priorityScore.label} (${c.priorityScore.total})</span>
          </div>
          <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px; font-size: 12px; line-height: 1.3;">
            ${c.title}
          </div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">
            📁 <strong>${c.category}</strong>
          </div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
            📍 ${c.ward}
          </div>
          <div style="font-size: 10px; color: #475569; background: #f8fafc; padding: 4px 6px; border-radius: 4px; margin-bottom: 8px;">
            🏛 Dept: <strong>${c.department}</strong><br/>
            ⏱ Status: <strong>${c.status.toUpperCase()}</strong>
          </div>
          <button id="inspect-btn-${c.id}" style="width: 100%; background: #0284c7; color: white; border: none; padding: 6px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 11px;">
            Inspect Complaint
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`inspect-btn-${c.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectComplaint) onSelectComplaint(c);
          };
        }
      });

      marker.addTo(markersLayerRef.current!);
      bounds.extend([c.coordinates.lat, c.coordinates.lng]);
    });

    if (validItems.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [complaints, selectedComplaintId]);

  return (
    <div className="relative border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
      {/* Map Header Toolbar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Layers className="w-4 h-4 text-sky-600" />
          <span>Spatial Complaint Heatmap (Mappls Engine)</span>
          <span className="text-slate-400 font-normal">| {complaints.filter(c => c.coordinates).length} Geotagged Cases</span>
        </div>
        
        {/* Priority Legend */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Urgent
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> High
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Medium
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Routine
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-[360px]" />

      {/* Privacy Guarantee Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-sky-600" />
          <span>Complies with Section 8: Citizen phone/email strictly masked from public GIS layers.</span>
        </span>
        <span className="text-slate-400">Click marker to inspect triage details</span>
      </div>
    </div>
  );
};
