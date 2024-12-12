import { jest } from "@jest/globals";
import { Types } from "mongoose";
import { createTasksFromActionItems, getTasks } from "../services/task.service";
import { Task } from "../models/task.model";
import { validatePagination } from "../utils/pagination.util";

jest.mock("../models/task.model", () => ({
  Task: {
    insertMany: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

describe("Task Service", () => {
  const mockUserId = new Types.ObjectId();
  const mockMeetingId = new Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTasksFromActionItems", () => {
    it("should create tasks from action items with correct properties", async () => {
      const actionItems = ["Task 1", "Task 2"];
      const mockCreatedTasks = actionItems.map((item, index) => ({
        _id: new Types.ObjectId(),
        meetingId: mockMeetingId,
        userId: mockUserId,
        title: item,
        description: `Task created from meeting action item: ${item}`,
        status: "pending",
      }));

      (Task.insertMany as jest.Mock).mockResolvedValue(
        mockCreatedTasks as never
      );

      const result = await createTasksFromActionItems(
        mockMeetingId,
        mockUserId,
        actionItems
      );

      expect(Task.insertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            meetingId: mockMeetingId,
            userId: mockUserId,
            title: "Task 1",
            description: "Task created from meeting action item: Task 1",
            status: "pending",
            dueDate: expect.any(Date),
          }),
          expect.objectContaining({
            meetingId: mockMeetingId,
            userId: mockUserId,
            title: "Task 2",
            description: "Task created from meeting action item: Task 2",
            status: "pending",
            dueDate: expect.any(Date),
          }),
        ])
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockCreatedTasks[0]._id);
      expect(result[1]).toEqual(mockCreatedTasks[1]._id);
    });

    it("should handle empty action items array", async () => {
      (Task.insertMany as jest.Mock).mockResolvedValue([] as never);

      const result = await createTasksFromActionItems(
        mockMeetingId,
        mockUserId,
        []
      );

      expect(Task.insertMany).toHaveBeenCalledWith([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("getTasks", () => {
    const mockQuery = { page: "1", limit: "10" };
    const mockTasks = [
      {
        _id: new Types.ObjectId(),
        title: "Test Task",
        description: "Test Description",
        status: "pending",
        dueDate: new Date(),
      },
    ];

    beforeEach(() => {
      const mockFindChain = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockTasks as never),
      };

      (Task.find as jest.Mock).mockReturnValue(mockFindChain as never);
      (Task.countDocuments as jest.Mock).mockResolvedValue(1 as never);
    });

    it("should return paginated tasks with correct format", async () => {
      const result = await getTasks(mockUserId, mockQuery);

      expect(Task.find).toHaveBeenCalledWith(
        { userId: mockUserId },
        "_id title description status dueDate"
      );
      expect(Task.countDocuments).toHaveBeenCalledWith({ userId: mockUserId });

      expect(result).toEqual({
        tasks: [
          {
            _id: mockTasks[0]._id.toString(),
            title: mockTasks[0].title,
            description: mockTasks[0].description,
            status: mockTasks[0].status,
            dueDate: mockTasks[0].dueDate,
          },
        ],
        total: 1,
        limit: 10,
        page: 1,
      });
    });

    it("should handle empty task list", async () => {
      const mockFindChain = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([] as never),
      };

      (Task.find as jest.Mock).mockReturnValue(mockFindChain);
      (Task.countDocuments as jest.Mock).mockResolvedValue(0 as never);

      const result = await getTasks(mockUserId, mockQuery);

      expect(result).toEqual({
        tasks: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });

    it("should handle tasks without description", async () => {
      const tasksWithoutDesc = [
        {
          _id: new Types.ObjectId(),
          title: "Test Task",
          status: "pending",
          dueDate: new Date(),
        },
      ];

      const mockFindChain = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(tasksWithoutDesc as never),
      };

      (Task.find as jest.Mock).mockReturnValue(mockFindChain);

      const result = await getTasks(mockUserId, mockQuery);

      expect(result.tasks[0].description).toBe("");
    });
  });
});
