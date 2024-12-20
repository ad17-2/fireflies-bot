import { Response } from "express";
import {
  createMeeting,
  getMeeting,
  getMeetings,
  getMeetingSentiment,
  getMeetingStats,
  summarizeMeeting,
  updateTranscript,
} from "../services/meeting.service";
import { AuthenticatedRequest } from "../types/auth.types";
import { PaginatedResponse, PaginationQuery } from "../types/pagination.type";
import { WebResponse } from "../types/response.type";
import {
  CreateMeeting,
  MeetingResult,
  MeetingSummarize,
  UpdateMeetingTranscript,
} from "../types/meeting.type";
import { MeetingStats } from "../types/meeting-stats.type";
import { isValidObjectId } from "mongoose";
import { Types } from "mongoose";

export const getMeetingsHandler = async (
  req: AuthenticatedRequest & { query: PaginationQuery },
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const result = await getMeetings(new Types.ObjectId(userId), req.query);

    const response: PaginatedResponse<MeetingResult> = {
      message: "Meetings data fetched successfully",
      data: result.meetings,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const getMeetingStatsHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const stats = await getMeetingStats(new Types.ObjectId(userId));

    const response: WebResponse<MeetingStats> = {
      message: "Meeting statistics fetched successfully",
      data: stats,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching meeting statistics:", error);
    res.status(500).json({
      message: "Failed to fetch meeting statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getMeetingHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user._id;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid meeting ID" });
  }

  try {
    const meeting = await getMeeting(
      new Types.ObjectId(userId),
      new Types.ObjectId(req.params.id)
    );

    const response: WebResponse<MeetingResult> = {
      message: "Meeting data fetched successfully",
      data: meeting,
    };

    if (meeting) {
      res.json(response);
    } else {
      res.status(404).json({ message: "Meeting not found" });
    }
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const getMeetingSentimentHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid meeting ID" });
    }

    const sentiment = await getMeetingSentiment(
      new Types.ObjectId(userId),
      new Types.ObjectId(id)
    );

    if (!sentiment) {
      return res.status(404).json({
        message: "Unable to analyze sentiment, due to missing meeting data",
      });
    }

    const response: WebResponse<{}> = {
      message: "Meeting sentiment analyzed successfully",
      data: sentiment,
    };

    res.json(response);
  } catch (error) {
    console.error("Error analyzing meeting sentiment:", error);
    res.status(500).json({
      message: "Failed to analyze sentiment",
    });
  }
};

export const createMeetingHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id;

    const meetingData: CreateMeeting = {
      title: req.body.title,
      date: req.body.date,
      duration: req.body.duration,
      participants: req.body.participants,
    };

    const meeting = await createMeeting(
      new Types.ObjectId(userId),
      meetingData
    );

    const response: WebResponse<MeetingResult> = {
      message: "Meeting created successfully",
      data: meeting,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const updateTranscriptHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid meeting ID" });
    }

    const transcriptData: UpdateMeetingTranscript = {
      transcript: req.body.transcript,
      summary: req.body.summary,
      actionItems: req.body.actionItems,
    };

    const meeting = await updateTranscript(
      new Types.ObjectId(userId),
      new Types.ObjectId(id),
      transcriptData
    );

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const response: WebResponse<MeetingResult> = {
      message: "Transcript updated successfully",
      data: meeting,
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating transcript:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const summarizeMeetingHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid meeting ID" });
    }

    const result = await summarizeMeeting(
      new Types.ObjectId(userId),
      new Types.ObjectId(id)
    );

    if (!result) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const response: WebResponse<MeetingSummarize> = {
      message: "Meeting summarized and tasks created successfully",
      data: result,
    };

    res.json(response);
  } catch (error) {
    console.error("Error summarizing meeting:", error);

    if (
      error instanceof Error &&
      error.message.includes("already been summarized")
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (
      error instanceof Error &&
      error.message.includes("transcript is required")
    ) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
