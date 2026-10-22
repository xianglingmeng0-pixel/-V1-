import type {
  AnnualProgress,
  StudentDashboard,
  TeacherDashboard,
} from "@yanji/contracts";

function monthDeadline(year: number, month: number): Date {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(Math.min(30, lastDay)).padStart(2, "0")}T23:59:59+08:00`,
  );
}

export function createDemoStudentDashboard(): StudentDashboard {
  const now = new Date();
  const deadline = monthDeadline(now.getFullYear(), now.getMonth() + 1);
  const graceDeadline = new Date(deadline.getTime() + 86_400_000);
  return {
    user: { id: 1, user_no: "20260001", name: "林晓雨" },
    current_report: {
      id: 1,
      title: `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, "0")}月成果报告`,
      deadline_at: deadline.toISOString(),
      grace_deadline_at: graceDeadline.toISOString(),
      status: "PENDING",
      display_status:
        now > graceDeadline ? "MISSED" : now > deadline ? "GRACE" : "PENDING",
      days_remaining: Math.ceil(
        (deadline.getTime() - now.getTime()) / 86_400_000,
      ),
      lock_version: 0,
      mentor: {
        id: 2,
        name: "龚老师",
        professional_title: "副教授",
        research_direction: "机器学习与科学计算",
      },
      additional_teacher_count: 1,
    },
    tasks: [],
    announcements: [
      {
        id: 1,
        title: "本月成果报告请于30日24:00前提交",
        publish_at: new Date(now.getTime() - 86_400_000).toISOString(),
      },
      {
        id: 2,
        title: "周四组会调整至下午三点",
        publish_at: new Date(now.getTime() - 172_800_000).toISOString(),
      },
    ],
  };
}

const students = [
  [1, "20260001", "林晓雨"],
  [5, "20260002", "陈思远"],
  [6, "20260003", "赵一诺"],
  [7, "20260004", "周子涵"],
  [8, "20260005", "孙嘉宁"],
  [9, "20260006", "吴桐"],
] as const;

export function createDemoTeacherDashboard(
  role: "MENTOR" | "DEAN",
): TeacherDashboard {
  const now = new Date();
  const month = now.getMonth() + 1;
  const deadline = monthDeadline(now.getFullYear(), month);
  const graceDeadline = new Date(deadline.getTime() + 86_400_000);
  const reports: TeacherDashboard["reports"] = students.map(
    ([studentId, studentNo, studentName], index) => {
      const submitted = index < 3;
      return {
        submission_id: 101 + index,
        student_id: studentId,
        student_no: studentNo,
        student_name: studentName,
        mentor_name: "龚老师",
        title: `${month}月成果报告`,
        completion_status: submitted
          ? "COMPLETE"
          : now > graceDeadline
            ? "MISSED"
            : now > deadline
              ? "GRACE"
              : "PENDING",
        read_status: index === 0 ? "READ" : "UNREAD",
        submitted_at: submitted
          ? new Date(now.getTime() - (index + 1) * 3_600_000).toISOString()
          : null,
        comment_count: index === 0 ? 1 : 0,
      };
    },
  );
  return {
    viewer: {
      id: role === "DEAN" ? 4 : 2,
      name: role === "DEAN" ? "张院长" : "龚老师",
      role,
    },
    year: now.getFullYear(),
    month,
    summary: {
      student_count: students.length,
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
    reports,
  };
}

export function createDemoAnnualProgress(
  role: "MENTOR" | "DEAN",
): AnnualProgress {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  return {
    viewer: {
      id: role === "DEAN" ? 4 : 2,
      name: role === "DEAN" ? "张院长" : "龚老师",
      role,
    },
    year: now.getFullYear(),
    students: students.map(([studentId, studentNo, studentName], index) => ({
      student_id: studentId,
      student_no: studentNo,
      student_name: studentName,
      mentor_name: "龚老师",
      months: Array.from({ length: 12 }, (_, monthIndex) => {
        const month = monthIndex + 1;
        let status: "COMPLETE" | "MISSED" | "PENDING" | "FUTURE" =
          month < currentMonth
            ? "COMPLETE"
            : month === currentMonth
              ? index < 3
                ? "COMPLETE"
                : "PENDING"
              : "FUTURE";
        if ((index === 1 || index === 4) && month === 8) status = "MISSED";
        if (index === 3 && month === 6) status = "MISSED";
        return { month, status };
      }),
    })),
  };
}
