import CompanyDetails from "@/components/CompanyDetails";
import { CompanyData } from "@/types";

export default function CompanyDetailsPage({ data }: { data: CompanyData | null }) {
  return <CompanyDetails data={data} />;
}
