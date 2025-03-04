import app from "./app.js";
import connectDb from "./db/index.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { initializeSocket } from "./socket/index.js";

dotenv.config({ path: "./.env" });

const server = createServer(app);
initializeSocket(server);

const PORT = process.env.PORT || 5000;

connectDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
