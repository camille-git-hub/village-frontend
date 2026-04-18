import { use, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.tsx";
import { Link, useLocation } from "react-router";
import { ListingCard } from "../components/ListingCard.tsx";
import type { Listing, FormDataType } from "../types/listing.ts";
import { Settings, Plus, Home } from "lucide-react";
import { NEIGHBORHOODS } from "../utils/neightborhoods.ts";
import { HAMBURG_SERVICES } from "../utils/listing_services.ts";
import { OpenStreetMapProvider } from "leaflet-geosearch";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type TabType = "listings" | "new" | "account";

const Profile = () => {
  const context = use(AuthContext);
  const location= useLocation();
  const [activeTab, setActiveTab] = useState<TabType>((location.state?.tab as TabType) || "listings");
  
  // My Listings state
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state for New Listing
  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    category: '',
    description: '',
    neighborhood: '',
    city: 'hamburg',
    price: undefined,
    address: '',
    lat: null as number | null,
    lng: null as number | null,
  });
  const [addressSuggested, setAddressSuggested] = useState<any[]>([]);
  const [loadingForm, setLoadingForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<any>(null);

  if (!context) throw new Error("missing auth context");

  const { user, handleLogout, isLoggedin, isLoading, handleDeleteAccount } = context;

  if (!isLoading && !isLoggedin) {
    return <Link to={"/"} />;
  }

  // FETCH MY LISTINGS
  const fetchListings = async () => {
    if (!user?._id) return;
    setLoadingListings(true);
    try {
        const token = localStorage.getItem('accessToken');
        console.log('Token being sent:', token);
      const response = await fetch(`${API_URL}/listings/owner/${user._id}`, { 
        method: "GET", 
        credentials: "include" ,
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
    });
      if (!response.ok) throw new Error("Failed to fetch listings");
      const data = await response.json();
      setListings(data.data || data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoadingListings(false);
    }
  };

  // HANDLE DELETE LISTING
  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setDeletingId(listingId);
    try {
        const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/listings/${listingId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete listing");
      setListings(listings.filter((l) => l._id !== listingId));
    } catch (error) {
      console.error("Error deleting listing:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // HANDLE EDIT LISTING
  const handleEditListing = (listingId: string) => {
    window.location.href = `/listings/${listingId}/edit`;
  };

  // NEW LISTING FORM HANDLERS
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, price: value ? parseFloat(value) : undefined }));
};

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, address: value }));

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (value.length < 3) {
      setAddressSuggested([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const provider = new OpenStreetMapProvider();
        const results = await provider.search({ query: `${value}, Hamburg, Germany` });
        const hamburgResults = results.filter((r: any) => 
          r.label.toLowerCase().includes('hamburg') || 
          r.y < 53.7 && r.y > 53.4 && r.x < 10.5 && r.x > 9.8
        );        
        setAddressSuggested(hamburgResults.slice(0, 5)); 
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
        setAddressSuggested([]);
      }
    }, 500);

    setDebounceTimer(timer);
  };

  const handleAddressSelect = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      address: suggestion.label,
      lat: suggestion.y,
      lng: suggestion.x,
    }));
    setAddressSuggested([]);
  };

  const handleSubmitListing = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setLoadingForm(true);

    try {
        if (!formData.lat || !formData.lng) {
            throw new Error('Please select a valid address from the suggestions.');
        }

        const token = localStorage.getItem('accessToken');
        console.log('Token being sent:', token);

      const response = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          ...formData,
          lat: formData.lat || 53.5511, // Hamburg default
          lng: formData.lng || 10.2105  // Hamburg default
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create listing');
      }

      const newListing = await response.json();
      setListings([...listings, newListing.data || newListing]);
      
      // Reset form
      setFormData({
        title: '',
        category: '',
        description: '',
        neighborhood: '',
        city: 'hamburg',
        price: undefined,
        address: '',
        lat: null,
        lng: null,
      });
      setFormSuccess('Listing created successfully!');
      
      setTimeout(() => {
        setActiveTab("listings");
      }, 2000);
    } catch (error) {
      setFormError((error as Error).message || 'An error occurred');
    } finally {
      setLoadingForm(false);
    }
  };

  // Load listings when tab changes
  useEffect(() => {
    if (activeTab === "listings") {
      fetchListings();
    }
  }, [activeTab]);

  // Initial load of listings
  useEffect(() => {
    if (user?._id) {
      fetchListings();
    }
  }, [user?._id]);

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-villageRed text-white flex items-center justify-center font-bold text-lg">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            <div>
              <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <nav className="flex-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab("listings")}
            className={`w-full flex items-center gap-3 px-6 py-4 border-l-4 transition ${
              activeTab === "listings"
                ? "bg-white border-villageRed text-villageRed"
                : "border-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Home size={20} />
            <span className="font-medium">My Listings</span>
            {listings.length > 0 && (
              <span className="ml-auto text-gray-500 text-xs px-2 py-1 rounded-full">
                {listings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`w-full flex items-center gap-3 px-6 py-4 border-l-4 transition ${
              activeTab === "new"
                ? "bg-white border-villageRed text-villageRed"
                : "border-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Plus size={20} />
            <span className="font-medium">New Listing</span>
          </button>

          <button
            onClick={() => setActiveTab("account")}
            className={`w-full flex items-center gap-3 px-6 py-4 border-l-4 transition ${
              activeTab === "account"
                ? "bg-white border-villageRed text-villageRed"
                : "border-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Settings size={20} />
            <span className="font-medium">My Account</span>
          </button>
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full bg-villageRed text-white py-2 rounded-lg font-medium hover:bg-villagePink hover:text-black transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* MY LISTINGS TAB */}
          {activeTab === "listings" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Listings</h2>
              {loadingListings ? (
                <p>Loading...</p>
              ) : listings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You have no listings yet.</p>
                  <button
                    onClick={() => setActiveTab("new")}
                    className="bg-villageRed text-white px-6 py-2 rounded-lg font-medium hover:bg-villagePink hover:text-black transition"
                  >
                    Create Your First Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ml-6 w-3/4">
                  {listings.map((listing) => (
                    <div key={listing._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <ListingCard listing={listing} showActions={true} />
                      <div className="p-2 ml-2 border-t border-gray-200 flex gap-4 ">
                        <button
                          onClick={() => handleEditListing(listing._id)}
                          className="flex-1 bg-gray-200 text-black py-2 rounded font-medium hover:bg-villagePink transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteListing(listing._id)}
                          disabled={deletingId === listing._id}
                          className="flex-1 text-villageRed py-2 rounded font-medium hover:border hover:border-color-villageRed transition disabled:opacity-50"
                        >
                          {deletingId === listing._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NEW LISTING TAB */}
          {activeTab === "new" && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">Create a New Listing</h2>
              
              {formError && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                  {formError}
                </div>
              )}
              
              {formSuccess && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleSubmitListing} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Listing Title"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-villageRed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-villageRed"
                    >
                      <option value="">Select category</option>
                      {HAMBURG_SERVICES.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Neighborhood</label>
                    <select
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-villageRed"
                    >
                      <option value="">Select neighborhood</option>
                      {NEIGHBORHOODS.map(hood => (
                        <option key={hood} value={hood}>{hood}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-2">Price per hour (optional)</label>
                    <input
                      name="price"
                      type="number"
                      id="price"
                      value={formData.price || ''}
                      onChange={handlePriceChange}
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-villageRed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleAddressChange}
                    placeholder="Enter address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-villageRed"
                  />
                  {addressSuggested.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {addressSuggested.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddressSelect(suggestion)}
                          className="block w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your listing..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-villageRed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingForm}
                  className="w-full bg-villageRed text-white py-2 rounded-lg font-medium hover:bg-villagePink hover:text-black transition disabled:opacity-50"
                >
                  {loadingForm ? 'Creating...' : 'Create Listing'}
                </button>
              </form>
            </div>
          )}

          {/* MY ACCOUNT TAB */}
          {activeTab === "account" && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">My Account</h2>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">First Name</label>
                      <p className="text-lg">{user?.firstName}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Last Name</label>
                      <p className="text-lg">{user?.lastName}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <p className="text-lg">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Listings</p>
                      <p className="text-3xl font-bold text-villageRed">{listings.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold mb-4 text-red-700">Danger Zone</h3>
                  <p className="text-sm text-gray-600 mb-4">Deleting your account will remove all your information and cannot be undone.</p>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;