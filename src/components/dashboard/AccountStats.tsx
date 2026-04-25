"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MessageSquare,
  Mail,
  Zap,
  AlertCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { DashboardStats } from "@/types";
import { format, parseISO } from "date-fns";

const STAT_CARDS = [
  {
    key: "total_comments" as const,
    label: "Total comments",
    icon: MessageSquare,
    color: "text-primary",
  },
  {
    key: "total_messages" as const,
    label: "Total DMs",
    icon: Mail,
    color: "text-secondary",
  },
  {
    key: "matched_rules" as const,
    label: "Rules matched",
    icon: Zap,
    color: "text-yellow-400",
  },
  {
    key: "unanswered_comments" as const,
    label: "Unanswered comments",
    icon: AlertCircle,
    color: "text-destructive",
  },
];

export default function AccountStats({ accountId }: { accountId: string }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/v1/dashboard/${accountId}/stats/`, { params: { days: 30 } })
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const chartData = stats.activity_by_day.map((d) => ({
    ...d,
    date: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <Card key={key} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold">{stats[key].toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity chart */}
      {chartData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" /> Activity — last 30 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1A1A24",
                    border: "1px solid #2E2E42",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#F1F5F9",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "#94A3B8" }}
                />
                <Line
                  type="monotone"
                  dataKey="comments"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={false}
                  name="Comments"
                />
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={false}
                  name="Messages"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top keywords */}
      {stats.top_keywords.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Top Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.top_keywords.map(({ keyword, count }) => (
                <Badge key={keyword} variant="secondary" className="gap-1.5">
                  {keyword}
                  <span className="text-xs font-normal opacity-70">{count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
