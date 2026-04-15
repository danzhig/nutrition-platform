-- ============================================================
--  SEED: Reference tables
--  Run AFTER schema.sql, BEFORE any food batch seeds.
--  Populates: nutrient_categories, nutrients, food_categories
-- ============================================================


-- ────────────────────────────────────────────────────────────
--  NUTRIENT CATEGORIES
-- ────────────────────────────────────────────────────────────
INSERT INTO nutrient_categories (id, name, description) VALUES
  (1, 'Macronutrient', 'The main energy-providing nutrients: calories, protein, fat, carbohydrates, fibre, sugars, and water'),
  (2, 'Fatty Acid',    'Sub-types of dietary fat classified by their molecular structure: saturated, unsaturated, omega fatty acids, trans fats, and cholesterol'),
  (3, 'Mineral',       'Inorganic micronutrients required for bone structure, nerve signalling, enzyme function, and fluid balance'),
  (4, 'Vitamin',       'Organic micronutrients required in small amounts for metabolism, immune function, and cell growth');


-- ────────────────────────────────────────────────────────────
--  NUTRIENTS  (39 total)
--  id | name | common_name | unit | nutrient_category_id
-- ────────────────────────────────────────────────────────────
INSERT INTO nutrients (id, name, common_name, unit, nutrient_category_id, description) VALUES
  -- MACRONUTRIENTS
  ( 1, 'Calories',             NULL,                'kcal', 1, 'Energy content per 100 g. A kilocalorie is the energy needed to raise 1 kg of water by 1°C. Commonly labelled as Calories on food packaging.'),
  ( 2, 'Water',                NULL,                'g',    1, 'Water content of the food. Higher water content typically means lower calorie density.'),
  ( 3, 'Protein',              NULL,                'g',    1, 'Total protein — chains of amino acids essential for tissue repair, enzymes, and hormones.'),
  ( 4, 'Total Fat',            NULL,                'g',    1, 'All fat combined. Essential for cell membranes, hormone production, and fat-soluble vitamin absorption.'),
  ( 5, 'Carbohydrates',        NULL,                'g',    1, 'Total carbohydrates — the body''s primary energy source. Includes sugars, starches, and fibre.'),
  ( 6, 'Dietary Fibre',        NULL,                'g',    1, 'Indigestible plant material that feeds gut bacteria, regulates blood sugar, and supports bowel health.'),
  ( 7, 'Total Sugars',         NULL,                'g',    1, 'All sugars — naturally occurring (e.g. fructose in fruit) and added. A subset of total carbohydrates.'),
  -- FATTY ACIDS
  ( 8, 'Saturated Fat',        NULL,                'g',    2, 'Fats with no double bonds. Found mainly in animal products. Associated with elevated LDL cholesterol at high intakes.'),
  ( 9, 'Monounsaturated Fat',  'MUFA',              'g',    2, 'Fats with one double bond. Found in olive oil, avocados, and nuts. Generally considered heart-healthy.'),
  (10, 'Polyunsaturated Fat',  'PUFA',              'g',    2, 'Fats with multiple double bonds. Includes the Omega-3 and Omega-6 families. Essential for brain function.'),
  (11, 'Omega-3 Fatty Acids',  NULL,                'g',    2, 'Family of polyunsaturated fats (ALA, EPA, DHA) critical for brain health and inflammation regulation.'),
  (12, 'Omega-6 Fatty Acids',  NULL,                'g',    2, 'Family of polyunsaturated fats (mainly Linoleic Acid). Important for cell structure; balance with Omega-3 matters.'),
  (13, 'Trans Fat',            NULL,                'g',    2, 'Artificially hydrogenated fats. Associated with cardiovascular disease; most countries restrict their use.'),
  (14, 'Cholesterol',          NULL,                'mg',   2, 'A sterol found only in animal products. The body also synthesises its own cholesterol.'),
  -- MINERALS
  (15, 'Calcium',              NULL,                'mg',   3, 'Essential for bone and teeth structure, muscle contraction, nerve signalling, and blood clotting.'),
  (16, 'Iron',                 NULL,                'mg',   3, 'Required for haemoglobin — the oxygen-carrying protein in red blood cells. Deficiency causes anaemia.'),
  (17, 'Magnesium',            NULL,                'mg',   3, 'Involved in 300+ enzymatic reactions including energy production, muscle and nerve function.'),
  (18, 'Phosphorus',           NULL,                'mg',   3, 'Works with calcium to build bones and teeth; also key in ATP energy metabolism.'),
  (19, 'Potassium',            NULL,                'mg',   3, 'Key electrolyte regulating fluid balance, nerve signals, and muscle contractions including the heart.'),
  (20, 'Sodium',               NULL,                'mg',   3, 'Main extracellular electrolyte. Essential for nerve function; high intake linked to elevated blood pressure.'),
  (21, 'Zinc',                 NULL,                'mg',   3, 'Supports immune function, wound healing, DNA synthesis, and sense of taste and smell.'),
  (22, 'Copper',               NULL,                'mg',   3, 'Required for iron metabolism, connective tissue formation, and antioxidant enzyme activity.'),
  (23, 'Manganese',            NULL,                'mg',   3, 'Activates enzymes for bone formation, metabolism, and antioxidant defence.'),
  (24, 'Selenium',             NULL,                'mcg',  3, 'Antioxidant mineral supporting thyroid hormone metabolism and immune function. Found richly in Brazil nuts and seafood.'),
  (25, 'Iodine',               NULL,                'mcg',  3, 'Essential for thyroid hormone synthesis which regulates metabolism and development.'),
  (26, 'Chromium',             NULL,                'mcg',  3, 'Enhances insulin action and is involved in carbohydrate, fat, and protein metabolism.'),
  -- VITAMINS
  (27, 'Vitamin A',            'Retinol Equivalents','mcg', 4, 'Fat-soluble vitamin critical for vision, immune function, and cell growth. Measured in mcg RAE (Retinol Activity Equivalents).'),
  (28, 'Vitamin C',            'Ascorbic Acid',     'mg',   4, 'Water-soluble antioxidant essential for collagen synthesis, immune function, and iron absorption.'),
  (29, 'Vitamin D',            'Calciferol',        'mcg',  4, 'Fat-soluble vitamin synthesised by skin in sunlight. Essential for calcium absorption and bone health. 1 mcg = 40 IU.'),
  (30, 'Vitamin E',            'Tocopherol',        'mg',   4, 'Fat-soluble antioxidant that protects cell membranes from oxidative damage.'),
  (31, 'Vitamin K',            NULL,                'mcg',  4, 'Fat-soluble vitamin with two forms: K1 (plants, blood clotting) and K2 (fermented foods, bone health).'),
  (32, 'Thiamine',             'Vitamin B1',        'mg',   4, 'Water-soluble B vitamin essential for converting carbohydrates into energy and supporting nerve function.'),
  (33, 'Riboflavin',           'Vitamin B2',        'mg',   4, 'Water-soluble B vitamin involved in energy metabolism and cellular growth.'),
  (34, 'Niacin',               'Vitamin B3',        'mg',   4, 'Water-soluble B vitamin critical for energy metabolism and DNA repair.'),
  (35, 'Pantothenic Acid',     'Vitamin B5',        'mg',   4, 'Water-soluble B vitamin needed to synthesise Coenzyme A (CoA), central to fatty acid metabolism.'),
  (36, 'Vitamin B6',           'Pyridoxine',        'mg',   4, 'Water-soluble B vitamin involved in amino acid metabolism, neurotransmitter synthesis, and immune function.'),
  (37, 'Folate',               'Vitamin B9',        'mcg',  4, 'Water-soluble B vitamin essential for DNA synthesis. Critical during pregnancy. Measured as mcg DFE.'),
  (38, 'Vitamin B12',          'Cobalamin',         'mcg',  4, 'Water-soluble B vitamin for nerve function and red blood cell formation. Found only in animal products.'),
  (39, 'Choline',              NULL,                'mg',   4, 'Essential nutrient for cell membrane structure, fat transport, and acetylcholine neurotransmitter synthesis.');


-- ────────────────────────────────────────────────────────────
--  FOOD CATEGORIES  (15)
-- ────────────────────────────────────────────────────────────
INSERT INTO food_categories (id, name, description) VALUES
  ( 1, 'Fruits',              'Fresh and dried fruits including berries, citrus, tropical, and stone fruits'),
  ( 2, 'Vegetables',          'Non-leafy vegetables including root vegetables, squash, peppers, alliums, and mushrooms'),
  ( 3, 'Leafy Greens',        'Edible leaves and salad greens including spinach, kale, lettuce, and chard'),
  ( 4, 'Legumes',             'Beans, lentils, peas, and soy-based products high in plant protein and fibre'),
  ( 5, 'Nuts',                'Tree nuts including almonds, walnuts, cashews, pistachios, and similar'),
  ( 6, 'Seeds',               'Edible seeds including chia, flax, hemp, sunflower, and pumpkin seeds'),
  ( 7, 'Grains & Cereals',    'Whole and refined grains including rice, oats, wheat, barley, quinoa, and grain products'),
  ( 8, 'Red Meat',            'Beef, lamb, pork, and other red meats in raw state'),
  ( 9, 'Poultry',             'Chicken, turkey, duck, and other poultry in raw state'),
  (10, 'Fish & Seafood',      'Fish, shellfish, and other seafood in raw or minimally processed state'),
  (11, 'Eggs',                'Whole eggs and egg components from various poultry'),
  (12, 'Dairy',               'Milk, cheese, yogurt, butter, and cream from animal sources'),
  (13, 'Dairy Alternatives',  'Plant-based milk and yogurt alternatives such as oat, almond, soy, and coconut'),
  (14, 'Oils & Fats',         'Cooking oils, animal fats, and spreads'),
  (15, 'Herbs & Spices',      'Dried and fresh culinary herbs and spices');
