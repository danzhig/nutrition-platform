# Nutrition Platform — Ideas & Roadmap

**Last updated:** 2026-04-19  
**Current state:** 218 foods × 50 nutrients. Live features: heatmap table, meal planner (sidebar + chart view + preset meals), Supabase Auth.

---

## Already Shipped

| Feature | Where |
|---|---|
| Heatmap table (sort, filter, per-serving, %DV mode) | Heatmap tab |
| Nutrient average profile sidebar | Heatmap tab |
| % Daily Value mode — 4 profiles + custom + UL warnings | Heatmap + Meal Planner |
| Meal planner — multi-meal plans, food picker, save/load | Meal Planner tab |
| %DV bar chart (50 nutrients, grouped, sorted, cap toggle) | Chart view |
| Category fulfilment radar (5-vertex SVG pentagon) | Chart view |
| Nutrient info cards (function, deficiency, excess) | Meal sidebar |
| Preset meal templates (29 meals, 6 categories) | Meal Planner tab |
| Saved meal templates (per user) | Meal Planner tab |
| Collapsible meal cards | Meal Planner tab |

---

## Chart Ideas — Priority Order

### 1. Nutrient Ranking View *(Phase 3 — next up)*

Pick any nutrient from a dropdown → horizontal ranked bar chart of all 218 foods from highest to lowest, bars colored by food category. Answers "what food has the most magnesium?" in one click.

**Interactivity:**
- Top-N filter (top 10 / 20 / 50 / all)
- Category filter ("show only vegetables")
- Per-100g vs per-serving toggle (uses `lib/portionSizes.ts`)
- Click a bar → open food detail panel (future)

**Complexity:** Low — one Recharts BarChart, front-end only, no new Supabase queries.

---

### 2. Scatter / Bubble Plot

Every food plotted on two nutrient axes (user picks X and Y), colored by food category, optional third nutrient as bubble size. Best for finding foods that excel in two things at once — e.g. protein vs iron, omega-3 vs omega-6.

**Interactivity:**
- X-axis, Y-axis dropdowns (any of 50 nutrients)
- Optional bubble size axis (third nutrient or calories)
- Hover → food name, category, exact values
- Category filter to highlight or isolate groups

**Complexity:** Medium — Recharts ScatterChart, all front-end, no new queries.

---

### 3. Food Comparison Chart

Pick 2–4 foods → side-by-side grouped bar chart of their full nutrient profile as %DV. Ideal for "salmon vs chicken vs tofu" decisions.

**Interactivity:**
- Food search picker (reuse FoodPickerModal logic)
- Toggle between grouped bars and radar overlay
- Per-100g vs per-serving mode

**Complexity:** Low-medium — front-end only, data already in-memory.

---

### 4. Macro Split Donut

For the active meal plan: a donut chart showing % of total calories from carbohydrates, protein, and fat. Inner ring = macro split; outer ring = which foods contribute to each macro.

**Complexity:** Low — pure calculation from existing meal totals, one Recharts PieChart.

---

### 5. Amino Acid Completeness

For a food or meal: a bar chart of all 9 essential amino acids shown as % of the WHO reference protein scoring pattern. Shows whether a protein source is complete or which EAAs are limiting.

**Why useful:** Plant-based meal planning — lets users see that combining rice + beans creates a complete protein profile.

**Complexity:** Low-medium — data already in DB (amino acids are one of the 50 nutrient groups), just needs a reference ratio table added to the app.

---

## Other Ideas (Lower Priority)

### Food Detail Panel
Click any food row in the heatmap → slide-in panel showing that food's full nutrient profile as a %DV bar chart, its category, description, and top-ranked nutrients. Planned in Phase 3.

### Nutrient Co-occurrence Matrix
A 50×50 triangular heatmap showing which nutrients tend to be high in the same foods (correlation coefficient per pair). Teaches users that zinc + iron co-occur in red meat, that vitamin D + omega-3 co-occur in fatty fish. Computationally heavy front-end; visually complex — Phase 4.

### Before & After Plate Comparison
Two meal plans side by side — current vs modified — with arrows showing which nutrients improved or declined and by how much. Useful for "what if I swap white rice for quinoa?" Phase 4.

### Category Average Bars
For any selected nutrient: a grouped bar chart showing the average value across all foods in each food category. Gives users high-level heuristics ("fish leads on B12, leafy greens lead on vitamin K"). Phase 4.

### Gap Analysis
After building a meal plan: automatically surface nutrients below a threshold (e.g. < 70% DV) and suggest the top 3 foods from the database that would best fill each gap. Requires more UI work but very high value. Phase 4.

---

## Quick-Reference Table

| Chart | Question It Answers | Complexity | Priority |
|---|---|---|---|
| Nutrient Ranking View | What food has the most of nutrient X? | Low | ⭐ Next up |
| Scatter / Bubble Plot | Which foods are high in both X and Y? | Medium | ⭐⭐ |
| Food Comparison Chart | How do 2–4 foods compare across all nutrients? | Low-Med | ⭐⭐ |
| Macro Split Donut | What's the carb/protein/fat breakdown of my plan? | Low | ⭐⭐ |
| Amino Acid Completeness | Is this food/meal a complete protein? | Low-Med | ⭐⭐ |
| Food Detail Panel | What's the full profile of this food? | Low | ⭐ Phase 3 |
| Co-occurrence Matrix | Which nutrients appear together in the same foods? | High | Phase 4 |
| Before & After Comparison | What changes if I swap a food? | Medium | Phase 4 |
| Category Average Bars | Which food category leads on nutrient X? | Low | Phase 4 |
| Gap Analysis | What am I missing and what should I eat? | High | Phase 4 |
