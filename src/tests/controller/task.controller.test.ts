import { Response } from "express";
import { Types } from "mongoose";
import { getTasks } from "../../services/task.service";
import { AuthenticatedRequest } from "../../types/auth.types";
import { PaginationQuery } from "../../types/pagination.type";
import { getTasksHandler } from "../../controller/task.controller";

jest.mock("../../services/task.service", () => ({
  getTasks: jest.fn(),
}));

describe("Task Controller", () => {
  let mockRequest: Partial<AuthenticatedRequest & { query: PaginationQuery }>;
  let mockResponse: Partial<Response>;
  const mockUserId = "60f7b3b3d9f6b3e7f8e4f3b3";

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
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("should return tasks when user is authenticated", async () => {
    const mockTasks = [
      {
        _id: new Types.ObjectId().toString(),
        title: "Test Task",
        description: "Test Description",
        status: "pending",
        dueDate: new Date(),
      },
    ];

    (getTasks as jest.Mock).mockResolvedValue({
      tasks: mockTasks,
      total: 1,
      page: 1,
      limit: 10,
    } as never);

    await getTasksHandler(
      mockRequest as AuthenticatedRequest & { query: PaginationQuery },
      mockResponse as Response
    );

    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Tasks data fetched successfully",
      data: mockTasks,
      total: 1,
      page: 1,
      limit: 10,
    });
  });

  it("should return 401 when user is not authenticated", async () => {
    mockRequest.user = undefined;

    await getTasksHandler(
      mockRequest as AuthenticatedRequest & { query: PaginationQuery },
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Unauthorized",
    });
  });

  it("should handle empty task list", async () => {
    (getTasks as jest.Mock).mockResolvedValue({
      tasks: [],
      total: 0,
      page: 1,
      limit: 10,
    } as never);

    await getTasksHandler(
      mockRequest as AuthenticatedRequest & { query: PaginationQuery },
      mockResponse as Response
    );

    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Tasks data fetched successfully",
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });
  });
});
