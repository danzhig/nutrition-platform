# Diet Evaluator — Phased Execution Plan

**Reference:** Read `DIET_EVALUATOR_PLAN.md` alongside this file for full decision rationale.
**Stack:** Next.js 16 App Router · Tailwind CSS v4 · Supabase · TypeScript strict

Each phase is self-contained and leaves the app in a working, deployable state. Complete phases in order — later phases depend on earlier ones.

---

## Phase 1 — Global DV Profile: Add `dailyWeightG` ✅ COMPLETE

**What it does:** Adds a daily food weight field to every DV profile so the Diet tab can read it from the global profile state. No Diet tab UI yet — this is groundwork.

### Files to modify

**`lib/rdaProfiles.ts`**
- Add `dailyWeightG: number` to the `RDAProfile` type (or equivalent interface)
- Add default values to all 4 built-in profiles:
  - `male-avg`: 1700
  - `male-active`: 2000
  - `female-avg`: 1500
  - `female-active`: 1800

**`components/DVProfilePanel.tsx`**
- Add a numeric input field labelled "Daily food weight (g)" in the editor layout
- Sits below the nutrient RDA fields, above the save button
- Bounded: min 500, max 5000; shows inline validation message for out-of-range values
- Reads from and writes to the profile object the same way nutrient fields do

**`components/AppShell.tsx`**
- Ensure `dailyWeightG` is included when the global custom RDA state is read from / written to `np:global-custom-rda` in localStorage
- No change needed if the state is already passed through as a generic object — verify and document

### Done criteria
- [x] All 4 built-in profiles have `dailyWeightG` defined
- [x] The DVProfilePanel editor shows the new field and saves/loads it correctly
- [x] Switching profiles in the header updates `dailyWeightG` in the shared state
- [x] `tsc --noEmit` passes

---

## Phase 2 — Database Migration + Tab Shell ✅ COMPLETE

**What it does:** Creates the Supabase persistence table, adds the Diet tab to the nav, and renders an empty `DietView` shell with the correct three-column + two-row layout structure.

### Database (run in Supabase SQL editor)

```sql
CREATE TABLE user_diet_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  foods jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_diet_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner read" ON user_diet_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "owner write" ON user_diet_lists
  FOR ALL USING (auth.uid() = user_id);

CREATE UNIQUE INDEX user_diet_lists_user_id_idx ON user_diet_lists(user_id);
```

The `foods` JSONB column stores an array of `{ foodId: number, rating: number }` objects. One row per user (upsert on save).

### Files to create

**`lib/dietStorage.ts`**
- `loadDietList(userId?)` — reads from Supabase if `userId` provided, falls back to `np:diet:foods` in localStorage
- `saveDietList(foods, userId?)` — writes to localStorage immediately; if `userId` provided, also upserts to Supabase
- `DietFood` type: `{ foodId: number; rating: number }` (rating 1–5)

**`components/DietView.tsx`**
- `'use client'` component
- Accepts `rdaProfile` prop (same pattern as `MealPlanner`, `CalendarView`, etc.)
- Renders the full layout skeleton:
  - Top section: three equal-width columns (Panel 1 placeholder, Panel 2 placeholder, Panel 3 placeholder), each a fixed-height scrollable container
  - Below: full-width Category Overview placeholder row
  - Below: full-width Suggestions placeholder row
- All placeholders are labelled div blocks for now — no functionality

### Files to modify

**`components/MainView.tsx`**
- Add `"Diet"` as a fourth tab in the tab bar, after `"Calendar"`
- Render `<DietView rdaProfile={rdaProfile} />` when the Diet tab is active
- Persist tab selection to localStorage under `np:main-tab` (already done for existing tabs — extend the same key to include `"Diet"`)

### Done criteria
- [x] "Diet" tab appears in the nav and is clickable
- [x] DietView renders its empty layout skeleton without errors
- [x] Supabase table exists with correct schema and RLS
- [x] `tsc --noEmit` passes

#### SQL to run in Supabase SQL editor
```sql
CREATE TABLE user_diet_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  foods jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_diet_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner read" ON user_diet_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "owner write" ON user_diet_lists
  FOR ALL USING (auth.uid() = user_id);

CREATE UNIQUE INDEX user_diet_lists_user_id_idx ON user_diet_lists(user_id);
```

---

## Phase 3 — Panel 1: Category Browser ✅ COMPLETE

**What it does:** Builds the left-hand food browser panel — category accordion, search bar, click-to-add, and visual indicators for already-selected foods.

### Files to create

**`components/DietFoodBrowser.tsx`**
- `'use client'` component
- Props: `selectedFoodIds: Set<number>`, `onAdd: (foodId: number) => void`, `onRemove: (foodId: number) => void`, `foods: FoodRow[]`
- **Search bar** at top: controlled input; on change, filters food names (case-insensitive substring match) and sets `searchQuery` state
- **Category accordion:**
  - All categories collapsed by default (`expandedCategories` state = empty set)
  - When `searchQuery` is empty: user manually toggles categories open/closed by clicking header
  - When `searchQuery` is non-empty: auto-expand all categories that contain at least one matching food; hide categories with zero matches; show only matching foods within expanded categories
  - Clearing search restores all categories to collapsed
- **Food rows within a category:**
  - Food name as a clickable row
  - If `foodId` is in `selectedFoodIds`: show a checkmark/tint and clicking removes it (calls `onRemove`)
  - If not selected: clicking adds it (calls `onAdd`)
- Category headers show a count of selected foods within that category: e.g. "Vegetables (3 selected)"

### Files to modify

**`components/DietView.tsx`**
- Replace Panel 1 placeholder with `<DietFoodBrowser />`
- Manage `selectedFoods: DietFood[]` state at the DietView level (Panel 1, 2, and 3 all need it)
- Load initial state from `dietStorage.loadDietList()` on mount
- Pass `selectedFoodIds` as a derived `Set<number>` to DietFoodBrowser

### Done criteria
- [x] Categories render collapsed by default
- [x] Clicking a category header expands/collapses it
- [x] Typing in search expands only matching categories and shows only matching foods; clearing collapses all
- [x] Clicking an unselected food calls `onAdd`; clicking a selected food (checkmark visible) calls `onRemove`
- [x] Category headers show "(N selected)" count
- [x] `tsc --noEmit` passes

---

## Phase 4 — Panel 2: Selected Foods, Rating Control, Weight Indicator ✅ COMPLETE

**What it does:** Builds the centre panel — the food list with 1–5 rating controls, the weight indicator bar, and localStorage persistence.

### Files to create

**`components/DietRatingControl.tsx`**
- `'use client'` component
- Props: `value: number` (1–5), `onChange: (rating: number) => void`
- Renders 5 clickable pips/buttons labelled 1–5
- Active rating is visually filled; inactive pips are outlined
- On hover over any pip: shows a tooltip with the serving multiplier label:
  - 1 → "0.25× serving"
  - 2 → "0.5× serving"
  - 3 → "1× serving"
  - 4 → "1.5× serving"
  - 5 → "2× serving"
- Tooltip appears above the control, dismisses on mouse-out

**`components/DietSelectedFoods.tsx`**
- `'use client'` component
- Props: `foods: DietFood[]`, `foodMeta: Map<number, FoodRow>`, `dailyWeightG: number`, `onRatingChange: (foodId: number, rating: number) => void`, `onRemove: (foodId: number) => void`, `onClearAll: () => void`
- **Weight indicator** at the top of the panel:
  - Computes `totalMonthlyWeightG = Σ (portionGrams[foodId] × ratingMultiplier[rating])` for all foods
  - Target = `dailyWeightG × 30`
  - Shows: target label, implied weight, fill bar, percentage of target
  - Color: ≤90% → amber, 90–110% → green, 110–150% → amber, >150% → red
  - Label text: "Under — raise some ratings or add foods" / "On target" / "Over — consider lowering some ratings" / "Well over — ratings are too aggressive"
- **Food list** below the indicator:
  - One row per food: food name + `<DietRatingControl>` + remove button (×)
  - Rows in add-order (not alphabetical)
- **Footer:** "N foods" count + "Clear all" button

### Files to modify

**`components/DietView.tsx`**
- Replace Panel 2 placeholder with `<DietSelectedFoods />`
- `onAdd`: appends `{ foodId, rating: 3 }` to `selectedFoods` state; saves to localStorage via `dietStorage.saveDietList()`
- `onRemove`: filters food out of `selectedFoods`; saves
- `onRatingChange`: updates rating for that foodId; saves
- `onClearAll`: resets `selectedFoods` to `[]`; saves
- Pass `rdaProfile.dailyWeightG` down to DietSelectedFoods

### Rating multiplier map (define in `lib/dietProfile.ts` or inline)
```ts
export const RATING_MULTIPLIERS: Record<number, number> = {
  1: 0.25,
  2: 0.5,
  3: 1.0,
  4: 1.5,
  5: 2.0,
}
```

### Done criteria
- [x] Adding a food from Panel 1 appears in Panel 2 at rating 3
- [x] Rating control shows hover tooltips with correct multiplier labels
- [x] Changing a rating updates the weight indicator instantly
- [x] Weight indicator color changes correctly across the four bands
- [x] Remove button removes food from Panel 2 and deselects in Panel 1
- [x] Clear all empties the list
- [x] Food list and ratings survive a tab switch (localStorage persistence)
- [x] `tsc --noEmit` passes

---

## Phase 5 — Calculation Engine ✅ COMPLETE

**What it does:** Builds the pure calculation library that takes the selected food list and returns per-nutrient %DV values and source counts. No UI — this is the data layer that Panel 3, the category cards, and the suggestions panel all call.

### Files to create

**`lib/dietProfile.ts`**

```ts
export interface DietNutrientResult {
  nutrientId: number
  nutrientName: string
  unit: string
  pctDV: number          // raw weighted sum / RDA — may exceed 100
  sourcesCount: number   // foods contributing ≥5% DV at their rated portion
  rdaTarget: number      // from active RDA profile
  behavior: string       // 'normal' | 'limit' | 'normal-with-ul'
  upperLimit?: number
}

export function computeDietProfile(
  selectedFoods: DietFood[],           // { foodId, rating }[]
  allFoodNutrients: FoodNutrientMap,   // foodId → nutrientId → value_per_100g (null treated as 0)
  portionSizes: PortionSizeMap,        // foodId → grams
  rdaProfile: RDAProfile,             // includes rdaValues and dailyWeightG
  nutrients: NutrientMeta[],          // all 58 nutrients with behavior/UL
): DietNutrientResult[]
```

**Algorithm:**
1. For each nutrient in `nutrients`:
   a. For each food in `selectedFoods`:
      - Get `value = allFoodNutrients[foodId][nutrientId] ?? 0` (NULL = 0)
      - Get `portionG = portionSizes[foodId] ?? 100`
      - Get `multiplier = RATING_MULTIPLIERS[rating]`
      - `contrib = (value / 100) * portionG * multiplier`
      - If `(value / 100) * portionG * 1.0 / rdaTarget >= 0.05`: increment `sourcesCount` (source count uses rating-1 contribution — i.e., one standard serving — not the rated multiplier, so a food is a "source" based on its inherent nutritional density, not how much the user eats of it)

      Actually, re-read Decision 4: "how many foods in the list contribute ≥5% DV for that nutrient (at the food's default portion × its rating multiplier)". So it DOES use the rated multiplier for source count. Update: use `contrib / rdaTarget >= 0.05` to count as a source.

   b. `pctDV = Σ contribs / rdaTarget`
2. Return array of `DietNutrientResult` sorted by nutrient category order

**`types/diet.ts`** (create if needed, or extend `types/nutrition.ts`)
- `DietFood`: `{ foodId: number; rating: number }`
- Any additional types needed by the engine

### Done criteria
- [x] `computeDietProfile()` is exported and fully typed
- [x] NULL food-nutrient values are treated as 0 (no contribution, no source count)
- [x] Source count uses rated contribution (≥5% DV threshold)
- [x] Returns correct results for a hand-verified test case — chicken breast (174g, 31g protein/100g) at rating 3 → 53.94g contrib → 96.3% DV; at rating 1 → 24.1% DV (still a source); at rating 5 → 192.6% DV
- [x] `tsc --noEmit` passes

---

## Phase 6 — Panel 3: Nutrient Coverage Bars

**What it does:** Builds the right-hand results panel — the scrollable nutrient bar list with filter controls, source count badges, diet-optimized color thresholds, and the NutrientInfoCard click-through.

### Files to create

**`components/DietNutrientPanel.tsx`**
- `'use client'` component
- Props: `results: DietNutrientResult[]`, `onAddFood: (foodId: number) => void`
- **Filter bar** at top: three toggle buttons `[All] [Gaps] [Fulfilled]`
  - All: show all 58 nutrients
  - Gaps: show only nutrients where `pctDV < 70` (Decision 5 threshold)
  - Fulfilled: show only nutrients where `pctDV >= 70`
- **Sort dropdown:** "Gap-first" (ascending pctDV) | "Category-grouped" (by nutrient category order)
- **Nutrient rows:** for each result:
  - Nutrient name label
  - %DV bar using diet-optimized color scale:
    - `< 30%` → red
    - `30–70%` → amber
    - `≥ 70%` → green
    - `normal-with-ul` nutrients: apply existing UL logic from `rdaColorScale.ts`
  - Percentage label
  - Source count badge pill:
    - 0 sources → red pill "0 sources"
    - 1 source → amber pill "1 source"
    - 2+ sources → green pill "N sources"
  - Clicking a row opens the existing `NutrientInfoCard` flyout (reuse as-is; pass nutrientId)

### Files to modify

**`components/DietView.tsx`**
- Replace Panel 3 placeholder with `<DietNutrientPanel />`
- Call `computeDietProfile()` inside a `useMemo` keyed on `selectedFoods` and `rdaProfile`
- Pass results down to DietNutrientPanel
- Also pass results to category cards (Phase 7) and suggestions (Phases 8–9)

### Done criteria
- Panel 3 shows all 58 nutrients with correct bar fill and color
- Source count badge is correct color and count
- Filter buttons correctly show/hide nutrients
- Sort options work correctly
- Clicking a bar opens NutrientInfoCard
- Bars update live when a food is added/removed or rating changes in Panel 2
- UL color logic fires correctly for normal-with-ul nutrients above their limit
- `tsc --noEmit` passes

---

## Phase 7 — Category Overview Cards

**What it does:** Builds the full-width category cards row below the three panels, showing a nutrient category summary at a glance.

### Files to create

**`components/DietCategoryCards.tsx`**
- `'use client'` component
- Props: `results: DietNutrientResult[]`
- Renders 6 cards in a CSS grid (3 columns × 2 rows, or 6-column flex wrap), one per nutrient category:
  - Macronutrients, Vitamins, Minerals, Fatty Acids, Amino Acids, Food Metrics
- Each card:
  - Category name header
  - Category-average %DV bar: `mean(pctDV for all nutrients in this category)` — uses same diet color thresholds (30/70)
  - Average percentage label
  - Mini bar rows for each nutrient in the category: nutrient name (abbreviated) + small bar + % value
  - Mini bars use the same red/amber/green diet thresholds
- Cards are read-only — no interactivity

### Files to modify

**`components/DietView.tsx`**
- Replace Category Overview placeholder with `<DietCategoryCards results={dietResults} />`

### Done criteria
- All 6 category cards render with correct nutrients grouped inside
- Category-average bar and mini bars are correctly colored
- Cards update live with food list changes
- Empty state (no foods selected): bars show at 0% across all cards
- `tsc --noEmit` passes

---

## Phase 8 — Per-Nutrient Hover Tooltip (Top 3 Sources)

**What it does:** Adds the hover tooltip to each nutrient bar in Panel 3 showing the top 3 foods not in the user's list that are the best sources for that specific nutrient.

### Logic

For a given nutrient, rank all foods NOT in `selectedFoodIds` by their per-serving %DV contribution at rating 3 (one standard serving), descending. Take the top 3. Show name, %DV per serving, and a [+] add button.

This lookup can be computed on hover (not pre-computed) since it only runs for one nutrient at a time and the full food-nutrient dataset is already in memory.

### Files to modify

**`components/DietNutrientPanel.tsx`**
- Add hover handler to each nutrient row
- On hover: compute top-3 foods for that nutrient from the full food-nutrient data
- Render a tooltip (absolutely positioned, viewport-clamped like `NutrientInfoCard`) containing:
  - Header: "Top sources not in your diet"
  - Three rows: food name · %DV per standard serving · [+] button
  - [+] button calls `onAddFood(foodId)` which adds the food to Panel 2 at rating 3
- Tooltip dismisses on mouse-out
- Only one tooltip open at a time

**`components/DietView.tsx`**
- Pass full `allFoodNutrients` data and `selectedFoodIds` down to `DietNutrientPanel` so it can compute the top-3 ranking on hover

### Done criteria
- Hovering a nutrient bar shows the tooltip with 3 food suggestions
- Suggestions are foods not already in Panel 2
- %DV per serving values are correct
- [+] button adds the food to Panel 2 at rating 3 and dismisses the tooltip
- Tooltip does not appear when 0 foods are in the list (or shows an appropriate empty state)
- `tsc --noEmit` passes

---

## Phase 9 — Top 10 Global Suggestions Panel

**What it does:** Builds the full-width "Foods that would strengthen your diet" panel at the bottom of the page.

### Scoring logic

Adapt `complementScore.ts` for diet-level gap scoring:
- Current diet gaps = nutrients where `pctDV < 70` (the gap threshold)
- For each candidate food (not in the user's list), score it by how much it would raise the worst-scoring nutrients if added at rating 3
- Rank all 253 foods by this score, take top 10

This can be implemented in `lib/dietSuggestions.ts` as a new function:
```ts
export function computeDietSuggestions(
  selectedFoods: DietFood[],
  currentResults: DietNutrientResult[],
  allFoodNutrients: FoodNutrientMap,
  portionSizes: PortionSizeMap,
  foods: FoodRow[],
): SuggestedFood[]   // top 10, with which gap nutrients each addresses
```

A `SuggestedFood` includes: `foodId`, `foodName`, `category`, `topGapNutrients: string[]` (names of the gap nutrients this food most improves, top 3).

### Files to create

**`lib/dietSuggestions.ts`**
- `computeDietSuggestions()` as described above

**`components/DietSuggestionsPanel.tsx`**
- `'use client'` component
- Props: `suggestions: SuggestedFood[]`, `onAdd: (foodId: number) => void`
- Header: "Foods that would strengthen your diet"
- Horizontal scrollable row of up to 10 food cards
- Each card:
  - Food name
  - Food category label
  - Up-arrow tags for top gap nutrients it addresses (e.g., "↑ Selenium", "↑ Vitamin D")
  - [+ Add] button — adds food to Panel 2 at rating 3
- If `suggestions` is empty (all nutrients fulfilled): shows a congratulatory message

### Files to modify

**`components/DietView.tsx`**
- Replace Suggestions placeholder with `<DietSuggestionsPanel />`
- Compute suggestions via `useMemo` keyed on `selectedFoods` and `dietResults`

### Done criteria
- Panel shows up to 10 food cards not currently in the user's list
- Each card correctly identifies which gap nutrients it addresses
- [+ Add] button adds the food and the panel re-ranks immediately
- When all nutrients are fulfilled, shows a positive empty state
- Panel is empty / shows placeholder when no foods are selected yet
- `tsc --noEmit` passes

---

## Phase 10 — Supabase Sync, Empty States, and Polish

**What it does:** Wires up cross-device persistence for logged-in users, handles all edge-case UI states, and ensures the full tab is production-ready.

### Supabase sync

**`lib/dietStorage.ts`** (extend from Phase 2)
- On load: if user is logged in, fetch from `user_diet_lists` and use that data; write it back to localStorage as a cache
- On every save: write localStorage immediately (sync); then fire an async upsert to Supabase (non-blocking)
- On auth state change (login): pull Supabase data and merge with localStorage (Supabase wins on conflict)
- On logout: clear `np:diet:foods` from localStorage

**`components/DietView.tsx`**
- Subscribe to `useAuth()` context (already available via `AuthProvider`)
- On login/logout, re-run the load logic

### Empty and loading states

**Panel 1 (DietFoodBrowser):** No empty state — food list is always populated from the DB.

**Panel 2 (DietSelectedFoods):** When `selectedFoods` is empty:
- Show a centered prompt: "Add foods from the left panel to build your diet profile"
- Weight indicator is hidden when no foods are selected

**Panel 3 (DietNutrientPanel):** When `selectedFoods` is empty:
- Show all nutrients at 0% with a subtitle: "Add foods to see your coverage"
- Filter buttons still visible but all filters show the same empty state

**Category Cards:** When empty, all bars show at 0%.

**Suggestions Panel:** When `selectedFoods` is empty:
- Show a prompt: "Add foods to your diet to see personalized suggestions"

### Cross-tab persistence checklist
- `np:diet:foods` — food list and ratings survive tab switches ✓ (set in Phase 4)
- `np:main-tab` — Diet tab selection survives navigation ✓ (set in Phase 2)
- Filter/sort state in Panel 3 — persist `np:diet:filter` and `np:diet:sort` to localStorage
- Nutrient panel scroll position — not persisted (acceptable)

### Final TypeScript and consistency pass
- Run `tsc --noEmit` — fix all errors
- Verify the Diet tab's `rdaProfile` prop chain matches every other tab's pattern
- Verify `dailyWeightG` is correctly defaulted when a legacy saved profile (without the field) is loaded — fallback to 1700 if missing
- Spot-check that switching the global DV profile updates both the RDA bars in Panel 3 and the weight indicator in Panel 2

### Done criteria
- Logged-in users' diet lists persist across devices
- All empty and loading states render without errors
- Filter and sort selections survive tab switches
- Legacy profiles without `dailyWeightG` fall back to 1700 gracefully
- `tsc --noEmit` passes clean
- Full tab is visually consistent with the rest of the app (slate-900 dark mode, Tailwind spacing, font sizes)
