"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Plus, Trash2, RefreshCw, AlertTriangle, Wifi, WifiOff, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { IGAccount } from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";

function daysUntil(iso: string) {
  return Math.ceil((parseISO(iso).getTime() - Date.now()) / 864e5);
}

function AccountRow({
  account,
  onDelete,
  onRefresh,
}: {
  account: IGAccount;
  onDelete: (id: string) => void;
  onRefresh: (id: string) => void;
}) {
  const router = useRouter();
  const daysLeft = daysUntil(account.token_expires_at);
  const tokenWarn = daysLeft <= 7;

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-100 cursor-pointer group"
      style={{
        background: "rgba(28,28,30,0.4)",
        borderColor: "rgba(84,84,88,0.28)",
      }}
      onClick={() => router.push(`/dashboard/accounts/${account.id}`)}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(84,84,88,0.55)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(84,84,88,0.28)")
      }
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(10,132,255,0.1)" }}
      >
        <Camera className="h-5 w-5" style={{ color: "#0A84FF" }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[15px] font-medium text-white">@{account.username}</span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={
              account.is_active
                ? { background: "rgba(50,215,75,0.12)", color: "#32D74B" }
                : { background: "rgba(235,235,245,0.07)", color: "rgba(235,235,245,0.45)" }
            }
          >
            {account.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-[12px] capitalize" style={{ color: "rgba(235,235,245,0.4)" }}>
            {account.account_type} · Connected {formatDistanceToNow(parseISO(account.connected_at), { addSuffix: true })}
          </span>

          {account.webhook_subscribed ? (
            <span className="flex items-center gap-1 text-[12px]" style={{ color: "rgba(235,235,245,0.4)" }}>
              <Wifi className="h-3 w-3" /> Webhook
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[12px]" style={{ color: "#FF453A" }}>
              <WifiOff className="h-3 w-3" /> No webhook
            </span>
          )}

          {tokenWarn && (
            <span className="flex items-center gap-1 text-[12px]" style={{ color: "#FF9F0A" }}>
              <AlertTriangle className="h-3 w-3" /> Token: {daysLeft}d left
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onRefresh(account.id)}
          title="Refresh token"
          className="p-2 rounded-lg transition-all"
          style={{ color: "rgba(235,235,245,0.45)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(235,235,245,0.85)";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(235,235,245,0.45)";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(account.id)}
          title="Disconnect"
          className="p-2 rounded-lg transition-all"
          style={{ color: "rgba(235,235,245,0.45)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#FF453A";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,69,58,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(235,235,245,0.45)";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function AccountsContent() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<IGAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/accounts/");
      setAccounts(res.data.results ?? res.data);
    } catch {
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const reason = searchParams.get("reason");
    if (connected === "success") {
      toast.success("Instagram account connected!");
      fetchAccounts();
    } else if (connected === "error") {
      const messages: Record<string, string> = {
        oauth_denied: "You denied access",
        oauth_state_invalid: "Session expired, try again",
        user_not_found: "User not found",
        token_exchange_failed: "Token exchange failed",
        account_already_connected: "This account is already connected",
      };
      toast.error(messages[reason ?? ""] ?? "Failed to connect Instagram");
    }
  }, [searchParams, fetchAccounts]);

  const connectInstagram = async () => {
    setConnecting(true);
    try {
      const res = await api.get("/api/v1/oauth/instagram/start");
      window.location.href = res.data.auth_url;
    } catch {
      toast.error("Failed to start Instagram OAuth");
      setConnecting(false);
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("Disconnect this Instagram account?")) return;
    try {
      await api.delete(`/api/v1/accounts/${id}`);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      toast.success("Account disconnected");
    } catch {
      toast.error("Failed to disconnect");
    }
  };

  const refreshToken = async (id: string) => {
    try {
      await api.post(`/api/v1/accounts/${id}/refresh-token`);
      toast.success("Token refresh queued");
    } catch {
      toast.error("Failed to queue refresh");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2
            className="text-[22px] font-semibold text-white"
            style={{ letterSpacing: "-0.02em" }}
          >
            Instagram Accounts
          </h2>
          <p className="text-[13px] mt-1" style={{ color: "rgba(235,235,245,0.45)" }}>
            {accounts.length > 0
              ? `${accounts.length} account${accounts.length > 1 ? "s" : ""} connected`
              : "Connect your Instagram Business or Creator account"}
          </p>
        </div>

        <button
          onClick={connectInstagram}
          disabled={connecting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium text-white transition-all duration-150 flex-shrink-0"
          style={{ background: connecting ? "rgba(10,132,255,0.5)" : "#0A84FF" }}
        >
          {connecting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Connect
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#0A84FF" }} />
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: "rgba(10,132,255,0.1)" }}
          >
            <Camera className="h-7 w-7" style={{ color: "#0A84FF" }} />
          </div>
          <p className="text-[17px] font-medium text-white mb-2" style={{ letterSpacing: "-0.015em" }}>
            No accounts connected
          </p>
          <p className="text-[13px] mb-6 max-w-xs" style={{ color: "rgba(235,235,245,0.45)" }}>
            Connect your Instagram Business or Creator account to start automating replies.
          </p>
          <button
            onClick={connectInstagram}
            disabled={connecting}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[14px] font-medium text-white transition-all"
            style={{ background: "#0A84FF" }}
          >
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Connect Instagram
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              onDelete={deleteAccount}
              onRefresh={refreshToken}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense>
      <AccountsContent />
    </Suspense>
  );
}
