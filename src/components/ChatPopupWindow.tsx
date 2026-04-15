import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useChatPopup } from "../context/ChatPopupContext.tsx";
import type { Chat, ChatMessage } from "../types/chat.ts";
import { X, Minus } from "lucide-react";
import { useSocket } from "../context/SocketContext.tsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const ChatPopupWindow = () => {
    const { popup, closeChat, toggleMinimize } = useChatPopup();
    const { user, token } = useAuth();
    const [text, setText] = useState("");
    const [chat, setChat] = useState<Chat | null>(null);
    const socket = useSocket();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typingName, setTypingName] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const chatId = popup.chatId;

    useEffect(() => {
        if (!chatId || !popup.isOpen) return;

        const fetchChat = async () => {
          try {
          setLoading(true);
          const response = await fetch(`${API_URL}/chats/${chatId}`, { 
            credentials: "include",
            headers: { Authorization: `Bearer ${token || ''}` 
        }
        });

          if (!response.ok) {
            throw new Error('Failed to fetch chat');
          }

          const data = await response.json();
          setChat(data.data);

        } catch (error) {
          console.error('Error fetching chat:', error);
          closeChat();
        } finally {
          setLoading(false);
        }
      };

        fetchChat();

        return () => {
            setChat(null);
            setText("");
        };
    }, [chatId, popup.isOpen, token, closeChat]);

    useEffect(() => {
        if (!popup.isOpen || !chatId || !token) return;

        const markasRead = async () => {
          try { 
            const response = await fetch(`${API_URL}/chats/${chatId}/read`, { 
              method: "PUT", 
              credentials: "include", 
              headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
              throw new Error('Failed to mark messages as read');
            }
          } catch (error) {
            console.error('Error marking messages as read:', error);
          }
        };
        markasRead();
    }, [chatId, popup.isOpen, token]);

    useEffect(() => {
        if (!socket || !chatId) return;
        
        socket.on("message:receive", ({ chatId: incomingChatId, message }: { chatId: string; message: ChatMessage }) => {
            if (incomingChatId !== chatId) return;
            setChat((prevChat) => (prevChat ? { ...prevChat, messages: [...prevChat.messages, message] } : prevChat));
        });

        socket.on("typing:start", ({ chatId: typingChatId, senderName }: { chatId: string; senderName: string }) => {
            if (typingChatId !== chatId) return;
            setIsTyping(true);
            setTypingName(senderName);
        });
        
        socket.on("typing:stop", ({ chatId: stopTypingChatId }: { chatId: string }) => {
            if (stopTypingChatId !== chatId) return;
            setIsTyping(false);
            setTypingName("");
        });

        return () => {
            socket.off("message:receive");
            socket.off("typing:start");
            socket.off("typing:stop");
        };
    }, [socket, chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages, isTyping]);

    const getOtherParticipant = () => {
        return chat?.participantIds.find((p) => p._id !== user?._id);
    };

    const handleTyping = () => {
        if (!socket || !chatId) return;
        const other = getOtherParticipant();
        if (!other) return;

        socket.emit("typing:start", { chatId, senderName: user?.firstName || "Someone" });

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
            socket.emit("typing:stop", { chatId, recipientId: other._id });
        }, 2000);
    };

    const handleSend = async(e?: React.SubmitEvent<HTMLFormElement>) => {
        if (e) {
            e.preventDefault();
        }
        if (!text.trim() || !chatId || !socket || !chat || sending) return;
        const other = getOtherParticipant();
        if (!other) return;

        setSending(true);

        try {
            const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content: text.trim() }),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            const updatedChat = data.data;
            setChat(updatedChat);

            const newMessage = updatedChat.messages.at(-1);
            if (socket && newMessage) {
                socket.emit("message:send", { chatId, message: newMessage, recipientId: other._id });
            }

            setText("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    if (!popup.isOpen || !chatId) return null;

    const other = getOtherParticipant();

    return (
        <div className="fixed bottom-0 right-4 w-96 bg-white shadow-2xl rounded-t-lg flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 border-b bg-villageRed text-white rounded-t-lg">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {other && (
            <>
              <div className="w-8 h-8 rounded-full bg-white text-villageRed flex items-center justify-center font-bold text-sm flex-shrink-0">
                {other.firstName[0]}{other.lastName[0]}
              </div>
              <span className="font-semibold truncate">{other.firstName} {other.lastName}</span>
            </>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={toggleMinimize}
            className="hover:bg-villagePink rounded p-1 transition"
            title={popup.isMinimized ? "Expand" : "Minimize"}
          >
            <Minus size={18} />
          </button>
          <button
            onClick={closeChat}
            className="hover:bg-villagePink rounded p-1 transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages - Hidden when minimized */}
      {!popup.isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-96 max-h-96">
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : (
              <>
                {chat?.messages.map(msg => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      msg.senderId === user?._id
                        ? 'bg-villageRed text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-500 text-sm px-4 py-2 rounded-2xl rounded-bl-none italic">
                      {typingName} is typing…
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(e); }} className="p-4 border-t flex gap-2">
            <input
              value={text}
              onChange={e => { setText(e.target.value); handleTyping(); }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message…"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-villageRed"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="bg-villageRed text-white px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </>
      )}

      {/* Minimized state */}
      {popup.isMinimized && (
        <div className="p-4 text-center text-gray-600 text-sm bg-gray-50 cursor-pointer hover:bg-gray-100"
          onClick={toggleMinimize}>
          Click to expand
        </div>
      )}
    </div>
  );
};

export default ChatPopupWindow;