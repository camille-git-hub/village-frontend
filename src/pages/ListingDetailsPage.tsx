import { useNavigate, useParams } from 'react-router';
import { useEffect, useState} from 'react';
import type { Listing } from '../types/listing.ts';
import { ListingCard } from '../components/ListingCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';


const ListingDetailsPage = () => {
    const user = useAuth().user;
    const params = useParams();
    console.log('Route params:', params);
    const { _id } = useParams<{ _id: string }>();
    const [listing, setListing] = useState<Listing | null>(null);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const handleContact = () => {
        if (!listing) return;
        if (listing.ownerId === user?._id) {
            return;
        }
        
        try {
            const createChat = async () => {
                const response = await fetch(`${API_URL}/chats`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ participantId: listing.ownerId })
                });
                if (!response.ok) {
                    throw new Error('Failed to create or fetch chat');
                }
                const data = await response.json();
                return data.data;
            };

            createChat().then((chat) => {
                navigate(`/connect/${chat._id}`);
            });
        } catch (error) {
            console.error('Could not start chat. Please try again.', error);
        }   
    };

    useEffect(() => {
        if (!_id) {
            console.error('No listing ID provided in route parameters');
            return;
        }
        const fetchListing = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/listings/${_id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch listing');
                }
                const data = await response.json();
                console.log('Fetched listing successfully:', data);
                setListing(data.data || data); 
            } catch (error) {
                console.error('Error fetching listing:', error);
            }
        }

        fetchListing();
    }, [_id]);

    if (!listing) {
        return (
            <div className="pp-4 w-full lg:ml-40 lg:w-1/2 sm:w-full">
                <h1 className="text-villageRed text-2xl font-bold mb-4 mt-10">Listing Details</h1>
                <p>Loading listing...</p>
            </div>
        );
    }

    return (
    
    <div className="p-4 w-full lg:ml-40 lg:w-1/2 sm:w-full">
        <button onClick={() => window.history.back()} className="btn text-black bg-villagePink hover:bg-villageRed hover:text-white mb-2">
            Back
        </button>
      <h1 className="text-villageRed text-2xl font-bold mb-4 mt-10">Listing Details</h1>
        <ListingCard listing={listing} />
        {listing && listing.ownerId !== user?._id && (
        <button
        onClick={handleContact}
        className="bg-villageRed text-white cursor-pointer hover:bg-villagePink hover:text-black px-6 py-2 rounded mt-4"
        >
        Write a message
        </button>)}
    </div>
    );
}

export default ListingDetailsPage;
