"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

const NAV = [
  { href: "/dashboard/accounts", label: "Accounts" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      await api.post("/api/v1/auth/logout", { refresh });
    } catch {}
    logout();
    router.push("/auth/login");
    toast.success("Signed out");
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user?.email?.slice(0, 2).toUpperCase() ?? "??");

  return (
    <header
      className="sticky top-0 z-50 h-[52px] flex items-center gap-5 px-6 border-b"
      style={{
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderColor: "rgba(84,84,88,0.4)",
      }}
    >
      <Link
        href="/dashboard/accounts"
        className="text-[15px] font-semibold tracking-[-0.02em] text-white flex-shrink-0 mr-2"
      >
        AccioChat
      </Link>

      <nav className="flex items-center gap-0.5 flex-1">
        {NAV.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-[5px] rounded-lg text-[13px] transition-all duration-100",
                active
                  ? "bg-white/[0.1] text-white font-medium"
                  : "text-[rgba(235,235,245,0.5)] hover:text-[rgba(235,235,245,0.85)] hover:bg-white/[0.05]"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        <span className="text-[12px] text-[rgba(235,235,245,0.35)] hidden lg:block truncate max-w-[160px]">
          {user?.email}
        </span>
        <div
          className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: "rgba(10,132,255,0.2)", color: "#0A84FF" }}
        >
          {initials}
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-1.5 rounded-lg transition-all duration-100"
          style={{ color: "rgba(235,235,245,0.38)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(235,235,245,0.75)";
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(235,235,245,0.38)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut className="h-[14px] w-[14px]" />
        </button>
      </div>
    </header>
  );
}
