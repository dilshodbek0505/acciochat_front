"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2, X, Plus, MessageSquare, Mail, Zap,
  Check, Play, LayoutGrid, Image as ImgIcon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Rule, Post } from "@/types";

const schema = z
  .object({
    name: z.string().min(1, "Name required"),
    trigger_type: z.enum(["comment", "dm"]),
    keywords: z.array(z.string()).min(1, "At least one keyword required"),
    match_mode: z.enum(["any", "all", "exact"]),
    target_media_id: z.string(),
    response_action: z.enum(["reply_comment", "send_dm", "reply_comment_and_dm"]),
    response_text: z.array(z.string().min(1)).min(1, "At least one reply text required"),
    dm_response_text: z.array(z.string().min(1)),
    is_active: z.boolean(),
    priority: z.number().int(),
  })
  .refine(
    (d) => d.response_action !== "reply_comment_and_dm" || d.dm_response_text.length > 0,
    { message: "DM text required for this action", path: ["dm_response_text"] }
  );

type FormData = z.infer<typeof schema>;

interface Props {
  accountId: string;
  rule?: Rule;
}

/* ── helpers ── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-3"
      style={{ color: "rgba(235,235,245,0.35)" }}>
      {children}
    </p>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[11px] mt-2" style={{ color: "#FF453A" }}>{msg}</p>;
}

function Divider() {
  return <div style={{ height: "1px", background: "rgba(84,84,88,0.22)" }} />;
}

/* ── variants list ── */
function VariantList({
  values,
  onChange,
  placeholder,
  addLabel,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  const list = values.length > 0 ? values : [""];

  const update = (i: number, v: string) => {
    const next = [...list];
    next[i] = v;
    onChange(next);
  };

  const remove = (i: number) => {
    const next = list.filter((_, idx) => idx !== i);
    onChange(next.length ? next : [""]);
  };

  const add = () => onChange([...list, ""]);

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ borderColor: "rgba(84,84,88,0.28)" }}>
      {list.map((text, i) => (
        <div key={i} className="flex items-center gap-2 px-3.5 py-2.5"
          style={{
            background: "rgba(28,28,30,0.55)",
            borderBottom: i < list.length - 1 ? "1px solid rgba(84,84,88,0.18)" : undefined,
          }}>
          <span className="text-[10px] w-4 text-center flex-shrink-0 font-medium tabular-nums"
            style={{ color: "rgba(235,235,245,0.25)" }}>
            {i + 1}
          </span>
          <input
            value={text}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-[13px] text-white outline-none min-w-0"
            style={{ caretColor: "#0A84FF" }}
          />
          <button type="button" onClick={() => remove(i)}
            className="flex-shrink-0 opacity-0 hover:opacity-100 transition-opacity p-0.5">
            <X className="h-3.5 w-3.5" style={{ color: "rgba(235,235,245,0.4)" }} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="w-full px-4 py-2.5 flex items-center gap-2 text-[12px] font-medium transition-colors"
        style={{ background: "rgba(22,22,24,0.5)", color: "rgba(235,235,245,0.38)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(235,235,245,0.65)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(235,235,245,0.38)")}>
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
  );
}

/* ── main component ── */

export default function RuleForm({ accountId, rule }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [kwInput, setKwInput] = useState("");

  const { register, handleSubmit, watch, control, setValue, getValues, formState: { errors } } =
    useForm<FormData>({
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
  const targetMediaId = watch("target_media_id");
  const responseTexts = watch("response_text");
  const dmTexts = watch("dm_response_text");

  useEffect(() => {
    api
      .get(`/api/v1/accounts/${accountId}/posts`, { params: { limit: 50 } })
      .then((res) => setPosts(res.data.data ?? res.data.results ?? []))
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  }, [accountId]);

  const addKeyword = () => {
    const kw = kwInput.trim();
    if (!kw) return;
    const cur = getValues("keywords");
    if (!cur.includes(kw)) setValue("keywords", [...cur, kw]);
    setKwInput("");
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
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
        toast.error("Free plan limit reached. Upgrade to Pro.");
        router.push("/dashboard/billing");
      } else {
        toast.error("Failed to save rule");
      }
    } finally {
      setSaving(false);
    }
  };

  const selectedPost = posts.find((p) => p.id === targetMediaId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-8">

      {/* ── Name + Active ── */}
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="text-[12px] font-medium block" style={{ color: "rgba(235,235,245,0.55)" }}>
            Rule name
          </label>
          <Input
            placeholder="e.g. Price inquiry"
            className="h-10 text-[14px] rounded-xl"
            style={{ background: "rgba(58,58,60,0.35)", borderColor: "rgba(84,84,88,0.38)" }}
            {...register("name")}
          />
          <FieldError msg={errors.name?.message} />
        </div>
        <div className="flex items-center gap-2 pt-7 flex-shrink-0">
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <span className="text-[13px]" style={{ color: "rgba(235,235,245,0.5)" }}>Active</span>
        </div>
      </div>

      <Divider />

      {/* ── Trigger type ── */}
      <div>
        <Label>Trigger type</Label>
        <Controller
          control={control}
          name="trigger_type"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              {([
                {
                  value: "comment" as const,
                  icon: MessageSquare,
                  label: "Comment",
                  desc: "Triggered when someone comments on your post",
                },
                {
                  value: "dm" as const,
                  icon: Mail,
                  label: "Direct Message",
                  desc: "Triggered when someone sends you a DM",
                },
              ]).map(({ value, icon: Icon, label, desc }) => {
                const active = field.value === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className="text-left p-4 rounded-xl transition-all duration-150"
                    style={{
                      background: active ? "rgba(10,132,255,0.09)" : "rgba(28,28,30,0.5)",
                      border: `2px solid ${active ? "#0A84FF" : "rgba(84,84,88,0.3)"}`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: active ? "rgba(10,132,255,0.2)" : "rgba(84,84,88,0.18)" }}
                    >
                      <Icon className="h-4 w-4"
                        style={{ color: active ? "#0A84FF" : "rgba(235,235,245,0.5)" }} />
                    </div>
                    <p className="text-[14px] font-medium mb-1"
                      style={{ color: active ? "#F5F5F7" : "rgba(235,235,245,0.65)" }}>
                      {label}
                    </p>
                    <p className="text-[12px] leading-relaxed"
                      style={{ color: "rgba(235,235,245,0.35)" }}>
                      {desc}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      <Divider />

      {/* ── Keywords ── */}
      <div>
        <Label>Keywords</Label>
        <div className="rounded-xl border p-4 space-y-3"
          style={{ background: "rgba(28,28,30,0.5)", borderColor: "rgba(84,84,88,0.28)" }}>

          {/* Input row */}
          <div className="flex gap-2">
            <Input
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
              placeholder="Type keyword and press Enter"
              className="h-9 text-[13px] rounded-lg flex-1"
              style={{ background: "rgba(58,58,60,0.4)", borderColor: "rgba(84,84,88,0.38)" }}
            />
            <button
              type="button"
              onClick={addKeyword}
              className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#0A84FF" }}
            >
              <Plus className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Tags */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw) => (
                <span key={kw}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium"
                  style={{
                    background: "rgba(10,132,255,0.12)",
                    color: "#3EA6FF",
                    border: "1px solid rgba(10,132,255,0.22)",
                  }}
                >
                  {kw}
                  <button type="button" onClick={() =>
                    setValue("keywords", getValues("keywords").filter((k) => k !== kw))
                  } className="hover:opacity-60 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Match mode */}
          <div>
            <p className="text-[11px] mb-2" style={{ color: "rgba(235,235,245,0.35)" }}>
              Match mode
            </p>
            <Controller
              control={control}
              name="match_mode"
              render={({ field }) => (
                <div className="flex gap-1.5">
                  {([
                    { value: "any" as const, label: "Any keyword" },
                    { value: "all" as const, label: "All keywords" },
                    { value: "exact" as const, label: "Exact phrase" },
                  ]).map(({ value, label }) => {
                    const active = field.value === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-100"
                        style={
                          active
                            ? { background: "#0A84FF", color: "#fff" }
                            : {
                                background: "rgba(58,58,60,0.45)",
                                color: "rgba(235,235,245,0.5)",
                                border: "1px solid rgba(84,84,88,0.3)",
                              }
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>
        </div>
        <FieldError msg={errors.keywords?.message as string} />
      </div>

      <Divider />

      {/* ── Target post ── */}
      <div>
        <div className="flex items-baseline gap-2 mb-3">
          <Label>Target post</Label>
          <span className="text-[11px]" style={{ color: "rgba(235,235,245,0.28)" }}>
            — optional, leave blank to match all posts
          </span>
        </div>

        <Controller
          control={control}
          name="target_media_id"
          render={({ field }) => (
            <div className="rounded-xl border p-4 space-y-3"
              style={{ background: "rgba(28,28,30,0.5)", borderColor: "rgba(84,84,88,0.28)" }}>

              {postsLoading ? (
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg animate-pulse"
                      style={{ background: "rgba(58,58,60,0.35)" }} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">

                  {/* All posts */}
                  <button
                    type="button"
                    onClick={() => field.onChange("")}
                    className="relative aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-100"
                    style={{
                      background: !field.value ? "rgba(10,132,255,0.12)" : "rgba(58,58,60,0.3)",
                      border: `2px solid ${!field.value ? "#0A84FF" : "rgba(84,84,88,0.22)"}`,
                    }}
                  >
                    <LayoutGrid className="h-4 w-4"
                      style={{ color: !field.value ? "#0A84FF" : "rgba(235,235,245,0.4)" }} />
                    <span className="text-[9px] font-semibold"
                      style={{ color: !field.value ? "#0A84FF" : "rgba(235,235,245,0.4)" }}>
                      All
                    </span>
                    {!field.value && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "#0A84FF" }}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Post thumbnails */}
                  {posts.map((post) => {
                    const img = post.thumbnail_url || post.media_url;
                    const selected = field.value === post.id;
                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => field.onChange(post.id)}
                        className="relative aspect-square rounded-lg overflow-hidden transition-all duration-100"
                        style={{
                          outline: selected ? "2px solid #0A84FF" : "2px solid transparent",
                          outlineOffset: "2px",
                        }}
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={post.caption?.slice(0, 20) ?? ""}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"
                            style={{ background: "rgba(58,58,60,0.4)" }}>
                            <ImgIcon className="h-4 w-4" style={{ color: "rgba(235,235,245,0.3)" }} />
                          </div>
                        )}

                        {/* Video badge */}
                        {post.media_type === "VIDEO" && !selected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.55)" }}>
                            <Play className="h-2 w-2 text-white" style={{ marginLeft: "1px" }} />
                          </div>
                        )}

                        {/* Selected overlay */}
                        {selected && (
                          <div className="absolute inset-0 flex items-center justify-center"
                            style={{ background: "rgba(10,132,255,0.4)" }}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ background: "#0A84FF" }}>
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {posts.length === 0 && (
                    <div className="col-span-4 flex items-center gap-2 py-2">
                      <ImgIcon className="h-4 w-4 flex-shrink-0" style={{ color: "rgba(235,235,245,0.25)" }} />
                      <span className="text-[12px]" style={{ color: "rgba(235,235,245,0.35)" }}>
                        No posts found for this account
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Selected post info bar */}
              {selectedPost && (
                <div className="flex items-center gap-3 pt-2"
                  style={{ borderTop: "1px solid rgba(84,84,88,0.2)" }}>
                  {(selectedPost.thumbnail_url || selectedPost.media_url) && (
                    <img
                      src={selectedPost.thumbnail_url || selectedPost.media_url}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] truncate" style={{ color: "rgba(235,235,245,0.6)" }}>
                      {selectedPost.caption
                        ? selectedPost.caption.slice(0, 70) + (selectedPost.caption.length > 70 ? "…" : "")
                        : "No caption"}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "rgba(235,235,245,0.3)" }}>
                      {selectedPost.media_type} · {selectedPost.like_count ?? 0} likes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => field.onChange("")}
                    className="text-[11px] px-2.5 py-1 rounded-lg flex-shrink-0 transition-all"
                    style={{ color: "rgba(235,235,245,0.4)", background: "rgba(84,84,88,0.2)" }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        />
      </div>

      <Divider />

      {/* ── Response action ── */}
      <div>
        <Label>Action</Label>
        <Controller
          control={control}
          name="response_action"
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {([
                {
                  value: "reply_comment" as const,
                  icon: MessageSquare,
                  label: "Reply to comment",
                  desc: "Reply publicly under the comment",
                },
                {
                  value: "send_dm" as const,
                  icon: Mail,
                  label: "Send DM",
                  desc: "Send a private direct message",
                },
                {
                  value: "reply_comment_and_dm" as const,
                  icon: Zap,
                  label: "Reply + DM",
                  desc: "Both reply publicly and send a DM",
                },
              ]).map(({ value, icon: Icon, label, desc }) => {
                const active = field.value === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className="text-left p-4 rounded-xl transition-all duration-150"
                    style={{
                      background: active ? "rgba(10,132,255,0.09)" : "rgba(28,28,30,0.5)",
                      border: `2px solid ${active ? "#0A84FF" : "rgba(84,84,88,0.28)"}`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: active ? "rgba(10,132,255,0.2)" : "rgba(84,84,88,0.18)" }}
                    >
                      <Icon className="h-4 w-4"
                        style={{ color: active ? "#0A84FF" : "rgba(235,235,245,0.5)" }} />
                    </div>
                    <p className="text-[13px] font-medium mb-0.5"
                      style={{ color: active ? "#F5F5F7" : "rgba(235,235,245,0.65)" }}>
                      {label}
                    </p>
                    <p className="text-[11px] leading-relaxed"
                      style={{ color: "rgba(235,235,245,0.32)" }}>
                      {desc}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      <Divider />

      {/* ── Reply variants ── */}
      <div>
        <Label>
          {responseAction === "send_dm" ? "DM message variants" : "Reply variants"}
        </Label>
        <VariantList
          values={responseTexts}
          onChange={(v) => setValue("response_text", v)}
          placeholder={
            responseAction === "send_dm"
              ? "Hey! Check this out…"
              : "Hey! Thanks for reaching out."
          }
          addLabel="Add variant"
        />
        <p className="text-[11px] mt-2" style={{ color: "rgba(235,235,245,0.28)" }}>
          One variant is chosen randomly for each response
        </p>
        <FieldError msg={errors.response_text?.message as string} />
      </div>

      {/* ── DM variants (only for reply_comment_and_dm) ── */}
      {responseAction === "reply_comment_and_dm" && (
        <>
          <Divider />
          <div>
            <Label>DM message variants</Label>
            <VariantList
              values={dmTexts.length > 0 ? dmTexts : [""]}
              onChange={(v) => setValue("dm_response_text", v)}
              placeholder="Hey! Check out more details here…"
              addLabel="Add DM variant"
            />
            <p className="text-[11px] mt-2" style={{ color: "rgba(235,235,245,0.28)" }}>
              Sent as a private DM in addition to the comment reply
            </p>
            <FieldError msg={errors.dm_response_text?.message as string} />
          </div>
        </>
      )}

      <Divider />

      {/* ── Priority ── */}
      <div className="flex items-end gap-4">
        <div className="space-y-1.5 w-28">
          <label className="text-[12px] font-medium block" style={{ color: "rgba(235,235,245,0.55)" }}>
            Priority
          </label>
          <Input
            type="number"
            {...register("priority", { valueAsNumber: true })}
            placeholder="0"
            className="h-9 text-[13px] rounded-xl"
            style={{ background: "rgba(58,58,60,0.35)", borderColor: "rgba(84,84,88,0.38)" }}
          />
        </div>
        <p className="text-[12px] pb-2" style={{ color: "rgba(235,235,245,0.32)" }}>
          Higher number = runs first when multiple rules match
        </p>
      </div>

      {/* ── Submit ── */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-medium text-white transition-all"
          style={{ background: saving ? "rgba(10,132,255,0.5)" : "#0A84FF" }}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            rule ? "Update rule" : "Create rule"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/accounts/${accountId}/rules`)}
          className="px-5 py-2.5 rounded-xl text-[14px] font-medium transition-all"
          style={{ color: "rgba(235,235,245,0.55)", background: "rgba(58,58,60,0.3)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
