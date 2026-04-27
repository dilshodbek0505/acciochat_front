"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import AuthProvider from "@/components/providers/AuthProvider";
import Topbar from "@/components/dashboard/Topbar";
import EmailBanner from "@/components/dashboard/EmailBanner";
import { Loader2 } from "lucide-react";

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login");
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#0A84FF" }} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Topbar />
      <EmailBanner />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardGuard>{children}</DashboardGuard>
    </AuthProvider>
  );
}
