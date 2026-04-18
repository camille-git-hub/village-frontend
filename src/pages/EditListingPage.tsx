// src/pages/Listings/EditListingPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { HAMBURG_NEIGHBORHOODS } from '../utils/neightborhoods.ts';
import { HAMBURG_SERVICES } from '../utils/listing_services.ts';
import type { FormDataType } from '../types/listing.ts';

export const EditListingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    category: '',
    description: '',
    neighborhood: '',
    address: '',
    price: undefined,
    city: 'hamburg',
    lat: null,
    lng: null,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch existing listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        if (!id) {
          throw new Error('No listing ID provided');
        }

        const response = await fetch(`${API_URL}/listings/${id}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch listing');
        }

        const data = await response.json();
        const listing = data.data || data;

        setFormData({
          title: listing.title || '',
          category: listing.category || '',
          description: listing.description || '',
          neighborhood: listing.neighborhood || '',
          city: listing.city || 'hamburg',
          price: listing.price || undefined,
          address: listing.address || '', 
          lat: listing.lat || null,
          lng: listing.lng || null,
        });
      } catch (err) {
        setError('Failed to load listing. Please try again.');
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchListing();
  }, [id, API_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, price: value ? parseFloat(value) : undefined }));
};

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!id) {
        throw new Error('No listing ID provided');
      }
      const token = localStorage.getItem('accessToken');
      console.log('Token being sent: ', token);

      const response = await fetch(`${API_URL}/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update listing');
      }

      navigate('/profile');
    } catch (err) {
      setError((err as Error).message || 'An error occurred while updating the listing');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-4 w-1/2 ml-40 mr-auto">
        <p>Loading listing...</p>
      </div>
    );
  }

  return (
    <div className="p-4 w-1/2 ml-40 mr-auto">
      <button onClick={() => window.history.back()} className="btn text-black bg-villagePink hover:bg-villageRed hover:text-white mb-2">
        Back
      </button>
      <h1 className="text-2xl font-bold mb-4 mt-10">Edit Listing</h1>
      
      {error && <div className="error">{error}</div>}

      <form className="w-full flex flex-col gap-4 mb-10 mt-5" onSubmit={handleSubmit}>
        <label className="flex items-center gap-2">
          <input
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="px-4 py-2 border border-gray-700 rounded grow"
            placeholder="Listing Title"
            required
          />
        </label>

        <label className="flex items-center gap-2">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="px-4 py-2 border border-gray-700 rounded grow"
            required
          >
            <option value="">Select Category</option>
            {(HAMBURG_SERVICES).map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-700 rounded overflow-scroll"
            placeholder="Describe what you're offering or need help with..."
            required
          />
        </label>

        <label className="flex items-center gap-2">
          <select
            name="neighborhood"
            value={formData.neighborhood}
            onChange={handleChange}
            className="px-4 py-2 border border-gray-700 rounded grow"
            required
          >
            <option value="">Select Neighborhood</option>
            {Object.keys(HAMBURG_NEIGHBORHOODS).map(hood => (
              <option key={hood} value={hood}>{hood}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            className="px-4 py-2 border border-gray-700 rounded grow"
            placeholder="Address"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            name="price"
            type="number"
            value={formData.price || ''}
            onChange={handlePriceChange}
            className="px-4 py-2 border border-gray-700 rounded grow"
            placeholder="Price per hour (optional)"
          />
        </label>

        <button type="submit" disabled={loading} className="px-4 py-2 bg-villageRed text-white font-bold grow rounded cursor-pointer">
          {loading ? 'Updating...' : 'Update Listing'}
        </button>
      </form>
    </div>
  );
};

export default EditListingPage;