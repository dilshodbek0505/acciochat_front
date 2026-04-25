"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    api
      .post("/api/v1/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <Card className="bg-card border-border text-center">
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Verifying your email…</p>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="text-foreground font-medium">Email verified!</p>
            <Button onClick={() => router.push("/auth/login")}>Sign in</Button>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-10 w-10 text-destructive" />
            <p className="text-foreground font-medium">Invalid or expired link</p>
            <Button variant="outline" onClick={() => router.push("/auth/login")}>
              Back to login
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="h-48 bg-card border border-border rounded-lg animate-pulse" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
