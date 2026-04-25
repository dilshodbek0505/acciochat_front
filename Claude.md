# AccioChat — Frontend Development Guide

## Loyha haqida

**AccioChat** — Instagram Business/Creator akkauntlar uchun **avtomatlashtirish SaaS** platformasi.

Foydalanuvchilar Instagram akkauntlarini ulashadi, keyin **keyword-based rules** (qoidalar) yaratishadi. Kimdir postga comment qoldirsa yoki DM yuborse — bot avtomatik ravishda javob beradi.

### Asosiy imkoniyatlar

- Instagram OAuth orqali akkaunt ulash
- Kommentlarga avtomatik reply
- DM larga avtomatik javob
- Qoidalar: kalit so'zlar, match mode, prioritet
- Muayyan post uchun yoki barcha postlar uchun qoidalar
- Reply matnlari ro'yxatidan tasodifiy biri yuboriladi
- Faollik loglari (comment va DM)
- Dashboard statistikalar
- Stripe orqali Pro tarifga o'tish

---

## Texnologiya stack (tavsiya)

| Layer | Texnologiya |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| UI Kit | shadcn/ui + Tailwind CSS |
| State | Zustand yoki TanStack Query |
| HTTP Client | Axios yoki fetch |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Charts | Recharts yoki Chart.js |
| Notifications | Sonner (toast) |

---

## Dizayn tizimi

### Rang palitasi

```css
/* Brand ranglar */
--primary: #6366F1        /* Indigo — asosiy tugmalar, link */
--primary-dark: #4F46E5   /* Hover holati */
--secondary: #8B5CF6      /* Violet — accent */

/* Fon */
--bg-base: #0F0F13        /* Sahifa foni (dark) */
--bg-surface: #1A1A24     /* Card, panel foni */
--bg-elevated: #222232    /* Modal, dropdown foni */

/* Matn */
--text-primary: #F1F5F9   /* Asosiy matn */
--text-secondary: #94A3B8 /* Ikkinchi darajali */
--text-muted: #475569      /* Placeholder, label */

/* Status ranglar */
--success: #22C55E
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6

/* Border */
--border: #2E2E42
--border-focus: #6366F1
```

### Tipografiya

```css
font-family: 'Inter', sans-serif;

/* Sarlavhalar */
h1: 36px / 700
h2: 28px / 600
h3: 22px / 600
h4: 18px / 600

/* Matn */
body: 14px / 400
small: 12px / 400
label: 12px / 500 uppercase
```

### Spacing

`4px` grid — `4, 8, 12, 16, 24, 32, 48, 64px`

### Border radius

```css
sm: 6px    /* Input, badge */
md: 10px   /* Card, button */
lg: 16px   /* Modal, panel */
xl: 24px   /* Large card */
```

### Komponentlar uslubi

- **Tugmalar:** Filled (primary), Outlined (secondary), Ghost (tertiary)
- **Input:** Dark background `#1A1A24`, border `#2E2E42`, focus ring `#6366F1`
- **Card:** `bg-surface` foni, `border` chegarasi, `md` radius
- **Badge/Chip:** Kichik, rangdor, status uchun

---

## Sahifalar arxitekturasi

```
/                          → Landing page (marketing)
/auth/login                → Kirish
/auth/signup               → Ro'yxatdan o'tish
/auth/verify-email         → Email tasdiqlash
/auth/forgot-password      → Parol tiklash
/auth/reset-password       → Yangi parol

/dashboard                 → Asosiy sahifa (redirect → /dashboard/accounts)
/dashboard/accounts        → Instagram akkauntlar ro'yxati
/dashboard/accounts/connect → Instagram ulash (OAuth redirect)
/dashboard/accounts/[id]   → Akkaunt boshqaruvi
/dashboard/accounts/[id]/rules        → Qoidalar ro'yxati
/dashboard/accounts/[id]/rules/new    → Yangi qoida
/dashboard/accounts/[id]/rules/[rid]  → Qoidani tahrirlash
/dashboard/accounts/[id]/logs         → Faollik loglari
/dashboard/billing         → Tarif va to'lov
/dashboard/settings        → Profil sozlamalari
```

---

## API ulash

### Base URL

```
https://api.accio.uz
```

### Autentifikatsiya

JWT Bearer token. Login/signup dan olingan `access` token har so'rovda headerga qo'shiladi:

```http
Authorization: Bearer eyJ0eXAiOiJKV1Qi...
```

### Axios instance (tavsiya)

```typescript
// lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.accio.uz',
  headers: { 'Content-Type': 'application/json' },
})

// Har so'rovga token qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 da token yangilash
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refresh = localStorage.getItem('refresh_token')
        const { data } = await axios.post('https://api.accio.uz/api/v1/auth/refresh', { refresh })
        localStorage.setItem('access_token', data.access)
        error.config.headers.Authorization = `Bearer ${data.access}`
        return api.request(error.config)
      } catch {
        localStorage.clear()
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## Barcha API endpointlar

### AUTH

#### `POST /api/v1/auth/signup` — Ro'yxatdan o'tish

```typescript
// Request
{
  email: string       // required
  password: string    // min 8 chars, letter + digit
  full_name?: string
}

// Response 201
{
  id: string
  email: string
  full_name: string
  is_email_verified: boolean
}
```

#### `POST /api/v1/auth/login` — Kirish

```typescript
// Request
{
  email: string
  password: string
}

// Response 200
{
  access: string    // 7 kun amal qiladi
  refresh: string   // 30 kun amal qiladi
  user: {
    id: string
    email: string
    full_name: string
    is_email_verified: boolean
  }
}
```

#### `POST /api/v1/auth/refresh` — Token yangilash

```typescript
// Request
{ refresh: string }

// Response 200
{ access: string }
```

#### `POST /api/v1/auth/logout` — Chiqish

```typescript
// Request (Authorization header required)
{ refresh?: string }

// Response 204 No Content
```

#### `GET /api/v1/auth/me` — Profilni olish

```typescript
// Response 200
{
  id: string
  email: string
  full_name: string
  is_email_verified: boolean
}
```

#### `POST /api/v1/auth/verify-email` — Email tasdiqlash

```typescript
// Request
{ token: string }  // URL dan olingan token

// Response 200
{ status: "email verified" }

// Error 400
{ error: { code: "INVALID_TOKEN" } }
```

> Foydalanuvchi emailiga havola keladi: `https://yourfrontend.com/auth/verify-email?token=xxx`
> Frontend token ni URL dan olib shu endpointga POST qiladi.

#### `POST /api/v1/auth/resend-verification` — Tasdiqlash emailini qayta yuborish

```typescript
// Response 200
{ status: "verification email sent" | "already verified" }
```

#### `POST /api/v1/auth/request-password-reset` — Parol tiklash so'rovi

```typescript
// Request
{ email: string }

// Response 200 (email mavjud bo'lmasa ham xuddi shunday)
{ status: "if account exists, reset email has been sent" }
```

#### `POST /api/v1/auth/reset-password` — Parolni yangilash

```typescript
// Request
{
  token: string    // emaildagi havoladan
  password: string
}

// Response 200
{ status: "password reset successful" }
```

---

### INSTAGRAM OAUTH

#### `GET /api/v1/oauth/instagram/start` — OAuth URL olish

```typescript
// Response 200
{ auth_url: string }  // Instagram sahifasiga redirect URL

// Frontend: window.location.href = data.auth_url
```

#### `GET /api/v1/oauth/instagram/callback` — Callback (Backend o'zi boshqaradi)

Backend Instagram dan callback oladi va frontendga redirect qiladi:

- **Muvaffaqiyat:** `/dashboard/accounts?connected=success`
- **Xato:** `/dashboard/accounts?connected=error&reason=<reason>`

| reason kodi | Ma'nosi |
|-------------|---------|
| `oauth_denied` | Foydalanuvchi ruxsat bermadi |
| `oauth_state_invalid` | Muddati o'tgan yoki noto'g'ri token |
| `user_not_found` | Foydalanuvchi topilmadi |
| `token_exchange_failed` | Instagram token almashinuvi xatosi |
| `account_already_connected` | Bu IG akkaunt boshqa foydalanuvchiga ulangan |

---

### INSTAGRAM AKKAUNTLAR

#### `GET /api/v1/accounts/` — Akkauntlar ro'yxati

```typescript
// Response 200
{
  count: number
  next: string | null
  previous: string | null
  results: IGAccount[]
}

interface IGAccount {
  id: string
  ig_user_id: string
  username: string
  account_type: "business" | "creator"
  is_active: boolean
  webhook_subscribed: boolean
  token_expires_at: string  // ISO date
  connected_at: string
}
```

#### `GET /api/v1/accounts/{id}` — Akkaunt ma'lumoti

```typescript
// Response 200: IGAccount object
```

#### `DELETE /api/v1/accounts/{id}` — Akkauntni uzish

```typescript
// Response 204 No Content
```

#### `POST /api/v1/accounts/{id}/refresh-token` — Tokenni yangilash

```typescript
// Response 200
{ status: "queued" }
```

#### `GET /api/v1/accounts/{id}/posts` — Instagram postlar

```typescript
// Query params
limit?: number   // default 20, max 50
after?: string   // keyingi sahifa cursori
before?: string  // oldingi sahifa cursori

// Response 200
{
  data: Post[]
  paging: {
    cursors: {
      after: string
      before: string
    }
  }
}

interface Post {
  id: string
  caption?: string
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  media_url?: string
  thumbnail_url?: string
  timestamp: string
  like_count: number
  comments_count: number
  permalink: string
}
```

#### `GET /api/v1/accounts/{id}/posts/{media_id}/children` — Karusel ichidagi rasmlar

```typescript
// Response 200
{
  data: {
    id: string
    media_type: "IMAGE" | "VIDEO"
    media_url?: string
    thumbnail_url?: string
    timestamp: string
  }[]
}
```

---

### QOIDALAR (RULES)

Barcha qoidalar endpointlari: `/api/v1/accounts/{account_id}/rules/`

#### `GET /api/v1/accounts/{id}/rules/` — Qoidalar ro'yxati

```typescript
// Response 200: Rule[]
interface Rule {
  id: string
  name: string
  trigger_type: "comment" | "dm"
  keywords: string[]
  match_mode: "any" | "all" | "exact"
  target_media_id: string       // bo'sh = barcha postlar
  response_text: string[]       // reply matnlari (tasodifiy biri yuboriladi)
  dm_response_text: string[]    // DM matnlari (BOTH action uchun)
  response_action: "reply_comment" | "send_dm" | "reply_comment_and_dm"
  is_active: boolean
  priority: number              // kattaroq = avval tekshiriladi
  created_at: string
  updated_at: string
}
```

#### `POST /api/v1/accounts/{id}/rules/` — Yangi qoida

```typescript
// Request
{
  name: string                  // required
  trigger_type: "comment" | "dm"
  keywords: string[]            // 1-50 ta, har biri 1-100 char
  match_mode: "any" | "all" | "exact"
  target_media_id?: string      // bo'sh qoldirish = barcha postlar
  response_text: string[]       // 1-20 ta, har biri 1-1000 char
  dm_response_text?: string[]   // reply_comment_and_dm uchun majburiy
  response_action: "reply_comment" | "send_dm" | "reply_comment_and_dm"
  is_active?: boolean           // default true
  priority?: number             // default 0
}

// Response 201: Rule object

// Error 402 — Free plan limiti (5 qoida)
{ error: { code: "PLAN_LIMIT_REACHED" } }
```

**`response_action` qoidasi:**

| action | response_text | dm_response_text |
|--------|--------------|-----------------|
| `reply_comment` | Comment reply uchun | Kerak emas |
| `send_dm` | DM uchun | Kerak emas |
| `reply_comment_and_dm` | Comment reply uchun | DM uchun (majburiy) |

#### `PATCH /api/v1/accounts/{id}/rules/{rid}` — Qoidani yangilash

```typescript
// Request: istalgan maydonlar
{ is_active?: boolean, name?: string, ... }

// Response 200: yangilangan Rule object
```

#### `DELETE /api/v1/accounts/{id}/rules/{rid}` — Qoidani o'chirish

```typescript
// Response 204
```

---

### FAOLLIK LOGLARI

#### `GET /api/v1/accounts/{id}/logs/comment-logs` — Comment loglari

```typescript
// Query params
status?: "received" | "matched" | "replied" | "failed" | "ignored"

// Response 200 (cursor pagination)
{
  next: string | null
  previous: string | null
  results: CommentLog[]
}

interface CommentLog {
  id: string
  ig_comment_id: string
  ig_media_id: string
  commenter_ig_id: string
  commenter_username: string
  comment_text: string
  matched_rule: string | null   // Rule ID
  status: "received" | "matched" | "replied" | "failed" | "ignored"
  reply_text: string
  replied_at: string | null
  created_at: string
}
```

#### `GET /api/v1/accounts/{id}/logs/message-logs` — DM loglari

```typescript
// Query params
status?: "received" | "matched" | "replied" | "failed" | "ignored"

// Response 200
{
  next: string | null
  previous: string | null
  results: MessageLog[]
}

interface MessageLog {
  id: string
  ig_message_id: string
  sender_ig_id: string
  direction: "inbound" | "outbound"
  message_text: string
  matched_rule: string | null
  status: string
  replied_at: string | null
  created_at: string
}
```

---

### DASHBOARD STATISTIKA

#### `GET /api/v1/dashboard/{account_id}/stats/` — Statistika

```typescript
// Query params
days?: number   // default 30, max 90

// Response 200
{
  total_comments: number
  total_messages: number
  matched_rules: number
  unanswered_comments: number
  unanswered_messages: number
  top_keywords: { keyword: string; count: number }[]
  activity_by_day: { date: string; comments: number; messages: number }[]
}
```

---

### BILLING (TO'LOV)

#### `POST /api/v1/billing/checkout/` — Pro tarifga o'tish

```typescript
// Response 200
{ checkout_url: string }  // Stripe sahifasiga redirect

// Frontend:
window.location.href = data.checkout_url
```

Stripe muvaffaqiyatdan keyin frontendga redirect:
- `/dashboard/billing?session=success`
- `/dashboard/billing?session=canceled`

#### `POST /api/v1/billing/portal/` — Obuna boshqaruvi

```typescript
// Response 200
{ portal_url: string }

// Error 400 — obuna yo'q
{ error: { code: "no_subscription" } }
```

---

## Xato kodlari

```typescript
// Barcha xatolik formati
{
  error: {
    code: string
    message: string
    details?: object
  }
}
```

| HTTP | Kod | Ma'nosi |
|------|-----|---------|
| 400 | `INVALID_TOKEN` | Noto'g'ri token |
| 401 | — | Autentifikatsiya kerak |
| 402 | `PLAN_LIMIT_REACHED` | Free plan limiti |
| 403 | `WEBHOOK_SIGNATURE_INVALID` | Webhook imzo xatosi |
| 404 | — | Topilmadi |
| 502 | `ig_api_error` | Instagram API xatosi |

---

## Autentifikatsiya oqimi

```
1. POST /api/v1/auth/login
   → access + refresh tokenlarni localStorage ga saqlash

2. Har so'rovda: Authorization: Bearer {access}

3. 401 xato → POST /api/v1/auth/refresh { refresh }
   → yangi access tokenni saqlash, so'rovni qayta yuborish

4. Refresh ham ishlamasa → /auth/login ga redirect
```

---

## Instagram akkaunt ulash oqimi

```
1. GET /api/v1/oauth/instagram/start
   → auth_url olish

2. window.location.href = auth_url
   → foydalanuvchi Instagram da ruxsat beradi

3. Backend callback ni oladi → frontendga redirect qiladi:
   /dashboard/accounts?connected=success
   yoki
   /dashboard/accounts?connected=error&reason=...

4. Frontend URL parametrlarini tekshiradi → toast ko'rsatadi
```

---

## Sahifa dizayn tavsiyalari

### Dashboard asosiy sahifasi
- Yuqori: Statistika kartochkalari (total comments, messages, matched, unanswered)
- O'rta: Faollik grafigi (line chart, `activity_by_day` dan)
- Pastki: So'nggi loglar jadval (comment + message)

### Akkauntlar sahifasi
- Instagram akkaunt kartochkasi: avatar placeholder, username, status badge
- "Instagram ulash" tugmasi (OAuth start)
- Akkaunt kartochkasida: webhook holati, token tugash muddati

### Qoidalar sahifasi
- Jadval view: nom, trigger, keywords (chip), status toggle
- Drag & drop priority (ixtiyoriy)
- Yangi qoida formasi: step-by-step wizard yoki full form

### Qoida yaratish formasi
1. **Trigger:** `comment` yoki `dm` (radio/tabs)
2. **Keywords:** Tag input (Enter bilan qo'shish), match mode select
3. **Target post:** "Barcha postlar" yoki dropdown (akkaunt postlaridan)
4. **Response action:** 3 ta variant (cards yoki radio)
5. **Response text:** Textarea, har qator = bitta variant (random yuboriladi)
6. **DM text:** Faqat `reply_comment_and_dm` tanlanganda ko'rinadi

### Log sahifasi
- Tabs: Comments / Messages
- Filter: Status bo'yicha (received, matched, replied, failed, ignored)
- Jadval: vaqt, foydalanuvchi, matn, qaysi qoida, status, reply matni

### Billing sahifasi
- Free plan: imkoniyatlar ro'yxati + "Pro ga o'tish" tugmasi
- Pro plan: faol obuna info + "Obunani boshqarish" (portal)

---

## Muhim UX qoidalar

1. **Email tasdiqlanmagan** foydalanuvchiga banner ko'rsating — "Email tasdiqlang" tugmasi bilan
2. **Instagram akkaunt ulanmagan** holda rules sahifasiga kirsa — "Avval akkaunt ulang" sahifaga yo'naltiring
3. **Free plan 5 qoida** limiti yetganda — to'g'ridan billing sahifasiga yo'naltiruvchi modal ko'rsating
4. **Token tugash muddati** yaqinlashsa (7 kun qolsa) — akkaunt kartochkasida ogohlantirish
5. **Webhook subscribed = false** bo'lsa — akkaunt kartochkasida "Webhook ulanmagan" badge va "Qayta ulash" tugmasi
6. OAuth redirect dan qaytganda `?connected=success/error` parametrini tekshirib toast ko'rsating

---

## Swagger UI

Barcha endpointlarni interaktiv sinash uchun:

```
https://api.accio.uz/api/docs/
```
