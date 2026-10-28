import { HistoricalReportDetail } from "../../../_components/historical-report-detail";
import { demoStudents } from "../../../../lib/demo-data";

export const dynamicParams = false;

export function generateStaticParams() {
  const year = new Date().getFullYear();
  return demoStudents.flatMap(([studentId]) =>
    Array.from({ length: 12 }, (_, index) => ({
      reportKey: `${studentId}-${year}-${index + 1}`,
    })),
  );
}

export default async function DeanHistoricalReportPage({
  params,
}: {
  params: Promise<{ reportKey: string }>;
}) {
  const { reportKey } = await params;
  return <HistoricalReportDetail reportKey={reportKey} viewerRole="DEAN" />;
}
