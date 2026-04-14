import { useParams, useNavigate } from 'react-router';
import { useEffect, useState, useRef} from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSocket } from '../context/SocketContext.tsx';
import type { Chat, ChatMessage } from '../types/chat.ts';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatThread = () => {
    const [text, setText] = useState("");
    const { user } = useAuth();
    const socket = useSocket();
    const { chatId } = useParams();
    const [chat, setChat] = useState<Chat | null>(null);
    const navigate = useNavigate();
    const [sending, setSending] = useState(false);
    const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [typingName, setTypingName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (!chatId) return;

        fetch(`${API_URL}/chats/${chatId}`, { credentials: 'include' })
            .then(r =>  r.json())
            .then(data => setChat(data.data))
            .catch(() => {
                console.error('Failed to load chat. Please try again.');
                navigate('/connect');
            }) 
            .finally(() => setLoading(false));
            
        fetch(`${API_URL}/chats/${chatId}/read`, { method: 'PUT', credentials: 'include' });

    }, [chatId]);

    useEffect(() => {
        if (!socket || !chatId) return;

        socket.on("message:receive", ({ chatId: incomingChatId, message }: { chatId: string; message: ChatMessage }) => {
            if (incomingChatId !== chatId) return;
            setChat(prevChat => prevChat ? { ...prevChat, messages: [...prevChat.messages, message] } : prevChat);

        });

        socket.on("typing:started", ({ chatId: typingChatId, senderName }: { chatId: string; senderName: string }) => {
            if (typingChatId !== chatId) return;
            setIsTyping(true);
            setTypingName(senderName);
        });

        socket.on("typing:stopped", ({ chatId: stopTypingChatId }: { chatId: string }) => {
            if (stopTypingChatId !== chatId) return;
            setIsTyping(false);
            setTypingName("");
        });

        return () => {
            socket.off("message:receive");
            socket.off("typing:started");
            socket.off("typing:stopped");
        };
    }, [socket, chatId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages]);

    const getOtherParticipant = () => {
        return chat?.participantIds.find((p) => p._id !== user?._id);
    };

    const handleTyping = () => {
        if (!socket || !chatId) return;
        const other = getOtherParticipant();
        if (!other) return;
        
        socket.emit("typing:start", { chatId, recipientId: other._id, senderName: user?.firstName || "Someone" 
        });

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }
            typingTimeout.current = setTimeout(() => {
                socket.emit("typing:stop", { chatId, recipientId: other._id });
            }, 2000);       
        };

    const handleSendMessage = async () => {
        if (!text.trim() || !socket || !chatId || !chat || sending) return;
        const other = getOtherParticipant();
        if (!other) return;

        setSending(true);

        try {
             // 1. Persist via REST
                const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ content: text.trim() }),
                });
                const data = await res.json();
                const updatedChat: Chat = data.data;

            // 2. Update local state with saved message
                 setChat(updatedChat);

            // 3. Push the new message live via socket
                const newMessage = updatedChat.messages.at(-1);
                if (socket && newMessage) {
                    socket.emit('message:send', {
                        chatId,
                        recipientId: other._id,
                        message: newMessage,
                    });
            // Stop typing indicator
                socket.emit('typing:stop', { chatId, recipientId: other._id });
             }

                setText('');
        } finally {
            setSending(false);
        }
     };

   const other = getOtherParticipant();
  
   return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <button onClick={() => navigate('/connect')} className="text-gray-500 text-sm">←</button>
        {other && (
          <>
            <div className="w-9 h-9 rounded-full bg-villageRed text-white flex items-center justify-center font-bold text-sm">
              {other.firstName[0]}{other.lastName[0]}
            </div>
            <span className="font-semibold">{other.firstName} {other.lastName}</span>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
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

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 text-sm px-4 py-2 rounded-2xl rounded-bl-none italic">
              {typingName} is typing…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          value={text}
          onChange={e => { setText(e.target.value); handleTyping(); }}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          placeholder="Type a message…"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-villageRed"
          disabled={sending}
        />
        <button
          onClick={handleSendMessage}
          disabled={!text.trim() || sending}
          className="bg-villageRed text-white px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatThread;