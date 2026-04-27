import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const FEATURES = [
  { title: "Keyword Rules", desc: "Create rules that trigger on specific keywords in comments or DMs." },
  { title: "Auto-Reply Comments", desc: "Reply to Instagram comments instantly when keywords match." },
  { title: "Auto-Reply DMs", desc: "Automatically respond to direct messages with rule-based replies." },
  { title: "Real-time Analytics", desc: "Track engagement, matched rules, and top keywords with live charts." },
  { title: "Multi-Account", desc: "Manage multiple Instagram Business accounts from one dashboard." },
  { title: "Secure OAuth", desc: "Official Instagram OAuth — fully compliant with Meta policies." },
];

const FREE_FEATURES = [
  "1 Instagram account",
  "Up to 5 automation rules",
  "Comment & DM automation",
  "7-day activity logs",
];
const PRO_FEATURES = [
  "Unlimited accounts",
  "Unlimited automation rules",
  "Comment & DM automation",
  "90-day activity logs",
  "Advanced analytics",
  "Priority support",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[rgba(10,132,255,0.3)]">

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 border-b px-6 h-[52px] flex items-center justify-between"
        style={{
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderColor: "rgba(84,84,88,0.45)",
        }}
      >
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#F5F5F7]">
          AccioChat
        </span>
        <div className="flex items-center gap-1">
          <Link
            href="/auth/login"
            className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-[rgba(235,235,245,0.7)] hover:text-[rgba(235,235,245,0.95)] hover:bg-white/10 transition-all duration-150"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-1.5 rounded-full text-[13px] font-medium text-white bg-[#0A84FF] hover:bg-[rgba(10,132,255,0.82)] transition-all duration-150"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-28 pb-24 text-center max-w-[740px] mx-auto">
        <p className="text-[13px] font-medium mb-5 uppercase tracking-[0.08em] text-[rgba(10,132,255,0.9)]">
          Instagram Automation Platform
        </p>
        <h1
          className="text-[3.5rem] leading-[1.1] font-semibold mb-6 text-[#F5F5F7]"
          style={{ letterSpacing: "-0.03em" }}
        >
          Automate your Instagram.{" "}
          <span className="text-[rgba(235,235,245,0.38)]">Effortlessly.</span>
        </h1>
        <p className="text-[17px] leading-relaxed mb-10 max-w-[480px] mx-auto text-[rgba(235,235,245,0.6)]">
          AccioChat connects to your Instagram Business account and automatically
          replies to comments and DMs when your keywords are mentioned.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="flex items-center gap-2 px-7 py-3 rounded-full text-[15px] font-medium text-white bg-[#0A84FF] hover:bg-[rgba(10,132,255,0.82)] transition-all duration-150"
          >
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/auth/login"
            className="px-7 py-3 rounded-full text-[15px] font-medium text-[#0A84FF] border border-[rgba(10,132,255,0.35)] bg-[rgba(10,132,255,0.06)] hover:bg-[rgba(10,132,255,0.12)] transition-all duration-150"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-[rgba(84,84,88,0.35)]" />
      </div>

      {/* Features */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-center mb-14 text-[rgba(235,235,245,0.3)]">
          Everything you need
        </p>
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-hidden border"
          style={{ borderColor: "rgba(84,84,88,0.3)" }}
        >
          {FEATURES.map(({ title, desc }, i) => (
            <div
              key={title}
              className="p-7"
              style={{
                background: i % 2 === 0 ? "rgba(28,28,30,0.5)" : "rgba(22,22,24,0.5)",
                borderBottom: "1px solid rgba(84,84,88,0.2)",
                borderRight: "1px solid rgba(84,84,88,0.2)",
              }}
            >
              <p className="text-[15px] font-medium mb-2 text-[#F5F5F7]" style={{ letterSpacing: "-0.01em" }}>
                {title}
              </p>
              <p className="text-[13px] leading-relaxed text-[rgba(235,235,245,0.5)]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-[rgba(84,84,88,0.35)]" />
      </div>

      {/* Pricing */}
      <section className="px-6 py-24 max-w-2xl mx-auto">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-center mb-14 text-[rgba(235,235,245,0.3)]">
          Simple pricing
        </p>
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Free */}
          <div
            className="rounded-2xl p-7 space-y-6 border"
            style={{ background: "rgba(28,28,30,0.7)", borderColor: "rgba(84,84,88,0.3)" }}
          >
            <div>
              <p className="text-[13px] font-medium text-[rgba(235,235,245,0.5)]">Free</p>
              <p className="text-[2rem] font-semibold mt-1 text-[#F5F5F7]" style={{ letterSpacing: "-0.02em" }}>
                $0
                <span className="text-[14px] font-normal ml-1 text-[rgba(235,235,245,0.4)]">/ month</span>
              </p>
            </div>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[13px] text-[rgba(235,235,245,0.65)]">
                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-[#32D74B]" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className="block w-full py-2.5 rounded-xl text-[14px] font-medium text-center text-[rgba(235,235,245,0.75)] border border-[rgba(84,84,88,0.45)] hover:bg-white/5 transition-all duration-150"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div
            className="rounded-2xl p-7 space-y-6 relative overflow-hidden border"
            style={{ background: "rgba(28,28,30,0.7)", borderColor: "rgba(10,132,255,0.35)" }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(10,132,255,0.6), transparent)" }}
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-medium text-[rgba(235,235,245,0.5)]">Pro</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(10,132,255,0.15)] text-[#0A84FF]">
                  POPULAR
                </span>
              </div>
              <p className="text-[2rem] font-semibold mt-1 text-[#F5F5F7]" style={{ letterSpacing: "-0.02em" }}>
                $19
                <span className="text-[14px] font-normal ml-1 text-[rgba(235,235,245,0.4)]">/ month</span>
              </p>
            </div>
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[13px] text-[rgba(235,235,245,0.85)]">
                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-[#0A84FF]" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className="block w-full py-2.5 rounded-xl text-[14px] font-medium text-center text-white bg-[#0A84FF] hover:bg-[rgba(10,132,255,0.82)] transition-all duration-150"
            >
              Start Pro trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="h-px bg-[rgba(84,84,88,0.35)]" />
      <footer className="px-6 py-6 text-center">
        <p className="text-[12px] text-[rgba(235,235,245,0.25)]">
          Copyright © {new Date().getFullYear()} AccioChat Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
