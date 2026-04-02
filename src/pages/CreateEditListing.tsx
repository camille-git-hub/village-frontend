// src/pages/Listings/CreateListingPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { HAMBURG_NEIGHBORHOODS } from '../utils/neightborhoods.ts';

export const CreateListingPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    neighborhood: '',
    city: 'hamburg'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create listing');
      }

      const newListing = await response.json();
      navigate(`/listing/${newListing._id}`);
    } catch (err) {
      setError('An error occurred while creating the listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-1/2 ml-40 mr-auto">
      <h1 className="text-2xl font-bold mb-4 mt-10">Create a New Listing</h1>
      
      {error && <div className="error">{error}</div>}

      <form className="w-full flex flex-col gap-4 mb-10 mt-5"onSubmit={handleSubmit}>
        <label className="flex items-center gap-2">
          <input
            name="title"
            type="text"
            onChange={handleChange}
            className="px-4 py-2 border border-gray-700 rounded grow"
            placeholder="Listing Title"
            required
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            name="category"
            type="text"
            onChange={handleChange}
            className="px-4 py-2 border border-gray-700 rounded grow"
            placeholder="Category (e.g., Cleaning, Tutoring)"
            required
          />
        </label>

        <label className="flex items-center gap-2">
          <textarea
            name="description"
            onChange={handleChange}
            className="px-4 py-2 border border-gray-700 rounded grow"
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

        <button type="submit" disabled={loading} className="px-4 py-2 bg-villageRed text-white font-bold grow rounded cursor-pointer">
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
};

export default CreateListingPage;

