import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Loader2 } from 'lucide-react';

// Fix for default leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A component to recenter the map when coordinates change
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapPicker({ onRouteSelected, readOnly = false, initialFrom = null, initialTo = null, initialDistance = 0 }) {
  const DEFAULT_CENTER = [25.75, 85.45]; // Jandaha roughly
  const [fromLocation, setFromLocation] = useState(initialFrom || null);
  const [toLocation, setToLocation] = useState(initialTo || null);
  const [fromQuery, setFromQuery] = useState(initialFrom?.name || '');
  const [toQuery, setToQuery] = useState(initialTo?.name || '');
  const [routeCoords, setRouteCoords] = useState([]);
  const [distanceKm, setDistanceKm] = useState(initialDistance || 0);
  const [isSearching, setIsSearching] = useState(false);

  // Focus tracking for search dropdowns
  const [activeInput, setActiveInput] = useState(null); // 'from' or 'to'
  const [searchResults, setSearchResults] = useState([]);

  // Search OSM Nominatim
  const searchLocation = async (query, type) => {
    if (!query || query.length < 3) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=85.0,26.0,86.0,25.0&bounded=1`);
      const data = await res.json();
      setSearchResults(data.slice(0, 5));
    } catch (err) {
      console.error("OSM Search Error", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (result, type) => {
    const loc = { name: result.display_name.split(',')[0], lat: parseFloat(result.lat), lon: parseFloat(result.lon) };
    if (type === 'from') {
      setFromLocation(loc);
      setFromQuery(loc.name);
    } else {
      setToLocation(loc);
      setToQuery(loc.name);
    }
    setSearchResults([]);
    setActiveInput(null);
  };

  // Fetch Route from OSRM
  useEffect(() => {
    if (fromLocation && toLocation) {
      const getRoute = async () => {
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromLocation.lon},${fromLocation.lat};${toLocation.lon},${toLocation.lat}?overview=full&geometries=geojson`);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            // OSRM returns [lon, lat] for geojson, Leaflet needs [lat, lon]
            const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
            setRouteCoords(coords);
            const dist = (route.distance / 1000).toFixed(1);
            setDistanceKm(dist);
            
            if (onRouteSelected) {
              onRouteSelected(fromLocation, toLocation, dist, coords);
            }
          }
        } catch (err) {
          console.error("Route fetch error", err);
        }
      };
      getRoute();
    }
  }, [fromLocation, toLocation]);

  return (
    <div className="relative flex flex-col h-full bg-slate-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      
      {!readOnly && (
        <div className="absolute top-2 left-2 right-2 z-[1000] space-y-2">
          {/* FROM Input */}
          <div className="relative">
            <div className="flex items-center bg-white px-3 py-2.5 rounded-xl shadow-md border border-gray-100">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 mr-3"></div>
              <input 
                type="text" 
                placeholder="Pickup Location" 
                className="w-full text-sm outline-none bg-transparent"
                value={fromQuery}
                onFocus={() => setActiveInput('from')}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  searchLocation(e.target.value, 'from');
                }}
              />
            </div>
            {activeInput === 'from' && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden text-sm">
                {searchResults.map((r, i) => (
                  <div key={i} onClick={() => selectResult(r, 'from')} className="p-3 border-b border-gray-50 hover:bg-teal-50 cursor-pointer truncate">
                    {r.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TO Input */}
          <div className="relative">
            <div className="flex items-center bg-white px-3 py-2.5 rounded-xl shadow-md border border-gray-100">
              <MapPin className="w-4 h-4 text-orange-500 mr-2.5" />
              <input 
                type="text" 
                placeholder="Drop-off Location" 
                className="w-full text-sm outline-none bg-transparent"
                value={toQuery}
                onFocus={() => setActiveInput('to')}
                onChange={(e) => {
                  setToQuery(e.target.value);
                  searchLocation(e.target.value, 'to');
                }}
              />
            </div>
            {activeInput === 'to' && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden text-sm">
                {searchResults.map((r, i) => (
                  <div key={i} onClick={() => selectResult(r, 'to')} className="p-3 border-b border-gray-50 hover:bg-orange-50 cursor-pointer truncate">
                    {r.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* The Map */}
      <div className="flex-1 min-h-[300px] w-full z-0 relative">
        <MapContainer center={DEFAULT_CENTER} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {fromLocation && (
            <Marker position={[fromLocation.lat, fromLocation.lon]} />
          )}
          {toLocation && (
            <Marker position={[toLocation.lat, toLocation.lon]} />
          )}
          {routeCoords.length > 0 && (
            <Polyline positions={routeCoords} color="#0d9488" weight={4} opacity={0.8} />
          )}
          
          <ChangeView 
            center={fromLocation ? [fromLocation.lat, fromLocation.lon] : DEFAULT_CENTER} 
            zoom={fromLocation && toLocation ? 12 : 13} 
          />
        </MapContainer>
        
        {distanceKm > 0 && (
          <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-xl shadow-lg font-bold text-teal-700 text-sm z-[1000]">
            {distanceKm} km
          </div>
        )}
      </div>
    </div>
  );
}
