import {
  annualProgressResponseSchema,
  AnnualProgress,
  StudentDashboard,
  studentDashboardResponseSchema,
  TeacherDashboard,
  teacherDashboardResponseSchema,
} from "@yanji/contracts";
import {
  createDemoAnnualProgress,
  createDemoStudentDashboard,
  createDemoTeacherDashboard,
} from "./demo-data";

const apiUrl = process.env.API_INTERNAL_URL ?? "http://localhost:3001/api/v1";
const staticDemoMode =
  process.env.DEMO_STATIC_MODE === "true" ||
  process.env.EDGEONE_STATIC_EXPORT === "true" ||
  process.env.VERCEL === "1";

export async function getStudentDashboard(): Promise<StudentDashboard> {
  if (staticDemoMode) return createDemoStudentDashboard();
  try {
    const response = await fetch(`${apiUrl}/dashboards/student`, {
      headers: { "x-demo-user-id": process.env.DEMO_STUDENT_ID ?? "1" },
      cache: "no-store",
    });

    if (!response.ok) return createDemoStudentDashboard();

    const parsed = studentDashboardResponseSchema.safeParse(
      await response.json(),
    );
    return parsed.success ? parsed.data.data : createDemoStudentDashboard();
  } catch {
    return createDemoStudentDashboard();
  }
}

export async function getTeacherDashboard(
  role: "MENTOR" | "DEAN",
): Promise<TeacherDashboard> {
  if (staticDemoMode) return createDemoTeacherDashboard(role);
  try {
    const userId = role === "DEAN" ? "4" : "2";
    const response = await fetch(`${apiUrl}/dashboards/teacher?role=${role}`, {
      headers: { "x-demo-user-id": userId },
      cache: "no-store",
    });
    if (!response.ok) return createDemoTeacherDashboard(role);
    const parsed = teacherDashboardResponseSchema.safeParse(
      await response.json(),
    );
    return parsed.success ? parsed.data.data : createDemoTeacherDashboard(role);
  } catch {
    return createDemoTeacherDashboard(role);
  }
}

export async function getAnnualProgress(
  role: "MENTOR" | "DEAN",
): Promise<AnnualProgress> {
  if (staticDemoMode) return createDemoAnnualProgress(role);
  try {
    const userId = role === "DEAN" ? "4" : "2";
    const response = await fetch(
      `${apiUrl}/dashboards/teacher/annual?role=${role}`,
      {
        headers: { "x-demo-user-id": userId },
        cache: "no-store",
      },
    );
    if (!response.ok) return createDemoAnnualProgress(role);
    const parsed = annualProgressResponseSchema.safeParse(
      await response.json(),
    );
    return parsed.success ? parsed.data.data : createDemoAnnualProgress(role);
  } catch {
    return createDemoAnnualProgress(role);
  }
}

export async function markSubmissionRead(
  submissionId: number,
  role: "MENTOR" | "DEAN",
): Promise<void> {
  if (staticDemoMode) return;
  try {
    await fetch(`${apiUrl}/submissions/${submissionId}/read?role=${role}`, {
      method: "POST",
      headers: { "x-demo-user-id": role === "DEAN" ? "4" : "2" },
      cache: "no-store",
    });
  } catch {
    // The web demonstration remains usable when the local API is offline.
  }
}
