"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Zap, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";
import { Rule } from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";

const ACTION_LABELS: Record<string, string> = {
  reply_comment: "Reply",
  send_dm: "DM",
  reply_comment_and_dm: "Reply + DM",
};

const TRIGGER_LABELS: Record<string, string> = {
  comment: "Comment",
  dm: "DM",
};

export default function RulesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/v1/accounts/${id}/rules/`)
      .then((res) => setRules(res.data.results ?? res.data))
      .catch(() => toast.error("Failed to load rules"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleActive = async (rule: Rule) => {
    try {
      const res = await api.patch(`/api/v1/accounts/${id}/rules/${rule.id}`, {
        is_active: !rule.is_active,
      });
      setRules((prev) => prev.map((r) => (r.id === rule.id ? res.data : r)));
    } catch {
      toast.error("Failed to update rule");
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm("Delete this rule?")) return;
    try {
      await api.delete(`/api/v1/accounts/${id}/rules/${ruleId}`);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      toast.success("Rule deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-semibold text-white" style={{ letterSpacing: "-0.018em" }}>
            Rules
          </h2>
          <p className="text-[13px] mt-0.5" style={{ color: "rgba(235,235,245,0.42)" }}>
            Keyword-based automation for this account
          </p>
        </div>
        <Link href={`/dashboard/accounts/${id}/rules/new`}>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium text-white transition-all"
            style={{ background: "#0A84FF" }}
          >
            <Plus className="h-3.5 w-3.5" /> New rule
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#0A84FF" }} />
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: "rgba(10,132,255,0.1)" }}
          >
            <Zap className="h-7 w-7" style={{ color: "#0A84FF" }} />
          </div>
          <p className="text-[17px] font-medium text-white mb-2" style={{ letterSpacing: "-0.015em" }}>
            No rules yet
          </p>
          <p className="text-[13px] mb-6" style={{ color: "rgba(235,235,245,0.45)" }}>
            Create your first rule to start automating responses.
          </p>
          <Link href={`/dashboard/accounts/${id}/rules/new`}>
            <button
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[14px] font-medium text-white"
              style={{ background: "#0A84FF" }}
            >
              <Plus className="h-4 w-4" /> Create rule
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rules
            .sort((a, b) => b.priority - a.priority)
            .map((rule) => (
              <div
                key={rule.id}
                className="flex items-center gap-4 p-4 rounded-xl border transition-all"
                style={{
                  background: "rgba(28,28,30,0.45)",
                  borderColor: rule.is_active ? "rgba(84,84,88,0.3)" : "rgba(84,84,88,0.18)",
                  opacity: rule.is_active ? 1 : 0.65,
                }}
              >
                {/* Toggle */}
                <Switch
                  checked={rule.is_active}
                  onCheckedChange={() => toggleActive(rule)}
                  className="flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-medium text-white">{rule.name}</span>

                    <span
                      className="text-[11px] px-1.5 py-0.5 rounded font-medium"
                      style={{ background: "rgba(84,84,88,0.35)", color: "rgba(235,235,245,0.65)" }}
                    >
                      {TRIGGER_LABELS[rule.trigger_type]}
                    </span>

                    <span
                      className="text-[11px] px-1.5 py-0.5 rounded font-medium"
                      style={{ background: "rgba(10,132,255,0.15)", color: "#0A84FF" }}
                    >
                      {ACTION_LABELS[rule.response_action]}
                    </span>

                    {rule.priority > 0 && (
                      <span
                        className="text-[11px] px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(255,159,10,0.12)", color: "#FF9F0A" }}
                      >
                        P{rule.priority}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {rule.keywords.slice(0, 5).map((kw) => (
                      <span
                        key={kw}
                        className="text-[11px] px-2 py-0.5 rounded-md"
                        style={{
                          background: "rgba(58,58,60,0.6)",
                          color: "rgba(235,235,245,0.65)",
                          border: "1px solid rgba(84,84,88,0.3)",
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                    {rule.keywords.length > 5 && (
                      <span className="text-[11px]" style={{ color: "rgba(235,235,245,0.38)" }}>
                        +{rule.keywords.length - 5} more
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] mt-1" style={{ color: "rgba(235,235,245,0.3)" }}>
                    Updated {formatDistanceToNow(parseISO(rule.updated_at), { addSuffix: true })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/dashboard/accounts/${id}/rules/${rule.id}`)}
                    className="p-2 rounded-lg transition-all"
                    style={{ color: "rgba(235,235,245,0.42)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(235,235,245,0.85)";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(235,235,245,0.42)";
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 rounded-lg transition-all"
                    style={{ color: "rgba(235,235,245,0.42)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "#FF453A";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,69,58,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(235,235,245,0.42)";
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
