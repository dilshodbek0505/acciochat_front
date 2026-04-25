"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";
import { Rule } from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";

const ACTION_LABELS: Record<string, string> = {
  reply_comment: "Reply",
  send_dm: "DM",
  reply_comment_and_dm: "Reply + DM",
};

export default function RulesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/v1/accounts/${id}/rules/`)
      .then((res) => setRules(res.data))
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
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Rules</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Keyword-based automation rules for this account
          </p>
        </div>
        <Link href={`/dashboard/accounts/${id}/rules/new`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New rule
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Zap className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg mb-1">No rules yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first rule to start automating responses.
          </p>
          <Link href={`/dashboard/accounts/${id}/rules/new`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New rule
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rules
            .sort((a, b) => b.priority - a.priority)
            .map((rule) => (
              <div
                key={rule.id}
                className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-border/80 transition-colors"
              >
                <Switch
                  checked={rule.is_active}
                  onCheckedChange={() => toggleActive(rule)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{rule.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {rule.trigger_type === "comment" ? "Comment" : "DM"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {ACTION_LABELS[rule.response_action]}
                    </Badge>
                    {rule.priority > 0 && (
                      <Badge variant="outline" className="text-xs">
                        P{rule.priority}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {rule.keywords.slice(0, 5).map((kw) => (
                      <span
                        key={kw}
                        className="text-xs px-1.5 py-0.5 rounded bg-accent text-accent-foreground"
                      >
                        {kw}
                      </span>
                    ))}
                    {rule.keywords.length > 5 && (
                      <span className="text-xs text-muted-foreground">
                        +{rule.keywords.length - 5} more
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Updated {formatDistanceToNow(parseISO(rule.updated_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/accounts/${id}/rules/${rule.id}`)
                    }
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
