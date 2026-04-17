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
    className="w-full border rounded-lg p-4 shadow-sm mb-4"
  >
    <div className="flex items-center justify-between">
    <h2 className="text-xl font-bold mb-1">{listing.title}</h2>
    <p className="text-sm text-gray-500 mr-2 italic">Posted on {new Date(listing.createdAt).toLocaleDateString()}</p>
    </div>
    <span className="text-xs bg-villagePink text-villageRed px-2 py-1 rounded-full mb-2 inline-block">
      {listing.category}
    </span>
    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{listing.description}</p>
    <p className="text-xs text-gray-400 mt-2">📍 {listing.neighborhood}</p>

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
        ? 'bg-villageRed text-white border-villageRed' 
        : 'border-villageRed text-villageRed hover:bg-villageRed hover:text-white'
      }`}
      >
      {isSaved ? 'Saved' : 'Save for later'}
      </button>
      )}


  </div>
);

