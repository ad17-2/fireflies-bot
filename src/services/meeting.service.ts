import { Types } from "mongoose";
import { Meeting } from "../models/meeting.model";
import { Task } from "../models/task.model";
import { AIEmotionResult } from "../types/ai.types";
import {
  DayOfWeekStats,
  GeneralStats,
  MeetingStats,
  TopParticipant,
} from "../types/meeting-stats.type";
import {
  CreateMeeting,
  MeetingResult,
  MeetingSummarize,
  UpdateMeetingTranscript,
} from "../types/meeting.type";
import { PaginationQuery } from "../types/pagination.type";
import { validatePagination } from "../utils/pagination.util";
import { analyzeMeetingEmotion, generateMeetingSummary } from "./ai.service";
import { cacheService } from "./cache.service";
import { createTasksFromActionItems } from "./task.service";

export const getMeetings = async (
  userId: Types.ObjectId,
  query: PaginationQuery
): Promise<{
  meetings: MeetingResult[];
  total: number;
  page: number;
  limit: number;
}> => {
  const { page, limit } = validatePagination(query);

  const [meetings, total] = await Promise.all([
    Meeting.find({ userId }, "_id title date duration participants summary")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ date: -1 }),
    Meeting.countDocuments({ userId }),
  ]);

  const meetingResults: MeetingResult[] = meetings.map((meeting) => ({
    _id: meeting._id.toString(),
    title: meeting.title,
    date: meeting.date,
    duration: meeting.duration,
    participants: meeting.participants,
    summary: meeting.summary || "",
  }));

  return {
    meetings: meetingResults,
    total,
    page,
    limit,
  };
};

export const getMeeting = async (
  userId: Types.ObjectId,
  meetingId: Types.ObjectId
): Promise<MeetingResult | null> => {
  const [meeting, tasks] = await Promise.all([
    Meeting.findOne({
      _id: meetingId,
      userId: userId,
    }).lean(),
    Task.find(
      {
        meetingId: meetingId,
        userId: userId,
      },
      "_id title description status dueDate createdAt updatedAt"
    ).lean(),
  ]);

  if (!meeting) {
    return null;
  }

  return {
    ...meeting,
    tasks,
  };
};

export const getMeetingSentiment = async (
  userId: Types.ObjectId,
  meetingId: Types.ObjectId
): Promise<AIEmotionResult | null> => {
  const meeting = await Meeting.findOne({
    _id: meetingId,
    userId: userId,
  }).exec();

  if (meeting) {
    const sentiment: AIEmotionResult = await analyzeMeetingEmotion();
    return sentiment;
  }

  return null;
};

export const getMeetingStats = async (
  userId: Types.ObjectId
): Promise<MeetingStats> => {
  const stats = await cacheService.getOrSet(
    `meeting-stats-${userId}`,
    async () => {
      const [generalStats, topParticipants, meetingsByDay] = await Promise.all([
        // General Statistics
        Meeting.aggregate<GeneralStats>([
          { $match: { userId: new Types.ObjectId(userId) } },
          {
            $group: {
              _id: null,
              totalMeetings: { $sum: 1 },
              totalParticipants: { $sum: { $size: "$participants" } },
              shortestMeeting: { $min: "$duration" },
              longestMeeting: { $max: "$duration" },
              totalDuration: { $sum: "$duration" },
            },
          },
          {
            $project: {
              _id: 0,
              totalMeetings: 1,
              totalParticipants: 1,
              shortestMeeting: 1,
              longestMeeting: 1,
              averageParticipants: {
                $round: [
                  { $divide: ["$totalParticipants", "$totalMeetings"] },
                  0,
                ],
              },
              averageDuration: {
                $round: [{ $divide: ["$totalDuration", "$totalMeetings"] }, 1],
              },
            },
          },
        ]).exec(),

        // Top Participants
        Meeting.aggregate<TopParticipant>([
          { $match: { userId: new Types.ObjectId(userId) } },
          { $unwind: "$participants" },
          {
            $group: {
              _id: "$participants",
              meetingCount: { $sum: 1 },
            },
          },
          { $sort: { meetingCount: -1 } },
          { $limit: 5 },
          {
            $project: {
              _id: 0,
              participant: "$_id",
              meetingCount: 1,
            },
          },
        ]).exec(),

        // Meetings by Day of Week
        Meeting.aggregate<DayOfWeekStats>([
          { $match: { userId: new Types.ObjectId(userId) } },
          {
            $group: {
              _id: { $dayOfWeek: "$date" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              dayOfWeek: "$_id",
              count: 1,
            },
          },
        ]).exec(),
      ]);

      // Fill in missing days with zero counts
      const dayMap = new Map<number, number>(
        meetingsByDay.map((d: { dayOfWeek: any; count: any }) => [
          d.dayOfWeek,
          d.count,
        ])
      );

      const fullWeek: DayOfWeekStats[] = Array.from(
        { length: 7 },
        (_, i): DayOfWeekStats => ({
          dayOfWeek: i + 1,
          count: dayMap.get(i + 1) || 0,
        })
      );

      const defaultStats: GeneralStats = {
        totalMeetings: 0,
        averageParticipants: 0,
        totalParticipants: 0,
        shortestMeeting: 0,
        longestMeeting: 0,
        averageDuration: 0,
      };

      return {
        generalStats: generalStats[0] || defaultStats,
        topParticipants,
        meetingsByDayOfWeek: fullWeek,
      };
    },
    300 // 5 minutes cache
  );

  return stats;
};

export const createMeeting = async (
  userId: Types.ObjectId,
  meetingData: CreateMeeting
): Promise<MeetingResult> => {
  const newMeeting = new Meeting({
    ...meetingData,
    userId,
  });

  const savedMeeting = await newMeeting.save();
  return savedMeeting;
};

export const updateTranscript = async (
  userId: Types.ObjectId,
  meetingId: string,
  transcriptData: UpdateMeetingTranscript
): Promise<MeetingResult | null> => {
  if (!Types.ObjectId.isValid(meetingId)) {
    return null;
  }

  const meeting = await Meeting.findOne({
    _id: meetingId,
    userId,
  });

  if (!meeting) {
    return null;
  }

  const updatedMeeting = await Meeting.findByIdAndUpdate(
    meetingId,
    {
      ...transcriptData,
      updatedAt: new Date(),
    },
    { new: true }
  );

  return updatedMeeting;
};

export const summarizeMeeting = async (
  userId: Types.ObjectId,
  meetingId: string
): Promise<MeetingSummarize | null> => {
  if (!Types.ObjectId.isValid(meetingId)) {
    return null;
  }

  const meeting = await Meeting.findOne({ _id: meetingId, userId });

  if (!meeting) {
    return null;
  }

  if (meeting.isSummarized) {
    throw new Error("Meeting has already been summarized");
  }

  if (!meeting.transcript) {
    throw new Error("Meeting transcript is required for summarization");
  }

  // Generate summary using AI service
  const { summary, actionItems } = await generateMeetingSummary(
    meeting.transcript
  );

  // Create tasks from action items
  const taskIds = await createTasksFromActionItems(
    meeting._id,
    userId,
    actionItems
  );

  // Update meeting with summary
  const updatedMeeting = await Meeting.findByIdAndUpdate(
    meetingId,
    {
      summary,
      actionItems,
      isSummarized: true,
      summarizedAt: new Date(),
      updatedAt: new Date(),
    },
    { new: true }
  );

  // Get created tasks
  const createdTasks = await Task.find({
    _id: { $in: taskIds },
  });

  return {
    meeting: updatedMeeting,
    tasks: createdTasks,
  };
};
