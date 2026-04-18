import { MapContainer, TileLayer} from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { Marker } from 'react-leaflet/Marker';
import { Popup } from 'react-leaflet/Popup';
import { useEffect, useState } from 'react';
import type { Listing } from '../../types/listing.ts';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png'; // ← ADD THESE
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export function MapView() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [neighborhood, setNeighborhood] = useState<string | null>("");

    const position: [number, number] = [53.5488, 9.9924]; // Coordinates for Hamburg


    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/listings`);
                if (!response.ok) {
                    throw new Error('Failed to fetch listings');
                }
                console.log('Fetched listings successfully');
                const data = await response.json();
                console.log('One listing data:', data.data?.[0]);
                console.log('All listings data:', data.data);
                setListings(data.data);
            } catch (error) {
                console.error('Error fetching listings:', error);
            }
        };

        fetchListings();
    }, []);

    const neighborhoods = Array.from(new Set(listings.map((listing) => listing.neighborhood)));

    const filteredListings = neighborhood
        ? listings.filter((listing) => listing.neighborhood === neighborhood)
        : listings;

  return (
    <div>
        <select className="form-select mb-6" value={neighborhood || ""} onChange={(e) => setNeighborhood(e.target.value)}>
            <option value="">All Neighborhoods</option>
            {neighborhoods.map((n) => (
                <option key={n} value={n}>{n}</option>
            ))}
        </select>

        <MapContainer className="map-container" center={position} zoom={13} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {filteredListings.map((listing) => (
        <Marker key={listing._id} position={[listing.lat, listing.lng]}>
          <Popup className="popup flex-col">
            <div className="font-bold text-lg mb-3 text-villageRed">{listing.title}</div>
            {listing.description}
            <div className="text-sm text-gray-500 mt-2">{listing.neighborhood}</div>
            <button className="btn text-black bg-villagePink mt-2" onClick={() => window.location.href = `/listings/${listing._id}`}>
              View Details
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
    </div>
    
  );
}