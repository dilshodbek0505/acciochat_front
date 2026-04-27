"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  Camera,
  Zap,
  ScrollText,
  CreditCard,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const topNav: NavItem[] = [
  { href: "/dashboard/accounts", label: "Accounts", icon: Camera },
];

function buildAccountNav(id: string): NavItem[] {
  return [
    { href: `/dashboard/accounts/${id}`, label: "Overview", icon: LayoutDashboard, exact: true },
    { href: `/dashboard/accounts/${id}/rules`, label: "Rules", icon: Zap },
    { href: `/dashboard/accounts/${id}/logs`, label: "Logs", icon: ScrollText },
  ];
}

const bottomNav: NavItem[] = [
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2 px-2.5 py-[6px] rounded-[8px] text-[13px] transition-all duration-100 select-none",
        active
          ? "bg-primary/[0.12] text-primary font-medium"
          : "text-[rgba(235,235,245,0.55)] hover:text-[rgba(235,235,245,0.85)] hover:bg-white/[0.05]"
      )}
    >
      <Icon
        className={cn(
          "h-[15px] w-[15px] flex-shrink-0",
          active ? "text-primary" : "opacity-70"
        )}
      />
      {item.label}
    </Link>
  );
}

export default function Sidebar() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const accountId = params?.id;

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      await api.post("/api/v1/auth/logout", { refresh });
    } catch {
      // ignore
    }
    logout();
    router.push("/auth/login");
    toast.success("Signed out");
  };

  return (
    <aside
      className="w-[200px] flex-shrink-0 flex flex-col min-h-screen border-r"
      style={{
        background: "rgba(10, 10, 12, 0.92)",
        borderColor: "rgba(84, 84, 88, 0.3)",
      }}
    >
      {/* Logo */}
      <div className="px-4 h-[52px] flex items-center border-b" style={{ borderColor: "rgba(84, 84, 88, 0.2)" }}>
        <Link href="/dashboard/accounts" className="text-[15px] font-semibold tracking-[-0.02em] text-white">
          AccioChat
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2.5 space-y-0.5 overflow-y-auto">
        {topNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        {accountId && (
          <>
            <div className="px-2.5 pt-4 pb-1">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.06em]"
                style={{ color: "rgba(235,235,245,0.28)" }}
              >
                Account
              </p>
            </div>
            {buildAccountNav(accountId).map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div
        className="px-2 py-2.5 space-y-0.5 border-t"
        style={{ borderColor: "rgba(84, 84, 88, 0.2)" }}
      >
        {bottomNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 px-2.5 py-[6px] rounded-[8px] text-[13px] transition-all duration-100 select-none"
          style={{ color: "rgba(235,235,245,0.55)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(235,235,245,0.85)";
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(235,235,245,0.55)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut className="h-[15px] w-[15px] opacity-70 flex-shrink-0" />
          Sign out
        </button>

        {user && (
          <div className="px-2.5 pt-2 pb-1">
            <p
              className="text-[11px] truncate"
              style={{ color: "rgba(235,235,245,0.28)" }}
            >
              {user.email}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
