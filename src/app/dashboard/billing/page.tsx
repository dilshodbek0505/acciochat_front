"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  Zap,
  CreditCard,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      if (code === "no_subscription") {
        toast.error("No active subscription");
      } else {
        toast.error("Failed to open portal");
      }
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold">Billing</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage your subscription and billing
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Free plan */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Free</span>
              <span className="text-2xl font-bold">$0</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" disabled>
              Current plan
            </Button>
          </CardContent>
        </Card>

        {/* Pro plan */}
        <Card className="bg-card border-primary/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary" />
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                Pro <Zap className="h-4 w-4 text-primary" />
              </span>
              <div className="text-right">
                <span className="text-2xl font-bold">$19</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {hasSubscription ? (
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={openPortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" /> Manage subscription
                    <ExternalLink className="h-3 w-3" />
                  </>
                )}
              </Button>
            ) : (
              <Button className="w-full gap-2" onClick={goToCheckout} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="h-4 w-4" /> Upgrade to Pro
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {hasSubscription && (
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Pro subscription active</p>
              <p className="text-sm text-muted-foreground">
                Manage billing, invoices, and cancellation via the Stripe portal.
              </p>
            </div>
            <Button variant="outline" onClick={openPortal} disabled={portalLoading} className="gap-2">
              {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Open portal"}
            </Button>
          </CardContent>
        </Card>
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
