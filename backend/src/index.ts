import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db";
import app from "./app";
import { setIO } from "./socket";

dotenv.config();

const PORT = process.env.PORT ?? 5000;


const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST"],
    },
});


setIO(io);

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});


const startServer = async (): Promise<void> => {
    await connectDB();
    httpServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();

export default app;