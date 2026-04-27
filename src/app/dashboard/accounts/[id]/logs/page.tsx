"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageSquare, Mail } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { CommentLog, MessageLog, LogStatus } from "@/types";
import { format, parseISO } from "date-fns";

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  received: { bg: "rgba(10,132,255,0.12)", color: "#0A84FF" },
  matched: { bg: "rgba(255,159,10,0.12)", color: "#FF9F0A" },
  replied: { bg: "rgba(50,215,75,0.12)", color: "#32D74B" },
  failed: { bg: "rgba(255,69,58,0.12)", color: "#FF453A" },
  ignored: { bg: "rgba(84,84,88,0.3)", color: "rgba(235,235,245,0.45)" },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.ignored;
  return (
    <span
      className="inline-block text-[11px] px-2 py-0.5 rounded-md font-medium capitalize"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {status}
    </span>
  );
}

const STATUSES: Array<LogStatus | ""> = ["", "received", "matched", "replied", "failed", "ignored"];

const TABLE_HEAD = "text-[11px] font-medium uppercase tracking-wide pb-3 text-left";
const TABLE_CELL = "py-3 pr-4 text-[13px] align-top";

function CommentLogsTab({ accountId }: { accountId: string }) {
  const [logs, setLogs] = useState<CommentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<LogStatus | "">("");
  const [next, setNext] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const res = await api.get(`/api/v1/accounts/${accountId}/logs/comment-logs`, {
          params: status ? { status } : {},
        });
        const data = res.data;
        setLogs(reset ? data.results : (prev) => [...prev, ...data.results]);
        setNext(data.next);
      } catch {
        toast.error("Failed to load comment logs");
      } finally {
        setLoading(false);
      }
    },
    [accountId, status]
  );

  useEffect(() => { fetchLogs(true); }, [fetchLogs]);

  return (
    <div className="space-y-4">
      <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : (v as LogStatus))}>
        <SelectTrigger className="w-[160px] h-9 text-[13px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUSES.filter(Boolean).map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {loading && logs.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#0A84FF" }} />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20 text-white" />
          <p className="text-[14px]" style={{ color: "rgba(235,235,245,0.4)" }}>No comment logs found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(84,84,88,0.3)" }}>
                <th className={TABLE_HEAD} style={{ color: "rgba(235,235,245,0.35)" }}>User</th>
                <th className={TABLE_HEAD} style={{ color: "rgba(235,235,245,0.35)" }}>Comment</th>
                <th className={TABLE_HEAD} style={{ color: "rgba(235,235,245,0.35)" }}>Status</th>
                <th className={TABLE_HEAD} style={{ color: "rgba(235,235,245,0.35)" }}>Reply sent</th>
                <th className={TABLE_HEAD} style={{ color: "rgba(235,235,245,0.35)" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  style={{ borderBottom: "1px solid rgba(84,84,88,0.15)" }}
                >
                  <td className={TABLE_HEAD + " " + TABLE_CELL} style={{ color: "rgba(235,235,245,0.55)", fontWeight: 400 }}>
                    @{log.commenter_username}
                  </td>
                  <td
                    className={TABLE_CELL + " max-w-[220px] truncate"}
                    style={{ color: "rgba(235,235,245,0.75)" }}
                    title={log.comment_text}
                  >
                    {log.comment_text}
                  </td>
                  <td className={TABLE_CELL}>
                    <StatusPill status={log.status} />
                  </td>
                  <td
                    className={TABLE_CELL + " max-w-[180px] truncate"}
                    style={{ color: "rgba(235,235,245,0.45)" }}
                    title={log.reply_text}
                  >
                    {log.reply_text || "—"}
                  </td>
                  <td className={TABLE_CELL} style={{ color: "rgba(235,235,245,0.35)", whiteSpace: "nowrap" }}>
                    {format(parseISO(log.created_at), "MMM d, HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {next && (
            <div className="flex justify-center mt-5">
              <Button variant="outline" size="sm" onClick={() => fetchLogs(false)} disabled={loading}
                className="text-[13px] h-9 rounded-xl">
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Load more"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageLogsTab({ accountId }: { accountId: string }) {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<LogStatus | "">("");
  const [next, setNext] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const res = await api.get(`/api/v1/accounts/${accountId}/logs/message-logs`, {
          params: status ? { status } : {},
        });
        const data = res.data;
        setLogs(reset ? data.results : (prev) => [...prev, ...data.results]);
        setNext(data.next);
      } catch {
        toast.error("Failed to load message logs");
      } finally {
        setLoading(false);
      }
    },
    [accountId, status]
  );

  useEffect(() => { fetchLogs(true); }, [fetchLogs]);

  return (
    <div className="space-y-4">
      <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : (v as LogStatus))}>
        <SelectTrigger className="w-[160px] h-9 text-[13px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUSES.filter(Boolean).map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {loading && logs.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#0A84FF" }} />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16">
          <Mail className="h-10 w-10 mx-auto mb-3 opacity-20 text-white" />
          <p className="text-[14px]" style={{ color: "rgba(235,235,245,0.4)" }}>No message logs found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(84,84,88,0.3)" }}>
                <th className={TABLE_HEAD} style={{ color: "rgba(235,235,245,0.35)" }}>Sender</th>
                <th className={TABLE_HEAD} style={{ color: "rgba(235,235,245,0.35)" }}>Dir</th>
                <th className={TABLE_HEAD} style={{ color: "rgba(235,235,245,0.35)" }}>Message</th>
                <th className={TABLE_HEAD} style={{ color: "rgba(235,235,245,0.35)" }}>Status</th>
                <th className={TABLE_HEAD} style={{ color: "rgba(235,235,245,0.35)" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid rgba(84,84,88,0.15)" }}>
                  <td className={TABLE_CELL} style={{ color: "rgba(235,235,245,0.55)", whiteSpace: "nowrap" }}>
                    {log.sender_ig_id}
                  </td>
                  <td className={TABLE_CELL}>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                      style={
                        log.direction === "inbound"
                          ? { background: "rgba(10,132,255,0.1)", color: "#0A84FF" }
                          : { background: "rgba(84,84,88,0.3)", color: "rgba(235,235,245,0.55)" }
                      }
                    >
                      {log.direction}
                    </span>
                  </td>
                  <td
                    className={TABLE_CELL + " max-w-[220px] truncate"}
                    style={{ color: "rgba(235,235,245,0.75)" }}
                    title={log.message_text}
                  >
                    {log.message_text}
                  </td>
                  <td className={TABLE_CELL}>
                    <StatusPill status={log.status} />
                  </td>
                  <td className={TABLE_CELL} style={{ color: "rgba(235,235,245,0.35)", whiteSpace: "nowrap" }}>
                    {format(parseISO(log.created_at), "MMM d, HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {next && (
            <div className="flex justify-center mt-5">
              <Button variant="outline" size="sm" onClick={() => fetchLogs(false)} disabled={loading}
                className="text-[13px] h-9 rounded-xl">
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Load more"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LogsPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<"comments" | "messages">("comments");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-semibold text-white" style={{ letterSpacing: "-0.018em" }}>
            Activity Logs
          </h2>
          <p className="text-[13px] mt-0.5" style={{ color: "rgba(235,235,245,0.42)" }}>
            Comments and DMs processed by your rules
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div
        className="flex items-center gap-0.5 p-1 rounded-xl mb-6 w-fit"
        style={{ background: "rgba(28,28,30,0.7)", border: "1px solid rgba(84,84,88,0.3)" }}
      >
        {([
          { key: "comments", label: "Comments", icon: MessageSquare },
          { key: "messages", label: "Messages", icon: Mail },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-100"
            style={
              tab === key
                ? { background: "rgba(84,84,88,0.5)", color: "#F5F5F7" }
                : { color: "rgba(235,235,245,0.45)" }
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "comments" ? (
        <CommentLogsTab accountId={id} />
      ) : (
        <MessageLogsTab accountId={id} />
      )}
    </div>
  );
}
