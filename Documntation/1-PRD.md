# Product Requirements Document (PRD)

**Product:** VisaGate — Online Visa Application & Tracking Portal *(working name; replace with your brand)*
**Document ID:** VG-PRD-001
**Version:** 1.1 (Re-baselined for MERN stack + Cloudinary)
**Date:** 18 October 2026
**Status:** Draft
**Owner:** Product Management
**Related documents:** `2-TRD.md`, `3-UI-UX.md`, `4-Backend-Schema.md`

---

## Document Control

| Version | Date       | Author  | Description        |
|---------|------------|---------|--------------------|
| 0.1     | 2026-10-17 | Product | Initial draft      |
| 1.0     | 2026-10-17 | Product | Baseline for review |
| 1.1     | 2026-10-18 | Product | Re-baselined: MERN stack, Cloudinary file storage, MongoDB data model |

**Approvals required:** Product Owner · Engineering Lead · Design Lead · Legal/Compliance · Security Lead

---

## 1. Executive Summary

VisaGate is a bilingual (Arabic/English, with room for more languages), mobile-first web portal that lets travelers, residents, sponsors and organizations **discover the right visa, check requirements, apply online, pay fees, upload documents, track applications and download issued visa documents** — without visiting an embassy or consulate for standard cases.

The product is inspired by the user experience of modern national e-visa platforms, which consolidate many visa categories (visit, transit, work, pilgrimage, residence, study, special) behind one search-driven front door, one personal profile and one tracking tool. VisaGate re-implements that proven pattern as an **independent, original-brand platform** with a configurable rules engine so that visa types, fees, eligibility and required documents are managed through an admin console instead of code.

> **Important positioning note.** VisaGate is an independent product with its own brand, domain and visual identity. It must not present itself as, or imitate the branding of, any government authority. Where the operator is an authorized entity or is integrating with an official issuing authority, that relationship, legal basis and disclosures are defined in Section 12.

---

## 2. Background and Reference Analysis

Public information about the reference class of platforms (national unified visa portals launched in the Gulf region) indicates the following common capabilities, which inform scope:

- A **single entry point** for many visa categories (visit, transit, work, pilgrimage, residence, study, diplomatic/special, re-entry extension).
- A **smart search / visa finder** that tells the user which visas are available to them and what they need.
- A **personal profile** that speeds up repeat and renewal applications.
- **Application tracking** by application number or identity/passport number, with a viewable visa document on approval.
- Ability to **amend unsubmitted applications** and save progress.
- **Back-end integration with many agencies** (typically 30+ ministries, authorities and private-sector bodies) for verification.
- **Digital verification** using automation to improve accuracy and speed.
- Serving **multiple audiences**: foreign visitors, citizens/residents (as sponsors/inviters), businesses and government entities.

### 2.1 Problems Being Solved

| # | Problem | Impact |
|---|---------|--------|
| P1 | Users cannot easily tell which visa applies to them | High abandonment, wrong applications |
| P2 | Requirements are scattered across PDFs and websites | Rejections, rework, support load |
| P3 | Repeat applicants re-enter the same data | Friction, errors |
| P4 | Applicants lack visibility on status | Support calls, anxiety |
| P5 | Operators manage rules in code or spreadsheets | Slow policy changes, risk |
| P6 | Manual document checks are slow | Long processing times |

---

## 3. Goals, Non-Goals and Success Metrics

### 3.1 Product Goals
1. **G1 — Findability:** a user can identify the correct visa in under 60 seconds.
2. **G2 — Completion:** a first-time applicant completes an application in under 15 minutes (excluding document gathering).
3. **G3 — Transparency:** applicants always see current status, next step and expected timeline.
4. **G4 — Operability:** non-technical admins change visa types, fees, eligibility and document rules without a deployment.
5. **G5 — Trust & security:** protect passport and personal data to recognized standards.
6. **G6 — Inclusivity:** full Arabic RTL support and WCAG 2.2 AA accessibility.

### 3.2 Non-Goals (v1.0)
- Issuing visas autonomously without a human or authorized-system decision step.
- Native iOS/Android apps (responsive web/PWA only in v1).
- Biometric capture hardware integration.
- Hajj/Umrah package or hotel marketplace.
- Replacing an official government system of record.

### 3.3 Key Performance Indicators

| KPI | Target (6 months post-launch) | Measurement |
|-----|-------------------------------|-------------|
| Visa-finder → application-start conversion | ≥ 35% | Analytics funnel |
| Application completion rate | ≥ 70% | Started vs submitted |
| First-time-right submission (no info request) | ≥ 80% | Status history |
| Median time to decision (standard visa) | ≤ SLA configured per visa type | Application timestamps |
| Support tickets per 1,000 applications | ≤ 40 | Helpdesk |
| Core Web Vitals (LCP / INP / CLS) | ≤ 2.5s / ≤ 200ms / ≤ 0.1 (p75) | RUM |
| Availability | ≥ 99.9% monthly | Uptime monitoring |
| CSAT | ≥ 4.3 / 5 | Post-submit survey |

---

## 4. Users and Personas

| Persona | Description | Key needs |
|---------|-------------|-----------|
| **Traveler (Applicant)** — "Sara, 32, tourist" | First-time foreign visitor, mobile user | Clear eligibility, simple form, status updates |
| **Repeat / Business Traveler** — "Omar, 45" | Frequent visitor, multiple entries | Saved profile, fast re-apply, multiple travelers |
| **Family / Group Organizer** — "Lina" | Applies for spouse, children, parents | Multi-traveler application, one payment |
| **Sponsor / Inviter** — "Khalid, resident" | Invites relatives or employees | Invitation management, verification via ID |
| **Corporate / Agency Account** — "HR Team" | Bulk applications for employees/clients | Bulk upload, company profile, invoices |
| **Case Officer** | Reviews applications | Queue, checklists, decision tools, audit trail |
| **Supervisor** | Oversees officers | SLA dashboards, reassignment, approvals |
| **Content Manager** | Maintains pages, FAQs, announcements | CMS, versioning, translations |
| **System Administrator** | Configures platform | Visa catalog, fees, rules, roles, integrations |
| **Support Agent** | Helps applicants | Case lookup, tickets, safe impersonation (read-only) |

---

## 5. Scope

### 5.1 In Scope (by release)

| Release | Capability |
|---------|-----------|
| **MVP (R1)** | Public site, bilingual content, visa finder, requirements pages, registration/login (email + phone OTP), profile, visit-visa application (tourism, business, family/friends, medical), document upload, online payment, tracking, notifications, visa PDF download with QR verification, admin console (catalog, fees, rules), case-officer review workflow, helpdesk basics, audit logs |
| **R2** | Transit visas, work visas (seasonal/temporary/permanent) with employer/sponsor verification, sponsor invitations, corporate accounts & bulk applications, refunds workflow, appointment booking for in-person steps, advanced reporting |
| **R3** | Study, residence, escort, re-entry extension, special/diplomatic request intake, public API for authorized partners, chatbot assistance, PWA offline drafts |

### 5.2 Out of Scope
Pilgrimage logistics, flight/hotel booking, translation services marketplace, native apps.

### 5.3 Technology and Delivery Constraints
- **Stack:** MERN — MongoDB, Express.js, React, Node.js (TypeScript recommended end to end). No additional primary datastore is required for the MVP.
- **File and image storage:** Cloudinary for all uploaded documents, photos and generated PDFs. Applicant documents are stored as private (authenticated) assets, never as public URLs.
- **Hosting:** managed MongoDB (Atlas replica set), container/PaaS hosting for the API and worker, static hosting with a CDN for the React apps (see `2-TRD.md`).
- **Trade-offs accepted with this choice:** (1) public pages are pre-rendered for SEO because React is a single-page app; (2) multi-document consistency relies on MongoDB transactions, which require a replica set; (3) the portal depends on Cloudinary's availability, region and compliance posture, so storage is placed behind an adapter that can be swapped if the regulator requires it.

---

## 6. Key User Journeys

### 6.1 J1 — Find and Apply for a Visit Visa (Primary)
1. Land on home page → enters nationality, purpose of travel, and travel dates in the **Visa Finder**.
2. System returns matching visa types with fee, validity, stay duration, processing time and required documents.
3. User selects a visa → **Start Application** (prompted to sign in/register; draft retained).
4. Wizard: Traveler details → Passport → Travel details → Accommodation/Invitation → Documents → Declarations → Review.
5. Pay fees (visa fee, service fee, insurance if applicable, taxes).
6. Receive confirmation number and email/SMS.
7. Track status; respond to any information request.
8. On approval, download visa PDF with QR code.

### 6.2 J2 — Track an Application (No Login)
Enter application number plus passport number (or national ID/residency ID/CR number for sponsors) → see status, key details, next step; if approved, view/download visa document after verification (OTP or CAPTCHA + second factor).

### 6.3 J3 — Amend a Draft
Signed-in user opens "My Applications" → resumes any *Draft* application → edits steps → submits. Submitted applications cannot be edited except through an officer-initiated *Information Requested* state.

### 6.4 J4 — Group/Family Application
Organizer adds multiple travelers (from saved travelers or new) → each traveler completes personal and passport data → single consolidated payment → per-traveler visa outcome.

### 6.5 J5 — Case Officer Review
Officer opens queue → claims case → sees applicant data, documents with viewer, automated checks, history → decides: Approve / Reject (with reason code) / Request Information / Escalate.

---

## 7. Functional Requirements

Priority uses MoSCoW: **M** Must, **S** Should, **C** Could. Release in the last column.

### 7.1 Public Website and Content (FR-PUB)

| ID | Requirement | Pri | Rel |
|----|-------------|-----|-----|
| FR-PUB-01 | Home page with hero, visa finder, popular visas, how-it-works, announcements, FAQ teaser | M | R1 |
| FR-PUB-02 | Language switcher (Arabic/English) with persistent preference; full RTL layout | M | R1 |
| FR-PUB-03 | Visa catalog pages grouped by category with SEO-friendly URLs | M | R1 |
| FR-PUB-04 | Visa detail page: description, eligibility, fees, validity, stay, processing time, documents, FAQs, "Apply" CTA | M | R1 |
| FR-PUB-05 | Country-specific eligibility notice (e.g., visa-exempt, e-visa, embassy-only) | M | R1 |
| FR-PUB-06 | Static pages (About, Contact, Terms, Privacy, Accessibility, Cookie policy) managed in CMS | M | R1 |
| FR-PUB-07 | FAQ with search and categories | M | R1 |
| FR-PUB-08 | Announcements/alerts banner (e.g., maintenance, policy changes) | S | R1 |
| FR-PUB-09 | Sitemap, robots, structured data (FAQ, Breadcrumb); public pages pre-rendered (static generation) for SEO because the frontend is a React single-page app | S | R1 |
| FR-PUB-10 | Cookie consent with granular categories | M | R1 |

### 7.2 Visa Finder (FR-FND)

| ID | Requirement | Pri | Rel |
|----|-------------|-----|-----|
| FR-FND-01 | Inputs: nationality, purpose, residence country (optional), travel dates, number of travelers | M | R1 |
| FR-FND-02 | Results ranked by relevance; show eligibility outcome per visa (Eligible / Conditional / Not eligible + reason) | M | R1 |
| FR-FND-03 | Free-text smart search with synonyms and Arabic/English normalization | S | R1 |
| FR-FND-04 | Rules evaluated server-side by the configurable eligibility engine | M | R1 |
| FR-FND-05 | Shareable result URL (no personal data in URL) | C | R2 |

### 7.3 Accounts and Profile (FR-ACC)

| ID | Requirement | Pri | Rel |
|----|-------------|-----|-----|
| FR-ACC-01 | Register with email + password and verify via email link/OTP | M | R1 |
| FR-ACC-02 | Phone number verification via SMS OTP | M | R1 |
| FR-ACC-03 | Login, logout, forgot/reset password, session list and revoke | M | R1 |
| FR-ACC-04 | Optional MFA (TOTP); mandatory for staff accounts | M | R1 |
| FR-ACC-05 | Profile with personal data, contact, passport info, saved travelers | M | R1 |
| FR-ACC-06 | Prefill applications from profile; applicant can override | M | R1 |
| FR-ACC-07 | Data export and account deletion requests (subject to legal retention) | M | R1 |
| FR-ACC-08 | Social/national SSO connector (pluggable) | C | R3 |
| FR-ACC-09 | Corporate accounts with sub-users and roles | S | R2 |

### 7.4 Application Wizard (FR-APP)

| ID | Requirement | Pri | Rel |
|----|-------------|-----|-----|
| FR-APP-01 | Dynamic form rendered from a versioned **form schema** per visa type | M | R1 |
| FR-APP-02 | Autosave drafts at step completion and on interval; resume on any device | M | R1 |
| FR-APP-03 | Field-level validation (client and server) with clear, localized messages | M | R1 |
| FR-APP-04 | Passport data validation: MRZ checksum, expiry ≥ configured months beyond travel date | M | R1 |
| FR-APP-05 | Optional passport scan with OCR/MRZ extraction to prefill (user confirms) | S | R2 |
| FR-APP-06 | Conditional questions and sections (show/hide rules) | M | R1 |
| FR-APP-07 | Multi-traveler applications with per-traveler completion state | M | R1 |
| FR-APP-08 | Review step summarizing all data with edit links | M | R1 |
| FR-APP-09 | Declarations and consent capture with timestamp and version | M | R1 |
| FR-APP-10 | Unique application number (human-readable, non-guessable) | M | R1 |
| FR-APP-11 | Duplicate application detection (same passport + visa type + overlapping dates) | S | R1 |
| FR-APP-12 | Withdraw submitted application prior to decision; refund per policy | S | R2 |
| FR-APP-13 | Re-apply from a prior application (copy data) | S | R1 |

### 7.5 Documents (FR-DOC)

| ID | Requirement | Pri | Rel |
|----|-------------|-----|-----|
| FR-DOC-01 | Required documents list generated per visa type and applicant context | M | R1 |
| FR-DOC-02 | Upload via drag-drop/camera directly to Cloudinary using server-signed uploads; accepted types PDF, JPG, PNG (HEIC converted to JPEG on the device); configurable max size | M | R1 |
| FR-DOC-03 | Server-side verification of every uploaded asset (type, size, signature, folder) and malware scanning (Cloudinary moderation add-on if available on the plan, otherwise a scanner worker) before acceptance | M | R1 |
| FR-DOC-04 | Image quality hints (blur, size) for photo and passport | S | R2 |
| FR-DOC-05 | Per-document status (Pending, Accepted, Rejected with reason) | M | R1 |
| FR-DOC-06 | Secure, authorized, audited document access for officers and owners; documents are private (authenticated) Cloudinary assets and are never exposed through public URLs | M | R1 |

### 7.6 Fees and Payments (FR-PAY)

| ID | Requirement | Pri | Rel |
|----|-------------|-----|-----|
| FR-PAY-01 | Fee calculation from fee schedule: base fee, service fee, optional insurance, taxes/VAT, discounts | M | R1 |
| FR-PAY-02 | Card and local payment methods through PSP-hosted payment page/fields (no card data on our servers) | M | R1 |
| FR-PAY-03 | Payment status handling via webhooks; idempotent processing | M | R1 |
| FR-PAY-04 | Receipts/invoices (PDF) with tax details | M | R1 |
| FR-PAY-05 | Fee-exempt categories (e.g., government-funded) via rule | S | R1 |
| FR-PAY-06 | Refunds (full/partial) with approval workflow and reason codes | S | R2 |
| FR-PAY-07 | Multi-currency display with settlement currency | C | R2 |
| FR-PAY-08 | Payment retry and abandoned-payment reminder | S | R1 |

### 7.7 Tracking and Visa Document (FR-TRK)

| ID | Requirement | Pri | Rel |
|----|-------------|-----|-----|
| FR-TRK-01 | Track by application number + passport number (or ID/CR number) | M | R1 |
| FR-TRK-02 | Status timeline with plain-language descriptions and next steps | M | R1 |
| FR-TRK-03 | Visa document PDF with QR code and public verification page | M | R1 |
| FR-TRK-04 | Rate limiting and CAPTCHA on public tracking to prevent enumeration | M | R1 |
| FR-TRK-05 | Information-request flow: applicant sees request, replies, uploads documents | M | R1 |

### 7.8 Notifications (FR-NTF)

| ID | Requirement | Pri | Rel |
|----|-------------|-----|-----|
| FR-NTF-01 | Email + SMS for: registration, submission, payment, info request, decision, expiry reminders | M | R1 |
| FR-NTF-02 | Template management with Arabic/English variants and variables | M | R1 |
| FR-NTF-03 | In-app notification center | S | R1 |
| FR-NTF-04 | User notification preferences (where legally permitted) | S | R2 |
| FR-NTF-05 | WhatsApp channel adapter | C | R3 |

### 7.9 Support (FR-SUP)

| ID | Requirement | Pri | Rel |
|----|-------------|-----|-----|
| FR-SUP-01 | Contact form and ticket creation linked to application | M | R1 |
| FR-SUP-02 | Ticket thread with attachments and status | M | R1 |
| FR-SUP-03 | Agent console: search by application/passport/email; read-only view of case | M | R1 |
| FR-SUP-04 | Knowledge base surfaced while writing a ticket | S | R2 |
| FR-SUP-05 | AI-assisted answers over published content | C | R3 |

### 7.10 Back-Office / Admin Console (FR-ADM)

| ID | Requirement | Pri | Rel |
|----|-------------|-----|-----|
| FR-ADM-01 | Visa catalog CRUD: categories, visa types, validity, stay, entries, processing SLA | M | R1 |
| FR-ADM-02 | Form schema builder (sections, fields, validations, conditionals) with versioning and preview | M | R1 |
| FR-ADM-03 | Eligibility rule builder (nationality groups, residence, age, purpose, etc.) | M | R1 |
| FR-ADM-04 | Document requirement configuration per visa/context | M | R1 |
| FR-ADM-05 | Fee schedule management with effective dates | M | R1 |
| FR-ADM-06 | Application queue with filters, assignment, SLA timers, bulk actions | M | R1 |
| FR-ADM-07 | Case view: data, documents, automated checks, notes, history, decision tools | M | R1 |
| FR-ADM-08 | Decision reason codes and templated communications | M | R1 |
| FR-ADM-09 | Role-based access control with fine-grained permissions | M | R1 |
| FR-ADM-10 | Maker-checker approval for sensitive config changes (fees, rules) | S | R2 |
| FR-ADM-11 | CMS for pages, FAQs, announcements with draft/publish and translations | M | R1 |
| FR-ADM-12 | Immutable audit log viewer with export | M | R1 |
| FR-ADM-13 | Operational dashboards (volume, SLA, rejection reasons, revenue) | S | R2 |
| FR-ADM-14 | Integration monitor (agency checks status, retries) | S | R2 |

### 7.11 Integrations (FR-INT)

| ID | Requirement | Pri | Rel |
|----|-------------|-----|-----|
| FR-INT-01 | Pluggable **verification adapter** framework (sanctions/watchlist, sponsor/employer registry, identity, insurance) | M | R1 (mock) / R2 (live) |
| FR-INT-02 | Async check execution with retries, timeouts, circuit breaker; results stored on the case | M | R1 |
| FR-INT-03 | PSP integration with webhook verification | M | R1 |
| FR-INT-04 | SMS/email provider abstraction with failover | M | R1 |
| FR-INT-05 | Outbound webhooks/API for authorized partners | C | R3 |

---

## 8. Application Lifecycle and Business Rules

### 8.1 Status Model

| Status | Description | Applicant action |
|--------|-------------|------------------|
| `DRAFT` | Being filled in | Edit, delete |
| `PENDING_PAYMENT` | Submitted, awaiting payment | Pay, cancel |
| `SUBMITTED` | Paid and received | Wait |
| `UNDER_REVIEW` | Assigned to an officer / automated checks running | Wait |
| `INFO_REQUESTED` | Officer needs more information | Respond within deadline |
| `APPROVED` | Decision made; visa being generated | Wait |
| `ISSUED` | Visa document available | Download |
| `REJECTED` | Declined with reason | View reason; re-apply |
| `WITHDRAWN` | Cancelled by applicant | None |
| `EXPIRED` | Draft/pending/info deadline lapsed | Re-apply |
| `CANCELLED` | Cancelled by operator | None |

Allowed transitions are defined in `4-Backend-Schema.md §8` and enforced in the domain layer.

### 8.2 Core Rules
- **BR-01:** A draft is auto-expired after 30 days of inactivity (configurable); a 7-day reminder is sent first.
- **BR-02:** `PENDING_PAYMENT` expires after 48 hours (configurable).
- **BR-03:** Information requests carry a deadline (default 7 days); on lapse the case moves to `EXPIRED` or `REJECTED` per visa-type policy.
- **BR-04:** Passport must be valid for at least *N* months (configurable, default 6) beyond the intended stay end.
- **BR-05:** One active application per traveler per visa type with overlapping travel dates.
- **BR-06:** Fees are calculated server-side using the fee schedule effective on the **submission date**; the amount is snapshotted onto the application.
- **BR-07:** Fees are refundable only in cases defined by policy; reason codes are mandatory.
- **BR-08:** Every decision requires a reason code and is recorded in the immutable audit log.
- **BR-09:** Issued visa documents are digitally signed and verifiable through a public QR URL exposing minimal data.
- **BR-10:** Applicants under the configurable minimum age require a guardian declaration.

---

## 9. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | p95 API latency < 400 ms for read endpoints; < 800 ms for writes; LCP ≤ 2.5 s on 4G mid-tier mobile |
| **Scalability** | Support 50,000 DAU and 5,000 concurrent users at launch; horizontal scale to 10× |
| **Availability** | 99.9% monthly for public and applicant flows; RPO ≤ 15 min, RTO ≤ 2 h |
| **Security** | OWASP ASVS L2; encryption in transit (TLS 1.2+) and at rest (AES-256); field-level encryption for passport/ID numbers; secrets in a vault |
| **Privacy** | Data minimization; consent logging; retention schedules; DSAR tooling |
| **Accessibility** | WCAG 2.2 AA; screen-reader tested in Arabic and English |
| **Localization** | Arabic (RTL) and English at launch; locale-aware dates (Gregorian + optional Hijri display), numbers and currency |
| **Browser support** | Last 2 versions of Chrome, Safari, Edge, Firefox; iOS 15+, Android 9+ |
| **Auditability** | Immutable audit trail for staff actions, config changes, decisions, data access to sensitive fields |
| **Observability** | Structured logs, metrics, traces, alerts, SLO dashboards |
| **Maintainability** | ≥ 80% unit-test coverage on domain logic; documented APIs (OpenAPI 3.1) |
| **Data residency** | MongoDB Atlas cluster region and Cloudinary storage must satisfy the operator's regulator (confirm before go-live; file storage sits behind an adapter so it can be swapped) |
| **Technology** | MERN stack (MongoDB, Express.js, React, Node.js; TypeScript recommended) with Cloudinary for files; see `2-TRD.md` |

---

## 10. Analytics and Reporting

- **Event tracking** (privacy-compliant, consent-gated): finder used, visa viewed, application started, step completed, step error, payment started/succeeded/failed, submitted, tracking used.
- **Funnels:** finder → detail → start → submit → paid.
- **Operational reports:** applications by status/type/nationality, processing time, SLA breaches, officer throughput, rejection reasons, revenue and refunds.
- **Exports:** CSV/XLSX with role-restricted access and audit logging.

---

## 11. Release Plan (Indicative)

| Phase | Duration | Outcome |
|-------|----------|---------|
| Discovery & design | 4 weeks | Validated flows, design system, final scope |
| MVP build (R1) | 16 weeks | Public site, applicant flow, admin, payments, notifications |
| Hardening & UAT | 4 weeks | Security testing, load testing, accessibility audit, UAT |
| Pilot launch | 2 weeks | Limited nationalities/visa types, monitored |
| General availability | — | Phased rollout |
| R2 | +14 weeks | Transit, work visas, corporate, refunds, reporting |
| R3 | +14 weeks | Remaining categories, partner API, chatbot |

---

## 12. Compliance, Legal and Policy

- **Positioning & branding:** independent brand; clear statement of operator identity and legal status on every page footer and in Terms.
- **Authority relationship:** where the portal submits to or receives decisions from an official issuing authority, a formal integration agreement and technical specification must exist before go-live. Without it, the portal operates only within the scope its operator is legally authorized to perform.
- **Data protection:** align with applicable laws (e.g., Saudi PDPL, GDPR where EU residents apply); lawful basis, notices, DPO contact, cross-border transfer controls, breach notification procedure.
- **Payments:** PCI DSS scope reduced to SAQ-A via hosted payment fields.
- **Security governance:** ISO/IEC 27001-aligned controls; annual penetration test; vulnerability disclosure policy.
- **Accessibility statement** published and maintained.
- **Records retention:** configurable by data class; legal hold support.

---

## 13. Risks and Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|-----------|
| R-01 | Fraud / fake applications | M | H | Rate limits, CAPTCHA, duplicate detection, watchlist checks, payment risk scoring |
| R-02 | Enumeration of application data via tracking | M | H | Two-factor lookup, non-sequential IDs, throttling, minimal data display |
| R-03 | Agency integrations delayed | H | M | Adapter pattern with mocks; manual verification fallback |
| R-04 | Policy/fee changes at short notice | H | M | Rules engine and effective-dated fee schedules |
| R-05 | Peak seasonal load | M | H | Autoscaling, queue-based async work, CDN, load tests at 3× forecast |
| R-06 | Data breach of identity documents | L | H | Encryption, strict RBAC, DLP, access logging, short-lived signed URLs |
| R-07 | Translation quality issues | M | M | Professional translation workflow and linguistic QA |
| R-08 | Scope creep from many visa categories | H | M | Strict release scoping; configurable engine reduces per-visa dev |
| R-09 | Cloudinary outage, quota/cost overrun, or residency/compliance restriction for identity documents | M | H | Private (authenticated) assets, storage adapter abstraction, client-side image compression, usage alerts, DPA review, tested fallback to S3-compatible storage |
| R-10 | Single-page app weakens SEO and first-load speed on public pages | M | M | Pre-render public pages, code-splitting, CDN, Core Web Vitals budgets |
| R-11 | Data inconsistency without relational constraints | M | H | Mongoose plus DB-level JSON Schema validation, transactions for multi-document writes, nightly integrity checks |

---

## 14. Assumptions, Dependencies and Open Questions

**Assumptions**
- Operator provides legal entity, branding, and payment merchant account.
- Visa policy content (eligibility, fees, documents) supplied by operator's policy team.

**Dependencies**
- PSP, SMS and email provider contracts; MongoDB Atlas and Cloudinary accounts (plans sized to forecast volume); cloud hosting account in the required region.
- Official/agency API access (if applicable) and test environments.

**Open Questions**
1. Which visa categories and nationalities are in the pilot?
2. Is the portal the decision-maker, or does it forward to an official issuing system?
3. Which payment methods are required locally (cards, mada-style debit, Apple Pay, bank transfer)?
4. Is Hijri date display required in addition to Gregorian?
5. Required data-residency region and retention periods?
6. Is a corporate/agency tier needed for MVP?
7. Is Cloudinary acceptable to the regulator for passport and identity documents (storage region, DPA), or is in-country storage required?

---

## 15. Acceptance Criteria (MVP Exit)

1. All **Must** requirements in Section 7 for R1 pass UAT.
2. No open Critical/High security findings from penetration test.
3. WCAG 2.2 AA audit passed for the 10 key pages and the application wizard.
4. Load test passes at 3× forecast peak with SLOs met.
5. Disaster-recovery drill meets RPO/RTO.
6. Legal sign-off on Terms, Privacy, Cookie policy, and authority-relationship statement.

---

## Appendix A — Glossary

| Term | Meaning |
|------|---------|
| **Applicant** | Person for whom a visa is requested |
| **Applicant account holder** | User who created the account and may apply for several travelers |
| **Sponsor / Inviter** | Resident/citizen/company that invites a visitor or employee |
| **Visa type** | A specific visa product (e.g., Tourist Single-Entry) |
| **Visa category** | Group of visa types (Visit, Transit, Work…) |
| **Form schema** | Versioned JSON definition of an application form |
| **Rule engine** | Component evaluating eligibility, documents and fees |
| **PSP** | Payment Service Provider |
| **MRZ** | Machine-Readable Zone on a passport |
| **SLA** | Service level agreement (processing time commitment) |

## Appendix B — Visa Category Catalog (Initial Taxonomy)

| Category | Visa types |
|----------|------------|
| Visit | Tourism · Business · Family/Friends · Medical · Religious visit (non-pilgrimage scope per operator) |
| Transit | Air · Land · Sea |
| Work | Seasonal · Temporary · Permanent |
| Residence | Residence · Escort/Dependent |
| Study | Student |
| Special | Diplomatic · Special/Official · Cargo/Transport driver |
| Services | Re-entry extension · Visa verification |
