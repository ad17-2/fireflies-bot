import express, { Express } from "express";
import { apiLimiter } from "../middlewares/rate-limiter.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { meetingRoutes } from "../routes/api/meeting.route.js";
import { dashboardRoutes } from "../routes/api/dashboard.route.js";
import { taskRoutes } from "../routes/api/task.route.js";
import { authRoutes } from "../routes/api/auth.route.js";
import { swaggerSetup } from "./swagger.config.js";

export const configureApp = (): Express => {
  const app = express();

  // Size limit for requests
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Middleware
  app.use(express.json());
  app.use("/api/", apiLimiter);

  // Base route
  app.get("/", (req, res) => {
    res.json({ message: "Welcome to the MeetingBot API" });
  });

  // Health check
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // API routes
  app.use("/api/meetings", authMiddleware, meetingRoutes);
  app.use("/api/tasks", authMiddleware, taskRoutes);
  app.use("/api/dashboard", authMiddleware, dashboardRoutes);
  app.use("/api/auth", authRoutes);

  swaggerSetup(app);

  return app;
};

// Environment configuration
export const PORT = process.env.PORT || 3000;
