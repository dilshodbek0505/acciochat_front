"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Camera,
  Zap,
  ScrollText,
  Wifi,
  WifiOff,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AccountStats from "@/components/dashboard/AccountStats";
import api from "@/lib/api";
import { IGAccount } from "@/types";
import { format, parseISO } from "date-fns";

function daysUntil(isoDate: string) {
  const d = parseISO(isoDate);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [account, setAccount] = useState<IGAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/v1/accounts/${id}`)
      .then((res) => setAccount(res.data))
      .catch(() => {
        toast.error("Account not found");
        router.push("/dashboard/accounts");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!account) return null;

  const daysLeft = daysUntil(account.token_expires_at);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Camera className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">@{account.username}</h2>
          <p className="text-muted-foreground text-sm capitalize">{account.account_type} account</p>
        </div>
        <Badge variant={account.is_active ? "default" : "secondary"} className="ml-auto">
          {account.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            {account.webhook_subscribed ? (
              <>
                <Wifi className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Webhook Active</p>
                  <p className="text-xs text-muted-foreground">Receiving events</p>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">Webhook Inactive</p>
                  <p className="text-xs text-muted-foreground">Not receiving events</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            {daysLeft <= 7 ? (
              <AlertTriangle className="h-5 w-5 text-warning" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Token {daysLeft <= 7 ? "Expiring" : "Valid"}</p>
              <p className="text-xs text-muted-foreground">
                {daysLeft > 0
                  ? `${daysLeft} days left (${format(parseISO(account.token_expires_at), "MMM d, yyyy")})`
                  : "Expired"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href={`/dashboard/accounts/${id}/rules`}>
          <Card className="bg-card border-border hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Rules</p>
                  <p className="text-xs text-muted-foreground">Keyword automation rules</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/accounts/${id}/logs`}>
          <Card className="bg-card border-border hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ScrollText className="h-5 w-5 text-secondary" />
                <div>
                  <p className="font-medium">Logs</p>
                  <p className="text-xs text-muted-foreground">Comment & DM activity</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <AccountStats accountId={id} />
    </div>
  );
}
