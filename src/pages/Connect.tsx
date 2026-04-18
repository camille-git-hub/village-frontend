import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useChatPopup } from "../context/ChatPopupContext.tsx";
import type { Chat, ChatParticipant } from "../types/chat.ts";
import type { Listing } from "../types/listing.ts";
import { MessageCircle, Users, Heart, UserPlus, UserCheck, UserX, Loader } from "lucide-react";
import { ListingCard } from "../components/ListingCard.tsx";
import type { NetworkUser, ConnectionRequest } from "../types/network.ts";
import * as networkService from "../services/networkService.ts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const AUTH_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:4000";

type TabType = "inbox" | "connections" | "saved" | "network";

const Connect = () => {
  const { user, token } = useAuth();
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

  // Network state
  const [networkConnections, setNetworkConnections] = useState<NetworkUser[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [loadingNetwork, setLoadingNetwork] = useState(false);
  const [errorNetwork, setErrorNetwork] = useState<string | null>(null);
  const [showRequests, setShowRequests] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const getConnectionStatus = (userId: string): 'connected' | 'sent' | 'received' | 'none' => {
    // Check if already connected
    if (networkConnections.some(conn => conn._id === userId)) {
      return 'connected';
    }
    
    // Check if request already sent
    if (sentRequests.some(req => req._id === userId)) {
      return 'sent';
    }
    
    // Check if received request pending
    if (receivedRequests.some(req => req._id === userId)) {
      return 'received';
    }
    
    return 'none';
  };

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
        
      const idsResponse = await fetch(`${AUTH_URL}/users/${user._id}/saved`, { 
        method: "GET", 
        credentials: "include" ,
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
    });
      if (!idsResponse.ok) throw new Error("Failed to fetch saved listings");
      const idsData = await idsResponse.json();
      const listingIds = idsData.data || [];

      console.log('Fetched saved listing IDs:', listingIds);

      if (listingIds.length > 0) {
        const listingsResponse = await fetch(`${API_URL}/listings`, {
          method: "GET",
          headers: { 'Authorization': `Bearer ${token || ''}` },
        });
        if (!listingsResponse.ok) throw new Error("Failed to fetch listings");
        const listingsData = await listingsResponse.json();
        const allListings = listingsData.data || [];

        const savedListings = allListings.filter((listing: any) => listingIds.includes(listing._id)
    );
        setSavedListings(savedListings);
        
      }else {
        setSavedListings([]);
        }
      
    } catch (error) {
      console.error("Error fetching saved listings:", error);
      setSavedListings([]);
    } finally {
      setLoadingSaved(false);
    }
  };

  // FETCH NETWORK DATA
  const fetchNetworkData = async () => {
    if (!token) return;
    setLoadingNetwork(true);
    setErrorNetwork(null);
    try {
      const [networkData, requestsData] = await Promise.all([
        networkService.getNetwork(token),
        networkService.getConnectionRequests(token)
      ]);

      setNetworkConnections(networkData.connections || []);
      setReceivedRequests(requestsData.received || []);
      setSentRequests(requestsData.sent || []);
    } catch (error) {
      setErrorNetwork(error instanceof Error ? error.message : 'Failed to load network');
      console.error('Error fetching network:', error);
    } finally {
      setLoadingNetwork(false);
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
    } else if (activeTab === "network") {
      fetchNetworkData(); // Assuming network tab shows connections for now
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

  // HANDLE ACCEPT CONNECTION REQUEST
  const handleAcceptRequest = async (fromUserId: string) => {
    if (!token) return;
    try {
        setProcessingId(fromUserId);
      await networkService.acceptConnectionRequest(fromUserId, token);
      setReceivedRequests(prev => prev.filter(req => req._id !== fromUserId));

      await fetchNetworkData();

    } catch (error) {
      console.error('Error accepting connection request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // HANDLE DECLINE CONNECTION REQUEST
  const handleDeclineRequest = async (fromUserId: string) => {
    if (!token) return;
    try {
        setProcessingId(fromUserId);
      await networkService.declineConnectionRequest(fromUserId, token);
      setReceivedRequests(prev => prev.filter(req => req._id !== fromUserId));
    } catch (error) {
        setErrorNetwork(error instanceof Error ? error.message : 'Failed to decline connection request');
      console.error('Error declining connection request:', error);
    } finally {
      setProcessingId(null);
    }
    };

   // HANDLE REMOVE CONNECTION
   const handleRemoveConnection = async (userId: string) => {
    if (!token) return;
    
    if (!confirm('Are you sure you want to remove this connection?')) {
      return;
    }
    
    try {
        setRemovingId(userId);
      await networkService.removeConnection(userId, token);
      setNetworkConnections(prev => prev.filter(connection => connection._id !== userId));
    } catch (error) {
        setErrorNetwork(error instanceof Error ? error.message : 'Failed to remove connection');
      console.error('Error removing connection:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participantIds.find((p) => p._id !== user?._id);
  };

  const getLastMessage = (chat: Chat) => {
    return chat.messages[chat.messages.length - 1];
  };

    // HANDLE SEND CONNECTION REQUEST
  const handleSendConnectionRequest = async (targetUserId: string) => {
    if (!token) return;
    try {
      setProcessingId(targetUserId);
      await networkService.sendConnectionRequest(targetUserId, token);
      // Show success message or refetch network data
      await fetchNetworkData();
    } catch (error) {
      setErrorNetwork(error instanceof Error ? error.message : 'Failed to send connection request');
      console.error('Error sending connection request:', error);
    } finally {
      setProcessingId(null);
    }
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
              <span className="ml-auto text-gray-500 text-xs px-2 py-1 rounded-full">
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
              <span className="ml-auto text-gray-500 text-xs px-2 py-1 rounded-full">
                {connections.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("network")}
            className={`w-full flex items-center gap-3 px-6 py-4 border-l-4 transition ${
              activeTab === "network"
                ? "bg-white border-villageRed text-villageRed"
                : "border-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            <UserPlus size={20} />
            <span className="font-medium">My Network</span>
            {(networkConnections.length + receivedRequests.length) > 0 && (
              <span className="ml-auto text-gray-500 text-xs px-2 py-1 rounded-full">
                {networkConnections.length + receivedRequests.length}
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
              <span className="ml-auto text-gray-500 text-xs px-2 py-1 rounded-full">
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
                                {last?.content}
                              </p>
                            </div>
                          </div>
                          {isUnread > 0 && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              {isUnread}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleDeleteChat(chat._id, e)}
                          disabled={deletingId === chat._id}
                          className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
                        >
                          {deletingId === chat._id ? 'Deleting...' : 'Delete'}
                        </button>
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
                <>
            <span className="mb-4">Here's the list of people you've chatted with. Click on *Add to add them to your network.</span>

                <div className="sm:w-full md:w-full lg:w-2/3 grid grid-cols-2 gap-4 mt-4">                   
                  {connections.map((connection) => {
                    const status = getConnectionStatus(connection._id);
                    
                    return (
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartChat(connection)}
                            className="flex-1 bg-villagePink text-black py-2 rounded-lg font-medium hover:bg-gray-200 hover:text-black transition"
                          >
                            Message
                          </button>
                          
                          {status === 'connected' ? (
                            <button
                              disabled
                              className="w-full flex-1 bg-emerald-500 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 cursor-default"
                            >
                              <UserCheck size={16} />
                              Connected
                            </button>
                          ) : status === 'sent' ? (
                            <button
                              disabled
                              className="flex-1 bg-yellow-200 text-gray-700 py-2 rounded-lg font-medium flex items-center justify-center gap-2 cursor-default"
                            >
                              <Loader size={16} />
                              Sent
                            </button>
                          ) : status === 'received' ? (
                            <button
                                onClick={() => handleAcceptRequest(connection._id)}
                                disabled={processingId === connection._id}
                              className="flex-1 bg-villagePink text-black py-2 rounded-lg font-medium hover:bg-gray-200 hover:text-black transition"
                            > {processingId === connection._id ? (
                                <Loader size={16} className="animate-spin" />
                              ) : ( 
                              <UserCheck size={16} />)}
                              Accept
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendConnectionRequest(connection._id)}
                              disabled={processingId === connection._id}
                              className="flex-1 bg-villageRed text-white py-2 rounded-lg font-medium hover:bg-villagePink hover:text-black disabled:opacity-50 flex items-center justify-center gap-2 transition"
                            >
                              {processingId === connection._id ? (
                                <Loader size={16} className="animate-spin" />
                              ) : (
                                <UserPlus size={16} />
                              )}
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                </>
              )}
            </div>
          )}

          {/* NETWORK TAB */}
          {activeTab === "network" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">My Network</h2>

              {errorNetwork && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  <p>Error: {errorNetwork}</p>
                  <button
                    onClick={fetchNetworkData}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {loadingNetwork ? (
                <div className="flex items-center justify-center py-12">
                  <Loader size={32} className="text-villageRed animate-spin" />
                  <p className="text-gray-600 ml-4">Loading...</p>
                </div>
              ) : (
                <>
                  {/* Network Stats */}
                  <span className="font-semibold mb-2">Profile Stats:</span>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">My Connections</p>
                      <p className="text-3xl font-bold text-villageRed">{networkConnections.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Received Requests</p>
                      <p className="text-3xl font-bold text-villageRed">{receivedRequests.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Sent Requests</p>
                      <p className="text-3xl font-bold text-villageRed">{sentRequests.length}</p>
                    </div>
                  </div>
                  
                  {/* Connection Requests Section */}
                  {(receivedRequests.length > 0 || sentRequests.length > 0) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <button
                        onClick={() => setShowRequests(!showRequests)}  
                        className="w-full text-left font-medium text-villageRed hover:text-villagePink transition flex items-center gap-2"
                      >
                        {showRequests ? "Hide" : "Show"} Connection Requests ({receivedRequests.length} received, {sentRequests.length} sent)
                      </button>

                      {showRequests && (
                        <div className="mt-4 space-y-4">
                          {receivedRequests.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold mb-2">Received Requests</h4>
                              <div className="space-y-2">
                                {receivedRequests.map(req => (
                                  <div key={req._id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                    <div>
                                      <p className="font-medium">{req.firstName} {req.lastName}</p>
                                      <p className="text-sm text-gray-500">{req.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleAcceptRequest(req._id)}
                                        disabled={processingId === req._id}
                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                                      >
                                        {processingId === req._id ? <Loader size={14} className="animate-spin" /> : <UserCheck size={14} />}
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => handleDeclineRequest(req._id)}
                                        disabled={processingId === req._id}
                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                                      >
                                        {processingId === req._id ? <Loader size={14} className="animate-spin" /> : <UserX size={14} />}
                                        Decline
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {sentRequests.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Sent Requests</h4>
                              <div className="space-y-2">
                                {sentRequests.map(req => (
                                  <div key={req._id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                    <div>
                                      <p className="font-medium">{req.firstName} {req.lastName}</p>
                                      <p className="text-xs text-gray-500">{req.email}</p>
                                    </div>
                                    <span className="px-3 text-xs text-yellow-500 font-medium">Pending</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* My Connections */}
                  <div>
                    <h3 className="font-semibold mb-4">Currently in your network:  ({networkConnections.length})</h3>
                    {networkConnections.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-sm">You haven't connected with anyone yet.</p>
                        <p className="text-xs text-gray-400">Send connection requests to start building your network.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {networkConnections.map((connection) => (
                          <div
                            key={connection._id}
                            className="p-4 bg-white border rounded-lg"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-full bg-villageRed text-white flex items-center justify-center font-bold text-lg">
                                {connection.firstName[0]}{connection.lastName[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold">{connection.firstName} {connection.lastName}</p>
                                <p className="text-sm text-gray-500 truncate">{connection.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStartChat(connection)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-villageRed text-white rounded-lg font-medium hover:bg-villagePink hover:text-black transition text-sm"
                              >
                                <MessageCircle size={16} />
                                Message
                              </button>
                              <button  
                                onClick={() => handleRemoveConnection(connection._id)}
                                disabled={removingId === connection._id}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                              >
                                {removingId === connection._id ? <Loader size={16} className="animate-spin" /> : <UserX size={16} />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
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
                <p className="text-gray-500">No saved listings yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedListings.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} detailsButton={true} savedButton={false} onClick={() => window.location.href = `/listings/${listing._id}`} />
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