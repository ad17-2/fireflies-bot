import { jest } from "@jest/globals";
import { Types } from "mongoose";
import { Task } from "../models/task.model";
import { Meeting } from "../models/meeting.model";
import { cacheService } from "../services/cache.service";
import {
  analyzeMeetingEmotion,
  generateMeetingSummary,
} from "../services/ai.service";
import { createTasksFromActionItems } from "../services/task.service";
import {
  getMeetings,
  getMeeting,
  getMeetingSentiment,
  getMeetingStats,
  createMeeting,
  updateTranscript,
  summarizeMeeting,
} from "../services/meeting.service";

jest.mock("../models/meeting.model", () => ({
  Meeting: {
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

jest.mock("../models/task.model", () => ({
  Task: {
    find: jest.fn(),
  },
}));

jest.mock("../services/cache.service", () => ({
  cacheService: {
    getOrSet: jest.fn(),
  },
}));

jest.mock("../services/ai.service", () => ({
  analyzeMeetingEmotion: jest.fn(),
  generateMeetingSummary: jest.fn(),
}));

jest.mock("../services/task.service", () => ({
  createTasksFromActionItems: jest.fn(),
}));

describe("Meeting Service", () => {
  const mockUserId = new Types.ObjectId();
  const mockMeetingId = new Types.ObjectId();
  const mockDate = new Date();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getMeetings", () => {
    it("should return paginated meetings", async () => {
      const mockMeetings = [
        {
          _id: mockMeetingId,
          title: "Test Meeting",
          date: mockDate,
          duration: 60,
          participants: ["John"],
          summary: "Test Summary",
        },
      ];

      const mockFindChain = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockMeetings as never),
      };

      (Meeting.find as jest.Mock).mockReturnValue(mockFindChain);
      (Meeting.countDocuments as jest.Mock).mockResolvedValue(1 as never);

      const result = await getMeetings(mockUserId, { page: "1", limit: "10" });

      expect(result.meetings[0].title).toBe("Test Meeting");
      expect(result.total).toBe(1);
    });
  });

  describe("getMeeting", () => {
    it("should return meeting with tasks", async () => {
      const mockMeeting = {
        _id: mockMeetingId,
        title: "Test Meeting",
        date: mockDate,
        duration: 60,
        participants: ["John"],
        summary: "Summary",
      };

      const mockTasks = [
        {
          _id: new Types.ObjectId(),
          title: "Task 1",
          description: "Description",
          status: "pending",
          dueDate: mockDate,
        },
      ];

      const mockFindOneLean = jest.fn().mockResolvedValue(mockMeeting as never);
      (Meeting.findOne as jest.Mock).mockReturnValue({ lean: mockFindOneLean });

      const mockFindLean = jest.fn().mockResolvedValue(mockTasks as never);
      (Task.find as jest.Mock).mockReturnValue({ lean: mockFindLean });

      const result = await getMeeting(mockUserId, mockMeetingId);

      expect(result._id).toBe(mockMeetingId.toString());
      expect(result.tasks).toBeDefined();
    });
  });

  describe("getMeetingSentiment", () => {
    it("should return sentiment analysis", async () => {
      const mockSentiment = { sentiment: "positive", score: 0.8 };
      const mockExec = jest
        .fn()
        .mockResolvedValue({ _id: mockMeetingId } as never);
      (Meeting.findOne as jest.Mock).mockReturnValue({ exec: mockExec });
      (analyzeMeetingEmotion as jest.Mock).mockResolvedValue(
        mockSentiment as never
      );

      const result = await getMeetingSentiment(mockUserId, mockMeetingId);

      expect(result).toEqual(mockSentiment);
    });
  });

  describe("getMeetingStats", () => {
    it("should return meeting statistics", async () => {
      const mockStats = {
        generalStats: {
          totalMeetings: 10,
          averageParticipants: 4,
        },
        topParticipants: [],
        meetingsByDayOfWeek: [],
      };

      (cacheService.getOrSet as jest.Mock).mockResolvedValue(
        mockStats as never
      );

      const result = await getMeetingStats(mockUserId);

      expect(result.generalStats.totalMeetings).toBe(10);
    });
  });

  describe("summarizeMeeting", () => {
    it("should summarize meeting successfully", async () => {
      const mockMeeting = {
        _id: mockMeetingId,
        transcript: "test transcript",
        isSummarized: false,
      };

      const mockSummary = {
        summary: "Test summary",
        actionItems: ["Action 1"],
      };

      const mockTaskIds = [new Types.ObjectId()];
      const mockTasks = [{ _id: mockTaskIds[0], title: "Task 1" }];

      (Meeting.findOne as jest.Mock).mockResolvedValue(mockMeeting as never);
      (generateMeetingSummary as jest.Mock).mockResolvedValue(
        mockSummary as never
      );
      (createTasksFromActionItems as jest.Mock).mockResolvedValue(
        mockTaskIds as never
      );
      (Meeting.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockMeeting,
        ...mockSummary,
      } as never);
      (Task.find as jest.Mock).mockResolvedValue(mockTasks as never);

      const result = await summarizeMeeting(
        mockUserId,
        mockMeetingId.toString()
      );

      expect(result.meeting).toBeDefined();
      expect(result.tasks).toBeDefined();
    });

    it("should throw error if already summarized", async () => {
      (Meeting.findOne as jest.Mock).mockResolvedValue({
        isSummarized: true,
      } as never);

      await expect(
        summarizeMeeting(mockUserId, mockMeetingId.toString())
      ).rejects.toThrow("Meeting has already been summarized");
    });
  });

  describe("updateTranscript", () => {
    it("should update meeting transcript", async () => {
      const transcriptData = {
        transcript: "Updated transcript",
        summary: "Test summary",
        actionItems: ["Action 1"],
      };

      (Meeting.findOne as jest.Mock).mockResolvedValue({
        _id: mockMeetingId,
      } as never);
      (Meeting.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: mockMeetingId,
        title: "Test",
        date: mockDate,
        duration: 60,
        participants: [],
        ...transcriptData,
      } as never);

      const result = await updateTranscript(
        mockUserId,
        mockMeetingId.toString(),
        transcriptData
      );

      expect(result.transcript).toBe(transcriptData.transcript);
    });
  });
});
