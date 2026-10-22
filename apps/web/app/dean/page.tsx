import { TeacherWorkspace } from "../_components/teacher-workspace";
import { getTeacherDashboard } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function DeanPage() {
  return <TeacherWorkspace data={await getTeacherDashboard("DEAN")} />;
}
