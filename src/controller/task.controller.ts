import { Response } from "express";
import { getTasks } from "../services/task.service";
import { AuthenticatedRequest } from "../types/auth.types";
import { PaginatedResponse, PaginationQuery } from "../types/pagination.type";
import { TaskResult } from "../types/task.type";

export const getTasksHandler = async (
  req: AuthenticatedRequest & { query: PaginationQuery },
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user._id;

    const result = await getTasks(userId, req.query);

    const response: PaginatedResponse<TaskResult> = {
      message: "Tasks data fetched successfully",
      data: result.tasks,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
