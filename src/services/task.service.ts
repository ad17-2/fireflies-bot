import { Types } from "mongoose";
import { PaginationQuery } from "../types/pagination.type";
import { validatePagination } from "../utils/pagination.util";
import { TaskResult } from "../types/task.type";
import { Task } from "../models/task.model";

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
    Task.find({ userId }, "_id title description status dueDate")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean(),
    Task.countDocuments({ userId }),
  ]);

  const taskResults: TaskResult[] = tasks.map((task) => ({
    _id: task._id.toString(),
    title: task.title,
    description: task.description || "",
    status: task.status,
    dueDate: task.dueDate,
  }));

  return {
    tasks: taskResults,
    total,
    page,
    limit,
  };
};
