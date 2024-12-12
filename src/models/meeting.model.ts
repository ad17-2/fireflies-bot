import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMeeting extends Document {
  userId: Types.ObjectId;
  title: string;
  date: Date;
  duration: number;
  participants: string[];
  transcript: string;
  summary: string;
  actionItems: string[];
  isSummarized: boolean;
  summarizedAt?: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 480,
    },
    participants: [String],
    transcript: String,
    summary: String,
    actionItems: [String],
    isSummarized: {
      type: Boolean,
      default: false,
    },
    summarizedAt: Date,
  },
  {
    timestamps: true,
  }
);

meetingSchema.index({ userId: 1, date: 1 });

export const Meeting = mongoose.model<IMeeting>("Meeting", meetingSchema);
