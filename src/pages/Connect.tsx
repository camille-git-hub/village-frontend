import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useChatPopup } from "../context/ChatPopupContext.tsx";
import type { Chat, ChatParticipant } from "../types/chat.ts";
import type { Listing } from "../types/listing.ts";
import { MessageCircle, Users, Heart } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const AUTH_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:4000";

type TabType = "inbox" | "connections" | "saved";

const Connect = () => {
  const { user } = useAuth();
  const { openChat } = useChatPopup();
  const [activeTab, setActiveTab] = useState<TabType>("inbox");
  
  // Inbox state
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Connections state
  const [connections, setConnections] = useState<ChatParticipant[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Saved Listings state
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // FETCH CHATS
  const fetchChats = async () => {
    setLoadingChats(true);
    try {
        const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/chats`, { 
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
     });
      const data = await response.json();
      setChats(data.data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  // FETCH CONNECTIONS (unique participants from all chats)
  const fetchConnections = async () => {
    setLoadingConnections(true);
    try {
        const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/chats`, { 
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });
      const data = await response.json();
      const chats = data.data || [];

      // Extract unique participants
      const participantsMap = new Map();
      chats.forEach((chat: Chat) => {
        chat.participantIds.forEach((participant: ChatParticipant) => {
          if (participant._id !== user?._id) {
            participantsMap.set(participant._id, participant);
          }
        });
      });

      setConnections(Array.from(participantsMap.values()));
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  };

  // FETCH SAVED LISTINGS (placeholder - adjust based on your backend)
  const fetchSavedListings = async () => {
    if (!user?._id) return;
    setLoadingSaved(true);
    try {
        const token = localStorage.getItem('accessToken');
        console.log('Token being sent:', token);
      const response = await fetch(`${AUTH_URL}/users/${user._id}/saved`, { 
        method: "GET", 
        credentials: "include" ,
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
    });
      if (!response.ok) throw new Error("Failed to fetch saved listings");
      const data = await response.json();
      setSavedListings(data.data || data);
    } catch (error) {
      console.error("Error fetching saved listings:", error);
    } finally {
      setLoadingSaved(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "inbox") {
      fetchChats();
    } else if (activeTab === "connections") {
      fetchConnections();
    } else if (activeTab === "saved") {
      fetchSavedListings();
    }
  }, [activeTab]);

  // HANDLE DELETE CHAT
  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) {
      return;
    }
    setDeletingId(chatId);
    try {
        const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/chats/${chatId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete');
      setChats(prev => prev.filter(chat => chat._id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setDeletingId(null);
    }
  };

  // HANDLE START CHAT WITH CONNECTION
  const handleStartChat = (connection: ChatParticipant) => {
    // Find existing chat or create new one
    const existingChat = chats.find(chat =>
      chat.participantIds.some(p => p._id === connection._id)
    );

    if (existingChat) {
      openChat(existingChat._id);
    } else {
      // Create new chat
      fetch(`${API_URL}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ participantId: connection._id })
      })
        .then(r => r.json())
        .then(data => openChat(data.data._id))
        .catch(err => console.error('Error creating chat:', err));
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participantIds.find((p) => p._id !== user?._id);
  };

  const getLastMessage = (chat: Chat) => {
    return chat.messages[chat.messages.length - 1];
  };

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-villageRed">Connect</h1>
          <p className="text-sm text-gray-500">Manage your network</p>
        </div>

        {/* TABS */}
        <nav className="flex-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`w-full flex items-center gap-3 px-6 py-4 border-l-4 transition ${
              activeTab === "inbox"
                ? "bg-white border-villageRed text-villageRed"
                : "border-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            <MessageCircle size={20} />
            <span className="font-medium">Inbox</span>
            {chats.length > 0 && (
              <span className="ml-auto bg-villageRed text-white text-xs px-2 py-1 rounded-full">
                {chats.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("connections")}
            className={`w-full flex items-center gap-3 px-6 py-4 border-l-4 transition ${
              activeTab === "connections"
                ? "bg-white border-villageRed text-villageRed"
                : "border-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users size={20} />
            <span className="font-medium">Connections</span>
            {connections.length > 0 && (
              <span className="ml-auto bg-villageRed text-white text-xs px-2 py-1 rounded-full">
                {connections.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`w-full flex items-center gap-3 px-6 py-4 border-l-4 transition ${
              activeTab === "saved"
                ? "bg-white border-villageRed text-villageRed"
                : "border-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart size={20} />
            <span className="font-medium">Saved Listings</span>
            {savedListings.length > 0 && (
              <span className="ml-auto bg-villageRed text-white text-xs px-2 py-1 rounded-full">
                {savedListings.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* INBOX TAB */}
          {activeTab === "inbox" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Messages</h2>
              {loadingChats ? (
                <p>Loading...</p>
              ) : chats.length === 0 ? (
                <p className="text-gray-500">No conversations yet.</p>
              ) : (
                <div className="space-y-3">
                  {chats.map((chat) => {
                    const other = getOtherParticipant(chat);
                    const last = getLastMessage(chat);
                    const isUnread = chat.messages.filter(
                      m => !m.read && m.senderId !== user?._id
                    ).length;

                    return (
                      <div
                        key={chat._id}
                        onClick={() => openChat(chat._id)}
                        className="p-4 bg-white border rounded-lg cursor-pointer hover:shadow-md transition w-1/2"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-villageRed text-white flex items-center justify-center font-bold text-sm">
                              {other?.firstName[0]}{other?.lastName[0]}
                            </div>
                            <div>
                              <p className="font-semibold">{other?.firstName} {other?.lastName}</p>
                              <p className="text-sm text-gray-600">
                                {last?.content.slice(0, 50)}{last && last.content.length > 50 ? '...' : ''}
                              </p>
                            </div>
                          </div>
                          {isUnread > 0 && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              {isUnread}
                            </span>
                          )}
                        <button
                          onClick={(e) => handleDeleteChat(chat._id, e)}
                          disabled={deletingId === chat._id}
                          className="mt-4 mr-4 text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
                        >
                          {deletingId === chat._id ? 'Deleting...' : 'Delete'}
                        </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CONNECTIONS TAB */}
          {activeTab === "connections" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Connections</h2>
              {loadingConnections ? (
                <p>Loading...</p>
              ) : connections.length === 0 ? (
                <p className="text-gray-500">No connections yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {connections.map((connection) => (
                    <div
                      key={connection._id}
                      className="p-4 bg-white border rounded-lg"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-villageRed text-white flex items-center justify-center font-bold text-lg">
                          {connection.firstName[0]}{connection.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{connection.firstName} {connection.lastName}</p>
                          <p className="text-sm text-gray-500">{connection.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartChat(connection)}
                        className="w-full bg-villageRed text-white py-2 rounded-lg font-medium hover:bg-villagePink hover:text-black transition"
                      >
                        Message
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SAVED LISTINGS TAB */}
          {activeTab === "saved" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Saved Listings</h2>
              {loadingSaved ? (
                <p>Loading...</p>
              ) : savedListings.length === 0 ? (
                <p className="text-gray-500">No saved listings yet. Start saving listings you like!</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {savedListings.map((listing) => (
                    <div
                      key={listing._id}
                      className="p-4 bg-white border rounded-lg hover:shadow-md transition"
                    >
                      <h3 className="font-semibold mb-2">{listing.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{listing.description?.slice(0, 100)}</p>
                      <p className="text-sm font-medium text-villageRed">{listing.category}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Connect;