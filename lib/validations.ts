import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["Teacher", "Student", "Parent"], {
    required_error: "Please select a role",
  }),
  parentId: z.string().optional(),
});

export const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  description: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
});

export const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  classId: z.string().min(1, "Class is required"),
  tags: z.array(z.string()).optional(),
});

export const scheduleSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  dayOfWeek: z.enum([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  subject: z.string().min(1, "Subject is required"),
  room: z.string().optional(),
});

export const messageSchema = z.object({
  receiverId: z.string().min(1, "Receiver is required"),
  content: z.string().min(1, "Message content is required"),
  attachments: z.array(z.string()).optional(),
});

