# Mobile Build Plan — Execution Guide

**Created:** 2026-06-05  
**Revised:** 2026-08-07 — code audit against the live repo; Phase 0 added, API signatures corrected (see Revision Notes at the bottom)  
**Based on:** MOBILE_PLAN.md (all decisions finalized, Sections 1–16)  
**Project state file:** PROJECT_STATE.md  
**Target route:** `/m` (separate from desktop `/`)

---

## ⚠️ Read This First — Verified API Reference

Every signature below was read directly from the repo on 2026-08-07. **Where this table and any prose in this file or MOBILE_PLAN.md disagree, this table wins.** Do not infer a signature from a phase description.

| What | Actual signature / shape | File |
|---|---|---|
| Food log fetch | `getEntriesForDateRange(startDate: string, endDate: string)` — **no userId**; RLS scopes rows. Guard with `if (!user) return []` like `CalendarView.tsx:79` | `lib/foodLogStorage.ts:4` |
| Food log write | `addEntry(entry: NewFoodLogEntry)` — takes a **whole entry object**, not loose args | `lib/foodLogStorage.ts:19` |
| `NewFoodLogEntry` | `{ log_date, entry_type, label, items, source_id, notes }` | `types/calendar.ts:23` |
| Entry type field | `entry.entry_type`, values `'plan' \| 'meal' \| 'food'`. **Not** `entry.type`, and **not** meal times | `types/calendar.ts:11` |
| Log item shape | `{ food_id, food_name, amount_g, mode: 'servings'\|'grams', meal_label? }`. Grams live in **`amount_g`**, always grams regardless of `mode` (`mode` is display-only) | `types/calendar.ts:3` |
| Saved profiles | `loadSavedProfiles()` — **no args** | `lib/profileStorage.ts:13` |
| Saved meals | `loadSavedMeals()` — **no args** | `lib/savedMealStorage.ts:13` |
| Meal plans | `loadMealPlans()` — **no args** | `lib/mealStorage.ts:14` |
| Preset meals | `loadPresetMeals()` — no args | `lib/presetMealStorage.ts:13` |
| Diet list | `loadDietList(userId?: string)` → `DietFood[]` = `{ foodId, daysPerWeek, gramsOverride? }[]` | `lib/dietStorage.ts:47` |
| Nutrient groups | `NUTRIENT_GROUP_LIST: { value: NutrientCategory; label: string }[]` — **does NOT list member nutrients**. Group by `nutrient.nutrient_category`. Values are **singular** (`'Macronutrient'`), labels plural (`'Macronutrients'`) | `lib/filterConstants.ts:10` |
| Food nutrient values | `food.nutrients: Record<number, number \| null>` (nutrient_id → per-100g) | `types/nutrition.ts:14` |
| `FoodNutrientMap` | `Record<number, Record<number, number \| null>>` — a plain nested **Record**, not a `Map` | `lib/dietProfile.ts:24` |
| DV targets | `rdaProfile.values[nutrient_name] ?? FOOD_METRIC_TARGETS[nutrient_name] ?? null` — the fallback is **required**, see below | `lib/rdaProfiles.ts:83` |
| Complement score | `computeComplementScore(candidateItems, currentMeals, nutrients, rdaProfile, foodsById)` — `rdaProfile` is **non-nullable**; skip scoring entirely when no profile is set | `lib/complementScore.ts:12` |
| Diet profile | `computeDietProfile(selectedFoods, foodNutrients, rdaProfile, nutrients, foodNames?)` | `lib/dietProfile.ts:65` |
| Diet suggestions | `computeDietSuggestions(selectedFoods, currentResults, allFoodNutrients, foods)` | `lib/dietSuggestions.ts:23` |
| Portion size | `getPortionSize(foodId)` → `{ grams, label, sizes? }` (always returns a value; 100g fallback built in) | `lib/portionSizes.ts:339` |
| Donut chart | `<MacroDonutChart nutrients meals foodsById />` — no ring-visibility prop today; see Ph-5b | `components/MacroDonutChart.tsx` |
| Radar chart | `<MealCategoryRadar nutrients rdaProfile totals />` — `totals` is **raw gram-scaled values**, the component divides by RDA itself. Do not pre-divide | `components/MealCategoryRadar.tsx` |
| Auth | `useAuth()` → `{ user, loading, signIn, signUp, signOut }` | `components/AuthProvider.tsx` |

### Two computation rules that are easy to get wrong

1. **DV target resolution.** Always resolve a nutrient's target as `rdaProfile.values[name] ?? FOOD_METRIC_TARGETS[name] ?? null`. Using `rdaProfile.values` alone leaves the entire **Food Metrics** group with no %DV. This is what desktop does (`MealCategoryRadar.tsx:51`, `computeDietProfile`).

2. **Glycemic Index is a weighted average, not a sum.** When totalling nutrients across multiple foods (day totals, macro chips, radar `totals`), every nutrient sums as `value_per_100g × grams / 100` **except** those in `WEIGHTED_AVERAGE_NUTRIENTS` (`lib/dietProfile.ts:49` — currently just `Glycemic Index`), which must be a carb-weighted average. Summing GI × grams is a bug that has already been fixed twice on desktop (see PROJECT_STATE entries for `MealComparisonView` and `computeFoodContribs`). Mirror the desktop logic; do not re-derive it.

---

## How to Use This File

1. **Run phases in order.** Each phase is a self-contained unit of work sized to fit comfortably in a single conversation context window (~200k tokens). Read this file at the start of each session; the agent will mark completed phases and update PROJECT_STATE.md before finishing.

2. **Marking phases complete.** When a phase is done, the agent MUST replace `⬜ Phase N` with `✅ Phase N — COMPLETE (YYYY-MM-DD)` in this file before ending the session.

3. **PROJECT_STATE.md updates.** At the end of every phase, the agent MUST append a new entry to PROJECT_STATE.md under `## Current Feature State` following the existing pattern: `| **Mobile — Phase N** | ✅ Complete — <summary of what was built> |`. Also update the repository structure section with any new files added.

4. **Before starting a phase**, re-read this file and PROJECT_STATE.md to pick up where things left off.

5. **TypeScript check.** Run `npx tsc --noEmit` before marking any phase complete. Fix all errors before signing off.

---

## Phase Status Overview

| Phase | Name | Status |
|---|---|---|
| Ph-0 | Unblock `/m`: route group, viewport export, mobile entry point | ✅ Complete (2026-08-12) |
| Ph-1 | Foundation: Route, Layout, Shell, Header | ✅ Complete (2026-08-12) |
| Ph-2 | Account Screen + Auth | ✅ Complete (2026-08-12) |
| Ph-3 | DV Profile Sheet | ✅ Complete (2026-08-12) |
| Ph-4a | Nutrition Screen — Core Controls | ✅ Complete (2026-08-12) |
| Ph-4b | Nutrition Screen — Accordion + Nutrient Rows | ⬜ Not started |
| Ph-4c | Nutrition Screen — Advanced Features | ⬜ Not started |
| Ph-5a | Calendar Screen — Week Strip + Day Log | ⬜ Not started |
| Ph-5b | Calendar Screen — Summary Chips + Visualizations | ⬜ Not started |
| Ph-6 | Add Food/Meal Sheet | ⬜ Not started |
| Ph-7 | Polish, Safe Areas, App-Like Behaviour | ⬜ Not started |

---

## Phase Detail

---

### ✅ Phase 0 — COMPLETE (2026-08-12) — Unblock `/m`: Route Group, Viewport Export, Mobile Entry Point

**Why this phase exists:** The current root layout makes `/m` impossible to see on a phone. `app/layout.tsx:32-45` renders a full-screen "Open on Desktop" gate (`md:hidden fixed inset-0 z-[9999]`) and wraps all children in `<div className="hidden md:contents">`. Because `app/m/layout.tsx` nests inside the root layout, every mobile component built in Ph-1 onward would be `display: none` under 768px, behind an opaque overlay. **Phase 1's acceptance test cannot pass until this is fixed.** Nothing in this phase is mobile UI — it is purely making the route reachable.

**Goal:** Visiting `/m` on a 375px viewport shows a blank slate-900 page with no desktop gate. Visiting `/` is byte-for-byte unchanged on desktop.

**Files to create:**

| File | Purpose |
|---|---|
| `app/(desktop)/layout.tsx` | Holds the "Open on Desktop" gate + the `hidden md:contents` wrapper, moved verbatim out of the root layout. Route groups add no URL segment, so `/` still resolves to the same page. |
| `app/(desktop)/page.tsx` | The current `app/page.tsx`, moved unchanged (including `export const revalidate = 300`). |

**Files to modify:**

| File | Change |
|---|---|
| `app/layout.tsx` | Keep `<html>`, `<body>`, fonts, `globals.css`, `metadata`, and `<AuthProvider>` (mobile needs auth context too). **Remove** the mobile gate div and the `hidden md:contents` wrapper — those move to `(desktop)/layout.tsx`. |
| `app/page.tsx` | Deleted (moved into the route group). |

**Key implementation details:**

- After the move, the tree is: root layout (html/body/AuthProvider) → either `(desktop)/layout.tsx` (gate + desktop chrome) or `app/m/layout.tsx` (mobile, no gate). Auth session is shared because `AuthProvider` stays at the root.
- Verify `/` still renders `AppShell` and the gate still appears when the desktop route is viewed under 768px. The gate's behaviour on `/` is unchanged by design.
- **Mobile entry point (decide and implement one):**
  - **A (recommended, zero-dependency):** edit the gate copy in `(desktop)/layout.tsx` to add a violet `<a href="/m">Open the mobile app →</a>` button. Users who land on `/` on a phone get a one-tap path to `/m`.
  - **B:** add `middleware.ts` that UA-sniffs touch devices and redirects `/` → `/m`. More automatic, but UA sniffing is brittle and interferes with anyone deliberately opening the desktop site on a tablet.
  - Ship A now regardless; B can be layered on later.

**Viewport / metadata — use the framework API, not raw tags:**

MOBILE_PLAN.md Sections 10c and 10d Group 1 show raw `<meta name="viewport">` / `<meta name="apple-mobile-web-app-*">` tags. **Do not hand-write the viewport tag in JSX** — Next injects its own viewport meta and you will end up with two conflicting tags. Use the App Router exports in `app/m/layout.tsx` (created in Ph-1, but the shape is specified here so Ph-1 gets it right first time):

```ts
import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',        // REQUIRED for env(safe-area-inset-*) to resolve to anything but 0
  themeColor: '#0f172a',
}

export const metadata: Metadata = {
  title: 'Nutrition',
  manifest: '/m/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Nutrition',
    statusBarStyle: 'black-translucent',
  },
  icons: { apple: '/apple-touch-icon.png' },
}
```

`viewportFit: 'cover'` was previously listed only in Ph-7. It must be present from Ph-1, because Ph-1's tab bar already uses `env(safe-area-inset-bottom)` — without it those insets are 0 and the bar sits under the iOS home indicator for six phases before anyone notices.

**Note on `userScalable: false`:** iOS Safari has ignored this since iOS 10 — pinch-zoom still works there, and that is fine. The rule that actually prevents the disruptive focus-zoom is the 16px minimum input font size (Section 10c), which is enforced per-phase and in the Ph-7 audit. Do not treat the viewport line as sufficient on its own.

**PROJECT_STATE.md update (agent writes this at end):**
```
| **Mobile — Phase 0: Route Unblock** | ✅ Complete — desktop page + "Open on Desktop" gate moved into app/(desktop)/ route group; root layout reduced to html/body/fonts/AuthProvider so /m is no longer hidden by the md:hidden gate; mobile entry link added to the gate. Desktop / unchanged. |
```

**Repository structure additions:**
```
app/(desktop)/
  layout.tsx      ← gate + desktop chrome (moved from app/layout.tsx)
  page.tsx        ← moved from app/page.tsx
```

---

### ✅ Phase 1 — COMPLETE (2026-08-12) — Foundation: Route, Layout, Shell, Header

**Prerequisite:** Phase 0 must be complete. If `app/(desktop)/` does not exist, stop and do Phase 0 first — otherwise nothing built here is visible on a phone.

**Goal:** Everything needed before a single screen can render. After this phase, visiting `/m` shows a blank dark shell with a bottom tab bar and a top header.

**Implementation notes (2026-08-12):**
- Icons: inline SVG (no icon library dependency added, per instruction).
- Mobile CSS shipped as `app/m/mobile.css`, imported only by `app/m/layout.tsx` (the "Option B" choice offered in the file list above).
- **`/m` transfer size not measured this session** — this dev environment has no `.env.local` / Supabase credentials (`next build`'s page-data-collection step fails on `Missing Supabase environment variables` for both `/` and `/m`, a pre-existing environment gap unrelated to this phase's code). `tsc --noEmit` is clean and `next build` compiles and passes the TypeScript step. **Follow-up required:** once Supabase env vars are available (locally or in CI), measure the `/m` RSC transfer size per the Ph-1 payload warning above and open a follow-up if it exceeds ~500 KB compressed.

**Files to create:**

| File | Purpose |
|---|---|
| `app/m/layout.tsx` | Minimal layout: `export const viewport` + `export const metadata` exactly as specified in Phase 0 (PWA / apple-web-app / manifest / viewport-fit all go through those exports — **no hand-written `<meta>` tags**), slate-900 background. No desktop nav chrome. |
| `app/m/page.tsx` | Server component: calls `fetchAppData()` (reuse existing), passes `AppData` to `<MobileShell>`. Include `export const revalidate = 300` to match the desktop page. |
| `public/m/manifest.json` | PWA manifest (start_url=/m, standalone display, slate-900 theme/bg). |
| `components/mobile/MobileShell.tsx` | Root client wrapper: owns `activeTab` state ('calendar'\|'nutrition'\|'account'), renders `<MobileHeader>` + active screen placeholder + bottom tab bar. Visual Viewport API effect for keyboard-safe tab bar. |
| `components/mobile/MobileHeader.tsx` | Top bar: app title left, DV profile chip right (placeholder text "No Profile" for now — wired in Ph-3), streak pill center-right (hidden if streak=0, placeholder for Ph-5b). |
| `app/globals.css` (modify) | Add mobile-only CSS rules under a `@media (max-width: 767px)` block OR add to a new `app/m/mobile.css` imported only in `app/m/layout.tsx`: tap highlight, user-select, touch-callout, focus/focus-visible ring rules, body overscroll-behavior-y:none, -webkit-font-smoothing, text-size-adjust, button active scale. |

**Key implementation details:**

- `app/m/layout.tsx` covers everything MOBILE_PLAN.md Sections 10c and 10d Group 1 ask for, but via the `viewport` / `metadata` exports from Phase 0 rather than the raw tags shown in those sections.
- **Data payload warning:** `fetchAppData()` returns all 257 foods × 58 nutrients (~14.7k values) plus nutrient metadata, and passing it into a client component serializes the whole thing into the RSC payload — on the order of a megabyte of JSON over cellular before the user touches anything. Option B's "mobile bundle only loads mobile code" covers JS, not data. **Measure the `/m` transfer size at the end of this phase** and record it in PROJECT_STATE. If it is over ~500 KB compressed, open a follow-up to slim the mobile fetch (food id/name/category list + nutrient meta up front, per-food nutrient values fetched on selection). Do not silently absorb this and discover it in Ph-7.
- `MobileShell.tsx` bottom tab bar: 56px tall, `pb-[env(safe-area-inset-bottom)]`, three tabs — Calendar (calendar icon), Nutrition (search icon), Account (person icon). Active tab uses violet text + icon fill; inactive slate-400.
- Tab icons: use inline SVG or Heroicons (already available in the project if used elsewhere, otherwise inline minimal SVG paths). Do NOT introduce a new icon library dependency.
- `MobileShell.tsx` must set `overflow: hidden` on body root via a `useEffect` on mount (`document.body.style.overflow = 'hidden'`) and **must restore the previous value on unmount** — this is required, not cosmetic. `/` and `/m` share the same `<body>` (one root layout), and client-side navigation between them does not remount it, so a missing restore leaves the desktop app unscrollable.
- Visual Viewport API in `MobileShell.tsx` — the `setTabBarBottom` state from the MOBILE_PLAN.md snippet: pins tab bar bottom offset to `window.innerHeight - vv.height - vv.offsetTop` when keyboard is open on Android.
- Screen area between header and tab bar: `flex-1 overflow-y-auto overscroll-contain` — this is the scrollable content region.
- Each screen placeholder is just a `<div className="p-4 text-slate-400">Coming in Phase N</div>` for the two screens not yet built.
- `touch-action: manipulation` on every `<button>` in the tab bar.

**PROJECT_STATE.md update (agent writes this at end):**
```
| **Mobile — Phase 1: Foundation** | ✅ Complete — /m route + layout (viewport meta, PWA tags, manifest), MobileShell (bottom tab bar, Visual Viewport API), MobileHeader (title + DV chip placeholder). All mobile CSS rules (tap highlight, overscroll, font smoothing) in place. |
```

**Repository structure additions:**
```
app/m/
  layout.tsx
  page.tsx
public/m/
  manifest.json
components/mobile/
  MobileShell.tsx
  MobileHeader.tsx
```

---

### ✅ Phase 2 — COMPLETE (2026-08-12) — Account Screen + Auth

**Goal:** The Account tab shows a full-page login form when logged out and account info when logged in. No modals — it is a full-screen page within the shell.

**Files to create:**

| File | Purpose |
|---|---|
| `components/mobile/MobileAccountScreen.tsx` | Logged-out: email + password inputs, Sign In / Sign Up toggle, error messages inline. Logged-in: email display, current DV profile label, Change Profile button (no-op placeholder until Ph-3), Sign Out button. |

**Key implementation details:**

- Reuse `AuthProvider` context (`useAuth()`) — identical to desktop. Import `signIn`, `signUp`, `signOut`, `user`, `loading` from context.
- Logged-out form is a plain full-page layout (not a modal), centered vertically in the available content area. Wordmark at top.
- Inputs MUST use `text-base` (16px) minimum — enforced per Section 10c. Add `autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}` on email + password fields.
- Sign In button: `w-full` violet filled. Sign Up link: text link below. Toggle between login/register modes with local `mode` state.
- On successful login: call `setActiveTab('calendar')` via a prop/callback so the tab switches to calendar automatically. Pass `onLoginSuccess` from `MobileShell`.
- Logged-in state shows: `user.email`, a "Default DV Profile" row (reads `np:m:rda-sel` from localStorage for display — populated in Ph-3), Sign Out button (slate-600 border, NOT destructive red).
- Error display: small red text below the relevant input, clears on input change. Use the same error pattern as `AuthModal.tsx`.
- No demo button, no tour link.
- Wire into `MobileShell.tsx`: replace the Account tab placeholder with `<MobileAccountScreen onLoginSuccess={() => setActiveTab('calendar')} />`.

**PROJECT_STATE.md update (agent writes this at end):**
```
| **Mobile — Phase 2: Account Screen** | ✅ Complete — MobileAccountScreen: full-page login/register form (email+password, inline errors, 16px inputs, no demo), logged-in state (email display, DV profile label, Sign Out). Wired to AuthProvider; on login → switches to Calendar tab. |
```

---

### ✅ Phase 3 — COMPLETE (2026-08-12) — DV Profile Sheet

**Goal:** The DV profile chip in the header is tappable. Tapping opens a bottom sheet showing all profiles. Selection persists to `np:m:rda-sel` in localStorage. First selection shows a toast asking to set as device default.

**Implementation notes (2026-08-12):**
- Selection is a single `string` (mirrors desktop `AppShell.tsx`'s `rdaSelection` pattern exactly): `''` = None, a `ProfileId` for built-ins, `saved:<uuid>` for a saved profile. `getProfile()` resolves built-ins; saved profiles are resolved inline the same way `AppShell.tsx:128-145` does.
- Custom-profile **editing** is intentionally not built on mobile yet (per this phase's own scope note — "for now allow selecting built-ins only"); saved custom profiles created on desktop are still selectable and shown under a "Saved Profiles" divider.
- The device-default star and first-selection toast are purely local (`localStorage` `np:m:rda-default` / `np:m:rda-default-set`) — no Supabase account-default write, since that's an account-scoped desktop feature (`userPreferencesStorage.ts`) out of scope here.
- `MobileAccountScreen`'s "Default DV Profile" row (Ph-2 placeholder) now reads the live `rdaProfile` computed in `MobileShell` instead of raw localStorage, and opens the same sheet.
- Sheet open/close animation implemented (slide up via a mount-then-`translate-y-0` pattern); swipe-to-dismiss drag gesture is explicitly Ph-7 scope and not added here.

**Files to create:**

| File | Purpose |
|---|---|
| `components/mobile/MobileDVProfileSheet.tsx` | Bottom sheet: drag handle, "Daily Value Profile" heading, list of profiles (None + 4 built-ins + user saved profiles), star icon for device default, close on backdrop tap. |

**Files to modify:**

| File | Change |
|---|---|
| `components/mobile/MobileShell.tsx` | Add `rdaProfile` + `setRdaProfile` state (mirrors desktop global DV state). Load from `np:m:rda-sel` on mount. Pass down to all screens as prop. Pass `onOpenDVSheet` to `MobileHeader`. |
| `components/mobile/MobileHeader.tsx` | Wire DV chip `onClick` → `onOpenDVSheet`. Display active profile name (or "No Profile"). |

**Key implementation details:**

- Bottom sheet animation: `transform: translateY(100%)` → `translateY(0)` on open, `transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)`. Use `translate-y-full` → `translate-y-0` in Tailwind with a transition class.
- Sheet height: `max-h-[80vh]` with `overflow-y-auto` inside. Drag handle: 4×36px `rounded-full bg-slate-600 mx-auto mt-2 mb-4`.
- Profile list: radio-style rows. Active profile gets violet radio dot. Each row: profile name left, star icon right.
- Star icon: clicking star saves `np:m:rda-default` = profile key to localStorage, suppresses future toast (`np:m:rda-default-set = 'true'`).
- Toast on first selection: appears for 2.5s at bottom of screen above tab bar: "Set as default on this device? [Yes] [Not now]". Clicking Yes sets `np:m:rda-default-set = 'true'`. Plain `setTimeout`-based implementation, no library.
- localStorage keys: `np:m:rda-sel` (active profile id), `np:m:rda-default-set` (suppress toast), `np:m:rda-default` (device default profile key).
- Load saved profiles: call `loadSavedProfiles()` from `lib/profileStorage.ts` — **takes no arguments**; RLS scopes rows to the signed-in user, and it already filters out the `__np_prefs__` sentinel row. Call it only when `user` is set. Show results below a "── Saved Profiles ──" divider.
- Built-in profiles come from `RDA_PROFILES` in `lib/rdaProfiles.ts`; resolve a selection to a profile object with `getProfile(id, customValues?)`.
- **Sheet state placement:** `MobileShell` should own a single `openSheet` state (`'dv' | 'nutrient' | null` plus its payload) rather than each screen owning its own. Ph-4c's nutrient info sheet is opened from both the Nutrition accordion and the Ph-5b macro chips on the Calendar screen — hoisting the state now avoids duplicating sheet plumbing in two screens later.
- Custom profile stored locally: read `np:m:custom-rda` from localStorage when "Custom" profile is selected. Set via `DVProfilePanel` in a future enhancement; for now allow selecting built-ins only.
- Pass `rdaProfile: RDAProfile | null` down from `MobileShell` to both `MobileCalendarScreen` and `MobileNutritionScreen` (even though those screens are placeholders in this phase — add the prop to their interfaces now so Ph-4 and Ph-5 don't need to touch MobileShell again for this).
- Android back button handling: `window.history.pushState({ sheet: true }, '')` on sheet open; `popstate` listener calls `onClose`. Exactly as described in Section 10d Group 5.

**PROJECT_STATE.md update (agent writes this at end):**
```
| **Mobile — Phase 3: DV Profile Sheet** | ✅ Complete — MobileDVProfileSheet bottom sheet (all profiles, star device-default, first-select toast). MobileShell owns rdaProfile state (localStorage np:m:rda-sel). MobileHeader DV chip wired. Android back button dismissal via pushState sentinel. |
```

---

### ✅ Phase 4a — COMPLETE (2026-08-12) — Nutrition Screen: Core Controls

**Goal:** The Nutrition tab shows a food search bar, a selected food card with gram input and unit toggle, wired together. No accordion yet — just the top section functioning end-to-end.

**Implementation notes (2026-08-12):**
- Category filter in `MobileFoodSearch` uses a native `<select>` as this phase explicitly permits ("a simple select for now — replace later"); left a `TODO(Ph-6)` comment pointing at the Ph-7 "No Native Selects" audit item so it isn't missed.
- `MobileNutritionScreen` receives `rdaProfile: RDAProfile | null` (not just `foods`) since the %DV unit mode needs it; shows a small amber hint when `%DV` is selected with no profile active, rather than silently rendering nothing (the accordion itself, and its 0%-vs-no-profile handling, is Ph-4b).

**Files to create:**

| File | Purpose |
|---|---|
| `components/mobile/MobileNutritionScreen.tsx` | Orchestrator: owns `selectedFood`, `selectedGrams`, `unit` state. Renders search bar, selected-food card (name + gram chip + unit toggle), accordion placeholder. Reads `np:m:nutrition-food-id` + `np:m:nutrition-grams` + `np:m:nutrition-unit` from localStorage on mount; writes on change. |
| `components/mobile/MobileFoodSearch.tsx` | Search input + results list. Props: `foods: FoodRow[]`, `onSelect: (food: FoodRow) => void`. Input: `type="search"`, `inputMode="text"`, `text-base`, autocorrect/autocapitalize off. Result rows are tappable. Category filter dropdown (uses bottom sheet in Ph-6; for now a simple select — replace later). Shows top 20 results filtered by name match. |
| `components/mobile/MobileGramInput.tsx` | Tap-to-edit inline chip. Default state: `[ 172 g ]` tappable chip. Tap → `<input inputMode="decimal" autoComplete="off">` replaces chip. Blur or Enter → confirm and call `onChange(grams)`. Scrolls itself into view on focus. Minimum font-size 16px. |
| `components/mobile/MobileUnitToggle.tsx` | 3-pill segmented control: `%DV` · `/srv` · `/100g`. Active pill: violet bg. Inactive: slate-700 outline. Props: `value: 'pct' | 'serving' | '100g'`, `onChange`. Full-width row, each pill `flex-1`. Labels: `%DV`, `/srv`, `/100g`. `touch-action: manipulation` on each pill. |

**Key implementation details:**

- `MobileNutritionScreen` receives `foods: FoodRow[]` and `rdaProfile: RDAProfile | null` from `MobileShell` (passed through from `page.tsx` → `AppData`).
- Food search: filter `foods` array by `food.food_name.toLowerCase().includes(query.toLowerCase())`. Show up to 20 results. Empty query → show nothing (blank state: "Search for a food to see its nutrients").
- When a food is selected from search, the search bar collapses/hides and the food card appears. A "× change food" link lets the user go back to search. This is the most common pattern (Cronometer, USDA FDC).
- `selectedGrams` initialised from `portionSizes.ts` `PORTION_SIZES[food.food_id]?.grams ?? 100`.
- `MobileGramInput` — on focus: call `inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })`. Chip shows `↑` hint (a tiny chevron-up icon or just `↑` text) indicating tappable.
- Unit toggle writes to `np:m:nutrition-unit` in localStorage on every change.
- Wire `MobileNutritionScreen` into `MobileShell` replacing the Nutrition tab placeholder. Pass `foods={appData.foods}` and `rdaProfile={rdaProfile}`.

**PROJECT_STATE.md update (agent writes this at end):**
```
| **Mobile — Phase 4a: Nutrition Core Controls** | ✅ Complete — MobileNutritionScreen orchestrator; MobileFoodSearch (search + results, 20-item filtered list); MobileGramInput (tap-to-edit chip, inputMode=decimal, scrollIntoView); MobileUnitToggle (3-pill segmented %DV/srv/100g). localStorage persistence for food id, grams, unit. |
```

---

### ⬜ Phase 4b — Nutrition Screen: Accordion + Nutrient Rows

**Goal:** The accordion below the food card renders all 58 nutrients grouped into 6 categories. Macronutrients are expanded by default. Values compute correctly per the selected unit and gram amount.

**Files to create:**

| File | Purpose |
|---|---|
| `components/mobile/MobileNutrientAccordion.tsx` | 6 accordion groups: Macronutrients, Vitamins, Minerals, Fatty Acids, Amino Acids, Food Metrics. Each group: header row (group name + chevron, tappable to toggle), list of `MobileNutrientRow` components. Macronutrients expanded by default on first load; expansion state persisted to `np:m:nutrient-groups` (JSON array of open group names). Uses `grid-template-rows: 0fr → 1fr` for expand animation (no height: auto jank). |
| `components/mobile/MobileNutrientRow.tsx` | Single row: nutrient name left, value+unit center-right, %DV bar (visible only in `%DV` mode) below the value. Color via `rdaCellColor()` from `lib/rdaColorScale.ts`. No-RDA nutrients: muted label, raw value only, no bar. Props: `name`, `value`, `unit`, `pctDv?`, `behavior`, `upperLimitPct?`. |

**Key implementation details:**

- **Group definitions — corrected.** `NUTRIENT_GROUP_LIST` (`lib/filterConstants.ts:10`) is only `{ value, label }[]`; it does **not** list which nutrients belong to each group. Use it for group **order and display labels**, and derive membership by filtering `appData.nutrients` on `n.nutrient_category === group.value`. Note the category values are **singular** (`'Macronutrient'`, `'Vitamin'`, `'Mineral'`, `'Fatty Acid'`, `'Amino Acid'`, `'Food Metric'`) while the labels are plural — matching on the label will return zero nutrients for every group. (PROJECT_STATE.md's "Adding a New NUTRIENT" checklist also describes a member-name array on this constant; that description is stale — ignore it.)
- Value computation per mode (from MOBILE_PLAN.md Section 13):
  - `/100g` → `valuesPer100g[nutrientId]`
  - `/srv` → `valuesPer100g[nutrientId] * (selectedGrams / 100)`
  - `%DV` → `valuesPer100g[nutrientId] * (selectedGrams / 100) / rdaTarget * 100`
- `valuesPer100g` is accessed directly from the selected `FoodRow` via `food.nutrients` — a `Record<number, number | null>` already present on every `FoodRow` in `AppData.foods`. No separate lookup map needed.
- **`rdaTarget` resolution — corrected.** `rdaProfile.values[nutrientName] ?? FOOD_METRIC_TARGETS[nutrientName] ?? null` (import `FOOD_METRIC_TARGETS` from `lib/rdaProfiles.ts`). Using `rdaProfile.values` alone leaves every nutrient in the **Food Metrics** group with no target and therefore no %DV bar — desktop resolves the fallback (`MealCategoryRadar.tsx:51`, `computeDietProfile`). If the resolved target is null → no %DV, show raw value only.
- This screen shows **one food at a time**, so no cross-food totalling happens here and the Glycemic Index weighted-average rule does not apply. It does apply in Ph-5b — see that phase.
- %DV bar: `width: min(pctDv, 200)%` capped at 200% visual width (200% = double the bar container). Color from `rdaCellColor`.
- Accordion animation: `grid-template-rows` trick — outer div has `overflow: hidden`; inner div renders all rows; outer transitions `grid-template-rows` from `0fr` to `1fr` via a CSS transition on the `grid-rows` property. Tailwind class toggling: `grid-rows-[0fr]` → `grid-rows-[1fr]` (requires Tailwind JIT, which is already used in this project).
- Calories special case: always shown in kcal, no %DV bar (Calories has a DV target but it's dietary guidance, not a hard limit — show the value but omit bar for cleanliness, or include bar — match desktop DataTable behavior for Calories).
- `MobileNutrientAccordion` receives: `food: FoodRow`, `allNutrients: NutrientMeta[]`, `selectedGrams: number`, `unit: 'pct'|'serving'|'100g'`, `rdaProfile: RDAProfile | null`. Nutrient values are read from `food.nutrients[nutrientId]` — no separate `foodNutrients` prop needed.
- Wire into `MobileNutritionScreen`.

**PROJECT_STATE.md update (agent writes this at end):**
```
| **Mobile — Phase 4b: Nutrient Accordion** | ✅ Complete — MobileNutrientAccordion (6 groups, grid-rows animation, Macros expanded by default, np:m:nutrient-groups persistence); MobileNutrientRow (name + value + %DV bar via rdaCellColor, no-RDA muted). Full /100g, /srv, %DV value computation wired. |
```

---

### ⬜ Phase 4c — Nutrition Screen: Advanced Features

**Goal:** Three features added on top of the working nutrition screen: nutrient info sheet (tap any row), "Log to Today" sticky bar, and top-foods ranking sheet.

**Files to create:**

| File | Purpose |
|---|---|
| `components/mobile/MobileNutrientInfoSheet.tsx` | Bottom sheet: nutrient name heading, Function / Too Little / Too Much sections (from `NutrientInfoCard.tsx` content), a "Top Foods" section showing top 5 foods for this nutrient as a simple vertical list. Accessible from accordion rows AND from Day Log (Ph-5) by passing `nutrientName`. |
| `components/mobile/MobileNutrientRanking.tsx` | Top foods list component (used inside `MobileNutrientInfoSheet` and optionally standalone). Props: `nutrientId: number`, `nutrientName: string`, `foods: FoodRow[]`, `unit: 'serving'|'100g'`. Sorts foods by `food.nutrients[nutrientId]` scaled to the serving (via `portionSizes.ts`). Renders ranked rows: food name · bar · value. Tap food row → calls `onSelectFood(food)` to switch nutrition screen to that food. |

**Files to modify:**

| File | Change |
|---|---|
| `components/mobile/MobileNutrientRow.tsx` | Add `onTap?: () => void` prop. Tapping the row calls `onTap`. |
| `components/mobile/MobileNutrientAccordion.tsx` | Pass `onNutrientTap={(nutrientName) => setOpenNutrientSheet(nutrientName)}` down to each row. |
| `components/mobile/MobileNutritionScreen.tsx` | Add `openNutrientSheet` state. Render `<MobileNutrientInfoSheet>` when set. Add "Log to Today" bar. |

**"Log to Today" sticky bar details:**
- A fixed bar pinned above the tab bar: `bottom: calc(56px + env(safe-area-inset-bottom))`, `left: 0`, `right: 0`.
- Content: `[ + Log 172g to Today ]`. Updates label as gram input changes.
- Only visible when a food is selected (hide when search is shown).
- If not logged in: button reads "Sign in to log"; tapping navigates to Account tab.
- On tap (logged in): calls `addEntry()` from `lib/foodLogStorage.ts` with a **complete `NewFoodLogEntry`** — it does not accept loose arguments. Mirror `CalendarAddModal.tsx:228`:

```ts
await addEntry({
  log_date:   new Date().toISOString().slice(0, 10),
  entry_type: 'food',
  label:      food.food_name,
  items: [{
    food_id:   food.food_id,
    food_name: food.food_name,
    amount_g:  selectedGrams,   // NOT `grams` — the field is amount_g
    mode:      'grams',
  }],
  source_id: null,
  notes:     null,
})
```

  Show a 1.5s toast: "Logged Salmon (172g) to [today's date]".
- Toast implementation: a fixed bottom div that fades in/out via CSS `opacity` transition. No library.
- The accordion list must have `padding-bottom` tall enough to not hide behind this bar + the tab bar.

**Nutrient info sheet content source:**
- Body role, deficiency symptoms, excess symptoms: from `appData.nutrients` array — these fields are already loaded by `fetchAppData()` (they're stored in the `nutrients` table with `body_role`, `deficiency_symptoms`, `excess_symptoms` columns).
- The `AppData` type in `types/nutrition.ts` should already have these fields on `NutrientMeta`. If not, check `lib/fetchAppData.ts` and add them.

**PROJECT_STATE.md update (agent writes this at end):**
```
| **Mobile — Phase 4c: Nutrition Advanced Features** | ✅ Complete — MobileNutrientInfoSheet (body role / deficiency / excess, top-5 foods); MobileNutrientRanking (ranked food rows with bars, tap to switch food); "Log to Today" sticky bar above tab bar (addEntry call, 1.5s toast, sign-in guard). |
```

---

### ⬜ Phase 5a — Calendar Screen: Week Strip + Day Log

**Goal:** The Calendar tab shows a week strip at the top and a scrollable day log below. Tapping a day pill updates the log. Entries are loaded from Supabase via `foodLogStorage.ts`.

**Files to create:**

| File | Purpose |
|---|---|
| `components/mobile/MobileCalendarScreen.tsx` | Orchestrator: owns `selectedDate` (today on mount), `weekStart` (Mon of current week), entries map (date → FoodLogEntry[]). Loads entries for ±14 days around today on mount; reloads on week navigation. Passes data down. |
| `components/mobile/MobileWeekStrip.tsx` | 7-day horizontal pill row (Mon–Sun). Props: `weekStart: Date`, `selectedDate: Date`, `onSelectDate`, `onPrevWeek`, `onNextWeek`, `entries: Record<string, FoodLogEntry[]>`. Active day: violet ring. Today: violet fill (if not active). Days with entries: small dot below the day number. Left/right arrow buttons for week navigation. |
| `components/mobile/MobileDayLog.tsx` | Scrollable list of entry cards for `selectedDate`, grouped as described under "Entry grouping" below. Each card shows its type badge, label, and kcal; tap to expand individual items with gram values. "No entries" empty state. FAB: `+` violet circle, `position: fixed`, `bottom: calc(56px + env(safe-area-inset-bottom) + 16px)`, `right: 16px`. Tapping FAB → calls `onOpenAddSheet()` (wired in Ph-6). |

**Key implementation details:**

- `MobileCalendarScreen` receives `appData: AppData`, `rdaProfile: RDAProfile | null`, `user` from `MobileShell`.
- **Load entries — corrected signature:** `getEntriesForDateRange(startDate, endDate)`. There is **no userId parameter** — Supabase RLS scopes rows to the signed-in user. Guard first: `if (!user) { setEntries([]); return }`, exactly as `CalendarView.tsx:79` does. Start = 14 days before today; end = 14 days after. Store in `entriesByDate: Record<string, FoodLogEntry[]>` (key = YYYY-MM-DD).
- Week strip shows Mon through Sun. `weekStart` is the Monday of the selected date's week. Calculate with `getDay()` + offset.
- Prev/Next week arrows: update `weekStart` by ±7 days. If navigating beyond the loaded range, extend the fetch.
- **Entry grouping — corrected.** The field is `entry.entry_type`, and its values are `'plan' | 'meal' | 'food'` — **there is no breakfast/lunch/dinner/snack concept anywhere in this app.** The schema has no meal-time column, and desktop `CalendarDayPanel.tsx:243-262` groups by `entry_type`, not time of day. Mirror desktop:
  - Render one card per entry, in `created_at` order, with a type badge (`plan` violet / `meal` teal / `food` amber — see `entryBadgeClass` in `CalendarDayPanel.tsx:48`).
  - `food` and `meal` entries list their items flat.
  - `plan` entries sub-group their items by `item.meal_label` (the meal name captured at log time), with `'Other'` for items with no label.
  - MOBILE_PLAN.md Section 3's mockup shows "Breakfast" / "Lunch" cards — that mockup is illustrative only and does not reflect the data model. If meal-time grouping is genuinely wanted, it is a schema change (new column on `food_log` + a picker in the add flow) and must be scoped as its own phase, not smuggled into the mobile build.
- Inline item display: each item in `entry.items` shows `item.food_name · {item.amount_g}g`. The field is **`amount_g`**, not `grams`; it is always grams regardless of the item's `mode`. `food_name` is stored on the item itself — no lookup needed (fall back to `appData.foods` only if absent).
- Day log must have `padding-bottom` to clear the FAB and the tab bar. Approx `pb-32` (8rem) should be safe.
- Week strip: `np:m:cal-view` localStorage key (only 'week' mode for now, just save/restore selected date `np:m:cal-date`).

**FILES TO NOT TOUCH:** `CalendarView.tsx`, `CalendarDayPanel.tsx`, `CalendarWeekList.tsx`, `CalendarMonthGrid.tsx` — desktop calendar is unchanged.

**PROJECT_STATE.md update (agent writes this at end):**
```
| **Mobile — Phase 5a: Calendar Week Strip + Day Log** | ✅ Complete — MobileCalendarScreen (orchestrator, ±14d entry load, selectedDate state); MobileWeekStrip (7-day pills, prev/next nav, entry dot indicators); MobileDayLog (grouped entry cards, expandable items, FAB placeholder). |
```

---

### ⬜ Phase 5b — Calendar Screen: Summary Chips + Visualizations

**Goal:** Three features on top of the working calendar: the macro summary chip row at the top of the day log, the streak pill in the header, and the swipeable donut + radar visualization card.

**Files to modify:**

| File | Change |
|---|---|
| `components/mobile/MobileDayLog.tsx` | Add `MobileMacroChips` at top of scroll area (above entry groups). Add `MobileVisualizationCard` at bottom (below entries, above FAB clearance zone). Pass totals computed from day entries using `appData.foods`. |
| `components/mobile/MobileHeader.tsx` | Accept `streakDays: number` prop. Show amber pill `🔥 N` when `streakDays > 0`. Tap → tooltip "You've logged N days in a row." |
| `components/mobile/MobileCalendarScreen.tsx` | Compute macro totals from `entriesByDate[selectedDate]`. Compute streak. Pass to DayLog + Header. |

**New sub-components (can be inline in their parent files or small separate files):**

| Component | Details |
|---|---|
| `MobileMacroChips` (in `MobileDayLog.tsx` or own file) | Row of 4 chips: `🔥 1847 kcal` · `P 142g` · `F 58g` · `C 180g`. Tapping a chip calls `setOpenNutrientSheet(nutrientName)` — passes up to `MobileCalendarScreen` which must also have access to `MobileNutrientInfoSheet`. Hidden when day has no entries. Chip turns violet when macro hits its DV target (if profile set). |
| `MobileVisualizationCard` (in own file) | Swipeable card container with dot indicator. Two cards: Card 1 = MacroDonut (inner ring only, reuse `MacroDonutChart.tsx` by passing `meals` built from day entries). Card 2 = Radar (reuse `MealCategoryRadar.tsx` with `totals` computed from day entries). Swipe via touch events or snap scroll. Only shown when day has entries + DV profile active. |

**Streak computation:**
- **Do not issue a second fetch.** Ph-5a already loads ±14 days. Widen that single call to `getEntriesForDateRange(today − 30d, today + 14d)` and compute the streak from the same `entriesByDate` map. (Signature is `(startDate, endDate)` — no userId.)
- Walk backward from today: count consecutive days where `entriesByDate[date]?.length > 0`, stopping at the first empty day.
- **Start the walk at yesterday, not today.** If the count starts at today, every user's streak silently resets to 0 at midnight and only reappears after they log — which reads as a bug, not a nudge. Count the unbroken run ending yesterday, and include today in it once today has an entry.
- Streak of 0 → pill hidden entirely (no guilt mechanic).

**Converting a day's entries to `Meal[]` (needed by the donut, and again in Ph-6):**
- Build one `Meal` whose `items` are the `MealItem`s for every log item across all of the day's entries. **Reuse `logItemToMealItem()` from `CalendarDayPanel.tsx:34`** rather than writing the conversion inline — it already handles `amount_g → grams`, servings derivation, and portion metadata. Extract it to a shared helper (e.g. `lib/foodLogAdapters.ts`) and have `CalendarDayPanel` import it from there, so the two paths cannot drift.
- Note `MealItem.grams` and `FoodLogItem.amount_g` are different field names for the same quantity; the adapter is the only place that should know that.

**MacroDonut wiring:**
- `MacroDonutChart.tsx` accepts `{ nutrients, meals, foodsById }`. Import: `import MacroDonutChart from '@/components/MacroDonutChart'`.
- The component always renders both rings — there is no visibility prop. **The clip-to-220px trick previously specified here does not work:** the macro labels are drawn *outward* at `outerRadius * (70/48) + 16` (`MacroDonutChart.tsx:56`), so a container that clips the outer ring also clips the labels off the inner one.
- Instead add an optional, defaulted prop to the desktop component: `innerOnly?: boolean` (default `false`) that skips the outer `<Pie>` and shrinks the label radius. It is a ~3-line additive change, no desktop behaviour moves, and it is the only clean way to get the mobile rendering. This is a deliberate, scoped exception to "do not touch desktop files."

**MealCategoryRadar wiring:**
- `MealCategoryRadar.tsx` accepts `totals: Record<number, number>` (nutrient_id → raw accumulated value) + `rdaProfile: RDAProfile` + `nutrients: NutrientMeta[]`. The component computes %DV internally (including the `FOOD_METRIC_TARGETS` fallback) — do NOT pre-divide by RDA.
- Compute `totals` from day entries: for each item, look up the food in `appData.foods` by `item.food_id` and sum `food.nutrients[nutrientId] * (item.amount_g / 100)`.
- **Glycemic Index must not be summed this way.** GI is in `WEIGHTED_AVERAGE_NUTRIENTS` (`lib/dietProfile.ts:49`) and has to be a carb-weighted average across the day's foods — summing `GI × grams` inflates it without bound. This exact bug has already been found and fixed twice on desktop (`MealComparisonView` / `FoodComparisonView`, and `computeFoodContribs`; both are logged in PROJECT_STATE). Mirror `MealNutritionSidebar`'s handling; do not re-derive it. The same rule applies to the Ph-5b macro chips and any future day/week totalling.

**PROJECT_STATE.md update (agent writes this at end):**
```
| **Mobile — Phase 5b: Calendar Summary + Visualizations** | ✅ Complete — MobileMacroChips (4-chip row, DV-hit violet, tap to open nutrient info); streak pill in MobileHeader (🔥 N, computed from 30-day entry history); MobileVisualizationCard (swipeable donut + radar, touch swipe or snap scroll, visible when entries + profile active). |
```

---

### ⬜ Phase 6 — Add Food/Meal Sheet

**Goal:** Tapping the FAB opens a bottom sheet with Food / Meal / Plan tabs. Food tab: search → gram confirm → log. Meal tab: browse saved meals + presets → log. Plan tab: browse saved plans → log. Complement score badges on food results. Diet suggestions row at top of Food tab.

**Files to create:**

| File | Purpose |
|---|---|
| `components/mobile/MobileAddSheet.tsx` | Main bottom sheet orchestrator. 80vh height. Drag handle. Three tabs: Food / Meal / Plan. Manages sheet open/close state, tab state. Android back-button sentinel. |

**Food tab sub-flow:**
1. Search input (reuse `MobileFoodSearch.tsx` from Ph-4a).
2. Each food row shows: food name · default grams (muted) · complement score badge (colored pill, 0-100). Sorted by complement score descending when DV profile is active. Score = `computeComplementScore(candidateItems, currentMeals, allNutrients, rdaProfile, foodsById)` from `lib/complementScore.ts` — full signature: `candidateItems` is `[{ food_id, grams }]` at the food's default serving; `currentMeals` is today's entries converted to `Meal[]` (same conversion as MacroDonut in Ph-5b); `allNutrients` is `appData.nutrients`; `foodsById` is a `Map<number, FoodRow>` built from `appData.foods`. Compute scores in a `useMemo` keyed on `currentDayEntries` — map `foodId → score` for all visible foods.
3. Diet suggestions row at the very top of the Food tab (above search): A horizontal scroll row of food cards when diet suggestions are available. Render only when Food tab is active. Sourced from the user's diet list — see "Diet suggestions" under Key implementation details. Three empty states from MOBILE_PLAN.md Section 16 feature 9.
4. Tapping a food → gram confirm card: food name, `MobileGramInput` pre-filled to `getPortionSize(food_id).grams`, `[Log It]` button, back arrow to return to search.
5. `[Log It]` → calls `addEntry()` with a full `NewFoodLogEntry` (same payload shape as Ph-4c's "Log to Today", but with `log_date` = the sheet's `selectedDate`, not today). Closes sheet. Shows toast on `MobileCalendarScreen`. Refreshes `entriesByDate` for that date.

**Meal tab sub-flow:**
1. Two sections: "My Templates" (from `loadSavedMeals()` — **no arguments**) + "Presets" (from `loadPresetMeals()`).
2. Meal cards: name + item count + complement score badge.
3. Tapping a meal → adds all items as a single `food_log` entry with `entry_type: 'meal'` (not `type`), `label` = meal name, `source_id` = meal.id, and each item carrying `amount_g` + `meal_label` = meal name. Copy the exact payload from `CalendarAddModal.tsx:168`.

**Plan tab sub-flow:**
1. List of saved plans from `loadMealPlans()` — **no arguments**. Plan name + meal count.
2. Tapping a plan → writes one `entry_type: 'plan'` entry whose items span all meals, each item tagged with `meal_label` = its meal's name (this is what lets the day log sub-group plan entries). Copy the payload from `CalendarAddModal.tsx:192` — note desktop writes a *single* plan entry, not one entry per meal.

**Key implementation details:**
- `MobileAddSheet` receives `open: boolean`, `onClose: () => void`, `selectedDate: string`, `appData: AppData`, `userId: string | null`, `currentDayEntries: FoodLogEntry[]`, `rdaProfile: RDAProfile | null`, `onEntriesChanged: () => void` (triggers a re-fetch in `MobileCalendarScreen`).
- Wire from `MobileDayLog.tsx` FAB → `MobileCalendarScreen` → `MobileAddSheet` open state.
- Complement score for each food in the search list: call `computeComplementScore` at search time, in a `useMemo` keyed on `currentDayEntries` — map `foodId → score`. **`rdaProfile` is non-nullable in that signature**: when no profile is selected, skip scoring entirely, hide the badges, and fall back to A–Z sort. Convert `currentDayEntries` to the `currentMeals: Meal[]` argument with the shared adapter from Ph-5b.
- **Diet suggestions — data source corrected.** This widget reflects the user's *habitual* diet, not one day of logging. `computeDietSuggestions` is built around `user_diet_lists` (foods with a days-per-week frequency); feeding it a single day's entries at `daysPerWeek: 7` asserts the user eats exactly today's foods every day and produces noise. Use the real list:
  - `const selectedFoods = await loadDietList(user?.id)` from `lib/dietStorage.ts` → `DietFood[]` = `{ foodId, daysPerWeek, gramsOverride? }[]`.
  - `computeDietProfile(selectedFoods, allFoodNutrients, rdaProfile, appData.nutrients)` → `{ results }`.
  - `computeDietSuggestions(selectedFoods, results, allFoodNutrients, appData.foods)`.
  - This matches MOBILE_PLAN.md Section 16 feature 9, whose three empty states already assume the desktop diet list (including "Set up your diet on desktop to see personalised suggestions" when the list is empty).
- **`allFoodNutrients: FoodNutrientMap` is `Record<number, Record<number, number | null>>`** (`lib/dietProfile.ts:24`) — a plain nested object, **not** `Map<number, Map<number, number>>`. Build it from `appData.foods` once (`{ [f.food_id]: f.nutrients }`) and memoize.
- Run the profile + suggestions calls in a `useMemo` keyed on `selectedFoods + rdaProfile`.
- Category filter on food search: for now a simple row of category pills (same categories as `filterConstants.ts`). No bottom sheet for this yet — inline pills scroll horizontally.

**PROJECT_STATE.md update (agent writes this at end):**
```
| **Mobile — Phase 6: Add Food/Meal Sheet** | ✅ Complete — MobileAddSheet (80vh bottom sheet, Food/Meal/Plan tabs, Android back sentinel); Food tab: search + complement score badges + diet suggestions horizontal row + gram confirm → addEntry; Meal tab: templates + presets; Plan tab: saved plans. Entries refresh in CalendarScreen after log. |
```

---

### ⬜ Phase 7 — Polish & iOS Safe Areas

**Goal:** Cross-device testing and all the "app-like" behaviour rules from MOBILE_PLAN.md Sections 10c, 10d. After this phase, the app should be indistinguishable from a native app at first glance on any iPhone XS+ or Android equivalent.

**Files to modify (no new files — polish pass across all components):**

**Checklist of items (agent checks each off as done):**

#### Safe Areas
- [ ] All fixed bottom elements (`MobileShell` tab bar, FAB in `MobileDayLog`, "Log to Today" bar in `MobileNutritionScreen`, `MobileAddSheet` bottom buttons) use `pb-[env(safe-area-inset-bottom)]` or `calc(56px + env(safe-area-inset-bottom) + Xpx)` offsets.
- [ ] `app/m/layout.tsx` sets `viewportFit: 'cover'` in its `export const viewport` (required for `safe-area-inset-*` to resolve). This should already be true from Ph-0/Ph-1 — verify, don't re-add.
- [ ] No hand-written `<meta name="viewport">` tag exists anywhere in `app/m/` (it would conflict with Next's injected tag).

#### Swipe-to-Dismiss (all bottom sheets)
- [ ] `MobileDVProfileSheet.tsx` — add drag-handle touch logic: track touchstart/touchmove/touchend, `transform: translateY(Npx)` during drag, dismiss if >80px, snap back otherwise. `transition: transform 0.2s ease` on snap-back only (remove during active drag).
- [ ] `MobileAddSheet.tsx` — same drag-to-dismiss logic.
- [ ] `MobileNutrientInfoSheet.tsx` — same.

#### Portrait Overlay
- [ ] Add a `PortraitOverlay` component (inline in `MobileShell.tsx` or small file). Listens to `window.innerWidth > window.innerHeight` via a `resize` event listener. When landscape detected, renders a full-screen slate-900 overlay with centered text: "Please rotate your device to portrait mode." Hides when portrait restored.

#### Touch Feedback
- [ ] Verify all buttons in tab bar, sheets, and food rows have `active:opacity-70 active:scale-[0.97] transition-none` Tailwind classes (or equivalent CSS). `transition-none` prevents animation INTO the press; add `transition-opacity transition-transform duration-150` on the button element itself for release animation.
- [ ] All buttons have `touch-action: manipulation` (eliminates 300ms delay).

#### Focus Rings
- [ ] Verify global CSS has `*:focus { outline: none }` and `*:focus-visible { outline: 2px solid #7c3aed; outline-offset: 2px; }` in the mobile CSS.

#### Scroll Containers
- [ ] Day log: `overflow-y-auto overscroll-contain`
- [ ] Nutrient accordion: `overflow-y-auto overscroll-contain`
- [ ] Add-sheet food results: `overflow-y-auto overscroll-contain`
- [ ] `MobileShell` content area: `overflow-y-auto overscroll-contain`

#### No Horizontal Scroll
- [ ] Test each screen at 360px viewport width (use DevTools). Fix any overflow.

#### Minimum Touch Targets
- [ ] Audit tab bar icons: minimum 44×44px tap area. Use padding to expand if needed.
- [ ] Week strip day pills: minimum 44px tap area.
- [ ] Accordion group headers: minimum 44px height.

#### Input Font Sizes
- [ ] Audit every `<input>` in the mobile components. All must have `text-base` (16px) minimum. Check: food search, gram input, email field, password field.

#### No Native Selects
- [ ] Verify no `<select>` element exists anywhere in `components/mobile/`. If any exist, replace with bottom-sheet or pill-row equivalent.

#### Drag Image Prevention
- [ ] Add `draggable="false"` to any `<img>` tags in mobile components.

#### Keyboard + Sheet Scroll
- [ ] `MobileGramInput`: verify `scrollIntoView` call is in place.
- [ ] `MobileAddSheet` food search: verify search input scrolls into view when sheet opens.

#### Final TypeScript Check
- [ ] `npx tsc --noEmit` — zero errors.

#### Viewport Test Checklist
- [ ] All screens render without horizontal scroll at 360px width (minimum viewport).
- [ ] FAB sits above tab bar with 16px gap on iPhone XS (375×812) and minimum viewport.
- [ ] Bottom sheets do not get covered by keyboard on Android (Visual Viewport API in effect).

**PROJECT_STATE.md update (agent writes this at end):**
```
| **Mobile — Phase 7: Polish + Safe Areas** | ✅ Complete — Swipe-to-dismiss on all 3 sheets; portrait overlay; safe-area-inset-bottom on all fixed bottom elements (viewport-fit=cover in meta); touch feedback (active:opacity-70 active:scale-[0.97]) on all interactive elements; 44px minimum tap targets; 16px minimum input font sizes; no horizontal scroll at 360px; overscroll-contain on all scroll containers; tsc clean. |
```

---

## Files Created by This Build (Complete List)

```
app/(desktop)/
  layout.tsx              ← Ph-0 (moved from app/layout.tsx: gate + desktop chrome)
  page.tsx                ← Ph-0 (moved from app/page.tsx)
lib/
  foodLogAdapters.ts      ← Ph-5b (logItemToMealItem extracted from CalendarDayPanel)
app/m/
  layout.tsx              ← Ph-1
  page.tsx                ← Ph-1
public/m/
  manifest.json           ← Ph-1
components/mobile/
  MobileShell.tsx         ← Ph-1
  MobileHeader.tsx        ← Ph-1
  MobileAccountScreen.tsx ← Ph-2
  MobileDVProfileSheet.tsx← Ph-3
  MobileNutritionScreen.tsx ← Ph-4a
  MobileFoodSearch.tsx    ← Ph-4a
  MobileGramInput.tsx     ← Ph-4a
  MobileUnitToggle.tsx    ← Ph-4a
  MobileNutrientAccordion.tsx ← Ph-4b
  MobileNutrientRow.tsx   ← Ph-4b
  MobileNutrientInfoSheet.tsx ← Ph-4c
  MobileNutrientRanking.tsx   ← Ph-4c
  MobileCalendarScreen.tsx    ← Ph-5a
  MobileWeekStrip.tsx         ← Ph-5a
  MobileDayLog.tsx             ← Ph-5a
  MobileVisualizationCard.tsx  ← Ph-5b
  MobileAddSheet.tsx           ← Ph-6
```

---

## Prompt Templates

Use these prompts in order to execute each phase. Copy, paste, and run as-is.

---

### Template 1 — Start a Phase (use when beginning fresh)

```
Read PROJECT_STATE.md and MOBILE_BUILD_PLAN.md carefully before doing anything.

Start with the "Verified API Reference" table at the top of MOBILE_BUILD_PLAN.md. Where it and any prose disagree, the table wins. Before calling any lib/ function, open the file and confirm its signature — several descriptions in these plans were written from memory and were wrong.

From PROJECT_STATE.md, understand the existing codebase: tech stack, repository structure, all components and their purposes, the lib/ files available for reuse, and the current build state.

From MOBILE_BUILD_PLAN.md, identify the first phase marked "⬜ Not started" and execute it completely. Do all work described in that phase's section, following every implementation detail. When done:

1. Mark the phase as complete in MOBILE_BUILD_PLAN.md — replace "⬜ Phase N" in the Status Overview table and the phase header with "✅ Phase N — COMPLETE (today's date)".
2. Append the phase's PROJECT_STATE.md update entry to the "Current Feature State" table in PROJECT_STATE.md.
3. Update the "Repository Structure" section of PROJECT_STATE.md with any new files created.
4. Run `npx tsc --noEmit` and fix all TypeScript errors before finishing.

Do not start the next phase. Report what was built when done.
```

---

### Template 2 — Continue from Last Phase (use in follow-up sessions)

```
Read PROJECT_STATE.md and MOBILE_BUILD_PLAN.md carefully before doing anything.

Check MOBILE_BUILD_PLAN.md to see which phases are marked complete (✅) and which are next (⬜). Then execute the next incomplete phase in full. Follow every implementation detail in that phase's section.

When done:
1. Mark the phase complete in MOBILE_BUILD_PLAN.md (replace ⬜ with ✅ Phase N — COMPLETE YYYY-MM-DD in both the Status Overview table and the phase header).
2. Append the phase's PROJECT_STATE.md update entry to the Current Feature State table.
3. Update the Repository Structure section with new files.
4. Run `npx tsc --noEmit` and fix all errors.

Do not start the next phase. Report what was built.
```

---

### Template 3 — Execute a Specific Phase (use to jump to a phase by name)

```
Read PROJECT_STATE.md and MOBILE_BUILD_PLAN.md carefully before doing anything.

Execute Phase [PHASE NAME, e.g. "4b — Nutrition Screen: Accordion + Nutrient Rows"] from MOBILE_BUILD_PLAN.md. Follow every implementation detail in that section. Reuse existing desktop lib/ files wherever specified (do NOT duplicate logic that already exists).

When done:
1. Mark the phase complete in MOBILE_BUILD_PLAN.md (replace ⬜ with ✅ and add today's date in both the Status Overview table and the phase header).
2. Append the phase's PROJECT_STATE.md update entry to the Current Feature State table.
3. Update the Repository Structure section with new files.
4. Run `npx tsc --noEmit` and fix all errors.

Report what was built when done.
```

---

### Template 4 — Resume After Interruption (use if a session ended mid-phase)

```
Read PROJECT_STATE.md and MOBILE_BUILD_PLAN.md. A previous session may have been interrupted mid-phase.

Check the Status Overview table in MOBILE_BUILD_PLAN.md for any phase that is partially done but not yet marked ✅. Also check the filesystem (list components/mobile/ and app/m/) to see which files actually exist vs what is planned.

If a phase is incomplete, finish it. If it was complete but not marked, mark it and update PROJECT_STATE.md. Then execute the next ⬜ phase.

When done:
1. Mark completed phases in MOBILE_BUILD_PLAN.md.
2. Update PROJECT_STATE.md Current Feature State and Repository Structure.
3. Run `npx tsc --noEmit` and fix all errors.
```

---

### Template 5 — Polish Phase (Phase 7 only)

```
Read PROJECT_STATE.md and MOBILE_BUILD_PLAN.md.

Phases 1–6 should all be marked ✅. Now execute Phase 7 — Polish & iOS Safe Areas.

Work through the Phase 7 checklist systematically. For each checklist item: find the relevant file(s), make the change, and check it off in MOBILE_BUILD_PLAN.md (replace `- [ ]` with `- [x]`).

After all checklist items are complete:
1. Run `npx tsc --noEmit` — fix all errors.
2. Mark Phase 7 complete in the Status Overview table and phase header.
3. Append the Phase 7 PROJECT_STATE.md update entry to Current Feature State.
4. Update the Open Backlog Items section: move "Mobile-responsive collapse" to completed, or remove it if fully addressed.

Report a summary of every change made.
```

---

## Revision Notes — 2026-08-07 Code Audit

Both mobile plans were written against a remembered version of the codebase and were checked against the live repo for the first time on 2026-08-07, before any phase had been executed. Nothing had been built yet, so all corrections are to the plans, not to code.

**Structural blockers found (new Phase 0):**
1. `app/layout.tsx:32-45` renders a `md:hidden` "Open on Desktop" gate and wraps children in `hidden md:contents`. Since `app/m/` nests inside it, the entire mobile app would have been `display: none` behind an opaque overlay on every target device. Neither plan mentioned it.
2. Viewport/PWA meta was specified as hand-written `<meta>` tags; Next 16 injects its own and the framework API is `export const viewport` / `export const metadata`. `viewport-fit=cover` was also deferred to Ph-7 despite Ph-1 depending on safe-area insets.
3. No path existed for a phone user landing on `/` to reach `/m`.

**API signatures corrected** (all verified against source; see the Verified API Reference table): `getEntriesForDateRange` (no userId), `addEntry` (whole-object payload), `entry.entry_type` not `entry.type`, `item.amount_g` not `item.grams`, `loadSavedProfiles` / `loadSavedMeals` / `loadMealPlans` (no args), `NUTRIENT_GROUP_LIST` (no member-nutrient arrays; singular category values), `FoodNutrientMap` (Record, not Map), `computeComplementScore` (non-nullable profile).

**Correctness fixes:**
- DV target resolution was missing the `FOOD_METRIC_TARGETS` fallback, which would have left the whole Food Metrics group with no %DV.
- Ph-5b's day-totalling recipe would have reintroduced the Glycemic Index sum-vs-weighted-average bug already fixed twice on desktop.

**Design corrections:**
- Breakfast/Lunch/Dinner/Snack grouping does not exist in the schema or on desktop; day log now groups by `entry_type` with `meal_label` sub-grouping for plan entries.
- Diet suggestions now read the desktop diet list (`loadDietList`) instead of one day's log entries, matching MOBILE_PLAN Section 16 feature 9's own empty states.
- Donut inner-ring-only is an additive `innerOnly` prop, not a CSS clip (the clip would cut the labels).
- Streak counts from yesterday (not today) so it doesn't reset at midnight, and reuses the existing fetch instead of issuing a second one.
- Nutrient info sheet state hoisted to `MobileShell`, since Ph-4c and Ph-5b both open it.
- `document.body.style.overflow` restore-on-unmount is required (shared `<body>` across `/` and `/m`), not cosmetic.
- Added a `/m` payload measurement gate in Ph-1 — `fetchAppData()` ships ~14.7k nutrient values to the client.

**Known stale docs (not fixed here):** PROJECT_STATE.md's "Adding a New NUTRIENT" checklist describes a member-nutrient array on `NUTRIENT_GROUP_LIST` that does not exist; its repository structure omits `lib/juiceFactors.ts` and `lib/userPreferencesStorage.ts`; root layout metadata says 59 nutrients while PROJECT_STATE says 58.
