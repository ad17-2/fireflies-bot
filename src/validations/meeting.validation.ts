import * as yup from "yup";

export const createMeetingSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  date: yup.date().required("Date is required"),
  duration: yup
    .number()
    .required("Duration is required")
    .min(1, "Duration must be at least 1 minute")
    .max(480, "Duration cannot exceed 8 hours")
    .integer("Duration must be a whole number"),
  participants: yup
    .array()
    .of(yup.string())
    .min(1, "At least one participant is required"),
});

export const updateTranscriptSchema = yup.object({
  transcript: yup
    .string()
    .required("Transcript is required")
    .min(10, "Transcript must be at least 10 characters")
    .max(50000, "Transcript must not exceed 50000 characters")
    .trim(),
  summary: yup
    .string()
    .required("Summary is required")
    .min(10, "Summary must be at least 10 characters")
    .max(1000, "Summary must not exceed 1000 characters")
    .trim(),
  actionItems: yup
    .array()
    .of(
      yup
        .string()
        .required("Action item is required")
        .min(3, "Action item must be at least 3 characters")
        .max(200, "Action item must not exceed 200 characters")
        .trim()
    )
    .required("Action items are required")
    .min(1, "At least one action item is required")
    .max(20, "Cannot exceed 20 action items"),
});
