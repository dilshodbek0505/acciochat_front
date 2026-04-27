"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const profileSchema = z.object({ full_name: z.string().min(1, "Name required") });
const passwordSchema = z
  .object({
    password: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium block" style={{ color: "rgba(235,235,245,0.55)" }}>
        {label}
      </label>
      {children}
      {error && <p className="text-[11px]" style={{ color: "#FF453A" }}>{error}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{ background: "rgba(28,28,30,0.5)", borderColor: "rgba(84,84,88,0.28)" }}
    >
      <p
        className="text-[15px] font-medium text-white mb-5"
        style={{ letterSpacing: "-0.015em" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.full_name ?? "" },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const updateProfile = async (data: ProfileForm) => {
    setProfileLoading(true);
    try {
      const res = await api.patch("/api/v1/auth/me", data);
      setUser(res.data);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const updatePassword = async (data: PasswordForm) => {
    setPasswordLoading(true);
    try {
      await api.post("/api/v1/auth/reset-password", { password: data.password });
      toast.success("Password updated");
      passwordForm.reset();
    } catch {
      toast.error("Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h2 className="text-[22px] font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>
          Settings
        </h2>
        <p className="text-[13px] mt-1" style={{ color: "rgba(235,235,245,0.45)" }}>
          Manage your account settings
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <Section title="Profile">
          <form onSubmit={profileForm.handleSubmit(updateProfile)} className="space-y-4">
            <Field label="Email">
              <Input
                value={user?.email ?? ""}
                disabled
                className="h-[38px] text-[13px] rounded-xl opacity-50"
                style={{ background: "rgba(58,58,60,0.4)", borderColor: "rgba(84,84,88,0.4)" }}
              />
            </Field>
            <Field label="Full name" error={profileForm.formState.errors.full_name?.message}>
              <Input
                placeholder="John Doe"
                className="h-[38px] text-[13px] rounded-xl"
                style={{ background: "rgba(58,58,60,0.4)", borderColor: "rgba(84,84,88,0.4)" }}
                {...profileForm.register("full_name")}
              />
            </Field>
            <button
              type="submit"
              disabled={profileLoading}
              className="px-5 py-2 rounded-xl text-[13px] font-medium text-white transition-all flex items-center gap-2"
              style={{ background: profileLoading ? "rgba(10,132,255,0.5)" : "#0A84FF" }}
            >
              {profileLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save changes"}
            </button>
          </form>
        </Section>

        {/* Password */}
        <Section title="Change Password">
          <form onSubmit={passwordForm.handleSubmit(updatePassword)} className="space-y-4">
            <Field label="New password" error={passwordForm.formState.errors.password?.message}>
              <Input
                type="password"
                placeholder="Min 8 chars with letter & digit"
                className="h-[38px] text-[13px] rounded-xl"
                style={{ background: "rgba(58,58,60,0.4)", borderColor: "rgba(84,84,88,0.4)" }}
                {...passwordForm.register("password")}
              />
            </Field>
            <Field label="Confirm password" error={passwordForm.formState.errors.confirm?.message}>
              <Input
                type="password"
                placeholder="Re-enter password"
                className="h-[38px] text-[13px] rounded-xl"
                style={{ background: "rgba(58,58,60,0.4)", borderColor: "rgba(84,84,88,0.4)" }}
                {...passwordForm.register("confirm")}
              />
            </Field>
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-2 rounded-xl text-[13px] font-medium text-white transition-all flex items-center gap-2"
              style={{ background: passwordLoading ? "rgba(10,132,255,0.5)" : "#0A84FF" }}
            >
              {passwordLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Update password"}
            </button>
          </form>
        </Section>
      </div>
    </div>
  );
}
