# Nutrition Platform — Project State

**Last updated:** 2026-04-19  
**Current phase: Phase 2 complete → Phase 3 in progress**

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
| **MVP Heatmap Table** | ✅ Live — all 212 foods, dark mode, column sort, filters, search |
| **Nutrient Avg Profile Sidebar** | ✅ Live — all 50 nutrients grouped, color-coded avg across filtered foods |
| **% Daily Value mode** | ✅ Live — 4 built-in RDA profiles + custom; per-nutrient UL warnings; new color scale |
| **Supabase Auth + saved RDA profiles** | ✅ Live — email/password sign up/in; saved custom RDA profiles in `user_rda_profiles` |
| **Saved filter views** | ✅ Live — logged-in users can save/load/delete named filter sets |
| **Meal Planner** | ✅ Live — multi-meal plans, food picker, %DV bar chart sidebar, save/load/edit |
| **Saved meal templates** | ✅ Live — save individual meals as reusable templates; load into any plan |
| **Nutrient info cards** | ✅ Live — click any nutrient in the meal sidebar to see function, deficiency symptoms, and excess symptoms |

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
6. **Auth tables** — Auto-created by Supabase Auth. Then run these in SQL editor:

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
- [ ] Nutrient Ranking View — pick a nutrient, ranked bar chart of all 212 foods

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

## How to Hand This Off to a New LLM

> "This is a nutrition web app. Read PROJECT_STATE.md first, then PLAN.md for full architecture and build phases. The database is fully built — sql/schema.sql and sql/seed_all.sql are the deploy files. Four additional user tables (user_rda_profiles, user_filter_sets, meal_plans, saved_meals) are documented in PROJECT_STATE.md. The nutrients table has also been extended with body_role, deficiency_symptoms, and excess_symptoms columns. The app is Next.js 16 + Supabase + Vercel, source on GitHub (danzhig/nutrition-platform). Current phase: Phase 3. See PLAN.md for the next steps."
