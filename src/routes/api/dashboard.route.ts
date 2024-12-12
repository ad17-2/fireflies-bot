import express from "express";
import { getDashboardHandler } from "../../controller/dashboard.controller";
import { AuthenticatedRequest } from "../../types/auth.types";

const router = express.Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     description: Retrieve the dashboard data, including total meetings, task summary, upcoming meetings, and overdue tasks.
 *     operationId: getDashboard
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalMeetings:
 *                   type: integer
 *                   description: The total number of meetings.
 *                   example: 5
 *                 taskSummary:
 *                   type: object
 *                   properties:
 *                     pending:
 *                       type: integer
 *                       description: Number of pending tasks.
 *                       example: 2
 *                     inProgress:
 *                       type: integer
 *                       description: Number of tasks in progress.
 *                       example: 1
 *                     completed:
 *                       type: integer
 *                       description: Number of completed tasks.
 *                       example: 3
 *                 upcomingMeetings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the meeting.
 *                         example: "507f1f77bcf86cd799439011"
 *                       title:
 *                         type: string
 *                         description: The title of the upcoming meeting.
 *                         example: "Meeting 1"
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         description: The date of the upcoming meeting.
 *                         example: "2024-12-12T10:00:00Z"
 *                       participantCount:
 *                         type: integer
 *                         description: Number of participants in the upcoming meeting.
 *                         example: 3
 *                 overdueTasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the overdue task.
 *                         example: "507f1f77bcf86cd799439011"
 *                       title:
 *                         type: string
 *                         description: The title of the overdue task.
 *                         example: "Task 1"
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                         description: The due date of the overdue task.
 *                         example: "2024-12-01T12:00:00Z"
 *                       meetingId:
 *                         type: string
 *                         description: The ID of the associated meeting.
 *                         example: "507f1f77bcf86cd799439011"
 *                       meetingTitle:
 *                         type: string
 *                         description: The title of the associated meeting.
 *                         example: "Meeting 1"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *       500:
 *         description: Internal Server Error
 *     securitySchemes:
 *       BearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */
router.get("/", async (req: AuthenticatedRequest, res: Response) =>
  getDashboardHandler(req, res)
);

export { router as dashboardRoutes };
