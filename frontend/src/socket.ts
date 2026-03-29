import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const isLocal = SOCKET_URL.includes("localhost");

export const socket = io(SOCKET_URL, {
    autoConnect: isLocal,
    reconnection: isLocal,
    reconnectionDelay: 1000,
    reconnectionAttempts: isLocal ? Infinity : 0,
});