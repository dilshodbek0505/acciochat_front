"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Camera,
  Zap,
  ScrollText,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
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

function buildAccountNav(accountId: string): NavItem[] {
  return [
    {
      href: `/dashboard/accounts/${accountId}`,
      label: "Overview",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `/dashboard/accounts/${accountId}/rules`,
      label: "Rules",
      icon: Zap,
    },
    {
      href: `/dashboard/accounts/${accountId}/logs`,
      label: "Logs",
      icon: ScrollText,
    },
  ];
}

const bottomNav: NavItem[] = [
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        active
          ? "bg-primary/20 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
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
    <aside className="w-56 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col min-h-screen">
      <div className="px-4 py-5 border-b border-sidebar-border">
        <Link href="/dashboard/accounts" className="text-lg font-bold text-primary">
          AccioChat
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {topNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        {accountId && (
          <>
            <div className="pt-3 pb-1">
              <Link
                href="/dashboard/accounts"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-3 w-3" /> All accounts
              </Link>
            </div>
            <div className="border-t border-sidebar-border pt-2 space-y-1">
              {buildAccountNav(accountId).map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        {bottomNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
        {user && (
          <div className="px-3 pt-2 text-xs text-muted-foreground truncate">
            {user.email}
          </div>
        )}
      </div>
    </aside>
  );
}
