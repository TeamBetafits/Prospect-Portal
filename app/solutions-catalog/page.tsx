"use client";

import SolutionsCatalog from "@/components/SolutionsCatalog";
import { Solution } from "@/types";

export default function SolutionsCatalogPage() {
  const handleSelectSolution = (solution: Solution) => {
    // Handle solution selection
    console.log("Selected:", solution);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <SolutionsCatalog onSelectSolution={handleSelectSolution} />
    </div>
  );
}
