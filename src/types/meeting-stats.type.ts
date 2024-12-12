export interface GeneralStats {
  totalMeetings: number;
  totalParticipants: number;
  shortestMeeting: number;
  longestMeeting: number;
  averageParticipants: number;
  averageDuration: number;
}

export interface TopParticipant {
  participant: string;
  meetingCount: number;
}

export interface DayOfWeekStats {
  dayOfWeek: number;
  count: number;
}

export interface MeetingStats {
  generalStats: GeneralStats;
  topParticipants: TopParticipant[];
  meetingsByDayOfWeek: DayOfWeekStats[];
}
