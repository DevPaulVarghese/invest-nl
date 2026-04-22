import { EvaluateWizard } from "@/app/evaluate/evaluate-wizard";
import { Suspense } from "react";

export default function EvaluatePage() {
  return (
    <Suspense>
      <EvaluateWizard />
    </Suspense>
  );
}
