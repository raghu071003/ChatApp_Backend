import express from "express";
import userRouter from "./Routes/user.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();
app.use(
    cors({
      origin: "http://localhost:5173", // Replace with your frontend URL
      credentials: true, // Allow credentials (cookies, auth headers)
      methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
      allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    })
  );
app.use(cookieParser())
app.use(express.json())
app.use("/api/v1/user/",userRouter)



export default app;