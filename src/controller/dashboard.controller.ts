import { Response } from "express";
import { getDashboard } from "../services/dashboard.service";
import { AuthenticatedRequest } from "../types/auth.types";
import { WebResponse } from "../types/response.type";
import { DashboardData } from "../types/dashboard.type";
import { Types, isValidObjectId } from "mongoose";

export const getDashboardHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user._id;

    if (!isValidObjectId(req.user._id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const data = await getDashboard(new Types.ObjectId(userId));

    const response: WebResponse<DashboardData> = {
      message: "Dashboard data fetched successfully",
      data,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
