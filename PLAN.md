# Nutrition Platform — Build Plan

**Last updated:** 2026-04-17  
**Phase:** Phase 2 — Heatmap polish

---

## Project Goal

Build and deploy a public-facing nutrition web app backed by a Supabase PostgreSQL database (212 foods × 39 nutrients). The app will be hosted on **Vercel**, source-controlled on **GitHub**, and will use the pre-built Supabase database as its data layer. The first deployed feature is an interactive **heatmap table** — a full-grid visualization where users can instantly see which foods are richest in which nutrients.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend framework | Next.js 16 (App Router) | React-based, built for Vercel; `use client` components for interactivity |
| Styling | Tailwind CSS | Utility-first; rapid layout and color-scale work |
| Data layer | Supabase (PostgreSQL) | Auto-generated REST API + `@supabase/supabase-js` client |
| Hosting | Vercel | Deploy on push to `main`; preview deploys on PRs |
| Source control | GitHub | Single repo; Vercel connected via GitHub App |
| Language | TypeScript | Types for food/nutrient data structures |

---

## Repository Structure (target)

```
nutrition-platform/          ← GitHub repo root
├── app/
│   ├── layout.tsx           ← Root layout, global styles
│   ├── page.tsx             ← Home page (heatmap table)
│   └── globals.css
├── components/
│   ├── HeatmapTable.tsx     ← Main heatmap component (filter state, sort, per-serving)
│   ├── HeatmapCell.tsx      ← Individual cell with color + tooltip
│   ├── FilterPanel.tsx      ← Slide-out filter & settings panel (left edge tab)
│   ├── NutrientSidebar.tsx  ← Vertical avg-profile sidebar (all 50 nutrients, right of table)
│   └── FoodDetailPanel.tsx  ← Slide-in panel on row click (Phase 2, not yet built)
├── lib/
│   ├── supabase.ts          ← Supabase client initialisation
│   ├── fetchHeatmapData.ts  ← Data fetching + P10/P90 normalization logic
│   ├── colorScale.ts        ← Per-column P10/P90 normalization → color
│   ├── filterConstants.ts   ← Shared FOOD_CATEGORY_LIST, NUTRIENT_GROUP_LIST
│   └── portionSizes.ts      ← Per-food serving sizes (all 212 foods)
├── types/
│   └── nutrition.ts         ← TypeScript interfaces
├── sql/                     ← Existing SQL files (deploy to Supabase)
│   ├── schema.sql
│   └── seed_all.sql
├── .env.local               ← SUPABASE_URL + SUPABASE_ANON_KEY (not committed)
├── .env.example             ← Template with variable names, no values
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Deployment Workflow

```
Local dev
   │
   ├─ git push → GitHub (main branch)
   │                  │
   │                  └─ Vercel GitHub App detects push
   │                              │
   │                              └─ Vercel builds + deploys
   │                                         │
   │                                         └─ App calls Supabase REST API
   │                                                    │
   │                                                    └─ Supabase PostgreSQL
   │
   └─ Pull Request → Vercel creates preview URL automatically
```

### One-time setup steps (in order)

1. **Create GitHub repo** — `nutrition-platform` (public or private)
2. **Scaffold Next.js app** — `npx create-next-app@latest` with TypeScript + Tailwind
3. **Push to GitHub** — connect local repo to remote
4. **Create Supabase project** — new project at supabase.com, copy URL + anon key
5. **Deploy database** — run `sql/schema.sql` then `sql/seed_all.sql` in Supabase SQL editor
6. **Verify database** — `SELECT COUNT(*) FROM food_nutrients;` → must return **8,268**
7. **Connect Vercel** — import GitHub repo in Vercel dashboard, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables
8. **Deploy** — Vercel auto-deploys on first connect; every `git push` to `main` re-deploys

---

## MVP Feature — Heatmap Table

### What it is

A full grid where **rows are foods** and **columns are nutrients**. Each cell is colored on a gradient:
- **Deep green** = high relative content (top of the column)
- **White/grey** = mid range
- **Deep red** = low or zero

The gradient is **normalized per column** — the darkest green always goes to the food with the highest absolute value for that nutrient. This ensures the color encoding is meaningful even when comparing nutrients with very different units (e.g. kcal vs. mcg).

### Why it's the right MVP

This view answers the most fundamental question of the tool — "which foods are richest in which nutrients?" — in a single glance. It is also the most technically straightforward visualization: one Supabase query, client-side normalization, CSS color mapping. No user state, no auth, no complex interactions. Ship it first.

### The Supabase Query

```sql
SELECT
  f.id        AS food_id,
  f.name      AS food_name,
  fc.name     AS category,
  n.id        AS nutrient_id,
  n.name      AS nutrient_name,
  n.unit,
  nc.name     AS nutrient_category,
  fn.value_per_100g
FROM food_nutrients fn
JOIN foods          f  ON f.id  = fn.food_id
JOIN food_categories fc ON fc.id = f.food_category_id
JOIN nutrients      n  ON n.id  = fn.nutrient_id
JOIN nutrient_categories nc ON nc.id = n.nutrient_category_id
ORDER BY fc.name, f.name, nc.name, n.name;
```

Returns ~8,268 rows. Reshape on the front end into a `Map<food_id, Map<nutrient_id, value>>` for O(1) cell lookups during render.

### Front-end normalization (colorScale.ts)

For each nutrient column, color is normalized to the **P10/P90 range** (not min/max). Outliers clamp to 0 or 1 rather than distorting the scale.

```
normalizedValue = clamp((value - p10) / (p90 - p10), 0, 1)  → 0.0 to 1.0
```
- `1.0` → darkest green
- `0.5` → mid (slate in dark mode)
- `0.0` → deep red
- `NULL` → `#1e293b` slate grey (data unavailable)

In per-serving mode, p10/p90 is recomputed using `value × (portionGrams / 100)` so the color scale reflects serving-sized amounts.

### Interactivity (MVP + near-term)

| Feature | Priority | Notes |
|---|---|---|
| Column header click → sort descending | MVP | Re-sort `foods` array by that nutrient value |
| Nutrient category toggle (All / Macros / Vitamins / Minerals / Fatty Acids) | MVP | Filter visible columns; re-normalize colors within visible set |
| Food category filter bar | MVP | Filter visible rows by food category (15 categories) |
| Search bar | MVP | Client-side filter on food name |
| Hover cell → tooltip (exact value + unit) | MVP | Show `value_per_100g` + unit from `nutrients.unit` |
| Click food row → detail panel | V2 | Slide-in panel with full 39-nutrient profile for that food |
| % Daily Recommended Amount in tooltip | V2 | Requires RDA constants object in front end (no DB change needed) |

### Component breakdown

**`HeatmapTable.tsx`** — orchestrator
- Owns filter state (category, nutrient group, search, sort column)
- Receives raw query data as prop, passes filtered/sorted slice to rows

**`HeatmapCell.tsx`** — single cell
- Props: `value`, `normalizedValue`, `unit`, `nutrientName`
- Renders a `<td>` with inline background color from `colorScale(normalizedValue)`
- Tooltip on hover via Tailwind `group`/`group-hover` or a lightweight tooltip lib

**`FilterPanel.tsx`** — slide-out settings panel
- Fixed to left edge; tab toggles open/close with backdrop
- Multi-select food category pills + nutrient group buttons
- Search input, per-serving toggle, reset footer
- Active filter count badge on the tab

**`FoodDetailPanel.tsx`** — Phase 2 slide-in (not yet built)
- Fixed-position panel, opens when a food row is clicked
- Shows food name, category, and a vertical bar chart of all 39 nutrients

---

## Database Schema Summary

Five production tables + one internal tracking table. Full DDL: `sql/schema.sql`.

```
nutrient_categories  (4 rows)    — Macronutrients, Vitamins, Minerals, Fatty Acids
nutrients            (39 rows)   — All nutrients with unit, category, description
food_categories      (15 rows)   — Fruits, Vegetables, Meat, Dairy, etc.
foods               (212 rows)   — Each food with name, category, USDA FDC ID
food_nutrients     (8,268 rows)  — food_id × nutrient_id × value_per_100g
food_data_status    (212 rows)   — Compilation log (internal use, RLS restricted)
```

### Key data decisions

| Decision | What was chosen | Why |
|---|---|---|
| Nutrient expression | Per 100g, raw/uncooked | Standardized baseline; cooking multipliers can be added later |
| NULL vs 0 | NULL = unavailable; 0 = genuinely none | Oils correctly have 0 minerals, not NULL |
| Vitamin A unit | mcg RAE | Modern standard accounting for beta-carotene conversion |
| Folate unit | mcg DFE | Accounts for synthetic vs food-form bioavailability differences |
| RLS | Public read on all content tables | Ready for public site without exposing food_data_status |

Full data reference: `reference/` folder (food_list.csv, nutrients_list.csv, food_categories.csv)

---

## The 50 Nutrients

**Macronutrients (7):** Calories, Protein, Total Fat, Carbohydrates, Dietary Fiber, Total Sugar, Water  
**Fatty Acids (7):** Saturated Fat, Monounsaturated Fat, Polyunsaturated Fat, Omega-3 (ALA), Omega-6 (LA), Trans Fat, Cholesterol  
**Vitamins (13):** A (RAE), C, D, E, K, B1, B2, B3, B5, B6, B9 (Folate), B12, Choline  
**Minerals (12):** Calcium, Iron, Magnesium, Phosphorus, Potassium, Sodium, Zinc, Copper, Manganese, Selenium, Iodine, Chromium  
**Amino Acids (9):** Histidine, Isoleucine, Leucine, Lysine, Methionine, Phenylalanine, Threonine, Tryptophan, Valine  
**Food Metrics (2):** Glycemic Index, Antioxidant Capacity  

---

## Build Phases

### Phase 1 — Foundation & Deploy ✅ Complete
1. Scaffold Next.js 16 app (TypeScript, Tailwind v4)
2. Create GitHub repo (danzhig/nutrition-platform), push scaffold
3. Create Supabase project, run `schema.sql` + `seed_all.sql`
4. Connect Vercel to GitHub repo, set env vars
5. Build and ship MVP heatmap table (column sort, category filter, search, dark mode)
6. Fix Supabase 1,000-row default limit with pagination

### Phase 2 — Heatmap Polish (current)
- [x] Dark mode theme (slate-900 base, all components)
- [x] P10/P90 percentile colour scale (replaces min/max)
- [x] Per-serving toggle with Serving column (p10/p90 recomputed per-serving)
- [x] Slide-out filter panel (left edge tab, backdrop, active badge, reset)
- [x] Multi-select food category + nutrient group (select/deselect all, count badge)
- [x] Nutrient average profile sidebar (all 50 nutrients, grouped, color-coded by avg across visible foods)
- [ ] Food row click → detail panel (FoodDetailPanel.tsx)
- [ ] % RDA values in hover tooltips
- [ ] Mobile-responsive: collapse to single-nutrient ranked list on small screens
- [ ] Nutrient name tooltips (plain-English description from `nutrients.description`)

### Phase 3 — Nutrient Ranking View
- Pick a nutrient from a dropdown → ranked bar chart of all 212 foods
- Category filter + top-N selector
- Coloured bars by food category

### Phase 4 — My Day Builder
- Search + add foods with portion size slider
- Running nutrient total vs. RDA targets
- Progress bars per nutrient (green/yellow/red)
- Gap analysis: surface under-supplied nutrients + top food suggestions to fill each gap

### Phase 5 — Advanced Visualizations (from ideas.md)
- Bubble/scatter plot (2-nutrient axes)
- Radar / spider chart (nutritional fingerprint)
- Nutrient co-occurrence matrix
- Before & After plate comparison

---

## Environment Variables

```bash
# .env.local (never commit — add to .gitignore)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Set the same two variables in Vercel dashboard:
# Project → Settings → Environment Variables
```

---

## Cold-Start Prompts

### General: pick up where we left off

```
Read PROJECT_STATE.md, PLAN.md, and status_tracker.csv before starting.

This is a nutrition web app project. The database is fully built (212 foods × 39 nutrients).
The app is built in Next.js 16 (TypeScript + Tailwind), deployed on Vercel, source on GitHub
(danzhig/nutrition-platform), backed by Supabase PostgreSQL. Dark mode is the established theme.

Live-file contract:
- Update PROJECT_STATE.md "Current Completion Status" and "Prioritized Next Steps" after any
  meaningful chunk of work
- Update status_tracker.csv if you touch any food data
- List every new file you create at the end of your response

Tell me what is complete, what the next step is, and ask me to confirm before starting.
```

### Extend the heatmap

```
Read PROJECT_STATE.md and PLAN.md before starting.

I want to add [DESCRIBE FEATURE — e.g. "% RDA in hover tooltips" or "food row click detail panel"].

Before writing any code:
1. Identify which existing components you will modify (file paths + what changes)
2. Identify any new components or utility files needed
3. Describe the data flow (does this need a new Supabase query, or is it front-end only?)

Live-file contract: list all created/modified files at the end of your response.
Wait for my approval before writing code.
```

### Add a new visualization

```
Read PROJECT_STATE.md, PLAN.md, and sql/schema.sql before starting.

I want to build [DESCRIBE VIEW — e.g. "a nutrient ranking bar chart page"].

Before writing code:
1. Write the Supabase query you will use
2. Describe the component structure
3. Describe the expected URL route (e.g. /rankings)
4. Show the TypeScript interfaces for the data shape

Live-file contract: update PROJECT_STATE.md Phase table when the view is shipped.
Wait for my approval before writing code.
```

### Deploy / infrastructure

```
Read PROJECT_STATE.md before starting.

I need help with [DESCRIBE — e.g. "connecting Vercel to the GitHub repo" or
"setting up Supabase environment variables in Vercel"].

Walk me through the steps. Do not write any files. After I confirm each step is done,
move to the next one.
```

---

## Future Extensions (post-MVP, from ideas.md)

- ~~Amino acid profiles (9 essential AAs)~~ ✅ Done — IDs 40–48
- ~~Glycemic index table~~ ✅ Done — ID 49
- ~~Antioxidant capacity~~ ✅ Done — ID 50 (mmol/100g FRAP)
- Allergen flags junction table
- Cooking-state variants (separate `foods` rows with `is_raw = FALSE`)
- Portion sizes table (enables per-serving toggle in ranking charts)
- User accounts + saved plates (Supabase Auth)
- Recipe builder (recipes table referencing foods with ingredient quantities)
