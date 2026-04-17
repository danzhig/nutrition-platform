# Nutrition Platform — Project State

**Last updated:** 2026-04-17  
**Current phase: Phase 2 — Heatmap polish + Data expansion**

---

## What Is This Project

A public-facing nutrition web app built on **Next.js 16 + Supabase + Vercel**, source-controlled on **GitHub**. The database layer is fully complete (212 foods × 39 nutrients). The app is now being built on top of it. First deployed feature: an interactive heatmap table showing all foods × all nutrients, color-coded by relative nutrient density.

---

## Current Completion Status

| Component | Status |
|---|---|
| Schema (all 6 tables, indexes, RLS) | ✅ Complete |
| Reference data (nutrient categories, nutrients, food categories) | ✅ Complete |
| Food data — all 10 batches (212 foods × 39 nutrients) | ✅ Complete |
| **Amino acids (9 EAAs), Glycemic Index, Antioxidant Capacity** | ✅ Complete — 2,332 new rows across 212 foods |
| Combined seed file (`sql/seed_all.sql`) | ✅ Complete |
| Extended seed file (`sql/seed_amino_acids_gi_antioxidant.sql`) | ✅ Complete — run after seed_all.sql |
| Status tracker | ✅ Complete — updated to 50/50 nutrients per food |
| Reference CSVs | ✅ Complete — nutrients_list.csv updated to 50 nutrients |
| **Next.js app scaffold** | ✅ Complete |
| **GitHub repo** | ✅ Complete — github.com/danzhig/nutrition-platform |
| **Supabase project + database deployed** | ✅ Complete — 8,268 rows verified |
| **Vercel project connected to GitHub** | ✅ Complete — auto-deploys on push to `main` |
| **MVP Heatmap Table** | ✅ Live — all 212 foods, dark mode, column sort, filters, search |
| **Nutrient Avg Profile Sidebar** | ✅ Live — all 50 nutrients grouped, color-coded avg across filtered foods |

**Total food_nutrients rows: 10,600** (212 foods × 50 nutrients — after running extended seed)
- Base: 8,268 rows (212 × 39 original nutrients)
- Extended: +2,332 rows (212 × 11 new: 9 amino acids + GI + antioxidant capacity)

---

## Authoritative Deliverable Files

### Deploy to Supabase (run in this order)
1. **`sql/schema.sql`** — Creates all 6 tables, indexes, Row Level Security policies
2. **`sql/seed_all.sql`** — Inserts all reference data + all 212 foods + all 8,268 nutrient rows
3. **`sql/seed_amino_acids_gi_antioxidant.sql`** — Adds 2 nutrient categories, 11 nutrients (9 EAAs + GI + antioxidant), and 2,332 food_nutrient rows

Verify after seeding: `SELECT COUNT(*) FROM food_nutrients;` → **10,600**

### App source
- All app files live in the GitHub repo root (Next.js 16 project)
- `.env.local` — Supabase URL + anon key (never committed; also set in Vercel dashboard)

### Human-readable reference
- **`reference/food_list.csv`** — All 212 foods with category, batch, priority
- **`reference/nutrients_list.csv`** — All 39 nutrients with units, categories, descriptions
- **`reference/food_categories.csv`** — All 15 food categories with descriptions
- **`status_tracker.csv`** — Per-food completion log (all 212 marked complete)
- **`ideas.md`** — Full visualization roadmap for future features

### Planning & architecture
- **`PLAN.md`** — Tech stack, repo structure, deployment workflow, build phases, component design

---

## Prioritized Next Steps

### Phase 1 — Foundation & Deploy (do these in order)

- [x] **1a. Scaffold Next.js app** — Done (Next.js 16, TypeScript, Tailwind v4, App Router)
- [x] **1b. Create GitHub repo** — Done (github.com/danzhig/nutrition-platform, pushed to `main`)
- [x] **1c. Create Supabase project** — Done
- [x] **1d. Deploy database** — Done (`sql/schema.sql` + `sql/seed_all.sql`; 8,268 rows verified)
- [x] **1e. Connect Vercel** — Done (env vars set, auto-deploy active)
- [x] **1f. Build MVP heatmap** — Done (`lib/supabase.ts`, `lib/fetchHeatmapData.ts`, `lib/colorScale.ts`, `lib/portionSizes.ts`, `lib/filterConstants.ts`, `components/HeatmapTable.tsx`, `components/HeatmapCell.tsx`, `components/FilterPanel.tsx`, `types/nutrition.ts`)
- [x] **1g. Confirm live URL** — Done; heatmap loads all 212 foods

### Phase 2 — Heatmap Polish (current)
- [x] Dark mode theme (slate-900 base, all components updated)
- [x] P10/P90 percentile colour scale (replaces min/max — outliers no longer dominate)
- [x] Per-serving toggle with transparent Serving column (all 212 foods, p10/p90 recalculated per-serving)
- [x] Slide-out filter panel (left edge tab, backdrop close, active filter badge, reset button)
- [x] Multi-select food category + nutrient group filters (select/deselect all, min-1 enforced, count badge)
- [x] Nutrient average profile sidebar — vertical column of all 50 nutrients right of the table, color-coded by avg value across currently visible foods, grouped by category, updates with food filters
- [ ] Food row click → slide-in detail panel
- [ ] % RDA in hover tooltips
- [ ] Mobile-responsive collapse (single-nutrient ranked list on small screens)
- [ ] Nutrient name tooltips from `nutrients.description`

### Changelog

#### 2026-04-15 — Nutrient expansion: amino acids, glycemic index, antioxidant capacity

New file: `sql/seed_amino_acids_gi_antioxidant.sql` — run after `seed_all.sql`.

**9 Essential Amino Acids (nutrient IDs 40–48, unit: mg/100g, category: Amino Acid)**
All sourced from USDA FoodData Central SR Legacy. Values represent mg per 100g raw food weight.
Histidine, Isoleucine, Leucine, Lysine, Methionine, Phenylalanine, Threonine, Tryptophan, Valine.
Oils & fats have values of 0 (genuinely no protein). Herbs/spices carry values reflecting their
protein content (e.g. cumin 17.8g protein/100g → substantial amino acid values).

**Glycemic Index (nutrient ID 49, unit: GI score, category: Food Metric)**
Glucose reference scale (glucose = 100). Source: Foster-Powell et al. 2002 / Atkinson et al. 2008
International Tables. Values represent the cooked/prepared form of the food (grain and legume GI
values reflect cooked state even though nutrient data is raw weight). NULL for: oils, fats, meats,
fish, poultry, eggs, hard cheeses, butter, cream — these have negligible carbohydrate and a GI
cannot be meaningfully measured.

**Antioxidant Capacity (nutrient ID 50, unit: mmol/100g, category: Food Metric)**
FRAP method. Source: Carlsen et al. 2010 Nutrition Journal. All 212 foods carry a value — even
low-antioxidant foods (refined grains, dairy) have small measured values. Key highlights:
- Ground cinnamon: 139.0 mmol/100g (highest in database)
- Ground turmeric: 127.68 mmol/100g
- Dried thyme: 75.65 mmol/100g, cumin: 76.8 mmol/100g, oregano: 63.2 mmol/100g
- Walnuts: 21.9 mmol/100g, pecans: 17.6 mmol/100g, flaxseeds: 19.0 mmol/100g
- Berries: blueberry 9.19, raspberry 6.60, blackberry 5.75, pomegranate 4.42

#### 2026-04-15 — Portion size corrections (`lib/portionSizes.ts`)
All data is stored per 100g raw/uncooked. The per-serving toggle multiplies by `portionGrams / 100`, so overstated dry portions inflated per-serving values 3–4×.

**Dry legumes (IDs 77–82, 84–87, 90–91):** Changed from "1 cup dry" (~170–210g) to "¼ cup dry" (~43–52g). 1 cup dry beans yields ~3 cups cooked — far above a standard serving. ¼ cup dry → ~½ cup cooked is the USDA reference serving.

**Whole/dry grains (IDs 110–112, 116, 119–120, 122–126):** Changed from "1 cup dry" (~140–200g) to "¼ cup dry" (~35–50g). 1 cup dry rice/barley/etc. yields 3+ cups cooked. ¼ cup dry → ~¾ cup cooked is a standard serving.

**Rolled oats (ID 113):** Changed from "1 cup dry" (81g) to "½ cup dry" (40g). ½ cup dry yields ~1 cup cooked oatmeal — the standard bowl.

**Quinoa (ID 110):** Changed from "½ cup dry" (85g) to "¼ cup dry" (43g). ½ cup dry quinoa yields ~1.5 cups cooked; ¼ cup dry → ~¾ cup cooked is a standard serving.

**Flours (IDs 114–115, 117–118, 121):** Changed from "1 cup" (~100–125g) to "¼ cup" (~25–30g). Flours are used as ingredients; ¼ cup is the standard nutrition-label serving.

**Unchanged:** Edamame (83, cooked serving), Tofu (88), Tempeh (89), Pasta (127, already at 2 oz dry / 85g).

### Phase 3 and beyond — see PLAN.md Build Phases section

---

## Key Architecture Decisions

| Decision | What | Why |
|---|---|---|
| Framework | Next.js 14 App Router | Native Vercel target; server + client components |
| Styling | Tailwind CSS | Rapid color-scale and layout work without custom CSS overhead |
| Data client | `@supabase/supabase-js` | Auto-typed from schema; anon key safe for public read |
| Heatmap normalization | Per-column P10/P90 percentile | Outliers (e.g. liver B12, dried spices) don't compress all other foods to grey |
| No auth for MVP | Public read only | Core exploration value requires zero friction; auth layer added in Phase 4+ |
| NULL vs 0 | NULL = unavailable; 0 = genuinely none | Critical for correct color encoding — NULL renders as neutral grey, not red |

---

## Database Schema Summary

```
nutrient_categories  (4 rows)    — Macronutrients, Vitamins, Minerals, Fatty Acids
nutrients            (39 rows)   — All nutrients with unit, category, description
food_categories      (15 rows)   — Fruits, Vegetables, Meat, Dairy, etc.
foods               (212 rows)   — Each food with name, category, USDA FDC ID
food_nutrients     (8,268 rows)  — food_id × nutrient_id × value_per_100g
food_data_status    (212 rows)   — Compilation log (internal use)
```

---

## How to Hand This Off to a New LLM

> "This is a nutrition web app. Read PROJECT_STATE.md first, then PLAN.md for full architecture and build phases. The database is fully built — sql/schema.sql and sql/seed_all.sql are the deploy files. The app is Next.js 14 + Supabase + Vercel, source on GitHub. Current phase: [your specific task]. The next step is [your specific task]."
