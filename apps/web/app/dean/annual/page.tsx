import { AnnualProgressTable } from "../../_components/annual-progress-table";
import { getAnnualProgress } from "../../../lib/api";

export const dynamic = "force-dynamic";

export default async function DeanAnnualPage() {
  return <AnnualProgressTable data={await getAnnualProgress("DEAN")} />;
}
