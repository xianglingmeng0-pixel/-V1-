import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  annualProgressSchema,
  AnnualProgress,
  completionStatusSchema,
  readStatusSchema,
  teacherDashboardSchema,
  TeacherDashboard,
} from "@yanji/contracts";
import { TeacherDashboardRepository } from "./teacher-dashboard.repository";

@Injectable()
export class TeacherDashboardService {
  constructor(private readonly repository: TeacherDashboardRepository) {}

  async getDashboard(
    userId: number,
    role: "MENTOR" | "DEAN",
    year: number,
    month: number,
  ): Promise<TeacherDashboard> {
    const [viewer, reports] = await Promise.all([
      this.repository.findViewer(userId),
      this.repository.findReports(userId, role, year, month),
    ]);
    if (!viewer) throw new NotFoundException("导师或院长账号不存在。");

    const mappedReports = reports.map((report) => ({
      ...report,
      completion_status: completionStatusSchema.parse(report.completion_status),
      read_status: readStatusSchema.parse(report.read_status),
      submitted_at: report.submitted_at?.toISOString() ?? null,
    }));

    return teacherDashboardSchema.parse({
      viewer: { ...viewer, role },
      year,
      month,
      summary: {
        student_count: new Set(reports.map((report) => report.student_id)).size,
        submitted_count: reports.filter(
          (report) => report.completion_status === "COMPLETE",
        ).length,
        unread_count: reports.filter(
          (report) =>
            report.completion_status === "COMPLETE" &&
            report.read_status === "UNREAD",
        ).length,
        missed_count: reports.filter(
          (report) => report.completion_status === "MISSED",
        ).length,
      },
      reports: mappedReports,
    });
  }

  async getAnnualProgress(
    userId: number,
    role: "MENTOR" | "DEAN",
    year: number,
  ): Promise<AnnualProgress> {
    const [viewer, rows] = await Promise.all([
      this.repository.findViewer(userId),
      this.repository.findAnnualProgress(userId, role, year),
    ]);
    if (!viewer) throw new NotFoundException("导师或院长账号不存在。");

    const grouped = new Map<
      number,
      {
        student_id: number;
        student_no: string;
        student_name: string;
        mentor_name: string;
        months: Array<{ month: number; status: string }>;
      }
    >();

    for (const row of rows) {
      const item = grouped.get(row.student_id) ?? {
        student_id: row.student_id,
        student_no: row.student_no,
        student_name: row.student_name,
        mentor_name: row.mentor_name,
        months: [],
      };
      if (row.cycle_month && row.completion_status) {
        item.months.push({
          month: row.cycle_month,
          status: row.completion_status,
        });
      }
      grouped.set(row.student_id, item);
    }

    const students = [...grouped.values()].map((student) => ({
      ...student,
      months: Array.from({ length: 12 }, (_, index) => {
        const existing = student.months.find(
          (item) => item.month === index + 1,
        );
        return {
          month: index + 1,
          status: completionStatusSchema.parse(existing?.status ?? "FUTURE"),
        };
      }),
    }));

    return annualProgressSchema.parse({
      viewer: { ...viewer, role },
      year,
      students,
    });
  }

  async markRead(
    submissionId: number,
    viewerId: number,
    role: "MENTOR" | "DEAN",
  ): Promise<void> {
    const allowed = await this.repository.markRead(
      submissionId,
      viewerId,
      role,
    );
    if (!allowed) throw new ForbiddenException("无权查看该学生月报。");
  }

  async addComment(
    submissionId: number,
    authorId: number,
    role: "MENTOR" | "DEAN",
    content: string,
  ): Promise<void> {
    const allowed = await this.repository.addComment(
      submissionId,
      authorId,
      role,
      content,
    );
    if (!allowed) throw new ForbiddenException("无权评论该学生月报。");
  }
}
