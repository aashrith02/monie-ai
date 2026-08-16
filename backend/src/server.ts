import express from "express";
import authRoutes from "./routes/auth.routes.js";
import "dotenv/config";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Monies-AI backend is running",
  });
});

app.use("/api/auth", authRoutes);

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});