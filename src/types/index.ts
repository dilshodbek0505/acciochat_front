export interface User {
  id: string;
  email: string;
  full_name: string;
  is_email_verified: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface IGAccount {
  id: string;
  ig_user_id: string;
  username: string;
  account_type: "business" | "creator";
  is_active: boolean;
  webhook_subscribed: boolean;
  token_expires_at: string;
  connected_at: string;
}

export interface Post {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  permalink: string;
}

export type TriggerType = "comment" | "dm";
export type MatchMode = "any" | "all" | "exact";
export type ResponseAction = "reply_comment" | "send_dm" | "reply_comment_and_dm";

export interface Rule {
  id: string;
  name: string;
  trigger_type: TriggerType;
  keywords: string[];
  match_mode: MatchMode;
  target_media_id: string;
  response_text: string[];
  dm_response_text: string[];
  response_action: ResponseAction;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export type LogStatus = "received" | "matched" | "replied" | "failed" | "ignored";

export interface CommentLog {
  id: string;
  ig_comment_id: string;
  ig_media_id: string;
  commenter_ig_id: string;
  commenter_username: string;
  comment_text: string;
  matched_rule: string | null;
  status: LogStatus;
  reply_text: string;
  replied_at: string | null;
  created_at: string;
}

export interface MessageLog {
  id: string;
  ig_message_id: string;
  sender_ig_id: string;
  direction: "inbound" | "outbound";
  message_text: string;
  matched_rule: string | null;
  status: string;
  replied_at: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_comments: number;
  total_messages: number;
  matched_rules: number;
  unanswered_comments: number;
  unanswered_messages: number;
  top_keywords: { keyword: string; count: number }[];
  activity_by_day: { date: string; comments: number; messages: number }[];
}

export interface PaginatedResponse<T> {
  count?: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
