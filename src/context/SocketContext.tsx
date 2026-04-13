import { createContext, use, useContext, useEffect, useState} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./AuthContext.tsx";
import type { User } from "../types/auth.ts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider =({ children }: { children: React.ReactNode }) => {
    const { isLoggedin, user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!isLoggedin || !user)
        return; 

        const newSocket = io(API_URL, {
            withCredentials: true,
        });

        newSocket.on("connect", () => {
            console.log("Connected to Socket.IO server");
            newSocket.emit("user: register", user._id);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            console.log("Disconnected from Socket.IO server");
        };
    }, [isLoggedin, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
export const useSocket = () => useContext(SocketContext);