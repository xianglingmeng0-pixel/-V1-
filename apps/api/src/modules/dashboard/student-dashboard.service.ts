import { Injectable, NotFoundException } from "@nestjs/common";
import {
  displaySubmissionStatusSchema,
  studentDashboardSchema,
  StudentDashboard,
  submissionStatusSchema,
} from "@yanji/contracts";
import { StudentDashboardRepository } from "./student-dashboard.repository";

@Injectable()
export class StudentDashboardService {
  constructor(private readonly repository: StudentDashboardRepository) {}

  async getDashboard(userId: number): Promise<StudentDashboard> {
    const [user, report, tasks, announcements] = await Promise.all([
      this.repository.findUser(userId),
      this.repository.findCurrentReport(userId),
      this.repository.findTasks(userId),
      this.repository.findAnnouncements(),
    ]);

    if (!user) {
      throw new NotFoundException("学生账号不存在或未启用。");
    }

    const data = {
      user,
      current_report: report
        ? {
            id: report.id,
            title: report.title,
            deadline_at: report.deadline_at.toISOString(),
            grace_deadline_at: report.grace_deadline_at.toISOString(),
            status: submissionStatusSchema.parse(report.status),
            display_status: displaySubmissionStatusSchema.parse(
              report.display_status,
            ),
            days_remaining: Math.ceil(
              (report.deadline_at.getTime() - Date.now()) / 86_400_000,
            ),
            lock_version: report.lock_version,
            mentor: {
              id: report.mentor_id,
              name: report.mentor_name,
              professional_title: report.professional_title,
              research_direction: report.research_direction,
            },
            additional_teacher_count: report.additional_teacher_count,
          }
        : null,
      tasks: tasks.map((task) => ({
        ...task,
        status: task.status as
          "TODO" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED",
        due_at: task.due_at?.toISOString() ?? null,
      })),
      announcements: announcements.map((announcement) => ({
        ...announcement,
        publish_at: announcement.publish_at?.toISOString() ?? null,
      })),
    };

    return studentDashboardSchema.parse(data);
  }
}
