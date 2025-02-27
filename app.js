import express from "express";
import userRouter from "./Routes/user.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();
app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use("/api/v1/user/",userRouter)

export default app;