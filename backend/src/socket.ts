import { Server } from "socket.io";

/**
 * Shared Socket.io instance.
 * - Set by index.ts (local dev) when creating the HTTP + Socket server.
 * - Remains null on Vercel (serverless) — services use optional chaining (io?.emit).
 */
let io: Server | null = null;

export function setIO(instance: Server) {
    io = instance;
}

export function getIO(): Server | null {
    return io;
}
