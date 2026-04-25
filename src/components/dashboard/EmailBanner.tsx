"use client";

import { useState } from "react";
import { MailWarning, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function EmailBanner() {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user || user.is_email_verified || dismissed) return null;

  const resend = async () => {
    setLoading(true);
    try {
      await api.post("/api/v1/auth/resend-verification");
      toast.success("Verification email sent!");
    } catch {
      toast.error("Failed to resend email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 flex items-center gap-3">
      <MailWarning className="h-4 w-4 text-warning flex-shrink-0" />
      <p className="text-sm text-warning flex-1">
        Please verify your email address to unlock all features.
      </p>
      <Button size="sm" variant="outline" onClick={resend} disabled={loading}>
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Resend email"}
      </Button>
      <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
