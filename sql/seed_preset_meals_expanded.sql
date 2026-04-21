-- ─────────────────────────────────────────────────────────────────────────────
--  PRESET MEALS — Expanded set (+60 meals, total 100+)
--  Run AFTER seed_preset_meals.sql and seed_preset_meals_lowcarb_keto.sql.
--
--  New categories:
--    Soups & Stews (10) · Stir-Fries (7) · Curries (7)
--  Expanded categories:
--    Breakfast (+6) · Salads (+6) · Bowls (+8) · High Protein (+5)
--    Pastas (+3) · Low Carb (+3) · Keto (+2) · Juices (+3)
--
--  Food names match foods.name exactly (subquery lookup keeps IDs portable).
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO preset_meals (name, category, description, items) VALUES

-- ─── SOUPS & STEWS ────────────────────────────────────────────────────────────

(
  'Red Lentil & Turmeric Soup',
  'Soups & Stews',
  'Silky red lentil soup with onion, carrot, garlic, cumin, and turmeric. Plant-based iron and folate powerhouse with anti-inflammatory spices.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lentils (Red)'),          'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Carrot'),                 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Minestrone with White Beans',
  'Soups & Stews',
  'Classic Italian vegetable soup: navy beans, zucchini, tomato, carrot, and pasta with oregano and basil. High in fiber, plant protein, and vitamins.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Navy Beans'),             'grams', 120, 'servings', 1),
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
),

(
  'Black Bean Soup',
  'Soups & Stews',
  'Smoky Cuban-inspired black bean soup with onion, garlic, cumin, and paprika. Excellent for fiber, folate, plant protein, and iron.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Black Beans'),            'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Paprika (sweet)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lime'),                   'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Chicken & Bok Choy Broth',
  'Soups & Stews',
  'Light Asian-style clear broth with chicken breast, bok choy, shiitake mushrooms, ginger, and garlic. Clean, nourishing, and rich in B vitamins.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Breast (skinless)'), 'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Bok Choy'),                'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Shiitake Mushroom'),       'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Oil'),             'grams', 10,  'servings', 1)
  )
),

(
  'Pumpkin & Coconut Soup',
  'Soups & Stews',
  'Creamy roasted pumpkin blended with coconut milk, ginger, and turmeric. Rich in beta-carotene, vitamin E, and medium-chain fats.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pumpkin'),                'grams', 300, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Milk (canned, full fat)'), 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Oyster & Leek Chowder',
  'Soups & Stews',
  'Briny oysters simmered with leek, potato, and whole milk with thyme and butter. Outstanding for zinc, B12, and iodine.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Oysters'),                'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Leek'),                   'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Potato'),                 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Whole Milk (3.25%)'),     'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Thyme (dried)'),          'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1)
  )
),

(
  'Lamb & Chickpea Stew',
  'Soups & Stews',
  'Moroccan-style braised lamb with chickpeas, tomato, cumin, cinnamon, and paprika. Rich in iron, zinc, B vitamins, and warming spices.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lamb (leg)'),             'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chickpeas'),              'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Paprika (sweet)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cinnamon (ground)'),      'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Tofu Miso-Style Broth',
  'Soups & Stews',
  'Light umami broth with firm tofu, shiitake mushroom, bok choy, sesame, and ginger. Plant-based complete protein with immune-supporting compounds.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tofu (Firm)'),            'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Shiitake Mushroom'),      'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Bok Choy'),               'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Oil'),             'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Seeds'),           'grams', 8,   'servings', 1)
  )
),

(
  'Butternut Squash Bisque',
  'Soups & Stews',
  'Velvety roasted butternut squash with onion, garlic, rosemary, and a touch of cream. High in beta-carotene, potassium, and vitamin C.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butternut Squash'),       'grams', 300, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Heavy Cream'),            'grams', 40,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Rosemary (dried)'),       'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Split Pea & Ham-Style Soup',
  'Soups & Stews',
  'Hearty green split pea soup with carrot, leek, garlic, thyme, and black pepper. Exceptionally high in fiber, plant protein, and B vitamins.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Green Split Peas'),       'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Carrot'),                 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Leek'),                   'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Thyme (dried)'),          'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Black Pepper (ground)'),  'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

-- ─── STIR-FRIES ───────────────────────────────────────────────────────────────

(
  'Tofu & Bok Choy Stir-Fry',
  'Stir-Fries',
  'Crispy pan-seared tofu with bok choy, shiitake mushrooms, garlic, and ginger in sesame oil. High in plant protein, calcium, and vitamin K.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tofu (Firm)'),            'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Bok Choy'),               'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Shiitake Mushroom'),      'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Oil'),             'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Seeds'),           'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
),

(
  'Tempeh & Broccoli Stir-Fry',
  'Stir-Fries',
  'Sliced tempeh with broccoli and red bell pepper in sesame-garlic sauce. Fermented soy provides complete protein and gut-friendly probiotics.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tempeh'),                 'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Broccoli'),               'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Red Bell Pepper'),        'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Oil'),             'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
),

(
  'Chicken Thigh Stir-Fry',
  'Stir-Fries',
  'Juicy chicken thigh strips with bok choy, broccoli, mushroom, and garlic over brown rice. Richer flavour than breast with more zinc and iron.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Thigh (skinless)'), 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Bok Choy'),               'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Broccoli'),               'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mushroom (White Button)'), 'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Oil'),             'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
),

(
  'Beef & Portobello Stir-Fry',
  'Stir-Fries',
  'Sliced sirloin with meaty portobello mushrooms, onion, and garlic in black pepper and sesame. Dense in iron, zinc, B12, and umami.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Beef (sirloin steak)'),   'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Portobello Mushroom'),    'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Black Pepper (ground)'),  'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Oil'),             'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
),

(
  'Shrimp & Snap Pea Stir-Fry',
  'Stir-Fries',
  'Quick-seared shrimp with green peas, red pepper, garlic, and ginger in sesame oil. Lean iodine- and selenium-rich protein ready in minutes.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Shrimp'),                 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Peas (Green)'),           'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Red Bell Pepper'),        'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Oil'),             'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'White Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
),

(
  'Duck Breast & Mushroom Stir-Fry',
  'Stir-Fries',
  'Sliced duck breast with shiitake mushrooms, bok choy, and garlic in sesame oil. Duck is uniquely rich in iron, B vitamins, and oleic acid.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Duck Breast'),            'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Shiitake Mushroom'),      'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Bok Choy'),               'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Oil'),             'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Seeds'),           'grams', 8,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
),

(
  'Scallop & Asparagus Stir-Fry',
  'Stir-Fries',
  'Seared scallops with asparagus, garlic, and lemon in olive oil. Scallops are among the leanest proteins — high in B12, magnesium, and selenium.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Scallops'),               'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Asparagus'),              'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parsley (fresh)'),        'grams', 10,  'servings', 1)
  )
),

-- ─── CURRIES ──────────────────────────────────────────────────────────────────

(
  'Chickpea & Spinach Curry',
  'Curries',
  'Saag chana-style curry: chickpeas and spinach simmered in coconut milk with turmeric, cumin, ginger, and tomato. Iron, folate, and vitamin K powerhouse.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chickpeas'),              'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Milk (canned, full fat)'), 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
),

(
  'Salmon Coconut Curry',
  'Curries',
  'Atlantic salmon simmered in coconut milk with spinach, tomato, turmeric, and ginger. Exceptional for omega-3, vitamin D, and anti-inflammatory compounds.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Salmon (Atlantic)'),      'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Milk (canned, full fat)'), 'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
),

(
  'Red Lentil Dal',
  'Curries',
  'Classic Indian tarka dal: red lentils simmered with onion, tomato, turmeric, cumin, and coriander. One of the most nutrient-dense plant meals possible.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lentils (Red)'),          'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Milk (canned, full fat)'), 'grams', 80, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Chicken Tikka-Style',
  'Curries',
  'Chicken breast marinated in yogurt and spices, simmered in tomato-coconut sauce with turmeric, paprika, and ginger. High in protein, B6, and selenium.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Breast (skinless)'), 'grams', 220, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Plain Yogurt (whole milk)'), 'grams', 80, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Milk (canned, full fat)'), 'grams', 80, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Paprika (sweet)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
),

(
  'Tofu & Sweet Potato Curry',
  'Curries',
  'Vegan golden curry: firm tofu and sweet potato simmered in coconut milk with turmeric, garlic, and spinach. Complete plant nutrition in one bowl.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tofu (Firm)'),            'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sweet Potato'),           'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Milk (canned, full fat)'), 'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
),

(
  'Lamb Rogan Josh-Style',
  'Curries',
  'Slow-braised lamb leg in tomato, onion, garlic, paprika, cumin, and cinnamon. Kashmiri-inspired warmth — rich in iron, zinc, and fat-soluble vitamins.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lamb (leg)'),             'grams', 220, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 20,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Paprika (sweet)'),        'grams', 5,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cinnamon (ground)'),      'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ghee'),                   'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1)
  )
),

(
  'Mung Bean & Coconut Curry',
  'Curries',
  'South Indian-style mung bean curry simmered in coconut milk with tomato, turmeric, mustard-seed spicing, and fresh lemon. High in folate and manganese.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mung Beans'),             'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Milk (canned, full fat)'), 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 12,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Turmeric (ground)'),      'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Oil'),            'grams', 15,  'servings', 1)
  )
),

-- ─── BREAKFAST (new) ──────────────────────────────────────────────────────────

(
  'Chia Seed Pudding Bowl',
  'Breakfast',
  'Coconut milk chia pudding topped with mango, kiwi, and passion fruit. Loaded with omega-3, fiber, calcium, and tropical vitamins.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chia Seeds'),             'grams', 35,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Coconut Milk (canned, full fat)'), 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mango'),                  'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Kiwi'),                   'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Passion Fruit'),          'grams', 50,  'servings', 1)
  )
),

(
  'Hemp Seed Smoothie Bowl',
  'Breakfast',
  'Thick blended bowl with banana, blueberry, soy milk, hemp seeds, flaxseeds, and chia seeds. Outstanding for all essential amino acids and omega-3.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Hemp Seeds'),             'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Banana'),                 'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Blueberry'),              'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Soy Milk (unsweetened)'), 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Flaxseeds'),              'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chia Seeds'),             'grams', 15,  'servings', 1)
  )
),

(
  'Tempeh Breakfast Hash',
  'Breakfast',
  'Crumbled tempeh with sweet potato, onion, red pepper, and paprika in olive oil. A savory protein-forward plant breakfast with all essential amino acids.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tempeh'),                 'grams', 160, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sweet Potato'),           'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Red Bell Pepper'),        'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Paprika (sweet)'),        'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Buckwheat Porridge',
  'Breakfast',
  'Warm buckwheat groat porridge with almond milk, banana, walnuts, cinnamon, and flaxseeds. Gluten-free with complete protein and high magnesium.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Buckwheat'),              'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Almond Milk (unsweetened)'), 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Banana'),                 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Walnuts'),                'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Flaxseeds'),              'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cinnamon (ground)'),      'grams', 3,   'servings', 1)
  )
),

(
  'Egg White Veggie Omelette',
  'Breakfast',
  'Light omelette made with egg whites, spinach, mushroom, and red pepper. High-protein, low-fat breakfast with iron, selenium, and vitamin C.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Egg White'),      'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mushroom (White Button)'), 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Red Bell Pepper'),        'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 10, 'servings', 1)
  )
),

(
  'Millet & Berry Porridge',
  'Breakfast',
  'Millet porridge with oat milk, strawberries, raspberries, and pumpkin seeds. Millet is alkaline, gluten-free, and rich in magnesium and B vitamins.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Millet'),                 'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Oat Milk (unsweetened)'), 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Strawberry'),             'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Raspberry'),              'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pumpkin Seeds'),          'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cinnamon (ground)'),      'grams', 2,   'servings', 1)
  )
),

-- ─── SALADS (new) ─────────────────────────────────────────────────────────────

(
  'Roasted Beet & Walnut Salad',
  'Salads',
  'Earthy roasted beetroot with arugula, walnuts, orange, and olive oil. Brilliant for folate, manganese, nitrates, and heart-healthy fats.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Beetroot'),               'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Arugula'),                'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Walnuts'),                'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Orange'),                 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 20,  'servings', 1)
  )
),

(
  'Pomegranate & Quinoa Salad',
  'Salads',
  'Fluffy quinoa with pomegranate seeds, arugula, walnuts, and lemon dressing. Antioxidant-dense with complete plant protein and polyphenols.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Quinoa (uncooked)'),      'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pomegranate'),            'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Arugula'),                'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Walnuts'),                'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Lentil & Roasted Eggplant Salad',
  'Salads',
  'Green lentils with fire-roasted eggplant, tomato, onion, parsley, cumin, and lemon. Mediterranean-inspired, high in fiber, plant iron, and B vitamins.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lentils (Green)'),        'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Eggplant'),               'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parsley (fresh)'),        'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 3,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Mango & Avocado Salad',
  'Salads',
  'Ripe mango and avocado with arugula, red pepper, lime, and olive oil. Tropical hit of beta-carotene, potassium, vitamin C, and healthy fat.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mango'),                  'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Avocado'),                'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Arugula'),                'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Red Bell Pepper'),        'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lime'),                   'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 10, 'servings', 1)
  )
),

(
  'Watermelon Arugula Salad',
  'Salads',
  'Juicy watermelon with peppery arugula, mozzarella, basil, and olive oil. Light summer salad rich in lycopene, vitamin C, and calcium.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Watermelon'),             'grams', 250, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Arugula'),                'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mozzarella Cheese'),      'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Basil (fresh)'),          'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 12, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lime'),                   'grams', 20,  'servings', 1)
  )
),

(
  'Herring & Potato Salad',
  'Salads',
  'Nordic-inspired herring with potato, onion, and parsley in olive oil. Herring rivals sardines for omega-3 and vitamin D at a lower cost.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Herring'),                'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Potato'),                 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parsley (fresh)'),        'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 25,  'servings', 1)
  )
),

-- ─── BOWLS (new) ──────────────────────────────────────────────────────────────

(
  'Miso Tofu Rice Bowl',
  'Bowls',
  'Brown rice with pan-seared tofu, edamame, carrot, cucumber, and sesame. A complete plant-protein bowl rich in isoflavones, calcium, and manganese.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tofu (Firm)'),            'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Edamame'),                'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Carrot'),                 'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cucumber'),               'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Seeds'),           'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sesame Oil'),             'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 3,   'servings', 1)
  )
),

(
  'Lamb Tabbouleh Bowl',
  'Bowls',
  'Grilled lamb leg over bulgur wheat with tomato, cucumber, parsley, lemon, and olive oil. Middle Eastern classic — iron, zinc, B12, and fresh herbs.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lamb (leg)'),             'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Bulgur Wheat'),           'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cucumber'),               'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parsley (fresh)'),        'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Wild Rice & Mushroom Bowl',
  'Bowls',
  'Nutty wild rice with roasted portobello mushrooms, swiss chard, walnuts, garlic, and thyme. Earthy umami flavours with antioxidants and plant iron.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Wild Rice'),              'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Portobello Mushroom'),    'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Swiss Chard'),            'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Walnuts'),                'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Thyme (dried)'),          'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Cod & Sweet Potato Bowl',
  'Bowls',
  'Baked cod fillet over roasted sweet potato and broccoli with lemon, garlic, and parsley. Lean white fish with B12, iodine, and beta-carotene.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cod'),                    'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Sweet Potato'),           'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Broccoli'),               'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parsley (fresh)'),        'grams', 12,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Barley & Butternut Squash Bowl',
  'Bowls',
  'Pearl barley with roasted butternut squash, brussels sprouts, garlic, and thyme. Beta-glucan fiber from barley lowers cholesterol; dense in vitamins K and C.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Barley (pearled)'),       'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butternut Squash'),       'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brussels Sprouts'),       'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Thyme (dried)'),          'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Black Bean & Avocado Bowl',
  'Bowls',
  'Mexican-inspired bowl: black beans, brown rice, avocado, tomato, corn, lime, and cumin. High in fiber, heart-healthy fats, and plant protein.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Black Beans'),            'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Brown Rice (uncooked)'),  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Avocado'),                'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Corn'),                   'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lime'),                   'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 3,   'servings', 1)
  )
),

(
  'Couscous & Roasted Veg Bowl',
  'Bowls',
  'Fluffy couscous with roasted eggplant, red pepper, zucchini, and chickpeas, seasoned with cumin and lemon. North African-inspired and nutrient-rich.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Couscous (dry)'),         'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Eggplant'),               'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Red Bell Pepper'),        'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Zucchini'),               'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chickpeas'),              'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cumin (ground)'),         'grams', 4,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Rainbow Trout & Lentil Bowl',
  'Bowls',
  'Pan-seared rainbow trout over green lentils with spinach, lemon, and rosemary. Freshwater fish high in omega-3, vitamin D, and B12.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Rainbow Trout'),          'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lentils (Green)'),        'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Rosemary (dried)'),       'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

-- ─── HIGH PROTEIN (new) ───────────────────────────────────────────────────────

(
  'Beef Liver & Caramelized Onions',
  'High Protein',
  'Pan-fried beef liver with caramelized onion and thyme in butter. Gram-for-gram the most nutrient-dense food available — off-the-chart B12, copper, vitamin A, and iron.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Beef Liver'),             'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 20,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Thyme (dried)'),          'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Potato'),                 'grams', 150, 'servings', 1)
  )
),

(
  'Oyster & Herb Plate',
  'High Protein',
  'Shucked oysters with lemon, garlic, parsley, and olive oil. Oysters deliver more zinc per serving than any other food, plus B12, selenium, and copper.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Oysters'),                'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 40,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parsley (fresh)'),        'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 10, 'servings', 1)
  )
),

(
  'Mussels in Herb Broth',
  'High Protein',
  'Steamed mussels in garlic, onion, lemon, and parsley broth with olive oil. Mussels are exceptional for selenium, B12, manganese, and lean protein.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Mussels'),                'grams', 300, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 20,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 60,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parsley (fresh)'),        'grams', 20,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1)
  )
),

(
  'Whey Protein Shake Bowl',
  'High Protein',
  'Whey protein blended with banana, blueberry, almond milk, and flaxseeds. Fast-absorbing protein post-workout with antioxidants and omega-3.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Whey Protein Powder'),    'grams', 35,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Banana'),                 'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Blueberry'),              'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Almond Milk (unsweetened)'), 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Flaxseeds'),              'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chia Seeds'),             'grams', 10,  'servings', 1)
  )
),

(
  'Crab & Avocado Plate',
  'High Protein',
  'Alaskan king crab with avocado, lemon, and parsley. Crab is extraordinarily rich in zinc, B12, selenium, and copper with almost no fat.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Crab (Alaskan King)'),    'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Avocado'),                'grams', 120, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parsley (fresh)'),        'grams', 12,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 10, 'servings', 1)
  )
),

-- ─── PASTAS (new) ─────────────────────────────────────────────────────────────

(
  'Salmon & Spinach Pasta',
  'Pastas',
  'Flaked salmon and wilted spinach in garlic and olive oil over white pasta. Excellent for omega-3, vitamin D, folate, and lean protein.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pasta (dry, white)'),     'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Salmon (Atlantic)'),      'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 20, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parmesan Cheese'),        'grams', 20,  'servings', 1)
  )
),

(
  'Pine Nut Pesto Pasta',
  'Pastas',
  'Basil pesto pasta with pine nuts, parmesan, garlic, and olive oil. Pine nuts are uniquely high in manganese and oleic acid.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pasta (dry, white)'),     'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pine Nuts'),              'grams', 40,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Basil (fresh)'),          'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parmesan Cheese'),        'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 10,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 25, 'servings', 1)
  )
),

(
  'Lamb Ragù Pasta',
  'Pastas',
  'Slow-cooked lamb mince with tomato, rosemary, garlic, and red onion over pasta with parmesan. Iron-rich ragù with deep savoury flavour.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pasta (dry, white)'),     'grams', 100, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lamb (leg)'),             'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Tomato'),                 'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Onion'),                  'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Rosemary (dried)'),       'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 15, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parmesan Cheese'),        'grams', 20,  'servings', 1)
  )
),

-- ─── LOW CARB (new) ───────────────────────────────────────────────────────────

(
  'Cod & Green Bean Skillet',
  'Low Carb',
  'Baked cod with garlic green beans and lemon-parsley butter. Ultra-lean white fish with iodine, B12, and selenium alongside high-fiber vegetables.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cod'),                    'grams', 220, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Green Beans'),            'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 12,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Parsley (fresh)'),        'grams', 12,  'servings', 1)
  )
),

(
  'Halibut & Asparagus',
  'Low Carb',
  'Pan-seared halibut fillet over roasted asparagus with garlic butter and thyme. Halibut is among the leanest fish, high in magnesium and B vitamins.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Halibut'),                'grams', 220, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Asparagus'),              'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 12,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 15,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Thyme (dried)'),          'grams', 2,   'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 25,  'servings', 1)
  )
),

(
  'Duck Breast & Swiss Chard',
  'Low Carb',
  'Sliced pan-seared duck breast with wilted swiss chard and garlic in olive oil. Duck fat adds richness; chard delivers magnesium, iron, and vitamin K.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Duck Breast'),            'grams', 220, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Swiss Chard'),            'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 12,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Olive Oil (extra virgin)'), 'grams', 10, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Rosemary (dried)'),       'grams', 2,   'servings', 1)
  )
),

-- ─── KETO (new) ───────────────────────────────────────────────────────────────

(
  'Lamb Chop & Collard Greens',
  'Keto',
  'Garlic-rosemary lamb leg chop with butter-wilted collard greens. Zero-carb protein and vegetables delivering iron, zinc, vitamin K, and folate.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lamb (leg)'),             'grams', 250, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Collard Greens'),         'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 20,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 12,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Rosemary (dried)'),       'grams', 2,   'servings', 1)
  )
),

(
  'Chicken Liver Butter Plate',
  'Keto',
  'Pan-fried chicken livers in butter and garlic with sautéed arugula. Chicken liver is extraordinarily dense in B12, folate, vitamin A, copper, and iron.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Chicken Liver'),          'grams', 180, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Butter (unsalted)'),      'grams', 25,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Garlic'),                 'grams', 12,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Arugula'),                'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Thyme (dried)'),          'grams', 2,   'servings', 1)
  )
),

-- ─── JUICES (new) ─────────────────────────────────────────────────────────────

(
  'Pomegranate Kale Energizer',
  'Juices',
  'Deep-red pomegranate and apple juice blended with kale and lemon. Polyphenol and antioxidant powerhouse with vitamin K, C, and folate.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Pomegranate'),            'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Kale'),                   'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Apple'),                  'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1)
  )
),

(
  'Papaya Ginger Sunrise',
  'Juices',
  'Tropical papaya and orange juice with ginger and lime. Papaya is one of the richest sources of folate and vitamin C; ginger adds digestive benefits.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Papaya'),                 'grams', 250, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Orange'),                 'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lime'),                   'grams', 30,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Ginger (ground)'),        'grams', 3,   'servings', 1)
  )
),

(
  'Kiwi & Spinach Booster',
  'Juices',
  'Bright green juice with kiwi, spinach, cucumber, and lemon. Kiwi is one of the most vitamin C-dense fruits; spinach adds iron and folate.',
  json_build_array(
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Kiwi'),                   'grams', 200, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Spinach'),                'grams', 80,  'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Cucumber'),               'grams', 150, 'servings', 1),
    json_build_object('id', gen_random_uuid()::text, 'food_id', (SELECT id FROM foods WHERE name = 'Lemon'),                  'grams', 30,  'servings', 1)
  )
);
