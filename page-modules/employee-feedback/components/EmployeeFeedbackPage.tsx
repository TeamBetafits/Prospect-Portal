import EmployeeFeedback from "@/components/EmployeeFeedback";
import { FeedbackResponse, FeedbackStats } from "@/types";

export default function EmployeeFeedbackPage({ data }: { data: { stats: FeedbackStats | null; responses: FeedbackResponse[] } }) {
  return <EmployeeFeedback stats={data.stats} responses={data.responses} />;
}
