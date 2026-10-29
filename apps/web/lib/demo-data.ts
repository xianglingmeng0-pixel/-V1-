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
    user: { id: 1, user_no: "20260001", name: "林晓雨", grade: "大三" },
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
      additional_teacher_count: 0,
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

export const demoStudents = [
  [1, "20260001", "林晓雨", "大三"],
  [5, "20260002", "陈思远", "研二"],
  [6, "20260003", "赵一诺", "大四"],
  [7, "20260004", "周子涵", "研二"],
  [8, "20260005", "孙嘉宁", "研一"],
  [9, "20260006", "吴桐", "博一"],
] as const;

type DemoMonthStatus =
  AnnualProgress["students"][number]["months"][number]["status"];

export type DemoHistoricalReport = {
  student: {
    id: number;
    studentNo: string;
    name: string;
    grade: string;
    mentorName: string;
  };
  year: number;
  month: number;
  status: DemoMonthStatus;
  title: string;
  summary: string;
  achievements: string[];
  nextPlan: string;
  file: {
    name: string;
    size: string;
  };
  submittedAt: string | null;
  reviewedAt: string | null;
  comments: Array<{
    author: string;
    content: string;
    createdAt: string;
  }>;
};

const researchTracks = [
  "多模态学习实验",
  "科学计算模型",
  "医学图像分割",
  "知识图谱构建",
  "时序数据预测",
  "智能优化算法",
] as const;

const monthlyMilestones = [
  "研究方向梳理与年度计划",
  "数据集整理与预处理",
  "基线模型复现",
  "核心模块设计与实现",
  "第一轮对照实验",
  "误差分析与参数优化",
  "消融实验设计",
  "中期结果整理",
  "补充实验与稳定性验证",
  "论文框架与图表整理",
  "论文初稿修改",
  "年度成果总结",
] as const;

const mentorComments = [
  "本月进展清晰，建议下阶段把基线参数和数据划分方式写得更完整，便于后续复现实验。",
  "实验结果已经形成对比，下一步重点分析误差来源，并补充一组关键消融实验。",
  "整体工作按计划推进。建议把图表结论进一步量化，并在下月报告中说明改进效果。",
] as const;

const deanComments = [
  "整体研究进展清晰，建议继续保持规范的月度记录，并及时沉淀阶段性成果。",
  "本月工作安排合理，希望下一阶段加强成果总结，突出研究工作的连续性和创新点。",
  "已了解本月进展。建议按照导师指导继续推进，并在关键节点及时形成书面成果。",
] as const;

function getDemoMonthStatus(
  studentIndex: number,
  month: number,
  currentMonth: number,
): DemoMonthStatus {
  let status: DemoMonthStatus =
    month < currentMonth
      ? "COMPLETE"
      : month === currentMonth
        ? studentIndex < 3
          ? "COMPLETE"
          : "PENDING"
        : "FUTURE";
  if ((studentIndex === 1 || studentIndex === 4) && month === 8) {
    status = "MISSED";
  }
  if (studentIndex === 3 && month === 6) status = "MISSED";
  return status;
}

export function createDemoHistoricalReport(
  studentId: number,
  year: number,
  month: number,
  viewerRole: "MENTOR" | "DEAN" = "MENTOR",
): DemoHistoricalReport | null {
  const now = new Date();
  const studentIndex = demoStudents.findIndex(([id]) => id === studentId);
  const student = demoStudents[studentIndex];
  if (!student || year !== now.getFullYear() || month < 1 || month > 12) {
    return null;
  }

  const status = getDemoMonthStatus(studentIndex, month, now.getMonth() + 1);
  const [id, studentNo, name, grade] = student;
  const mentorName = studentIndex >= 3 ? "周老师" : "龚老师";
  const track = researchTracks[studentIndex] ?? researchTracks[0];
  const milestone = monthlyMilestones[month - 1] ?? monthlyMilestones[0];
  const submittedAt = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(26 + (studentIndex % 3)).padStart(2, "0")}T20:30:00+08:00`,
  );
  const reviewedAt = new Date(submittedAt.getTime() + 18 * 3_600_000);
  const isDean = viewerRole === "DEAN";
  const roleComments = isDean ? deanComments : mentorComments;

  return {
    student: { id, studentNo, name, grade, mentorName },
    year,
    month,
    status,
    title: `${track}：${milestone}`,
    summary: `本月围绕“${track}”推进${milestone}，完成了计划内的资料整理、实验验证和阶段性结果汇总。`,
    achievements: [
      `完成${milestone}的主要工作并整理过程记录`,
      "对关键实验结果进行复核，形成可追溯的对照表",
      "更新研究日志与问题清单，明确下一阶段优先事项",
    ],
    nextPlan: `继续推进${track}，根据导师意见补充对照实验并完善结果分析。`,
    file: {
      name: `${name}-${year}年${month}月科研进展.pdf`,
      size: `${(2.1 + ((studentIndex + month) % 7) * 0.3).toFixed(1)} MB`,
    },
    submittedAt: status === "COMPLETE" ? submittedAt.toISOString() : null,
    reviewedAt: status === "COMPLETE" ? reviewedAt.toISOString() : null,
    comments:
      status === "COMPLETE"
        ? [
            {
              author: isDean ? "杜院长" : "龚老师",
              content:
                roleComments[(studentIndex + month) % roleComments.length] ??
                roleComments[0],
              createdAt: reviewedAt.toISOString(),
            },
          ]
        : [],
  };
}

export function createDemoTeacherDashboard(
  role: "MENTOR" | "DEAN",
): TeacherDashboard {
  const now = new Date();
  const month = now.getMonth() + 1;
  const deadline = monthDeadline(now.getFullYear(), month);
  const graceDeadline = new Date(deadline.getTime() + 86_400_000);
  const mentorComments = [
    "内容已查看，建议下月补充实验对照结果。",
    "本月进展清晰，请继续完善关键参数说明。",
    "建议补充误差分析，并整理下一阶段实验计划。",
  ];
  const reports: TeacherDashboard["reports"] = demoStudents.map(
    ([studentId, studentNo, studentName, studentGrade], index) => {
      const submitted = index < 3;
      return {
        submission_id: 101 + index,
        student_id: studentId,
        student_no: studentNo,
        student_name: studentName,
        student_grade: studentGrade,
        mentor_name: role === "DEAN" && index >= 3 ? "周老师" : "龚老师",
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
        mentor_comment: submitted ? (mentorComments[index] ?? null) : null,
        comment_count: index === 0 ? 1 : 0,
      };
    },
  );
  return {
    viewer: {
      id: role === "DEAN" ? 4 : 2,
      name: role === "DEAN" ? "杜院长" : "龚老师",
      role,
    },
    year: now.getFullYear(),
    month,
    summary: {
      student_count: role === "DEAN" ? 20 : demoStudents.length,
      submitted_count:
        role === "DEAN"
          ? 16
          : reports.filter((report) => report.completion_status === "COMPLETE")
              .length,
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
      name: role === "DEAN" ? "杜院长" : "龚老师",
      role,
    },
    year: now.getFullYear(),
    students: demoStudents.map(
      ([studentId, studentNo, studentName, studentGrade], index) => ({
        student_id: studentId,
        student_no: studentNo,
        student_name: studentName,
        student_grade: studentGrade,
        mentor_name: role === "DEAN" && index >= 3 ? "周老师" : "龚老师",
        months: Array.from({ length: 12 }, (_, monthIndex) => {
          const month = monthIndex + 1;
          return {
            month,
            status: getDemoMonthStatus(index, month, currentMonth),
          };
        }),
      }),
    ),
  };
}
