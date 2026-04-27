"use client";

import { useParams } from "next/navigation";
import RuleForm from "@/components/dashboard/RuleForm";

export default function NewRulePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-semibold text-white" style={{ letterSpacing: "-0.018em" }}>
          New Rule
        </h2>
        <p className="text-[13px] mt-0.5" style={{ color: "rgba(235,235,245,0.42)" }}>
          Create a keyword-based automation rule
        </p>
      </div>
      <RuleForm accountId={id} />
    </div>
  );
}
