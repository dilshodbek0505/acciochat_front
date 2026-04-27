"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, Zap, CreditCard, Loader2, ExternalLink } from "lucide-react";
import api from "@/lib/api";

const FREE_FEATURES = [
  "1 Instagram account",
  "Up to 5 automation rules",
  "Comment & DM automation",
  "Activity logs (7 days)",
];

const PRO_FEATURES = [
  "Unlimited Instagram accounts",
  "Unlimited automation rules",
  "Comment & DM automation",
  "Activity logs (90 days)",
  "Priority support",
  "Advanced analytics",
];

function BillingContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    const session = searchParams.get("session");
    if (session === "success") {
      toast.success("Pro subscription activated!");
      setHasSubscription(true);
    } else if (session === "canceled") {
      toast.info("Checkout canceled");
    }
  }, [searchParams]);

  const goToCheckout = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/v1/billing/checkout/");
      window.location.href = res.data.checkout_url;
    } catch {
      toast.error("Failed to start checkout");
      setLoading(false);
    }
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await api.post("/api/v1/billing/portal/");
      window.location.href = res.data.portal_url;
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })
        ?.response?.data?.error?.code;
      toast.error(code === "no_subscription" ? "No active subscription" : "Failed to open portal");
      setPortalLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h2 className="text-[22px] font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>
          Billing
        </h2>
        <p className="text-[13px] mt-1" style={{ color: "rgba(235,235,245,0.45)" }}>
          Manage your subscription and billing
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Free */}
        <div
          className="rounded-2xl p-6 space-y-5 border"
          style={{ background: "rgba(28,28,30,0.5)", borderColor: "rgba(84,84,88,0.3)" }}
        >
          <div>
            <p className="text-[13px] font-medium" style={{ color: "rgba(235,235,245,0.45)" }}>Free</p>
            <p className="text-[2rem] font-semibold mt-1 text-white" style={{ letterSpacing: "-0.02em" }}>
              $0
              <span className="text-[14px] font-normal ml-1" style={{ color: "rgba(235,235,245,0.38)" }}>/ month</span>
            </p>
          </div>
          <ul className="space-y-2.5">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[13px]" style={{ color: "rgba(235,235,245,0.6)" }}>
                <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#32D74B" }} />
                {f}
              </li>
            ))}
          </ul>
          <button
            disabled
            className="w-full py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed"
            style={{ background: "rgba(84,84,88,0.2)", color: "rgba(235,235,245,0.35)" }}
          >
            Current plan
          </button>
        </div>

        {/* Pro */}
        <div
          className="rounded-2xl p-6 space-y-5 relative overflow-hidden border"
          style={{ background: "rgba(28,28,30,0.5)", borderColor: "rgba(10,132,255,0.35)" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(10,132,255,0.6), transparent)" }}
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium" style={{ color: "rgba(235,235,245,0.45)" }}>Pro</p>
              <Zap className="h-3.5 w-3.5" style={{ color: "#0A84FF" }} />
            </div>
            <p className="text-[2rem] font-semibold mt-1 text-white" style={{ letterSpacing: "-0.02em" }}>
              $19
              <span className="text-[14px] font-normal ml-1" style={{ color: "rgba(235,235,245,0.38)" }}>/ month</span>
            </p>
          </div>
          <ul className="space-y-2.5">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[13px] text-white">
                <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#0A84FF" }} />
                {f}
              </li>
            ))}
          </ul>

          {hasSubscription ? (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="w-full py-2.5 rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 transition-all border"
              style={{ color: "rgba(235,235,245,0.75)", borderColor: "rgba(84,84,88,0.45)" }}
            >
              {portalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-4 w-4" /> Manage subscription
                  <ExternalLink className="h-3 w-3" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={goToCheckout}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-[14px] font-medium text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: loading ? "rgba(10,132,255,0.5)" : "#0A84FF" }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <><Zap className="h-4 w-4" /> Upgrade to Pro</>
              )}
            </button>
          )}
        </div>
      </div>

      {hasSubscription && (
        <div
          className="mt-4 rounded-2xl p-4 flex items-center justify-between border"
          style={{ background: "rgba(28,28,30,0.5)", borderColor: "rgba(84,84,88,0.3)" }}
        >
          <div>
            <p className="text-[14px] font-medium text-white">Pro subscription active</p>
            <p className="text-[12px] mt-0.5" style={{ color: "rgba(235,235,245,0.45)" }}>
              Manage billing, invoices, and cancellation via Stripe.
            </p>
          </div>
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="text-[13px] font-medium px-4 py-2 rounded-xl transition-all flex-shrink-0"
            style={{ color: "#0A84FF", background: "rgba(10,132,255,0.1)" }}
          >
            {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Open portal"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  );
}
