import { Response } from "express";
import { Types } from "mongoose";
import * as meetingService from "../../services/meeting.service";
import { AuthenticatedRequest } from "../../types/auth.types";
import { PaginationQuery } from "../../types/pagination.type";
import {
  getMeetingsHandler,
  getMeetingHandler,
  getMeetingStatsHandler,
  getMeetingSentimentHandler,
  createMeetingHandler,
  updateTranscriptHandler,
  summarizeMeetingHandler,
} from "../../controller/meeting.controller";

jest.mock("../../services/meeting.service");

describe("Meeting Controller", () => {
  let mockRequest: Partial<AuthenticatedRequest & { query: PaginationQuery }>;
  let mockResponse: Partial<Response>;
  const mockUserId = "60f7b3b3d9f6b3e7f8e4f3b3";
  const mockMeetingId = "60f7b3b3d9f6b3e7f8e4f3b3";

  beforeEach(() => {
    mockRequest = {
      user: {
        _id: mockUserId,
        email: "test@example.com",
      },
      query: {
        page: "1",
        limit: "10",
      },
      params: { id: mockMeetingId.toString() },
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("getMeetingsHandler", () => {
    it("should return meetings when user is authenticated", async () => {
      const mockMeetings = [
        {
          _id: mockMeetingId.toString(),
          title: "Test Meeting",
          date: new Date(),
          duration: 60,
          participants: ["John"],
          summary: "",
        },
      ];

      (meetingService.getMeetings as jest.Mock).mockResolvedValue({
        meetings: mockMeetings,
        total: 1,
        page: 1,
        limit: 10,
      } as never);

      await getMeetingsHandler(
        mockRequest as AuthenticatedRequest & { query: PaginationQuery },
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Meetings data fetched successfully",
        data: mockMeetings,
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it("should return 401 when user is not authenticated", async () => {
      mockRequest.user = undefined;

      await getMeetingsHandler(
        mockRequest as AuthenticatedRequest & { query: PaginationQuery },
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe("getMeetingHandler", () => {
    it("should return meeting when found", async () => {
      const mockMeeting = {
        _id: mockMeetingId.toString(),
        title: "Test Meeting",
      };

      (meetingService.getMeeting as jest.Mock).mockResolvedValue(
        mockMeeting as never
      );

      await getMeetingHandler(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Meeting data fetched successfully",
        data: mockMeeting,
      });
    });

    it("should return 404 when meeting not found", async () => {
      (meetingService.getMeeting as jest.Mock).mockResolvedValue(null as never);

      await getMeetingHandler(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getMeetingStatsHandler", () => {
    it("should return meeting statistics", async () => {
      const mockStats = {
        generalStats: { totalMeetings: 10 },
        topParticipants: [],
        meetingsByDayOfWeek: [],
      };

      (meetingService.getMeetingStats as jest.Mock).mockResolvedValue(
        mockStats as never
      );

      await getMeetingStatsHandler(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Meeting statistics fetched successfully",
        data: mockStats,
      });
    });
  });

  describe("getMeetingSentimentHandler", () => {
    it("should return sentiment analysis", async () => {
      const mockSentiment = { sentiment: "positive", score: 0.8 };

      (meetingService.getMeetingSentiment as jest.Mock).mockResolvedValue(
        mockSentiment as never
      );

      await getMeetingSentimentHandler(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Meeting sentiment analyzed successfully",
        data: mockSentiment,
      });
    });

    it("should return 404 when sentiment analysis fails", async () => {
      (meetingService.getMeetingSentiment as jest.Mock).mockResolvedValue(
        null as never
      );

      await getMeetingSentimentHandler(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe("createMeetingHandler", () => {
    it("should create meeting successfully", async () => {
      const meetingData = {
        title: "New Meeting",
        date: new Date(),
        duration: 60,
        participants: ["John"],
      };

      mockRequest.body = meetingData;

      const mockCreatedMeeting = {
        ...meetingData,
        _id: mockMeetingId.toString(),
      };

      (meetingService.createMeeting as jest.Mock).mockResolvedValue(
        mockCreatedMeeting as never
      );

      await createMeetingHandler(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Meeting created successfully",
        data: mockCreatedMeeting,
      });
    });
  });

  describe("updateTranscriptHandler", () => {
    it("should update transcript successfully", async () => {
      const transcriptData = {
        transcript: "Test transcript",
        summary: "Test summary",
        actionItems: ["Action 1"],
      };

      mockRequest.body = transcriptData;

      const mockUpdatedMeeting = {
        _id: mockMeetingId.toString(),
        ...transcriptData,
      };

      (meetingService.updateTranscript as jest.Mock).mockResolvedValue(
        mockUpdatedMeeting as never
      );

      await updateTranscriptHandler(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Transcript updated successfully",
        data: mockUpdatedMeeting,
      });
    });
  });

  describe("summarizeMeetingHandler", () => {
    it("should summarize meeting successfully", async () => {
      const mockSummary = {
        meeting: { _id: mockMeetingId.toString() },
        tasks: [],
      };

      (meetingService.summarizeMeeting as jest.Mock).mockResolvedValue(
        mockSummary as never
      );

      await summarizeMeetingHandler(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Meeting summarized and tasks created successfully",
        data: mockSummary,
      });
    });

    it("should handle already summarized error", async () => {
      const error = new Error("Meeting has already been summarized");
      (meetingService.summarizeMeeting as jest.Mock).mockRejectedValue(
        error as never
      );

      await summarizeMeetingHandler(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should handle missing transcript error", async () => {
      const error = new Error("Meeting transcript is required");
      (meetingService.summarizeMeeting as jest.Mock).mockRejectedValue(
        error as never
      );

      await summarizeMeetingHandler(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});
