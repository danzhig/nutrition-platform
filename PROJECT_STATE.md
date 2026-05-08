# Nutrition Platform — Project State

**Last updated:** 2026-05-08 (session 14)
**Current phase: Calendar Tracker complete (all 5 phases live)**

---

## What Is This Project

A public-facing nutrition web app built on **Next.js 16 + Supabase + Vercel**, source-controlled on **GitHub**. The database layer is fully complete (243 foods × 52 nutrients). The app has three main features: an interactive heatmap table, a meal/day planner, and a calendar food log tracker.

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
│   ├── NutrientInfoCard.tsx    ← Floating info card: viewport-clamped; body role, deficiency/excess; food-source bar
│   ├── MealNutritionChart.tsx  ← Full-width chart dashboard: bar chart + radar + donut
│   ├── MealCategoryRadar.tsx   ← Custom SVG pentagonal radar: avg %DV per category, gradient edges
│   ├── MacroDonutChart.tsx     ← Dual-ring PieChart: inner = 4 macro slices (Net Carbs/Fibre/Protein/Fat); outer = top-5 foods per macro
│   ├── NutrientRankingView.tsx ← Pick nutrient → ranked bar chart of all foods; N selector, top/bottom, category filter, per-serving toggle
│   ├── NutrientScatterPlot.tsx ← X/Y scatter; optional bubble size; category legend; clickable legend highlights/dims
│   ├── FoodComparisonView.tsx  ← Food A vs B; 3 panels (A, B, A−B net diff); centered diff bars
│   ├── MealComparisonView.tsx  ← Meal A vs B; food-drill-down pill buttons per panel; diff panel always compares full meals
│   ├── CalendarView.tsx        ← Calendar tab orchestrator: Month/Week toggle, entry fetch, day panel, add modal
│   ├── CalendarMonthGrid.tsx   ← Month grid: 7×5–6 grid, prev/today/next nav, entry pills, +N overflow
│   ├── CalendarWeekList.tsx    ← Week rolodex: infinite-scroll Mon–Sun strips, entry cards, scroll persistence
│   ├── CalendarDayPanel.tsx    ← Day detail panel: entry cards (grouped by type), inline grams edit, remove, Day Total nutrition
│   ├── CalendarAddModal.tsx    ← Add entry modal: type chooser → meal / plan / food; writes food_log rows
│   └── SizeButtons.tsx         ← Inline S/M/L size buttons for variable-size foods; highlights active size
├── lib/
│   ├── supabase.ts             ← Supabase client (NEXT_PUBLIC_ env vars)
│   ├── fetchHeatmapData.ts     ← Server-side query + P10/P90 normalization; parallel pagination via Promise.all
│   ├── colorScale.ts           ← Relative heatmap color (P10/P90 → hsl)
│   ├── filterConstants.ts      ← FOOD_CATEGORY_LIST, NUTRIENT_GROUP_LIST
│   ├── portionSizes.ts         ← Per-food serving sizes (all 243 foods, keyed by food_id) + S/M/L size variants ← CRITICAL
│   ├── rdaProfiles.ts          ← 4 built-in RDA profiles; NUTRIENT_BEHAVIORS; NUTRIENT_UPPER_LIMITS
│   ├── rdaColorScale.ts        ← %DV color scale: normal / limit / normal-with-ul
│   ├── profileStorage.ts       ← CRUD for user_rda_profiles
│   ├── filterSetStorage.ts     ← CRUD for user_filter_sets
│   ├── mealStorage.ts          ← CRUD for meal_plans
│   ├── savedMealStorage.ts     ← CRUD for saved_meals
│   ├── presetMealStorage.ts    ← loadPresetMeals() — public read from preset_meals table
│   ├── complementScore.ts      ← computeComplementScore(): 0-100 score vs current plan gaps
│   ├── categoryColors.ts       ← CATEGORY_COLORS palette shared by ranking + scatter views
│   └── foodLogStorage.ts       ← CRUD for food_log (getEntriesForDateRange, addEntry, updateEntryItemGrams, deleteEntry, nullSourceId)
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
| **Complement score — food picker** | ✅ Live — live score badge per food at default serving size; sorted by score descending when DV profile is active; updates on every plan change |
| **Low Sug Juices preset category** | ✅ Live — 6 low-sugar cold-press juice presets: Cucumber Mint Refresher, Celery Lemon Detox, Green Alkaline Juice, Beet Ginger Shots, Tomato Herb Juice, Carrot Turmeric Zinger |
| **Meal Comparison food drill-down** | ✅ Live — food pill buttons per meal panel (one per food + "All"); clicking shows that food's standalone %DV contribution; diff panel always compares full meals (`MealComparisonView.tsx`) |
| **Cooked versions of dry foods** | ✅ Live — 25 cooked food entries (IDs 219–243) for all legumes and grains that existed only in dry form; dry food names updated with "(dry)" suffix; nutrients scaled per USDA dry-to-cooked caloric ratio; water/GI overridden to cooked values; portion sizes in `portionSizes.ts` (½ cup legumes, 1 cup grains) |
| **Nutrient sort in preset & food picker panes** | ✅ Live — sort dropdown sorts meals/foods by total content of a chosen nutrient (descending); nutrient amount badge shown; sort-by-score disabled while nutrient sort is active |
| **My Templates merged into Presets pane** | ✅ Live — saved templates appear as a violet pill in the category row (only when user has templates); same nutrient sort, score badges, delete buttons; loading a template closes the Presets pane |
| **S/M/L size selector** | ✅ Live — inline S/M/L buttons on variable-size foods (fruits, vegetables, chicken, eggs); present in FoodPickerModal, CalendarAddModal, MealCard, CalendarDayPanel; implemented in `SizeButtons.tsx` + `portionSizes.ts` size variants |

**Total foods: 243** (218 original + 25 cooked versions of dry legumes/grains)  
**Total nutrients: 52** (original 50 + Net Carbohydrates + Creatine)  
**Total food_nutrients rows: ~12,457** (11,157 pre-existing + 1,300 cooked food rows)  
**Total preset meals: 113** (107 original + 6 Low Sug Juices)

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
- **`ideas.md`** — Full visualization roadmap for future features
- **`meal_ideas.md`** — Planned new presets: Snacks, Wraps & Tacos, Smoothies, Breakfast variety

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
nutrients            (52 rows)    — All nutrients with unit, category, description
food_categories      (16 rows)    — Fruits, Vegetables, Meat, Dairy, Supplements, etc.
foods               (243 rows)    — 218 original + 25 cooked versions of dry legumes/grains
food_nutrients   (~12,457 rows)   — food_id × nutrient_id × value_per_100g
food_data_status    (212 rows)    — Compilation log (internal use)
user_rda_profiles   (per user)    — Saved custom daily value profiles (JSONB values)
user_filter_sets    (per user)    — Saved named filter snapshots (JSONB state)
meal_plans          (per user)    — Saved meal plans (JSONB meals array)
saved_meals         (per user)    — Saved individual meal templates (JSONB items array)
preset_meals        (system)      — 113 curated meals across 12 categories (JSONB items array)
food_log            (per user)    — Calendar food log entries (JSONB items array; food_id-anchored; source_id soft ref)

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
> Read PROJECT_STATE.md. This is a nutrition web app: Next.js 16 + Supabase + Vercel, source at github.com/danzhig/nutrition-platform. 243 foods × 52 nutrients. Three live features: interactive heatmap, meal/day planner, and calendar food log tracker. Supabase Auth is live. Direct Supabase REST API credentials are in memory. The preset_meals table (113 meals) lives only in Supabase — no local seed file. Before writing any code, tell me what you see as the current state and ask what I want to do.

**IMPORTANT:** Before adding any food, nutrient, or food category, read the **Data Maintenance** section above — multiple files must be updated in sync or things silently break.
