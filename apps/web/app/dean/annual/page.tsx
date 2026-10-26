import { AnnualProgressTable } from "../../_components/annual-progress-table";
import { getAnnualProgress } from "../../../lib/api";

export default async function DeanAnnualPage() {
  return <AnnualProgressTable data={await getAnnualProgress("DEAN")} />;
}
