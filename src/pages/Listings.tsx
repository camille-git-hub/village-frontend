import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Listing } from "../types/listing.ts";
import { ListingCard } from "../components/ListingCard.tsx";
import { HAMBURG_NEIGHBORHOODS } from "../utils/neightborhoods.ts";

export const ListingsPage = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: "",
        neighborhood: "",
        q: "",
    });

    const neighborhoods = Array.from(new Set(listings.map((listing) => listing.neighborhood)));
    
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
            credentials: "include"
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

    useEffect(() => {
        fetchListings();
    }, []);

  return (
    <div className="p-4 w-full lg:ml-40 lg:w-1/2 sm:w-full">
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
                {neighborhoods.map((n) => (
                <option key={n} value={n}>{n}</option>
                ))}
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
                    listings.map((listing: Listing) => (
                        <ListingCard key={listing._id} listing={listing} detailsButton={true} onClick={() => navigate(`/listings/${listing._id}`)} />
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