# Mobile Build Plan — Execution Guide

**Created:** 2026-06-05  
**Based on:** MOBILE_PLAN.md (all decisions finalized, Sections 1–16)  
**Project state file:** PROJECT_STATE.md  
**Target route:** `/m` (separate from desktop `/`)

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
| Ph-1 | Foundation: Route, Layout, Shell, Header | ⬜ Not started |
| Ph-2 | Account Screen + Auth | ⬜ Not started |
| Ph-3 | DV Profile Sheet | ⬜ Not started |
| Ph-4a | Nutrition Screen — Core Controls | ⬜ Not started |
| Ph-4b | Nutrition Screen — Accordion + Nutrient Rows | ⬜ Not started |
| Ph-4c | Nutrition Screen — Advanced Features | ⬜ Not started |
| Ph-5a | Calendar Screen — Week Strip + Day Log | ⬜ Not started |
| Ph-5b | Calendar Screen — Summary Chips + Visualizations | ⬜ Not started |
| Ph-6 | Add Food/Meal Sheet | ⬜ Not started |
| Ph-7 | Polish, Safe Areas, App-Like Behaviour | ⬜ Not started |

---

## Phase Detail

---

### ⬜ Phase 1 — Foundation: Route, Layout, Shell, Header

**Goal:** Everything needed before a single screen can render. After this phase, visiting `/m` shows a blank dark shell with a bottom tab bar and a top header.

**Files to create:**

| File | Purpose |
|---|---|
| `app/m/layout.tsx` | Minimal layout: sets all viewport meta, PWA meta, apple-touch tags, manifest link, body overflow hidden, slate-900 background. No desktop nav chrome. |
| `app/m/page.tsx` | Server component: calls `fetchAppData()` (reuse existing), passes `AppData` to `<MobileShell>`. |
| `public/m/manifest.json` | PWA manifest (start_url=/m, standalone display, slate-900 theme/bg). |
| `components/mobile/MobileShell.tsx` | Root client wrapper: owns `activeTab` state ('calendar'\|'nutrition'\|'account'), renders `<MobileHeader>` + active screen placeholder + bottom tab bar. Visual Viewport API effect for keyboard-safe tab bar. |
| `components/mobile/MobileHeader.tsx` | Top bar: app title left, DV profile chip right (placeholder text "No Profile" for now — wired in Ph-3), streak pill center-right (hidden if streak=0, placeholder for Ph-5b). |
| `app/globals.css` (modify) | Add mobile-only CSS rules under a `@media (max-width: 767px)` block OR add to a new `app/m/mobile.css` imported only in `app/m/layout.tsx`: tap highlight, user-select, touch-callout, focus/focus-visible ring rules, body overscroll-behavior-y:none, -webkit-font-smoothing, text-size-adjust, button active scale. |

**Key implementation details:**

- `app/m/layout.tsx` must include every meta tag from MOBILE_PLAN.md Sections 10c and 10d Group 1 exactly as written.
- `MobileShell.tsx` bottom tab bar: 56px tall, `pb-[env(safe-area-inset-bottom)]`, three tabs — Calendar (calendar icon), Nutrition (search icon), Account (person icon). Active tab uses violet text + icon fill; inactive slate-400.
- Tab icons: use inline SVG or Heroicons (already available in the project if used elsewhere, otherwise inline minimal SVG paths). Do NOT introduce a new icon library dependency.
- `MobileShell.tsx` must set `overflow: hidden` on body root via a `useEffect` on mount (`document.body.style.overflow = 'hidden'`) and restore on unmount (though `/m` is a separate route so this is mostly for correctness).
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

### ⬜ Phase 2 — Account Screen + Auth

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

### ⬜ Phase 3 — DV Profile Sheet

**Goal:** The DV profile chip in the header is tappable. Tapping opens a bottom sheet showing all profiles. Selection persists to `np:m:rda-sel` in localStorage. First selection shows a toast asking to set as device default.

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
- Load saved profiles: call `loadSavedProfiles(user?.id)` from `lib/profileStorage.ts` — same as desktop. Show them below a "── Saved Profiles ──" divider.
- Custom profile stored locally: read `np:m:custom-rda` from localStorage when "Custom" profile is selected. Set via `DVProfilePanel` in a future enhancement; for now allow selecting built-ins only.
- Pass `rdaProfile: RDAProfile | null` down from `MobileShell` to both `MobileCalendarScreen` and `MobileNutritionScreen` (even though those screens are placeholders in this phase — add the prop to their interfaces now so Ph-4 and Ph-5 don't need to touch MobileShell again for this).
- Android back button handling: `window.history.pushState({ sheet: true }, '')` on sheet open; `popstate` listener calls `onClose`. Exactly as described in Section 10d Group 5.

**PROJECT_STATE.md update (agent writes this at end):**
```
| **Mobile — Phase 3: DV Profile Sheet** | ✅ Complete — MobileDVProfileSheet bottom sheet (all profiles, star device-default, first-select toast). MobileShell owns rdaProfile state (localStorage np:m:rda-sel). MobileHeader DV chip wired. Android back button dismissal via pushState sentinel. |
```

---

### ⬜ Phase 4a — Nutrition Screen: Core Controls

**Goal:** The Nutrition tab shows a food search bar, a selected food card with gram input and unit toggle, wired together. No accordion yet — just the top section functioning end-to-end.

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

- Group definitions: iterate `NUTRIENT_GROUP_LIST` from `lib/filterConstants.ts` — this already defines the 6 groups and which nutrient names belong to each group. Use this as the source of truth.
- Value computation per mode (from MOBILE_PLAN.md Section 13):
  - `/100g` → `valuesPer100g[nutrientId]`
  - `/srv` → `valuesPer100g[nutrientId] * (selectedGrams / 100)`
  - `%DV` → `valuesPer100g[nutrientId] * (selectedGrams / 100) / rdaTarget * 100`
- `valuesPer100g` is accessed directly from the selected `FoodRow` via `food.nutrients` — a `Record<number, number | null>` already present on every `FoodRow` in `AppData.foods`. No separate lookup map needed.
- `rdaTarget` comes from `rdaProfile.values[nutrientName]` (same key pattern as desktop `DataCell`). If null → no %DV, show raw value only.
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
- On tap (logged in): calls `addEntry()` from `lib/foodLogStorage.ts`. Show a 1.5s toast: "Logged Salmon (172g) to [today's date]". Today = `new Date().toISOString().slice(0, 10)`.
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
| `components/mobile/MobileDayLog.tsx` | Scrollable list of entry cards for `selectedDate`. Groups entries by type (Breakfast, Lunch, Dinner, Snack, Other) — same grouping as desktop `CalendarDayPanel`. Each entry shows food items as a comma-separated list and total gram count. Tap entry → expand to show individual items. Each item has a gram value. "No entries" empty state. FAB: `+` violet circle, `position: fixed`, `bottom: calc(56px + env(safe-area-inset-bottom) + 16px)`, `right: 16px`. Tapping FAB → calls `onOpenAddSheet()` (wired in Ph-6). |

**Key implementation details:**

- `MobileCalendarScreen` receives `appData: AppData`, `rdaProfile: RDAProfile | null`, `user` from `MobileShell`.
- Load entries: `getEntriesForDateRange(userId, startDate, endDate)` from `lib/foodLogStorage.ts`. Start = 14 days before today; end = 14 days after. Store in `entriesByDate: Record<string, FoodLogEntry[]>` (key = YYYY-MM-DD).
- Week strip shows Mon through Sun. `weekStart` is the Monday of the selected date's week. Calculate with `getDay()` + offset.
- Prev/Next week arrows: update `weekStart` by ±7 days. If navigating beyond the loaded range, extend the fetch.
- Entry grouping: use `entry.type` field (same as desktop `CalendarDayPanel` which groups by `FoodLogEntryType`). If entry has no type or type = null, group under "Other".
- Inline item display: each item in `entry.items` shows `food_name · Ng`. Find food name from `appData.foods` by `item.food_id`.
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
- Call `getEntriesForDateRange(userId, 30daysAgo, today)` on mount.
- Walk backward from today: count consecutive days where `entriesByDate[date]?.length > 0`.
- Stop at the first day with no entries.
- If today has no entries, streak = 0 (no guilt mechanic — don't show).

**MacroDonut wiring:**
- `MacroDonutChart.tsx` accepts `{ meals: Meal[], nutrients: NutrientMeta[], foodsById: Map<number, FoodRow> }`. Convert today's food_log entries into a `Meal[]`: one `Meal` object whose `items` array contains one `MealItem` per food item across all entries (`{ food_id, grams, name: food.food_name }`).
- Import: `import MacroDonutChart from '@/components/MacroDonutChart'`.
- The component always renders both inner and outer rings — there is no `showOuterRing` prop. To show only the inner (macro) ring on mobile, wrap in a fixed-size container `<div className="overflow-hidden" style={{ height: 220 }}>` sized to clip the outer ring, which renders further out from the center.

**MealCategoryRadar wiring:**
- `MealCategoryRadar.tsx` accepts `totals: Record<number, number>` (nutrient_id → raw accumulated value) + `rdaProfile: RDAProfile` + `nutrients: NutrientMeta[]`. The component computes %DV internally — do NOT pre-divide by RDA.
- Compute `totals` from day entries: for each entry's items, look up the food in `appData.foods` by `item.food_id`, then sum `food.nutrients[nutrientId] * (item.grams / 100)` across all items and all entries. The result is a `Record<number, number>` keyed by numeric nutrient ID with raw gram-scaled values.

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
3. Diet suggestions row at the very top of the Food tab (above search): A horizontal scroll row of food cards when diet suggestions are available. Render only when Food tab is active. Uses `computeDietSuggestions()` from `lib/dietSuggestions.ts`. Three empty states from MOBILE_PLAN.md Section 16 feature 9.
4. Tapping a food → gram confirm card: food name, `MobileGramInput` pre-filled to portion size, `[Log It]` button, back arrow to return to search.
5. `[Log It]` → calls `addEntry()` from `lib/foodLogStorage.ts`. Closes sheet. Shows toast on `MobileCalendarScreen`. Refreshes `entriesByDate` for today.

**Meal tab sub-flow:**
1. Two sections: "My Templates" (from `loadSavedMeals(userId)`) + "Presets" (from `loadPresetMeals()`).
2. Meal cards: name + item count + complement score badge.
3. Tapping a meal → adds all items as a single `food_log` entry with `type = 'meal'` and `source_id = meal.id`.

**Plan tab sub-flow:**
1. List of saved plans from `loadMealPlans(userId)`. Plan name + meal count.
2. Tapping a plan → adds each meal as a separate entry (same behavior as desktop `CalendarAddModal` Plan tab).

**Key implementation details:**
- `MobileAddSheet` receives `open: boolean`, `onClose: () => void`, `selectedDate: string`, `appData: AppData`, `userId: string | null`, `currentDayEntries: FoodLogEntry[]`, `rdaProfile: RDAProfile | null`, `onEntriesChanged: () => void` (triggers a re-fetch in `MobileCalendarScreen`).
- Wire from `MobileDayLog.tsx` FAB → `MobileCalendarScreen` → `MobileAddSheet` open state.
- Complement score for each food in the search list: call `computeComplementScore` at search time. This is computed in a `useMemo` keyed on `currentDayEntries` — map `foodId → score` for all matching foods.
- Diet suggestions: first call `computeDietProfile(selectedFoods, allFoodNutrients, rdaProfile, appData.nutrients)` from `lib/dietProfile.ts` to get `{ results }`, then call `computeDietSuggestions(selectedFoods, results, allFoodNutrients, appData.foods)` from `lib/dietSuggestions.ts`. Build `selectedFoods: DietFood[]` by mapping today's entry items to `{ foodId: item.food_id, daysPerWeek: 7 }`. Build `allFoodNutrients: FoodNutrientMap` (a `Map<number, Map<number, number>>` of foodId → nutrientId → value_per_100g) from `appData.foods` once on mount. `computeDietProfile` derives `dailyWeightG` from `rdaProfile` internally — no separate param needed. Run both calls inside a `useMemo` keyed on `currentDayEntries + rdaProfile`.
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
- [ ] `app/m/layout.tsx` has `viewport-fit=cover` in the viewport meta tag (required for `safe-area-inset-*` to work).

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
