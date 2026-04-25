"use client";

import { useParams } from "next/navigation";
import RuleForm from "@/components/dashboard/RuleForm";

export default function NewRulePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">New Rule</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          Create a keyword-based automation rule
        </p>
      </div>
      <RuleForm accountId={id} />
    </div>
  );
}
