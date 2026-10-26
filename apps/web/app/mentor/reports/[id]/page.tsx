import { ReportDetailPage } from "../../../_components/report-detail-page";
import { getTeacherDashboard, markSubmissionRead } from "../../../../lib/api";

export const dynamicParams = false;

export function generateStaticParams() {
  return ["101", "102", "103"].map((id) => ({ id }));
}

export default async function MentorReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submissionId = Number.parseInt(id, 10);
  await markSubmissionRead(submissionId, "MENTOR");
  return (
    <ReportDetailPage
      data={await getTeacherDashboard("MENTOR")}
      submissionId={submissionId}
    />
  );
}
