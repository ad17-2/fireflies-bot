import { Request, Response } from "express";
import { getDashboard } from "../services/dashboard.service";
import { WebResponse } from "../types/response.type";
import { DashboardData } from "../types/dashboard.type";
import { getDashboardHandler } from "../controller/dashboard.controller";
import { Types } from "mongoose";

jest.mock("../services/dashboard.service");

describe("getDashboardHandler", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    mockRequest = {
      user: { _id: "507f1f77bcf86cd799439011" },
    } as Partial<Request>;
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jsonMock,
    };
  });

  it("should return 401 if no user is authenticated", async () => {
    mockRequest = {}; // No user on the request
    await getDashboardHandler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should call getDashboard and return 200 with data", async () => {
    const mockDashboardData: DashboardData = {
      totalMeetings: 5,
      taskSummary: {
        pending: 3,
        inProgress: 1,
        completed: 2,
      },
      upcomingMeetings: [
        {
          _id: new Types.ObjectId("507f1f77bcf86cd799439011"),
          participantCount: 5,
          title: "Meeting 1",
          date: new Date(),
        },
      ],
      overdueTasks: [
        {
          _id: new Types.ObjectId("507f1f77bcf86cd799439011"),
          meetingId: new Types.ObjectId("507f1f77bcf86cd799439011"),
          meetingTitle: "Meeting 1",
          title: "Overdue Task 1",
          dueDate: new Date(),
        },
      ],
    };

    (getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

    await getDashboardHandler(mockRequest as Request, mockResponse as Response);

    expect(getDashboard).toHaveBeenCalledWith(
      new Types.ObjectId("507f1f77bcf86cd799439011")
    );

    const expectedResponse: WebResponse<DashboardData> = {
      message: "Dashboard data fetched successfully",
      data: mockDashboardData,
    };

    expect(jsonMock).toHaveBeenCalledWith(expectedResponse);
  });
});
