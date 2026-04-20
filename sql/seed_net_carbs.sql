-- ============================================================
--  Net Carbohydrates — add nutrient + compute values
--  Formula: Net Carbs = MAX(0, Total Carbohydrates − Dietary Fibre)
--
--  Run ONCE against your Supabase database.
--  Safe to re-run: the INSERT uses ON CONFLICT DO NOTHING.
--
--  After running, the app will:
--    • Show  "Net Carbohydrates" in the heatmap and meal planner
--    • Hide  "Carbohydrates" from display (still present in DB for
--             cross-check: verify any food row with:
--             SELECT carbs, fiber, net_carbs for that food_id)
-- ============================================================

-- ── Step 1: Insert the Net Carbohydrates nutrient ──────────────
INSERT INTO nutrients (name, common_name, unit, nutrient_category_id, description)
VALUES (
  'Net Carbohydrates',
  NULL,
  'g',
  (SELECT id FROM nutrient_categories WHERE name = 'Macronutrient'),
  'Total carbohydrates minus dietary fibre. Represents the carbohydrates that directly impact blood glucose and are counted on low-carb or ketogenic diets.'
)
ON CONFLICT (name) DO NOTHING;

-- ── Step 2: Compute and insert net carb values for every food ──
-- Uses GREATEST(0, ...) so fibre-rich foods never go negative.
-- COALESCE handles the rare case where a food has carbs but no fibre
-- entry (treats missing fibre as 0 — the conservative assumption).
INSERT INTO food_nutrients (food_id, nutrient_id, value_per_100g)
SELECT
  fn_carb.food_id,
  (SELECT id FROM nutrients WHERE name = 'Net Carbohydrates'),
  GREATEST(
    0,
    ROUND(
      (fn_carb.value_per_100g - COALESCE(fn_fiber.value_per_100g, 0))::numeric,
      2
    )
  )
FROM food_nutrients fn_carb
LEFT JOIN food_nutrients fn_fiber
  ON  fn_fiber.food_id    = fn_carb.food_id
  AND fn_fiber.nutrient_id = (SELECT id FROM nutrients WHERE name = 'Dietary Fibre')
WHERE fn_carb.nutrient_id = (SELECT id FROM nutrients WHERE name = 'Carbohydrates')
ON CONFLICT (food_id, nutrient_id) DO UPDATE
  SET value_per_100g = EXCLUDED.value_per_100g;

-- ── Step 3: Verification query (run after to spot-check) ───────
-- Expected highlights:
--   Avocado:     carbs 8.53  fibre 6.7   → net 1.83
--   Flaxseeds:   carbs 28.88 fibre 27.3  → net 1.58
--   Chia Seeds:  carbs 42.12 fibre 34.4  → net 7.72
--   Corn Tortilla: carbs 44.64 fibre 6.30 → net 38.34
--   Flour Tortilla: carbs 49.38 fibre 3.50 → net 45.88
--   White Rice:  carbs 80.59 fibre 1.3   → net 79.29
--
-- SELECT
--   f.name,
--   fn_c.value_per_100g  AS total_carbs,
--   fn_f.value_per_100g  AS fibre,
--   fn_n.value_per_100g  AS net_carbs,
--   ROUND((fn_c.value_per_100g - COALESCE(fn_f.value_per_100g,0))::numeric,2) AS check_calc
-- FROM foods f
-- JOIN food_nutrients fn_c ON fn_c.food_id = f.id
--   AND fn_c.nutrient_id = (SELECT id FROM nutrients WHERE name = 'Carbohydrates')
-- LEFT JOIN food_nutrients fn_f ON fn_f.food_id = f.id
--   AND fn_f.nutrient_id = (SELECT id FROM nutrients WHERE name = 'Dietary Fibre')
-- LEFT JOIN food_nutrients fn_n ON fn_n.food_id = f.id
--   AND fn_n.nutrient_id = (SELECT id FROM nutrients WHERE name = 'Net Carbohydrates')
-- ORDER BY fn_n.value_per_100g DESC;
