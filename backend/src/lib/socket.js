import { Server } from "socket.io";
import http from "http";
import express from "express";


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    }
});
export function getReceiverSocketId(userId) {
    return userSocketMap[userId]; // Return the socket id of the receiver from the map
}
const userSocketMap = {}; // This will store the socket ids of users who are online {userID:socketID}
io.on("connection", (socket) => {
    console.log("A New user connected",socket.id);
    const userId = socket.handshake.query.userId; // Get the userId from the query parameters

    if(userId){
        userSocketMap[userId] = socket.id; // Store the socket id in the map
        console.log("User ID:", userId);
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit the online users to all connected clients
    socket.on("disconnect", () => {
        console.log("A user disconnected",socket.id);
        delete userSocketMap[userId]; // Remove the socket id from the map when the user disconnects
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit the updated online users to all connected clients
    });
});
export { io,app, server };