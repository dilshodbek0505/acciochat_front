"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/v1/auth/login", data);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      setUser(res.data.user);
      router.push("/dashboard/accounts");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-7 border space-y-6"
      style={{ background: "rgba(28,28,30,0.8)", borderColor: "rgba(84,84,88,0.35)" }}
    >
      <div>
        <h2 className="text-[18px] font-semibold" style={{ letterSpacing: "-0.018em", color: "#F5F5F7" }}>
          Sign in
        </h2>
        <p className="text-[13px] mt-0.5" style={{ color: "rgba(235,235,245,0.45)" }}>
          Enter your credentials to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium" style={{ color: "rgba(235,235,245,0.55)" }}>
            Email
          </label>
          <Input
            type="email"
            placeholder="you@example.com"
            className="h-[38px] text-[13px] rounded-xl"
            style={{ background: "rgba(58,58,60,0.5)", borderColor: "rgba(84,84,88,0.5)" }}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-[11px]" style={{ color: "#FF453A" }}>{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium" style={{ color: "rgba(235,235,245,0.55)" }}>
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-[12px] transition-colors"
              style={{ color: "#0A84FF" }}
            >
              Forgot?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            className="h-[38px] text-[13px] rounded-xl"
            style={{ background: "rgba(58,58,60,0.5)", borderColor: "rgba(84,84,88,0.5)" }}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-[11px]" style={{ color: "#FF453A" }}>{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[38px] rounded-xl text-[14px] font-medium text-white transition-all duration-150 flex items-center justify-center mt-1"
          style={{ background: loading ? "rgba(10,132,255,0.6)" : "#0A84FF" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </button>

        <p className="text-center text-[13px]" style={{ color: "rgba(235,235,245,0.45)" }}>
          No account?{" "}
          <Link href="/auth/signup" className="font-medium" style={{ color: "#0A84FF" }}>
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
