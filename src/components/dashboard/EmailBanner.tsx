"use client";

import { useState } from "react";
import { MailWarning, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
      toast.error("Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center gap-3 px-6 py-2.5 border-b"
      style={{
        background: "rgba(255,159,10,0.08)",
        borderColor: "rgba(255,159,10,0.2)",
      }}
    >
      <MailWarning className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#FF9F0A" }} />
      <p className="text-[13px] flex-1" style={{ color: "rgba(235,235,245,0.7)" }}>
        Please verify your email address to unlock all features.
      </p>
      <button
        onClick={resend}
        disabled={loading}
        className="text-[12px] font-medium px-3 py-1 rounded-lg transition-all flex items-center gap-1.5"
        style={{ color: "#FF9F0A", background: "rgba(255,159,10,0.1)" }}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Resend email"}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-md transition-all"
        style={{ color: "rgba(235,235,245,0.4)" }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
