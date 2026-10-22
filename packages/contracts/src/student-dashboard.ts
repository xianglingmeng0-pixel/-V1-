import { z } from "zod";
import {
  displaySubmissionStatusSchema,
  submissionStatusSchema,
} from "./monthly-submission";

const personSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});

export const studentDashboardSchema = z.object({
  user: personSchema.extend({
    user_no: z.string(),
  }),
  current_report: z
    .object({
      id: z.number().int().positive(),
      title: z.string(),
      deadline_at: z.string().datetime({ offset: true }),
      grace_deadline_at: z.string().datetime({ offset: true }),
      status: submissionStatusSchema,
      display_status: displaySubmissionStatusSchema,
      days_remaining: z.number().int(),
      lock_version: z.number().int().nonnegative(),
      mentor: personSchema.extend({
        professional_title: z.string().nullable(),
        research_direction: z.string().nullable(),
      }),
      additional_teacher_count: z.number().int().nonnegative(),
    })
    .nullable(),
  tasks: z.array(
    z.object({
      id: z.number().int().positive(),
      title: z.string(),
      status: z.enum(["TODO", "IN_PROGRESS", "SUBMITTED", "COMPLETED"]),
      progress_percent: z.number().int().min(0).max(100),
      due_at: z.string().datetime({ offset: true }).nullable(),
    }),
  ),
  announcements: z.array(
    z.object({
      id: z.number().int().positive(),
      title: z.string(),
      publish_at: z.string().datetime({ offset: true }).nullable(),
    }),
  ),
});

export const studentDashboardResponseSchema = z.object({
  data: studentDashboardSchema,
  meta: z.object({
    request_id: z.string(),
  }),
});

export type StudentDashboard = z.infer<typeof studentDashboardSchema>;
export type StudentDashboardResponse = z.infer<
  typeof studentDashboardResponseSchema
>;
