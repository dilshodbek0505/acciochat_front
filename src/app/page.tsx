import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  MessageSquare,
  Mail,
  BarChart2,
  Shield,
  ArrowRight,
  Check,
  Camera,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Keyword Rules",
    desc: "Create rules that trigger on specific keywords in comments or DMs. Match any, all, or exact phrases.",
  },
  {
    icon: MessageSquare,
    title: "Auto-Reply Comments",
    desc: "Reply to Instagram comments instantly when keywords match. Send random variants for natural responses.",
  },
  {
    icon: Mail,
    title: "Auto-Reply DMs",
    desc: "Automatically respond to direct messages with personalized, rule-based replies.",
  },
  {
    icon: BarChart2,
    title: "Analytics",
    desc: "Track engagement metrics, matched rules, and top keywords with real-time activity charts.",
  },
  {
    icon: Camera,
    title: "Multi-Account",
    desc: "Connect multiple Instagram Business or Creator accounts and manage them from one dashboard.",
  },
  {
    icon: Shield,
    title: "Secure OAuth",
    desc: "Connect via Instagram's official OAuth — no password sharing, fully compliant with Meta policies.",
  },
];

const FREE_FEATURES = ["1 Instagram account", "Up to 5 rules", "Comment & DM automation"];
const PRO_FEATURES = [
  "Unlimited accounts",
  "Unlimited rules",
  "90-day activity logs",
  "Advanced analytics",
  "Priority support",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-primary">AccioChat</span>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <Badge variant="secondary" className="mb-4">Instagram Automation SaaS</Badge>
        <h1 className="text-5xl font-bold leading-tight mb-4">
          Automate Instagram{" "}
          <span className="text-primary">Comments & DMs</span>{" "}
          with Keywords
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          AccioChat connects to your Instagram Business or Creator account and
          automatically replies to comments and DMs when your keywords are mentioned.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-10">Everything you need</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="bg-card border-border">
              <CardContent className="p-5 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 pb-24 max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-10">Simple pricing</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-lg font-semibold">Free</p>
                <p className="text-3xl font-bold mt-1">
                  $0<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
              </div>
              <ul className="space-y-2">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full">Get started free</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary" />
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">Pro</p>
                  <Badge className="text-xs">Popular</Badge>
                </div>
                <p className="text-3xl font-bold mt-1">
                  $19<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
              </div>
              <ul className="space-y-2">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button className="w-full gap-2">
                  <Zap className="h-4 w-4" /> Start Pro trial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} AccioChat. Automate with confidence.</p>
      </footer>
    </div>
  );
}
