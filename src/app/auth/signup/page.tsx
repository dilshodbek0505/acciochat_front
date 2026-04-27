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

const schema = z.object({
  full_name: z.string().min(1, "Name required"),
  email: z.string().email("Valid email required"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[a-zA-Z]/, "Must include a letter")
    .regex(/[0-9]/, "Must include a digit"),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post("/api/v1/auth/signup", data);
      toast.success("Account created! Check your email to verify.");
      router.push("/auth/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Signup failed";
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
          Create account
        </h2>
        <p className="text-[13px] mt-0.5" style={{ color: "rgba(235,235,245,0.45)" }}>
          Get started with AccioChat for free
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium" style={{ color: "rgba(235,235,245,0.55)" }}>
            Full name
          </label>
          <Input
            placeholder="John Doe"
            className="h-[38px] text-[13px] rounded-xl"
            style={{ background: "rgba(58,58,60,0.5)", borderColor: "rgba(84,84,88,0.5)" }}
            {...register("full_name")}
          />
          {errors.full_name && (
            <p className="text-[11px]" style={{ color: "#FF453A" }}>{errors.full_name.message}</p>
          )}
        </div>

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
          <label className="text-[12px] font-medium" style={{ color: "rgba(235,235,245,0.55)" }}>
            Password
          </label>
          <Input
            type="password"
            placeholder="Min 8 chars, include a digit"
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </button>

        <p className="text-center text-[13px]" style={{ color: "rgba(235,235,245,0.45)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium" style={{ color: "#0A84FF" }}>
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
