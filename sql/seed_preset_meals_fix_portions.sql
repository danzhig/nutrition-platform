-- ─────────────────────────────────────────────────────────────────────────────
--  PORTION FIX MIGRATION — corrects unreasonable portion sizes across all
--  three preset meal seed files.
--
--  Run this against the live Supabase database (SQL Editor, service role).
--  Safe to re-run: DELETE + re-INSERT is idempotent by meal name.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── seed_preset_meals.sql fixes ───────────────────────────────────────────────

-- Spinach & Strawberry Salad  (Spinach 120g → 90g = 3 cups raw)
DELETE FROM preset_meals WHERE name = 'Spinach & Strawberry Salad';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Spinach & Strawberry Salad',
  'Salads',
  'Baby spinach with strawberries, walnuts, and olive oil. High in iron, omega-3, vitamin C, and folate.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),              'grams', 90,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Strawberry'),           'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Walnuts'),              'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
);

-- Bodybuilder Plate  (Spinach 80g → 60g = 2 cups raw)
DELETE FROM preset_meals WHERE name = 'Bodybuilder Plate';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Bodybuilder Plate',
  'High Protein',
  'Classic muscle-building meal: scrambled eggs, grilled chicken breast, and cottage cheese over spinach. ~70g protein per serving.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Egg (whole)'),  'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Breast (skinless)'), 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cottage Cheese'),       'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),              'grams', 60,  'servings', 1)
  )
);

-- Spinach Scramble  (Spinach 80g → 60g = 2 cups raw)
DELETE FROM preset_meals WHERE name = 'Spinach Scramble';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Spinach Scramble',
  'Breakfast',
  'Fluffy scrambled eggs with spinach and butter. Simple, fast, and rich in choline, vitamin K, iron, and complete protein.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Egg (whole)'),  'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),              'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),    'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Whole Milk (3.25%)'),   'grams', 30,  'servings', 1)
  )
);

-- Pasta e Fagioli  (Navy Beans 150g → 100g ≈ 2 servings dry)
DELETE FROM preset_meals WHERE name = 'Pasta e Fagioli';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Pasta e Fagioli',
  'Pastas',
  'Italian peasant pasta and bean soup. Navy beans with pasta, tomato, and garlic — excellent for fiber, plant protein, and iron.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pasta (dry, white)'),   'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Navy Beans'),           'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),               'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),               'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
);

-- Turkey & Sweet Potato Power  (Turkey Breast 220g → 170g = 2 servings)
DELETE FROM preset_meals WHERE name = 'Turkey & Sweet Potato Power';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Turkey & Sweet Potato Power',
  'High Protein',
  'Lean turkey breast with roasted sweet potato and broccoli. High in B6, potassium, vitamin A, and complete protein.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turkey Breast'),        'grams', 170, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sweet Potato'),         'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Broccoli'),             'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
);

-- Smoked Salmon & Egg Plate  (Arugula 50g → 40g = 2 servings)
DELETE FROM preset_meals WHERE name = 'Smoked Salmon & Egg Plate';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Smoked Salmon & Egg Plate',
  'Breakfast',
  'Smoked-style salmon with soft eggs and avocado. Exceptional for omega-3, vitamin D, choline, and B12 — a true nutrient-dense start.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Salmon (Atlantic)'),    'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Egg (whole)'),  'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Avocado'),              'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Arugula'),              'grams', 40,  'servings', 1)
  )
);

-- ── seed_preset_meals_lowcarb_keto.sql fixes ──────────────────────────────────

-- Turkey & Veggie Stir-Fry  (Turkey Breast 200g → 170g = 2 servings)
DELETE FROM preset_meals WHERE name = 'Turkey & Veggie Stir-Fry';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Turkey & Veggie Stir-Fry',
  'Low Carb',
  'Ground turkey with broccoli, zucchini, and mushrooms in sesame oil. Lean protein with fibre-rich vegetables — high in B vitamins, zinc, and vitamin C.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turkey Breast'),          'grams', 170, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Broccoli'),               'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Zucchini'),               'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mushroom (White Button)'), 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Oil'),             'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1)
  )
);

-- Egg & Spinach Skillet  (Spinach 100g → 60g = 2 cups raw)
DELETE FROM preset_meals WHERE name = 'Egg & Spinach Skillet';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Egg & Spinach Skillet',
  'Low Carb',
  'Scrambled eggs with wilted spinach and sautéed mushrooms in olive oil. A fast, nutrient-dense low-carb meal — exceptional for choline, iron, and vitamin K.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Egg (whole)'),    'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mushroom (White Button)'), 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 8,   'servings', 1)
  )
);

-- Bacon, Egg & Cheese Plate  (Bacon 100g → 56g = 4 slices raw)
DELETE FROM preset_meals WHERE name = 'Bacon, Egg & Cheese Plate';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Bacon, Egg & Cheese Plate',
  'Keto',
  'Classic keto staple: pan-fried bacon and eggs with cheddar and butter-wilted spinach. Very high fat, zero-carb proteins — great for choline, B12, and saturated fat intake.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Bacon (pork, raw)'),      'grams', 56,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Egg (whole)'),    'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cheddar Cheese'),         'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 20,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 60,  'servings', 1)
  )
);

-- Salmon in Cream Sauce  (Heavy Cream 80g → 60g = 4 tbsp)
DELETE FROM preset_meals WHERE name = 'Salmon in Cream Sauce';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Salmon in Cream Sauce',
  'Keto',
  'Atlantic salmon pan-seared in butter, finished with a heavy cream and garlic sauce over asparagus. Extremely high in omega-3, fat-soluble vitamins, and selenium.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Salmon (Atlantic)'),      'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Heavy Cream'),            'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Asparagus'),              'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1)
  )
);

-- Mackerel & Butter Greens  (Mackerel 200g → 170g = 2 servings)
DELETE FROM preset_meals WHERE name = 'Mackerel & Butter Greens';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Mackerel & Butter Greens',
  'Keto',
  'Atlantic mackerel — one of the fattiest fish — with kale cooked in butter and garlic. Outstanding for omega-3, vitamin D, and B12 with virtually no carbs.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mackerel (Atlantic)'),    'grams', 170, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Kale'),                   'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 10, 'servings', 1)
  )
);

-- Sardines, Arugula & Brazil Nuts  (Arugula 80g → 40g = 2 cups)
DELETE FROM preset_meals WHERE name = 'Sardines, Arugula & Brazil Nuts';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Sardines, Arugula & Brazil Nuts',
  'Keto',
  'Sardines in oil over peppery arugula with Brazil nuts and olive oil. Unconventional but nutritionally exceptional — hits omega-3, selenium (Brazil nuts), calcium, and vitamin D in one bowl.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sardines (canned in oil)'), 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Arugula'),                  'grams', 40,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brazil Nuts'),              'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                    'grams', 25,  'servings', 1)
  )
);

-- ── seed_preset_meals_expanded.sql fixes ──────────────────────────────────────

-- Red Lentil & Turmeric Soup  (Lentils 150g → 96g = 2 servings dry)
DELETE FROM preset_meals WHERE name = 'Red Lentil & Turmeric Soup';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Red Lentil & Turmeric Soup',
  'Soups & Stews',
  'Silky red lentil soup with onion, carrot, garlic, cumin, and turmeric. Plant-based iron and folate powerhouse with anti-inflammatory spices.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lentils (Red)'),          'grams', 96,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Carrot'),                 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
);

-- Black Bean Soup  (Black Beans 200g → 92g = 2 servings dry)
DELETE FROM preset_meals WHERE name = 'Black Bean Soup';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Black Bean Soup',
  'Soups & Stews',
  'Smoky Cuban-inspired black bean soup with onion, garlic, cumin, and paprika. Excellent for fiber, folate, plant protein, and iron.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Black Beans'),            'grams', 92,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Paprika (sweet)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lime'),                   'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
);

-- Split Pea & Ham-Style Soup  (Split Peas 180g → 98g = 2 servings dry)
DELETE FROM preset_meals WHERE name = 'Split Pea & Ham-Style Soup';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Split Pea & Ham-Style Soup',
  'Soups & Stews',
  'Hearty green split pea soup with carrot, leek, garlic, thyme, and black pepper. Exceptionally high in fiber, plant protein, and B vitamins.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Green Split Peas'),       'grams', 98,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Carrot'),                 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Leek'),                   'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Thyme (dried)'),          'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Black Pepper (ground)'),  'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
);

-- Lamb & Chickpea Stew  (Lamb 200g → 170g = 2 servings; Chickpeas 150g → 100g ≈ 2 servings dry)
DELETE FROM preset_meals WHERE name = 'Lamb & Chickpea Stew';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Lamb & Chickpea Stew',
  'Soups & Stews',
  'Moroccan-style braised lamb with chickpeas, tomato, cumin, cinnamon, and paprika. Rich in iron, zinc, B vitamins, and warming spices.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lamb (leg)'),             'grams', 170, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chickpeas'),              'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Paprika (sweet)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cinnamon (ground)'),      'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
);

-- Chickpea & Spinach Curry  (Spinach 120g → 60g = 2 cups raw)
DELETE FROM preset_meals WHERE name = 'Chickpea & Spinach Curry';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Chickpea & Spinach Curry',
  'Curries',
  'Saag chana-style curry: chickpeas and spinach simmered in coconut milk with turmeric, cumin, ginger, and tomato. Iron, folate, and vitamin K powerhouse.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chickpeas'),              'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Milk (canned, full fat)'), 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
);

-- Salmon Coconut Curry  (Spinach 100g → 60g = 2 cups raw)
DELETE FROM preset_meals WHERE name = 'Salmon Coconut Curry';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Salmon Coconut Curry',
  'Curries',
  'Atlantic salmon simmered in coconut milk with spinach, tomato, turmeric, and ginger. Exceptional for omega-3, vitamin D, and anti-inflammatory compounds.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Salmon (Atlantic)'),      'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Milk (canned, full fat)'), 'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
);

-- Red Lentil Dal  (Lentils 180g → 96g = 2 servings dry)
DELETE FROM preset_meals WHERE name = 'Red Lentil Dal';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Red Lentil Dal',
  'Curries',
  'Classic Indian tarka dal: red lentils simmered with onion, tomato, turmeric, cumin, and coriander. One of the most nutrient-dense plant meals possible.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lentils (Red)'),          'grams', 96,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Milk (canned, full fat)'), 'grams', 80, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
);

-- Tofu & Sweet Potato Curry  (Spinach 80g → 60g = 2 cups raw)
DELETE FROM preset_meals WHERE name = 'Tofu & Sweet Potato Curry';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Tofu & Sweet Potato Curry',
  'Curries',
  'Vegan golden curry: firm tofu and sweet potato simmered in coconut milk with turmeric, garlic, and spinach. Complete plant nutrition in one bowl.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tofu (Firm)'),            'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sweet Potato'),           'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Milk (canned, full fat)'), 'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
);

-- Mung Bean & Coconut Curry  (Mung Beans 180g → 104g = 2 servings dry)
DELETE FROM preset_meals WHERE name = 'Mung Bean & Coconut Curry';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Mung Bean & Coconut Curry',
  'Curries',
  'South Indian-style mung bean curry simmered in coconut milk with tomato, turmeric, mustard-seed spicing, and fresh lemon. High in folate and manganese.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mung Beans'),             'grams', 104, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Milk (canned, full fat)'), 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 12,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Oil'),            'grams', 15,  'servings', 1)
  )
);

-- Rainbow Trout & Lentil Bowl  (Spinach 100g → 60g = 2 cups raw)
DELETE FROM preset_meals WHERE name = 'Rainbow Trout & Lentil Bowl';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Rainbow Trout & Lentil Bowl',
  'Bowls',
  'Pan-seared rainbow trout over green lentils with spinach, lemon, and rosemary. Freshwater fish high in omega-3, vitamin D, and B12.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Rainbow Trout'),          'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lentils (Green)'),        'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Rosemary (dried)'),       'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
);

-- Egg White Veggie Omelette  (Egg Whites 200g → 165g = 5 egg whites; Spinach 80g → 60g = 2 cups raw)
DELETE FROM preset_meals WHERE name = 'Egg White Veggie Omelette';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Egg White Veggie Omelette',
  'Breakfast',
  'Light omelette made with egg whites, spinach, mushroom, and red pepper. High-protein, low-fat breakfast with iron, selenium, and vitamin C.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Egg White'),      'grams', 165, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mushroom (White Button)'), 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Red Bell Pepper'),        'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 10, 'servings', 1)
  )
);

-- Salmon & Spinach Pasta  (Spinach 100g → 60g = 2 cups raw)
DELETE FROM preset_meals WHERE name = 'Salmon & Spinach Pasta';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Salmon & Spinach Pasta',
  'Pastas',
  'Flaked salmon and wilted spinach in garlic and olive oil over white pasta. Excellent for omega-3, vitamin D, folate, and lean protein.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pasta (dry, white)'),     'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Salmon (Atlantic)'),      'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 20, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parmesan Cheese'),        'grams', 20,  'servings', 1)
  )
);

-- Chicken Liver Butter Plate  (Arugula 80g → 40g = 2 cups)
DELETE FROM preset_meals WHERE name = 'Chicken Liver Butter Plate';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Chicken Liver Butter Plate',
  'Keto',
  'Pan-fried chicken livers in butter and garlic with sautéed arugula. Chicken liver is extraordinarily dense in B12, folate, vitamin A, copper, and iron.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Liver'),          'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 12,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Arugula'),                'grams', 40,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Thyme (dried)'),          'grams', 2,   'servings', 1)
  )
);

-- Pomegranate Kale Energizer  (Kale 80g → 67g = 1 cup chopped)
DELETE FROM preset_meals WHERE name = 'Pomegranate Kale Energizer';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Pomegranate Kale Energizer',
  'Juices',
  'Deep-red pomegranate and apple juice blended with kale and lemon. Polyphenol and antioxidant powerhouse with vitamin K, C, and folate.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pomegranate'),            'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Kale'),                   'grams', 67,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Apple'),                  'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1)
  )
);

-- Kiwi & Spinach Booster  (Spinach 80g → 60g = 2 cups raw)
DELETE FROM preset_meals WHERE name = 'Kiwi & Spinach Booster';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Kiwi & Spinach Booster',
  'Juices',
  'Bright green juice with kiwi, spinach, cucumber, and lemon. Kiwi is one of the most vitamin C-dense fruits; spinach adds iron and folate.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Kiwi'),                   'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cucumber'),               'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1)
  )
);

-- Also fix Green Detox Juice (already fixed in seed file, applying here for completeness)
DELETE FROM preset_meals WHERE name = 'Green Detox Juice';
INSERT INTO preset_meals (name, category, description, items) VALUES (
  'Green Detox Juice',
  'Juices',
  'A cleansing green juice loaded with vitamins K and C, folate, and chlorophyll from spinach and cucumber, brightened with lemon.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),  'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cucumber'), 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Celery'),   'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Apple'),    'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),    'grams', 40,  'servings', 1)
  )
);
