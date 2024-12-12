import express from "express";
import { getTasksHandler } from "../../controller/task.controller";
import { AuthenticatedRequest } from "../../types/auth.types";

const router = express.Router();

router.get("/", async (req: AuthenticatedRequest, res: Response) =>
  getTasksHandler(req, res)
);

export { router as taskRoutes };
