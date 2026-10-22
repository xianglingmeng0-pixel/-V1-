import { ReportDetailPage } from "../../../_components/report-detail-page";
import { getTeacherDashboard, markSubmissionRead } from "../../../../lib/api";

export const dynamic = "force-dynamic";

export default async function DeanReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submissionId = Number.parseInt(id, 10);
  await markSubmissionRead(submissionId, "DEAN");
  return (
    <ReportDetailPage
      data={await getTeacherDashboard("DEAN")}
      submissionId={submissionId}
    />
  );
}
