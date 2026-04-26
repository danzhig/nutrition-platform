# Preset Meal Expansion Ideas

Generated from the 2026-04-26 audit of all 107 preset meals.
Execute these in future sessions to expand the library.

---

## 1. Snacks Category (5–6 meals)

**Why:** Zero snack options in the entire library despite having all the foods needed.

Suggested recipes (all use existing DB foods):

- **Apple & Almond Butter** — Apple (150g) + Almonds (30g)
- **Hard-Boiled Eggs & Avocado** — Egg (150g) + Avocado (80g) + Lemon (10g)
- **Trail Mix** — Almonds (25g) + Walnuts (20g) + PumpkinSeeds (15g) + Cranberry (20g)
- **Cottage Cheese & Berries** — CottageCheese (150g) + Strawberry (80g) + Blueberry (50g)
- **Edamame with Lemon** — Edamame (150g) + Lemon (15g)
- **Sardines & Cucumber** — Sardines (100g) + Cucumber (100g) + Lemon (20g) + Parsley (10g)

Keep all snacks under 350g total. No cooking oil or grain base — grab-and-go style.

---

## 2. Wraps & Tacos Category (4–5 meals)

**Why:** Corn Tortilla (food_id 217) and Flour Tortilla (food_id 218) are in the database but appear in zero presets.

Suggested recipes:

- **Chicken & Avocado Wrap** — FlourTortilla (64g) + ChickenBreast (150g) + Avocado (80g) + RomaineLettuce (40g) + Tomato (60g) + Lime (15g)
- **Black Bean Taco** — CornTortilla (52g, 2×26g) + BlackBeans (80g) + Avocado (80g) + Tomato (80g) + Lime (20g) + Jalapeño (20g)
- **Salmon Taco** — CornTortilla (52g) + Salmon (150g) + Avocado (80g) + Cucumber (60g) + Lime (20g) + Parsley (15g)
- **Turkey & Kale Wrap** — FlourTortilla (64g) + TurkeyBreast (150g) + Kale (60g) + Tomato (80g) + OliveOil (10g) + Garlic (8g)
- **Egg & Spinach Breakfast Wrap** — FlourTortilla (64g) + Egg (150g) + Spinach (60g) + Cheddar (30g) + Butter (10g)

Portion note: 1 large flour tortilla = 64g, 2 corn tortillas = 52g total.

---

## 3. Smoothies Category (4–5 meals)

**Why:** Distinct from juices — thick, whole-ingredient, higher calorie. We have WheyProtein (182), all nut milks, all fruit, and chia/hemp/flax seeds with no smoothie presets.

Suggested recipes:

- **Green Protein Smoothie** — AlmondMilk (240g) + Banana (120g) + Spinach (60g) + WheyProtein (35g) + ChiaSeeds (15g)
- **Tropical Mango Smoothie** — CoconutMilk (200g) + Mango (150g) + Pineapple (100g) + PassionFruit (50g) + HempSeeds (15g)
- **Berry Recovery Smoothie** — SoyMilk (240g) + Blueberry (100g) + Strawberry (100g) + Banana (80g) + WheyProtein (35g)
- **Avocado Banana Smoothie** — AlmondMilk (240g) + Avocado (100g) + Banana (100g) + Flaxseeds (15g) + Cinnamon (3g)
- **Peach Yogurt Smoothie** — PlainYogurt (200g) + Peach (150g) + Banana (80g) + HempSeeds (20g) + Ginger (3g)

Total weight 450–600g is fine for smoothies — they are full liquid meal replacements.

---

## 4. Breakfast Variety — Reduce Porridge Repetition

**Why:** 4 of 10 current breakfast presets are porridge/oatmeal-style. The category needs more savory options and uses cottage cheese nowhere despite it being a natural fit.

Suggested additions:

- **Shakshuka-Style Eggs** — Tomato (200g) + Egg (200g) + RedBellPepper (100g) + Onion (60g) + Garlic (10g) + Cumin (3g) + Paprika (3g)
- **Cottage Cheese & Fig Bowl** — CottageCheese (200g) + Fig (80g) + Walnuts (25g) + Cinnamon (2g)
- **Smoked Salmon Scramble** — Egg (200g) + Salmon (100g) + Spinach (60g) + Butter (10g)
- **Greek Yogurt & Date Bowl** — GreekYogurt (200g) + Date (40g) + Walnuts (25g) + Cinnamon (2g) + HempSeeds (15g)
- **Duck Egg & Avocado Plate** — DuckEgg (140g, 2 eggs) + Avocado (100g) + Tomato (80g) + Arugula (30g)

Adding 3–4 of these brings breakfast to 13–14 meals with a better savory/sweet split.

---

## 5. Underused Foods — Incorporate Into New or Existing Meals

**Why:** ~50 foods in the 218-food database appear in zero presets. Worth folding into new recipes.

Proteins never used in any preset:
- Venison (136), Bison (137) — could anchor a "Wild Game" category or standalone Bowls/Low Carb entries
- Anchovies (154) — natural in a Caesar upgrade or Mediterranean pasta
- Clams (161) — linguine alle vongole style pasta
- Squid (162) — stir-fry or Mediterranean bowl
- Lobster (157), Duck Egg (166), Quail Egg (167) — niche but add variety to High Protein / Breakfast

Fruits never used:
- Cranberry (26), PassionFruit (29), Guava (30), Plum (19), Apricot (20), Fig (22), Date (21), Cantaloupe (27), Honeydew (28)

Vegetables barely used:
- Artichoke (54), Radish (57), Parsnip (59), Okra (60), Jalapeño (61)
- Dandelion Greens (74), Beet Greens (75), Mustard Greens (76) — bitter greens salad or low-sug juice

Grains never used:
- Amaranth (122), Sorghum (125), Spelt Flour (121) — swap into bowls in place of quinoa/brown rice
- CornFlour/Masa (118) — polenta-style bowl

Dairy/oils never used:
- GoatMilk (180), Brie (181), CreamCheese (178) — cheese boards, salad toppings
- WalnutOil (196), FlaxseedOil (193) — cold dressings
- RiceMilk (187), CashewMilk (188) — smoothie bases

No new foods needed — design presets around what is already in the DB.

---

## Execution Order

1. Snacks — highest impact, easiest to build, no research needed
2. Wraps & Tacos — uses tortillas already in DB that currently appear nowhere
3. Smoothies — clear demand, straightforward recipes
4. Breakfast additions — fills the savory gap
5. Underused foods — most research-intensive, tackle last

Estimated new meals: ~25–28, bringing library from 107 → ~133
