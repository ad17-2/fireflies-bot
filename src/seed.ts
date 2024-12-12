import mongoose from "mongoose";
import { Meeting, IMeeting } from "./models/meeting.model.js";
import { Task, ITask } from "./models/task.model.js";
import { User, IUser } from "./models/user.model.js";
import bcrypt from "bcrypt";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://mongodb:27017/meetingbot";

await mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB for seeding"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Sample data
const userSeedData = [
  { name: "Alice Smith", email: "alice@example.com", password: "Password123" },
  { name: "Bob Johnson", email: "bob@example.com", password: "Password123" },
  {
    name: "Charlie Brown",
    email: "charlie@example.com",
    password: "Password123",
  },
  { name: "David Wilson", email: "david@example.com", password: "Password123" },
  { name: "Eva Davis", email: "eva@example.com", password: "Password123" },
];

const participants = [
  "Frank Miller",
  "Grace Lee",
  "Henry Ford",
  "Ivy Chen",
  "Jack Ryan",
  "Kelly White",
  "Luke Adams",
  "Mary Jones",
  "Nathan Black",
  "Olivia Green",
];

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomParticipants(): string[] {
  const count = Math.floor(Math.random() * 5) + 2; // 2 to 6 participants
  return participants.sort(() => 0.5 - Math.random()).slice(0, count);
}

async function seedUsers() {
  console.log("Clearing existing users...");
  await User.deleteMany({});

  console.log("Creating new users...");
  const users: IUser[] = [];

  for (const userData of userSeedData) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = new User({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
    });
    users.push(user);
  }

  await User.insertMany(users);
  console.log("Users seeded successfully");
  return users;
}

async function seedMeetings(users: IUser[]) {
  console.log("Clearing existing meetings...");
  await Meeting.deleteMany({});

  console.log("Creating new meetings...");
  const meetings: IMeeting[] = [];

  for (let i = 0; i < 100; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const meeting = new Meeting({
      userId: user._id,
      title: `Meeting ${i + 1}`,
      date: randomDate(new Date(2023, 0, 1), new Date()),
      duration: Math.floor(Math.random() * 120) + 30,
      participants: randomParticipants(),
      transcript:
        `This is a sample transcript for meeting ${i + 1}.\n\n` +
        `Participants discussed various topics including project updates, ` +
        `timeline reviews, and resource allocation.`,
      summary:
        `Summary of meeting ${i + 1}: Key points discussed were project ` +
        `milestones, team coordination, and next steps.`,
      actionItems: [
        `Review project timeline by end of week`,
        `Schedule follow-up meeting with stakeholders`,
        `Prepare resource allocation report`,
      ],
    });
    meetings.push(meeting);
  }

  await Meeting.insertMany(meetings);
  console.log("Meetings seeded successfully");
  return meetings;
}

async function seedTasks(meetings: IMeeting[]) {
  console.log("Clearing existing tasks...");
  await Task.deleteMany({});

  console.log("Creating new tasks...");
  const tasks: ITask[] = [];

  for (const meeting of meetings) {
    const taskCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < taskCount; i++) {
      const task = new Task({
        meetingId: meeting._id,
        userId: meeting.userId,
        title: `Task ${i + 1} from ${meeting.title}`,
        description:
          `This task was created based on discussions in ${meeting.title}. ` +
          `It requires attention and follow-up from the assigned team members.`,
        status: ["pending", "in-progress", "completed"][
          Math.floor(Math.random() * 3)
        ],
        dueDate: new Date(
          meeting.date.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
      });
      tasks.push(task);
    }
  }

  await Task.insertMany(tasks);
  console.log("Tasks seeded successfully");
}

try {
  console.log("Starting database seeding...");

  const users = await seedUsers();
  const meetings = await seedMeetings(users);
  await seedTasks(meetings);

  console.log("Database seeding completed successfully!");
} catch (error) {
  console.error("Error seeding database:", error);
} finally {
  await mongoose.connection.close();
  console.log("Database connection closed");
}
