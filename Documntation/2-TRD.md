# Technical Requirements Document (TRD)

**Product:** VisaGate — Online Visa Application & Tracking Portal *(working name)*
**Document ID:** VG-TRD-001
**Version:** 1.1 (MERN stack + Cloudinary)
**Date:** 18 October 2026
**Owner:** Engineering / Architecture
**Related documents:** `1-PRD.md`, `3-UI-UX.md`, `4-Backend-Schema.md`

---

## Document Control

| Version | Date       | Author       | Description |
|---------|------------|--------------|-------------|
| 1.0     | 2026-10-17 | Architecture | Initial baseline (PostgreSQL/NestJS/Next.js variant) |
| 1.1     | 2026-10-18 | Architecture | Re-baselined for MERN (MongoDB, Express, React, Node) and Cloudinary file storage |

---

## 1. Purpose and Scope

This document specifies the technical architecture, technology choices, interfaces, security controls, infrastructure and engineering practices needed to implement `1-PRD.md` using the **MERN stack** and **Cloudinary** for all images and files. Requirement IDs (e.g., `FR-APP-04`) are referenced for traceability.

### 1.1 Stack Constraints
- **M**ongoDB (Atlas replica set) · **E**xpress.js · **R**eact · **N**ode.js — TypeScript recommended end to end (plain JavaScript is possible but not advised for a system of this size).
- **Cloudinary** for every uploaded document, photo and generated PDF.
- No additional primary datastore. Redis is **optional** (only if load requires it, see §9.2).

---

## 2. Architecture Overview

### 2.1 Architectural Style
A **modular monolith** API (Express) with a separate **worker process** for background jobs, two React single-page apps (applicant portal and staff console), MongoDB as the system of record and Cloudinary as the file store. Module boundaries are strict so Payments, Notifications or Documents can be extracted later.

### 2.2 Logical Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           Users / Browsers                           │
└───────────────┬──────────────────────────────────────┬───────────────┘
                │                                      │
        ┌───────▼────────┐                     ┌───────▼────────┐
        │ CDN (static)   │                     │ CDN (static)   │
        │ React app      │                     │ React admin    │
        │ (client)       │                     │ (staff)        │
        └───────┬────────┘                     └───────┬────────┘
                │         HTTPS  REST/JSON             │
                └───────────────┬──────────────────────┘
                        ┌───────▼────────┐
                        │ WAF / Load     │
                        │ balancer       │
                        └───────┬────────┘
                ┌───────────────▼────────────────┐
                │   API (Node.js + Express)      │
                │ ┌────────┐ ┌────────┐ ┌──────┐ │
                │ │ Auth   │ │ Catalog│ │ Apps │ │
                │ ├────────┤ ├────────┤ ├──────┤ │
                │ │ Rules  │ │ Files  │ │ Pay  │ │
                │ ├────────┤ ├────────┤ ├──────┤ │
                │ │ Notify │ │ CMS    │ │ Audit│ │
                │ └────────┘ └────────┘ └──────┘ │
                └───┬────────────┬──────────┬────┘
                    │            │          │ signed upload params,
          ┌─────────▼──────┐     │          │ admin API, webhooks
          │ MongoDB Atlas  │     │    ┌─────▼──────────┐
          │ (replica set)  │◀────┘    │  Cloudinary    │◀── browser uploads
          └─────────▲──────┘          │ (private files)│    (signed, direct)
                    │                 └────────────────┘
          ┌─────────┴──────────┐      ┌──────────────────┐
          │ Worker (Node)      │─────▶│ External services│
          │ Agenda jobs        │      │ PSP, SMS, Email, │
          └────────────────────┘      │ Agency adapters  │
                                      └──────────────────┘
```

### 2.3 Module Responsibilities

| Module | Responsibility | Key PRD refs |
|--------|---------------|--------------|
| **Auth & Identity** | Registration, login, MFA, sessions, RBAC | FR-ACC-* |
| **Catalog** | Categories, visa types, form schemas, versions | FR-ADM-01/02, FR-PUB-03/04 |
| **Rules Engine** | Eligibility, document requirements, fee calculation | FR-FND-*, FR-PAY-01 |
| **Applications** | Application aggregate, workflow/state machine, travelers, answers | FR-APP-* |
| **Files (Documents)** | Cloudinary signing, asset verification, scanning, secure access | FR-DOC-* |
| **Payments** | Fee snapshot, PSP orchestration, webhooks, refunds, invoices | FR-PAY-* |
| **Tracking** | Public lookup, visa PDF, QR verification | FR-TRK-* |
| **Case Management** | Queue, assignment, decisions, SLA timers | FR-ADM-06..08 |
| **Notifications** | Templates, channels, delivery tracking | FR-NTF-* |
| **CMS** | Pages, FAQs, announcements | FR-PUB-*, FR-ADM-11 |
| **Support** | Tickets, messages | FR-SUP-* |
| **Integrations** | Verification adapters, circuit breakers | FR-INT-* |
| **Audit** | Immutable event log | FR-ADM-12 |
| **Reporting** | Aggregation pipelines and exports | FR-ADM-13 |

### 2.4 Trade-offs of the MERN Choice (and mitigations)

| Topic | Consequence | Mitigation |
|-------|-------------|------------|
| React is a client-rendered SPA | Weaker SEO and slower first paint on public pages | Pre-render public pages at build time (static generation), code-splitting, CDN, Core Web Vitals budgets (§9) |
| MongoDB has no foreign keys / joins by default | Integrity depends on application code | Mongoose + `$jsonSchema` validators, transactions for multi-document writes, nightly integrity checks (§7) |
| Multi-document transactions need a replica set | Cannot use a standalone `mongod` | Atlas replica set in all non-local environments; `mongodb-memory-server` replica set in tests |
| No built-in job queue | Need background processing | Agenda (MongoDB-backed) — no Redis required for MVP |
| Cloudinary is a media platform, not a vault | Sensitive documents need strict configuration and a residency check | Authenticated assets, signed uploads, strict transformations, API-proxied access, storage adapter for future swap (§6.4, §8.8) |

---

## 3. Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Language** | TypeScript 5.x (Node.js 22 LTS) | Shared types between React and Express |
| **Frontend** | React 19 + Vite 6, React Router 7 | Fast builds, SPA, route-level code-splitting |
| **Pre-rendering** | `vite-react-ssg` (or `react-snap`) for public routes; `react-helmet-async` for meta tags | SEO for FR-PUB-* without leaving React |
| **UI** | Tailwind CSS 4 + Radix UI primitives + design system (`3-UI-UX.md`) | Accessibility, token theming, RTL via logical utilities |
| **Forms** | React Hook Form + Zod; schema-driven renderer | Dynamic forms from server schema |
| **Data fetching** | TanStack Query + Axios/fetch wrapper | Caching, retries, optimistic updates |
| **i18n** | `react-i18next` + ICU plugin | Arabic/English, plural rules |
| **Backend** | Express 5 (Node.js) | The "E" of MERN; minimal, well understood |
| **Validation** | Zod schemas shared from `packages/shared`, `zod-to-openapi` | One source of truth for client and server |
| **Database** | MongoDB 7+ on **Atlas** (M10+ replica set, multi-AZ) | The "M"; transactions, TTL/partial indexes, Atlas Search |
| **ODM** | Mongoose 8 (strict schemas, `optimisticConcurrency`) | Models, validation, hooks |
| **Migrations** | `migrate-mongo` | Index and data migrations |
| **Background jobs** | Agenda (MongoDB-backed scheduler/queue) | No extra infrastructure; BullMQ + Redis upgrade path |
| **Caching** | In-process LRU (`lru-cache`) for catalog/finder; HTTP caching headers | Avoids Redis for MVP |
| **File storage** | **Cloudinary** (Node SDK v2) | Signed direct uploads, authenticated delivery, image optimization |
| **PDF generation** | Puppeteer (headless Chromium) in worker; `pdf-lib` for signing metadata | Visa and receipt PDFs |
| **QR codes** | `qrcode` library; signed verification token | FR-TRK-03 |
| **Auth** | `jose` (ES256 JWT), `argon2`, `otplib` (TOTP) | Modern, audited libraries |
| **Security middleware** | `helmet`, `cors`, `hpp`, `express-rate-limit` (Mongo-backed store), `cookie-parser` | Hardening (§8.3) |
| **Email / SMS** | Nodemailer with SES/SendGrid; SMS aggregator behind provider interface | FR-INT-04 |
| **Payments** | PSP SDK behind a provider interface; hosted checkout / hosted fields | PCI SAQ-A |
| **CAPTCHA** | Cloudflare Turnstile or hCaptcha | FR-TRK-04 |
| **Logging / tracing** | `pino` + OpenTelemetry (`@opentelemetry/sdk-node`) → Grafana/Datadog; Sentry for errors | Observability |
| **Testing** | Vitest/Jest, Supertest, `mongodb-memory-server` (replica set), Playwright, axe-core, k6 | See §12 |
| **Containers & CI/CD** | Docker, GitHub Actions | Reproducible builds |
| **Secrets** | Platform secret manager (AWS/GCP/Render/Doppler) | No secrets in repo |

### 3.1 Hosting Options

| Option | Frontend | API + Worker | Database | Files | When |
|--------|----------|--------------|----------|-------|------|
| **A — Managed PaaS (recommended MVP)** | Vercel / Netlify / Cloudflare Pages | Render / Railway / Fly.io (Docker, 2+ instances, separate worker) | MongoDB Atlas | Cloudinary | Small team, fast launch |
| **B — Cloud containers** | S3 + CloudFront (or equivalent) | AWS ECS Fargate / Google Cloud Run (autoscaling) | MongoDB Atlas (dedicated, multi-region options) | Cloudinary | Higher traffic, stricter network control |
| **C — Self-managed VPS** | Nginx static | Docker Compose + PM2 behind Nginx | Atlas (still recommended) | Cloudinary | Lowest cost; more ops work |

---

## 4. Repository and Code Organization

Monorepo (npm or pnpm workspaces + Turborepo):

```
visagate/
├─ apps/
│  ├─ client/         # React SPA: public + applicant portal (Vite)
│  ├─ admin/          # React SPA: staff console (Vite)
│  ├─ api/            # Express HTTP server
│  └─ worker/         # Agenda jobs, schedulers, PDF rendering
├─ packages/
│  ├─ shared/         # Zod schemas, types, API contracts, event types
│  ├─ rules/          # Rules engine (pure, unit-testable)
│  ├─ form-engine/    # Schema → React renderer + validators
│  ├─ ui/             # Design system components + tokens
│  ├─ i18n/           # Message catalogs (ar, en)
│  └─ config/         # ESLint, TS, Prettier, Tailwind presets
├─ infra/             # Dockerfiles, deployment manifests, migrate-mongo scripts
├─ docs/              # ADRs, runbooks, API docs
└─ .github/workflows/
```

### 4.1 Backend Module Layout (apps/api)
```
src/modules/applications/
├─ applications.routes.ts       # Express router (+ auth/permission middleware)
├─ applications.controller.ts   # HTTP only: parse, call service, shape response
├─ applications.service.ts      # Use cases, transactions, workflow
├─ applications.repository.ts   # Mongoose queries (the only place that touches models)
├─ applications.model.ts        # Mongoose schema + indexes
├─ applications.state.ts        # State machine transition table
├─ applications.schemas.ts      # Zod request/response schemas (from packages/shared)
└─ index.ts
```
Rules: controllers never import models; modules talk through exported services or domain events (never another module's repository); every query on applicant-owned data goes through a repository method that **requires an owner scope** (§8.2).

---

## 5. API Specification

### 5.1 Conventions
- Base path `/api/v1`; breaking changes → `/v2`.
- JSON `camelCase`; ISO 8601 UTC timestamps; money as integer minor units + ISO 4217 currency.
- IDs: MongoDB `ObjectId` exposed as `id` (string). ObjectIds are not secret, so **every** endpoint enforces ownership/permissions. The public application reference is separate and non-guessable (`VG-XXXX-XXXX-XXXX`, Crockford Base32 from a CSPRNG + check digit).
- **Pagination:** cursor-based (`?limit=25&cursor=...`, cursor = encoded sort key + `_id`).
- **Filtering/sorting:** `?filter[status]=SUBMITTED&sort=-submittedAt` — whitelisted fields only, parsed through Zod (never forwarded to Mongo as raw objects).
- **Idempotency:** `Idempotency-Key` header required on payment and submit endpoints; stored in `idempotencyKeys` (TTL 24 h).
- **Errors:** RFC 9457 `application/problem+json`:
```json
{
  "type": "https://api.visagate.example/problems/validation-error",
  "title": "Validation failed",
  "status": 422,
  "code": "VALIDATION_ERROR",
  "traceId": "9f3c…",
  "errors": [{ "field": "passport.expiryDate", "code": "PASSPORT_EXPIRES_TOO_SOON", "message": "…" }]
}
```
- **Localization:** `Accept-Language: ar|en`; stable machine codes.
- **Rate limiting:** see §8.5; `RateLimit-*` headers.

### 5.2 Endpoint Catalog (MVP)

**Auth**

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Create account | Public |
| POST | `/auth/verify-email` | Confirm email token/OTP | Public |
| POST | `/auth/otp/send` · `/auth/otp/verify` | Phone OTP | Public/User |
| POST | `/auth/login` | Credentials → session | Public |
| POST | `/auth/mfa/verify` | TOTP challenge | Partial session |
| POST | `/auth/refresh` · `/auth/logout` | Rotate/revoke session | User |
| POST | `/auth/password/forgot` · `/auth/password/reset` | Reset flow | Public |
| GET | `/me/sessions` · DELETE `/me/sessions/{id}` | Session management | User |

**Profile**

| Method | Path | Description |
|--------|------|-------------|
| GET/PATCH | `/me/profile` | Personal data |
| GET/POST/PATCH/DELETE | `/me/travelers[/{id}]` | Saved travelers |
| POST | `/me/data-export` · `/me/deletion-request` | DSAR |

**Catalog & Finder**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/catalog/categories` | Categories |
| GET | `/catalog/visa-types?category=` | List |
| GET | `/catalog/visa-types/{slug}` | Detail (fees preview, docs, FAQs) |
| POST | `/finder/search` | Eligibility search `{nationality, purpose, travelDates…}` |
| GET | `/catalog/countries` | Countries + nationality groups |
| GET | `/catalog/visa-types/{slug}/form-schema` | Active form schema (versioned) |

**Applications**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/applications` | Create draft `{visaTypeId}` |
| GET | `/applications` | My applications |
| GET | `/applications/{id}` | Detail |
| PATCH | `/applications/{id}/steps/{stepKey}` | Save step data (validates step) |
| POST | `/applications/{id}/travelers` | Add traveler |
| POST | `/applications/{id}/quote` | Compute fee quote |
| POST | `/applications/{id}/submit` | Validate all, lock, create payment intent |
| POST | `/applications/{id}/withdraw` | Withdraw |
| POST | `/applications/{id}/info-responses` | Respond to info request |
| POST | `/applications/{id}/clone` | Re-apply |

**Files (Cloudinary)**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/applications/{id}/documents/upload-signature` | Validates intent (doc type, size, mime), returns Cloudinary signed upload params `{cloudName, apiKey, timestamp, signature, folder, publicId, type:"authenticated", uploadPreset, ...}` valid ~10 min |
| POST | `/applications/{id}/documents` | Register an uploaded asset `{publicId, documentTypeId, travelerId}`; server verifies it with Cloudinary before accepting |
| GET | `/applications/{id}/documents` | List with statuses |
| DELETE | `/applications/{id}/documents/{docId}` | Remove (draft/info-request only); deletes asset from Cloudinary |
| GET | `/documents/{id}/content` | Authorized, audited streaming (or short-lived URL, §6.4) |
| POST | `/webhooks/cloudinary` | Upload/moderation notifications (signature verified) |

**Payments**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/applications/{id}/payments` | Create payment session |
| GET | `/payments/{id}` | Status |
| POST | `/webhooks/psp/{provider}` | PSP webhook (signature verified) |
| GET | `/payments/{id}/receipt` | Receipt PDF (authorized stream) |

**Tracking (public)**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/tracking/lookup` | `{reference, passportNumber}` + CAPTCHA token → lookup token |
| GET | `/tracking/{lookupToken}` | Status summary |
| POST | `/tracking/{lookupToken}/otp` | Step-up to access visa document |
| GET | `/verify/{signedToken}` | Public visa verification (QR target) |

**Notifications / Support**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/me/notifications` · PATCH `/me/notifications/{id}/read` | In-app |
| POST/GET | `/support/tickets[/{id}]` · POST `/support/tickets/{id}/messages` | Tickets |

**Staff / Admin** (`/admin/*`, staff tokens + permission checks)

| Area | Examples |
|------|----------|
| Cases | `GET /admin/cases`, `POST /admin/cases/{id}/claim`, `POST /admin/cases/{id}/decision`, `POST /admin/cases/{id}/info-request`, `POST /admin/cases/{id}/notes` |
| Catalog | CRUD `/admin/categories`, `/admin/visa-types`, `/admin/form-schemas` (+ `/publish`), `/admin/eligibility-rules`, `/admin/document-requirements`, `/admin/fee-schedules` |
| Users/Roles | `/admin/staff`, `/admin/roles` |
| CMS | `/admin/pages`, `/admin/faqs`, `/admin/announcements` (images uploaded via the same signed-upload flow into a public CMS folder) |
| Audit/Reports | `GET /admin/audit-logs`, `GET /admin/reports/*` |
| Integrations | `GET /admin/integrations/checks`, `POST /admin/integrations/checks/{id}/retry` |

### 5.3 Events (Internal Domain Events)
`ApplicationSubmitted`, `PaymentSucceeded`, `PaymentFailed`, `DocumentScanned`, `ChecksCompleted`, `InfoRequested`, `DecisionMade`, `VisaIssued`, `ApplicationExpired`, `RefundProcessed`. Written to the `outboxEvents` collection **in the same transaction** as the state change and dispatched by the worker (transactional outbox). Consumers must be idempotent.

---

## 6. Core Component Design

### 6.1 Form Engine
- Visa-type forms are **versioned JSON schemas** (sections → steps → fields) with validation (Zod-compatible subset), conditional visibility (`showIf` expressions), data sources and i18n keys.
- The same schema (via `packages/form-engine`) drives client rendering, client validation, server validation (Express), review summary and admin preview.
- Submitted applications **pin** the schema version.
- Expression language: JSON-Logic subset (safe, no code execution).

```json
{
  "key": "travel_details",
  "title": {"en": "Travel details", "ar": "تفاصيل السفر"},
  "fields": [
    {"key": "arrivalDate", "type": "date", "required": true, "validation": {"min": "today+1d"}},
    {"key": "hasInvitation", "type": "boolean"},
    {"key": "inviterId", "type": "text", "showIf": {"==": [{"var": "hasInvitation"}, true]}}
  ]
}
```

### 6.2 Rules Engine
- Pure TypeScript package (`packages/rules`) evaluated **server-side**; admin-defined rules stored as JSON in MongoDB.
- Three rule sets: **eligibility** (nationality groups, purpose, residence, age), **documents** (conditional requirements), **fees** (components, taxes, exemptions).
- Deterministic and versioned; each evaluation result is stored with the rules version for audit.
- Priority + effective-date resolution; test console in admin.
- Catalog and rules are cached in-process (`lru-cache`, TTL 60 s) and invalidated by a `catalogVersion` counter bumped on publish (each API instance checks it with a lightweight query every few seconds).

### 6.3 Application Workflow (State Machine)
- Explicit transition table in `applications.state.ts` (see `4-Backend-Schema.md §8`).
- Every transition runs inside a **Mongo transaction** (`session.withTransaction`) that: (1) atomically updates the application with a conditional filter, (2) inserts `applicationStatusHistory`, (3) inserts `outboxEvents`, (4) inserts an `auditLogs` entry.
- Atomic guard — the update fails if another request changed the state first:
```ts
const res = await Application.findOneAndUpdate(
  { _id: id, status: from, __v: expectedVersion },
  { $set: { status: to, ...fields }, $inc: { __v: 1 } },
  { session, new: true }
);
if (!res) throw new ConflictError('STATE_CHANGED');
```
- Transactions are kept short (no network calls to PSP/Cloudinary inside them).

### 6.4 File Pipeline (Cloudinary)

**Principles:** documents are **private**, uploads are **signed**, the browser never gets a long-lived or public link, and the server trusts nothing the client reports.

1. **Request signature.** Client calls `POST /applications/{id}/documents/upload-signature` with `{documentTypeId, travelerId, mimeType, sizeBytes}`. The API checks ownership, application state (`DRAFT` or open info request), required-document rules, allowed MIME and size from `documentTypes`, then returns signed parameters from `cloudinary.utils.api_sign_request`:
   - `type: "authenticated"` (private delivery), `resource_type: "auto"`
   - `public_id`: server-generated random UUID — **no filenames or personal data**
   - `folder`: `visagate/{env}/applications/{applicationId}/{travelerId}`
   - `upload_preset`: a **signed** preset with `allowed_formats` (jpg, png, pdf), `use_filename=false`, `unique_filename=true`, `overwrite=false`, no eager/auto transformations
   - `timestamp`, `api_key`, `signature` (expires with the timestamp, ~10 min)
   - `context`/`tags`: only opaque IDs (e.g., `appId`, `docTypeCode`) — never PII
2. **Direct upload.** The browser POSTs the file to `https://api.cloudinary.com/v1_1/<cloud>/auto/upload` (XHR for progress). Client-side compression for photos (target ≤ 1.5 MB, long edge ≤ 2000 px) and HEIC → JPEG conversion happen first (`3-UI-UX.md §6.6`).
3. **Register & verify.** Client calls `POST /applications/{id}/documents` with the returned `public_id`. The API **does not trust the client's numbers**: it calls the Cloudinary Admin API (`api.resource`) to read `bytes`, `format`, `resource_type`, `type`, `folder`, `etag`, `width/height/pages`, then checks they match the signed intent (folder, type = `authenticated`, format allowed, size ≤ limit). Mismatch → asset deleted (`uploader.destroy`) and request rejected.
4. **Scan.** Document status `PENDING_SCAN`. Worker job `scanDocument`:
   - Preferred: Cloudinary malware-scanning/moderation add-on if enabled on your plan (result arrives via webhook `moderation` notification) — *verify availability and pricing for your plan*.
   - Fallback (always available): worker fetches the asset (signed Admin download URL), runs a magic-byte check and **ClamAV** (`clamd` container), and for PDFs rejects embedded JavaScript/launch actions.
   - Outcome → `CLEAN` or `INFECTED` (asset deleted, user notified to re-upload).
5. **Webhook.** `POST /webhooks/cloudinary` (notification URL configured per environment) verifies `X-Cld-Signature` / `X-Cld-Timestamp` using `cloudinary.utils.verify_notification_signature`; webhooks are used for moderation results and reconciliation, never as the only source of truth.
6. **Access.** Applicant documents are never delivered through public URLs.
   - **Default (recommended):** `GET /documents/{id}/content` — API checks permission (owner, or staff with `case:read`), writes an audit record, builds a **server-side signed** authenticated URL, and **streams** the bytes to the client (`Cache-Control: no-store`, `Content-Disposition` set, optional watermark for officer copies). Nothing reusable reaches the browser.
   - **Optional optimization:** short-lived URLs (`cloudinary.utils.private_download_url` with `expires_at` ≈ 60 s, or token-based authentication if your plan includes it) for large downloads — only after confirming the plan's capabilities.
   - Thumbnails for the officer viewer are requested as **signed transformations** (e.g., width-limited) so originals are not shipped unnecessarily.
7. **Metadata hygiene.** Photos are stored with metadata stripped on delivery (`fl_force_strip`) and never with GPS/EXIF exposed to staff by default.
8. **Generated files** (visa PDFs, receipts): rendered by the worker, uploaded server-side as `resource_type: "raw"`, `type: "authenticated"` into `visagate/{env}/issued/{applicationId}/` and referenced from `visas`/`invoices`.
9. **CMS images** (banners, icons): separate folder `visagate/{env}/cms/` using normal (public) delivery with optimized transformations — **only** for non-sensitive marketing content.
10. **Deletion & retention.** Retention jobs call `uploader.destroy` (with `invalidate: true`) for every asset of a purged application and record the result; legal-hold flag blocks deletion.
11. **Cost control.** Client-side compression, per-document size limits, no eager transformations, usage alerts on storage/bandwidth/transformation credits.
12. **Storage adapter.** All code uses a `FileStorage` interface (`createUploadIntent`, `verifyAsset`, `openStream`, `delete`, `uploadBuffer`). `CloudinaryStorage` is the implementation; an `S3Storage` implementation can replace it if the regulator or plan limits require (ADR-011).

### 6.5 Payment Flow
```
Client ─ submit ─▶ API: (txn) lock application, snapshot fee quote, create payment
Client ◀─ payment session (hosted page URL / client secret)
Client ─ pays at PSP ─▶ PSP
PSP ─ webhook (signed) ─▶ API: verify signature, idempotent upsert
API (txn): payment SUCCEEDED → application SUBMITTED → outbox event → notifications + checks
```
- Reconciliation job (nightly) compares PSP settlement reports with `payments`.
- Refunds use maker-checker (requester ≠ approver, enforced in service and by schema validation).
- Webhook replay-safe via unique `(provider, providerEventId)` index on `paymentEvents`.

### 6.6 Verification / Agency Adapters
```ts
interface VerificationAdapter {
  readonly code: string;                      // "WATCHLIST", "SPONSOR_REGISTRY", ...
  supports(app: ApplicationSnapshot): boolean;
  check(app: ApplicationSnapshot, ctx: CheckContext): Promise<CheckResult>;
}
type CheckResult = { status: 'PASS'|'FAIL'|'REVIEW'|'ERROR'; score?: number; details?: unknown; externalRef?: string };
```
- Executed as Agenda jobs with timeout (10 s default), exponential backoff + jitter, circuit breaker per adapter.
- MVP adapters: **Mock**, **Internal duplicate check**, **Passport rules**.
- A failed check never auto-rejects; it routes to officer review unless policy says otherwise.

### 6.7 Visa Document and Verification
- Worker renders a localized HTML template to PDF (Puppeteer), embeds QR, signs with an organization key (KMS/secret-managed ES256), uploads to Cloudinary (§6.4 item 8).
- QR encodes `https://<domain>/verify/<token>`; the token is a **signed, opaque** value; only its hash is stored in `visas.verificationTokenHash`.
- `GET /verify/{token}` returns minimal data (holder initials, visa type, validity, status) — never the passport number.

### 6.8 Notification Service
- Event-driven from the outbox; template + locale resolution; channels email, SMS, in-app.
- Delivery receipts stored in `notificationDeliveries`; provider failover on defined error classes.
- Per-recipient rate limits; SMS bodies PII-minimized.

---

## 7. Data Management

- **System of record:** MongoDB (see `4-Backend-Schema.md`). Replica set, `writeConcern: { w: "majority" }`, `readConcern: "majority"` for application, payment and decision collections.
- **Transactions:** used for every multi-document write that must be atomic (state transitions, payment confirmation, refunds, fee-schedule publication). Keep them short; retry on `TransientTransactionError`.
- **Schema enforcement (two layers):** Mongoose strict schemas in the app **and** `$jsonSchema` validators (`validationLevel: "strict"`, `validationAction: "error"`) on critical collections (`applications`, `payments`, `visas`, `auditLogs`).
- **No RLS in MongoDB.** Tenant/owner isolation is enforced in repositories (mandatory owner scope) plus tests that attempt cross-user access (§8.2).
- **Sensitive fields:** passport number, national ID and date of birth encrypted at application level (AES-256-GCM envelope, key from KMS/secret manager). Exact-match search uses **blind indexes** (HMAC-SHA-256 of normalized value). Upgrade path: MongoDB Queryable Encryption / CSFLE where the Atlas tier supports it.
- **Retention:** TTL indexes for ephemeral data (OTP, sessions, idempotency keys, in-app notifications); scheduled purge/anonymization jobs for the rest, including Cloudinary asset deletion; legal-hold flag blocks purge.
- **Backups:** Atlas continuous cloud backup (point-in-time recovery), cross-region copy if required, quarterly restore tests.
- **Indexes:** managed through `migrate-mongo`; `autoIndex` disabled in production.
- **Migrations:** forward-only, idempotent scripts; expand/contract approach for field changes.

---

## 8. Security Requirements

### 8.1 Authentication
- Passwords: Argon2id (memory ≥ 64 MB, t ≥ 3); breached-password check (k-anonymity); minimum 10 characters.
- Sessions: short-lived access JWT (10 min, ES256 via `jose`) + rotating refresh tokens (reuse detection through `sessions.familyId`) in `HttpOnly; Secure; SameSite=Lax` cookies. CSRF protection via double-submit token for cookie-authenticated mutations; CORS limited to known origins.
- MFA: TOTP (RFC 6238, `otplib`) with recovery codes; mandatory for staff; WebAuthn/passkeys in R2.
- OTP: 6 digits, 5-min expiry, max 5 attempts, per-destination and per-IP throttles; stored hashed with TTL.
- Progressive lockout; device/session list.

### 8.2 Authorization
- RBAC with permission strings (`case:decide`, `fee:write`, …) checked by Express middleware `requirePermission()`; object-level checks for applicant resources.
- **Mandatory scoping:** repository methods for applicant-owned collections take a `Scope` argument (`{ userId }` or `{ staff: true, permissions }`) and always add it to the filter; there is deliberately no unscoped `findById` for these collections. Integration tests assert user A can never read or modify user B's application, documents or payments.
- Staff scopes by visa category and queue.
- Support impersonation is **read-only**, time-boxed, reason-required and audited.

### 8.3 Application Security (OWASP ASVS L2 / Top 10)
- **NoSQL injection:** all inputs parsed by Zod with strict types; request bodies and query strings are never passed to Mongoose as filter objects; `$`-prefixed and dotted keys are rejected (`express-mongo-sanitize` as a second layer); `mongoose.set('sanitizeFilter', true)`.
- `helmet` with strict CSP (nonce/hashes for the SPA host), HSTS (preload), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; `hpp` against parameter pollution; body size limits (e.g., 1 MB JSON — files never pass through the API).
- Output encoding in React (no `dangerouslySetInnerHTML` except sanitized CMS content via DOMPurify).
- SSRF protections for outbound adapters (allow-lists, no internal ranges).
- Dependency scanning (`npm audit`/Snyk/Dependabot), SAST (Semgrep/CodeQL), secret scanning, container scanning; lockfile enforcement; SBOM generation.
- Anti-enumeration: uniform responses and timing on lookup/login/forgot flows; random public references; constant-time comparisons.
- Bot defense: WAF rules + CAPTCHA on registration, tracking, OTP sending.

### 8.4 Data Protection
- TLS 1.2+ everywhere (1.3 preferred); Atlas network peering/IP allow-list or private endpoints; database users with least privilege.
- Encryption at rest: Atlas encryption (with customer-managed keys if required); Cloudinary storage encryption per provider; application-level encryption for identity fields (§7).
- Key management: keys in KMS/secret manager, rotated annually or on incident; dual-key window for blind-index rotation.
- Logs never contain secrets, passport numbers or full PII — `pino` redaction paths configured centrally.

### 8.5 Rate Limiting (defaults)

| Endpoint group | Limit |
|----------------|-------|
| Login | 5 / 15 min / account+IP |
| OTP send | 3 / 10 min / destination; 10 / hour / IP |
| Tracking lookup | 10 / 10 min / IP + CAPTCHA |
| Finder search | 60 / min / IP |
| Upload signature | 30 / 10 min / user |
| Authenticated API | 300 / min / user |
| Webhooks | Provider IP allow-list + signature verification |

Implemented with `express-rate-limit` using a MongoDB-backed store (shared across instances); switch to Redis if request volume makes this a bottleneck.

### 8.6 Audit and Monitoring
- Append-only `auditLogs` with **hash chaining** (each entry stores the previous hash, maintained through an atomic update of `auditChainHeads` inside the same transaction); the database user used by the app has **insert-only** privileges on this collection (Atlas custom role); nightly integrity verification; periodic signed export to immutable (object-lock) storage.
- Security alerts: anomalous login, mass document access, privilege changes, repeated decision reversals, webhook signature failures.
- Annual third-party penetration test; vulnerability SLAs: Critical 48 h, High 7 d, Medium 30 d.

### 8.7 Compliance Mapping

| Control area | Implementation |
|--------------|----------------|
| PCI DSS (SAQ-A) | Hosted payment fields/pages; no PAN storage; TLS; annual attestation |
| PDPL / GDPR | Consent records, DSAR endpoints, retention jobs, DPAs with Atlas, Cloudinary and other processors, cross-border transfer review |
| ISO 27001 | Access reviews, change management, incident response |
| WCAG 2.2 AA | Automated + manual audits (`3-UI-UX.md §12`) |

### 8.8 Cloudinary Account Hardening Checklist
1. Applicant documents use **`type: authenticated`** only; verify no document asset exists with delivery type `upload`.
2. Enable **Strict transformations** and allow only named/signed transformations.
3. Use **signed** upload presets only (no unsigned presets); restrict `allowed_formats`.
4. Disable public asset listing (resource lists) and restrict allowed delivery types; configure **allowed fetch domains** (avoid open fetch/auto-upload features).
5. Separate Cloudinary **sub-accounts/product environments** (or at least API keys) for dev, staging, production; secrets in the secret manager; rotate API secret on staff changes.
6. Restrict API key usage: server-side only; the browser receives signatures, never the secret.
7. Configure notification URLs per environment and verify signatures on every webhook.
8. Confirm storage region/data residency, retention, backup behavior and DPA with Cloudinary against the regulator's requirements **before** processing real passports; keep the `FileStorage` adapter ready for an in-country alternative.
9. Enable usage alerts (storage, bandwidth, transformations) and review monthly.

---

## 9. Non-Functional Engineering Targets

| Area | Target | Approach |
|------|--------|----------|
| API latency | p95 < 400 ms reads / < 800 ms writes | Compound indexes, projections, lean queries, in-process caching, avoid N+1 population |
| Frontend | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 | Pre-rendered public pages, route-level code-splitting, CDN, subsetted Arabic fonts, Cloudinary-optimized images (`f_auto,q_auto`) for CMS imagery |
| Throughput | 500 RPS sustained, 2,000 RPS burst | Stateless API instances behind a load balancer, autoscaling, connection pool tuning, jobs offloaded to worker |
| Availability | 99.9% | Multi-AZ Atlas, ≥ 2 API instances, health checks, rolling deploys |
| RPO / RTO | ≤ 15 min / ≤ 2 h | Atlas PITR, tested runbooks |
| Scalability | 10× headroom | Atlas tier scaling, sharding plan for high-volume collections (§9.2), read replicas for reporting |

### 9.1 Capacity Baseline (Launch Forecast)
- 50k DAU · 20k applications/month · ~6 documents/application.
- Raw uploads ≈ 180 GB/month at 1.5 MB/doc; with client-side compression and PDF limits plan for **≈ 60–100 GB/month** of Cloudinary storage growth — size the Cloudinary plan for storage **and** bandwidth (officer views) and review monthly.
- Wizard autosave debounced to ≈ 1 write / 20 s / active applicant (~250 writes/s peak ceiling, reduced by step-boundary saves).

### 9.2 Scaling Path (when needed)
1. Vertical Atlas tier increase and read replicas for reporting/aggregations.
2. Add Redis for rate limiting, caching and BullMQ queues if Agenda/Mongo contention appears.
3. Shard or archive high-volume append-only collections (`auditLogs`, `notificationDeliveries`, `applicationStatusHistory`) by time.
4. Extract Notifications and Files into separate services behind the existing module interfaces.

---

## 10. Infrastructure and Deployment

### 10.1 Environments

| Env | Purpose | Data |
|-----|---------|------|
| `local` | Developer (Docker Compose: API, worker, Mongo replica set, ClamAV, MailHog) | Synthetic |
| `dev` | Integration | Synthetic |
| `staging` | Pre-prod parity, UAT, load tests | Anonymized/synthetic |
| `prod` | Live | Real |

Each environment has its own Atlas project/cluster, Cloudinary environment (or sub-account) and secrets.

### 10.2 Production Topology (Option A/B in §3.1)
- React apps as static assets on a CDN with SPA fallback and pre-rendered public routes.
- API: ≥ 2 containers across zones behind a load balancer + WAF; **worker**: ≥ 1 container (2 for HA, Agenda locks prevent double-processing).
- MongoDB Atlas: replica set (3 nodes, multi-AZ), IP allow-list/private endpoint, backups enabled.
- Cloudinary: production environment with hardening per §8.8.
- Outbound traffic only to allow-listed providers (PSP, SMS, email, Cloudinary, Atlas).

### 10.3 CI/CD Pipeline
1. **PR checks:** lint, type-check, unit tests, integration tests (replica-set memory server), contract tests, SAST, dependency/secret scan, Storybook visual tests.
2. **Build:** Docker images for `api` and `worker`, static builds for `client` and `admin`; image scan; SBOM.
3. **Deploy dev** automatically on merge to `main`.
4. **E2E (Playwright) + a11y (axe) + API contract tests** on dev/staging.
5. **Promote** to staging → manual approval → production using rolling or blue/green deploys with automated rollback on health/SLO failure.
6. **DB migrations** (`migrate-mongo up`) run as a pre-deploy job; expand/contract only.

### 10.4 Configuration
- 12-factor configuration through environment variables; schema-validated (Zod) at boot — the process refuses to start on missing or invalid config.
- Feature flags (simple config collection or OpenFeature provider) for risky features; kill switches for payments, Cloudinary uploads and external adapters.

### 10.5 Disaster Recovery
- Runbooks: Atlas restore/failover, API rollback, PSP outage, Cloudinary outage (uploads disabled gracefully, drafts preserved), key compromise.
- Cloudinary assets: periodic inventory export; if business policy requires, scheduled replication of document assets to a second storage location via the `FileStorage` adapter.
- Game-day exercise twice per year; measure RPO/RTO.

---

## 11. Observability and Operations

- **Logging:** `pino` JSON logs with `traceId`, hashed `userId`, `applicationId`; PII redaction; 30-day hot retention, longer cold retention per policy.
- **Metrics:** RED per route, Agenda queue depth/lag, Mongo operation latency and connection pool, Atlas metrics, business metrics (submissions, payment success rate, time-in-status), Cloudinary usage.
- **Tracing:** OpenTelemetry across React (web vitals/RUM) → API → worker → Mongo/external calls.
- **Alerts (examples):** error rate > 2% for 5 min; p95 latency SLO burn; payment success drop > 10%; job lag > 5 min; scan failures; webhook signature failures; Atlas replication lag or connection saturation; Cloudinary quota > 80%.
- **SLOs:** availability 99.9%; submit success ≥ 99.5%; notification delivery within 60 s p95.
- **Incident process:** severity matrix, status page, post-incident review within 5 business days.

---

## 12. Testing Strategy

| Level | Scope | Tooling | Target |
|-------|-------|---------|--------|
| Unit | Domain logic, rules, form-engine, utilities | Vitest/Jest | ≥ 80% on rules and workflow |
| Integration | Services + repositories with real MongoDB (replica set, transactions) | `mongodb-memory-server` / Testcontainers | Critical paths |
| Contract | API ↔ frontend, PSP and adapter stubs, Cloudinary SDK mocked | Zod/OpenAPI + Schemathesis | All public endpoints |
| Authorization | Cross-user access attempts (IDOR) on every owned resource | Supertest | 100% of owned collections |
| E2E | Journeys J1–J5 in Arabic and English | Playwright | Smoke every deploy, full nightly |
| Accessibility | Automated + manual | axe-core, Pa11y, NVDA/VoiceOver/TalkBack | 0 critical violations |
| Performance | Load/stress/soak | k6 | 3× forecast peak |
| Security | SAST, DAST, dependency, pen test | Semgrep, ZAP, third party | No Critical/High open |
| Resilience | Mongo failover, Cloudinary/PSP outages | Fault injection in staging | Quarterly |
| UAT | Business scenarios | Staging | Sign-off by Product/Ops |

**Cloudinary in tests:** unit tests use a fake `FileStorage`; staging runs a nightly smoke test against a dedicated Cloudinary test environment (upload → verify → scan → stream → delete). **Test data:** synthetic only; never real passports.

---

## 13. Internationalization (i18n) and Localization

- Locales: `ar` and `en`; architecture supports adding `fr`, `ur`, `hi`, `id`, `tr`, etc.
- All user-facing strings externalized (ICU MessageFormat via `react-i18next`) — no concatenation; Arabic has six plural forms.
- Database content is stored per locale as `{ en, ar }` objects with fallback chain `requested → en`.
- Tailwind **logical** utilities (`ms-*`, `ps-*`, `text-start`) and the `dir` attribute for RTL; mirrored icons where directional.
- Fonts: Arabic-capable family, subset and self-hosted (`3-UI-UX.md §5`).
- Dates/numbers via `Intl`; optional Hijri display; Western digits by default in forms.
- Search: Atlas Search with the `lucene.arabic` analyzer where available; otherwise MongoDB text index (`default_language: "none"`) with normalized Arabic text (strip diacritics/tatweel, normalize alef/ya forms) stored in a `searchText` field.
- Names: Arabic and Latin fields supported; transliteration helper; length/charset rules per locale.

---

## 14. Third-Party Integrations (Interface Contracts)

| Integration | Contract | Failure mode |
|-------------|----------|--------------|
| **Cloudinary** | `FileStorage` adapter: signed upload intent, asset verification (Admin API), authorized stream, delete, server upload, webhooks | Uploads paused with clear UI message; drafts preserved; reconciliation job after recovery |
| Payment (PSP) | Create session, webhook, refund, report | Retry + reconciliation; feature-flag fallback PSP |
| SMS | `send(to, template, vars)`; delivery receipts | Failover provider; email fallback for non-critical |
| Email | `send(to, template, vars)`; bounce/complaint webhooks | Suppression list management |
| Malware scan | Cloudinary add-on and/or ClamAV worker → verdict | Hold document in `PENDING_SCAN`; alert |
| Agency verification | `VerificationAdapter` | Timeout → `ERROR` → manual officer check |
| Identity/SSO (R3) | OIDC | Local login fallback |
| Analytics | Consent-gated, server-side proxy | Drop events silently |

---

## 15. Architecture Decision Records (Initial)

| ADR | Decision | Status |
|-----|----------|--------|
| ADR-001 | MERN with TypeScript in an npm/pnpm monorepo | Accepted (project constraint) |
| ADR-002 | Modular monolith + worker over microservices at MVP | Proposed |
| ADR-003 | MongoDB (Atlas replica set) as single system of record; transactions for multi-document invariants | Proposed |
| ADR-004 | Mongoose ODM with strict schemas + `$jsonSchema` validators on critical collections | Proposed |
| ADR-005 | Transactional outbox in MongoDB for domain events | Proposed |
| ADR-006 | Hosted payment fields (SAQ-A) | Proposed |
| ADR-007 | App-level field encryption + blind indexes for passport/ID | Proposed |
| ADR-008 | JSON-Logic subset for rules and conditions | Proposed |
| ADR-009 | Signed opaque tokens for visa verification QR | Proposed |
| ADR-010 | Cursor pagination everywhere | Accepted |
| ADR-011 | Cloudinary (authenticated assets, signed direct uploads, API-proxied access) behind a `FileStorage` adapter | Proposed — pending residency/DPA confirmation |
| ADR-012 | React SPA with build-time pre-rendering for public pages | Proposed |
| ADR-013 | Agenda (MongoDB-backed) for jobs; no Redis at MVP | Proposed |

---

## 16. Traceability Matrix (Summary)

| PRD area | TRD sections |
|----------|--------------|
| FR-PUB, FR-FND | §5.2 Catalog & Finder, §6.2, §13 |
| FR-ACC | §5.2 Auth/Profile, §8.1–8.2 |
| FR-APP | §6.1, §6.3, §5.2 Applications |
| FR-DOC | §6.4, §5.2 Files, §8.8 |
| FR-PAY | §6.5, §5.2 Payments |
| FR-TRK | §6.7, §5.2 Tracking, §8.3 |
| FR-NTF | §6.8 |
| FR-ADM | §5.2 Admin, §6.1–6.3, §8.2 |
| FR-INT | §6.6, §14 |
| NFRs | §7, §8, §9, §10, §11 |

---

## 17. Definition of Done (Engineering)

A story is done when: code reviewed (2 approvals for security-sensitive areas); tests added and passing (including an authorization test for any new owned resource); OpenAPI/Zod contracts updated; Mongo index and migration changes reviewed; i18n keys added for both locales; accessibility checks pass; logs/metrics added; feature flag and rollback plan documented; docs and runbooks updated.
