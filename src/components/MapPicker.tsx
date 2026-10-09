import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Compass, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface MapPickerProps {
  coordinates: { lat: number; lng: number } | null;
  onCoordinatesChange: (coords: { lat: number; lng: number } | null) => void;
  locationText?: string;
}

const CITY_PRESETS = [
  { name: 'Delhi MCD (Lajpat Nagar)', lat: 28.5684, lng: 77.2442 },
  { name: 'Delhi MCD (Karol Bagh)', lat: 28.6524, lng: 77.1912 },
  { name: 'Bengaluru BBMP (Indiranagar)', lat: 12.9725, lng: 77.6421 },
  { name: 'Mumbai BMC (Andheri West)', lat: 19.1205, lng: 72.8472 }
];

export const MapPicker: React.FC<MapPickerProps> = ({
  coordinates,
  onCoordinatesChange,
  locationText
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [manualLat, setManualLat] = useState<string>(coordinates?.lat ? coordinates.lat.toFixed(6) : '');
  const [manualLng, setManualLng] = useState<string>(coordinates?.lng ? coordinates.lng.toFixed(6) : '');
  const [manualError, setManualError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Sync internal text inputs if coordinates prop changes
  useEffect(() => {
    if (coordinates) {
      setManualLat(coordinates.lat.toFixed(6));
      setManualLng(coordinates.lng.toFixed(6));
    }
  }, [coordinates]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = coordinates?.lat || 28.5684;
    const initialLng = coordinates?.lng || 77.2442;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      scrollWheelZoom: true,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Mappls compatible GIS engine',
      maxZoom: 19
    }).addTo(map);

    // Custom SVG icon for pinned marker
    const pinIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="background-color: #0284c7; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.45); border: 3px solid white; transform: translate(-17px, -17px);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34]
    });

    if (coordinates) {
      const marker = L.marker([coordinates.lat, coordinates.lng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      marker.on('dragend', (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        onCoordinatesChange({ lat: position.lat, lng: position.lng });
      });

      markerRef.current = marker;
    }

    // Map click handler to pin location
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const validLat = parseFloat(lat.toFixed(6));
      const validLng = parseFloat(lng.toFixed(6));

      if (markerRef.current) {
        markerRef.current.setLatLng([validLat, validLng]);
      } else {
        const marker = L.marker([validLat, validLng], {
          icon: pinIcon,
          draggable: true
        }).addTo(map);

        marker.on('dragend', (evt) => {
          const m = evt.target;
          const pos = m.getLatLng();
          onCoordinatesChange({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) });
        });

        markerRef.current = marker;
      }

      onCoordinatesChange({ lat: validLat, lng: validLng });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update map when coordinates change externally
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (coordinates) {
      mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
      } else {
        const pinIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="background-color: #0284c7; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.45); border: 3px solid white; transform: translate(-17px, -17px);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34]
        });
        markerRef.current = L.marker([coordinates.lat, coordinates.lng], {
          icon: pinIcon,
          draggable: true
        }).addTo(mapInstanceRef.current);
      }
    }
  }, [coordinates]);

  const handleManualApply = () => {
    setManualError(null);
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      setManualError('Please provide valid decimal coordinates.');
      return;
    }
    if (lat < -90 || lat > 90) {
      setManualError('Latitude must be between -90 and 90 degrees.');
      return;
    }
    if (lng < -180 || lng > 180) {
      setManualError('Longitude must be between -180 and 180 degrees.');
      return;
    }

    onCoordinatesChange({ lat, lng });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
    }
  };

  const handleSelectPreset = (preset: { lat: number; lng: number }) => {
    onCoordinatesChange({ lat: preset.lat, lng: preset.lng });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([preset.lat, preset.lng], 15);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setManualError('Geolocation not supported in this browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        onCoordinatesChange({ lat, lng });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
        }
      },
      () => {
        setIsLocating(false);
        setManualError('Could not fetch GPS location. Please select on map or use preset.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Mappls / Leaflet Integration Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-sky-50 border border-sky-200 text-sky-800 px-3 py-2 rounded-lg">
        <div className="flex items-center gap-1.5 font-medium">
          <Compass className="w-4 h-4 text-sky-600" />
          <span>Mappls-Integrated Municipal Geocoding</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            GIS Engine Active
          </span>
          <span className="text-slate-500 hidden sm:inline">• Click on map to drop exact defect pin</span>
        </div>
      </div>

      {/* Quick Municipal Landmark Presets */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <Navigation className="w-3.5 h-3.5 text-slate-400" />
          Quick Wards:
        </span>
        {CITY_PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => handleSelectPreset(p)}
            className="text-xs px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50/50 transition-colors shadow-2xs font-medium cursor-pointer"
          >
            {p.name}
          </button>
        ))}
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={isLocating}
          className="text-xs px-2.5 py-1 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition-colors font-medium flex items-center gap-1 shadow-2xs cursor-pointer ml-auto"
        >
          <Navigation className="w-3 h-3" />
          {isLocating ? 'Detecting...' : 'Use My GPS'}
        </button>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-100" style={{ height: '260px' }}>
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Pinned Coordinates Overlay Badge */}
        {coordinates ? (
          <div className="absolute bottom-2.5 left-2.5 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-md text-xs flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <div>
              <span className="font-semibold text-slate-900">Pinned GPS: </span>
              <span className="font-mono text-slate-600">{coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}</span>
            </div>
            <button
              type="button"
              onClick={() => onCoordinatesChange(null)}
              className="text-slate-400 hover:text-red-500 font-bold ml-1.5 cursor-pointer"
              title="Remove Pin"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="absolute bottom-2.5 left-2.5 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-200 shadow-md text-xs text-amber-800 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Click on map to drop exact complaint pin</span>
          </div>
        )}
      </div>

      {/* Manual Coordinates Input & Data Integrity Validation */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            Manual Coordinate Verification (Optional Fallback)
          </span>
          <span className="text-[11px] text-slate-500">Limits: Lat ±90, Lng ±180</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">Latitude</label>
            <input
              type="text"
              placeholder="e.g. 28.568400"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">Longitude</label>
            <input
              type="text"
              placeholder="e.g. 77.244200"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleManualApply}
              className="w-full px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded transition-colors cursor-pointer text-center"
            >
              Apply Coordinates
            </button>
          </div>
        </div>

        {manualError && (
          <p className="text-red-600 text-[11px] flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3 h-3" />
            {manualError}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Data Privacy: Precise coordinates are bound strictly to municipal issue resolution; never shared publicly.</span>
        </div>
      </div>
    </div>
  );
};
