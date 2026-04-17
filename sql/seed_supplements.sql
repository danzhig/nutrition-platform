-- ============================================================
--  SUPPLEMENT FOODS — Seed File
--  Run AFTER schema.sql, seed_all.sql, and
--  seed_amino_acids_gi_antioxidant.sql.
--
--  Convention: supplements are stored with value_per_100g equal
--  to the per-serving label amount (i.e. "1 serving = 100g
--  equivalent"). portionSizes.ts sets portion_grams = 100 and
--  label = "1 tablet / softgel / capsule / serving" for each
--  supplement, so the meal planner multiplier = 100/100 = 1 and
--  the nutrient contribution equals the label value exactly.
--
--  Nutrients not in the database (Biotin, Lutein, Lycopene,
--  EPA individually, DHA individually) are omitted.
--
--  Source: supplement label photography.
-- ============================================================


-- ── 1. New food category ─────────────────────────────────────

INSERT INTO food_categories (name, description)
VALUES (
  'Supplements',
  'Dietary supplements. Values are per-serving amounts (treat each serving as the 100g reference unit).'
);


-- ── 2. Supplement foods ───────────────────────────────────────
-- is_raw = FALSE (processed/manufactured products)

INSERT INTO foods (name, food_category_id, description, is_raw, data_source)
VALUES
  (
    'Multivitamin',
    (SELECT id FROM food_categories WHERE name = 'Supplements'),
    'Daily multivitamin and mineral supplement. Values per 1 tablet.',
    FALSE,
    'Supplement label'
  ),
  (
    'Magnesium Bisglycinate',
    (SELECT id FROM food_categories WHERE name = 'Supplements'),
    'Buffered magnesium bisglycinate (magnesium bisglycinate, magnesium oxide) supplement. Values per 1 serving (200 mg elemental magnesium).',
    FALSE,
    'Supplement label'
  ),
  (
    'Fish Oil (Omega-3)',
    (SELECT id FROM food_categories WHERE name = 'Supplements'),
    '100% wild fish oil blend (anchovy, sardine, herring, mackerel). Values per 1 softgel (750 mg total omega-3: 450 mg EPA + 300 mg DHA).',
    FALSE,
    'Supplement label'
  ),
  (
    'Vitamin K2 + D3',
    (SELECT id FROM food_categories WHERE name = 'Supplements'),
    'Combined vitamin K2 (menaquinone-7, MK-7, from natto) and vitamin D3 (cholecalciferol) supplement. Values per 1 capsule.',
    FALSE,
    'Supplement label'
  );


-- ── 3. Nutrient values ────────────────────────────────────────
-- Each INSERT uses a subquery for food_id and nutrient_id so
-- no hardcoded IDs are needed.

-- ─ Multivitamin ──────────────────────────────────────────────
INSERT INTO food_nutrients (food_id, nutrient_id, value_per_100g)
SELECT f.id, n.id, v.val
FROM (VALUES
  ('Vitamin A',          300.0),   -- mcg RAE  (label: 300 mcg RAE / 1000 IU)
  ('Vitamin C',          180.0),   -- mg        (ascorbic acid)
  ('Vitamin D',           20.0),   -- mcg       (cholecalciferol; 800 IU)
  ('Vitamin E',           18.0),   -- mg AT     (dl-alpha tocopheryl acetate; 40 IU)
  ('Vitamin K',           25.0),   -- mcg       (K1 phytonadione)
  ('Thiamine',             4.2),   -- mg        (thiamine mononitrate)
  ('Riboflavin',           4.6),   -- mg
  ('Niacin',              16.0),   -- mg        (niacinamide)
  ('Vitamin B6',           5.5),   -- mg        (pyridoxine hydrochloride)
  ('Folate',             400.0),   -- mcg       (folic acid; label value used as-is)
  ('Vitamin B12',         21.6),   -- mcg       (cyanocobalamin)
  ('Pantothenic Acid',    12.5),   -- mg        (calcium d-pantothenate)
  ('Calcium',            300.0),   -- mg        (calcium carbonate)
  ('Iodine',             150.0),   -- mcg       (potassium iodide)
  ('Iron',                 6.0),   -- mg        (iron [II] fumarate)
  ('Magnesium',           84.0),   -- mg        (magnesium oxide)
  ('Copper',               0.9),   -- mg        (copper [II] sulfate; label: 900 mcg)
  ('Manganese',            5.5),   -- mg        (manganese [II] sulfate)
  ('Chromium',            35.0),   -- mcg       (chromium [III] chloride hexahydrate)
  ('Selenium',            55.0),   -- mcg       (sodium selenate)
  ('Zinc',                11.0)    -- mg        (zinc oxide)
) AS v(nutrient_name, val)
JOIN nutrients n ON n.name = v.nutrient_name
CROSS JOIN (SELECT id FROM foods WHERE name = 'Multivitamin') AS f;

-- ─ Magnesium Bisglycinate ─────────────────────────────────────
INSERT INTO food_nutrients (food_id, nutrient_id, value_per_100g)
SELECT f.id, n.id, 200.0
FROM nutrients n
CROSS JOIN (SELECT id FROM foods WHERE name = 'Magnesium Bisglycinate') AS f
WHERE n.name = 'Magnesium';

-- ─ Fish Oil (Omega-3) ─────────────────────────────────────────
-- Stored in grams to match our Omega-3 unit (g).
-- 750 mg total omega-3 = 0.75 g
INSERT INTO food_nutrients (food_id, nutrient_id, value_per_100g)
SELECT f.id, n.id, 0.75
FROM nutrients n
CROSS JOIN (SELECT id FROM foods WHERE name = 'Fish Oil (Omega-3)') AS f
WHERE n.name = 'Omega-3 Fatty Acids';

-- ─ Vitamin K2 + D3 ───────────────────────────────────────────
INSERT INTO food_nutrients (food_id, nutrient_id, value_per_100g)
SELECT f.id, n.id, v.val
FROM (VALUES
  ('Vitamin K', 120.0),   -- mcg  K2 menaquinone-7 (MK-7, from natto)
  ('Vitamin D',  25.0)    -- mcg  D3 cholecalciferol (1000 IU)
) AS v(nutrient_name, val)
JOIN nutrients n ON n.name = v.nutrient_name
CROSS JOIN (SELECT id FROM foods WHERE name = 'Vitamin K2 + D3') AS f;


-- ── Verify ────────────────────────────────────────────────────
-- Run after execution to confirm:
--   SELECT f.name, COUNT(fn.*) AS nutrient_rows
--   FROM foods f
--   JOIN food_categories fc ON fc.id = f.food_category_id
--   LEFT JOIN food_nutrients fn ON fn.food_id = f.id
--   WHERE fc.name = 'Supplements'
--   GROUP BY f.name, f.id ORDER BY f.id;
--
-- Expected: Multivitamin=21, Magnesium Bisglycinate=1,
--           Fish Oil (Omega-3)=1, Vitamin K2 + D3=2
