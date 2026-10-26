import { TeacherWorkspace } from "../_components/teacher-workspace";
import { getTeacherDashboard } from "../../lib/api";

export default async function DeanPage() {
  return <TeacherWorkspace data={await getTeacherDashboard("DEAN")} />;
}
