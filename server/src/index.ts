import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { env } from "@/config/env";
import routes from "@/routes";
import { notFoundHandler, errorHandler } from "@/middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

// Basic rate limiting on auth routes to slow down brute-force attempts.
app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false })
);

// Serve uploaded files (documents, avatars) statically.
app.use("/uploads", express.static(path.resolve(env.uploadDir)));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`StudyBridge backend running on http://localhost:${env.port}`);
});
