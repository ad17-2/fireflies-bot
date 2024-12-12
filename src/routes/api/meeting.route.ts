import express from "express";
import {
  createMeetingHandler,
  getMeetingHandler,
  getMeetingSentimentHandler,
  getMeetingsHandler,
  getMeetingStatsHandler,
  summarizeMeetingHandler,
  updateTranscriptHandler,
} from "../../controller/meeting.controller.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { AuthenticatedRequest } from "../../types/auth.types.js";
import { PaginatedResponse } from "../../types/pagination.type.js";
import {
  createMeetingSchema,
  updateTranscriptSchema,
} from "../../validations/meeting.validation.js";

export const router = express.Router();

// GET all meetings for user
router.get(
  "/",
  async (req: AuthenticatedRequest, res: PaginatedResponse<any>) =>
    getMeetingsHandler(req, res)
);

// GET meeting stats for user
router.get("/stats", async (req: AuthenticatedRequest, res: Response) =>
  getMeetingStatsHandler(req, res)
);

// GET a specific meeting by ID
router.get("/:id", async (req: AuthenticatedRequest, res: Response) =>
  getMeetingHandler(req, res)
);

router.get("/:id/sentiment", async (req: AuthenticatedRequest, res: Response) =>
  getMeetingSentimentHandler(req, res)
);

// POST a new meeting
router.post(
  "/",
  validateRequest(createMeetingSchema),
  async (req: AuthenticatedRequest, res: Response) =>
    createMeetingHandler(req, res)
);

// PUT update a meeting's transcript
router.put(
  "/:id/transcript",
  validateRequest(updateTranscriptSchema),
  async (req: AuthenticatedRequest, res: Response) =>
    updateTranscriptHandler(req, res)
);

// POST generate summary for a meeting
router.post(
  "/:id/summarize",
  async (req: AuthenticatedRequest, res: Response) =>
    summarizeMeetingHandler(req, res)
);

export { router as meetingRoutes };
