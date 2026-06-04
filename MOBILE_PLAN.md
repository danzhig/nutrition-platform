# Mobile Plan — Nutrition Platform

**Created:** 2026-06-01  
**Minimum viewport:** 360 × 667 logical px (Samsung Galaxy A / iPhone 8 / SE 2020 floor)  
**Target device:** iPhone XS and up (375 × 812 logical px) — comfortable margin above minimum  
**Scope:** Calendar food log + Nutrition lookup, DV profile, login. No demo, no desktop-only features.  
**Theme:** Extend existing slate-900 dark, violet/teal/amber palette, Tailwind CSS v4.

---

## How to Read This Document

Each section presents **2–3 industry-standard options**. Choose one per section. After choices are confirmed, a build phase plan follows at the end. Options are labeled A / B / C within each section.

---

## Section 1 — Architecture: How to Deliver Mobile ✅ DECIDED: Option B

How the mobile experience is routed and structured in the codebase.

---

### Option A — Responsive Breakpoints (single codebase)

Add `block md:hidden` / `hidden md:block` guards throughout the existing components. A `MobileShell.tsx` replaces `AppShell.tsx` on small viewports; the two coexist in the same Next.js page.

**How it works:**
- `app/page.tsx` renders both `<AppShell>` (desktop) and `<MobileShell>` (mobile) with CSS visibility toggled by breakpoint.
- New mobile-specific components live in `components/mobile/`.
- Shared logic (data fetching, Supabase, rdaProfile state) is reused as-is.
- No routing changes, no redirects.

**Pros:** One deploy, one codebase. Shared data layer, auth, and lib functions. No URL gymnastics.  
**Cons:** Both shells hydrate on every page load (wasted JS on desktop). Breakpoint CSS guards must be applied carefully to avoid layout bleed.

---

### Option B — Separate `/m` App Route (recommended)

Create `app/m/page.tsx` — a new server page with its own `<MobileShell>`. The desktop `/` is untouched. Users on mobile can be redirected by middleware or bookmark `/m` directly. Can optionally be installed as a PWA via a `manifest.json`.

**How it works:**
- `app/m/layout.tsx` — minimal layout (no desktop nav chrome), sets `viewport` meta for iOS safe areas.
- `app/m/page.tsx` — fetches `AppData` (same `fetchAppData()`) and renders `<MobileShell>`.
- `components/mobile/` — all new mobile components isolated here.
- Optional: `middleware.ts` detects touch UA and redirects `/` → `/m`.
- Optional: `public/manifest.json` + `<link rel="manifest">` enables "Add to Home Screen" on iOS/Android.

**Pros:** Desktop code is completely unaffected. Mobile bundle only loads mobile code. Clean separation — desktop quirks don't leak into mobile layout. PWA-ready with minimal extra work.  
**Cons:** Two entry points to maintain. Auth state (Supabase session) is shared transparently since it's localStorage-based.

---

### Option C — Progressive Web App with Dedicated Shell

Same as Option B but with full PWA treatment from the start: service worker (via `next-pwa`), offline caching of the food/nutrient data, app icons, splash screen.

**Pros:** Installable, works offline after first load (food data is static-ish), feels truly native.  
**Cons:** Service worker setup adds complexity. Cache invalidation matters if food data changes. Adds a build dependency (`next-pwa`).

---

**Recommendation:** **Option B** — cleanest separation, no impact on desktop, zero extra dependencies, leaves PWA as a future upgrade.

---

## Section 2 — Navigation: Mobile Shell Structure ✅ DECIDED: Option A

The shell wraps both screens and provides persistent navigation.

---

### Option A — Bottom Tab Bar (industry standard)

A fixed bar at the very bottom of the viewport (above iOS home indicator). Three tabs:

```
┌────────────────────────────────┐
│  ← content area fills here →  │
│                                │
│                                │
│                                │
├────────────────────────────────┤
│  📅 Calendar  🔍 Nutrition  👤 Account │  ← fixed bottom bar
└────────────────────────────────┘
```

- Active tab uses violet accent (matching desktop's active tab underline color).
- Tap target: 56px tall, full-width third each.
- Safe area padding so bar sits above iOS home bar.
- Tab icons + labels (icon-only risks confusion; label + icon is the iOS/Android norm).

**Used by:** Google Calendar, MyFitnessPal, Cronometer, Apple Health, Lose It!  
**Pros:** Thumb-zone optimized. Always visible. Immediate one-tap switching.  
**Cons:** Eats ~56px of vertical space permanently.

---

### Option B — Top App Bar + Drawer

A fixed top bar with a hamburger icon. Tapping it slides a drawer from the left with nav links.

```
┌──[☰]─ Nutrition Platform ──[👤]─┐
│                                  │
│         content area             │
│                                  │
└──────────────────────────────────┘
```

**Pros:** More vertical content space. Familiar web pattern.  
**Cons:** Navigation is hidden behind a gesture. Users must open drawer to switch views. Not thumb-zone friendly (top left hamburger is hardest to reach on large phones). Feels less native.

---

### Option C — Swipeable Full-Screen Panels

Three panels stacked horizontally; swipe left/right to switch. Small dot indicators at bottom show position.

**Pros:** Feels very native and gesture-based. No persistent chrome.  
**Cons:** Swipe can conflict with scroll gestures inside the views. Discoverability is lower — users may not know other views exist.

---

**Recommendation:** **Option A** — bottom tab bar is the universal mobile standard and matches the content-heavy nature of this app.

---

## Section 3 — Calendar Screen Layout ✅ DECIDED: Option A

The calendar tab shows logged food entries and allows adding new ones.

---

### Option A — Week Strip + Scrollable Day Log

```
┌──────────────────────────────────┐
│  < May 2026              Week >  │  ← month label + week nav arrows
│  Su Mo Tu We Th Fr Sa           │
│  [27][28][29][30][31][ 1][ 2]   │  ← horizontal week strip, today = violet ring
├──────────────────────────────────┤
│  Thursday, May 29                │  ← selected day heading
│                                  │
│  ┌─ Breakfast ──────────────────┐│
│  │  Greek Yogurt      172g      ││  ← entry cards grouped by type
│  │  Blueberries        80g      ││
│  └──────────────────────────────┘│
│  ┌─ Lunch ───────────────────────┐│
│  │  Chicken Breast    180g      ││
│  └──────────────────────────────┘│
│  [ + Add Food / Meal ]           │  ← floating action button or inline add button
└──────────────────────────────────┘
```

- Swipe left/right on the week strip scrolls the week.
- Tap a day pill → day log below updates.
- Week strip stays sticky at top while day log scrolls.
- The "+ Add" is a FAB (floating action button) — violet circle, bottom-right corner, always reachable.

**Used by:** Google Calendar (mobile), Apple Calendar.  
**Pros:** Shows the week at a glance. Day switching is one tap. Very thumb-friendly.  
**Cons:** Can't see the full month.

---

### Option B — Collapsible Month/Week Toggle

```
┌──────────────────────────────────┐
│  < May 2026 >    [Month][Week]   │  ← toggle pills
│  Su Mo Tu We Th Fr Sa           │
│  [25][26][27][28][29][30][ 1]   │  ← if Week mode: single row
│  or full 5-row month grid        │  ← if Month mode: compact 5×7
├──────────────────────────────────┤
│  (day panel same as Option A)    │
└──────────────────────────────────┘
```

- Month mode: smaller cells (32×32px), entry dots only (no pills — too small). Tap day → panel below updates.
- Week mode: same as Option A strip.
- Toggle persists to localStorage.

**Used by:** iOS Calendar (collapses month → week when you scroll down).  
**Pros:** Gives month context without always showing it.  
**Cons:** Month view is dense on a 375px screen. Entry detail is dots, not readable text.

---

### Option C — Infinite-Scroll Day Cards

No calendar grid at all. A vertical list of day sections, today anchored on load, past above, future below.

```
┌──────────────────────────────────┐
│  ↑ scroll up for past days       │
│  ─── Tuesday May 27 ────────────│
│  [ Chicken Breast, 180g ]        │
│  ─── Wednesday May 28 ──────────│
│  (empty)                         │
│  ─── Thursday May 29 ─────── ← TODAY
│  [ Greek Yogurt, 172g ]          │
│  [ Blueberries, 80g ]            │
│  ─── Friday May 30 ─────────────│
│  (empty)  [ + Add ]              │
│  ↓ scroll down for future        │
└──────────────────────────────────┘
```

**Pros:** Dead simple. No grid math. Very easy to implement using existing `CalendarWeekList.tsx` logic.  
**Cons:** No visual week/month overview. Navigation between distant dates requires lots of scrolling.

---

**Recommendation:** **Option A** (week strip + day log) — best balance of context and usability. Familiar to any smartphone user.

---

## Section 4 — Adding Food/Meals to a Day ✅ DECIDED: Option A

Triggered by the FAB or "+ Add" button. Opens a modal for choosing what to log.

---

### Option A — Bottom Sheet with Type Chooser → Food Search

```
  ┌──────────────────────────────┐   ← slides up from bottom
  │         Add to Thursday       │
  │  [  Food  ] [ Meal ] [ Plan ] │   ← type tabs (same as desktop CalendarAddModal)
  │  ┌───────────────────────────┐│
  │  │ 🔍  Search foods...       ││   ← auto-focused search
  │  └───────────────────────────┘│
  │  Chicken Breast        182g   │   ← result rows; tap to select
  │  Chicken Thigh         150g   │
  │  ...                          │
  │  Category: [All ▼]           │   ← category filter
  └──────────────────────────────┘
```

- Sheet height: 80vh. Handle at top for drag-to-dismiss.
- After tapping a food: shows a gram confirmation card (same as desktop) with +/− or custom gram input, then [Log It].
- Type tabs scroll to Meal / Plan for preset/saved-plan picking.

**Pros:** Standard mobile sheet pattern. Search auto-focus saves taps. Dismissible by drag.  
**Cons:** Sheet + confirmation step = two layers.

---

### Option B — Full-Screen Food Picker

Tapping "+ Add" opens a full-screen view (like a push navigation) with food search at top. Back arrow to cancel. Same flow as Option A but uses full screen instead of a sheet.

**Pros:** More vertical space for results. Feels more like a native app page.  
**Cons:** Heavier feel for quick add. Back gesture needed to cancel.

---

**Recommendation:** **Option A** — bottom sheet is the mobile standard for "add item" flows (iOS Reminders, Apple Health, Shortcuts). Less disorienting than a full-screen push.

---

## Section 5 — Nutrition Lookup Screen Layout ✅ DECIDED: Option A

The nutrition screen lets you search for any food and see its full nutrient breakdown. Core controls:
- Food search bar
- Gram input (default = standard serving, user can type any gram value)
- Unit toggle: **%DV · /srv · /100g**
- DV profile selector (feeds the %DV calculation)

---

### Option A — Sticky Food Card + Accordion Nutrient Groups (Cronometer-style)

```
┌──────────────────────────────────┐
│  🔍  Search foods...             │  ← sticky search bar
├──────────────────────────────────┤
│  Salmon (Atlantic, Farmed)       │  ← selected food name
│  172g  [–][+]  [ 172 g ↑ ]      │  ← gram input row (tap number to edit)
│  [ %DV ] [ /srv ] [ /100g ]     │  ← 3-way unit toggle
│  Profile: Male Avg  [Change ▾]  │  ← DV profile selector
├──────────────────────────────────┤
│  ▼ Macronutrients                │  ← collapsed group header (tap to expand)
│    Calories        310 kcal      │  ← expanded rows
│    Protein         34.5 g · 69% │
│    Net Carbs        0.0 g        │
│    Fat             14.0 g        │
│    Dietary Fibre    0.0 g        │
│  ▶ Vitamins                      │  ← collapsed (tap to expand)
│  ▶ Minerals                      │
│  ▶ Fatty Acids                   │
│  ▶ Amino Acids                   │
│  ▶ Food Metrics                  │
└──────────────────────────────────┘
```

- Each row shows: name · value+unit · (optionally) %DV if in %DV mode — same coloring as desktop (green/amber/red via rdaCellColor).
- Macronutrients expanded by default, others collapsed.
- Expanded state persists per-session.

**Used by:** Cronometer (nearly identical), USDA FoodData Central mobile.  
**Pros:** User can look at one category at a time without visual overload. Extremely scalable to 58 nutrients. Familiar accordion pattern.  
**Cons:** Requires taps to see other categories.

---

### Option B — Sticky Category Tab Bar + Flat List

```
┌──────────────────────────────────┐
│  🔍  Search foods...             │
├──────────────────────────────────┤
│  [Macro][Vit][Min][FA][AA][Metric]│  ← horizontal scroll tab bar
│  ─────────────────────────────── │
│  Calories        310 kcal  ──    │
│  Protein         34.5 g   ████░  │  ← bar visualization (% of DV)
│  Net Carbs        0.0 g   ─      │
│  Fat             14.0 g   ████   │
│  Dietary Fibre    0.0 g   ─      │
└──────────────────────────────────┘
```

- One category visible at a time. Swipe left/right or tap tab to switch.
- Bar visualization for each nutrient (same as desktop MealNutritionSidebar bars, scaled to available width).
- In /srv or /100g mode, bar hides (no DV reference to draw from), only the raw value shows.

**Used by:** Cronometer (Charts tab), Apple Health nutrient detail.  
**Pros:** Very visually clean per-tab. The bar gives instant sense of %DV relative magnitude.  
**Cons:** Can't scan all nutrients at once. Swiping between tabs to compare is less efficient.

---

### Option C — Single Flat Scrollable List with Sticky Category Headers

```
┌──────────────────────────────────┐
│  🔍  Search foods...             │
├──────────────────────────────────┤
│  — MACRONUTRIENTS ————————————  │  ← sticky group header (uppercase, muted)
│  Calories        310 kcal        │
│  Protein         34.5 g   69%   │
│  Net Carbs        0.0 g    0%   │
│  Fat             14.0 g   18%   │
│  Dietary Fibre    0.0 g    0%   │
│  — VITAMINS ───────────────────  │  ← next sticky header appears as you scroll
│  Vitamin A        ...            │
└──────────────────────────────────┘
```

- One long list; headers stick as you scroll past them (CSS `position: sticky`).
- No collapsing, no tabs. Everything always visible.
- Quick-jump: small floating dot index on the right edge (like iOS Contacts A–Z) lets you jump to a category.

**Pros:** Fastest for scanning everything at once. No hidden content. Matches how desktop Data Table works conceptually.  
**Cons:** Very long scroll (58 rows). May feel overwhelming. Sticky headers need careful z-index management.

---

**Recommendation:** **Option A** (accordion) — best for the goal of "not overloading the user." Macros are almost always what you want first; you dig into Vitamins/Minerals/etc. only when needed. Matches how Cronometer — the gold standard nutrition app — handles this exact problem.

---

## Section 6 — Gram Input UX (Nutrition Screen)

How the user enters a custom gram weight (e.g. "350g for a steak").

---

### Option A — Tap-to-Edit Inline Chip

The gram display is a tappable chip: `[ 172 g ]`. Tap it → the chip transforms into a number input, numpad appears. Press Done or tap away to confirm. The display updates all nutrient values instantly (reactive).

```
  Default state:   [ 172 g ↑ ]       ← the ↑ hint indicates tappable
  After tap:       [ |350| g ✓ ]     ← cursor in input, keyboard shows
```

**Pros:** Compact. Single tap to edit. No extra layer or modal.  
**Cons:** Small tap target if the chip is narrow. Keyboard covers lower half of screen.

---

### Option B — Bottom Sheet Numpad

Tapping the gram display opens a small bottom sheet (~40vh) with a large number display and a numpad. [Set] button confirms.

```
  ┌──────────────────────────────┐
  │  Enter grams for Salmon       │
  │        350                    │  ← large digit display
  │  ─────────────────────────── │
  │  [7][8][9]  [4][5][6]        │
  │  [1][2][3]  [ ][0][⌫]       │
  │            [ Set 350g ]       │
  └──────────────────────────────┘
```

**Pros:** Large touch targets. Cannot accidentally type wrong value. Can do arithmetic-style input.  
**Cons:** Two steps (tap → sheet → set). More implementation work.

---

### Option C — Stepper + Direct Input

A row with `[-]` / `[+]` flanking an editable number field. Tap the field to type a custom value. `[-]`/`[+]` increment/decrement by 10g.

```
  [ − ]  [ 172 ]  [ + ]   g
```

**Pros:** Allows quick ±10g adjustments without full edit. Good for serving-size nudges.  
**Cons:** For large jumps (172 → 350) the stepper is useless; user still has to type. Two interaction patterns for the same action.

---

**Recommendation:** **Option A** — simplest, fewest taps, and the keyboard numpad is the natural input method on mobile. Overlay the "Units" row at top of screen so it stays visible while keyboard is up.

---

## Section 7 — Unit Toggle (%DV / per serving / per 100g)

Appears in the Nutrition screen above the nutrient list.

---

### Option A — Segmented Control (3 pills)

```
  [ %DV ] [ /serving ] [ /100g ]
```

All three options visible simultaneously as a pill row. Active one is violet-filled, others are slate-700 outline. Tap to switch immediately.

- When `/serving` or `/100g` is active, the bar-chart portion (if using layout Option B) hides since there's no %DV reference.
- When `%DV` is active, the gram input still works — it scales the %DV proportionally (same as desktop DataCell logic).

**Pros:** All options always visible. One tap to switch. No menu to open. Exactly how desktop DataTable handles per-serving toggle (already familiar).  
**Cons:** Three labels may feel tight on 375px; `/serving` may truncate to `/srv`.

---

### Option B — Cycle Button

A single button that cycles through the three modes on each tap:

```
  Unit: [ %DV ↻ ]    →tap→    [ /serving ↻ ]    →tap→    [ /100g ↻ ]
```

**Pros:** Saves horizontal space.  
**Cons:** You can't jump directly to a specific mode; you may have to tap twice. Mode is less discoverable.

---

**Recommendation:** **Option A** — consistent with desktop pattern where per-serving is a toggle, and matches industry norm (Cronometer uses a segmented picker for this exactly). Use abbreviated labels: `%DV` · `/srv` · `/100g`.

---

## Section 8 — DV Profile Selector (Mobile)

Needs to appear on both the Calendar screen (for Day Total %DV) and the Nutrition screen (for nutrient %DV). First selection on a device should become the local default.

---

### Option A — Persistent Header Chip → Bottom Sheet Picker

A small chip in the top app bar of each screen shows the active profile name. Tap it → bottom sheet slides up with the profile list (same profiles as desktop: None, Male Avg, Female Avg, Male Low-Carb, Female Low-Carb, and any saved custom profiles).

```
Top bar:  [Nutrition Platform]  [Male Avg ▾]  [👤]

Sheet:
  ┌──────────────────────────────┐
  │  Daily Value Profile          │
  │  ○ None                       │
  │  ● Male Average    ★ (default)│  ← star = set as device default
  │  ○ Female Average             │
  │  ○ Male Low-Carb              │
  │  ○ Female Low-Carb            │
  │  ─ Saved Profiles ─           │
  │  ○ My Custom Profile          │
  └──────────────────────────────┘
```

- First time a profile is selected, a toast: "Set as default on this device?" [Yes / Not now].
- Device default stored to `np:mobile-default-rda` in localStorage (separate from desktop key to avoid conflict).
- Star icon sets the device default independently of the Supabase account default.

**Pros:** Always one tap away. Consistent header location on both screens. Sheet follows standard modal pattern.

---

### Option B — Inline Dropdown per Screen

A `<select>` element or custom dropdown at the top of each screen (Calendar and Nutrition). Compact.

**Pros:** Minimal code. Mobile `<select>` uses native OS picker (iOS scroll wheel).  
**Cons:** Looks inconsistent with the custom styling. The native picker is not styled to match the dark theme.

---

**Recommendation:** **Option A** — chips + bottom sheet, consistent with the mobile pattern chosen for adding food (Section 4).

---

## Section 9 — Login / Account Screen

The third bottom tab. Shown when logged out (login form); when logged in (account info + logout).

---

### Logged-Out State

```
┌──────────────────────────────────┐
│                                  │
│       Nutrition Platform         │  ← wordmark
│                                  │
│  ┌──────────────────────────────┐│
│  │  Email                       ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │  Password                    ││
│  └──────────────────────────────┘│
│  [ Sign In ]                     │  ← full-width violet button
│                                  │
│  Don't have an account? Sign up  │
└──────────────────────────────────┘
```

- No demo button, no tour.
- Email + password exactly as desktop AuthModal but laid out as a full page (not a modal).
- "Sign up" link opens the same form in register mode.
- Error messages inline below the relevant field.
- On successful login → redirect to Calendar tab (most useful landing for mobile).

---

### Logged-In State

```
┌──────────────────────────────────┐
│  Account                         │
│  ─────────────────────────────── │
│  danzhigatov@gmail.com           │
│                                  │
│  Default DV Profile: Male Avg    │  ← shows current device default
│  [ Change Profile ]              │
│                                  │
│  [ Sign Out ]                    │  ← slate-600 border, not destructive red
└──────────────────────────────────┘
```

---

## Section 10 — Summary of Recommended Choices

| Decision | Recommendation |
|---|---|
| Architecture | **Option B** — separate `/m` route |
| Navigation | **Option A** — bottom tab bar (Calendar · Nutrition · Account) |
| Calendar layout | **Option A** — week strip + day log |
| Add food modal | **Option A** — bottom sheet with type tabs |
| Nutrition list layout | **Option A** — accordion by category |
| Gram input | **Option A** — tap-to-edit inline chip |
| Unit toggle | **Option A** — segmented control (%DV / /srv / /100g) |
| DV profile selector | **Option A** — header chip → bottom sheet picker |
| Login | Full-page form, third Account tab |

All options are independently selectable — mix and match as needed before build begins.

---

## Section 10b — Viewport Constraints (Design Floor)

All layouts must be tested / verified against this minimum:

| Dimension | Minimum | iPhone XS | Headroom |
|---|---|---|---|
| Width | **360px** | 375px | +15px |
| Height (excluding browser chrome) | **600px** | ~750px | +150px |
| Safe area bottom inset (iOS) | 0px (Android) | 34px | — |

**Practical rules this imposes:**
- Bottom tab bar: 56px + `env(safe-area-inset-bottom)`. On iPhone XS = 90px total. Usable content height at 360×667 minimum: ~**510px**. No fixed chrome stack may exceed that.
- No element with a fixed `min-width` above 320px.
- Touch targets: minimum **44 × 44px** (Apple HIG), prefer 48px (Material).
- Inputs: minimum **16px font-size** — below this iOS auto-zooms the viewport on focus.
- Screen horizontal padding: **16px per side** → content column = 328px at minimum. Nothing inside may overflow that column.
- No horizontal scroll anywhere at 360px viewport.

---

## Section 10c — App-Like Behaviour (No Zoom, No Browser Quirks)

**The mobile experience must feel like a native app, not a website.** The user scrolls up and down within content areas. Nothing zooms in when tapped or focused. There is no pinch-to-zoom. Filling in a field does not shift the layout.

### Viewport meta (set once in `app/m/layout.tsx`, never overridden)

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
/>
```

`maximum-scale=1, user-scalable=no` locks the zoom level at all times — tap, pinch, double-tap — nothing zooms. This is the single most important line for the "app feel."

### Input font size rule (enforced on every input, no exceptions)

All `<input>`, `<textarea>`, and custom editable elements must have `font-size: 16px` (or larger). iOS Safari zooms the viewport to 100% when it detects a focused input below 16px — this overrides the viewport meta and breaks the layout. **16px is the hard floor. No exceptions.**

Affected elements: search bar, gram input, email field, password field, any future text input.

In Tailwind: use `text-base` (16px) as the minimum class on all inputs. Do not use `text-sm` (14px) or `text-xs` (12px) on any focusable input.

### No native `<select>` elements

Native `<select>` dropdowns on iOS open the OS scroll-wheel picker, which is visually inconsistent with the dark theme and cannot be styled. All selection UI uses custom bottom sheets or segmented controls instead (already the plan — DV profile picker, unit toggle). If a new need for a select arises, it must be implemented as a bottom sheet, not a `<select>`.

### Scroll behaviour

- Content areas scroll vertically using `-webkit-overflow-scrolling: touch` (momentum scroll, feels native). In Tailwind: `overflow-y-auto` on scroll containers.
- The page root (`<body>`) must have `overflow: hidden` so only the designated scroll containers scroll, never the whole page. This prevents the browser address bar from showing/hiding mid-scroll in a jarring way.
- Scroll containers that show lists (day log, nutrient accordion, food search results) get `overscroll-behavior: contain` so pulling past the end does not trigger page-level rubber-banding.

### Tap highlight suppression

Remove the grey flash that appears on tap (a website artifact). In global mobile CSS:

```css
* { -webkit-tap-highlight-color: transparent; }
```

Interactive elements get their own visual feedback (background color change, scale-down) instead.

### No double-tap zoom

`maximum-scale=1` in the viewport meta handles this. Additionally, setting `touch-action: manipulation` on interactive elements disables the 300ms double-tap-to-zoom delay, making taps feel instantaneous.

In Tailwind: add `touch-manipulation` class to all buttons, links, and tappable rows.

---

## Section 10d — Additional App-Like Rules

The rules below go beyond the basics. Each one is a place where a mobile web experience silently reveals itself as a website. Together they close those gaps.

---

### Group 1 — PWA / Add-to-Home-Screen Feel

When a user adds the `/m` page to their iPhone home screen, it launches in a chrome-free full-screen shell — no Safari address bar, no tab bar, no back/forward buttons — indistinguishable from a native app download.

**Required tags in `app/m/layout.tsx`:**

```html
<!-- Enables full-screen launch from home screen -->
<meta name="apple-mobile-web-app-capable" content="yes" />

<!-- Status bar blends with the dark slate-900 header -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

<!-- App name shown under the icon on the home screen -->
<meta name="apple-mobile-web-app-title" content="Nutrition" />

<!-- App icon for home screen (add a 180×180px icon to /public) -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

<!-- Web app manifest (covers Android Add-to-Home-Screen) -->
<link rel="manifest" href="/m/manifest.json" />
```

**`public/m/manifest.json`:**

```json
{
  "name": "Nutrition Platform",
  "short_name": "Nutrition",
  "start_url": "/m",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "icons": [{ "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }]
}
```

`display: "standalone"` is what strips the browser chrome on Android. `black-translucent` on iOS makes the status bar overlay the app header rather than push it down, which is the native behavior.

**Decision required:** Do you want to create the 180×180 app icon? (Can use the existing site favicon scaled up, or a custom icon.) If skipped, Add-to-Home-Screen still works — it just uses a screenshot-based icon as fallback.

---

### Group 2 — Touch Interaction Polish

**No text selection on UI chrome**

Buttons, tab bars, labels, headers, and nutrient rows should not be selectable. Long-pressing on a label and getting the iOS text magnifier loupe is a website tell.

```css
/* Applied to the shell wrapper — all UI chrome inherits */
.mobile-shell { user-select: none; -webkit-user-select: none; }
```

Only apply `user-select: text` inside areas where copying a value makes sense (e.g. a food's nutrient value row if you want users to be able to copy numbers).

**No long-press link callout**

iOS shows a "Open / Copy / Share" popup when long-pressing a link or image. Suppress it on all non-link interactive elements:

```css
* { -webkit-touch-callout: none; }
```

**Immediate pressed state (`:active` feedback)**

Native apps give visual feedback the instant a finger touches the screen — no delay. Web buttons have a 300ms delay on `:active` by default. With `touch-action: manipulation` already set, the delay is gone. Pair it with an `:active` style on every interactive element:

```css
button:active, [role="button"]:active { opacity: 0.7; transform: scale(0.97); }
```

In Tailwind: `active:opacity-70 active:scale-[0.97] transition-none` on buttons. `transition-none` prevents the scale from animating on the way *into* the press (it should be instant); allow a short transition on release.

**No focus ring on touch**

Browsers show a blue or white focus ring when you tap an element. This is for keyboard accessibility but looks wrong on touch. Use `:focus-visible` to show rings only for keyboard users:

```css
*:focus { outline: none; }
*:focus-visible { outline: 2px solid #7c3aed; outline-offset: 2px; } /* violet-700 */
```

**No image drag**

Food images or icons should not be draggable (the ghost image drag is a pure web artifact):

```html
<img draggable="false" ... />
```

In CSS: `img { -webkit-user-drag: none; pointer-events: none; }` where images are decorative.

---

### Group 3 — Keyboard & Input Handling

**Prevent pull-to-refresh**

When a user scrolls to the top of a content list and pulls down further, the browser triggers a full page refresh (Chrome Android especially). This is catastrophic in an app that holds in-memory state.

```css
body { overscroll-behavior-y: none; }
```

This also prevents the elastic rubber-band bounce at the top of the page on iOS. Individual scroll containers keep `overscroll-behavior: contain` (inner bounce is fine; page-level refresh is not).

**Visual Viewport API — keyboard-safe bottom bar**

On Android, when the software keyboard opens, the bottom tab bar can jump up and float above the keyboard, or get covered entirely, depending on the browser. Fix this with the Visual Viewport API:

```ts
// In MobileShell.tsx
useEffect(() => {
  const vv = window.visualViewport
  if (!vv) return
  const update = () => {
    // Pin the tab bar to the bottom of the visible viewport, not the layout viewport
    setTabBarBottom(window.innerHeight - vv.height - vv.offsetTop)
  }
  vv.addEventListener('resize', update)
  vv.addEventListener('scroll', update)
  return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update) }
}, [])
```

**Suppress autocorrect / autocapitalize on search and numeric inputs**

iOS autocorrect will try to fix "quinoa," "kefir," "tempeh," etc. to things it recognizes. Numeric inputs will capitalize their first character. Suppress these on all mobile inputs:

```html
<!-- Food search, gram input -->
<input
  type="search"
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="off"
  spellCheck={false}
/>

<!-- Gram input: use inputMode instead of type="number" -->
<input
  inputMode="decimal"
  autoComplete="off"
/>
```

**`inputMode="decimal"` not `type="number"` for gram input**

`type="number"` on iOS shows a numpad but includes up/down steppers and behaves oddly with decimal values. `inputMode="decimal"` shows the same numeric keyboard while keeping the input as a normal text field that React can control cleanly — same pattern as the existing `MealCard` gram input on desktop.

**Scroll focused input into view above keyboard**

When the keyboard opens it covers the bottom half of the screen. If the focused input is behind the keyboard, the user can't see what they're typing. iOS handles this automatically most of the time, but bottom sheets need explicit handling:

```ts
// After keyboard opens, scroll the input into view
inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
```

---

### Group 4 — Scroll & Overscroll

**Body background during overscroll**

When content rubber-bands (iOS) or the page is pulled past its limits, the body background color shows through. Default is white — jarring against a slate-900 app. Set it in the mobile layout:

```css
html, body { background-color: #0f172a; } /* slate-900 */
```

**Momentum scrolling on all scroll containers**

Already partially noted. Explicit Tailwind classes for every scroll container:

```
overflow-y-auto overscroll-contain
```

On iOS, momentum scrolling (the coast-to-a-stop feel) is now the default in modern browsers without `-webkit-overflow-scrolling: touch` (that property is deprecated). Using `overflow-y: auto` is sufficient on iOS 15+.

**No horizontal scroll anywhere**

Enforced via:
```css
body { overflow-x: hidden; }
```

And verified at 360px viewport width during testing of every screen.

---

### Group 5 — Rendering, Typography & Orientation

**Font smoothing**

Web text renders slightly differently from native app text. Apply antialiasing globally:

```css
body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
```

**Prevent iOS text size adjustment**

iOS Safari sometimes auto-adjusts font sizes when it thinks the text is too small (e.g. when rotating). Disable it:

```css
html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
```

**Hardware-accelerated transitions**

Tab switches, sheet slide-ups, and accordion expansions should run on the GPU compositor. Use `transform` and `opacity` for all transitions — never `height`, `top`, `left`, or `margin` (these trigger layout recalculation and jank).

```
✅ transform: translateY(0) → translateY(100%)   ← sheet slide
✅ opacity: 0 → 1                                 ← fade in
❌ height: 0 → auto                               ← causes layout recalc
❌ max-height animation                            ← same problem
```

For accordion expansion: animate with `transform: scaleY()` + `transform-origin: top`, or clip via `grid-template-rows: 0fr → 1fr` (the modern zero-height animation trick that avoids `height: auto`).

**Portrait orientation**

The layout is designed for portrait only. Landscape on a 360px-tall phone leaves ~320px of height after the tab bar — not enough for the calendar or accordion views. Two options:

| Option | Approach |
|---|---|
| **A — Soft lock (recommended)** | Show a "rotate back to portrait" overlay when `window.innerWidth > window.innerHeight`. No API needed, no permissions. |
| **B — Hard lock** | Use the Screen Orientation API: `screen.orientation.lock('portrait')`. Only works in PWA standalone mode (not in-browser Safari). |

Recommendation: **Option A** — soft lock with an overlay. Works in all contexts, requires no permissions.

**Back gesture / sheet dismissal (Android)**

On Android, the hardware back button and swipe-from-left gesture fire `popstate`. If a bottom sheet is open and the user presses back, the browser navigates away from `/m` instead of closing the sheet. Fix with the History API:

```ts
// When a sheet opens:
window.history.pushState({ sheet: 'add-food' }, '')

// In a popstate listener:
window.addEventListener('popstate', (e) => {
  if (sheetOpen) { closeSheet(); /* do not navigate */ }
})
```

This makes back = close sheet, exactly as native apps behave. Only needed on Android (iOS doesn't have a hardware back button in the browser).

---

### Group 6 — Swipe-to-Dismiss on Bottom Sheets

Native app sheets can be dragged down with a finger to dismiss them. This is expected behavior on iOS and Android. Implementation approach:

- Add a drag handle bar at the top of every bottom sheet (a 4×36px rounded pill, slate-600 color).
- Track `touchstart` → `touchmove` → `touchend` on the sheet.
- If the user drags down more than 80px, dismiss the sheet (same as tapping the backdrop).
- If they release before 80px, snap the sheet back to open position.
- Use `transform: translateY(Npx)` during drag (GPU composited, no jank) and `transition: transform 0.2s` on snap-back.

**Decision required:** Swipe-to-dismiss adds ~40 lines of touch handling logic per sheet. Worth it for the full app feel, but optional if you want to ship faster and rely on backdrop tap + button only.

---

### Summary of New Decisions Required

| Item | Choice needed |
|---|---|
| App icon (180×180px) | Create custom icon, use favicon scaled up, or skip for now |
| Portrait lock | **Option A** (soft overlay) vs Option B (Screen Orientation API) |
| Swipe-to-dismiss sheets | Include from the start vs add later |

### Reused from Desktop (no changes to existing files)

| Existing asset | Used for |
|---|---|
| `lib/fetchAppData.ts` | Same server-side data fetch in `app/m/page.tsx` |
| `lib/rdaProfiles.ts` | All profile definitions, NUTRIENT_BEHAVIORS, UPPER_LIMITS |
| `lib/portionSizes.ts` | Default grams per food |
| `lib/foodLogStorage.ts` | All food_log CRUD (add/get/update/delete) |
| `lib/mealStorage.ts` | Load saved plans for "Add Plan" flow |
| `lib/savedMealStorage.ts` | Load meal templates for "Add Meal" flow |
| `lib/presetMealStorage.ts` | Load preset meals |
| `lib/profileStorage.ts` | Load saved custom RDA profiles |
| `lib/rdaColorScale.ts` | Nutrient row color in accordion |
| `lib/filterConstants.ts` | Category lists |
| `components/AuthProvider.tsx` | Auth context unchanged |
| `types/nutrition.ts` | All types shared |
| `types/calendar.ts` | FoodLogEntry types |

### New Components (all in `components/mobile/`)

| Component | Purpose |
|---|---|
| `MobileShell.tsx` | Root wrapper: bottom tab bar + active screen |
| `MobileHeader.tsx` | Top bar: title + DV profile chip |
| `MobileCalendarScreen.tsx` | Week strip + day log orchestrator |
| `MobileWeekStrip.tsx` | Horizontal 7-day pill row with nav arrows |
| `MobileDayLog.tsx` | Scrollable entry cards for selected day |
| `MobileAddSheet.tsx` | Bottom sheet: Food / Meal / Plan type tabs + search |
| `MobileNutritionScreen.tsx` | Food search + gram input + unit toggle + accordion |
| `MobileFoodSearch.tsx` | Search bar + result list (shared between screens) |
| `MobileNutrientAccordion.tsx` | Accordion grouped by category (6 groups) |
| `MobileNutrientRow.tsx` | Single nutrient row: name · value · %DV bar |
| `MobileDVProfileSheet.tsx` | Bottom sheet profile picker |
| `MobileGramInput.tsx` | Inline tap-to-edit gram chip |
| `MobileUnitToggle.tsx` | 3-pill segmented control (%DV / /srv / /100g) |
| `MobileAccountScreen.tsx` | Login form (logged out) or account info (logged in) |

### New Routes

| Route | File |
|---|---|
| `/m` | `app/m/page.tsx` — server page, fetches AppData |
| `/m` layout | `app/m/layout.tsx` — sets viewport meta, no desktop nav chrome |

---

## Section 12 — localStorage Keys (Mobile-Specific)

Namespaced separately from desktop to avoid collisions (same browser, different tab).

| Key | Value | Purpose |
|---|---|---|
| `np:m:rda-sel` | profile id string | Active DV profile on mobile |
| `np:m:custom-rda` | JSON RDAValues | Custom RDA overrides |
| `np:m:rda-default-set` | `'true'` | Whether user has confirmed a device default |
| `np:m:cal-view` | `'week'` (only option for now) | Calendar view mode |
| `np:m:nutrition-unit` | `'pct'` \| `'serving'` \| `'100g'` | Active unit in nutrition screen |
| `np:m:nutrition-food-id` | food id number | Last viewed food (persist across sessions) |
| `np:m:nutrition-grams` | number | Last custom gram value for last viewed food |
| `np:m:nutrient-groups` | JSON string[] | Which accordion groups are expanded |

---

## Section 13 — Nutrient Display Logic (Nutrition Screen)

This mirrors the desktop DataCell logic, applied per-nutrient in the mobile accordion.

### Per-mode value computation

Given:
- `valuesPer100g` — from AppData food_nutrients row
- `selectedGrams` — user's gram input
- `portionGrams` — from `portionSizes.ts`

```
valueForDisplay:
  /100g  →  valuesPer100g[nutrientId]
  /srv   →  valuesPer100g[nutrientId] * (portionGrams / 100)
  %DV    →  valuesPer100g[nutrientId] * (selectedGrams / 100) / rdaTarget * 100
  custom →  valuesPer100g[nutrientId] * (selectedGrams / 100)   (same as /srv if selectedGrams = portionGrams)
```

When the user enters a custom gram value, `/srv` mode uses that value as if it were the serving size. The `%DV` mode always uses `selectedGrams`.

### %DV bar color

Uses existing `rdaCellColor(pctDv, behavior, upperLimitPct)` from `lib/rdaColorScale.ts`. Same green/amber/red scale as desktop.

### No-RDA nutrients

Nutrients with null RDA (e.g. Creatine) show the raw value in all modes; no %DV bar; muted label color (same as desktop).

---

## Section 14 — Build Phases

Confirmed after choices above are locked in.

| Phase | Work | Key files |
|---|---|---|
| **P1 — Shell + Routing** | `/m` route, layout, MobileShell, bottom tab bar, MobileHeader, DV chip placeholder | `app/m/`, `MobileShell.tsx`, `MobileHeader.tsx` |
| **P2 — Account Screen** | Full-page login/register form, logged-in state, sign out | `MobileAccountScreen.tsx` |
| **P3 — DV Profile Sheet** | Profile bottom sheet, device default logic, localStorage | `MobileDVProfileSheet.tsx` |
| **P4 — Nutrition Screen** | Food search, gram input, unit toggle, accordion, nutrient rows with %DV | `MobileNutritionScreen.tsx`, `MobileNutrientAccordion.tsx`, `MobileNutrientRow.tsx`, `MobileGramInput.tsx`, `MobileUnitToggle.tsx` |
| **P5 — Calendar Screen** | Week strip, day log, entry cards, day nav, day total | `MobileCalendarScreen.tsx`, `MobileWeekStrip.tsx`, `MobileDayLog.tsx` |
| **P6 — Add Food/Meal Sheet** | Bottom sheet, Food/Meal/Plan tabs, food search, gram confirm, write food_log | `MobileAddSheet.tsx` |
| **P7 — Polish & iOS safe areas** | Safe area insets, scroll rubber-banding, tap highlights, test on 375px | All mobile components |

---

## Section 16 — Additional Feature & Visualization Suggestions (from App Scan)

This section is a menu of ideas — not all are required for launch. Each comes from scanning the existing codebase and asking "does this have a good mobile life?" Priority tiers help decide what to phase in later.

**Effort key:** Low = reuses existing component logic with minimal adaptation. Medium = needs a new mobile-specific rendering. High = significant new logic or layout.

---

### Tier 1 — High Value, Low Effort (port directly from existing logic)

---

#### 1. Calorie + Macro Summary Chip at Top of Day Log

**What it is:** A compact horizontal row at the very top of the day log (above the entry cards) showing: `1,847 kcal · 142g protein · 58g fat · 180g net carbs`. Updates live as entries are added or removed.

**Why it works on mobile:** It answers "how am I doing today?" in a single glance without opening anything. Every mainstream nutrition app (MyFitnessPal, Cronometer, LoseIt) puts this at the top of the home screen.

**Where the logic comes from:** `CalendarDayPanel.tsx` already computes per-entry kcal using `caloriesId`. The macro totals use the same `food_nutrients` map the sidebar uses. All four numbers can be derived in one pass over the day's entries.

**Mobile rendering:** Four small chips in a row: `[🔥 1847 kcal]  [P 142g]  [F 58g]  [C 180g]`. Tap any chip → accordion jumps to that nutrient group. Chips turn violet when the macro hits its DV target (if profile is set).

**Effort:** Low. The math already exists; this is a display component only.

---

#### 2. Nutrient Info Bottom Sheet (tap any nutrient row)

**What it is:** Tapping any nutrient row in the nutrition accordion opens a bottom sheet (instead of a floating card) showing: body role, deficiency symptoms, excess symptoms, and the food-source stacked bar.

**Why it works on mobile:** `NutrientInfoCard.tsx` already has all this content — it just uses absolute viewport positioning as a floating card, which breaks on mobile (too narrow, overlaps controls). A bottom sheet slides up over 60–70% of the screen, fits all the text comfortably, and is dismissible by swipe-down.

**Where the logic comes from:** `NutrientInfoCard.tsx` — exact same content, new container. The `dietContribs` and `dietTotalPctDV` props are not needed in the mobile context (those are Diet tab only).

**Mobile rendering:** Bottom sheet with drag handle. Header: nutrient name + category + unit. Body: Function / Too Little / Too Much sections (same violet/amber/red labels). Footer: "Top foods high in [nutrient]" — a 3-item ranked list using the ranking logic already in `NutrientRankingView`.

**Effort:** Low. Content is a copy of `NutrientInfoCard`; the sheet container is reused from the add-food sheet.

---

#### 3. Category Pentagon Radar on Day Summary

**What it is:** The existing `MealCategoryRadar.tsx` pentagonal SVG — average %DV across 5 categories (Macronutrients, Vitamins, Minerals, Fatty Acids, Amino Acids) — shown as a compact visualization at the bottom of the day log when a DV profile is active.

**Why it works on mobile:** The radar is pure SVG with a `viewBox` — it scales perfectly to any width. At 328px it renders cleanly with no text clipping (the labels sit on the spokes at `MAX_R + 30` units outward). It gives an instant "shape of today's nutrition" that tells you more than any list.

**Mobile rendering:** Shown below the entry cards in the day log, only when at least one entry exists and a DV profile is active. Same gradient-edge polygon, same color scale. Height: ~260px. Tap the radar → expanded view with category breakdown.

**Effort:** Low. Existing SVG component renders responsively. Just needs `totals` computed from the day's log entries (same math as `MealNutritionSidebar`).

---

#### 4. Complement Score Badge on Add-Food Search Results

**What it is:** When the add-food bottom sheet is open in Food mode, each food row shows a complement score badge — a 0–100 number indicating how well that food fills today's remaining nutrient gaps.

**Why it works on mobile:** This is exactly what the desktop `FoodPickerModal` does for the Day Planner. On mobile it makes the "what should I eat?" decision instant — you can see which food fills your gaps the most without knowing anything about nutrition.

**Where the logic comes from:** `lib/complementScore.ts` → `computeComplementScore()`. Takes the candidate food's items + current day's meals as "current plan." Identical call signature.

**Mobile rendering:** Colored pill badge (green ≥65 / amber ≥35 / grey <35) on the right of each food row. Sorted by score descending by default (highest complement first). A "Sort: Score" / "Sort: A–Z" toggle lets the user switch.

**Effort:** Low. Logic is entirely in `computeComplementScore`. The day's logged entries need to be passed into the add sheet — one extra prop.

---

#### 5. Quick "Log to Today" Button from Nutrition Screen

**What it is:** While viewing a food in the nutrition screen, a sticky `[+ Log to Today]` button at the bottom of the screen adds that food (at the currently selected gram amount) directly to today's calendar entry.

**Why it works on mobile:** The key mobile use case is "I'm at the store or about to cook — let me check what's in this food, then log it." Without this button, the user has to exit the nutrition screen, go to the calendar, open the add sheet, search for the same food again, and enter grams a second time. The button collapses that to one tap.

**Where the logic comes from:** `lib/foodLogStorage.ts` → `addEntry()`. Same function used by `CalendarAddModal`.

**Mobile rendering:** Sticky bar pinned above the tab bar: `[ + Log 350g to Today ]`. If the user is not logged in, button reads "Sign in to log." Tapping shows a 1-second toast: "Logged Salmon (350g) to Thursday."

**Effort:** Medium. Requires wiring the nutrition screen's selected food + gram state into a `addEntry()` call. The toast feedback is new but small.

---

### Tier 2 — Good Value, Medium Effort (needs mobile-specific rendering)

---

#### 6. Macro Donut on Day Summary

**What it is:** A compact version of `MacroDonutChart.tsx` shown in the day summary — the inner ring shows Net Carbs / Fibre / Protein / Fat caloric split for all entries logged that day. No outer ring (too many foods to show meaningfully on mobile).

**Why it works on mobile:** Donut charts are inherently square — they scale down to 200×200px perfectly. A circular chart on a phone screen feels native (Apple Health's activity rings trained people to read rings). It answers "am I getting my macros right today?" visually.

**Mobile rendering:** 220×220px donut, inner ring only (4 slices). Center label: total kcal for the day. Below: 2×2 legend grid (same as desktop). Shown in a swipeable card row alongside the radar — swipe left to see radar, swipe right to see donut.

**Option A — Swipeable card pair:**
```
┌──────────────────────────────────┐
│  [◉ Macro Split] [◈ Categories] │  ← dot indicator + label tabs
│                                  │
│     (donut or radar fills here)  │
│                                  │
└──────────────────────────────────┘
```

**Option B — Stacked vertically:** Donut above radar, both always visible, no swipe.

**Effort:** Medium. `MacroDonutChart` logic is reusable; rendering needs to be stripped to inner-ring only and resized for mobile. The swipeable card wrapper is new.

---

#### 7. Top Foods for a Nutrient (Nutrient Ranking, Mobile-Adapted)

**What it is:** A "Top foods" list accessible from two entry points:
1. Tap a nutrient row in the nutrition accordion → bottom sheet shows "Top 10 foods high in [nutrient]"
2. From the Nutrient Info bottom sheet → a "See all high-[nutrient] foods" link

**Why it works on mobile:** The desktop `NutrientRankingView` uses a Recharts `BarChart` with rotated X-axis labels — not readable on mobile. The mobile adaptation is a simple vertical list: food name + bar + value, sorted by content per serving. Much cleaner.

**Mobile rendering:**
```
  Top foods · Vitamin C · /serving
  ────────────────────────────────
  Red Bell Pepper   190mg ████████
  Kiwi               93mg ████
  Orange             70mg ███
  Broccoli           51mg ██
  Strawberries       42mg ██
  ...
```

Unit toggle at top: `/serving` / `/100g`. Tap any food → switches the nutrition screen to show that food.

**Where the logic comes from:** The sort and value computation from `NutrientRankingView.tsx` (lines 90–140). No Recharts needed — plain divs with percentage-width bars.

**Effort:** Medium. Logic is reusable; new rendering as a vertical list component (`MobileNutrientRanking.tsx`).

---

#### 8. Food Quick-Compare (Two Foods, Stacked)

**What it is:** A stripped-down version of `FoodComparisonView.tsx` — pick two foods and see their nutrients side by side. On mobile, "side by side" becomes two columns within the accordion rows.

**Mobile rendering:**
```
  Salmon vs Chicken Breast
  [ Change A ]          [ Change B ]
  ─────────────────────────────────
  ▼ Macronutrients
  Protein    34.5g  ████  31.0g
  Fat        14g    ██    3.6g
  Net Carbs  0g     ─     0g
  ▶ Vitamins
  ▶ Minerals
```

Two columns share the nutrient label. Bars are relative to the higher value of the two. No diff panel (too complex for mobile). The food picker for A and B reuses the same `MobileFoodSearch` component from the nutrition screen.

**Effort:** Medium-high. The two-column layout in an accordion needs careful 328px constraint management. The data logic from `FoodComparisonView` is reusable (value per serving computation, same gram-input logic).

**Decision required:** Include in mobile at all, or keep desktop-only?

---

#### 9. Diet Suggestions as a "What Should I Eat?" Widget

**What it is:** A strip of suggested food cards based on `computeDietSuggestions()` — the same algorithm that powers the desktop Diet tab suggestions panel. On mobile, shown as a horizontally scrollable card row somewhere visible.

**Why it works on mobile:** "What should I eat?" is a perfect mobile use case — quick decision support. The algorithm already knows which nutrients are low in the user's diet and which foods would fill those gaps.

**Placement options:**

| Option | Where | When shown |
|---|---|---|
| A | Below the week strip in the Calendar screen | Always (when profile active + diet list has foods) |
| B | As a "Suggestions" card at the top of Add-Food sheet | When opening the add food modal |
| C | A dedicated fourth tab "Suggest" (replaces Account — move account to a header icon) | Always accessible |

**Mobile rendering:** Horizontally scrollable card row. Each card: food name, top 2 gap nutrients it fills (small colored tags), `[+ Log to Today]` button. Same as desktop `DietSuggestionsPanel` but cards are 140px wide × 110px tall.

**Effort:** Medium. Logic unchanged (`computeDietSuggestions`). New rendering for the card row at mobile proportions.

**Decision required:** Placement option A / B / C?

---

#### 10. Logging Streak Indicator

**What it is:** A small streak counter — "🔥 4 day streak" — shown in the Calendar header or the Account screen. Counts consecutive days where at least one food was logged.

**Why it works on mobile:** Streaks are a proven mobile engagement mechanic (Duolingo, Apple Rings, Headspace). On a nutrition app the motivator is real: people who log consistently get more value. This doesn't exist on desktop because desktop is more of a planning/analysis tool; mobile is where daily logging happens.

**Where the logic comes from:** `lib/foodLogStorage.ts` → `getEntriesForDateRange()`. Load the last 30 days, count back from today until you find a day with no entries.

**Mobile rendering:** A small amber pill in the Calendar header: `🔥 4`. Tap → tooltip: "You've logged 4 days in a row. Keep it up." If streak = 0: not shown (no guilt mechanic).

**Effort:** Medium. New logic for streak computation (10–15 lines); new display component is trivial.

---

### Tier 3 — Nice-to-Have, Higher Effort (new functionality)

---

#### 11. Weekly Nutrient Coverage Bar (rolling 7-day)

**What it is:** A %DV bar list (same as the nutrition sidebar) but computed over all food log entries in the rolling last 7 days — not just today. Shows your average daily coverage across the week.

**Why it works on mobile:** "How am I doing this week?" is more meaningful than "how am I doing today?" for micronutrients, since most people don't eat perfectly every day. This is a feature that doesn't exist on desktop at all.

**Mobile rendering:** Toggle above the day log: `[Today] [This Week]`. Switching to "This Week" replaces the entry list with a %DV accordion showing 7-day averages. Same accordion structure as the nutrition lookup screen, but data source is the food log rather than a single food.

**Effort:** High. Requires fetching all entries for the rolling 7-day window, summing totals across all food_nutrients, dividing by 7 for daily average, then rendering the accordion. New data pipeline, but all individual pieces (foodLogStorage, food_nutrients data) already exist.

---

#### 12. Meal Quick-Builder (Light Day Planner)

**What it is:** A simplified version of the Day Planner — build a quick ad-hoc meal on mobile without the full template/save infrastructure. Pick 2–4 foods, see their combined %DV bars, optionally log the whole meal to today.

**Why it works on mobile:** Sometimes you want to check "does salmon + spinach + olive oil cover my bases?" without opening the full desktop planner. The output is: a macro chip row + the nutrient accordion for the combined meal. No naming, no saving required (though an optional "Save as meal" button could appear).

**Mobile rendering:** A temporary "Build a meal" sheet. Food search → add up to 8 items with gram inputs → bottom section shows combined nutrient accordion. `[Log to Today]` button pins to bottom.

**Effort:** High. Requires a stripped-down in-memory meal state, the full nutrient computation pipeline (same as MealPlanner), and rendering the accordion for a combined set of items. Effectively a mini MealPlanner.

---

#### 13. Barcode Scanner Entry Point

**What it is:** A camera icon in the add-food search bar. Tapping it opens the device camera, scans a barcode, and looks up the product in an external API (e.g. Open Food Facts) to match to the closest item in your food database.

**Why it works on mobile:** This is the #1 feature request for any mobile nutrition app. Scanning a barcode is faster than searching. The match accuracy depends on whether your 257 foods overlap with packaged food barcodes — for whole foods (chicken, broccoli) it won't match, but for any packaged items in the DB it would.

**Effort:** Very High. Requires: WebRTC camera access, a barcode decoding library (e.g. `zxing-js`), an external barcode-to-nutrition API, and a fuzzy-match layer to connect external data to your food IDs. Not recommended for the initial build — flag for a future phase.

**Note:** Worth leaving an entry point (the camera icon button) as a placeholder that shows "Coming soon" — this reserves the UI space without the implementation complexity.

---

### Summary Table

| # | Feature | Tier | Effort | Decision needed |
|---|---|---|---|---|
| 1 | Calorie + macro summary chip | 1 | Low | No — include in P5 |
| 2 | Nutrient info bottom sheet | 1 | Low | No — include in P4 |
| 3 | Category radar on day summary | 1 | Low | No — include in P5 |
| 4 | Complement score on add-food | 1 | Low | No — include in P6 |
| 5 | "Log to Today" from nutrition screen | 1 | Medium | No — include in P4 |
| 6 | Macro donut on day summary | 2 | Medium | **Option A or B (swipe vs stack)** |
| 7 | Top foods for a nutrient | 2 | Medium | Include or skip? |
| 8 | Food quick-compare | 2 | Med-High | Include or skip? |
| 9 | Diet suggestions widget | 2 | Medium | **Placement: A, B, or C** |
| 10 | Logging streak indicator | 2 | Medium | Include or skip? |
| 11 | Weekly nutrient coverage (7-day avg) | 3 | High | Phase 8+ or skip? |
| 12 | Meal quick-builder | 3 | High | Phase 8+ or skip? |
| 13 | Barcode scanner | 3 | Very High | Future — placeholder only? |

---

## Decisions Required Before Build Starts

Mark each as confirmed:

- [x] **Architecture:** ~~Option A~~ / **Option B** ✅ / ~~Option C~~ — separate `/m` route, desktop untouched
- [x] **Navigation:** **Option A** ✅ / ~~Option B~~ / ~~Option C~~ — bottom tab bar (Calendar · Nutrition · Account)
- [x] **Calendar layout:** **Option A** ✅ / ~~Option B~~ / ~~Option C~~ — week strip + scrollable day log with FAB
- [x] **Add food:** **Option A** ✅ / ~~Option B~~ — bottom sheet with type tabs + food search
- [x] **Nutrition list:** **Option A** ✅ / ~~Option B~~ / ~~Option C~~ — sticky food card + accordion by category
- [ ] **Gram input:** Option **A** / B / C
- [ ] **Unit toggle:** Option **A** / B
- [ ] **DV profile:** Option **A** / B
- [ ] **Build phase order:** confirmed above or reordered
