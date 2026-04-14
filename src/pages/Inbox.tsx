import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import type { Chat } from "../types/chat.ts";
import { useChatPopup } from "../context/ChatPopupContext.tsx";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Inbox = () => {
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const { openChat } = useChatPopup();
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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

    const handleDelete = async (chatId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
            return;
        }
        setDeletingId(chatId);
        try {
            const response = await fetch(`${API_URL}/chats/${chatId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to delete chat');
            }
            setChats(prev => prev.filter(chat => chat._id !== chatId));
        } catch (error) {
            console.error('Could not delete chat. Please try again.', error);
        } finally {
            setDeletingId(null);
        }       
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-villageRed">Inbox</h1>

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
                            <div key={chat._id} onClick={() => openChat(chat._id)} className="p-4 border rounded cursor-pointer hover:bg-pink-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{other?.firstName} {other?.lastName}</p>
                                        <p className="text-sm text-gray-600">{last?.content.slice(0, 50)}{last && last.content.length > 50 ? '...' : ''}</p>
                                        <p className="text-xs text-gray-500">{isUnread > 0 ? `${isUnread} unread` : 'All read'}</p>
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            openChat(chat._id);
                                        }} className="text-sm text-blue-400 hover:text-blue-300 mt-1">
                                            View Conversation
                                        </button>
                                        <button onClick={(e) => handleDelete(chat._id, e)} disabled={deletingId === chat._id} className="m-4 text-sm text-villageRed hover:text-gray-500">
                                            {deletingId === chat._id ? 'Deleting...' : 'Delete Conversation'}
                                        </button> 

                                    </div>
                                </div>
                            </div>
                        );
                    }))
            }
        </div>
    );
}

export default Inbox;