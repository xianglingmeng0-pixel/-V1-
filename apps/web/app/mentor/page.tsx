import { TeacherWorkspace } from "../_components/teacher-workspace";
import { getTeacherDashboard } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function MentorPage() {
  return <TeacherWorkspace data={await getTeacherDashboard("MENTOR")} />;
}
