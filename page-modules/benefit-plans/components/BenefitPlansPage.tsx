import BenefitPlans from "@/components/BenefitPlans";
import { BenefitEligibilityData, BenefitPlan, ContributionStrategy } from "@/types";

interface Props {
  data: {
    eligibility: BenefitEligibilityData | null;
    strategies: ContributionStrategy[];
    plans: BenefitPlan[];
  };
}

export default function BenefitPlansPage({ data }: Props) {
  return <BenefitPlans eligibility={data.eligibility} strategies={data.strategies} plans={data.plans} />;
}
