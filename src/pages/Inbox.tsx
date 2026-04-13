import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.tsx";
import type { Chat } from "../types/chat.ts";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Inbox = () => {
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    fetch(`${API_URL}/chats`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setChats(data.data || []))
      .finally(() => setLoading(false));
  }, []);

    const getOtherParticipant = (chat: Chat) => {
        return chat.participantIds.find((p) => p._id !== user?._id);
    };

    const getLastMessage = (chat: Chat) => {
        return chat.messages[chat.messages.length - 1];
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Inbox</h1>

            {loading ? (
                <p>Loading...</p>
            ) : chats.length === 0 ? (
                <p>No conversations yet.</p>
            ) : (
                chats.map((chat) => {
                        const other = getOtherParticipant(chat);
                        const last = getLastMessage(chat);
                        const isUnread = chat.messages.filter(m => !m.read && m.senderId !== user?._id).length;

                        return (
                            <div key={chat._id} onClick={() => navigate(`/connect/chat/${chat._id}`)} className="p-4 border rounded cursor-pointer hover:bg-gray-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{other?.firstName} {other?.lastName}</p>
                                        <p className="text-sm text-gray-600">{last?.content.slice(0, 50)}{last && last.content.length > 50 ? '...' : ''}</p>
                                    </div>
                                    {isUnread > 0 && (
                                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                            {isUnread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    }))
            }
        </div>
    );
}

export default Inbox;