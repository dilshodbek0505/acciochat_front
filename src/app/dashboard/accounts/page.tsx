"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Camera,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { IGAccount } from "@/types";
import { formatDistanceToNow, parseISO, isBefore, addDays } from "date-fns";

function daysUntil(isoDate: string) {
  const d = parseISO(isoDate);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function AccountCard({
  account,
  onDelete,
  onRefresh,
}: {
  account: IGAccount;
  onDelete: (id: string) => void;
  onRefresh: (id: string) => void;
}) {
  const daysLeft = daysUntil(account.token_expires_at);
  const tokenWarning = daysLeft <= 7;

  return (
    <Card className="bg-card border-border hover:border-primary/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <Link
                href={`/dashboard/accounts/${account.id}`}
                className="font-medium text-foreground hover:text-primary transition-colors truncate block"
              >
                @{account.username}
              </Link>
              <p className="text-xs text-muted-foreground capitalize">
                {account.account_type} account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={account.is_active ? "default" : "secondary"} className="text-xs">
              {account.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {account.webhook_subscribed ? (
            <span className="flex items-center gap-1 text-green-500">
              <Wifi className="h-3 w-3" /> Webhook active
            </span>
          ) : (
            <span className="flex items-center gap-1 text-destructive">
              <WifiOff className="h-3 w-3" /> Webhook inactive
            </span>
          )}

          {tokenWarning && (
            <span className="flex items-center gap-1 text-warning">
              <AlertTriangle className="h-3 w-3" />
              Token expires in {daysLeft}d
            </span>
          )}

          <span className="text-muted-foreground ml-auto">
            Connected {formatDistanceToNow(parseISO(account.connected_at), { addSuffix: true })}
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <Link href={`/dashboard/accounts/${account.id}/rules`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Manage rules
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRefresh(account.id)}
            title="Refresh token"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(account.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
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
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Instagram Accounts</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Connect and manage your Instagram business or creator accounts
          </p>
        </div>
        <Button onClick={connectInstagram} disabled={connecting} className="gap-2">
          {connecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Connect Instagram
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Camera className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg mb-1">No accounts connected</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Connect your Instagram Business or Creator account to start automating.
          </p>
          <Button onClick={connectInstagram} disabled={connecting} className="gap-2">
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Connect Instagram
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {accounts.map((account) => (
            <AccountCard
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
