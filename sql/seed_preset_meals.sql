-- ─────────────────────────────────────────────────────────────────────────────
--  PRESET MEALS  — System-wide curated meal templates
--  Run this after schema.sql and all seed_*.sql files.
--
--  Table is public-readable (anon + authenticated).
--  Only the service role (SQL editor) can insert/update/delete.
--
--  29 preset meals across 6 categories:
--    Juices (5) · Salads (6) · Pastas (4) · Bowls (5)
--    High Protein (5) · Breakfast (4)
--
--  items JSONB format mirrors MealItem in types/meals.ts:
--    { "id": "<uuid>", "food_id": <int>, "grams": <number>, "servings": 1 }
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Table ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS preset_meals (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  category    text        NOT NULL,
  description text,
  items       jsonb       NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE preset_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read preset meals"
  ON preset_meals FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── 2. Seed data ──────────────────────────────────────────────────────────────
-- Items are built with subqueries on foods.name so IDs stay correct
-- even if the sequence ever differs between environments.

INSERT INTO preset_meals (name, category, description, items) VALUES

-- ─── JUICES ──────────────────────────────────────────────────────────────────

(
  'Green Detox Juice',
  'Juices',
  'A cleansing green juice loaded with vitamins K and C, folate, and chlorophyll from spinach and cucumber, brightened with lemon.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),  'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cucumber'), 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Celery'),   'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Apple'),    'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),    'grams', 40,  'servings', 1)
  )
),

(
  'Tropical Citrus Blast',
  'Juices',
  'A bright, high-vitamin C juice combining orange, pineapple, mango, and grapefruit. Great source of folate and beta-carotene.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Orange'),     'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pineapple'),  'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mango'),      'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Grapefruit'), 'grams', 150, 'servings', 1)
  )
),

(
  'Berry Antioxidant Boost',
  'Juices',
  'A deep-purple antioxidant powerhouse. Blueberries, strawberries, raspberries, and blackberries deliver anthocyanins and vitamin C.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Blueberry'),  'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Strawberry'), 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Raspberry'),  'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Blackberry'), 'grams', 100, 'servings', 1)
  )
),

(
  'Beet & Ginger Energizer',
  'Juices',
  'Earthy beetroot with carrot and apple for natural sweetness, plus ginger for anti-inflammatory kick. High in folate and nitrates.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Beetroot'),       'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Carrot'),         'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Apple'),          'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),          'grams', 40,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'), 'grams', 5,  'servings', 1)
  )
),

(
  'Watermelon Lime Cooler',
  'Juices',
  'Refreshing and hydrating. Watermelon is rich in lycopene and citrulline; lime adds vitamin C and a tart brightness.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Watermelon'), 'grams', 400, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lime'),       'grams', 50,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cucumber'),   'grams', 150, 'servings', 1)
  )
),

-- ─── SALADS ───────────────────────────────────────────────────────────────────

(
  'Classic Caesar Salad',
  'Salads',
  'Crisp romaine, grilled chicken breast, and parmesan with olive oil. High in protein and vitamins A, K, and B12.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Romaine Lettuce'),    'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Breast (skinless)'), 'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parmesan Cheese'),   'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),              'grams', 30,  'servings', 1)
  )
),

(
  'Greek Salad',
  'Salads',
  'Mediterranean classic: tomato, cucumber, red pepper, onion, and mozzarella in olive oil. Rich in vitamin C and healthy fats.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),               'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cucumber'),             'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Red Bell Pepper'),      'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                'grams', 50,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mozzarella Cheese'),    'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 20, 'servings', 1)
  )
),

(
  'Spinach & Strawberry Salad',
  'Salads',
  'Baby spinach with strawberries, walnuts, and olive oil. High in iron, omega-3, vitamin C, and folate.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),              'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Strawberry'),           'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Walnuts'),              'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Kale Power Salad',
  'Salads',
  'Massaged kale with roasted chickpeas, avocado, and lemon-olive oil dressing. Packed with vitamins K, A, C, and plant protein.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Kale'),                 'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chickpeas'),            'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Avocado'),              'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Tuna Niçoise',
  'Salads',
  'French bistro salad: tuna, romaine, tomato, peas, and egg with olive oil. High in protein, omega-3, and B vitamins.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tuna (yellowfin)'),     'grams', 160, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Romaine Lettuce'),      'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),               'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Peas (Green)'),         'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Egg (whole)'),  'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Asian Sesame Slaw',
  'Salads',
  'Crunchy cabbage slaw with carrot, edamame, sesame seeds, and sesame oil. Great for manganese, vitamin C, and plant protein.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'White Cabbage'),        'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Carrot'),               'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Edamame'),              'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Seeds'),         'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Oil'),           'grams', 10,  'servings', 1)
  )
),

-- ─── PASTAS ───────────────────────────────────────────────────────────────────

(
  'Classic Bolognese',
  'Pastas',
  'Hearty meat sauce pasta. Ground beef with tomato, onion, and garlic over white pasta, finished with parmesan. Rich in iron, zinc, and B12.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pasta (dry, white)'),   'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Beef (ground, 80% lean)'), 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),               'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),               'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parmesan Cheese'),      'grams', 20,  'servings', 1)
  )
),

(
  'Garlic Shrimp Pasta',
  'Pastas',
  'Light garlic and olive oil pasta with shrimp and parsley. High in selenium, iodine, and lean protein with minimal saturated fat.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pasta (dry, white)'),   'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Shrimp'),               'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),               'grams', 20,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 20, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),               'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parsley (fresh)'),      'grams', 15,  'servings', 1)
  )
),

(
  'Pasta Primavera',
  'Pastas',
  'Colorful vegetable pasta with broccoli, zucchini, and red pepper in olive oil and parmesan. High in vitamin C, folate, and fiber.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pasta (dry, white)'),   'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Broccoli'),             'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Zucchini'),             'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Red Bell Pepper'),      'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parmesan Cheese'),      'grams', 20,  'servings', 1)
  )
),

(
  'Pasta e Fagioli',
  'Pastas',
  'Italian peasant pasta and bean soup. Navy beans with pasta, tomato, and garlic — excellent for fiber, plant protein, and iron.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pasta (dry, white)'),   'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Navy Beans'),           'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),               'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),               'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

-- ─── BOWLS ────────────────────────────────────────────────────────────────────

(
  'Buddha Bowl',
  'Bowls',
  'A nourishing vegan bowl: brown rice, roasted chickpeas, avocado, spinach, and carrot with sesame seeds. Complete protein, fiber, and healthy fats.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'), 'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chickpeas'),             'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Avocado'),               'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),               'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Carrot'),                'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Seeds'),          'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Açaí Power Bowl',
  'Bowls',
  'Thick blended berry base with banana, blueberry, and almond milk, topped with chia seeds and almonds. Rich in antioxidants and healthy fats.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Blueberry'),            'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Banana'),               'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Strawberry'),           'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Almond Milk (unsweetened)'), 'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chia Seeds'),           'grams', 20,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Almonds'),              'grams', 30,  'servings', 1)
  )
),

(
  'Salmon Poke Bowl',
  'Bowls',
  'Hawaiian-inspired bowl: fresh salmon over brown rice with avocado, cucumber, and sesame. Excellent for omega-3, vitamin D, and B12.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Salmon (Atlantic)'),    'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'), 'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Avocado'),              'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cucumber'),             'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Seeds'),         'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Oil'),           'grams', 10,  'servings', 1)
  )
),

(
  'Quinoa Veggie Bowl',
  'Bowls',
  'Plant-based bowl with quinoa (complete protein), roasted sweet potato, kale, and chickpeas. Loaded with iron, magnesium, and vitamins.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Quinoa (uncooked)'),    'grams', 85,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Kale'),                 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sweet Potato'),         'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chickpeas'),            'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                'grams', 25,  'servings', 1)
  )
),

(
  'Greek Yogurt Parfait',
  'Bowls',
  'Layered yogurt parfait with mixed berries, almonds, and chia seeds. High in protein, probiotics, calcium, and antioxidants.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Greek Yogurt (plain, full fat)'), 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Blueberry'),            'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Strawberry'),           'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Almonds'),              'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chia Seeds'),           'grams', 15,  'servings', 1)
  )
),

-- ─── HIGH PROTEIN ─────────────────────────────────────────────────────────────

(
  'Bodybuilder Plate',
  'High Protein',
  'Classic muscle-building meal: scrambled eggs, grilled chicken breast, and cottage cheese over spinach. ~70g protein per serving.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Egg (whole)'),  'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Breast (skinless)'), 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cottage Cheese'),       'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),              'grams', 80,  'servings', 1)
  )
),

(
  'Salmon & Quinoa',
  'High Protein',
  'Atlantic salmon with quinoa and asparagus in lemon-olive oil. Exceptional for omega-3, vitamin D, selenium, and complete amino acids.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Salmon (Atlantic)'),    'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Quinoa (uncooked)'),    'grams', 85,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Asparagus'),            'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                'grams', 30,  'servings', 1)
  )
),

(
  'Turkey & Sweet Potato Power',
  'High Protein',
  'Lean turkey breast with roasted sweet potato and broccoli. High in B6, potassium, vitamin A, and complete protein.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turkey Breast'),        'grams', 220, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sweet Potato'),         'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Broccoli'),             'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Sirloin Steak & Veggies',
  'High Protein',
  'Grilled sirloin with sweet potato and broccoli. Iron-rich red meat with anti-inflammatory cruciferous vegetables and slow-release carbs.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Beef (sirloin steak)'), 'grams', 220, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sweet Potato'),         'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Broccoli'),             'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),               'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Tuna & Edamame Bowl',
  'High Protein',
  'Lean yellowfin tuna with brown rice, edamame, avocado, and sesame. ~55g protein, high in omega-3 and all essential amino acids.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tuna (yellowfin)'),     'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'), 'grams', 80, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Edamame'),              'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Avocado'),              'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Seeds'),         'grams', 10,  'servings', 1)
  )
),

-- ─── BREAKFAST ────────────────────────────────────────────────────────────────

(
  'Overnight Oats',
  'Breakfast',
  'No-cook oats soaked in almond milk with chia seeds, banana, blueberries, and almonds. High fiber, omega-3, and sustained energy.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Rolled Oats'),          'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Almond Milk (unsweetened)'), 'grams', 240, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Banana'),               'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chia Seeds'),           'grams', 20,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Blueberry'),            'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Almonds'),              'grams', 25,  'servings', 1)
  )
),

(
  'Spinach Scramble',
  'Breakfast',
  'Fluffy scrambled eggs with spinach and butter. Simple, fast, and rich in choline, vitamin K, iron, and complete protein.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Egg (whole)'),  'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),              'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),    'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Whole Milk (3.25%)'),   'grams', 30,  'servings', 1)
  )
),

(
  'Oatmeal Fruit Bowl',
  'Breakfast',
  'Warm rolled oats with banana, blueberries, walnuts, and chia seeds in almond milk. High in beta-glucan fiber, antioxidants, and omega-3.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Rolled Oats'),          'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Almond Milk (unsweetened)'), 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Banana'),               'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Blueberry'),            'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Walnuts'),              'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chia Seeds'),           'grams', 15,  'servings', 1)
  )
),

(
  'Smoked Salmon & Egg Plate',
  'Breakfast',
  'Smoked-style salmon with soft eggs and avocado. Exceptional for omega-3, vitamin D, choline, and B12 — a true nutrient-dense start.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Salmon (Atlantic)'),    'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Egg (whole)'),  'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Avocado'),              'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Arugula'),              'grams', 50,  'servings', 1)
  )
);
