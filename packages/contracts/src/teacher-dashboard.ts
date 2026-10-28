import { z } from "zod";

export const completionStatusSchema = z.enum([
  "COMPLETE",
  "MISSED",
  "GRACE",
  "PENDING",
  "FUTURE",
]);

export const readStatusSchema = z.enum(["UNREAD", "READ"]);

const viewerSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  role: z.enum(["MENTOR", "DEAN"]),
});

export const teacherDashboardSchema = z.object({
  viewer: viewerSchema,
  year: z.number().int().min(2000).max(2200),
  month: z.number().int().min(1).max(12),
  summary: z.object({
    student_count: z.number().int().nonnegative(),
    submitted_count: z.number().int().nonnegative(),
    unread_count: z.number().int().nonnegative(),
    missed_count: z.number().int().nonnegative(),
  }),
  reports: z.array(
    z.object({
      submission_id: z.number().int().positive(),
      student_id: z.number().int().positive(),
      student_no: z.string(),
      student_name: z.string(),
      mentor_name: z.string(),
      title: z.string(),
      completion_status: completionStatusSchema,
      read_status: readStatusSchema,
      submitted_at: z.string().datetime({ offset: true }).nullable(),
      mentor_comment: z.string().nullable(),
      comment_count: z.number().int().nonnegative(),
    }),
  ),
});

export const annualProgressSchema = z.object({
  viewer: viewerSchema,
  year: z.number().int().min(2000).max(2200),
  students: z.array(
    z.object({
      student_id: z.number().int().positive(),
      student_no: z.string(),
      student_name: z.string(),
      mentor_name: z.string(),
      months: z.array(
        z.object({
          month: z.number().int().min(1).max(12),
          status: completionStatusSchema,
        }),
      ),
    }),
  ),
});

export const teacherDashboardResponseSchema = z.object({
  data: teacherDashboardSchema,
  meta: z.object({ request_id: z.string() }),
});

export const annualProgressResponseSchema = z.object({
  data: annualProgressSchema,
  meta: z.object({ request_id: z.string() }),
});

export type CompletionStatus = z.infer<typeof completionStatusSchema>;
export type TeacherDashboard = z.infer<typeof teacherDashboardSchema>;
export type AnnualProgress = z.infer<typeof annualProgressSchema>;
