# Nutrition Platform — Project State

**Last updated:** 2026-04-26 (session 10)
**Current phase: Phase 3 in progress**

---

## What Is This Project

A public-facing nutrition web app built on **Next.js 16 + Supabase + Vercel**, source-controlled on **GitHub**. The database layer is fully complete (218 foods × 50 nutrients). The app has two main features: an interactive heatmap table and a meal planner.

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
│   ├── page.tsx                ← Home: fetches heatmap data, renders <MainView>
│   └── globals.css
├── components/
│   ├── MainView.tsx            ← Top-level tab switcher: Day Planner | Data View
│   ├── DataView.tsx            ← Data View: second-level tabs (Heatmap | Charts | Food Comparison)
│   ├── HeatmapTable.tsx        ← Orchestrator: filter state, sort, per-serving, DV profile
│   ├── HeatmapCell.tsx         ← Single cell: color + tooltip; DV mode aware
│   ├── FilterPanel.tsx         ← Slide-out panel: food/nutrient filters, saved views
│   ├── NutrientSidebar.tsx     ← Vertical avg-profile column right of table
│   ├── AuthProvider.tsx        ← React context: user, loading, signIn, signUp, signOut
│   ├── AuthModal.tsx           ← Login/signup modal
│   ├── AuthButton.tsx          ← Header button
│   ├── MealPlanner.tsx         ← Orchestrator: plan state, tab bar, save/load, collapse state
│   ├── MealCard.tsx            ← One meal: named, collapsible, food items, save-as-template
│   ├── FoodPickerModal.tsx     ← Food list modal: search + category filter; complement score badges sorted by score
│   ├── DVProfilePanel.tsx      ← DV profile editor; 3-column grid in editorOnly mode
│   ├── MealNutritionSidebar.tsx ← 50-nutrient %DV bar chart; click → NutrientInfoCard
│   ├── NutrientInfoCard.tsx    ← Floating info card: viewport-clamped; body role, deficiency/excess; food-source bar
│   ├── MealNutritionChart.tsx  ← Full-width chart dashboard: bar chart + radar + donut
│   ├── MealCategoryRadar.tsx   ← Custom SVG pentagonal radar: avg %DV per category, gradient edges
│   ├── MacroDonutChart.tsx     ← Dual-ring PieChart: inner = macro caloric %; outer = top-5 foods per macro
│   ├── NutrientRankingView.tsx ← Pick nutrient → ranked bar chart of all 218 foods
│   ├── NutrientScatterPlot.tsx ← X/Y scatter; optional bubble size; category legend
│   └── FoodComparisonView.tsx  ← Food A vs B; 3 panels (A, B, A−B net diff); centered diff bars
├── lib/
│   ├── supabase.ts             ← Supabase client (NEXT_PUBLIC_ env vars)
│   ├── fetchHeatmapData.ts     ← Server-side query + P10/P90 normalization; parallel pagination
│   ├── colorScale.ts           ← Relative heatmap color (P10/P90 → hsl)
│   ├── filterConstants.ts      ← FOOD_CATEGORY_LIST, NUTRIENT_GROUP_LIST
│   ├── portionSizes.ts         ← Per-food serving sizes (all 218 foods, keyed by food_id) ← CRITICAL
│   ├── rdaProfiles.ts          ← 4 built-in RDA profiles; NUTRIENT_BEHAVIORS; NUTRIENT_UPPER_LIMITS
│   ├── rdaColorScale.ts        ← %DV color scale: normal / limit / normal-with-ul
│   ├── profileStorage.ts       ← CRUD for user_rda_profiles
│   ├── filterSetStorage.ts     ← CRUD for user_filter_sets
│   ├── mealStorage.ts          ← CRUD for meal_plans
│   ├── savedMealStorage.ts     ← CRUD for saved_meals
│   ├── presetMealStorage.ts    ← loadPresetMeals() — public read from preset_meals table
│   ├── complementScore.ts      ← computeComplementScore(): 0-100 score vs current plan gaps
│   └── categoryColors.ts       ← CATEGORY_COLORS palette shared by ranking + scatter views
├── types/
│   ├── nutrition.ts            ← HeatmapRow, FoodRow, NutrientMeta, HeatmapData, etc.
│   └── meals.ts                ← MealItem, Meal, ActiveMealPlan
├── sql/                        ← schema.sql — schema reference (reflects live DB structure)
├── reference/                  ← CSV reference files
└── memory/                     ← Claude memory files (not committed to git)
```

---

## Current Completion Status

| Component | Status |
|---|---|
| Schema (all 11 tables, indexes, RLS) | ✅ Complete |
| Reference data (nutrient categories, nutrients, food categories) | ✅ Complete |
| Food data — all 10 batches (212 foods × 50 nutrients) | ✅ Complete |
| Supplement foods (4 supplements, new Supplements category) | ✅ Complete |
| Tortillas (Corn + Flour, all 50 nutrients) | ✅ Complete |
| **Next.js app scaffold** | ✅ Complete |
| **GitHub repo** | ✅ Complete — github.com/danzhig/nutrition-platform |
| **Supabase project + database deployed** | ✅ Complete — 10,600 rows verified |
| **Vercel project connected to GitHub** | ✅ Complete — auto-deploys on push to `main` |
| **Top-level tab rename** | ✅ Live — "Nutrient Heatmap" top-level tab renamed to "Data View"; now hosts a second-level tab bar (Nutrient Heatmap · Charts) |
| **Nutrient Ranking View** | ✅ Live — Charts tab: pick any nutrient → ranked bar chart of all 218 foods; N selector (50/100); top/bottom toggle; category filter; per-100g vs per-serving toggle; bars colored by food category |
| **Nutrient Scatter Plot** | ✅ Live — Charts tab (below Ranking): pick X + Y nutrient axes; optional bubble size (third nutrient); dots colored by food category (shared palette); clickable legend highlights/dims categories; per-100g vs per-serving toggle |
| **Net Carbohydrates** | ✅ Live — `Carbohydrates` hidden from display (kept in DB); `Net Carbohydrates` (= Carbs − Fibre) added as nutrient; all 4 RDA profiles updated |
| **Macro split donut (updated)** | ✅ Live — inner ring now shows 4 slices: Net Carbs (amber) + Dietary Fibre (lime) + Protein (violet) + Fat (emerald); both at 4 kcal/g (USDA convention); GI weighting in sidebar uses Net Carbs |
| **Filter Deselect All fix** | ✅ Live — Food Category and Nutrient Group "Deselect all" now truly clears to empty (previous bug kept last item selected) |
| **Tab persistence** | ✅ Live — active top-level tab and Data View sub-tab saved to localStorage; page reopens to last-visited tab on reload |
| **Day Planner draft persistence** | ✅ Live — in-progress plan (meals, foods, DV profile, custom RDA values) written to `np:draft-plan` / `np:draft-custom-rda` on every change; survives switching to Data View and back without losing unsaved work; cleared on logout or "New Plan" |
| **Seed serving sizes** | ✅ Live — Flaxseeds and Hemp Seeds standardised to 2 tbsp (matching Chia Seeds) for consistent per-serving comparison; Sunflower/Pumpkin stay at 1 oz (snack use); Sesame/Poppy stay at 1 tbsp (condiment use) |
| **MVP Heatmap Table** | ✅ Live — all 218 foods, dark mode, column sort, filters, search |
| **Nutrient Avg Profile Sidebar** | ✅ Live — all 50 nutrients grouped, color-coded avg across filtered foods |
| **% Daily Value mode** | ✅ Live — 4 built-in RDA profiles + custom; per-nutrient UL warnings; new color scale |
| **Supabase Auth + saved RDA profiles** | ✅ Live — email/password sign up/in; saved custom RDA profiles in `user_rda_profiles` |
| **Saved filter views** | ✅ Live — logged-in users can save/load/delete named filter sets |
| **Day Planner** | ✅ Live — multi-meal plans, food picker, %DV bar chart sidebar, save/load/edit (top-level tab renamed from "Meal Planner" to "Day Planner") |
| **Saved meal templates** | ✅ Live — save individual meals as reusable templates; load into any plan |
| **Nutrient info cards** | ✅ Live — click any nutrient in the meal sidebar to see function, deficiency symptoms, and excess symptoms |
| **Meal planner chart view** | ✅ Live — toggle between sidebar and full-width chart dashboard; bar chart of all 50 nutrients by %DV, sorted within category; cap Y-axis at 100% toggle |
| **Category fulfilment radar** | ✅ Live — pentagonal web chart below bar chart showing avg %DV per category (Macronutrient, Vitamin, Mineral, Fatty Acid, Amino Acid); per-vertex colour and gradient edges via rdaCellColor scale |
| **Preset meal templates** | ✅ Live — 113 curated system meals across 12 categories (Juices, Low Sug Juices, Salads, Pastas, Bowls, High Protein, Breakfast, Low Carb, Keto, Soups & Stews, Stir-Fries, Curries) deployed to Supabase |
| **Collapsible meal cards** | ✅ Live — ▸/▾ toggle on each meal card; loaded presets/templates appear at top, expanded; other meals collapse; header shows food count + total grams when collapsed |
| **Preset item enrichment fix** | ✅ Live — preset items resolved to full MealItem on load (food_name, mode, portion_grams, portion_label) via foodsById + getPortionSize |
| **Macro split donut** | ✅ Live (superseded — see updated entry above) |
| **Low Carb & Keto preset meals** | ✅ Live — 6 Low Carb + 6 Keto meals deployed to Supabase |
| **Expanded preset meal library** | ✅ Live — 60 additional meals (101 total at that point) deployed to Supabase; categories: Soups & Stews (10), Stir-Fries (7), Curries (7); expanded Breakfast, Salads, Bowls, High Protein, Pastas, Low Carb, Keto, Juices |
| **Nutrient tooltip improvements** | ✅ Live — tooltip clamps to viewport (useLayoutEffect measures card height before positioning); stacked food-source bar shows top-5 foods contributing to that nutrient in the active plan |
| **Tab bar UI** | ✅ Live — single tab bar at top of Meal Planner: `▤ Day Builder · ▦ Charts | Plan ▾ · DV Profile ▾`; all four controls grouped left; plan picker dropdown has inline name edit, save/update, plan list, new plan; DV picker lists saved profiles first then built-ins |
| **Header cleanup** | ✅ Live — removed "values per 100g raw", hover/sort tips, and global colour-scale legend bar from page header; colour scale legend now lives inline in the heatmap status bar |
| **Custom DV editor multi-column** | ✅ Live — custom DV profile editor renders nutrient groups as cards in a 3-column grid (editorOnly/inline mode); sidebar mode retains single-column layout |
| **Complement score — preset & saved meals** | ✅ Live — each preset and saved meal card shows a 0-100 complement score badge (green ≥65, amber ≥35, grey <35); score reflects how well the meal fills remaining DV gaps in the current plan, with hard penalty for normal-with-ul nutrients crossing 125% DV (+flat −5 pts per nutrient crossing 200%) and soft penalty for limit nutrients; implemented in `lib/complementScore.ts` |
| **Complement score — food picker** | ✅ Live — FoodPickerModal shows a live score badge per food calculated at default serving size; list sorted by score descending when a DV profile is active; updates instantly as plan changes (portion adjustments, new foods added) |
| **Update Plan / New Plan on tab bar** | ✅ Live — "Update Plan" and "New Plan" buttons moved from Plan dropdown to the tab bar itself; Update Plan button is grey when no unsaved changes and turns purple when the plan has been modified; dirty state survives tab switches via `np:draft-snapshot` in localStorage |
| **Tooltip animation fix** | ✅ Live — Recharts Tooltip on Nutrient Scatter Plot no longer flies in from top-left; `isAnimationActive={false}` on `<Tooltip>` |
| **Meals collapsed on tab return** | ✅ Live — when returning to the Day Planner tab, all meal cards default to collapsed; collapse state initialized from draft localStorage key |
| **ISR revalidate 300** | ✅ Live — replaced `export const dynamic = 'force-dynamic'` with `export const revalidate = 300`; page re-renders at most every 5 minutes; new foods/nutrients are reflected after the next revalidation cycle |
| **Parallel Supabase pagination** | ✅ Live — `fetchHeatmapData.ts` counts rows first then fetches all pages in parallel via `Promise.all`; reduces initial load time |
| **Bacon preset name fix** | ✅ Fixed — `'Bacon (pork)'` corrected to `'Bacon (pork, raw)'` in preset_meals (Supabase) |
| **Food Comparison** | ✅ Live — third sub-tab under Data View; pick Food A & Food B; weight mode (per 100g / per serving / custom g per food); optional DV profile; three side-by-side panels (Food A, Food B, Net Difference A−B) each grouped by nutrient category with colour bars; net difference panel uses centered bars (green = A has more, red = B has more); bar chart below sorted largest positive → largest negative %DV difference (`components/FoodComparisonView.tsx`) |
| **Preset meal portion audit** | ✅ Live — 34 portion corrections applied and deployed; fixes: spinach ≤90g in salads / 60g elsewhere, arugula 40–60g, kale 67g in juices, dry legumes ≤104g (~2 servings), turkey/mackerel 170g, bacon 56g (4 slices), heavy cream 60g, lamb 170g in stews, egg whites 165g; all corrections are live in Supabase |
| **Juice portion audit** | ✅ Live — all 8 existing Juice presets corrected to realistic single-serving cold-press sizes (300–410g produce total); Berry Antioxidant Boost restructured with apple as juice base (berry-only had no drinkable liquid); all 8 patches live in Supabase |
| **Low Sug Juices preset category** | ✅ Live — 6 new low-sugar cold-press juice presets in a new "Low Sug Juices" category: Cucumber Mint Refresher, Celery Lemon Detox, Green Alkaline Juice, Beet Ginger Shots, Tomato Herb Juice, Carrot Turmeric Zinger; all deployed to Supabase |
| **Preset portion fixes (critical)** | ✅ Live — Chickpea & Spinach Curry reduced from 200g to 80g dry chickpeas (200g dry ≈ 500g cooked, was 3+ servings); Lamb Chop & Collard Greens reduced from 250g to 170g lamb; patched directly in Supabase |
| **Meal Comparison food drill-down** | ✅ Live — in Meal A and Meal B panels, food pill buttons appear in the panel header (one per food in the meal + an "All" pill); clicking a food shows only that food's standalone nutrient contribution as %DV; selection resets when the meal changes; diff panel always compares full meals unchanged (`components/MealComparisonView.tsx`) |
| **Meal expansion roadmap** | ✅ Documented — `meal_ideas.md` at project root documents ~25–28 planned new presets across 5 categories: Snacks (6), Wraps & Tacos (5), Smoothies (5), Breakfast variety (5), Underused Foods inventory; execution order defined |
| **Cross-tab state persistence** | ✅ Live — all user selections survive tab switches for the full browser session: Food Comparison (food A/B, weight mode, custom grams, DV profile); Meal Comparison (meal A/B, food drill-down within each meal, DV profile); Charts — Nutrient Ranking (nutrient, N, top/bottom, category filter, per-serving); Charts — Scatter Plot (X axis, Y axis, bubble size, category highlight, per-serving, axis limits); Day Builder chart view (cap-at-100% toggle). All persisted via localStorage so they also survive page refresh. |
| **Nutrient sort in preset & food picker panes** | ✅ Live — nutrient sort dropdown in the Preset Meals panel and the food picker modal; selecting a nutrient sorts meals/foods by total content of that nutrient (descending); nutrient amount badge shown on each item; sort-by-score (rank) button is disabled while nutrient sort is active; both panes share the same grouped optgroup dropdown (nutrient category → nutrient name) |
| **My Templates merged into Presets pane** | ✅ Live — "My Templates" is now a subcategory within the Presets selection pane rather than a separate panel; appears as a violet pill at the end of the category pill row (only visible when the user has saved templates); selecting it shows saved meal templates with delete buttons, score badges, and the same nutrient sort; preset and template sort-by-rank buttons remain independent; loading a template closes the Presets pane |

**Total foods: 218** (212 whole foods + 4 supplements + 2 tortillas)  
**Total food_nutrients rows: ~10,725** (212 foods × 50 nutrients + 25 supplement rows + 100 tortilla rows)  
**Total preset meals: 113** (107 original + 6 Low Sug Juices)

---

## Authoritative Deliverable Files

### Database
**Live Supabase is the source of truth.** All 11 tables, all data, all RLS policies are already deployed. No seed files exist locally.

- **`sql/schema.sql`** — Reference-only DDL reflecting the full live schema (11 tables, indexes, RLS). Use this to understand the structure or to recreate the DB from scratch. Do not run it against the live DB.
- **Supabase credentials** — REST API URL + service role key stored in Claude memory (`memory/reference_supabase.md`).

### App source
- All app files live in the GitHub repo root (Next.js 16 project)
- `.env.local` — Supabase URL + anon key (never committed; also set in Vercel dashboard)

### Human-readable reference
- **`ideas.md`** — Full visualization roadmap for future features

---

## Prioritized Next Steps

### Phase 1 — Foundation & Deploy ✅ Complete

### Phase 2 — Heatmap Polish + Auth + Meal Planner ✅ Complete
- [x] Dark mode theme
- [x] P10/P90 percentile colour scale
- [x] Per-serving toggle
- [x] Slide-out filter panel
- [x] Multi-select food category + nutrient group filters
- [x] Nutrient average profile sidebar
- [x] % Daily Value mode — 4 built-in RDA profiles + custom + UL warnings
- [x] Supabase Auth — email/password; saved custom RDA profiles
- [x] Saved filter views
- [x] Meal Planner — multi-meal plan builder with %DV bar chart sidebar

### Phase 3 — Polish backlog
- [ ] Food row click → slide-in detail panel
- [ ] % RDA in hover tooltips
- [ ] Mobile-responsive collapse
- [ ] Nutrient name tooltips from `nutrients.description`
- [x] Nutrient Ranking View — pick a nutrient, ranked bar chart of all 218 foods (`NutrientRankingView.tsx` in Charts sub-tab)
- [x] Net Carbohydrates — replaces Carbohydrates in display; formula Carbs − Fibre; all RDA profiles updated
- [x] Macro split donut — updated: 4 slices (Net Carbs + Fibre + Protein + Fat); GI weighting fixed
- [x] Deselect All filter bug — truly clears to empty selection
- [x] Tab persistence — localStorage saves active tab + sub-tab across reloads
- [x] Seed serving size audit — Flaxseeds + Hemp Seeds standardised to 2 tbsp

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
nutrients            (50 rows)    — All nutrients with unit, category, description
food_categories      (16 rows)    — Fruits, Vegetables, Meat, Dairy, Supplements, etc.
foods               (218 rows)    — 212 whole foods + 4 supplements + 2 tortillas
food_nutrients   (~10,725 rows)   — food_id × nutrient_id × value_per_100g
food_data_status    (212 rows)    — Compilation log (internal use)
user_rda_profiles   (per user)    — Saved custom daily value profiles (JSONB values)
user_filter_sets    (per user)    — Saved named filter snapshots (JSONB state)
meal_plans          (per user)    — Saved meal plans (JSONB meals array)
saved_meals         (per user)    — Saved individual meal templates (JSONB items array)
preset_meals        (system)      — 113 curated meals across 12 categories (JSONB items array)

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
  -- ... all 50 nutrients
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
-- portionSizes.ts covers IDs 1–218; anything above 218 needs a new entry

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
> Read PROJECT_STATE.md. This is a nutrition web app: Next.js 16 + Supabase + Vercel, source at github.com/danzhig/nutrition-platform. 218 foods × 50 nutrients. Two live features: interactive heatmap and meal planner. Supabase Auth is live. Direct Supabase REST API credentials are in memory. The preset_meals table (101 meals) lives only in Supabase — no local seed file. Before writing any code, tell me what you see as the current state and ask what I want to do.

**To add a new feature:**
> Read PROJECT_STATE.md. I want to add: [DESCRIBE FEATURE]. Before writing any code: (1) which existing files will you modify? (2) what new files are needed? (3) does this need a new Supabase table/query or is it front-end only? Wait for my approval.

**To add a new food:**
> Read PROJECT_STATE.md — pay attention to the Data Maintenance section. I want to add [FOOD NAME] to [CATEGORY]. Write the SQL, the portionSizes.ts entry, and update the reference CSV. Wait for approval before writing anything.

**IMPORTANT:** Before adding any food, nutrient, or food category, read the **Data Maintenance** section above — multiple files must be updated in sync or things silently break.
