import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { HAMBURG_NEIGHBORHOODS } from '../utils/neightborhoods.ts';
import { OpenStreetMapProvider } from 'leaflet-geosearch';


export const CreateListingPage = () => {
  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    category: '',
    description: '',
    neighborhood: '',
    ownerId: '',
    address: '',
    lat: null as number | null,
    lng: null as number | null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addressSuggested, setAddressSuggested] = useState<any[]>([]);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const debounceTimer = useRef<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    setFormData(prev => ({ ...prev, address: value }));

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.length < 3) {
      setAddressSuggested([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {

      try {
        const url = `${API_URL}/listings/search-address?query=${value}`;
        console.log('Fetching address suggestions from:', url);

        const response = await fetch(url);
        console.log('Address suggestions status:', response.status);


        const provider = new OpenStreetMapProvider();
        const results = await provider.search({ query: value});
        const hamburgResults = results.filter((r: any) => r.label.includes('Hamburg'));
        setAddressSuggested(hamburgResults);
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
      } 
    }, 500);
  }

  const handleAddressSelect = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      address: suggestion.label,
      lat: suggestion.y,
      lng: suggestion.x,
    }));
    setAddressSuggested([]);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.lat === null || formData.lng === null) {
      setError('Please select a valid address from the suggestions.');
      setLoading(false);
      return;
    }

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
      const newListingId = newListing.data._id || newListing._id;
      navigate(`/listings/${newListingId}`);
    } catch (err) {
      setError('An error occurred while creating the listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-1/2 ml-40 mr-auto">
      <button onClick={() => navigate('/listings')} className="btn text-black bg-villagePink hover:bg-villageRed hover:text-white mb-2">
        Back to Listings
      </button>
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

        <label className="flex items-center gap-2">
          <input
            name="address"
            type="text"
            value={formData.address}
            onChange={handleAdressChange}
            className="px-4 py-2 border border-gray-700 rounded grow"
            placeholder="Enter address for geocoding..."
            required
          />
        </label>
        {addressSuggested.length > 0 && (
          <div className="border rounded p-2 bg-white absolute z-10 w-full">
            {addressSuggested.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleAddressSelect(suggestion)}
                className="p-2 cursor-pointer hover:bg-gray-200"
              >
                {suggestion.label}
              </div>
            ))}
          </div>
        )}

        {formData.lat !== null && formData.lng !== null && (
          <p className="text-sm text-gray-500">
            Selected Location: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
          </p>
        )}

        <button type="submit" disabled={loading} className="px-4 py-2 bg-villageRed text-white font-bold grow rounded cursor-pointer">
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
};

export default CreateListingPage;

