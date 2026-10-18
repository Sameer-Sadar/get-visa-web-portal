# UI/UX Specification

**Product:** VisaGate — Online Visa Application & Tracking Portal *(working name)*
**Document ID:** VG-UX-001
**Version:** 1.1 (React SPA + Cloudinary uploads)
**Date:** 18 October 2026
**Owner:** Design / UX
**Related documents:** `1-PRD.md`, `2-TRD.md`, `4-Backend-Schema.md`

---

## Document Control

| Version | Date       | Author | Description |
|---------|------------|--------|-------------|
| 1.0     | 2026-10-17 | UX     | Baseline specification |
| 1.1     | 2026-10-18 | UX     | Aligned with MERN (React SPA) and Cloudinary direct-upload flow; added §19 frontend implementation notes |

---

## 1. Design Vision and Principles

**Vision:** make a complex, high-stakes administrative process feel calm, clear and trustworthy — in Arabic and English, on any device.

| # | Principle | In practice |
|---|-----------|-------------|
| 1 | **Clarity over cleverness** | Plain language, one primary action per screen, no jargon |
| 2 | **Guide, don't gatekeep** | Visa Finder tells users *what applies to them* before forms begin |
| 3 | **Never lose work** | Autosave, resume anywhere, clear draft status |
| 4 | **Show where I am** | Progress indicator, status timeline, next-step message |
| 5 | **Trust by design** | Visible security cues, transparent fees, clear identity of operator |
| 6 | **Inclusive by default** | WCAG 2.2 AA, RTL-first thinking, low-bandwidth friendly |
| 7 | **Mobile-first** | Majority of applicants are on phones; thumb-friendly targets |
| 8 | **Error prevention & recovery** | Inline validation, helpful examples, undo/back without data loss |

**Brand personality:** professional, welcoming, calm, official-but-human. The visual identity is original to the operator and must **not** replicate any government authority's logo, emblem or color scheme.

---

## 2. Audience and Context of Use

| Segment | Context | Design implication |
|---------|---------|--------------------|
| First-time foreign visitor | Mobile, possibly slow data, non-native language | Simple wording, language switch always visible, minimal data per screen |
| Repeat traveler | Desktop/mobile | Prefill, saved travelers, shortcuts |
| Sponsor/inviter (resident) | Arabic-first | Strong RTL, ID-based flows |
| Corporate user | Desktop, bulk | Tables, import, filters |
| Case officer | Desktop, long sessions | Dense layouts, keyboard shortcuts, split-view |
| Support agent | Desktop | Fast search, read-only context |

---

## 3. Information Architecture

### 3.1 Sitemap — Public and Applicant Portal

```
Home
├─ Find a Visa (Visa Finder)
├─ Visas
│  ├─ Visit (Tourism · Business · Family/Friends · Medical)
│  ├─ Transit (Air · Land · Sea)
│  ├─ Work (Seasonal · Temporary · Permanent)
│  ├─ Residence & Dependents
│  ├─ Study
│  └─ Special & Services (Re-entry extension, verification)
│     └─ Visa Detail (Overview · Eligibility · Fees & Timing · Documents · FAQ)
├─ Apply
│  └─ Application Wizard (per visa type)
├─ Track Application
├─ Verify a Visa (QR landing)
├─ Help Center
│  ├─ FAQ
│  ├─ Guides & Requirements
│  └─ Contact Support / Create Ticket
├─ About · Terms · Privacy · Cookies · Accessibility
└─ Account
   ├─ Sign in / Register / Reset password
   ├─ My Applications
   ├─ My Travelers
   ├─ Profile & Security (MFA, sessions)
   ├─ Notifications
   ├─ Payments & Receipts
   └─ Support Tickets
```

### 3.2 Sitemap — Staff Console

```
Dashboard
├─ Cases (Queue · My Cases · Escalated · Search)
│  └─ Case Detail (Summary · Travelers · Documents · Checks · Payments · Notes · History · Decision)
├─ Support (Tickets · Knowledge Base)
├─ Catalog (Categories · Visa Types · Form Builder · Eligibility Rules · Documents · Fee Schedules)
├─ Content (Pages · FAQs · Announcements · Templates)
├─ Users & Roles
├─ Integrations (Checks monitor)
├─ Reports
└─ Audit Log
```

### 3.3 Navigation Model

| Area | Pattern |
|------|---------|
| **Header (public)** | Logo · Visas · Find a Visa · Track · Help · Language toggle · Sign in/Account |
| **Header (mobile)** | Logo · Language toggle · Menu (drawer); persistent bottom bar on account pages (Applications · Track · Help · Profile) |
| **Footer** | Quick links, legal, accessibility statement, operator identity, support contacts, language toggle |
| **Wizard** | Step progress bar (top), Back/Continue (sticky bottom on mobile), Save & exit |
| **Staff** | Persistent left rail (collapsible), top bar with global search (`/` shortcut) |

Breadcrumbs on all depth ≥ 2 pages. Language toggle preserves the current page and form state.

---

## 4. Core User Flows

### 4.1 Visa Discovery and Application (J1)

```
Home ─▶ Finder (nationality, purpose, dates)
          │
          ├─ Not eligible ─▶ Explanation + alternatives (embassy route / other visa)
          ├─ Conditional  ─▶ Show conditions + proceed
          └─ Eligible     ─▶ Visa Detail ─▶ [Start application]
                                        │
                          Signed in? ── no ─▶ Sign in / Register (draft preserved)
                                        │
                                        ▼
         Wizard: 1 Applicant ▶ 2 Passport ▶ 3 Travel ▶ 4 Stay/Invitation ▶ 5 Documents
                  ▶ 6 Declarations ▶ 7 Review ▶ 8 Payment ▶ 9 Confirmation
```

### 4.2 Tracking (J2)

```
Track page ─▶ Enter reference + passport/ID ─▶ CAPTCHA
   ─▶ Status page (timeline + next step)
        ├─ Info requested ─▶ Sign in or verify OTP ─▶ Respond + upload
        └─ Issued ─▶ Verify OTP ─▶ View/Download visa
```

### 4.3 Draft Resume (J3)
My Applications → card labeled *Draft · 60% complete · Last saved 2h ago* → Continue → returns to the first incomplete step.

### 4.4 Group Application (J4)
Applicant step begins with "Who is this application for?" → *Myself / Someone else / Multiple travelers* → traveler list with completion badges → single payment.

### 4.5 Officer Review (J5)
Queue → Claim → Split view (data left, documents right) → Checklist → Decision panel (Approve / Reject / Request info / Escalate) → Confirm modal with reason + message preview → Next case.

---

## 5. Visual Design System

### 5.1 Design Tokens

**Color (original palette; verify contrast on build)**

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-primary-700` | `#0F5C63` | `#4FB3BC` | Primary buttons, links |
| `--color-primary-600` | `#13717A` | `#6BC5CD` | Hover |
| `--color-primary-100` | `#E1F2F3` | `#12363A` | Tints, selected |
| `--color-accent-500` | `#B8893B` | `#D9A95A` | Highlights, badges (sparingly) |
| `--color-neutral-900` | `#14212B` | `#F2F5F7` | Primary text |
| `--color-neutral-700` | `#3B4A57` | `#C9D2D9` | Secondary text |
| `--color-neutral-300` | `#CBD3DA` | `#3A4752` | Borders |
| `--color-neutral-50`  | `#F6F8FA` | `#0E161C` | Page background |
| `--color-surface`     | `#FFFFFF` | `#16212A` | Cards |
| `--color-success-600` | `#1E7A46` | `#52C07F` | Approved/Issued |
| `--color-warning-600` | `#A15C00` | `#F0B24A` | Info requested, expiring |
| `--color-danger-600`  | `#B3261E` | `#F2837D` | Errors, rejected |
| `--color-info-600`    | `#1D5FA8` | `#6AA8EC` | Informational |

Minimum contrast: text 4.5:1, large text/UI components 3:1. Status is **never** conveyed by color alone (icon + label).

**Typography**

| Role | Latin | Arabic | Size / Line-height (desktop → mobile) |
|------|-------|--------|---------------------------------------|
| Display (H1) | Inter / 700 | IBM Plex Sans Arabic / 700 | 40/48 → 30/38 |
| H2 | 600 | 600 | 30/38 → 24/32 |
| H3 | 600 | 600 | 22/30 → 20/28 |
| Body | 400 | 400 | 16/26 → 16/26 (min 16px for inputs to avoid iOS zoom) |
| Small / Caption | 400 | 400 | 14/22 |
| Button | 600 | 600 | 16/24 |

Arabic typography uses a slightly larger line-height (+2–4px) and avoids letter-spacing. Fonts self-hosted, subset, `font-display: swap`.

**Spacing:** 4px base scale (4, 8, 12, 16, 24, 32, 48, 64). **Radius:** 6 (inputs), 12 (cards), 999 (pills). **Elevation:** 3 levels (subtle shadows; borders preferred). **Breakpoints:** 360 · 640 · 768 · 1024 · 1280 · 1536. **Grid:** 4 cols (mobile), 8 (tablet), 12 (desktop) with 16/24px gutters; max content width 1200px.

**Iconography:** 24px outline set (e.g., Lucide/Phosphor), 2px stroke; directional icons mirrored in RTL.

**Motion:** 150–250 ms ease-out for transitions; respects `prefers-reduced-motion`; no auto-playing animations.

### 5.2 Component Library (Core)

| Group | Components |
|-------|-----------|
| **Actions** | Button (primary/secondary/tertiary/destructive; sizes S/M/L; loading), IconButton, Link |
| **Inputs** | TextField, PasswordField, PhoneField (country code + flag + search), OTPInput, Select/Combobox (searchable country list), DatePicker (Gregorian, optional Hijri display), Checkbox, Radio, Switch, Textarea, FileUploader (drag-drop + camera; compresses images and uploads straight to Cloudinary with a server-issued signature, showing real progress), PhotoUploader (with guide overlay), Stepper |
| **Feedback** | Inline field error, Alert/Banner (info/success/warning/danger), Toast, Progress bar, Skeleton, Spinner, EmptyState |
| **Navigation** | Header, Footer, Breadcrumbs, Tabs, Stepper/ProgressSteps, Pagination, Drawer, SideNav (staff) |
| **Data display** | Card, Badge/StatusPill, Timeline, Table (sortable, filterable, sticky header), Accordion, DescriptionList, KPI tile, Charts |
| **Overlay** | Modal, ConfirmDialog, Popover, Tooltip (non-essential info only) |
| **Domain** | VisaCard, FeeBreakdown, DocumentChecklistItem, ApplicationCard, StatusTimeline, TravelerCard, FinderForm, QRVerificationCard |

Each component is documented in Storybook with: states (default, hover, focus, active, disabled, error, loading), RTL variant, dark mode, keyboard behavior, ARIA pattern, and usage do/don't.

### 5.3 Status Pill Mapping

| Status | Label (EN) | Icon | Color |
|--------|-----------|------|-------|
| DRAFT | Draft | pencil | Neutral |
| PENDING_PAYMENT | Payment pending | card | Warning |
| SUBMITTED | Submitted | check-circle | Info |
| UNDER_REVIEW | Under review | hourglass | Info |
| INFO_REQUESTED | Action required | alert-circle | Warning |
| APPROVED | Approved | check | Success |
| ISSUED | Visa issued | badge-check | Success |
| REJECTED | Rejected | x-circle | Danger |
| WITHDRAWN / CANCELLED | Withdrawn / Cancelled | slash | Neutral |
| EXPIRED | Expired | clock-off | Neutral |

---

## 6. Key Screen Specifications

> Wireframes below are low-fidelity ASCII layouts for desktop. Mobile stacks content in a single column in the order shown. All layouts mirror in RTL.

### 6.1 Home

```
┌────────────────────────────────────────────────────────────────────┐
│ Logo   Visas  Find a Visa  Track  Help        [EN|عربي]  [Sign in] │
├────────────────────────────────────────────────────────────────────┤
│  H1: Apply for your visa online — simple, secure, clear            │
│  Sub: Find the right visa, check requirements and track status.    │
│ ┌──────────── Visa Finder ───────────────────────────────────────┐ │
│ │ Nationality [▾]  Purpose [▾]  Travel dates [📅]  [Find visas ▶] │ │
│ └────────────────────────────────────────────────────────────────┘ │
│  Popular visas:  [Tourism] [Business] [Family visit] [Transit] ... │
├────────────────────────────────────────────────────────────────────┤
│ How it works:  ① Find   ② Apply   ③ Pay   ④ Track & download       │
├────────────────────────────────────────────────────────────────────┤
│ Track your application      [ Reference no. ][ Passport no. ][Go]  │
├────────────────────────────────────────────────────────────────────┤
│ Announcements (if any)  ·  FAQ teaser  ·  Support contact          │
├────────────────────────────────────────────────────────────────────┤
│ Footer                                                             │
└────────────────────────────────────────────────────────────────────┘
```
**Behavior:** Finder is above the fold; defaults from browser locale; nationality combobox supports Arabic/English names and flags; results page is the next step (no modal).

### 6.2 Finder Results

- Summary chip row of inputs (editable).
- Result cards (**VisaCard**): name, short description, eligibility pill, key facts (validity · max stay · entries · processing time · fee "from"), primary CTA *View details*, secondary *Start application*.
- Sections: *Available to you* → *Conditions apply* → *Not available* (collapsed, with reasons).
- Empty state: explain, suggest changing purpose, link to Help.

### 6.3 Visa Detail

Tabs/anchors: **Overview · Eligibility · Fees & Timing · Required documents · FAQ**. Sticky summary card (desktop right rail / mobile bottom sheet) with fee total estimate, processing time, and **Start application**. Fee breakdown is transparent (visa fee, service fee, insurance, VAT).

### 6.4 Sign In / Register

- Single card, tabs *Sign in* / *Create account*.
- Register: email, password (strength meter + rules), consent checkbox (Terms/Privacy links), CAPTCHA if risk flag. Then OTP verification screen (6-box input with paste and auto-advance, resend countdown).
- Sign in: email, password, "Forgot password?" Link; MFA challenge screen when enabled.
- Error copy never reveals whether an account exists.

### 6.5 Application Wizard (Pattern)

```
┌────────────────────────────────────────────────────────────────────┐
│ Tourist Visit Visa · Application VG-XXXX              [Save & exit]│
│ ●━━━━●━━━━◐────○────○────○────○     Step 3 of 7: Travel details     │
├──────────────────────────────────────────────┬─────────────────────┤
│ Form area (max 640px)                        │ Summary panel       │
│  Label (required marker)                     │ Visa: Tourist       │
│  [ input ]  hint text / example              │ Travelers: 2        │
│  inline error message                        │ Est. fee: SAR ___   │
│  …                                           │ Need help? Chat/FAQ │
│                                              │                     │
│                      [← Back]  [Continue →]  │                     │
└──────────────────────────────────────────────┴─────────────────────┘
```
**Rules**
- One topic per step; ≤ 7 fields visible without scrolling on mobile where possible.
- Autosave on step change + 20 s idle; "Saved just now" indicator with `aria-live="polite"`.
- Validation on blur and on Continue; error summary at top (focus moved) for multi-error steps.
- Back never discards data. Leaving the browser warns only if unsaved changes exist.
- Contextual help: tooltip-free helper text under fields; "Why do we ask?" expanders for sensitive fields.
- Conditional fields appear inline with a subtle height transition (respecting reduced motion).

**Step content**

| Step | Content |
|------|---------|
| 1. Applicant | Who is applying; full name (as passport), name in Arabic (optional), DOB, gender, nationality, country of residence, marital status, occupation; prefill from profile |
| 2. Passport | Passport number, issue/expiry date, issuing country; optional scan & MRZ read; real-time expiry check |
| 3. Contact & Address | Email, phone, home address |
| 4. Travel | Purpose detail, arrival/departure dates, entry point, previous visits, other countries visited (optional per rule) |
| 5. Stay / Invitation | Accommodation details or inviter reference; inviter ID verification where applicable |
| 6. Documents | Checklist with per-item upload state (see §6.6) |
| 7. Declarations | Plain-language statements with checkboxes; links to full text |
| Review | Collapsible summary per step with *Edit* links; fee breakdown; final confirmation |
| Payment | Fee breakdown, payment method selection (PSP hosted), security badges |
| Confirmation | Reference number (copy button), what happens next, email/SMS sent notice, "Track" CTA |

### 6.6 Documents Step

```
Required documents                                  3 of 5 complete
┌──────────────────────────────────────────────────────────────────┐
│ ✓ Passport bio page            passport.jpg  (1.2 MB)   [Replace]│
│ ✓ Personal photo               photo.jpg     (320 KB)   [Replace]│
│ ⟳ Hotel booking                uploading… 64%           [Cancel] │
│ ! Return ticket                Rejected: image unreadable [Upload]│
│ ○ Bank statement (optional)    [Upload or drag file here]        │
└──────────────────────────────────────────────────────────────────┘
Accepted: PDF, JPG, PNG · Max 5 MB each
```
- Camera capture on mobile; photo guide overlay (face frame, lighting tips).
- Preview thumbnails; progress and retry; scan status ("Checking file…").
- Specific rejection reasons from officers shown in plain language.

**Upload behavior (Cloudinary direct upload)**
1. User picks or captures a file → client checks type and size against the limits for that document type (instant feedback, same limits the server enforces).
2. Photos are compressed in the browser (long edge ≤ 2000 px, target ≤ 1.5 MB); iPhone HEIC images are converted to JPEG. PDFs are never altered.
3. The app requests a short-lived signature from the API, then uploads directly to Cloudinary (the file never passes through our API). The row shows true percentage progress and a Cancel button.
4. After upload the app registers the file with the API. The row shows "Checking file…" until the server has verified and scanned it, then "Uploaded ✓". If the server rejects it (wrong type, too large, unsafe), the row shows a specific, localized reason and a *Replace* action.
5. Previews are generated locally from the selected file for the applicant; they never rely on a public link. Opening an already-uploaded document goes through the API (authorized and audited), not a direct Cloudinary link.
6. If uploads are temporarily unavailable (provider outage), show a banner: "Uploads are paused. Your answers are saved — please come back in a few minutes." and keep the rest of the wizard usable.

### 6.7 My Applications (Dashboard)

- Cards sorted by last activity; filter tabs *All · Action required · In progress · Completed*.
- **ApplicationCard:** visa type, traveler(s), reference, status pill, next-step line, primary action (Continue / Respond / Download / Track).
- "Action required" band pinned at top when any application is in `INFO_REQUESTED`.
- Empty state with illustration and "Find a visa" CTA.

### 6.8 Application Detail / Tracking

```
Reference VG-ABCD-1234-XYZ   [Visa Type]                [Status pill]
─────────────────────────────────────────────────────────────────────
Next step:  "Your application is being reviewed. Typical time: 3 days."
Timeline:   ● Submitted (12 Oct) ─ ● Paid ─ ◐ Under review ─ ○ Decision ─ ○ Issued
Details:    Travelers · Dates · Fees paid · Documents
Actions:    [Respond to request] [Download receipt] [Contact support]
```
- Public tracking shows a **reduced** dataset (name initials, visa type, status, dates) until step-up verification.
- Info-request panel: officer message, list of requested items, deadline countdown, response form with uploads.

### 6.9 Visa Document & Verification

- Visa document page: printable layout, QR, download PDF, add-to-wallet (R3).
- Public verification page (`/verify/{token}`): green/red status banner, visa type, validity, holder initials; no sensitive data; "Report a problem" link.

### 6.10 Help Center and Support

- Search-first help center, category tiles, top questions.
- Contact form with category, linked application (dropdown), attachments; success state shows ticket number and expected response time.

### 6.11 Account and Security

- Profile editor with inline save; security page: password change, MFA setup (QR + manual code + recovery codes), active sessions with *Sign out* actions; privacy page: data export and deletion request.

### 6.12 Staff Console — Case Queue

```
┌ Filters: Status▾ Visa▾ Nationality▾ SLA▾ Assignee▾ [Search]  ┐
├────────────────────────────────────────────────────────────────┤
│ ☐ Ref        Visa     Applicant   Nat.  Submitted  SLA    Owner │
│ ☐ VG-…       Tourist  A. Hassan   EG    2h ago     ●22h   —     │
│ ☐ VG-…       Work     J. Smith    GB    1d ago     ▲ -2h  M.Ali │
└──────────────────────────────────────────────────────────────┘
 Bulk: [Assign] [Escalate]            Saved views · Export
```
SLA indicator: green (> 50% time left), amber (< 50%), red (breached).

### 6.13 Staff Console — Case Detail (Split View)

```
┌ Header: Ref · Visa · Status · SLA timer · Assigned to ─────────────┐
├──────────────────────────────┬─────────────────────────────────────┤
│ Tabs: Summary | Travelers |  │ Document viewer (zoom, rotate,      │
│ Checks | Payments | Notes |  │ compare side-by-side, per-doc       │
│ History                      │ Accept / Reject with reason)        │
│                              │                                     │
│ Automated checks:            │                                     │
│  ✓ Passport validity         │                                     │
│  ✓ Duplicate check           │                                     │
│  ⚠ Watchlist: REVIEW         │                                     │
├──────────────────────────────┴─────────────────────────────────────┤
│ Decision: [Approve] [Request info] [Reject] [Escalate]              │
└─────────────────────────────────────────────────────────────────────┘
```
Keyboard shortcuts: `J/K` next/prev case, `A` approve (with confirm), `R` request info, `N` add note, `?` shortcut help. Sensitive-field reveal (full passport number) is masked by default and logged on reveal.

### 6.14 Staff Console — Form Builder

- Left: sections/fields tree (drag to reorder). Center: live preview (switch ar/en, desktop/mobile). Right: field properties (label translations, validation, conditions, data source).
- Version bar: Draft → Preview → Publish (with diff and maker-checker approval). Published versions are immutable.

---

## 7. Content Design and Microcopy

**Voice:** direct, respectful, second person ("you"), active verbs, no legalese in primary UI (legal text linked).

| Context | Do | Don't |
|---------|----|-------|
| Button | "Continue", "Pay SAR 440", "Upload document" | "Submit", "OK" |
| Error | "Your passport expires before your trip ends. Use a passport valid until at least 12 May 2027." | "Invalid input" |
| Empty state | "You haven't started any applications. Find the visa that fits your trip." | "No data" |
| Status | "Under review — most decisions take about 3 days." | "Processing" |
| Rejection | Reason code translated to plain language + what to do next | Bare "Rejected" |

- Dates written unambiguously (12 Oct 2026 / ١٢ أكتوبر ٢٠٢٦ per locale preference).
- Currency with code/symbol and thousands separators per locale.
- All strings are translation keys; Arabic copy written natively (not literal translation) and reviewed by a linguist.
- Reading level target: grade 8 or lower (English).

---

## 8. Forms and Validation Guidelines

- Labels above fields (never placeholder-only labels); required fields marked with text "(required)" rather than only an asterisk; optional fields labeled "(optional)".
- Use correct `type`, `inputmode`, `autocomplete` attributes (e.g., `autocomplete="given-name"`, `inputmode="numeric"` for OTP).
- Name fields: single "Full name as in passport" with example; support Arabic and Latin scripts; no forced first/last splitting where passports do not follow it.
- Phone: country selector + national number; accept pasted international format.
- Dates: segmented day/month/year inputs or native pickers; explicit format hint; no text-mask-only input.
- Validation timing: on blur (first), then on change after an error; never validate empty required fields before blur.
- Error pattern: message adjacent to field, `aria-describedby`, error summary with anchor links for multi-error submissions, focus managed.
- Long forms use progressive disclosure; do not ask for data already known (profile prefill).
- Protect against accidental double-submits (disable + spinner with `aria-busy`).

---

## 9. States and Edge Cases

| State | Design response |
|-------|----------------|
| Loading | Skeletons for lists/cards; spinner only for short blocking actions (< 1 s) |
| Empty | Illustration + explanation + primary action |
| Offline / slow | Banner "You're offline — changes will be saved when you reconnect" (autosave queue); retry buttons |
| Session expiry | Warn at 2 minutes remaining; extend without losing wizard data; re-auth modal if expired |
| Payment failure | Clear reason, retry with same application, no data loss; warn against double-paying |
| Payment pending/unknown | "We're confirming your payment" polling screen; email follow-up |
| Upload failure | Per-file retry; size/type guidance; expired signature handled silently by requesting a new one |
| Uploads unavailable (storage provider outage) | Page-level banner, uploads disabled, drafts and other steps still work |
| Duplicate application | Interstitial: open existing / continue anyway (if policy allows) |
| Service outage / maintenance | Full-page status with ETA; drafts preserved |
| 404 / 403 / 500 | Friendly pages with search, home link, trace ID for support |
| Rate-limited | Cooldown message with timer |

---

## 10. Responsive and Adaptive Behavior

| Breakpoint | Behavior |
|-----------|----------|
| < 640 px | Single column; sticky bottom action bar in wizard; summary panel becomes collapsible top card; tables become stacked cards |
| 640–1023 px | Two-column grids for cards; wizard summary collapses under form |
| ≥ 1024 px | Full layouts with right rail summary; tables with sticky headers |

- Touch targets ≥ 44×44 px (min 24×24 CSS px per WCAG 2.2 minimum, 44 recommended).
- Test on low-end Android (≈ 360×640, 3G throttled).
- Print stylesheet for visa document, receipts and application summary.

---

## 11. Right-to-Left (RTL) and Multilingual Guidelines

1. Use `dir="rtl"` and `lang="ar"` at the document root; set `lang` on inline foreign phrases.
2. Build with **logical CSS properties** (`inline-start/end`, `padding-inline`); avoid `left/right`.
3. **Mirror:** navigation order, progress indicators, back/next icons, chevrons, sliders, timelines, breadcrumbs separators.
4. **Do not mirror:** logos, media-playback icons, checkmarks, clocks, numerals' internal order, phone numbers and passport numbers (render with `dir="ltr"` / `<bdi>`).
5. Mixed-direction strings (Arabic text containing Latin names or numbers) use `<bdi>`/Unicode isolates to avoid ordering bugs.
6. Number display: Western digits default; user setting for Eastern Arabic digits for display-only text (inputs accept both and normalize).
7. Arabic copy length varies; layouts must tolerate ±30% text expansion.
8. Test with real Arabic content, long names, diacritics and mixed scripts in every form and table.
9. Language switch is a visible, labeled control (`English` / `العربية`) available in header, footer and during the wizard.
10. Provide transliteration helper for names where policy requires Latin form.

---

## 12. Accessibility (WCAG 2.2 AA)

| Area | Requirements |
|------|--------------|
| **Perceivable** | Text alternatives; captions for any video; color-independent status; contrast ratios as §5.1; reflow at 320 px; text resize to 200%; text spacing override |
| **Operable** | Full keyboard operability; visible focus indicator (≥ 2 px, 3:1); logical focus order; no keyboard traps; skip-to-content link; target size; dragging alternatives (e.g., reorder buttons in form builder); no time limits without warning/extension |
| **Understandable** | Language of page/parts; consistent navigation; clear labels; error identification and suggestion; **redundant entry avoided** (prefill); **accessible authentication** (no cognitive tests; paste allowed in password/OTP; passkeys later) |
| **Robust** | Semantic HTML; ARIA only where needed (APG patterns for combobox, dialog, tabs); status messages via `role="status"/"alert"` |
| **Documents** | Generated PDFs are tagged (PDF/UA) and have document language set |
| **Testing** | axe in CI, manual keyboard pass, screen reader tests (NVDA + Firefox/Chrome, VoiceOver + Safari/iOS, TalkBack) in **both Arabic and English**; annual third-party audit; published accessibility statement with feedback channel |

---

## 13. Trust, Security and Privacy UX

- Display operator legal name, contact details and a clear "independent service" statement in the footer and on the first wizard screen (see PRD §1 and §12).
- Show padlock/secure payment note on payment step; never imitate bank or government seals.
- Masked sensitive data (e.g., passport •••••4521) with explicit "Show" reveal only for the owner.
- Plain-language privacy notice at point of collection; links to full policy; consent checkboxes unticked by default.
- Clear fee transparency before the user registers; no hidden fees or pre-selected add-ons (insurance optional unless mandated, shown as such).
- Security hygiene prompts: enable MFA nudge after first submission; new-device login emails.
- Phishing awareness: banner stating official communications come only from listed domains; emails and SMS use consistent sender IDs and never request passwords or card numbers.

---

## 14. Notifications UX

| Event | Channels | Content principle |
|-------|---------|-------------------|
| Account verification | Email/SMS | Code + expiry; no links in SMS unless essential |
| Submission received | Email, in-app | Reference, summary, next step |
| Payment result | Email, SMS, in-app | Amount, receipt link |
| Information requested | Email, SMS, in-app | What is needed + deadline + secure link to portal (no attachments) |
| Decision | Email, SMS, in-app | Outcome + next step |
| Reminders (draft/expiry) | Email | One reminder, easy unsubscribe where permitted |

Templates are localized, short, and follow the microcopy rules in §7.

---

## 15. Analytics and Experimentation

- Instrument per PRD §10 with consent-gated events; step-level drop-off funnels; field-level error rates.
- Usability metrics: task success, time on task, SUS ≥ 80, CSAT ≥ 4.3.
- A/B tests only on non-critical copy/layout; never on legal text or fees; stat-sig thresholds defined before launch.

---

## 16. Research and Validation Plan

| Phase | Activity | Participants |
|-------|----------|--------------|
| Discovery | Stakeholder interviews, competitive review of national e-visa portals, support-ticket analysis | 8–10 |
| Concept | Card sorting / tree testing for IA | 20+ |
| Prototype | Moderated usability tests (Finder, wizard, tracking) in Arabic and English | 8 per language |
| Pre-launch | Accessibility testing with assistive-tech users | 5–6 |
| Post-launch | Session analytics, surveys, support themes, monthly iteration | Ongoing |

**Success thresholds:** ≥ 90% find the right visa in < 60 s; ≥ 85% complete the wizard unassisted; ≤ 2 critical usability issues remaining at launch.

---

## 17. Design Operations and Handoff

- **Tooling:** Figma with variables mapped 1:1 to tokens (exported via Style Dictionary into Tailwind config).
- **Library parity:** Figma components ↔ Storybook components; versioned releases of `packages/ui`.
- **Specs:** each screen includes redlines for LTR **and** RTL, all states, responsive variants, and annotated accessibility notes (focus order, landmarks, ARIA).
- **Definition of design-done:** states covered; RTL verified; contrast checked; microcopy approved in both languages; accessibility annotations present; analytics events listed.
- **Governance:** design system board reviews new components; changelog and deprecation policy.

---

## 18. Screen-to-Requirement Traceability

| Screen | PRD requirements |
|--------|------------------|
| Home, Finder, Results | FR-PUB-01/02, FR-FND-01..04 |
| Visa Detail | FR-PUB-03..05, FR-PAY-01 (preview) |
| Auth screens | FR-ACC-01..04 |
| Wizard & Documents | FR-APP-01..13, FR-DOC-01..06 |
| Payment & Confirmation | FR-PAY-01..04, FR-PAY-08 |
| My Applications & Detail | FR-APP-02/13, FR-TRK-02/05 |
| Tracking & Verification | FR-TRK-01..04 |
| Help & Support | FR-SUP-01..03, FR-PUB-07 |
| Staff Queue & Case | FR-ADM-06..09 |
| Form Builder / Catalog | FR-ADM-01..05 |
| CMS | FR-ADM-11 |

---

## 19. Frontend Implementation Notes (React SPA)

| Topic | Guidance |
|-------|----------|
| **Apps** | Two React (Vite) apps: `client` (public + applicant) and `admin` (staff). Shared components come from `packages/ui`, shared form rendering from `packages/form-engine`. |
| **Routing** | React Router with route-level code-splitting. Wizard steps are nested routes (`/apply/:applicationId/:stepKey`) so Back/Forward and deep links work. Auth-guarded routes redirect to sign-in and return the user to where they were. |
| **SEO and first load** | Public routes (home, visa catalog, visa details, FAQ, legal pages) are pre-rendered at build time with per-page `<title>`, description, canonical and `hreflang` (`ar`/`en`) via `react-helmet-async`. Applicant and staff areas are not indexed (`noindex`). Performance budgets: initial JS ≤ 170 KB gzip on the home route; wizard chunks loaded on demand. |
| **Language and direction** | `react-i18next` with ICU messages. Locale lives in the URL prefix (`/ar/…`, `/en/…`) so pages are linkable and indexable; the root element's `dir` and `lang` update on switch; Tailwind logical utilities (`ms-*`, `ps-*`, `text-start`) keep layouts mirrored automatically. |
| **Server state** | TanStack Query for all API data; wizard saves use mutations with optimistic "Saved" indicators and automatic retry; query keys include locale where content is localized. |
| **Forms** | React Hook Form + Zod resolver generated from the server form schema; the same schema validates on the server. Autosave on step change and after 20 s idle. |
| **Images** | CMS imagery served by Cloudinary with `f_auto,q_auto` and responsive `srcset`; always set width/height to avoid layout shift. Applicant documents are never shown through direct Cloudinary URLs (see §6.6). |
| **Fonts** | Self-hosted, subset Arabic and Latin fonts with `font-display: swap`; preload only the weights used above the fold. |
| **Error handling** | A global error boundary per route with a friendly page and a trace ID; API problem+json errors map to field errors via the `errors[].field` path. |
| **Accessibility** | Focus moves to the page heading on route change; route-change announcements via a polite live region; skip link; dialogs and comboboxes built on Radix primitives. |
| **Offline and PWA (R3)** | Service worker caches the shell and static assets; wizard drafts stay on the server (no offline sensitive data beyond the current form state). |
| **Security in the browser** | No tokens in `localStorage` (cookie-based sessions); strict CSP; sanitize any CMS HTML with DOMPurify; no secrets in the bundle — Cloudinary `cloud_name` and `api_key` are public values, the API secret never leaves the server. |
