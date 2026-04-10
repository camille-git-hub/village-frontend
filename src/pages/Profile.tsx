import { use } from 'react';
import { AuthContext } from '../context/AuthContext.tsx';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Listing } from '../types/listing.ts';
import { ListingCard } from '../components/ListingCard.tsx';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";



export const Profile = () => {
    const context = use(AuthContext);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    if (!context) throw new Error("missing auth context");

    const { user, handleLogout, isLoggedin, isLoading } = context;

    if (!isLoading && !isLoggedin) {
    return <Link to={"/"} />;}

    const fetchListings = async (ownerId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/listings/owner/${ownerId}`, {
            credentials: "include"
            });
            console.log("Fetching listings for ownerId:", ownerId);
            if (!response.ok) {
                throw new Error("Failed to fetch listings");
            }
            const data = await response.json();
            setListings(data.data || data);
            console.log("Fetched user's listings:", data.data || data);
        } catch (error) {
            console.error("Error fetching user's listings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (listingId: string) => {
        if (!confirm("Are you sure you want to delete this listing?")) {
            return;
        }
        try {
            const response = await fetch(`${API_URL}/listings/${listingId}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (!response.ok) {
                throw new Error("Failed to delete listing");
            }
            // Remove the deleted listing from the state
            setListings(listings.filter((l) => l._id !== listingId));
            console.log("Deleted listing with ID:", listingId);
        } catch (error) {
            console.error("Error deleting listing:", error);
        }
    };

    const handleEdit = (listingId: string) => {
        navigate(`/listings/${listingId}/edit`);
    };

    useEffect(() => {
        console.log("user?._id:", user?._id, user);
        console.log("Full user object:", JSON.stringify(user, null, 2));
        if (user?._id) {
            fetchListings(user._id);
        } else {
            console.warn("User ID is not available, cannot fetch listings");
        }
    }, [user?._id]);

    return (
        <div className="p-4 w-full lg:ml-40 lg:w-1/2 sm:w-full">
        
        <div>
            <h1 className="text-2xl font-bold">Hi {user?.firstName} {user?.lastName}</h1>
            <p className="text-gray-500">{user?.email}</p>
    </div>
        <div className="p-4 px-8 w-full border-t border-gray-300 mt-4">
            <h3 className="text-xl font-bold mb-4">Your Listings</h3>
            {loading ? (
                <p>Loading...</p>
            ) : listings.length > 0 ? (
                <div className="w-full flex flex-col gap-4">
                    {listings.map((listing) => (
                        <ListingCard key={listing._id} listing={listing} onDelete={handleDelete} onEdit={handleEdit} showActions={true} /> 
                    ))}
                </div>
            ) : (
                <p>You have no listings yet.</p>
            )}
            <button onClick={() => window.location.href = "/listings/new"} className="btn text-black bg-villagePink hover:bg-villageRed hover:text-white mt-4">
                Create New Listing
            </button>
        </div>
        <div className="p-4 px-8 w-full">
            <button onClick={handleLogout} className="btn text-white bg-villageRed hover:bg-villagePink hover:text-black">
                Logout
            </button>
        </div>
        </div>
    );
}

export default Profile;