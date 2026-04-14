import { createContext, useContext, useState, type ReactNode } from "react";

export type ChatPopupState = {
    chatId: string | null;
    isOpen: boolean;
    isMinimized: boolean;
};

export type ChatPopupContextType = {
    popup: ChatPopupState; 
    openChat: (chatId: string) => void;
    closeChat: () => void;
    toggleMinimize: () => void;
};

export const ChatPopupContext = createContext<ChatPopupContextType | null>(null);

export const ChatPopupProvider = ({ children }: { children: ReactNode }) => {
    const [popup, setPopup] = useState<ChatPopupState>({
        chatId: null,
        isOpen: false,
        isMinimized: false,
    });

    const openChat = (chatId: string) => {
        setPopup({ chatId, isOpen: true, isMinimized: false });
    };

    const closeChat = () => {
        setPopup({ chatId: null, isOpen: false, isMinimized: false });
    };

    const toggleMinimize = () => {
        setPopup(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
    };

    return (
        <ChatPopupContext.Provider value={{ popup, openChat, closeChat, toggleMinimize }}>
            {children}
        </ChatPopupContext.Provider>
    );
};

export const useChatPopup = () => {
    const context = useContext(ChatPopupContext);
    if (!context) {
        throw new Error("useChatPopup must be used within a ChatPopupProvider");
    }
    return context;
};