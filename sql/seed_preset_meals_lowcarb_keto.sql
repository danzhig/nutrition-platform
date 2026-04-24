-- ─────────────────────────────────────────────────────────────────────────────
--  PRESET MEALS — Low Carb & Keto categories
--  Run AFTER seed_preset_meals.sql (preset_meals table must already exist).
--
--  Low Carb (6 meals) — generally < 20g net carbs per meal, protein-forward
--  Keto      (6 meals) — very high fat, < 10g net carbs, moderate protein
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO preset_meals (name, category, description, items) VALUES

-- ─── LOW CARB ─────────────────────────────────────────────────────────────────

(
  'Grilled Salmon & Asparagus',
  'Low Carb',
  'Atlantic salmon fillet with roasted asparagus in lemon and olive oil. Rich in omega-3, vitamin D, and selenium with minimal carbs.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Salmon (Atlantic)'),      'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Asparagus'),              'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1)
  )
),

(
  'Tuna-Stuffed Avocado',
  'Low Carb',
  'Creamy avocado halves loaded with yellowfin tuna, celery, and lemon. High in healthy fats, complete protein, and potassium.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tuna (yellowfin)'),       'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Avocado'),                'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Celery'),                 'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 10, 'servings', 1)
  )
),

(
  'Shrimp & Cauliflower Rice',
  'Low Carb',
  'Pan-seared shrimp over riced cauliflower with garlic and olive oil. A satisfying low-carb alternative to fried rice — high in iodine, selenium, and vitamin C.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Shrimp'),                 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cauliflower'),            'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 20, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parsley (fresh)'),        'grams', 10,  'servings', 1)
  )
),

(
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
),

(
  'Sirloin & Brussels Sprouts',
  'Low Carb',
  'Grilled sirloin steak with roasted Brussels sprouts and garlic butter. Iron-rich red meat paired with cruciferous vegetables high in vitamin K and folate.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Beef (sirloin steak)'),   'grams', 220, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brussels Sprouts'),       'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 10, 'servings', 1)
  )
),

(
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
),

-- ─── KETO ─────────────────────────────────────────────────────────────────────

(
  'Bacon, Egg & Cheese Plate',
  'Keto',
  'Classic keto staple: pan-fried bacon and eggs with cheddar and butter-wilted spinach. Very high fat, zero-carb proteins — great for choline, B12, and saturated fat intake.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Bacon (pork, raw)'),           'grams', 56,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Egg (whole)'),    'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cheddar Cheese'),         'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 20,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 60,  'servings', 1)
  )
),

(
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
),

(
  'Beef & Avocado Bowl',
  'Keto',
  'Ground beef cooked in its own fat, topped with avocado, sour cream, and cheddar over spinach. Macro profile: very high fat, high protein, near-zero carbs.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Beef (ground, 80% lean)'), 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Avocado'),                 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cheddar Cheese'),          'grams', 50,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sour Cream'),              'grams', 40,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                 'grams', 60,  'servings', 1)
  )
),

(
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
),

(
  'Pork Chop & Cauliflower Mash',
  'Keto',
  'Pan-seared pork chop with creamy cauliflower mashed with butter, heavy cream, and cheddar. A keto take on pork and mash — rich in B vitamins, zinc, and fat.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pork Chop'),              'grams', 220, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cauliflower'),            'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Heavy Cream'),            'grams', 50,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cheddar Cheese'),         'grams', 40,  'servings', 1)
  )
),

(
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
