import { Types } from "mongoose";
import { Task } from "../models/task.model.js";
import { PaginationQuery } from "../types/pagination.type.js";
import { validatePagination } from "../utils/pagination.util.js";
import { TaskResult } from "../types/task.type.js";

export const createTasksFromActionItems = async (
  meetingId: Types.ObjectId,
  userId: Types.ObjectId,
  actionItems: string[]
): Promise<Types.ObjectId[]> => {
  const tasks = actionItems.map((item) => ({
    meetingId,
    userId,
    title: item,
    description: `Task created from meeting action item: ${item}`,
    status: "pending",
    // Due date is 7 days from now
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  }));

  const createdTasks = await Task.insertMany(tasks);
  return createdTasks.map((task: { _id: any }) => task._id);
};

export const getTasks = async (
  userId: Types.ObjectId,
  query: PaginationQuery
): Promise<{
  tasks: TaskResult[];
  total: number;
  page: number;
  limit: number;
}> => {
  const { page, limit } = validatePagination(query);

  const [tasks, total] = await Promise.all([
    Task.find(
      { userId },
      "_id title description status dueDate createdAt updatedAt"
    )
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean(),
    Task.countDocuments({ userId }),
  ]);

  return {
    tasks,
    total,
    page,
    limit,
  };
};
