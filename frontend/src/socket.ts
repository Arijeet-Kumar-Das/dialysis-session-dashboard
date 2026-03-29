import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
    ?? import.meta.env.VITE_API_URL
    ?? "http://localhost:5000";

// Socket.io only works with a real WebSocket server (local dev).
// On Vercel (serverless), there's no persistent server for WebSockets.
const isLocal = SOCKET_URL.includes("localhost") || SOCKET_URL.includes("127.0.0.1");

export const socket = io(SOCKET_URL, {
    autoConnect: isLocal,
    reconnection: isLocal,
    reconnectionDelay: 1000,
    reconnectionAttempts: isLocal ? Infinity : 0,
});