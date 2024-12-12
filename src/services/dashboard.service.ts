import { Types } from "mongoose";
import { Meeting } from "../models/meeting.model";
import { Task } from "../models/task.model";
import { cacheService } from "./cache.service";
import { DashboardData } from "../types/dashboard.type";

export const getDashboard = async (
  userId: Types.ObjectId
): Promise<DashboardData> => {
  try {
    const data = await cacheService.getOrSet(
      `dashboard-${userId}`,
      async () => {
        const [upcomingMeetings, tasksStats, overdueTasks] = await Promise.all([
          // Upcoming Meetings
          Meeting.aggregate([
            {
              $match: {
                userId: new Types.ObjectId(userId),
                date: { $gte: new Date() },
              },
            },
            { $sort: { date: 1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 1,
                title: 1,
                date: 1,
                participantCount: { $size: "$participants" },
              },
            },
          ]).exec(),

          // Task Summary and Total Meetings
          Task.aggregate([
            { $match: { userId: new Types.ObjectId(userId) } },
            {
              $facet: {
                taskSummary: [
                  {
                    $group: {
                      _id: "$status",
                      count: { $sum: 1 },
                    },
                  },
                ],
                totalMeetings: [
                  {
                    $lookup: {
                      from: "meetings",
                      pipeline: [
                        { $match: { userId: new Types.ObjectId(userId) } },
                        { $count: "total" },
                      ],
                      as: "meetingCount",
                    },
                  },
                  {
                    $project: {
                      total: { $arrayElemAt: ["$meetingCount.total", 0] },
                    },
                  },
                ],
              },
            },
          ]).exec(),

          // Overdue Tasks
          Task.aggregate([
            {
              $match: {
                userId: new Types.ObjectId(userId),
                dueDate: { $lt: new Date() },
                status: { $ne: "completed" },
              },
            },
            { $sort: { dueDate: 1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "meetings",
                let: { meetingId: "$meetingId" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$meetingId"] },
                    },
                  },
                  { $project: { title: 1 } },
                ],
                as: "meeting",
              },
            },
            { $unwind: "$meeting" },
            {
              $project: {
                _id: 1,
                title: 1,
                dueDate: 1,
                meetingId: 1,
                meetingTitle: "$meeting.title",
              },
            },
          ]).exec(),
        ]);

        // Process task summary
        const taskSummaryMap = {
          pending: 0,
          inProgress: 0,
          completed: 0,
        };

        // Safely get task stats
        const taskSummary = tasksStats[0]?.taskSummary || [];

        // Process each status count
        taskSummary.forEach((stat: { _id: string; count: number }) => {
          if (stat._id === "pending") {
            taskSummaryMap.pending = stat.count;
          } else if (stat._id === "in-progress") {
            taskSummaryMap.inProgress = stat.count;
          } else if (stat._id === "completed") {
            taskSummaryMap.completed = stat.count;
          }
        });

        const dashboardData: DashboardData = {
          totalMeetings: tasksStats[0].totalMeetings[0]?.total || 0,
          taskSummary: taskSummaryMap,
          upcomingMeetings: upcomingMeetings,
          overdueTasks: overdueTasks,
        };

        return dashboardData;
      },
      300
    );

    return data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
