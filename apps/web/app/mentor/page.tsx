import { TeacherWorkspace } from "../_components/teacher-workspace";
import { getTeacherDashboard } from "../../lib/api";

export default async function MentorPage() {
  return <TeacherWorkspace data={await getTeacherDashboard("MENTOR")} />;
}
