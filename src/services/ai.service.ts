import { AIEmotionResult, AISummaryResult } from "../types/ai.types";

export const generateMeetingSummary = async (
  transcript: string
): Promise<AISummaryResult> => {
  // Mock AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const summary = `Team discussed project progress and outlined next steps. Key points included 
      technical updates, timeline review, and resource allocation planning.`;

  const actionItems = [
    "Review project timeline by next week",
    "Schedule follow-up meeting with stakeholders",
    "Update technical documentation",
    "Prepare resource allocation report",
  ];

  return { summary, actionItems };
};

export const analyzeMeetingEmotion = async (): Promise<AIEmotionResult> => {
  // Mock AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let joy = Math.random();
  let anger = Math.random() * (1 - joy);
  let sadness = 1 - joy - anger;

  const aiMeetingEmotionResult: AIEmotionResult = {
    joy: Number(joy.toFixed(2)),
    anger: Number(anger.toFixed(2)),
    sadness: Number(sadness.toFixed(2)),
  };

  return aiMeetingEmotionResult;
};
