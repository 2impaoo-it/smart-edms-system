import { io, Socket } from "socket.io-client";
import { gooeyToast as toast } from "goey-toast";

/**
 * Quản lý kết nối Real-time với Socket.IO (Server Node.js)
 */

let socket: Socket | null = null;

export const initSocket = (userId: number | string) => {
  if (!userId) return null;
  if (socket) return socket;
  
  try {
    socket = io("/", {
      auth: { userId },
      path: "/socket.io",
      transports: ["websocket", "polling"]
    });
    
    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Lắng nghe thông báo từ hệ thống
    socket.on("NOTIFICATION", (data: any) => {
      console.log("New Notification received:", data);
      
      const title = data.title || "Thông báo";
      const message = typeof data === 'string' ? data : data.message;
      const type = data.type || "info";

      if (type === "success") {
        toast.success(message, { title });
      } else if (type === "error") {
        toast.error(message, { title });
      } else {
        toast.info(message, { title });
      }
    });

    return socket;
  } catch (error) {
    console.error("Socket initialization error:", error);
    return null;
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.off("NOTIFICATION");
    socket.disconnect();
    socket = null;
  }
};
