import mongoose, { Document, Schema } from "mongoose";

export interface ITask extends Document {
  meetingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  dueDate: Date;
}

const taskSchema = new Schema<ITask>({
  meetingId: {
    type: Schema.Types.ObjectId,
    ref: "Meeting",
    required: true,
    index: true,
  },
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
  description: String,
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
    index: true,
  },
});

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });

export const Task = mongoose.model<ITask>("Task", taskSchema);
