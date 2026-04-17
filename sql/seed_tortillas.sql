-- ============================================================
--  TORTILLAS — Seed File
--  Run AFTER seed_all.sql AND seed_amino_acids_gi_antioxidant.sql
--
--  Adds 2 foods to the 'Grains & Cereals' category:
--    217. Corn Tortilla    — USDA SR Legacy FDC 175036
--    218. Flour Tortilla   — USDA SR Legacy FDC 175037
--
--  All values per 100 g as-purchased (ready-to-eat).
--
--  Sources:
--    Macros/micros/aminos  — USDA FoodData Central SR Legacy
--                            (primary FDC IDs above)
--    Glycemic Index        — Atkinson, Foster-Powell & Brand-Miller,
--                            Diabetes Care 2008 31(12):2281–2283
--                            Corn: GI = 52 (nixtamalized white)
--                            Flour: GI = 30 (Mexican wheat tortilla)
--    Antioxidant (FRAP)    — Estimated from Carlsen et al. 2010
--                            (Nutrition Journal 9:3) grain-category
--                            analogues; no direct tortilla entry.
--                            Corn ≈ 0.6, Flour ≈ 0.4 mmol/100 g.
--    Iodine                — USDA/FDA/ODS-NIH Iodine DB Release 4
--                            (2024). Corn: 0.3 mcg, Flour: 1.1 mcg.
--    Chromium              — Not reliably measured for either food
--                            in any published database; stored as 0.
-- ============================================================

-- Reset sequences in case of sync issues
SELECT setval('foods_id_seq', (SELECT MAX(id) FROM foods));

-- ── 1. Food rows ──────────────────────────────────────────────

INSERT INTO foods (name, food_category_id, description, is_raw, data_source)
VALUES
  (
    'Corn Tortilla',
    (SELECT id FROM food_categories WHERE name = 'Grains & Cereals'),
    'Ready-to-eat corn tortilla made from nixtamalized masa (lime-treated white corn). Values per 100 g.',
    FALSE,
    'USDA FoodData Central SR Legacy FDC 175036'
  ),
  (
    'Flour Tortilla',
    (SELECT id FROM food_categories WHERE name = 'Grains & Cereals'),
    'Ready-to-eat wheat flour tortilla made from enriched white flour. Values per 100 g.',
    FALSE,
    'USDA FoodData Central SR Legacy FDC 175037'
  );


-- ── 2. Nutrient values (IDs 1–39) ────────────────────────────
-- Format: (food_id, nutrient_id, value_per_100g)
-- Nutrient order: Cal Water Prot Fat Carb Fibre Sug
--   SatF MUFA PUFA O3 O6 TransF Chol
--   Ca Fe Mg P K Na Zn Cu Mn Se I Cr
--   VitA VitC VitD VitE VitK B1 B2 B3 B5 B6 Fol B12 Choline

INSERT INTO food_nutrients (food_id, nutrient_id, value_per_100g)
SELECT f.id, v.nid, v.val
FROM (VALUES
  -- ── Corn Tortilla ──────────────────────────────────────────
  --    Macronutrients
  ('Corn Tortilla',  1,  218.0 ),   -- Calories kcal
  ('Corn Tortilla',  2,  45.89 ),   -- Water g
  ('Corn Tortilla',  3,  5.70  ),   -- Protein g
  ('Corn Tortilla',  4,  2.85  ),   -- Total Fat g
  ('Corn Tortilla',  5,  44.64 ),   -- Carbohydrates g
  ('Corn Tortilla',  6,  6.30  ),   -- Dietary Fibre g
  ('Corn Tortilla',  7,  0.88  ),   -- Total Sugars g
  --    Fatty acids
  ('Corn Tortilla',  8,  0.453 ),   -- Saturated Fat g
  ('Corn Tortilla',  9,  0.692 ),   -- Monounsaturated Fat g
  ('Corn Tortilla', 10,  1.419 ),   -- Polyunsaturated Fat g
  ('Corn Tortilla', 11,  0.034 ),   -- Omega-3 g (ALA 18:3)
  ('Corn Tortilla', 12,  1.385 ),   -- Omega-6 g (18:2 linoleic)
  ('Corn Tortilla', 13,  0.0   ),   -- Trans Fat g (not reported; effectively 0)
  ('Corn Tortilla', 14,  0.0   ),   -- Cholesterol mg
  --    Minerals
  ('Corn Tortilla', 15,  81.0  ),   -- Calcium mg (nixtamalization adds Ca)
  ('Corn Tortilla', 16,  1.23  ),   -- Iron mg
  ('Corn Tortilla', 17,  72.0  ),   -- Magnesium mg
  ('Corn Tortilla', 18,  314.0 ),   -- Phosphorus mg
  ('Corn Tortilla', 19,  186.0 ),   -- Potassium mg
  ('Corn Tortilla', 20,  45.0  ),   -- Sodium mg (with added salt)
  ('Corn Tortilla', 21,  1.31  ),   -- Zinc mg
  ('Corn Tortilla', 22,  0.154 ),   -- Copper mg
  ('Corn Tortilla', 23,  0.326 ),   -- Manganese mg
  ('Corn Tortilla', 24,  6.1   ),   -- Selenium mcg
  ('Corn Tortilla', 25,  0.3   ),   -- Iodine mcg
  ('Corn Tortilla', 26,  0.0   ),   -- Chromium mcg (not measured)
  --    Vitamins
  ('Corn Tortilla', 27,  0.0   ),   -- Vitamin A mcg RAE
  ('Corn Tortilla', 28,  0.0   ),   -- Vitamin C mg
  ('Corn Tortilla', 29,  0.0   ),   -- Vitamin D mcg
  ('Corn Tortilla', 30,  0.28  ),   -- Vitamin E mg AT
  ('Corn Tortilla', 31,  0.0   ),   -- Vitamin K mcg
  ('Corn Tortilla', 32,  0.094 ),   -- Thiamine mg
  ('Corn Tortilla', 33,  0.065 ),   -- Riboflavin mg
  ('Corn Tortilla', 34,  1.498 ),   -- Niacin mg
  ('Corn Tortilla', 35,  0.109 ),   -- Pantothenic Acid mg
  ('Corn Tortilla', 36,  0.219 ),   -- Vitamin B6 mg
  ('Corn Tortilla', 37,  5.0   ),   -- Folate mcg DFE (not enriched)
  ('Corn Tortilla', 38,  0.0   ),   -- Vitamin B12 mcg
  ('Corn Tortilla', 39,  13.3  ),   -- Choline mg

  -- ── Flour Tortilla ─────────────────────────────────────────
  --    Macronutrients
  ('Flour Tortilla',  1,  306.0 ),  -- Calories kcal
  ('Flour Tortilla',  2,  31.98 ),  -- Water g
  ('Flour Tortilla',  3,  8.20  ),  -- Protein g
  ('Flour Tortilla',  4,  7.99  ),  -- Total Fat g
  ('Flour Tortilla',  5,  49.38 ),  -- Carbohydrates g
  ('Flour Tortilla',  6,  3.50  ),  -- Dietary Fibre g
  ('Flour Tortilla',  7,  3.71  ),  -- Total Sugars g
  --    Fatty acids
  ('Flour Tortilla',  8,  2.924 ),  -- Saturated Fat g
  ('Flour Tortilla',  9,  1.751 ),  -- Monounsaturated Fat g
  ('Flour Tortilla', 10,  2.290 ),  -- Polyunsaturated Fat g
  ('Flour Tortilla', 11,  0.214 ),  -- Omega-3 g (ALA 18:3)
  ('Flour Tortilla', 12,  2.059 ),  -- Omega-6 g (18:2 linoleic)
  ('Flour Tortilla', 13,  0.052 ),  -- Trans Fat g (naturally occurring; 18:1t + 18:2t)
  ('Flour Tortilla', 14,  0.0   ),  -- Cholesterol mg
  --    Minerals
  ('Flour Tortilla', 15,  146.0 ),  -- Calcium mg (enriched flour + baking powder)
  ('Flour Tortilla', 16,  3.63  ),  -- Iron mg (enriched flour)
  ('Flour Tortilla', 17,  22.0  ),  -- Magnesium mg
  ('Flour Tortilla', 18,  206.0 ),  -- Phosphorus mg
  ('Flour Tortilla', 19,  125.0 ),  -- Potassium mg
  ('Flour Tortilla', 20,  736.0 ),  -- Sodium mg (salt + leavening agents)
  ('Flour Tortilla', 21,  0.53  ),  -- Zinc mg
  ('Flour Tortilla', 22,  0.104 ),  -- Copper mg
  ('Flour Tortilla', 23,  0.538 ),  -- Manganese mg
  ('Flour Tortilla', 24,  22.3  ),  -- Selenium mcg (enriched wheat flour)
  ('Flour Tortilla', 25,  1.1   ),  -- Iodine mcg (iodized salt contribution)
  ('Flour Tortilla', 26,  0.0   ),  -- Chromium mcg (not measured)
  --    Vitamins
  ('Flour Tortilla', 27,  0.0   ),  -- Vitamin A mcg RAE
  ('Flour Tortilla', 28,  0.0   ),  -- Vitamin C mg
  ('Flour Tortilla', 29,  0.0   ),  -- Vitamin D mcg
  ('Flour Tortilla', 30,  0.0   ),  -- Vitamin E mg AT (alpha-toc = 0; gamma-toc present but not counted)
  ('Flour Tortilla', 31,  7.2   ),  -- Vitamin K mcg (phylloquinone)
  ('Flour Tortilla', 32,  0.503 ),  -- Thiamine mg (enriched)
  ('Flour Tortilla', 33,  0.282 ),  -- Riboflavin mg (enriched)
  ('Flour Tortilla', 34,  4.415 ),  -- Niacin mg (enriched)
  ('Flour Tortilla', 35,  0.562 ),  -- Pantothenic Acid mg
  ('Flour Tortilla', 36,  0.059 ),  -- Vitamin B6 mg
  ('Flour Tortilla', 37,  149.0 ),  -- Folate mcg DFE (79 mcg folic acid × 1.7 + 15 food folate)
  ('Flour Tortilla', 38,  0.0   ),  -- Vitamin B12 mcg
  ('Flour Tortilla', 39,  7.9   )   -- Choline mg
) AS v(food_name, nid, val)
JOIN foods f ON f.name = v.food_name;


-- ── 3. Nutrient values (IDs 40–50): amino acids, GI, antioxidant ─

INSERT INTO food_nutrients (food_id, nutrient_id, value_per_100g)
SELECT f.id, v.nid, v.val
FROM (VALUES
  -- ── Corn Tortilla ──────────────────────────────────────────
  --    His  Ile   Leu   Lys   Met   Phe   Thr   Trp   Val   GI    AOX
  ('Corn Tortilla', 40,  177.0 ),  -- Histidine mg
  ('Corn Tortilla', 41,  208.0 ),  -- Isoleucine mg
  ('Corn Tortilla', 42,  711.0 ),  -- Leucine mg
  ('Corn Tortilla', 43,  163.0 ),  -- Lysine mg
  ('Corn Tortilla', 44,  121.0 ),  -- Methionine mg
  ('Corn Tortilla', 45,  285.0 ),  -- Phenylalanine mg
  ('Corn Tortilla', 46,  218.0 ),  -- Threonine mg
  ('Corn Tortilla', 47,  42.0  ),  -- Tryptophan mg
  ('Corn Tortilla', 48,  294.0 ),  -- Valine mg
  ('Corn Tortilla', 49,  52.0  ),  -- Glycemic Index (Atkinson 2008; nixtamalized white)
  ('Corn Tortilla', 50,  0.6   ),  -- Antioxidant mmol/100g (est. from Carlsen 2010 grain analogues)

  -- ── Flour Tortilla ─────────────────────────────────────────
  ('Flour Tortilla', 40,  117.0 ),  -- Histidine mg
  ('Flour Tortilla', 41,  182.0 ),  -- Isoleucine mg
  ('Flour Tortilla', 42,  362.0 ),  -- Leucine mg
  ('Flour Tortilla', 43,  116.0 ),  -- Lysine mg
  ('Flour Tortilla', 44,  93.0  ),  -- Methionine mg
  ('Flour Tortilla', 45,  265.0 ),  -- Phenylalanine mg
  ('Flour Tortilla', 46,  143.0 ),  -- Threonine mg
  ('Flour Tortilla', 47,  65.0  ),  -- Tryptophan mg
  ('Flour Tortilla', 48,  212.0 ),  -- Valine mg
  ('Flour Tortilla', 49,  30.0  ),  -- Glycemic Index (Atkinson 2008; Mexican wheat tortilla)
  ('Flour Tortilla', 50,  0.4   )   -- Antioxidant mmol/100g (est. from Carlsen 2010 grain analogues)
) AS v(food_name, nid, val)
JOIN foods f ON f.name = v.food_name;


-- ── Verify ────────────────────────────────────────────────────
-- SELECT f.name, COUNT(fn.*) AS nutrient_rows
-- FROM foods f
-- JOIN food_categories fc ON fc.id = f.food_category_id
-- LEFT JOIN food_nutrients fn ON fn.food_id = f.id
-- WHERE f.name IN ('Corn Tortilla', 'Flour Tortilla')
-- GROUP BY f.name, f.id ORDER BY f.id;
--
-- Expected: Corn Tortilla = 50, Flour Tortilla = 50
