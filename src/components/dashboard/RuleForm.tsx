"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { Rule, Post } from "@/types";

const schema = z
  .object({
    name: z.string().min(1, "Name required"),
    trigger_type: z.enum(["comment", "dm"]),
    keywords: z.array(z.string()).min(1, "At least one keyword"),
    match_mode: z.enum(["any", "all", "exact"]),
    target_media_id: z.string(),
    response_action: z.enum(["reply_comment", "send_dm", "reply_comment_and_dm"]),
    response_text: z.array(z.string().min(1)).min(1, "At least one reply text"),
    dm_response_text: z.array(z.string().min(1)),
    is_active: z.boolean(),
    priority: z.number().int(),
  })
  .refine(
    (d) =>
      d.response_action !== "reply_comment_and_dm" || d.dm_response_text.length > 0,
    { message: "DM text required for this action", path: ["dm_response_text"] }
  );

type FormData = z.infer<typeof schema>;

interface Props {
  accountId: string;
  rule?: Rule;
}

export default function RuleForm({ accountId, rule }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [kwInput, setKwInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: rule
      ? {
          name: rule.name,
          trigger_type: rule.trigger_type,
          keywords: rule.keywords,
          match_mode: rule.match_mode,
          target_media_id: rule.target_media_id ?? "",
          response_action: rule.response_action,
          response_text: rule.response_text,
          dm_response_text: rule.dm_response_text ?? [],
          is_active: rule.is_active,
          priority: rule.priority,
        }
      : {
          trigger_type: "comment",
          keywords: [],
          match_mode: "any",
          target_media_id: "",
          response_action: "reply_comment",
          response_text: [""],
          dm_response_text: [],
          is_active: true,
          priority: 0,
        },
  });

  const responseAction = watch("response_action");
  const keywords = watch("keywords");

  useEffect(() => {
    api
      .get(`/api/v1/accounts/${accountId}/posts`, { params: { limit: 50 } })
      .then((res) => setPosts(res.data.data ?? []))
      .catch(() => {});
  }, [accountId]);

  const addKeyword = () => {
    const kw = kwInput.trim();
    if (!kw) return;
    const current = getValues("keywords");
    if (!current.includes(kw)) setValue("keywords", [...current, kw]);
    setKwInput("");
  };

  const removeKeyword = (kw: string) => {
    setValue(
      "keywords",
      getValues("keywords").filter((k) => k !== kw)
    );
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (rule) {
        await api.patch(`/api/v1/accounts/${accountId}/rules/${rule.id}`, data);
        toast.success("Rule updated");
      } else {
        await api.post(`/api/v1/accounts/${accountId}/rules/`, data);
        toast.success("Rule created");
      }
      router.push(`/dashboard/accounts/${accountId}/rules`);
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })
        ?.response?.data?.error?.code;
      if (code === "PLAN_LIMIT_REACHED") {
        toast.error("Free plan limit reached (5 rules). Upgrade to Pro.");
        router.push("/dashboard/billing");
      } else {
        toast.error("Failed to save rule");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Name */}
      <div className="space-y-1">
        <Label>Rule name</Label>
        <Input placeholder="e.g. Price inquiry" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {/* Trigger */}
      <div className="space-y-1">
        <Label>Trigger type</Label>
        <Controller
          control={control}
          name="trigger_type"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comment">Comment</SelectItem>
                <SelectItem value="dm">Direct Message</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <Label>Keywords</Label>
        <div className="flex gap-2">
          <Input
            value={kwInput}
            onChange={(e) => setKwInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addKeyword();
              }
            }}
            placeholder="Type keyword and press Enter"
          />
          <Button type="button" variant="outline" size="sm" onClick={addKeyword}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {keywords.map((kw) => (
            <Badge key={kw} variant="secondary" className="gap-1 pl-2">
              {kw}
              <button type="button" onClick={() => removeKeyword(kw)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        {errors.keywords && (
          <p className="text-xs text-destructive">{errors.keywords.message as string}</p>
        )}
      </div>

      {/* Match mode */}
      <div className="space-y-1">
        <Label>Match mode</Label>
        <Controller
          control={control}
          name="match_mode"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any keyword matches</SelectItem>
                <SelectItem value="all">All keywords must match</SelectItem>
                <SelectItem value="exact">Exact phrase match</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Target post */}
      <div className="space-y-1">
        <Label>Target post</Label>
        <Controller
          control={control}
          name="target_media_id"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="All posts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All posts</SelectItem>
                {posts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.caption ? p.caption.slice(0, 50) : p.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Response action */}
      <div className="space-y-2">
        <Label>Response action</Label>
        <Controller
          control={control}
          name="response_action"
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  { value: "reply_comment", label: "Reply to comment" },
                  { value: "send_dm", label: "Send DM" },
                  { value: "reply_comment_and_dm", label: "Reply + DM" },
                ] as const
              ).map((opt) => (
                <Card
                  key={opt.value}
                  className={`cursor-pointer border transition-colors ${
                    field.value === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"
                  }`}
                  onClick={() => field.onChange(opt.value)}
                >
                  <CardContent className="p-3 text-center text-sm">{opt.label}</CardContent>
                </Card>
              ))}
            </div>
          )}
        />
      </div>

      {/* Response text */}
      <div className="space-y-1">
        <Label>
          Reply text{" "}
          <span className="text-xs text-muted-foreground">(one per line — random one is sent)</span>
        </Label>
        <Controller
          control={control}
          name="response_text"
          render={({ field }) => (
            <Textarea
              rows={4}
              placeholder={"Hey! Thanks for reaching out.\nSure, here's more info..."}
              value={field.value.join("\n")}
              onChange={(e) =>
                field.onChange(
                  e.target.value
                    .split("\n")
                    .map((l) => l)
                    .filter((l, i, arr) => l.length > 0 || i === arr.length - 1)
                )
              }
            />
          )}
        />
        {errors.response_text && (
          <p className="text-xs text-destructive">{errors.response_text.message as string}</p>
        )}
      </div>

      {/* DM text (only for reply_comment_and_dm) */}
      {responseAction === "reply_comment_and_dm" && (
        <div className="space-y-1">
          <Label>
            DM text{" "}
            <span className="text-xs text-muted-foreground">(one per line — random one is sent)</span>
          </Label>
          <Controller
            control={control}
            name="dm_response_text"
            render={({ field }) => (
              <Textarea
                rows={3}
                placeholder="Hey! Check this out..."
                value={field.value.join("\n")}
                onChange={(e) =>
                  field.onChange(
                    e.target.value
                      .split("\n")
                      .filter((l, i, arr) => l.length > 0 || i === arr.length - 1)
                  )
                }
              />
            )}
          />
          {errors.dm_response_text && (
            <p className="text-xs text-destructive">
              {errors.dm_response_text.message as string}
            </p>
          )}
        </div>
      )}

      {/* Priority & Active */}
      <div className="flex items-center gap-6">
        <div className="space-y-1 w-24">
          <Label>Priority</Label>
          <Input
            type="number"
            {...register("priority", { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <Label>Active</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : rule ? "Update rule" : "Create rule"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/accounts/${accountId}/rules`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
