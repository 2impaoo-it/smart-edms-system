import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [notifications, setNotifications] = useState([]);

    // Simulation Config
    const NOTIFICATION_TYPES = [
        { title: "New Assignment", msg: "You have been assigned to review 'Budget_2026.pdf'", type: "info" },
        { title: "Document Signed", msg: "Manager Mike signed 'Contract_v2.pdf'", type: "success" },
        { title: "Urgent: Approval Needed", msg: "Server Procurement Request needs approval", type: "warning" },
        { title: "System Update", msg: "Maintenance scheduled for tonight at 2 AM", type: "info" },
        { title: "Upload Successful", msg: "Your file 'Report.docx' has been processed", type: "success" }
    ];

    useEffect(() => {
        // Simulate Connection
        const timer = setTimeout(() => {
            console.log("Socket: Connected");
            setIsConnected(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isConnected || !user) return;

        // Simulate Incoming Messages (Random interval 10s - 30s)
        const interval = setInterval(() => {
            // 30% chance to receive a message
            if (Math.random() > 0.7) {
                const randomMsg = NOTIFICATION_TYPES[Math.floor(Math.random() * NOTIFICATION_TYPES.length)];

                // Add timestamp
                const message = {
                    id: Date.now(),
                    ...randomMsg,
                    timestamp: new Date().toLocaleTimeString(),
                    read: false
                };

                console.log("Socket: Received Event", message);
                setLastMessage(message);
                setNotifications(prev => [message, ...prev].slice(0, 10)); // Keep last 10
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [isConnected, user]);

    const emit = (event, data) => {
        console.log(`Socket: Emitting [${event}]`, data);
        // In a real app, this would send data to server
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <SocketContext.Provider value={{ isConnected, lastMessage, notifications, markAllAsRead, emit }}>
            {children}
        </SocketContext.Provider>
    );
};
