"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";
import { IGAccount } from "@/types";
import { parseISO } from "date-fns";

function daysUntil(iso: string) {
  return Math.ceil((parseISO(iso).getTime() - Date.now()) / 864e5);
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const [account, setAccount] = useState<IGAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/v1/accounts/${id}`)
      .then((r) => setAccount(r.data))
      .catch(() => {
        toast.error("Account not found");
        router.push("/dashboard/accounts");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const tabs = [
    { label: "Overview", href: `/dashboard/accounts/${id}`, exact: true },
    { label: "Rules", href: `/dashboard/accounts/${id}/rules`, exact: false },
    { label: "Logs", href: `/dashboard/accounts/${id}/logs`, exact: false },
  ];

  const daysLeft = account ? daysUntil(account.token_expires_at) : null;

  return (
    <div>
      {/* Account header */}
      <div className="border-b" style={{ borderColor: "rgba(84,84,88,0.3)" }}>
        <div className="max-w-5xl mx-auto px-8">
          <div className="pt-5 pb-1">
            <Link
              href="/dashboard/accounts"
              className="text-[12px] transition-colors inline-flex items-center gap-1"
              style={{ color: "rgba(235,235,245,0.35)" }}
            >
              ← All accounts
            </Link>
          </div>

          <div className="flex items-center gap-3 py-3">
            <div
              className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: "rgba(10,132,255,0.12)" }}
            >
              <Camera className="h-[18px] w-[18px]" style={{ color: "#0A84FF" }} />
            </div>

            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: "rgba(235,235,245,0.3)" }} />
            ) : account ? (
              <>
                <div>
                  <h1
                    className="text-[18px] font-semibold text-white"
                    style={{ letterSpacing: "-0.018em" }}
                  >
                    @{account.username}
                  </h1>
                  <p className="text-[12px] capitalize" style={{ color: "rgba(235,235,245,0.4)" }}>
                    {account.account_type} account
                  </p>
                </div>

                <div className="flex items-center gap-3 ml-1 flex-wrap">
                  {account.is_active ? (
                    <span className="flex items-center gap-1.5 text-[12px]" style={{ color: "#32D74B" }}>
                      <span className="w-[6px] h-[6px] rounded-full bg-[#32D74B]" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[12px]" style={{ color: "rgba(235,235,245,0.4)" }}>
                      <span className="w-[6px] h-[6px] rounded-full" style={{ background: "rgba(235,235,245,0.25)" }} />
                      Inactive
                    </span>
                  )}

                  {account.webhook_subscribed ? (
                    <span className="flex items-center gap-1 text-[12px]" style={{ color: "rgba(235,235,245,0.4)" }}>
                      <Wifi className="h-3 w-3" /> Webhook on
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[12px]" style={{ color: "#FF453A" }}>
                      <WifiOff className="h-3 w-3" /> No webhook
                    </span>
                  )}

                  {daysLeft !== null && daysLeft <= 7 && (
                    <span className="flex items-center gap-1 text-[12px]" style={{ color: "#FF9F0A" }}>
                      <AlertTriangle className="h-3 w-3" /> Token {daysLeft}d left
                    </span>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Tabs */}
          <nav className="flex -mb-px">
            {tabs.map(({ label, href, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all duration-100 -mb-px",
                    active
                      ? "text-white border-[#0A84FF]"
                      : "text-[rgba(235,235,245,0.42)] border-transparent hover:text-[rgba(235,235,245,0.72)]"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        {children}
      </div>
    </div>
  );
}
