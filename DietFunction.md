# Diet Evaluator — Calculation Redesign (Revised Plan)

## The Current Problem

The existing model has a unit-mismatch problem. It treats the 1–5 rating as a proxy for absolute portion sizes (rating 1 = 0.25× serving, rating 5 = 2× serving) and then compares the implied total weight against a **monthly** food-weight budget drawn from `dailyWeightG × 30`. Meanwhile the nutrition bars compute per-day DV percentages from those same portion-based weights. The two halves answer different time-scale questions, making both misleading.

---

## The Proposed Model

### User-Facing Concept

The Diet Evaluator is a **monthly grocery profile builder**. Users add foods they regularly buy and eat, and rate each one by how often they eat it in a typical month (1 = rarely, 5 = very frequently). The app then answers: *if this were your diet every month, what would your daily nutrition look like?*

This reframes the tool away from meal planning ("what did I eat today?") toward long-run diet profiling ("what does my diet pattern look like?") — which is where it's most useful for finding structural gaps.

### Core Calculation Idea

Ratings, combined with each food's standard serving size, determine each food's **proportional claim** on a realistic daily food weight. Everything is scaled so the total always equals the DV profile's `dailyWeightG`, making the %DV bars meaningful regardless of how many foods are in the basket.

### Calculation Steps

**Step 1 — Compute raw weight for each food:**
```
rawWeight(food) = portionSize(food) × RATING_MULTIPLIER[rating]
```
Multipliers: 1→0.25×, 2→0.5×, 3→1.0×, 4→1.5×, 5→2.0×

These are unchanged from the current model. Serving sizes stay in the background — users never see them directly.

**Step 2 — Sum all raw weights:**
```
totalRawWeight = Σ rawWeight(food) for all selected foods
```

**Step 3 — Normalize each food to the daily weight budget:**
```
normalizedWeight(food) = (rawWeight(food) / totalRawWeight) × dailyWeightG
```
The normalized weights always sum exactly to `dailyWeightG`.

**Step 4 — Compute nutrient contributions:**
```
contribution(food, nutrient) = (nutrient_per_100g / 100) × normalizedWeight(food)
totalNutrient = Σ contribution(food, nutrient) for all selected foods
```

**Step 5 — Compute %DV:**
```
pctDV = totalNutrient / rdaTarget
```

### Example

Profile: `male-lowcarb`, `dailyWeightG = 2000 g`
Foods: Banana (rating 2, portion 120 g), Salmon (rating 4, portion 180 g)

```
rawWeight(Banana)  = 120 × 0.5 = 60 g
rawWeight(Salmon)  = 180 × 1.5 = 270 g
totalRawWeight     = 330 g

normalizedWeight(Banana) = (60 / 330) × 2000  =  364 g  → 18% of diet
normalizedWeight(Salmon) = (270 / 330) × 2000 = 1636 g  → 82% of diet

Nutrient contributions then use 364 g and 1636 g respectively.
```

---

## What This Fixes

| Problem | Old model | New model |
|---|---|---|
| Weight bar vs. nutrition bar mismatch | Monthly budget vs. daily DV | Both grounded to same `dailyWeightG` |
| Adding more foods dilutes results unexpectedly | More foods = more absolute mass | More foods = proportional redistribution |
| Time-scale ambiguity | Monthly weight, daily nutrition | Monthly frequency input → daily nutrition output, proportionally consistent |
| Calories and macros interpretability | Depends on portion choices | Always reflects a full `dailyWeightG` day |

---

## Design Decisions (Holes Resolved)

### 1. Replace the weight bar with a stacked diet composition bar

The old "Monthly target: 51 kg / Your diet implies: 2.1 kg (4%)" bar is removed. In its place: a **horizontal stacked bar** where each segment represents one food, sized by its normalized weight proportion. Hovering a segment shows the food name and its % share of the daily diet.

This makes the diet composition immediately readable. A user who rates Salmon 4 and Black Pepper 3 can see at a glance that salmon makes up ~82% of their diet mass and pepper ~3% — which is realistic and expected. The bar is the primary instrument for understanding *what your diet is mostly made of*, separate from whether the nutrients are balanced.

Label the bar: **"Diet composition — your daily food weight by proportion"**

### 2. Portion-size weighting is intentional and transparent

The fact that Chicken Breast at rating 1 (0.25× serving = ~50 g raw) outweighs Black Pepper at rating 5 (2× serving = ~10 g raw) is **by design**. The model reflects reality: no matter how often you rate pepper, it's a small fraction of dietary mass. The composition bar makes this visible without exposing gram math to the user.

The framing "monthly grocery profile" sets the right expectation: rating pepper 5 means you buy it frequently, not that it dominates your diet. The composition bar confirms this visually.

### 3. Suggestions algorithm remains valid

`computeDietSuggestions()` simulates adding a candidate food and evaluates how much it fills current nutrient gaps. In the new model, adding a food redistributes weight proportionally across all foods — the candidate's benefit is real but comes partly at the cost of diluting existing foods. This redistribution is the correct behavior: the user is choosing to swap some dietary proportion toward the new food. The suggestions panel is showing them which swaps help their gaps the most, which is exactly the right incentive.

The scoring function needs to be updated to use the normalized contribution math rather than the current absolute-portion math, but its conceptual structure stays the same.

### 4. Rating language: "How often do you eat this per month?"

The 1–5 rating is presented to users as monthly eating frequency:
- 1 = Rarely (a few times a month)
- 2 = Sometimes (weekly)
- 3 = Regularly (a few times a week)
- 4 = Often (most days)
- 5 = Staple (daily or multiple times a day)

The math behind the scenes converts this to portion-weighted proportions — users never see the multipliers. The composition bar gives them the feedback they need to understand the result without needing to understand the mechanics.

### 5. Empty basket and no-profile gates

- **No profile selected:** The nutrition panel and composition bar show a clear prompt ("Select a Daily Value profile to begin"). No bars, no numbers. `dailyWeightG` is required for normalization, so there is genuinely nothing to compute.
- **Profile set, basket empty:** `totalRawWeight = 0`, so the normalization is skipped. Return all nutrients at 0% with the existing "Add foods to see your actual coverage" message. No division by zero.
- **One food selected:** That food occupies 100% of the composition bar and 100% of `dailyWeightG`. This is correct — it means "my diet is exclusively this food." The composition bar makes this obvious. Ratings have no effect on total nutrition when only one food is present (they only affect proportions between multiple foods), which is a natural consequence of the model.

---

## Required Code Changes

### `lib/dietProfile.ts` — `computeDietProfile()`

Replace the current single-pass contribution loop with a two-pass normalized approach:

**Pass 1:** Compute `rawWeight(food)` for each food and sum to `totalRawWeight`.

**Pass 2:** For each food, compute `normalizedWeight = (rawWeight / totalRawWeight) × dailyWeightG`, then compute nutrient contributions from `normalizedWeight`.

Add guards:
- If `rdaProfile` is null → return empty result (no bars)
- If `selectedFoods` is empty → return all nutrients at 0% (with empty-state message trigger)

Expose per-food normalized weights in the return value so the composition bar can consume them without re-running the math.

### New: Diet composition bar component

A new component (e.g. `DietCompositionBar.tsx`) that replaces the old weight-target bar in `DietSelectedFoods.tsx`. It receives the array of `{ foodId, foodName, proportion }` objects derived from the normalized weights and renders:
- A horizontal stacked bar with one segment per food
- Each segment colored distinctly (cycle through a palette)
- On hover: tooltip showing food name + "X% of your daily diet"
- Below the bar: label "Diet composition — your monthly food profile, by weight proportion"

### `DietSelectedFoods.tsx`

Remove the monthly target bar and its associated calculation (`monthlyTarget`, `totalMonthlyWeightG`, `percentOfTarget`, color bands). Replace with `<DietCompositionBar>`.

### `lib/dietSuggestions.ts` — `computeDietSuggestions()`

Update the scoring function to use normalized weight math:
- Accept `dailyWeightG` as a parameter
- For each candidate food, simulate inserting it at rating 3 into the existing `selectedFoods` list, run the two-pass normalization, compute the resulting nutrition vector, and compare gap reduction against the current vector
- Score = reduction in total gap coverage after adding the candidate

### UI copy

- Rating buttons: Add a tooltip or label "How often do you eat this per month?" with the 1–5 frequency labels
- Diet panel header or composition bar: Add an info icon with tooltip explaining: "Rate foods by how often you eat them per month. Your ratings are scaled by typical serving sizes and normalized to your daily food weight, so the nutrition results always reflect a realistic full day of eating."
- Zero-state (no profile): Show a profile-select prompt instead of 0% bars
- `DietView.tsx` / `DietNutrientPanel.tsx`: Gate all calculation rendering on `rdaProfile !== null`

---

## Summary

The model converts monthly eating frequency ratings into proportional diet weights, normalizes to a realistic daily food mass, and produces %DV bars that reflect a coherent daily nutrition picture. The stacked composition bar replaces the broken monthly weight indicator and gives users an intuitive view of what their diet is made of. The math is hidden; the result is interpretable. The tool is reframed from "meal tracker" to "long-run diet profiler."
