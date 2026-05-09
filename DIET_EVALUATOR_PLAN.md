# Diet Evaluator Tab — Design Plan

**Purpose:** A "Diet" tab where a user builds a list of foods they typically eat (over a month), and the app shows an estimated nutritional profile — not meal-by-meal accuracy, but a general picture of where their habitual diet is strong or weak.

**Key constraint:** Portion-agnostic. No grams, no quantities. The goal is coverage distribution, not precise daily totals.

---

## Decision 1 — Calculation Methodology ✅ DECIDED

*Frequency-weighted serving average.*

Each food is rated 1–5 by the user. Rating 3 is the baseline (one standard serving); ratings above and below scale proportionally from there:

| Rating | Multiplier | Meaning |
|---|---|---|
| 1 | 0.25× serving | Rarely / trace amounts |
| 2 | 0.5× serving | Occasionally / small amounts |
| 3 | 1× serving | Standard serving — baseline |
| 4 | 1.5× serving | Regularly / generous portion |
| 5 | 2× serving | Often / large amounts |

3 is the anchor: it represents exactly one default portion from `portionSizes.ts`. Below 3 scales down (½ and ¼ serving); above 3 scales up (1.5× and 2×). The step from 4→5 is the same absolute increase as 3→4 (+0.5 serving each), making the upper half of the scale linear.

**How the calculation works:**

1. For each selected food, compute its nutrient contribution: `value_per_100g × (portionGrams / 100) × ratingMultiplier`
2. Sum contributions across all selected foods to get total nutrient intake
3. Divide by daily RDA target to get %DV
4. Display as bars (same as Day Planner)

**Default rating:** All newly added foods start at **3** (one standard serving). User adjusts inline in Panel 2.

**Hover labels on the rating selector:** As the user mouses over (or taps and holds on touch) each rating option, a small label appears showing the multiplier — so they know exactly what commitment they're making before clicking:

| Hover target | Label shown |
|---|---|
| 1 | 0.25× serving |
| 2 | 0.5× serving |
| 3 | 1× serving |
| 4 | 1.5× serving |
| 5 | 2× serving |

The label appears above or below the rating control (tooltip style), dismisses on mouse-out, and is consistent whether the user is setting a new rating or changing an existing one.

**Interpretation note:** The result represents estimated relative intake — not a calibrated daily total. The bars answer *"given how often I eat these foods, do they collectively lean toward covering this nutrient?"* rather than *"exactly how many mg do I get per day?"*

---

## Decision 2 — Food List Input UI ✅ DECIDED

*Three-column layout: category browser → selected foods → results.*

The Diet tab has three side-by-side panels:

```
┌──────────────────────┬──────────────────────┬───────────────────────────┐
│  Browse Foods        │  Your Diet           │  Nutrient Coverage        │
│  ──────────────────  │  ──────────────────  │  ─────────────────────── │
│  [🔍 Search foods ]  │  Banana        ★★☆  │  Vitamin D  ██░░░  31%   │
│                      │  Broccoli      ★☆☆  │  Iron       ████░  58%   │
│  [Fruits          ▶] │  Chicken       ★★★  │  Calcium    █████  88%   │
│  [Vegetables      ▼] │  Salmon        ★★☆  │  ...                     │
│    · Broccoli ✓      │  Spinach       ★☆☆  │                          │
│    · Kale            │                      │                          │
│    · Spinach ✓       │  12 foods            │                          │
│  [Meat            ▶] │  [Clear all]         │                          │
│  [Dairy           ▶] │                      │                          │
│  ...                 │                      │                          │
└──────────────────────┴──────────────────────┴───────────────────────────┘
```

### Panel 1 — Category Browser (leftmost)

- All category rows **collapsed by default**; user clicks a category header to expand it
- Expanded category shows its foods as a simple list; clicking a food **moves it to Panel 2** (not a checkbox — a click-to-add action)
- Foods already in Panel 2 appear with a checkmark/tint in Panel 1 so the user can see at a glance what's selected; clicking again removes it from Panel 2
- **Search bar at the top:** typing filters food names across all categories simultaneously — only matching foods are shown and their parent categories auto-expand; non-matching categories stay collapsed. Clearing the search field collapses all categories and restores the default closed state

### Panel 2 — Selected Foods with Star Ratings

- Each added food appears as a row: food name + inline 1★ / 2★ / 3★ tap-to-set rating
- Default rating on add: **1★**
- Rows are ordered by the sequence the user added them (not alphabetical)
- Each row has a remove button (×) that sends the food back to Panel 1 (deselects it)
- A food count and "Clear all" button at the bottom
- Panel 2 updates live — adding or changing a star rating immediately recalculates Panel 3

### Panel 3 — Results (rightmost, covered under Decision 3)

- Recalculates on every change to Panel 2 (food add/remove or star change)
- Always visible alongside the input panels — no need to "submit"

---

## Decision 3 — Results Display ✅ DECIDED

*Two-tier results: scrollable nutrient sidebar (Panel 3) at the top + full-width category cards below.*

### Tier 1 — Nutrient Sidebar (Panel 3, top section)

A scrollable list of all 58 nutrients displayed as labeled %DV bars — same visual language as the Day Planner sidebar (`MealNutritionSidebar`). Always visible as the third column alongside the Browse and Selected Foods panels.

**Filter controls** sit just above the bar list, allowing the user to narrow what's shown:

```
  [All]  [Gaps]  [Fulfilled]          Sort: [Gap-first ▼]
  ────────────────────────────────────────────────────
  Vitamin D     ██░░░░░  31%   ← gap
  Iron          ████░░░  55%   ← gap
  Calcium       ██████░  88%
  Vitamin B12   ████░░░  61%   ← gap
  ...
```

- **All** — show every nutrient (default)
- **Gaps** — show only nutrients below the gap threshold (same threshold as Decision 5)
- **Fulfilled** — show only nutrients at or above the threshold
- **Sort dropdown** — Gap-first (ascending %DV) or Category-grouped
- Clicking a bar opens the existing `NutrientInfoCard` flyout (reuse as-is)

### Tier 2 — Category Cards (full-width below all three panels)

Six cards spanning the full page width, one per nutrient category. Always visible below the three-column section — always at a glance, no expand/collapse.

```
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│ Macronutrients     │ │ Vitamins           │ │ Minerals           │
│ avg ██████░  79%   │ │ avg ███░░░░  48%   │ │ avg ████░░░  54%   │
│ Protein  ████  82% │ │ Vit D  ██░   31%  │ │ Iron  ████  55%   │
│ Fat      █████ 91% │ │ B12    ████  61%  │ │ Ca    ██░░  38%   │
│ Net Carb ████░ 74% │ │ Vit C  █████ 88%  │ │ Mg    ███░  52%   │
│ Fibre    ██░░  40% │ │ ...               │ │ ...               │
└────────────────────┘ └────────────────────┘ └────────────────────┘
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│ Fatty Acids        │ │ Amino Acids        │ │ Food Metrics       │
│ avg ██░░░░  33%    │ │ avg █████░  72%    │ │ avg ████░░  63%    │
│ ...                │ │ ...                │ │ ...                │
└────────────────────┘ └────────────────────┘ └────────────────────┘
```

- Each card: category name, category-average %DV bar, mini bars for each nutrient in the category
- Cards are read-only at-a-glance panels; no expand/collapse interaction needed
- Mini bars use the same red/amber/green color coding as the sidebar
- Cards update live as foods or star ratings change

### Combined page layout

```
┌──────────────────────┬──────────────────────┬───────────────────────────┐
│  Browse Foods        │  Your Diet           │  Nutrient Coverage        │
│  (Panel 1)           │  (Panel 2)           │  [All][Gaps][Fulfilled]   │
│                      │                      │  Sort: [Gap-first ▼]      │
│  ...                 │  ...                 │  Vit D   ██░  31%  ←gap  │
│                      │                      │  Iron    ████  55% ←gap  │
│                      │                      │  Calcium █████ 88%       │
│                      │                      │  ...                      │
├──────────────────────┴──────────────────────┴───────────────────────────┤
│  Category Overview                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ...                │
│  │ Macronutr.   │ │ Vitamins     │ │ Minerals     │                     │
│  │ avg 79%      │ │ avg 48% ←   │ │ avg 54%      │                     │
│  └──────────────┘ └──────────────┘ └──────────────┘                     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Decision 4 — What the Bars Represent ✅ DECIDED

Each nutrient bar in Panel 3 shows two things simultaneously: how many foods in the user's list are meaningful sources of that nutrient, and the estimated proportional coverage relative to the user's monthly food target.

### Purpose

This tab is a monthly diet overview — not a daily log. A user throws in every food they habitually eat over a month, assigns relative frequency ratings, and the app shows whether their food repertoire covers each nutrient at all, and how well. The bars answer: *"across my usual monthly diet, am I getting this nutrient?"*

---

### Two layers per nutrient bar

**Layer 1 — Source count badge**

A small pill displayed next to each bar showing how many foods in the list contribute ≥5% DV for that nutrient (at the food's default portion × its rating multiplier).

```
  Selenium     ░░░░░░░  3%    [0 sources]   ← not in diet
  Iron         ██░░░░░  28%   [1 source]    ← fragile
  Vitamin C    ████░░░  71%   [3 sources]   ← covered
```

| Badge | Color | Meaning |
|---|---|---|
| 0 sources | Red | Nutrient is absent from the food repertoire |
| 1 source | Amber | Covered but fragile — one food removal collapses it |
| 2+ sources | Green | Robust multi-food coverage |

Foods with NULL nutrient values count as zero — if data is unavailable, the food is not contributing. Lutein & Zeaxanthin will show 0 sources across all foods until food data is added to the database.

**Layer 2 — Magnitude bar**

The bar fill is the raw weighted nutrient sum divided by the RDA target. No automatic scaling is applied.

For each food:
```
nutrientContrib = (value_per_100g × portionGrams / 100) × ratingMultiplier
```

Summed across all foods and divided by RDA:
```
%DV = Σ nutrientContrib / rdaTarget
```

The bar reflects exactly what the ratings imply. When the user's total monthly food weight is close to their chosen target, the bars represent a meaningful proportional nutrient profile. When they are over target, all bars inflate proportionally — which is visible both in the bars and in the weight indicator (see below). The system does not silently correct over-allocation; the user calibrates their own ratings.

The full upper-limit color logic from `rdaColorScale.ts` applies to all bars — `normal-with-ul` nutrients (iron, zinc, Vitamin A, selenium, etc.) show the UL warning color when the bar exceeds their upper limit threshold, identical to the Day Planner behavior.

---

### Monthly food weight target

The user sets a **monthly food weight target** in grams — the total gram volume of food their selections should represent across a month. This target is the calibration reference for their 1–5 ratings. The default is pre-selected from the global DV profile so most users never need to change it.

**Target presets:**

| Option | Monthly target | Daily equivalent |
|---|---|---|
| Male — sedentary | ~42,000g | ~1,400g/day |
| Male — average | ~51,000g | ~1,700g/day |
| Male — active | ~60,000g | ~2,000g/day |
| Female — sedentary | ~36,000g | ~1,200g/day |
| Female — average | ~45,000g | ~1,500g/day |
| Female — active | ~54,000g | ~1,800g/day |
| Custom | user input | bounded 15,000–150,000g |

The custom entry field validates input and rejects values outside the 15,000–150,000g range with an inline message.

**Weight indicator in Panel 2:**

A fill bar at the top of the selected-foods panel shows the running total of the user's rated selections against their monthly target:

```
  Monthly target: [Male — average  ▼]  ~51,000g
  Your diet implies:  70,200g / month
  ████████████████████████░░░  138% of target  ↑ over
```

| Rated weight vs. target | Indicator | Guidance |
|---|---|---|
| ≤ 90% | Amber | "Under — raise some ratings or add foods" |
| 90–110% | Green | "On target — ratings look calibrated" |
| 110–150% | Amber | "Over — consider lowering some ratings" |
| > 150% | Red | "Well over — ratings are too aggressive" |

A user who adds many foods all at rating 5 will see a red indicator and implausibly inflated bars — the signal to go back and assign honest ratings. Nothing is forced; the calibration is the user's responsibility.

---

## Decision 5 — Color Thresholds ✅ DECIDED

Diet-optimized scale: `< 30%` → red · `30–70%` → amber · `≥ 70%` → green · `normal-with-ul` nutrients use the existing UL color logic from `rdaColorScale.ts`.

The Day Planner's 50/100 thresholds are calibrated for single-meal contributions, where hitting 100% DV from one meal is genuinely an achievement. The Diet tab evaluates a full monthly food repertoire, so the bar for "adequate" is meaningfully higher — a diet covering 70%+ of a nutrient across habitual foods is a solid result. The adjusted thresholds produce a more informative signal at the diet scale without affecting any other tab.

---

## Decision 6 — Persistence ✅ DECIDED

localStorage with Supabase sync, mirroring the existing draft-plan pattern in `MealPlanner.tsx`.

- On every change, the food list and ratings are written to localStorage under `np:diet:foods` and `np:diet:target`
- When a user is logged in, changes are also synced to a new `user_diet_lists` Supabase table (`user_id`, `foods` JSONB, `monthly_target_g` integer, `updated_at`)
- On load, Supabase data takes precedence over localStorage if the user is logged in; localStorage is used for guests
- The new table requires a migration and RLS policy (owner-only read/write) before launch

---

## Decision 7 — Diet Improvement Suggestions ✅ DECIDED

Two complementary suggestion surfaces: a global top-10 panel and per-nutrient hover tooltips.

### Surface 1 — Top 10 foods to add (global panel)

Displayed below the category cards, spanning the full page width. Shows the 10 foods not currently in the user's diet list that would most improve their overall nutrient gaps — scored against the current list's weakest nutrients using the same complement score logic from `complementScore.ts`, adapted to evaluate against diet-level gaps rather than meal-level gaps.

Each food card shows the food name, its food category, and which specific gap nutrients it addresses. The user can click any card to add the food directly to Panel 2 (it lands at the default rating of 3). This panel recalculates live as the user's food list changes.

```
  ┌─────────────────────────────────────────────────────────────────────┐
  │  Foods that would strengthen your diet                              │
  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ...           │
  │  │ Sardines     │ │ Pumpkin Seeds│ │ Beef Liver   │               │
  │  │ Meat         │ │ Seeds        │ │ Meat         │               │
  │  │ ↑ Selenium   │ │ ↑ Zinc       │ │ ↑ B12, Iron  │               │
  │  │ ↑ Vitamin D  │ │ ↑ Magnesium  │ │ ↑ Vitamin A  │               │
  │  │  [+ Add]     │ │  [+ Add]     │ │  [+ Add]     │               │
  │  └──────────────┘ └──────────────┘ └──────────────┘               │
  └─────────────────────────────────────────────────────────────────────┘
```

### Surface 2 — Per-nutrient top 3 tooltip

When the user hovers over any nutrient bar in Panel 3, a tooltip appears showing the top 3 foods in the database not already in the user's list that are the strongest sources of that specific nutrient. This mirrors the existing `NutrientInfoCard` flyout pattern from the Day Planner.

The tooltip shows each food's name, its contribution per default serving as %DV, and a one-click add button. It dismisses on mouse-out.

```
  Iron  ██░░░░░  28%  [1 source]
         ↑
  ┌─────────────────────────────────┐
  │  Top sources not in your diet   │
  │  1. Beef Liver      183% DV  [+]│
  │  2. Lentils (cooked) 37% DV  [+]│
  │  3. Pumpkin Seeds    23% DV  [+]│
  └─────────────────────────────────┘
```

The two surfaces are complementary: the global panel gives a broad "what should I add next?" basket, while the per-nutrient tooltip gives a specific "what fixes this exact gap?" answer inline without leaving the results view.

---

## Decision 8 — Page Layout ✅ DECIDED

Layout was established by Decisions 2, 3, and 7. Full page structure top to bottom:

```
┌──────────────────────┬──────────────────────┬───────────────────────────┐
│  Panel 1             │  Panel 2             │  Panel 3                  │
│  Browse Foods        │  Your Diet           │  Nutrient Coverage        │
│  ──────────────────  │  ──────────────────  │  [All][Gaps][Fulfilled]   │
│  [🔍 Search foods ]  │  Monthly target: ▼   │  Sort: [Gap-first ▼]      │
│                      │  ░░░░░░  138% ↑ over │                           │
│  [Fruits          ▶] │  ──────────────────  │  Selenium  ░  3% [0 src] │
│  [Vegetables      ▼] │  Banana       ③      │  Iron     ██ 28% [1 src] │
│    · Broccoli ✓      │  Broccoli     ②      │  Vitamin C ████ 71%      │
│    · Kale            │  Chicken      ④      │  ...                      │
│    · Spinach ✓       │  Salmon       ③      │                           │
│  [Meat            ▶] │                      │                           │
│  [Dairy           ▶] │  18 foods            │                           │
│  ...                 │  [Clear all]         │                           │
├──────────────────────┴──────────────────────┴───────────────────────────┤
│  Category Overview (6 cards, full width)                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ...       │
│  │Macronutr.  │ │Vitamins    │ │Minerals    │ │Fatty Acids │            │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘            │
├──────────────────────────────────────────────────────────────────────────┤
│  Foods that would strengthen your diet (top 10, full width)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ...                            │
│  │ Sardines │ │Pmp Seeds │ │Beef Liver│                                 │
│  └──────────┘ └──────────┘ └──────────┘                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

The three panels share equal height in the top section and scroll independently. The category cards and suggestions panel sit below as full-width rows.

---

## Decision 9 — DV Profile Integration ✅ DECIDED

The Diet tab uses the global DV profile, same as every other tab. The monthly food weight target is not a local Diet tab setting — it lives inside the global DV profile so the user sets it once and it applies everywhere.

### What changes in the global DV profile

A new field is added to each profile: **daily food weight (g)**. This is the gram target that feeds the Diet tab's weight indicator and normalization. The built-in profiles ship with sensible defaults:

| Profile | Default daily weight |
|---|---|
| Male — average | 1,700g |
| Male — active | 2,000g |
| Female — average | 1,500g |
| Female — active | 1,800g |

The custom DV profile editor (`DVProfilePanel.tsx`) gets a new input field — a simple numeric entry for daily food weight in grams — alongside the existing nutrient RDA fields. A user who wants to use 2,000g simply types it there and it persists with their profile.

### What this means for the Diet tab

Panel 2 no longer needs a local monthly target dropdown. It reads `rdaProfile.dailyWeightG` from the global profile state passed down through `AppShell` → `MainView` → `DietView`, the same prop chain used by every other tab.

The monthly total displayed in the weight indicator is `dailyWeightG × 30`. Switching the global DV profile in the header instantly updates both the RDA targets and the weight reference in the Diet tab.

### Implementation notes

- `rdaProfiles.ts` built-in profile objects each gain a `dailyWeightG` field
- `DVProfilePanel.tsx` renders a new numeric input for this field in the editor
- `profileStorage.ts` JSONB already stores arbitrary profile keys — no schema change needed for saved custom profiles
- localStorage key for the Diet tab target is removed; `np:global-custom-rda` carries the value instead

---

## Build Order (Suggested)

1. **New tab entry** — Add "Diet" to the tab bar in `MainView.tsx`; create `DietView.tsx` shell
2. **Food selection panel** — Search bar + category accordion; localStorage persistence
3. **Calculation engine** — `lib/dietProfile.ts`: given `foodIds[]`, return per-nutrient avgPct
4. **Results panel** — Reuse/adapt `MealNutritionSidebar`-style bar list with gap-first sort toggle
5. **Suggestions panel** — Adapt complement score for "best foods not already in list"
6. **Polish** — Threshold labeling, empty state, loading state, color consistency

---

## Open Questions (Decide with user)

- Should a user be able to save multiple named diet profiles ("My Current Diet", "Ideal Diet")?
- Should the tab be accessible without login, or gated behind auth?
- Should foods be grouped by category in the selected-list, or flat (added order)?
- Should there be a food count cap (e.g., max 50 foods)?
