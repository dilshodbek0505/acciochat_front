"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageSquare, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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

const STATUS_COLORS: Record<string, string> = {
  received: "bg-info/20 text-info",
  matched: "bg-warning/20 text-warning",
  replied: "bg-green-500/20 text-green-400",
  failed: "bg-destructive/20 text-destructive",
  ignored: "bg-muted text-muted-foreground",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

const STATUSES: Array<LogStatus | ""> = [
  "",
  "received",
  "matched",
  "replied",
  "failed",
  "ignored",
];

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

  useEffect(() => {
    fetchLogs(true);
  }, [fetchLogs]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select
          value={status || "all"}
          onValueChange={(v) => setStatus(v === "all" ? "" : (v as LogStatus))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.filter(Boolean).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && logs.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>No comment logs found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="pb-2 font-medium">User</th>
                <th className="pb-2 font-medium">Comment</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Reply</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-accent/30 transition-colors">
                  <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">
                    @{log.commenter_username}
                  </td>
                  <td className="py-2.5 pr-3 max-w-xs truncate" title={log.comment_text}>
                    {log.comment_text}
                  </td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="py-2.5 pr-3 max-w-xs truncate text-muted-foreground" title={log.reply_text}>
                    {log.reply_text || "—"}
                  </td>
                  <td className="py-2.5 text-muted-foreground whitespace-nowrap text-xs">
                    {format(parseISO(log.created_at), "MMM d, HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {next && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" onClick={() => fetchLogs(false)} disabled={loading}>
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

  useEffect(() => {
    fetchLogs(true);
  }, [fetchLogs]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select
          value={status || "all"}
          onValueChange={(v) => setStatus(v === "all" ? "" : (v as LogStatus))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.filter(Boolean).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && logs.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Mail className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>No message logs found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="pb-2 font-medium">Sender</th>
                <th className="pb-2 font-medium">Direction</th>
                <th className="pb-2 font-medium">Message</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-accent/30 transition-colors">
                  <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">
                    {log.sender_ig_id}
                  </td>
                  <td className="py-2.5 pr-3">
                    <Badge variant={log.direction === "inbound" ? "outline" : "secondary"} className="text-xs">
                      {log.direction}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-3 max-w-xs truncate" title={log.message_text}>
                    {log.message_text}
                  </td>
                  <td className="py-2.5 pr-3">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="py-2.5 text-muted-foreground whitespace-nowrap text-xs">
                    {format(parseISO(log.created_at), "MMM d, HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {next && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" onClick={() => fetchLogs(false)} disabled={loading}>
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Activity Logs</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          Comments and DM activity processed by your rules
        </p>
      </div>

      <Tabs defaultValue="comments">
        <TabsList className="bg-muted">
          <TabsTrigger value="comments" className="gap-2">
            <MessageSquare className="h-3.5 w-3.5" /> Comments
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <Mail className="h-3.5 w-3.5" /> Messages
          </TabsTrigger>
        </TabsList>
        <TabsContent value="comments" className="mt-4">
          <CommentLogsTab accountId={id} />
        </TabsContent>
        <TabsContent value="messages" className="mt-4">
          <MessageLogsTab accountId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
