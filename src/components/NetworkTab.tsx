import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChatPopup } from "../context/ChatPopupContext";
import { UserX, MessageCircle, Users, Loader } from "lucide-react";
import * as networkService from "../services/networkService";
import type { NetworkUser } from "../types/network.ts";

export const NetworkTab = () => {
  const { user, token } = useAuth();
  const { openChat } = useChatPopup();
  const [connections, setConnections] = useState<NetworkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchNetwork = async () => {
    if (!user?._id || !token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await networkService.getNetwork(token);
      setConnections(data.connections || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load network');
      console.error('Error fetching network:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConnection = async (userId: string) => {
    if (!token) return;
    
    if (!confirm('Are you sure you want to remove this connection?')) {
      return;
    }

    try {
      setRemovingId(userId);
      await networkService.removeConnection(userId, token);
      setConnections(prev => prev.filter(connection => connection._id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove connection');
      console.error('Error removing connection:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleStartChat = (userId: string) => {
    openChat(userId);
  };

  useEffect(() => {
    fetchNetwork();
  }, [user?._id, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={32} className="animate-spin text-villageRed" />
        <p className="ml-4 text-gray-600">Loading network...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Error: {error}</p>
        <button
          onClick={fetchNetwork}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">My Connections</p>
        <p className="text-3xl font-bold text-villageRed">{connections.length}</p>
      </div>

      {/* My Network */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users size={20} />
          My Network ({connections.length})
        </h3>

        {connections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">You haven't connected with anyone yet</p>
            <p className="text-sm text-gray-400">Send connection requests to start building your network</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((connection) => (
              <div
                key={connection._id}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition flex flex-col"
              >
                <div className="flex-1 mb-4">
                  <p className="font-semibold text-lg">
                    {connection.firstName} {connection.lastName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{connection.email}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartChat(connection._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-villageRed text-white hover:bg-villagePink hover:text-black transition"
                    title="Message"
                  >
                    <MessageCircle size={18} />
                    <span className="text-sm">Message</span>
                  </button>
                  <button
                    onClick={() => handleRemoveConnection(connection._id)}
                    disabled={removingId === connection._id}
                    className="px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition disabled:opacity-50"
                    title="Remove from network"
                  >
                    {removingId === connection._id ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      <UserX size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkTab;