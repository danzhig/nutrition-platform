-- ─────────────────────────────────────────────────────────────────────────────
--  PORTION FIX MIGRATION #2 — second-pass corrections after full audit
--
--  Run this against the live Supabase database (SQL Editor, service role).
--  Safe to re-run: DELETE + re-INSERT is idempotent by meal name.
-- ─────────────────────────────────────────────────────────────────────────────

-- Buddha Bowl  (Spinach 80g → 60g = 2 cups raw; consistent with other fixed meals)
DELETE FROM preset_meals WHERE name = 'Buddha Bowl';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Buddha Bowl',
  'Bowls',
  'A nourishing vegan bowl: brown rice, roasted chickpeas, avocado, spinach, and carrot with sesame seeds. Complete protein, fiber, and healthy fats.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'), 'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chickpeas'),             'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Avocado'),               'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),               'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Carrot'),                'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Seeds'),          'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
);

-- Minestrone with White Beans  (Navy Beans 120g → 92g = 2 servings dry)
DELETE FROM preset_meals WHERE name = 'Minestrone with White Beans';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Minestrone with White Beans',
  'Soups & Stews',
  'Classic Italian vegetable soup: navy beans, zucchini, tomato, carrot, and pasta with oregano and basil. High in fiber, plant protein, and vitamins.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Navy Beans'),             'grams', 92,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Zucchini'),               'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Carrot'),                 'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pasta (dry, white)'),     'grams', 50,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Oregano (dried)'),        'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Basil (fresh)'),          'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
);

-- Lentil & Roasted Eggplant Salad  (Lentils Green 150g → 96g = 2 servings dry)
DELETE FROM preset_meals WHERE name = 'Lentil & Roasted Eggplant Salad';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Lentil & Roasted Eggplant Salad',
  'Salads',
  'Green lentils with fire-roasted eggplant, tomato, onion, parsley, cumin, and lemon. Mediterranean-inspired, high in fiber, plant iron, and B vitamins.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lentils (Green)'),        'grams', 96,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Eggplant'),               'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parsley (fresh)'),        'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
);

-- Roasted Beet & Walnut Salad  (Arugula 80g → 60g = 3 cups; consistent with other salads)
DELETE FROM preset_meals WHERE name = 'Roasted Beet & Walnut Salad';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Roasted Beet & Walnut Salad',
  'Salads',
  'Earthy roasted beetroot with arugula, walnuts, orange, and olive oil. Brilliant for folate, manganese, nitrates, and heart-healthy fats.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Beetroot'),               'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Arugula'),                'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Walnuts'),                'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Orange'),                 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 20,  'servings', 1)
  )
);

-- Pomegranate & Quinoa Salad  (Arugula 80g → 60g = 3 cups; consistent with other salads)
DELETE FROM preset_meals WHERE name = 'Pomegranate & Quinoa Salad';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Pomegranate & Quinoa Salad',
  'Salads',
  'Fluffy quinoa with pomegranate seeds, arugula, walnuts, and lemon dressing. Antioxidant-dense with complete plant protein and polyphenols.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Quinoa (uncooked)'),      'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pomegranate'),            'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Arugula'),                'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Walnuts'),                'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
);

-- Black Bean & Avocado Bowl  (Black Beans 150g → 92g = 2 servings dry; consistent with Black Bean Soup)
DELETE FROM preset_meals WHERE name = 'Black Bean & Avocado Bowl';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Black Bean & Avocado Bowl',
  'Bowls',
  'Mexican-inspired bowl: black beans, brown rice, avocado, tomato, corn, lime, and cumin. High in fiber, heart-healthy fats, and plant protein.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Black Beans'),            'grams', 92,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Avocado'),                'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Corn'),                   'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lime'),                   'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 3,   'servings', 1)
  )
);
