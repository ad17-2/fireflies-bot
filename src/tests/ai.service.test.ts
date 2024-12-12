import {
  analyzeMeetingEmotion,
  generateMeetingSummary,
} from "../services/ai.service.js";

describe("AI Service", () => {
  it("should return emotion scores", async () => {
    const result = await analyzeMeetingEmotion();
    expect(result).toHaveProperty("joy");
    expect(result).toHaveProperty("anger");
    expect(result).toHaveProperty("sadness");
  });

  it("should return meeting summary with summary and action items", async () => {
    const transcript =
      "Team meeting discussing project progress and next steps";
    const result = await generateMeetingSummary(transcript);

    expect(result).toHaveProperty("summary");
    expect(typeof result.summary).toBe("string");
    expect(result.summary.length).toBeGreaterThan(0);

    expect(result).toHaveProperty("actionItems");
    expect(Array.isArray(result.actionItems)).toBe(true);
    expect(result.actionItems.length).toBeGreaterThan(0);

    result.actionItems.forEach((item) => {
      expect(typeof item).toBe("string");
      expect(item.length).toBeGreaterThan(0);
    });
  });

  it("should handle different transcript inputs", async () => {
    const shortTranscript = "Quick team sync";
    const longTranscript =
      "Detailed discussion about multiple project aspects and strategic planning";

    const shortResult = await generateMeetingSummary(shortTranscript);
    expect(shortResult).toHaveProperty("summary");
    expect(shortResult).toHaveProperty("actionItems");

    const longResult = await generateMeetingSummary(longTranscript);
    expect(longResult).toHaveProperty("summary");
    expect(longResult).toHaveProperty("actionItems");
  });
});
