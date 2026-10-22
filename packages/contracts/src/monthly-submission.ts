import { z } from "zod";

export const submissionStatuses = ["PENDING", "SUBMITTED", "ARCHIVED"] as const;

export const submissionStatusSchema = z.enum(submissionStatuses);

export const displaySubmissionStatusSchema = z.enum([
  ...submissionStatuses,
  "GRACE",
  "MISSED",
  "SUBMITTED_LATE",
]);

export const fileReferenceSchema = z.object({
  file_id: z.number().int().positive(),
  file_role: z.enum(["MAIN_REPORT", "ATTACHMENT", "EVIDENCE"]),
});

export const createSubmissionVersionSchema = z.object({
  lock_version: z.number().int().nonnegative(),
  title: z.string().trim().min(1).max(200),
  monthly_summary: z.string().trim().min(1),
  achievements: z.string().trim().nullable().optional(),
  difficulties: z.string().trim().nullable().optional(),
  next_plan: z.string().trim().min(1),
  self_progress: z.number().int().min(0).max(100).nullable().optional(),
  change_note: z.string().trim().nullable().optional(),
  files: z.array(fileReferenceSchema).min(1),
});

export const createSubmissionCommentSchema = z.object({
  submission_id: z.number().int().positive(),
  content: z.string().trim().min(1).max(2000),
});

export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;
export type CreateSubmissionVersion = z.infer<
  typeof createSubmissionVersionSchema
>;
export type CreateSubmissionComment = z.infer<
  typeof createSubmissionCommentSchema
>;
