import type { Listing } from '../types/listing';

type Props = {
  listing: Listing;
  onClick?: () => void;
  onDelete?: (listingId: string) => void;
  onEdit?: (listingId: string) => void;
  showActions?: boolean;
  detailsButton?: boolean;
  savedButton?: boolean;
  onSave?: (listingId: string) => void;
  isSaved?: boolean; 
};

export const ListingCard = ({ listing, onClick, onSave, onDelete, onEdit, showActions, detailsButton, savedButton, isSaved }: Props) => (
  <div
    className="w-full overflow-none border rounded-lg p-4 shadow-sm"
  >
    <div className="flex items-center justify-between">
    <h2 className="text-xl font-bold mb-1">{listing.title}</h2>
    <p className="text-xs text-gray-500 mr-2 italic">Posted on {new Date(listing.createdAt).toLocaleDateString()}</p>
    </div>
    <span className="text-xs bg-villagePink text-villageRed px-2 py-1 rounded-full mb-2 inline-block">
      {listing.category}
    </span>
    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{listing.description}</p>
    <p className="text-xs text-gray-400 mt-2">📍 {listing.neighborhood}</p>
    <p className="text-sm text-gray-800 mt-2 ml-1 font-semibold">{listing.price ? `${listing.price.toFixed(2)} €/hour` : ''}</p>

    {showActions && (
      <div className="mt-4 flex gap-2">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(listing._id);
            }}
            className="btn px-3 py-1 text-sm hover:bg-villageDarkBlue transition-colors"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(listing._id);
            }}
            className="btn bg-villageRed text-white px-3 py-1 text-sm hover:bg-villageDarkRed transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    )}
    {detailsButton && (
        <button onClick={onClick} className="btn p-4 mt-4 cursor-pointer">Show details</button>
    )}
    {savedButton && (
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onSave?.(listing._id);
        }}
        className={`btn border p-4 mt-4 ml-2 cursor-pointer ${
        isSaved 
        ? 'bg-emerald-500 text-white' 
        : 'bg-gray-100 text-gray-700 hover:bg-villagePink hover:text-black'
      }`}
      >
      {isSaved ? 'Saved' : 'Save for later'}
      </button>
      )}


  </div>
);

