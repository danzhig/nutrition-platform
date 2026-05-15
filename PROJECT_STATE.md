# Nutrition Platform — Project State

**Last updated:** 2026-05-15 (session 21)
**Current phase: Diet Evaluator — ALL 10 PHASES COMPLETE**

---

## What Is This Project

A public-facing nutrition web app built on **Next.js 16 + Supabase + Vercel**, source-controlled on **GitHub**. The database layer is fully complete (253 foods × 59 nutrient definitions; 58 nutrients have food data). The app has four main features: an interactive heatmap table, a meal/day planner, a calendar food log tracker, and a Diet Evaluator tab.

**Deployment:** every push to `main` → Vercel auto-deploy → calls Supabase REST API. PRs get preview URLs.  
**Env vars:** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` and Vercel dashboard.  
**Direct DB access:** Supabase REST API credentials stored in Claude memory (`memory/reference_supabase.md`).

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 16 App Router | `use client` components for interactivity |
| Styling | Tailwind CSS v4 | slate-900 dark mode throughout |
| Charting | Recharts + custom SVG | Recharts for bar charts; custom SVG for radar (gradient edges) |
| Data layer | Supabase (PostgreSQL) | REST API + `@supabase/supabase-js` v2 |
| Auth | Supabase Auth | Email/password; session in localStorage; `onAuthStateChange` reactive |
| Hosting | Vercel | Deploy on push to `main` |
| Language | TypeScript | Strict; `tsc --noEmit` must pass before every push |

---

## Repository Structure

```
nutrition-platform/
├── app/
│   ├── layout.tsx              ← Root layout; wraps children in <AuthProvider>
│   ├── page.tsx                ← Home: fetches heatmap data server-side, renders <AppShell>; revalidate = 300
│   └── globals.css
├── components/
│   ├── AppShell.tsx            ← Client shell: global DV profile state, header (title + DV button + auth), section with MainView
│   ├── MainView.tsx            ← Top-level tab switcher: Day Planner | Data View | Calendar; passes rdaProfile down
│   ├── DataView.tsx            ← Data View: second-level tabs (Heatmap | Charts | Food Comparison | Meal Comparison); passes rdaProfile down
│   ├── HeatmapTable.tsx        ← Orchestrator: filter state, sort, per-serving; receives rdaProfile from global
│   ├── HeatmapCell.tsx         ← Single cell: color + tooltip; DV mode aware
│   ├── FilterPanel.tsx         ← Slide-out panel: food/nutrient filters, saved views (DV profile removed — now global)
│   ├── NutrientSidebar.tsx     ← Vertical avg-profile column right of table
│   ├── AuthProvider.tsx        ← React context: user, loading, signIn, signUp, signOut
│   ├── AuthModal.tsx           ← Login/signup modal
│   ├── AuthButton.tsx          ← Header button
│   ├── MealPlanner.tsx         ← Orchestrator: plan state, tab bar, save/load, collapse state
│   ├── MealCard.tsx            ← One meal: named, collapsible, food items, save-as-template
│   ├── FoodPickerModal.tsx     ← Food list modal: search + category filter; complement score badges sorted by score
│   ├── DVProfilePanel.tsx      ← DV profile editor; 3-column grid in editorOnly mode
│   ├── MealNutritionSidebar.tsx ← 50-nutrient %DV bar chart; click → NutrientInfoCard
│   ├── NutrientInfoCard.tsx    ← Floating info card: viewport-clamped; body role, deficiency/excess; food-source bar; optional dietContribs stacked bar showing per-food %DV contributions (Diet tab)
│   ├── MealNutritionChart.tsx  ← Full-width chart dashboard: bar chart + radar + donut
│   ├── DemoCursor.tsx          ← Animated OS-style arrow cursor: flies to targets (450ms CSS), scale-dips on click; used by TourOverlay
│   ├── MealCategoryRadar.tsx   ← Custom SVG pentagonal radar: avg %DV per category, gradient edges
│   ├── MacroDonutChart.tsx     ← Dual-ring PieChart: inner = 4 macro slices (Net Carbs/Fibre/Protein/Fat); outer = top-5 foods per macro
│   ├── NutrientRankingView.tsx ← Pick nutrient → ranked bar chart of all foods; N selector, top/bottom, multi-select category checklist, per-serving toggle
│   ├── NutrientScatterPlot.tsx ← X/Y scatter; optional bubble size; multi-select category checklist; clickable legend toggles individual categories; dimmed dots render as dark slate
│   ├── FoodComparisonView.tsx  ← Food A vs B; 3 panels (A, B, A−B net diff); centered diff bars
│   ├── MealComparisonView.tsx  ← Meal A vs B; food-drill-down pill buttons per panel; diff panel always compares full meals
│   ├── CalendarView.tsx        ← Calendar tab orchestrator: Month/Week toggle, entry fetch, day panel, add modal
│   ├── CalendarMonthGrid.tsx   ← Month grid: 7×5–6 grid, prev/today/next nav, entry pills, +N overflow
│   ├── CalendarWeekList.tsx    ← Week rolodex: infinite-scroll Mon–Sun strips, entry cards, scroll persistence
│   ├── CalendarDayPanel.tsx    ← Day detail panel: entry cards (grouped by type), inline grams edit, remove, Day Total nutrition
│   ├── CalendarAddModal.tsx    ← Add entry modal: type chooser → meal / plan / food; writes food_log rows
│   ├── SizeButtons.tsx         ← Inline S/M/L size buttons for variable-size foods; highlights active size
│   ├── DietView.tsx            ← Diet tab orchestrator: three-column layout, selectedFoods state, foodNutrients map, dietResults memo
│   ├── DietFoodBrowser.tsx     ← Panel 1: category accordion + search; click-to-add/remove with checkmark indicator
│   ├── DietCompositionBar.tsx  ← Stacked bar showing each selected food's proportional caloric share of dailyWeightG; 10-color palette; cursor-following tooltip per segment
│   ├── DietSelectedFoods.tsx   ← Panel 2: DietCompositionBar at top, scrollable food list with rating + remove, footer
│   ├── DietRatingControl.tsx   ← 5-pip 1–5 rating selector (frequency: Rarely → Staple); hover tooltip shows frequency label above control
│   ├── DietNutrientPanel.tsx   ← Panel 3: scrollable nutrient bars; All/Gaps/Fulfilled filter; Gap-first/Category sort; source count badges; NutrientInfoCard click-through with dietContribs distribution bar; hover tooltip top-3 sources; diet color scale (30/70 thresholds)
│   ├── DietCategoryCards.tsx   ← Category Overview: 3×2 grid of cards; category-avg bar + mini bars per nutrient; diet color scale; "—" for nutrients without RDA targets; live updates
│   └── DietSuggestionsPanel.tsx ← Suggestions: horizontal scroll row of up to 10 food cards; "↑ Nutrient" gap tags; [+ Add] button; four states (no-profile / no-selection / all-fulfilled / card list)
├── lib/
│   ├── supabase.ts             ← Supabase client (NEXT_PUBLIC_ env vars)
│   ├── fetchHeatmapData.ts     ← Server-side query + P10/P90 normalization; parallel pagination via Promise.all
│   ├── colorScale.ts           ← Relative heatmap color (P10/P90 → hsl)
│   ├── filterConstants.ts      ← FOOD_CATEGORY_LIST, NUTRIENT_GROUP_LIST
│   ├── portionSizes.ts         ← Per-food serving sizes (all 253 foods, keyed by food_id) + S/M/L size variants ← CRITICAL
│   ├── rdaProfiles.ts          ← 4 built-in RDA profiles; NUTRIENT_BEHAVIORS; NUTRIENT_UPPER_LIMITS
│   ├── rdaColorScale.ts        ← %DV color scale: normal / limit / normal-with-ul
│   ├── profileStorage.ts       ← CRUD for user_rda_profiles
│   ├── filterSetStorage.ts     ← CRUD for user_filter_sets
│   ├── mealStorage.ts          ← CRUD for meal_plans
│   ├── savedMealStorage.ts     ← CRUD for saved_meals
│   ├── presetMealStorage.ts    ← loadPresetMeals() — public read from preset_meals table
│   ├── complementScore.ts      ← computeComplementScore(): 0-100 score vs current plan gaps
│   ├── categoryColors.ts       ← CATEGORY_COLORS palette shared by ranking + scatter views
│   ├── foodLogStorage.ts       ← CRUD for food_log (getEntriesForDateRange, addEntry, updateEntryItemGrams, deleteEntry, nullSourceId)
│   ├── dietStorage.ts          ← DietFood type; loadDietList(userId?) / saveDietList(foods, userId?) / clearLocalDietList(); localStorage + Supabase upsert
│   ├── dietProfile.ts          ← RATING_MULTIPLIERS/LABELS; FoodNutrientMap; DietNutrientResult; computeDietProfile() engine
│   └── dietSuggestions.ts      ← computeDietSuggestions(): scores non-selected foods by gap-fill ratio; SuggestedFood type; returns top 10
├── types/
│   ├── nutrition.ts            ← HeatmapRow, FoodRow, NutrientMeta, HeatmapData, etc.
│   ├── meals.ts                ← MealItem, Meal, ActiveMealPlan
│   └── calendar.ts             ← FoodLogEntryType, FoodLogItem, FoodLogEntry, NewFoodLogEntry
├── sql/                        ← schema.sql — schema reference (reflects live DB structure)
├── reference/                  ← CSV reference files
└── memory/                     ← Claude memory files (not committed to git)
```

---

## Current Feature State

| Component | Status |
|---|---|
| **Calendar — food_log DB** | ✅ Live — Supabase table + RLS deployed; entries have JSONB items array; source_id soft-refs meals/plans and is nulled on plan/meal delete |
| **Calendar — Month Grid** | ✅ Live — CalendarView (month/week toggle, two-column layout, entry fetch, localStorage persistence); CalendarMonthGrid (7×5–6 grid, nav, violet/teal/amber entry pills, +N overflow, today/selected-day highlight) |
| **Calendar — Add Entry Modal** | ✅ Live — type chooser → Add Meal (preset pane, no complement scores) / Add Plan (saved plan list) / Add Food (search + grams confirmation); all three paths write food_log rows |
| **Calendar — Day Detail Panel** | ✅ Live — sticky panel; ‹/› day nav (cross-month aware); entry cards grouped by type; inline grams edit; remove; Day Total with sidebar/chart toggle |
| **Calendar — Week Mode** | ✅ Live — infinite-scroll Mon–Sun strips; IntersectionObserver ±4-week load sentinels; scroll-to-anchor on mount; week mode fetches ±120 days, month mode fetches current month |
| **Creatine nutrient** | ✅ Live — nutrient id 52, Amino Acid category, unit mg; animal foods 30–750 mg/100g (Herring highest; plant foods/dairy/eggs = 0); no official DRI so RDA = null in all profiles; behavior = 'normal' |
| **Net Carbohydrates** | ✅ Live — `Carbohydrates` hidden from display (kept in DB); `Net Carbohydrates` (= Carbs − Fibre) added as nutrient; all 4 RDA profiles updated |
| **Macro split donut** | ✅ Live — inner ring: 4 slices: Net Carbs (amber) + Dietary Fibre (lime) + Protein (violet) + Fat (emerald) at 4 kcal/g (USDA); GI weighting in sidebar uses Net Carbs |
| **Day Planner draft persistence** | ✅ Live — in-progress plan written to `np:draft-plan` / `np:draft-custom-rda` on every change; survives tab switches; cleared on logout or "New Plan" |
| **Preset meal templates** | ✅ Live — 113 curated system meals across 12 categories (Juices, Low Sug Juices, Salads, Pastas, Bowls, High Protein, Breakfast, Low Carb, Keto, Soups & Stews, Stir-Fries, Curries) in Supabase |
| **Global DV Profile** | ✅ Live — selector in header banner; single global state owned by `AppShell.tsx`; shared across all tabs; persisted to `np:global-rda-selection` + `np:global-custom-rda`; loading a saved plan syncs the global profile; `FilterPanel` no longer has a DV profile section |
| **Custom DV editor multi-column** | ✅ Live — custom DV profile editor renders nutrient groups as cards in a 3-column grid (editorOnly/inline mode); sidebar mode retains single-column layout |
| **Complement score — preset & saved meals** | ✅ Live — 0-100 badge per meal card (green ≥65, amber ≥35, grey <35); measures how well the meal fills remaining DV gaps; hard penalty for normal-with-ul nutrients >125% DV; implemented in `lib/complementScore.ts` |
| **Complement score — food picker** | ✅ Live — live score badge per food at default serving size; sorted by score descending when DV profile is active; updates on every plan change; selected foods disappear from the list immediately (tracked in `addedIds` for the modal session) since each food is only needed once per meal |
| **Low Sug Juices preset category** | ✅ Live — 6 low-sugar cold-press juice presets: Cucumber Mint Refresher, Celery Lemon Detox, Green Alkaline Juice, Beet Ginger Shots, Tomato Herb Juice, Carrot Turmeric Zinger |
| **Meal Comparison food drill-down** | ✅ Live — food pill buttons per meal panel (one per food + "All"); clicking shows that food's standalone %DV contribution; diff panel always compares full meals (`MealComparisonView.tsx`) |
| **Cooked versions of dry foods** | ✅ Live — 25 cooked food entries (IDs 219–243) for all legumes and grains that existed only in dry form; dry food names updated with "(dry)" suffix; nutrients scaled per USDA dry-to-cooked caloric ratio; water/GI overridden to cooked values; portion sizes in `portionSizes.ts` (½ cup legumes, 1 cup grains) |
| **Nutrient sort in preset & food picker panes** | ✅ Live — sort dropdown sorts meals/foods by total content of a chosen nutrient (descending); nutrient amount badge shown; sort-by-score disabled while nutrient sort is active |
| **My Templates merged into Presets pane** | ✅ Live — saved templates appear as a violet pill in the category row (only when user has templates); same nutrient sort, score badges, delete buttons; loading a template closes the Presets pane |
| **S/M/L size selector** | ✅ Live — inline S/M/L buttons on variable-size foods (fruits, vegetables, chicken, eggs); present in FoodPickerModal, CalendarAddModal, MealCard, CalendarDayPanel; implemented in `SizeButtons.tsx` + `portionSizes.ts` size variants |
| **Dried fruits & vegetables** | ✅ Live — 10 dried food entries (IDs 244–253): Raisins, Prunes, Dried Apricots, Dried Figs, Dried Cranberries, Dried Mango, Dried Blueberries, Dried Cherries (all Fruits cat.), Sun-Dried Tomatoes, Dried Shiitake Mushrooms (Vegetables cat.); data from USDA SR Legacy via FDC IDs; spot-checked against nutritionvalue.org (raisins Vitamin C corrected to 2.3 mg; sun-dried tomatoes sodium corrected to 107 mg, Vitamin K confirmed 43 mcg); 40g serving for dried fruits, 27g for sun-dried tomatoes, 15g for dried shiitake |
| **7 new nutrients (IDs 53–59)** | ✅ Live — Biotin (B7, mcg, Vitamin), EPA (mg, Fatty Acid), DHA (mg, Fatty Acid), Lutein & Zeaxanthin (mcg, Vitamin — nutrient definition only, food data deferred), Lycopene (mg, Vitamin), Betaine (mg, Amino Acid), CoQ10 (mg, Food Metric); full `body_role` / `deficiency_symptoms` / `excess_symptoms` tooltip text in DB; USDA FDC values for all 253 foods (6 of 7 nutrients); RDA targets in all 4 DV profiles; `NUTRIENT_BEHAVIORS` updated in `rdaProfiles.ts` |
| **Diet Evaluator — Phase 1** | ✅ Complete — `dailyWeightG: number` added to `RDAProfile` interface and all 4 built-in profiles (male-avg: 1700, female-avg: 1500, male-lowcarb: 2000, female-lowcarb: 1800); `getProfile()` extracts `dailyWeightG` from custom values (defaults to 1700); DVProfilePanel custom editor shows "Daily Food Weight (g)" input with 500–5000 validation in both inline and overlay modes; `seedFrom()` copies `dailyWeightG` from built-in profiles; AppShell saved-profile case includes `dailyWeightG` |
| **Diet Evaluator — Phase 2** | ✅ Live — "Diet" tab added to MainView after Calendar (`type Tab` extended, localStorage key `np:mainTab` updated); `DietView.tsx` shell renders three-column top section + Category Overview + Suggestions placeholder rows; `lib/dietStorage.ts` created with `loadDietList(userId?)` / `saveDietList(foods, userId?)` / `clearLocalDietList()` using localStorage + async Supabase upsert; `user_diet_lists` Supabase table deployed with RLS (owner read/write, unique index on user_id) |
| **Diet Evaluator — Phase 3** | ✅ Live — `DietFoodBrowser.tsx` built: 16-category accordion (FOOD_CATEGORY_LIST order), all collapsed by default; search bar filters food names across all categories and auto-expands matching ones (clearing restores collapsed state); food rows show violet checkmark/tint when selected; category headers show "(N selected)" count; click-to-add / click-to-remove wired to DietView state; `DietView` now accepts `data: HeatmapData` prop (MainView updated) to feed food list to browser and future phases |
| **Diet Evaluator — Phase 4** | ✅ Live — `lib/dietProfile.ts` created with `RATING_MULTIPLIERS` and `RATING_LABELS` (frequency language: Rarely/Occasionally/Sometimes/Often/Staple); `DietRatingControl.tsx`: 5-pip selector (1–5), active pip violet-filled, inactive outlined, hover tooltip shows frequency label above control; `DietSelectedFoods.tsx`: scrollable food list (food name + rating control + × remove), empty-state prompt, footer with food count + "Clear all"; `DietView` updated with `foodMeta` Map and `dailyWeightG` fallback (1700 if no profile) |
| **Diet Evaluator — Phase 5** | ✅ Live — `computeDietProfile()` added to `lib/dietProfile.ts`; `FoodNutrientMap` type (foodId → nutrientId → value_per_100g); `DietNutrientResult` interface (adds `nutrientCategory` for Phase 7 grouping); engine iterates all nutrients, resolves RDA from profile then `FOOD_METRIC_TARGETS` fallback, skips null-target nutrients, uses `getPortionSize()` + `RATING_MULTIPLIERS`, applies ≥5% DV rated-contribution threshold for `sourcesCount`; results sorted by `NUTRIENT_GROUP_LIST` category order; `DietView` wires `foodNutrients` FoodNutrientMap and `dietResults` useMemo (keyed on selectedFoods + rdaProfile); hand-verified: chicken breast 174g × rating 3 → 96.3% protein DV |
| **Diet Evaluator — Phase 6** | ✅ Live — `DietNutrientPanel.tsx` created; scrollable nutrient bar list with diet-optimized color scale (`< 30%` red · `30–70%` amber · `≥ 70%` green; `normal-with-ul` nutrients use `rdaCellColor` UL logic; `limit` nutrients use `rdaCellColor` limit color); filter toggles `[All][Gaps][Fulfilled]` (gap threshold = 70% DV); sort dropdown `Gap-first` (ascending pctDV) or `Category` (canonical order); source count badge per row (0 → red, 1 → amber, 2+ → green); clicking a row with `body_role` opens existing `NutrientInfoCard` flyout (meals=[]); filter + sort state persisted to `np:diet:filter` + `np:diet:sort` in localStorage; empty states for no-profile and no-selection; `DietView` wired: Panel 3 placeholder replaced, `allNutrients`/`foodsById`/`hasSelection`/`hasProfile` props passed down |
| **Diet Evaluator — Phase 7** | ✅ Live — `DietCategoryCards.tsx` created; 3×2 grid of cards (Macronutrients, Vitamins, Minerals, Fatty Acids, Amino Acids, Food Metrics); each card shows category label, category-average %DV bar (averaged only over nutrients with RDA targets), divider, then mini bar rows for every nutrient in the category; nutrients without RDA targets (e.g. Creatine) show "—" rather than a 0% bar; same dietBarColor logic as Phase 6 (limit/UL behaviors delegate to rdaCellColor); cards update live as food list changes; at 0% when no foods are selected; `DietView` Category Overview placeholder replaced |
| **Diet Evaluator — Phase 8** | ✅ Live — `DietNutrientPanel.tsx` extended with hover tooltip; `computeTopSources()` ranks all non-selected foods by per-serving %DV for the hovered nutrient, returns top 3; `SourceTooltip` internal component: fixed-positioned, viewport-clamped (prefers left of row), 150ms debounced hide so mouse can travel to tooltip, `onMouseEnter`/`onMouseLeave` keep it open; [+] button adds food at rating 3 via `onAddFood` and dismisses; clicking a row still opens `NutrientInfoCard` (click dismisses hover tooltip first); shows "No food data available" when all foods have null/zero for that nutrient; three new props on `DietNutrientPanel`: `allFoodNutrients`, `selectedFoodIds`, `onAddFood`; `DietView` passes `foodNutrients`, `selectedFoodIds`, `handleAdd` |
| **Diet Evaluator — Phase 9** | ✅ Live — `lib/dietSuggestions.ts` created with `computeDietSuggestions()`; scores each non-selected food by `Σ min(food_contrib_ratio, remaining_gap_ratio) / totalGapCapacity` across all gap nutrients (pctDV < 70%); uses normalized weight math (`scaleFactor + candContrib`); accepts `dailyWeightG` param; `topGapNutrients` = top 3 gap nutrients the food fills the most; returns top 10 ranked by score; `DietSuggestionsPanel.tsx` created: horizontal scroll row of up to 10 food cards (food name + category + "↑ Nutrient" tags + [+ Add] button); four states: no-profile, no-selection, all-fulfilled congratulations, and card list; `DietView` wires `dietSuggestions` useMemo (keyed on selectedFoods + dietResults) and replaces Suggestions placeholder |
| **Diet Evaluator — Phase 10** | ✅ Live — **Logout handling:** `DietView` tracks `prevUserIdRef`; on user ID transition to undefined, calls `clearLocalDietList()` and resets selectedFoods (Supabase data is safe; localStorage cleared for clean guest slate); **Zero-state bars:** `dietResults` useMemo now computes with empty `selectedFoods` when `rdaProfile` is set (returns full list at 0%); `DietNutrientPanel` removes early-return message, instead renders all 0% bars with "Add foods to see your actual coverage" italic banner; hover tooltip gated on `hasSelection` (no point showing top-sources when diet is empty); **Consistency verified:** `dailyWeightG ?? 1700` fallback confirmed in DietView + `getProfile()` in rdaProfiles; all localStorage keys consistent (`np:diet:foods`, `np:diet:filter`, `np:diet:sort`); `rdaProfile` prop chain DietView ← MainView ← AppShell matches all other tabs; `tsc --noEmit` clean; production build clean |
| **Diet Evaluator — normalized weight redesign** | ✅ Live — replaced broken monthly-weight bar model with two-pass normalization: ratings × serving sizes determine each food's proportional claim on `dailyWeightG`, so %DV bars always reflect a coherent full day; `computeDietProfile()` returns `{results, compositions}` (compositions reused by stacked bar); `computeDietSuggestions()` updated to use normalized math; `DietCompositionBar.tsx` new component replacing old 4-band weight indicator — 10-color stacked bar with cursor-following tooltip per segment; `RATING_LABELS` updated to frequency language (Rarely / Occasionally / Sometimes / Often / Staple); `DietView` info icon on Panel 2 header explains the frequency-rating model |
| **Diet Evaluator — per-food %DV distribution bar** | ✅ Live — clicking any nutrient row in Nutrient Coverage panel opens `NutrientInfoCard` with a stacked proportional bar at the top showing which selected foods contribute to that nutrient's %DV; "X% DV total" badge; any nutrient is clickable when foods are selected (not just those with `body_role`); `DietNutrientPanel` computes `computeFoodContribs()` at click time using normalized weights; `NutrientInfoCard` accepts optional `dietContribs` prop; `DietView` passes `selectedFoods` + `dailyWeightG` to `DietNutrientPanel` |
| **Multi-select category checklist — Charts tab** | ✅ Live — replaces single-select category dropdowns in both Charts tab views with a checklist dropdown (Select all / Deselect all + per-category checkboxes); dimmed scatter dots now render as uniform dark slate instead of transparent category colors, so highlighted series stand out cleanly; legend items remain clickable to toggle individual categories; `NutrientRankingView.tsx` + `NutrientScatterPlot.tsx` updated |
| **Guided demo tour system** | ✅ Live — `▶ Demo` button in global header; `lib/tourSteps.ts` defines `TourStep[]` with `target` (CSS selector), `title`, `body`, `position`, and optional `action` (array of `TourActionStep`); `components/TourOverlay.tsx` renders a spotlight ring (box-shadow backdrop + violet border) over each target element with a floating tooltip card; when a step has an `action` array, clicking Next runs the action sequence (click/type/wait/key) and disables the button showing "Running…" during execution; `components/DemoCursor.tsx` renders an OS-style arrow cursor that flies smoothly between targets (450ms cubic-bezier transition) and scale-dips on click (70ms/160ms spring); `pointer-events: none` on backdrop so live UI remains interactive; spotlight polls every 150ms while actions run so it tracks DOM changes (e.g. dropdown expanding); 280ms CSS ease between targets; tooltip viewport-clamped; tab state lifted from `MainView` to `AppShell`; `np:tour:reset-view` resets MealPlanner to sidebar view on tour start; demo cleanup (`np:tour:demo-cleanup`) auto-deletes the template and plan created during the demo; currently has one tour: `SALMON_MEAL_TOUR` (21 steps covering new-plan reset, plan naming, meal creation, food picker with all 4 foods added in one step, nutrient info card demo, presets, plan save, charts) — fully automated, no user interaction required |

**Total foods: 257** (218 original + 25 cooked legumes/grains + 10 dried fruits/vegetables + 4 salt types)  
**Total nutrients: 59** (52 original + Biotin, EPA, DHA, Lutein & Zeaxanthin, Lycopene, Betaine, CoQ10; Lutein & Zeaxanthin has no food data yet)  
**Total food_nutrients rows: ~14,731** (~12,977 pre-existing + 1,518 new nutrient rows + 236 salt rows)  
**Total preset meals: 113** (107 original + 6 Low Sug Juices)

---

## Guided Tour System — Architecture & How to Build New Tours

The tour system is intentionally lightweight — no external dependencies, no context providers, just a DOM-event bus and CSS spotlight.

### Core files

| File | Role |
|---|---|
| `lib/tourSteps.ts` | Step definitions — edit this to change tour content or add new tours |
| `components/TourOverlay.tsx` | Renders spotlight + tooltip; executes `action` sequences; manages step index + cursor state |
| `components/DemoCursor.tsx` | Animated OS-style arrow cursor; positioned by TourOverlay; 450ms fly transition; click scale-dip animation |
| `components/AppShell.tsx` | Owns `tourActive` state; Demo button; `onEnd` dispatches `np:tour:demo-cleanup` |

### TourStep interface

```typescript
interface TourStep {
  target: string | null        // CSS selector using data-tour attr, or null for center modal
  title: string                // bold heading in tooltip card
  body: string                 // descriptive text (not imperative — the cursor shows what's happening)
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'  // tooltip side relative to spotlight
  action?: TourActionStep[]    // if set, Next executes these before advancing; button shows "Running…"
}

type TourActionStep =
  | { type: 'click'; selector: string }
  | { type: 'type'; selector: string; text: string; charDelay?: number }
  | { type: 'wait'; duration: number }
  | { type: 'key'; selector: string; key: string }
```

**Action runner details:**
- `click` — flies cursor to element center (with retry up to 10×), pauses 500ms, scale-dips, fires `.click()`
- `type` — flies cursor to input, focuses it, clears value via `setNativeValue`, then types char-by-char (default 75ms/char) using React-compatible native value setter + `input` event
- `wait` — plain `sleep(ms)`
- `key` — dispatches a `keydown` `KeyboardEvent` on the element (used for Enter to confirm inputs)

**`position` tips:**
- Use `'bottom'` for most elements (tooltip appears below)
- Use `'top'` for elements near the bottom of the viewport
- Use `'right'` for left-half elements (wide sidebars, left charts)
- Use `'left'` for right-half elements
- Use `'center'` or `null` target for full-screen modals or the final "done" step

### How spotlight works

`TourOverlay` calls `document.querySelector(step.target)`, invokes `scrollIntoView`, then reads `getBoundingClientRect()` in a `requestAnimationFrame`. It positions a fixed div with `box-shadow: 0 0 0 9999px rgba(0,0,0,0.65)` — this single div creates the dark backdrop everywhere **except** inside itself (the spotlight hole). The whole overlay has `pointer-events: none` so the user can click elements freely. Only the tooltip card has `pointer-events: auto`.

### data-tour attributes in use

The action runner targets elements by CSS selectors — primarily `[data-tour="..."]`, `#id`, or `[data-food-name*="..."]`/`[data-size-key="..."]`.

| Attribute | Element | Component |
|---|---|---|
| `data-tour="day-planner-tab"` | Day Builder tab button | `MainView` |
| `id="tour-new-plan-btn"` | New Plan button | `MealPlanner` |
| `data-tour="plan-dropdown-container"` | Wrapper div around plan name button + open dropdown | `MealPlanner` |
| `data-tour="plan-name-btn"` | Plan name toggle button | `MealPlanner` |
| `data-tour="plan-name-input"` | Plan name text input | `MealPlanner` |
| `data-tour="add-meal-btn"` | + Add Meal button | `MealPlanner` |
| `data-tour="meal-name-btn"` | Meal name toggle button | `MealCard` |
| `data-tour="meal-name-input"` | Meal name text input | `MealCard` |
| `data-tour="meal-add-food-btn"` | + Add food button | `MealCard` |
| `data-tour="meal-items-list"` | Food items list in meal card | `MealCard` |
| `data-tour="mode-g"` | Grams mode toggle button per food row | `MealCard` |
| `data-tour="grams-input"` | Grams input per food row | `MealCard` |
| `data-tour="save-template-btn"` | Save as Template button | `MealCard` |
| `data-tour="food-picker-modal"` | FoodPickerModal root | `FoodPickerModal` |
| `data-tour="food-picker-search"` | Search input | `FoodPickerModal` |
| `data-tour="food-picker-done-btn"` | Done button | `FoodPickerModal` |
| `data-food-name="<lowercase food name>"` | Individual food row | `FoodPickerModal`, `MealCard` |
| `data-size-key="s/m/l"` | S/M/L size buttons | `SizeButtons` |
| `data-tour="presets-btn"` | Presets panel toggle button | `MealPlanner` |
| `data-tour="preset-categories"` | Category pill row | `MealPlanner` |
| `data-preset-cat="<category name>"` | Individual category pill | `MealPlanner` |
| `data-tour="presets-list"` | Preset meals list | `MealPlanner` |
| `data-tour="preset-meal-item"` | First preset meal card | `MealPlanner` |
| `data-tour="save-plan-btn"` | Save Plan button | `MealPlanner` |
| `data-tour="charts-view-tab"` | Charts view tab | `MealPlanner` |
| `data-tour="nutrition-sidebar"` | Nutrition %DV sidebar | `MealNutritionSidebar` |
| `data-tour="nutrient-sidebar-protein"` | Protein nutrient row in sidebar | `MealNutritionSidebar` |
| `data-tour="nutrient-info-card"` | NutrientInfoCard floating panel | `NutrientInfoCard` |
| `data-tour="nutrition-bar-chart"` | Bar chart | `MealNutritionChart` |
| `data-tour="nutrition-radar-chart"` | Radar chart | `MealNutritionChart` |
| `data-tour="nutrition-donut-chart"` | Donut chart | `MealNutritionChart` |

### Custom events (non-action infrastructure)

The `advanceOn` system has been removed. Only two infrastructure events remain:

| Event | Where dispatched | Purpose |
|---|---|---|
| `np:tour:reset-view` | `AppShell.startDemo()` | Resets MealPlanner to sidebar view before tour starts |
| `np:tour:demo-cleanup` | `AppShell` TourOverlay `onEnd` | Triggers MealPlanner to delete demo template + plan and reset to blank state |

### Cleanup mechanism

When the tour ends (user clicks Finish on the last step), `AppShell` dispatches `np:tour:demo-cleanup`. `MealPlanner` has a `useEffect` listening for this that:
1. Deletes `savedMeals[0]` (the template created during the demo — always newest-first)
2. Deletes the current `plan.id` if it was saved during the demo
3. Resets to a blank `newPlan()` and clears all draft localStorage keys: `np:draft-plan`, `np:draft-custom-rda`, `np:draft-snapshot`, `nutrition-active-plan-id`; resets `nutrition-view-mode` to `'sidebar'`

**Important:** The cleanup useEffect has `[savedMeals, plan]` in its dependency array (no `updateSnapshot` since that `useCallback` is declared later in the file — inline the snapshot reset instead).

### Adding a new tour

1. Add a new exported `const MY_TOUR: TourStep[]` to `lib/tourSteps.ts`
2. Add `data-tour="my-step-id"` (or `data-food-name`, `data-size-key`, etc.) attributes to target elements in the relevant components
3. Write `action` arrays for each step using `click`, `type`, `wait`, and `key` action steps — no custom events needed
4. In `AppShell.tsx`: add a second demo button / selector, import the new tour array, and pass it to `<TourOverlay steps={MY_TOUR} />`
5. If the new tour creates data (templates, plans, entries), extend the `np:tour:demo-cleanup` handler in `MealPlanner.tsx` to clean it up

### Known nuances & gotchas

- **Modal steps**: Steps targeting elements inside `FoodPickerModal` (z-50) work because the spotlight ring at z-9997 is transparent — you see the modal content through it. The dark box-shadow backdrop appears behind the modal's own backdrop layer (z-50 < z-9997), so the whole-modal spotlight correctly covers only the modal.
- **Stale closure in cleanup**: The cleanup `useEffect` uses `savedMeals` and `plan` from state. Since these are in the dep array, the handler always captures current values. Do not add `updateSnapshot` to deps — it's a `useCallback` declared later in the file (TDZ issue).
- **Spotlight repositioning**: `updateSpot` re-fires on every `scroll` and `resize` event (captured via `addEventListener(..., true)` for the scroll). This keeps the ring aligned when the page scrolls during `scrollIntoView`. While an action is running, `updateSpot` additionally runs on a 150ms `setInterval` so that DOM changes (e.g. a dropdown expanding the target's bounding rect) are tracked live.
- **React-controlled inputs**: `setNativeValue()` in `TourOverlay` uses the native `HTMLInputElement.prototype.value` setter descriptor to bypass React's synthetic event system, then fires an `input` event. This is the correct way to programmatically set a value in a React-controlled `<input>` without the component ignoring the change. The `type` action builds typed text via its own `accumulated` string (not `el.value + char`) to avoid leading-zero artifacts on `type="number"` inputs where React re-renders with value `0` between the clear and first keystroke.
- **Cursor z-index**: `DemoCursor` renders at z-10001 (above the tooltip at z-9999) so it's always visible over every layer. Its hot-spot is the tip at SVG `(1,1)`, offset to `(0,0)` via `left: x-1, top: y-1`.
- **`data-food-name` selector format**: Food rows use `data-food-name="<lowercase name>"`. Action selectors like `[data-food-name*="salmon"]` (contains) work for ambiguous matches; `[data-food-name^="potato"]` (starts-with) avoids matching "Sweet Potato". Combine with a child selector for size buttons: `[data-food-name^="potato"] [data-size-key="m"]`.
- **Tooltip height estimate**: `TOOLTIP_H_EST = 200` in `TourOverlay.tsx` is used for positioning math. If tooltip content grows taller (long body text), increase this constant or the tooltip will clip at the viewport bottom.

---

## Authoritative Deliverable Files

### Database
**Live Supabase is the source of truth.** All 12 tables, all data, all RLS policies are already deployed. No seed files exist locally.

- **`sql/schema.sql`** — Reference-only DDL reflecting the full live schema (12 tables, indexes, RLS). Use this to understand the structure or to recreate the DB from scratch. Do not run it against the live DB.
- **Supabase credentials** — REST API URL + service role key stored in Claude memory (`memory/reference_supabase.md`).

### App source
- All app files live in the GitHub repo root (Next.js 16 project)
- `.env.local` — Supabase URL + anon key (never committed; also set in Vercel dashboard)

### Human-readable reference
- **`ANALYSIS_TAB_PLAN.md`** — Full design plan for the Analysis sub-tab (10 decisions, layout mockups, build order)

---

## Open Backlog Items

- [ ] Food row click → slide-in detail panel
- [ ] % RDA in hover tooltips
- [ ] Mobile-responsive collapse
- [ ] Nutrient name tooltips from `nutrients.description`

---

## Key Architecture Decisions

| Decision | What | Why |
|---|---|---|
| Framework | Next.js 16 App Router | Native Vercel target; server + client components |
| Styling | Tailwind CSS | Rapid color-scale and layout work |
| Data client | `@supabase/supabase-js` | Auto-typed from schema; anon key safe for public read |
| Heatmap normalization | Per-column P10/P90 percentile | Outliers don't compress other foods to grey |
| NULL vs 0 | NULL = unavailable; 0 = genuinely none | Critical for correct color encoding |
| Auth | Supabase Auth (email/password) | Native to existing Supabase project; no extra service |
| User data storage | JSONB columns | Flexible schema for RDA values, filter state, meal plans |
| Meal data | JSONB `meals` column in `meal_plans` | Meals are document-like; no benefit to normalizing further |
| **Cross-tab state persistence** | Every user-facing selection (dropdowns, toggles, food/meal pickers) must survive tab switches for the full session. Pattern: lazy `useState(() => localStorage.getItem(...))` init + `useEffect(() => localStorage.setItem(...), [value])` save. New interactive components must follow this pattern. localStorage keys are namespaced `np:<area>:<field>`. |

---

## Database Schema Summary

```
nutrient_categories  (6 rows)     — Macronutrients, Vitamins, Minerals, Fatty Acids, Amino Acid, Food Metric
nutrients            (59 rows)    — All nutrients with unit, category, description
food_categories      (16 rows)    — Fruits, Vegetables, Meat, Dairy, Supplements, etc.
foods               (257 rows)    — 218 original + 25 cooked legumes/grains + 10 dried fruits/vegetables + 4 salt types
food_nutrients   (~14,495 rows)   — food_id × nutrient_id × value_per_100g
food_data_status    (212 rows)    — Compilation log (internal use)
user_rda_profiles   (per user)    — Saved custom daily value profiles (JSONB values)
user_filter_sets    (per user)    — Saved named filter snapshots (JSONB state)
meal_plans          (per user)    — Saved meal plans (JSONB meals array)
saved_meals         (per user)    — Saved individual meal templates (JSONB items array)
preset_meals        (system)      — 113 curated meals across 12 categories (JSONB items array)
food_log            (per user)    — Calendar food log entries (JSONB items array; food_id-anchored; source_id soft ref)
user_diet_lists     (per user)    — Diet tab food selections (JSONB foods array: [{foodId, rating}]; one row per user; upsert on save)

nutrients table has 3 extra columns beyond the original schema:
  body_role             — broad thematic function in the body
  deficiency_symptoms   — clinical symptoms of too little
  excess_symptoms       — symptoms of too much / toxicity notes
```

---

## Data Maintenance — What to Touch When Adding New Data

Every time a food, nutrient, or food category is added, several disconnected places in the codebase must be kept in sync. Miss one and something silently breaks. This section is the authoritative checklist.

---

### Adding a New FOOD

A food has a row in `foods`, up to 50 rows in `food_nutrients`, and must be registered in the app's portion size table.

#### 1. Database (run in Supabase SQL editor)

```sql
-- Step 1: insert the food
INSERT INTO foods (name, food_category_id, description, is_raw, data_source)
VALUES (
  'Food Name',
  (SELECT id FROM food_categories WHERE name = 'Category Name'),
  'Brief description.',
  TRUE,  -- FALSE for cooked/processed foods
  'USDA FoodData Central SR Legacy FDC XXXXXX'
);

-- Step 2: insert its nutrient values (one row per nutrient, NULL if unavailable, 0 if genuinely none)
-- Replace 999 with the actual food id (SELECT id FROM foods WHERE name = 'Food Name')
INSERT INTO food_nutrients (food_id, nutrient_id, value_per_100g) VALUES
  (999, 1,  X.X),  -- Calories
  (999, 2,  X.X),  -- Protein
  -- ... all 52 nutrients
  ;
```

#### 2. App code — REQUIRED

| File | What to add | Why it breaks without it |
|---|---|---|
| `lib/portionSizes.ts` | `food_id: { grams: N, label: '...' }` in `PORTION_SIZES` | Meal planner defaults to 100g/serving, preset enrichment uses wrong portion |

**portionSizes.ts convention:**
- Use USDA standard reference amounts where available (e.g. 1 medium apple = 182g)
- For whole proteins: 1 breast/fillet = actual typical weight
- For cooked grains: use dry weight (the app stores values per 100g as-purchased)
- For supplements: `grams: 100, label: '1 serving'` (stored as per-label values, portion = 100)

#### 3. App code — OPTIONAL

| File | What to add | When needed |
|---|---|---|
| Supabase `preset_meals` table | INSERT directly via REST API or SQL editor | If the food is a good fit for a curated preset |

---

### Adding a New NUTRIENT

A nutrient has a row in `nutrients`, values in `food_nutrients` for every applicable food, and must be registered in the RDA profile system.

#### 1. Database (run in Supabase SQL editor)

```sql
-- Step 1: insert the nutrient
INSERT INTO nutrients (name, unit, nutrient_category_id, description, body_role, deficiency_symptoms, excess_symptoms)
VALUES (
  'Nutrient Name',
  'mg',  -- unit string shown in UI
  (SELECT id FROM nutrient_categories WHERE name = 'Vitamins'),
  'One-line description.',
  'What it does in the body.',
  'Symptoms of deficiency.',
  'Symptoms of excess / toxicity notes.'
);

-- Step 2: insert values for all existing foods that have data
-- NULL = data not available, 0 = genuinely none detected
INSERT INTO food_nutrients (food_id, nutrient_id, value_per_100g)
SELECT f.id, n.id, <value>
FROM foods f, nutrients n
WHERE n.name = 'Nutrient Name' AND f.name = 'Food Name';
```

#### 2. App code — REQUIRED

| File | What to add | Why it breaks without it |
|---|---|---|
| `lib/rdaProfiles.ts` → `BUILT_IN_PROFILES` | RDA value for all 4 profiles (`male-avg`, `female-avg`, `male-active`, `female-active`) | Nutrient shows no %DV bar; appears as 0% in all views |
| `lib/rdaProfiles.ts` → `NUTRIENT_BEHAVIORS` | `'Nutrient Name': 'normal'` (or `'limit'` or `'normal-with-ul'`) | Color scale falls back to default; may color backwards for limit nutrients |
| `lib/filterConstants.ts` → `NUTRIENT_GROUP_LIST` | Add to the appropriate group's `nutrients` array | Nutrient won't appear in the nutrient filter panel |

**Behavior guide:**
- `normal` — more is better (vitamins, minerals, protein, fiber)
- `limit` — less is better (saturated fat, sodium, added sugars, cholesterol, trans fat)
- `normal-with-ul` — more is better up to a point, then toxic (iron, zinc, vitamin A, selenium, etc.)

If `normal-with-ul`, also add to `NUTRIENT_UPPER_LIMITS` in `rdaProfiles.ts`:
```ts
export const NUTRIENT_UPPER_LIMITS: Partial<Record<string, number>> = {
  'Nutrient Name': 45,  // UL in same unit as RDA
}
```

#### 3. App code — OPTIONAL

| File | What to add | When needed |
|---|---|---|
| `lib/rdaColorScale.ts` | New color curve | Only if the nutrient needs a behavior not covered by the 3 existing ones (extremely rare) |

---

### Adding a New FOOD CATEGORY

#### 1. Database (run in Supabase SQL editor)

```sql
INSERT INTO food_categories (name, description)
VALUES ('Category Name', 'What kinds of foods belong here.');
```

#### 2. App code — REQUIRED

| File | What to add | Why it breaks without it |
|---|---|---|
| `lib/filterConstants.ts` → `FOOD_CATEGORY_LIST` | `'Category Name'` string | Category won't appear in the food filter panel |

---

### Quick Sanity Check After Any Data Change

Run these queries in the Supabase SQL editor to verify consistency:

```sql
-- Foods with no nutrient data at all
SELECT f.name FROM foods f
LEFT JOIN food_nutrients fn ON fn.food_id = f.id
WHERE fn.id IS NULL;

-- Foods missing from portionSizes (will use 100g fallback — check the app code manually)
-- portionSizes.ts covers IDs 1–257; anything above 257 needs a new entry

-- Nutrient counts per food (should be ~50 for whole foods, fewer for supplements)
SELECT f.name, COUNT(fn.nutrient_id) AS nutrient_count
FROM foods f
LEFT JOIN food_nutrients fn ON fn.food_id = f.id
GROUP BY f.name ORDER BY nutrient_count ASC LIMIT 20;

-- Nutrients with no RDA in any profile (check rdaProfiles.ts manually for these)
SELECT name FROM nutrients ORDER BY name;
```

---

## Cold-Start Instructions

**To pick up where we left off:**
> Read PROJECT_STATE.md. This is a nutrition web app: Next.js 16 + Supabase + Vercel, source at github.com/danzhig/nutrition-platform. 257 foods × 59 nutrients (58 with food data). Three live features: interactive heatmap, meal/day planner, and calendar food log tracker. Supabase Auth is live. Direct Supabase REST API credentials are in memory. The preset_meals table (113 meals) lives only in Supabase — no local seed file. Before writing any code, tell me what you see as the current state and ask what I want to do.

**IMPORTANT:** Before adding any food, nutrient, or food category, read the **Data Maintenance** section above — multiple files must be updated in sync or things silently break.
