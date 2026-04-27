"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Mail, Zap, AlertCircle, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import api from "@/lib/api";
import { DashboardStats } from "@/types";
import { format, parseISO } from "date-fns";

const METRICS = [
  { key: "total_comments" as const, label: "Comments", icon: MessageSquare, color: "#0A84FF" },
  { key: "total_messages" as const, label: "DMs", icon: Mail, color: "#32ADE6" },
  { key: "matched_rules" as const, label: "Rules matched", icon: Zap, color: "#32D74B" },
  { key: "unanswered_comments" as const, label: "Unanswered", icon: AlertCircle, color: "#FF453A" },
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
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#0A84FF" }} />
      </div>
    );
  }

  if (!stats) return null;

  const chartData = (stats.activity_by_day ?? []).map((d) => ({
    ...d,
    date: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {METRICS.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className="rounded-xl p-5 border"
            style={{
              background: "rgba(28,28,30,0.5)",
              borderColor: "rgba(84,84,88,0.28)",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${color}18` }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <p
              className="text-[28px] font-semibold text-white leading-none mb-1"
              style={{ letterSpacing: "-0.02em" }}
            >
              {(stats[key] ?? 0).toLocaleString()}
            </p>
            <p className="text-[12px]" style={{ color: "rgba(235,235,245,0.45)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      {chartData.length > 0 && (
        <div
          className="rounded-xl border p-5"
          style={{ background: "rgba(28,28,30,0.5)", borderColor: "rgba(84,84,88,0.28)" }}
        >
          <p
            className="text-[13px] font-medium text-white mb-4"
            style={{ letterSpacing: "-0.01em" }}
          >
            Activity — last 30 days
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(235,235,245,0.35)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(235,235,245,0.35)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(28,28,30,0.95)",
                  border: "1px solid rgba(84,84,88,0.5)",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "#F5F5F7",
                  backdropFilter: "blur(10px)",
                }}
                cursor={{ stroke: "rgba(235,235,245,0.1)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "rgba(235,235,245,0.45)", paddingTop: 12 }}
              />
              <Line
                type="monotone"
                dataKey="comments"
                stroke="#0A84FF"
                strokeWidth={1.5}
                dot={false}
                name="Comments"
              />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="#32D74B"
                strokeWidth={1.5}
                dot={false}
                name="Messages"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top keywords */}
      {(stats.top_keywords ?? []).length > 0 && (
        <div
          className="rounded-xl border p-5"
          style={{ background: "rgba(28,28,30,0.5)", borderColor: "rgba(84,84,88,0.28)" }}
        >
          <p
            className="text-[13px] font-medium text-white mb-3"
            style={{ letterSpacing: "-0.01em" }}
          >
            Top keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {(stats.top_keywords ?? []).map(({ keyword, count }) => (
              <div
                key={keyword}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]"
                style={{
                  background: "rgba(10,132,255,0.1)",
                  border: "1px solid rgba(10,132,255,0.2)",
                }}
              >
                <span className="text-white font-medium">{keyword}</span>
                <span style={{ color: "rgba(10,132,255,0.8)" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
