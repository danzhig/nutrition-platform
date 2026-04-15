# Nutrition Platform — Project State

**Last updated:** 2026-04-14  
**Current phase: App build — Phase 1 (Foundation & Deploy)**

---

## What Is This Project

A public-facing nutrition web app built on **Next.js 14 + Supabase + Vercel**, source-controlled on **GitHub**. The database layer is fully complete (212 foods × 39 nutrients). The app is now being built on top of it. First deployed feature: an interactive heatmap table showing all foods × all nutrients, color-coded by relative nutrient density.

---

## Current Completion Status

| Component | Status |
|---|---|
| Schema (all 6 tables, indexes, RLS) | ✅ Complete |
| Reference data (nutrient categories, nutrients, food categories) | ✅ Complete |
| Food data — all 10 batches (212 foods × 39 nutrients) | ✅ Complete |
| Combined seed file (`sql/seed_all.sql`) | ✅ Complete |
| Status tracker | ✅ Complete |
| Reference CSVs | ✅ Complete |
| **Next.js app scaffold** | ⬜ Not started |
| **GitHub repo** | ⬜ Not started |
| **Supabase project + database deployed** | ⬜ Not started |
| **Vercel project connected to GitHub** | ⬜ Not started |
| **MVP Heatmap Table** | ⬜ Not started |

**Total food_nutrients rows: 8,268** (212 foods × 39 nutrients ✓)

---

## Authoritative Deliverable Files

### Deploy to Supabase (run in this order)
1. **`sql/schema.sql`** — Creates all 6 tables, indexes, Row Level Security policies
2. **`sql/seed_all.sql`** — Inserts all reference data + all 212 foods + all 8,268 nutrient rows

Verify after seeding: `SELECT COUNT(*) FROM food_nutrients;` → **8,268**

### App source (to be created)
- All app files live in the GitHub repo root (Next.js project)
- `.env.local` — Supabase URL + anon key (never committed; set in Vercel dashboard too)

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

- [ ] **1a. Scaffold Next.js app** — `npx create-next-app@latest nutrition-platform --typescript --tailwind --app` locally
- [ ] **1b. Create GitHub repo** — `nutrition-platform`, push scaffold to `main`
- [ ] **1c. Create Supabase project** — new project at supabase.com, copy URL + anon key
- [ ] **1d. Deploy database** — run `sql/schema.sql` then `sql/seed_all.sql` in Supabase SQL editor; verify 8,268 rows
- [ ] **1e. Connect Vercel** — import GitHub repo, add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars
- [ ] **1f. Build MVP heatmap** — `lib/supabase.ts`, `lib/fetchHeatmapData.ts`, `lib/colorScale.ts`, `components/HeatmapTable.tsx`, `components/HeatmapCell.tsx`, `components/CategoryFilter.tsx`
- [ ] **1g. Confirm live URL** — push to `main`, verify Vercel deployment, test heatmap end-to-end

### Phase 2 — Heatmap Polish (after Phase 1 ships)
- Food row click → slide-in detail panel
- % RDA in hover tooltips
- Mobile-responsive collapse (single-nutrient ranked list on small screens)
- Nutrient name tooltips from `nutrients.description`

### Phase 3 and beyond — see PLAN.md Build Phases section

---

## Key Architecture Decisions

| Decision | What | Why |
|---|---|---|
| Framework | Next.js 14 App Router | Native Vercel target; server + client components |
| Styling | Tailwind CSS | Rapid color-scale and layout work without custom CSS overhead |
| Data client | `@supabase/supabase-js` | Auto-typed from schema; anon key safe for public read |
| Heatmap normalization | Per-column min/max | Ensures color is meaningful within each nutrient regardless of unit scale |
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
