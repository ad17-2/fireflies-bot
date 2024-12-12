import express from "express";
import { getDashboardHandler } from "../../controller/dashboard.controller";
import { AuthenticatedRequest } from "../../types/auth.types";

const router = express.Router();

router.get("/", async (req: AuthenticatedRequest, res: Response) =>
  getDashboardHandler(req, res)
);

export { router as dashboardRoutes };
