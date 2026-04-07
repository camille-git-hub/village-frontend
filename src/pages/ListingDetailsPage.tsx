import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import type { Listing } from '../types/listing.ts';

const ListingDetailsPage = () => {
    const params = useParams();
    console.log('Route params:', params);
    const { _id } = useParams<{ _id: string }>();
    const [listing, setListing] = useState<Listing | null>(null);

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

    return (
    <div className="p-4 w-1/2 ml-40 mr-auto">
      <h1 className="text-villageRed text-2xl font-bold mb-4 mt-10">Listing Details</h1>
        <div>
            <form className="w-full flex flex-col gap-4 mb-10 mt-5">
                <label className="flex items-center gap-2">
                <input name="title"
                    type="text"
                    value={'Title: ' + (listing?.title || "")}
                    readOnly
                    className="px-4 py-2 border border-gray-700 rounded grow"
                />
                </label>
                <label className="flex items-center gap-2">
                <input name="category"
                    type="text"
                    value={'Service offered: ' + (listing?.category || "") }
                    readOnly
                    className="px-4 py-2 border border-gray-700 rounded grow"
                />
                </label>
                <label className="flex items-center gap-2">
                <textarea name="description"
                    value={listing?.description || ""}
                    readOnly
                    className="px-4 py-2 border border-gray-700 rounded grow h-32"
                />
                </label>
                <label className="flex items-center gap-2">
                <input name="neighborhood"
                    type="text"
                    value={listing?.neighborhood || ""}
                    readOnly
                    className="px-4 py-2 rounded grow"
                />
                </label>    
            </form>
        </div>
    </div>
    );
}

export default ListingDetailsPage;
