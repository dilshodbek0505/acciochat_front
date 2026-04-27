"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import RuleForm from "@/components/dashboard/RuleForm";
import api from "@/lib/api";
import { Rule } from "@/types";

export default function EditRulePage() {
  const { id, rid } = useParams<{ id: string; rid: string }>();
  const router = useRouter();
  const [rule, setRule] = useState<Rule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/v1/accounts/${id}/rules/${rid}`)
      .then((res) => setRule(res.data))
      .catch(() => {
        toast.error("Rule not found");
        router.push(`/dashboard/accounts/${id}/rules`);
      })
      .finally(() => setLoading(false));
  }, [id, rid, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#0A84FF" }} />
      </div>
    );
  }

  if (!rule) return null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-semibold text-white" style={{ letterSpacing: "-0.018em" }}>
          Edit Rule
        </h2>
        <p className="text-[13px] mt-0.5" style={{ color: "rgba(235,235,245,0.42)" }}>
          {rule.name}
        </p>
      </div>
      <RuleForm accountId={id} rule={rule} />
    </div>
  );
}
