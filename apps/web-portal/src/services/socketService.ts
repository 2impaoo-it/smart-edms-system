import { io, Socket } from "socket.io-client";

/**
 * Quản lý kết nối Real-time với Socket.IO (Server Node.js)
 */

let socket: Socket | null = null;
const BACKEND_URL = "https://vincent-electrosynthetic-lisa.ngrok-free.dev";

export const initSocket = (userId: number | string) => {
  if (socket) return socket;
  
  socket = io(BACKEND_URL, {
    auth: { userId },
    transports: ['websocket'], // Bỏ polling, dùng thẳng websocket để tránh lỗi qua ngrok
    extraHeaders: {
      "ngrok-skip-browser-warning": "true" // Bypass cảnh báo của ngrok chặn polling
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });
  
  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
