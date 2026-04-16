import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Listing } from "../types/listing.ts";
import { ListingCard } from "../components/ListingCard.tsx";
import { useAuth } from "../context/AuthContext.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const ListingsPage = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [savedListings, setSavedListings] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        category: "",
        neighborhood: "",
        q: "",
    });

    const ITEMS_PER_PAGE = 5;
    const neighborhoods = Array.from(new Set(listings.map((listing) => listing.neighborhood)));
    
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const AUTH_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:4000";
    const user = useAuth().user;

    const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentListings = listings.slice(startIndex, endIndex);

    const fetchListings = async () => {
        setLoading(true);
        setCurrentPage(1); // Reset to first page on new search
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

    const fetchSavedListings = async () => {
        if (!user?._id) return;
    try {
        const token = localStorage.getItem('accessToken');
        
        const idsResponse = await fetch(`${AUTH_URL}/users/${user._id}/saved`, { 
            method: "GET", 
            credentials: "include",
            headers: {
                'Authorization': `Bearer ${token || ''}`,
            },
        });
        
        if (!idsResponse.ok) throw new Error("Failed to fetch saved listings");
        
        const idsData = await idsResponse.json();
        const listingIds = idsData.data || [];

        console.log('Fetched saved listing IDs:', listingIds);
        setSavedListings(listingIds);  // ← Just set the IDs directly
        
    } catch (error) {
        console.error("Error fetching saved listings:", error);
        setSavedListings([]);
    }
};

    const handleSaveListing = async (listingId: any) => {
    try {
        const token = localStorage.getItem('accessToken');
        const isSaved = savedListings.includes(listingId);
        const method = isSaved ? 'DELETE' : 'POST';

        console.log(`${method === 'DELETE' ? 'Unsaving' : 'Saving'} listing ${listingId}`);

        
        const response = await fetch(`${API_URL}/listings/${listingId}/save`, {
            method: method,
            credentials: 'include',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to save listing');

        if (isSaved) {
            setSavedListings(prevSavedListings => prevSavedListings.filter(id => id !== listingId));
        } else {
            console.log('Listing saved successfully, updating state');
            setSavedListings(prevSavedListings => [...prevSavedListings, listingId]);
            }

    } catch (error) {
        console.error('Error saving listing:', error);
    }
};

    useEffect(() => {
        if (user?._id) {
            fetchListings();
            fetchSavedListings();
        }
    }, [filters]);

    useEffect(() => {
        console.log('Saved listings updated:', savedListings);
        console.log('Current listings:', listings);
    }, [savedListings, listings]);

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
                    ) : currentListings.length > 0 ? (
                        <>
                            {currentListings.map((listing: Listing) => (
                                <ListingCard 
                                    key={listing._id} 
                                    listing={listing} 
                                    detailsButton={true} 
                                    savedButton={true} 
                                    onClick={() => navigate(`/listings/${listing._id}`)} 
                                    onSave={() => handleSaveListing(listing._id)}
                                    isSaved={savedListings.includes(listing._id)}
                                />
                            ))}

                            {/* PAGINATION */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-8">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <div className="flex gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 rounded font-medium transition ${
                                                    currentPage === page
                                                        ? 'bg-villageRed text-white'
                                                        : 'border border-gray-300 hover:bg-gray-100'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p>No listings found.</p>
                    )}
                </div>

                {listings.length >= 0 && (
                    <button
                        onClick={() => navigate("/profile", { state: { tab: "new" } })}
                        className="bg-villageRed text-white px-4 py-2 rounded mt-2 hover:bg-villagePink hover:text-black"
                    >
                        Add New Listing
                    </button>
                )}
            </div>
        </div>
    );
};

export default ListingsPage;