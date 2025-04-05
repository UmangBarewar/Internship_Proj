import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser"; // Import cookie-parser middleware
import cors from "cors"; // to allow cross-origin requests


dotenv.config();
const app = express();
const PORT = process.env.PORT;
console.log("Server running on PORT:", PORT);
// app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
})); // Enable CORS

// Increase the JSON body limit to 10mb (or a size that fits your needs)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.listen(PORT, () => {
  console.log("Server is running on PORT: " + PORT);
  connectDB();
});
// app.timeout = 300000;