import { jest } from "@jest/globals";
import { Types } from "mongoose";
import { getDashboard } from "../services/dashboard.service";
import { cacheService } from "../services/cache.service";
import { Meeting } from "../models/meeting.model";
import { Task } from "../models/task.model";

jest.mock("../models/meeting.model", () => ({
  Meeting: {
    aggregate: jest.fn(),
  },
}));

jest.mock("../models/task.model", () => ({
  Task: {
    aggregate: jest.fn(),
  },
}));

jest.mock("../services/cache.service", () => ({
  cacheService: {
    getOrSet: jest.fn(),
  },
}));

describe("getDashboard", () => {
  const userId = new Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return dashboard data", async () => {
    const mockUpcomingMeetings = [
      {
        _id: new Types.ObjectId(),
        title: "Meeting 1",
        date: new Date(),
        participantCount: 5,
      },
    ];
    const mockTaskStats = [
      {
        taskSummary: [
          { _id: "pending", count: 5 },
          { _id: "in-progress", count: 3 },
          { _id: "completed", count: 2 },
        ],
        totalMeetings: [{ total: 10 }],
      },
    ];
    const mockOverdueTasks = [
      {
        _id: new Types.ObjectId(),
        title: "Overdue Task 1",
        dueDate: new Date(),
        meetingId: new Types.ObjectId(),
        meetingTitle: "Meeting Title",
      },
    ];

    (cacheService.getOrSet as jest.Mock).mockResolvedValue({
      totalMeetings: 10,
      taskSummary: {
        pending: 5,
        inProgress: 3,
        completed: 2,
      },
      upcomingMeetings: mockUpcomingMeetings,
      overdueTasks: mockOverdueTasks,
    } as never);

    (Meeting.aggregate as jest.Mock).mockResolvedValue(
      mockUpcomingMeetings as never
    );
    (Task.aggregate as jest.Mock).mockResolvedValue(mockTaskStats as never);

    const result = await getDashboard(userId);

    expect(cacheService.getOrSet).toHaveBeenCalledWith(
      `dashboard-${userId}`,
      expect.any(Function),
      300
    );

    expect(result).toEqual({
      totalMeetings: 10,
      taskSummary: {
        pending: 5,
        inProgress: 3,
        completed: 2,
      },
      upcomingMeetings: mockUpcomingMeetings,
      overdueTasks: mockOverdueTasks,
    });
  });
});
