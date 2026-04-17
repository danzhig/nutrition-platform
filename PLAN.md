# Nutrition Platform — Build Plan

**Last updated:** 2026-04-17  
**Phase:** Phase 3 — Polish & Ranking View

---

## Project Goal

A public-facing nutrition web app backed by Supabase PostgreSQL (218 foods × 50 nutrients), hosted on **Vercel**, source-controlled on **GitHub**. Two shipped features: an interactive heatmap table and a meal planner. Auth is live — logged-in users can save custom RDA profiles, filter sets, and meal plans.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend framework | Next.js 16 (App Router) | React-based, built for Vercel; `use client` components for interactivity |
| Styling | Tailwind CSS v4 | Utility-first; slate-900 dark mode base throughout |
| Data layer | Supabase (PostgreSQL) | Auto-generated REST API + `@supabase/supabase-js` v2 |
| Auth | Supabase Auth | Email/password; session in localStorage; `onAuthStateChange` reactive |
| Hosting | Vercel | Deploy on push to `main`; preview deploys on PRs |
| Source control | GitHub | danzhig/nutrition-platform |
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
│   ├── MainView.tsx            ← Tab switcher: Nutrient Heatmap | Meal Planner
│   │
│   ├── — Heatmap ──────────────────────────────────────────────────────────────
│   ├── HeatmapTable.tsx        ← Orchestrator: filter state, sort, per-serving, DV profile
│   ├── HeatmapCell.tsx         ← Single cell: color + tooltip; DV mode aware
│   ├── FilterPanel.tsx         ← Slide-out panel: food/nutrient filters, per-serving,
│   │                              % DV profile, saved profiles, saved filter views
│   ├── NutrientSidebar.tsx     ← Vertical avg-profile column right of table (all 50 nutrients)
│   │
│   ├── — Auth ─────────────────────────────────────────────────────────────────
│   ├── AuthProvider.tsx        ← React context: user, loading, signIn, signUp, signOut
│   ├── AuthModal.tsx           ← Login/signup modal
│   ├── AuthButton.tsx          ← Header button: Sign in → opens modal; logged-in → avatar + dropdown
│   │
│   └── — Meal Planner ─────────────────────────────────────────────────────────
│       ├── MealPlanner.tsx         ← Orchestrator: plan state, save/load, DV profile selector
│       ├── MealCard.tsx            ← One meal: named, food items with servings/grams controls
│       ├── FoodPickerModal.tsx     ← Full food list modal: search + category filter tabs
│       └── MealNutritionSidebar.tsx ← 50-nutrient bar chart sidebar (fills to %DV)
│
├── lib/
│   ├── supabase.ts             ← Supabase client (NEXT_PUBLIC_ env vars)
│   ├── fetchHeatmapData.ts     ← Server-side query + P10/P90 normalization
│   ├── colorScale.ts           ← Relative heatmap color (P10/P90 → hsl)
│   ├── filterConstants.ts      ← FOOD_CATEGORY_LIST, NUTRIENT_GROUP_LIST, ALL_NUTRIENT_CATEGORIES
│   ├── portionSizes.ts         ← Per-food serving sizes (all 218 foods, keyed by food_id)
│   ├── rdaProfiles.ts          ← 4 built-in RDA profiles; NUTRIENT_BEHAVIORS; NUTRIENT_UPPER_LIMITS
│   ├── rdaColorScale.ts        ← %DV color scale: normal / limit / normal-with-ul behaviors
│   ├── profileStorage.ts       ← CRUD for user_rda_profiles Supabase table
│   ├── filterSetStorage.ts     ← CRUD for user_filter_sets Supabase table
│   └── mealStorage.ts          ← CRUD for meal_plans Supabase table
│
├── types/
│   ├── nutrition.ts            ← HeatmapRow, FoodRow, NutrientMeta, HeatmapData, NutrientCategory
│   │                              Re-exports: ProfileId, RDAProfile, RDAValues, NutrientBehavior,
│   │                              SavedProfile, SavedFilterSet, FilterSetState
│   └── meals.ts                ← MealItem, Meal, ActiveMealPlan
│
├── sql/
│   ├── schema.sql              ← All 6 base tables, indexes, RLS
│   ├── seed_all.sql            ← All reference data + 212 foods + 8,268 nutrient rows
│   ├── seed_amino_acids_gi_antioxidant.sql  ← 9 EAAs + GI + antioxidant (2,332 rows)
│   ├── seed_supplements.sql    ← Supplements category + 4 supplement foods (25 nutrient rows)
│   └── seed_breads_and_tortillas.sql  ← Breads & tortillas (Grains & Cereals); add new bread types here
│
├── reference/                  ← CSV reference files (food_list, nutrients_list, food_categories)
├── .env.local                  ← NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Deployment Workflow

```
Local dev  →  git push  →  GitHub (main)  →  Vercel auto-deploy  →  calls Supabase REST API
```

- Every push to `main` triggers a Vercel production deploy
- PRs get automatic preview URLs
- Env vars set in both `.env.local` (local) and Vercel dashboard (production)

---

## User Data Tables (run in Supabase SQL editor after schema.sql)

```sql
-- Saved custom RDA profiles
CREATE TABLE user_rda_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  values jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE user_rda_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own RDA profiles"
  ON user_rda_profiles FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Saved filter views
CREATE TABLE user_filter_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  state jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE user_filter_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own filter sets"
  ON user_filter_sets FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Meal plans
CREATE TABLE meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  meals jsonb NOT NULL DEFAULT '[]',
  rda_selection text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own meal plans"
  ON meal_plans FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## Feature Deep-Dives

### Heatmap — color normalization

Per-column **P10/P90 percentile** (not min/max). Outliers (e.g. liver B12, ground cinnamon antioxidant) clamp to 0 or 1 rather than compressing everything else.

```
normalizedValue = clamp((value - p10) / (p90 - p10), 0, 1)
```

In per-serving mode, p10/p90 is recomputed using `value × (portionGrams / 100)`.

### % Daily Value — color scale (`lib/rdaColorScale.ts`)

Three behaviors driven by `NUTRIENT_BEHAVIORS` map in `rdaProfiles.ts`:

| Behavior | Nutrients | Scale |
|---|---|---|
| `normal` | Most nutrients | 0–40% red→orange, 40–50% transition, 50%+ green |
| `limit` | Sat fat, sodium, trans fat, cholesterol, sugars | 0–60% green, 60–90% yellow, 90–115% orange, >115% red |
| `normal-with-ul` | Iron, zinc, vit A, selenium, etc. | Same as normal up to 110%, then amber→red approaching UL |

### Meal Planner — data flow

1. `app/page.tsx` fetches `HeatmapData` server-side (same query as heatmap — reuses all food + nutrient data)
2. `MainView` passes it to both `HeatmapTable` and `MealPlanner`
3. `MealPlanner` holds `ActiveMealPlan` state; builds `Map<food_id, FoodRow>` for O(1) nutrient lookups
4. `MealCard` owns per-meal item state via callbacks to `MealPlanner`
5. `FoodPickerModal` filters `data.foods` client-side (no extra Supabase query)
6. `MealNutritionSidebar` computes totals: `Σ (value_per_100g × item.grams / 100)` across all items in all meals
7. Saved plans stored as JSONB in `meal_plans.meals`; `rda_selection` is `''` | ProfileId | `'saved:uuid'`

---

## Build Phases

### Phase 1 — Foundation & Deploy ✅ Complete
- Scaffold Next.js 16 (TypeScript, Tailwind v4)
- GitHub repo, Supabase project, Vercel deploy
- MVP heatmap: column sort, category filter, search, dark mode

### Phase 2 — Heatmap Polish + Auth + Meal Planner ✅ Complete
- [x] P10/P90 percentile colour scale
- [x] Per-serving toggle (p10/p90 recomputed)
- [x] Slide-out filter panel
- [x] Nutrient average profile sidebar (50 nutrients, DV-mode aware)
- [x] % Daily Value mode — 4 built-in profiles + custom + UL warnings + inverted nutrients
- [x] Supabase Auth — email/password; `AuthProvider` context; `AuthButton` in header
- [x] Saved custom RDA profiles (per user, Supabase)
- [x] Saved filter views (per user, Supabase)
- [x] Tab switcher via `MainView` (Nutrient Heatmap | Meal Planner)
- [x] Meal Planner — multi-meal plans, food picker modal, per-item servings/grams, save/load/edit
- [x] Meal nutrition sidebar — 50-nutrient bar chart, fills to %DV, grouped by category
- [x] Supplement foods — 4 supplements (Multivitamin, Magnesium Bisglycinate, Fish Oil, Vitamin K2+D3) under new Supplements category; per-serving storage convention (value_per_100g = label value, portion_grams = 100)

### Phase 3 — Polish backlog (next)
- [ ] Food row click → slide-in detail panel (`FoodDetailPanel.tsx`)
- [ ] % RDA values in hover tooltips on heatmap cells
- [ ] Nutrient name tooltips (plain-English description from `nutrients.description`)
- [ ] Mobile-responsive: collapse heatmap to single-nutrient ranked list on small screens
- [ ] **Nutrient Ranking View** — pick a nutrient → ranked bar chart of all 212 foods, color by category

### Phase 4 — Advanced Visualizations (from ideas.md)
- Bubble/scatter plot (two-nutrient axes, food as bubbles)
- Radar / spider chart (nutritional fingerprint per food)
- Nutrient co-occurrence matrix
- Before & After plate comparison

---

## Environment Variables

```bash
# .env.local (never commit)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Same two variables in Vercel dashboard: Project → Settings → Environment Variables.

---

## Cold-Start Prompts

### General: pick up where we left off

```
Read PROJECT_STATE.md and PLAN.md before starting.

This is a nutrition web app: Next.js 16 + Supabase + Vercel, deployed at Vercel,
source at github.com/danzhig/nutrition-platform. The database has 212 foods × 50 nutrients.
Two features are live: an interactive heatmap and a meal planner. Supabase Auth is live.

Tell me the current phase, what's done, and what's next. Ask before writing code.
```

### Add a new feature

```
Read PROJECT_STATE.md and PLAN.md before starting.

I want to add: [DESCRIBE FEATURE]

Before writing any code:
1. Which existing files will you modify and what changes?
2. What new files are needed?
3. Does this need a new Supabase query, table, or is it front-end only?

Wait for my approval before writing code.
```
