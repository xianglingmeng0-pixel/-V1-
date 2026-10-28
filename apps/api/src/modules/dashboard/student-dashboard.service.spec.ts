import { describe, expect, it, vi } from "vitest";
import { StudentDashboardRepository } from "./student-dashboard.repository";
import { StudentDashboardService } from "./student-dashboard.service";

describe("StudentDashboardService", () => {
  it("maps the current report into the shared contract", async () => {
    const deadline = new Date(Date.now() + 2 * 86_400_000);
    const repository = {
      findUser: vi.fn().mockResolvedValue({
        id: 1,
        user_no: "20260001",
        name: "林晓雨",
        grade: "研二",
      }),
      findCurrentReport: vi.fn().mockResolvedValue({
        id: 7,
        title: "本月成果报告",
        deadline_at: deadline,
        grace_deadline_at: new Date(deadline.getTime() + 86_400_000),
        status: "PENDING",
        display_status: "PENDING",
        lock_version: 0,
        mentor_id: 2,
        mentor_name: "龚老师",
        professional_title: "副教授",
        research_direction: "机器学习",
        additional_teacher_count: 0,
      }),
      findTasks: vi.fn().mockResolvedValue([]),
      findAnnouncements: vi.fn().mockResolvedValue([]),
    } as unknown as StudentDashboardRepository;

    const service = new StudentDashboardService(repository);
    const result = await service.getDashboard(1);

    expect(result.current_report?.mentor.name).toBe("龚老师");
    expect(result.current_report?.days_remaining).toBeGreaterThanOrEqual(1);
  });
});
