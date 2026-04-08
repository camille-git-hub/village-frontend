import { useState } from "react";
import { useNavigate } from "react-router";
import type { Listing } from "../types/listing.ts";

export const ListingsPage = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: "",
        neighborhood: "",
        q: "",
    });
    
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const fetchListings = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.category) queryParams.append("category", filters.category);
            if (filters.neighborhood) queryParams.append("neighborhood", filters.neighborhood);
            if (filters.q) queryParams.append("q", filters.q);

            const response = await fetch(`${API_URL}/listings?${queryParams.toString()}`, {
            //credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to fetch listings");
            }
            const listings = await response.json();
            setListings(listings.data);
            
        } catch (error) {
                console.error("Error fetching listings:", error);
        } finally {
                setLoading(false);
        }
    };

  return (
    <div className="p-4 w-1/2 ml-40 mr-auto">
      <h1 className="text-2xl font-bold mb-4">Listings Feed</h1>
        <div className="mb-4">
            <input
                type="text"
                placeholder="Search..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                className="border p-2 rounded w-full mb-2"
            />
            <select
                value={filters.neighborhood}
                onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
                className="border p-2 rounded w-full"
            >
                <option value="">All Neighborhoods</option>
                <option value="altstadt">Altstadt</option>
                <option value="stpauli">St. Pauli</option>
                <option value="altona">Altona</option>
                <option value="bahrenfeld">Bahrenfeld</option>
                <option value="eimsbuettel">Eimsbüttel</option>
                <option value="hamburg-mitte">Hamburg-Mitte</option>
                <option value="harburg">Harburg</option>
                <option value="wandsbek">Wandsbek</option>
                <option value="bergedorf">Bergedorf</option>
                <option value="harburg">Harburg</option>
                <option value="mitte">Mitte</option>
                <option value="barmbek-nord">Barmbek-Nord</option>
                <option value="barmbek-sued">Barmbek-Süd</option>
                <option value="eppendorf">Eppendorf</option>
                <option value="rotherbaum">Rotherbaum</option>
                <option value="winterhude">Winterhude</option>
                <option value="altona">Altona</option>
                <option value="ottensen">Ottensen</option>
                <option value="lurup">Lurup</option>
                <option value="eidelstedt">Eidelstedt</option>
                <option value="norderstedt">Norderstedt</option>
                <option value="niendorf">Niendorf</option>
                
            </select>
            <button
                onClick={fetchListings}
                className="bg-villagePink text-black px-4 py-2 rounded mt-2 hover:bg-villageRed hover:text-white"
            >
                Search
            </button>
            <div className="mt-4">
                {loading ? (
                    <p>Loading listings...</p>
                ) : listings.length > 0 ? (
                    listings.map((listing) => (
                        <div key={listing.title} className="border rounded-lg p-4 shadow-md mb-4">
                            <h2 className="text-xl font-bold mb-2">{listing.title}</h2>
                            <p className="text-gray-600">{listing.description}</p>
                            <p className="text-sm text-gray-500">{listing.category}</p>
                            <p className="text-sm text-gray-500">{listing.neighborhood}</p>
                        </div>
                    ))
                ) : (
                    <p>No listings found.</p>
                )}
            </div>
            {listings.length >= 0 && (
                <button
                    onClick={() => navigate("/listings/new")}
                    className="bg-villageRed text-white px-4 py-2 rounded mt-2 hover:bg-villagePink hover:text-black"
                >
                    Add New Listing
                </button>
            )}
        </div>
    </div>
  )};

export default ListingsPage;