-- ============================================================
--  NUTRITION DATABASE  |  Supabase / PostgreSQL Schema
--  Version: 1.0
--  Description: Normalized relational schema for a food &
--               nutrition database. Designed for hosting on
--               Supabase and powering a dietary website.
--  Units convention: all nutrient values are per 100g of food
--                    in raw/uncooked state unless noted.
-- ============================================================


-- ────────────────────────────────────────────────────────────
--  1. NUTRIENT CATEGORIES
--     Groups nutrients into logical families (macros, minerals,
--     vitamins, fatty acids) for UI filtering / display.
-- ────────────────────────────────────────────────────────────
CREATE TABLE nutrient_categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);


-- ────────────────────────────────────────────────────────────
--  2. NUTRIENTS
--     Master list of all nutrients tracked in this database.
--     Each nutrient has a canonical unit so values can be
--     compared across foods without ambiguity.
--
--     Unit vocabulary used:
--       kcal  – kilocalories (energy)
--       g     – grams
--       mg    – milligrams  (1 g = 1,000 mg)
--       µg    – micrograms  (1 mg = 1,000 µg)  stored as 'mcg'
--               in ASCII-safe contexts
--       IU    – International Units (legacy vitamin dosing)
-- ────────────────────────────────────────────────────────────
CREATE TABLE nutrients (
    id                    SERIAL PRIMARY KEY,
    name                  VARCHAR(150) NOT NULL UNIQUE,
    common_name           VARCHAR(150),            -- e.g. "Vitamin B1" for "Thiamine"
    unit                  VARCHAR(20)  NOT NULL,   -- kcal | g | mg | mcg
    nutrient_category_id  INTEGER REFERENCES nutrient_categories(id),
    description           TEXT,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
--  3. FOOD CATEGORIES
--     High-level groupings (Fruits, Vegetables, Nuts, etc.)
--     used for filtering, search, and UI categorisation.
-- ────────────────────────────────────────────────────────────
CREATE TABLE food_categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
--  4. FOODS
--     One row per food item.  Each food belongs to one category.
--     data_source_id stores the external reference ID (e.g.
--     USDA FoodData Central FDC ID) so the record can be
--     cross-referenced or updated later.
-- ────────────────────────────────────────────────────────────
CREATE TABLE foods (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(200) NOT NULL,
    common_name       VARCHAR(200),                -- alternative / display name
    food_category_id  INTEGER REFERENCES food_categories(id),
    description       TEXT,
    is_raw            BOOLEAN     DEFAULT TRUE,    -- TRUE = raw/uncooked state
    data_source       VARCHAR(200),               -- e.g. 'USDA FoodData Central'
    data_source_id    VARCHAR(100),               -- e.g. USDA FDC ID
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
--  5. FOOD_NUTRIENTS  (junction / fact table)
--     Stores the per-100 g value for each nutrient for each
--     food.  NULL means the value was not available; 0 means
--     genuinely none detected.
-- ────────────────────────────────────────────────────────────
CREATE TABLE food_nutrients (
    id              SERIAL PRIMARY KEY,
    food_id         INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    nutrient_id     INTEGER NOT NULL REFERENCES nutrients(id),
    value_per_100g  DECIMAL(12, 4),               -- NULL = not available
    notes           TEXT,                          -- e.g. 'estimated' or 'trace'
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (food_id, nutrient_id)
);


-- ────────────────────────────────────────────────────────────
--  6. FOOD_DATA_STATUS  (operational tracking table)
--     Tracks compilation progress during the database build.
--     Not exposed to end-users of the dietary website.
--     Status values:
--       pending       – not yet researched
--       in_progress   – being compiled
--       complete      – all nutrient fields populated
--       missing_data  – some fields unavailable from sources
--       needs_review  – values found but require verification
-- ────────────────────────────────────────────────────────────
CREATE TABLE food_data_status (
    id                  SERIAL PRIMARY KEY,
    food_id             INTEGER REFERENCES foods(id),
    food_name           VARCHAR(200),
    category            VARCHAR(100),
    status              VARCHAR(50) DEFAULT 'pending',
    nutrients_populated INTEGER     DEFAULT 0,
    nutrients_total     INTEGER     DEFAULT 35,    -- matches master nutrient count
    data_source_used    VARCHAR(200),
    notes               TEXT,
    last_updated        TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
--  INDEXES  (improve query performance on the dietary website)
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_foods_category          ON foods(food_category_id);
CREATE INDEX idx_food_nutrients_food     ON food_nutrients(food_id);
CREATE INDEX idx_food_nutrients_nutrient ON food_nutrients(nutrient_id);
CREATE INDEX idx_food_data_status_food   ON food_data_status(food_id);


-- ────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY (Supabase convention)
--     Enable RLS on all tables.  Public read access is granted;
--     write access should be restricted to authenticated
--     admin roles via Supabase policies (configure in dashboard).
-- ────────────────────────────────────────────────────────────
ALTER TABLE nutrient_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrients            ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods                ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_nutrients       ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_data_status     ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can query)
CREATE POLICY "public_read_nutrient_categories"  ON nutrient_categories  FOR SELECT USING (true);
CREATE POLICY "public_read_nutrients"            ON nutrients            FOR SELECT USING (true);
CREATE POLICY "public_read_food_categories"      ON food_categories      FOR SELECT USING (true);
CREATE POLICY "public_read_foods"                ON foods                FOR SELECT USING (true);
CREATE POLICY "public_read_food_nutrients"       ON food_nutrients       FOR SELECT USING (true);
-- food_data_status is internal only — no public read policy
