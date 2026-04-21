# Nutrition Platform — Project State

**Last updated:** 2026-04-20 (session 6)
**Current phase: Phase 3 in progress**

---

## What Is This Project

A public-facing nutrition web app built on **Next.js 16 + Supabase + Vercel**, source-controlled on **GitHub**. The database layer is fully complete (218 foods × 50 nutrients). The app has two main features: an interactive heatmap table and a meal planner.

---

## Current Completion Status

| Component | Status |
|---|---|
| Schema (all 6 tables, indexes, RLS) | ✅ Complete |
| Reference data (nutrient categories, nutrients, food categories) | ✅ Complete |
| Food data — all 10 batches (212 foods × 50 nutrients) | ✅ Complete |
| Supplement foods (4 supplements, new Supplements category) | ✅ Complete |
| Tortillas (Corn + Flour, all 50 nutrients) | ✅ Complete |
| Combined seed file (`sql/seed_all.sql`) | ✅ Complete |
| Extended seed file (`sql/seed_amino_acids_gi_antioxidant.sql`) | ✅ Complete |
| Supplements seed file (`sql/seed_supplements.sql`) | ✅ Complete |
| Breads & Tortillas seed file (`sql/seed_breads_and_tortillas.sql`) | ✅ Complete |
| **Next.js app scaffold** | ✅ Complete |
| **GitHub repo** | ✅ Complete — github.com/danzhig/nutrition-platform |
| **Supabase project + database deployed** | ✅ Complete — 10,600 rows verified |
| **Vercel project connected to GitHub** | ✅ Complete — auto-deploys on push to `main` |
| **Top-level tab rename** | ✅ Live — "Nutrient Heatmap" top-level tab renamed to "Data View"; now hosts a second-level tab bar (Nutrient Heatmap · Charts) |
| **Nutrient Ranking View** | ✅ Live — Charts tab: pick any nutrient → ranked bar chart of all 218 foods; N selector (50/100); top/bottom toggle; category filter; per-100g vs per-serving toggle; bars colored by food category |
| **Nutrient Scatter Plot** | ✅ Live — Charts tab (below Ranking): pick X + Y nutrient axes; optional bubble size (third nutrient); dots colored by food category (shared palette); clickable legend highlights/dims categories; per-100g vs per-serving toggle |
| **Net Carbohydrates** | ✅ Live — `Carbohydrates` hidden from display (kept in DB); `Net Carbohydrates` (= Carbs − Fibre) added as nutrient; all 4 RDA profiles updated; `sql/seed_net_carbs.sql` deployed |
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
| **Preset meal templates** | ✅ Live — 41 curated system meals across 8 categories (Juices, Salads, Pastas, Bowls, High Protein, Breakfast, Low Carb, Keto); expanded to 101 meals across 11 categories once `seed_preset_meals_expanded.sql` is run (adds Soups & Stews, Stir-Fries, Curries) |
| **Collapsible meal cards** | ✅ Live — ▸/▾ toggle on each meal card; loaded presets/templates appear at top, expanded; other meals collapse; header shows food count + total grams when collapsed |
| **Preset item enrichment fix** | ✅ Live — preset items resolved to full MealItem on load (food_name, mode, portion_grams, portion_label) via foodsById + getPortionSize |
| **Macro split donut** | ✅ Live (superseded — see updated entry above) |
| **Low Carb & Keto preset meals** | ✅ SQL ready (`sql/seed_preset_meals_lowcarb_keto.sql`) — 6 Low Carb + 6 Keto meals; run in Supabase SQL editor to activate |
| **Expanded preset meal library** | ✅ SQL ready (`sql/seed_preset_meals_expanded.sql`) — 60 additional meals (101 total); new categories: Soups & Stews (10), Stir-Fries (7), Curries (7); expanded Breakfast, Salads, Bowls, High Protein, Pastas, Low Carb, Keto, Juices; introduces ~80 previously unused foods including livers, shellfish, tempeh, tofu, duck, lamb, wild rice, buckwheat, bulgur, millet, barley, couscous, coconut milk, and all major herbs/spices |
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
| **Bacon preset name fix** | ✅ Fixed — `seed_preset_meals_lowcarb_keto.sql` corrected `'Bacon (pork)'` → `'Bacon (pork, raw)'` to match the foods table |

**Total foods: 218** (212 whole foods + 4 supplements + 2 tortillas)  
**Total food_nutrients rows: ~10,725** (212 foods × 50 nutrients + 25 supplement rows + 100 tortilla rows)

---

## Authoritative Deliverable Files

### Deploy to Supabase (run in this order)
1. **`sql/schema.sql`** — Creates all 6 base tables, indexes, Row Level Security policies
2. **`sql/seed_all.sql`** — Inserts all reference data + all 212 foods + original 8,268 nutrient rows
3. **`sql/seed_amino_acids_gi_antioxidant.sql`** — Adds 9 EAAs + GI + antioxidant capacity (2,332 rows)
4. **`sql/seed_supplements.sql`** — Adds Supplements category + 4 supplement foods (25 nutrient rows)
5. **`sql/seed_breads_and_tortillas.sql`** — Breads & tortillas in Grains & Cereals; currently Corn + Flour Tortilla (100 nutrient rows; add new bread types here)
6. **`sql/seed_net_carbs.sql`** — Inserts `Net Carbohydrates` nutrient + computes values for all 218 foods (Formula: MAX(0, Carbohydrates − Dietary Fibre); safe to re-run via ON CONFLICT DO NOTHING/UPDATE)
8. **`sql/seed_preset_meals.sql`** — Creates `preset_meals` table (public-read RLS) and inserts 29 curated preset meals (Juices, Salads, Pastas, Bowls, High Protein, Breakfast)
9. **`sql/seed_preset_meals_lowcarb_keto.sql`** — Adds 12 more preset meals: 6 Low Carb + 6 Keto (run after step 8)
10. **`sql/seed_preset_meals_expanded.sql`** — Adds 60 more preset meals across 11 categories: Soups & Stews, Stir-Fries, Curries + expanded existing categories (run after step 9)
10. **Auth tables** — Auto-created by Supabase Auth. Then run these in SQL editor:

```sql
-- Saved custom RDA profiles
CREATE TABLE user_rda_profiles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  values     jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE user_rda_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own RDA profiles"
  ON user_rda_profiles FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Saved filter views
CREATE TABLE user_filter_sets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  state      jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE user_filter_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own filter sets"
  ON user_filter_sets FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Meal plans
CREATE TABLE meal_plans (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  meals         jsonb       NOT NULL DEFAULT '[]',
  rda_selection text        NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own meal plans"
  ON meal_plans FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Saved individual meal templates
CREATE TABLE saved_meals (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  items      jsonb       NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE saved_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own saved meals"
  ON saved_meals FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### App source
- All app files live in the GitHub repo root (Next.js 16 project)
- `.env.local` — Supabase URL + anon key (never committed; also set in Vercel dashboard)

### Human-readable reference
- **`reference/food_list.csv`** — All 212 foods with category, batch, priority
- **`reference/nutrients_list.csv`** — All 50 nutrients with units, categories, descriptions
- **`reference/food_categories.csv`** — All 16 food categories with descriptions (incl. Supplements)
- **`status_tracker.csv`** — Per-food completion log (all 212 marked complete)
- **`ideas.md`** — Full visualization roadmap for future features

### Planning & architecture
- **`PLAN.md`** — Tech stack, repo structure, deployment workflow, build phases, component design

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

nutrients table now has 3 additional columns:
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
| `sql/seed_*.sql` | The same INSERT in the appropriate seed file | Future redeploys won't include the food |
| `reference/food_list.csv` | New row with id, name, category, batch, priority | Reference doc becomes stale |

**portionSizes.ts convention:**
- Use USDA standard reference amounts where available (e.g. 1 medium apple = 182g)
- For whole proteins: 1 breast/fillet = actual typical weight
- For cooked grains: use dry weight (the app stores values per 100g as-purchased)
- For supplements: `grams: 100, label: '1 serving'` (stored as per-label values, portion = 100)

#### 3. App code — OPTIONAL

| File | What to add | When needed |
|---|---|---|
| `sql/seed_preset_meals.sql` | New preset meal or add to existing | If the food is a good fit for a curated preset |

---

### Adding a New NUTRIENT

A nutrient has a row in `nutrients`, values in `food_nutrients` for every applicable food, and must be registered in the RDA profile system.

#### 1. Database (run in Supabase SQL editor)

```sql
-- Step 1: insert the nutrient
INSERT INTO nutrients (nutrient_name, unit, nutrient_category_id, description, body_role, deficiency_symptoms, excess_symptoms)
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
WHERE n.nutrient_name = 'Nutrient Name' AND f.name = 'Food Name';
```

#### 2. App code — REQUIRED

| File | What to add | Why it breaks without it |
|---|---|---|
| `lib/rdaProfiles.ts` → `BUILT_IN_PROFILES` | RDA value for all 4 profiles (`male-avg`, `female-avg`, `male-active`, `female-active`) | Nutrient shows no %DV bar; appears as 0% in all views |
| `lib/rdaProfiles.ts` → `NUTRIENT_BEHAVIORS` | `'Nutrient Name': 'normal'` (or `'limit'` or `'normal-with-ul'`) | Color scale falls back to default; may color backwards for limit nutrients |
| `lib/filterConstants.ts` → `NUTRIENT_GROUP_LIST` | Add to the appropriate group's `nutrients` array | Nutrient won't appear in the nutrient filter panel |
| `reference/nutrients_list.csv` | New row | Reference doc becomes stale |

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
| `reference/food_categories.csv` | New row | Reference doc becomes stale |

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
SELECT nutrient_name FROM nutrients ORDER BY nutrient_name;
```

---

## How to Hand This Off to a New LLM

> "This is a nutrition web app. Read PROJECT_STATE.md first, then PLAN.md for full architecture and build phases. The database is fully built — sql/schema.sql and seed files are the deploy files. The nutrients table has body_role, deficiency_symptoms, and excess_symptoms columns. The app is Next.js 16 + Supabase + Vercel, source on GitHub (danzhig/nutrition-platform). Current phase: Phase 3. **IMPORTANT: before adding any food, nutrient, or food category, read the 'Data Maintenance' section in PROJECT_STATE.md — multiple files must be updated in sync or things silently break.**"
