import { TaskResult } from "./task.type";

export interface MeetingResult {
  _id: string;
  title: string;
  date: Date;
  duration: number;
  participants: string[];
  summary: string;
  tasks?: TaskResult[];
}

export interface CreateMeeting {
  title: string;
  date: Date;
  duration: number;
  participants: string[];
}

export interface UpdateMeetingTranscript {
  transcript: string;
  summary: string;
  actionItems: string[];
}

export interface MeetingSummarize {
  meeting: MeetingResult;
  tasks: TaskResult[];
}
