-- ============================================================
--  NUTRITION DATABASE  |  Supabase / PostgreSQL Schema
--  Description: Normalized relational schema for a food &
--               nutrition database. Designed for hosting on
--               Supabase and powering a dietary website.
--  Units convention: all nutrient values are per 100g of food
--                    in raw/uncooked state unless noted.
-- ============================================================


-- ────────────────────────────────────────────────────────────
--  1. NUTRIENT CATEGORIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE nutrient_categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);


-- ────────────────────────────────────────────────────────────
--  2. NUTRIENTS
--     Unit vocabulary: kcal | g | mg | mcg | IU
-- ────────────────────────────────────────────────────────────
CREATE TABLE nutrients (
    id                    SERIAL PRIMARY KEY,
    name                  VARCHAR(150) NOT NULL UNIQUE,
    common_name           VARCHAR(150),
    unit                  VARCHAR(20)  NOT NULL,
    nutrient_category_id  INTEGER REFERENCES nutrient_categories(id),
    description           TEXT,
    body_role             TEXT,
    deficiency_symptoms   TEXT,
    excess_symptoms       TEXT,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
--  3. FOOD CATEGORIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE food_categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
--  4. FOODS
-- ────────────────────────────────────────────────────────────
CREATE TABLE foods (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(200) NOT NULL,
    common_name       VARCHAR(200),
    food_category_id  INTEGER REFERENCES food_categories(id),
    description       TEXT,
    is_raw            BOOLEAN     DEFAULT TRUE,
    data_source       VARCHAR(200),
    data_source_id    VARCHAR(100),
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
--  5. FOOD_NUTRIENTS  (junction / fact table)
--     NULL value_per_100g = not available; 0 = none detected.
-- ────────────────────────────────────────────────────────────
CREATE TABLE food_nutrients (
    id              SERIAL PRIMARY KEY,
    food_id         INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    nutrient_id     INTEGER NOT NULL REFERENCES nutrients(id),
    value_per_100g  DECIMAL(12, 4),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (food_id, nutrient_id)
);


-- ────────────────────────────────────────────────────────────
--  6. FOOD_DATA_STATUS  (internal build tracking, not public)
--     status values: pending | in_progress | complete |
--                    missing_data | needs_review
-- ────────────────────────────────────────────────────────────
CREATE TABLE food_data_status (
    id                  SERIAL PRIMARY KEY,
    food_id             INTEGER REFERENCES foods(id),
    food_name           VARCHAR(200),
    category            VARCHAR(100),
    status              VARCHAR(50) DEFAULT 'pending',
    nutrients_populated INTEGER     DEFAULT 0,
    nutrients_total     INTEGER     DEFAULT 35,
    data_source_used    VARCHAR(200),
    notes               TEXT,
    last_updated        TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
--  7. PRESET_MEALS
--     Curated meals shipped with the app; not user-specific.
--     items: JSONB array of { food_id, food_name, amount_g }
-- ────────────────────────────────────────────────────────────
CREATE TABLE preset_meals (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT        NOT NULL,
    category    TEXT        NOT NULL,
    description TEXT,
    items       JSONB       NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
--  8. SAVED_MEALS  (per-user)
--     items: JSONB array of { food_id, food_name, amount_g }
-- ────────────────────────────────────────────────────────────
CREATE TABLE saved_meals (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    name        TEXT        NOT NULL,
    items       JSONB       NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
--  9. MEAL_PLANS  (per-user)
--     meals: JSONB array of meal entries
--     rda_selection: which RDA profile key applies
-- ────────────────────────────────────────────────────────────
CREATE TABLE meal_plans (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID        NOT NULL,
    name           TEXT        NOT NULL,
    meals          JSONB       NOT NULL,
    rda_selection  TEXT        NOT NULL DEFAULT '',
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
--  10. USER_RDA_PROFILES  (per-user custom RDA targets)
--      values: JSONB map of nutrient_id → target value
-- ────────────────────────────────────────────────────────────
CREATE TABLE user_rda_profiles (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    name        TEXT        NOT NULL,
    values      JSONB       NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
--  11. USER_FILTER_SETS  (per-user saved filter/sort state)
--      state: JSONB snapshot of the active filter UI state
-- ────────────────────────────────────────────────────────────
CREATE TABLE user_filter_sets (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    name        TEXT        NOT NULL,
    state       JSONB       NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────
--  INDEXES
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_foods_category          ON foods(food_category_id);
CREATE INDEX idx_food_nutrients_food     ON food_nutrients(food_id);
CREATE INDEX idx_food_nutrients_nutrient ON food_nutrients(nutrient_id);
CREATE INDEX idx_food_data_status_food   ON food_data_status(food_id);
CREATE INDEX idx_saved_meals_user        ON saved_meals(user_id);
CREATE INDEX idx_meal_plans_user         ON meal_plans(user_id);
CREATE INDEX idx_user_rda_profiles_user  ON user_rda_profiles(user_id);
CREATE INDEX idx_user_filter_sets_user   ON user_filter_sets(user_id);
CREATE INDEX idx_preset_meals_category   ON preset_meals(category);


-- ────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
ALTER TABLE nutrient_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrients            ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods                ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_nutrients       ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_data_status     ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_meals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_meals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rda_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_filter_sets     ENABLE ROW LEVEL SECURITY;

-- Public read (unauthenticated)
CREATE POLICY "public_read_nutrient_categories"  ON nutrient_categories  FOR SELECT USING (true);
CREATE POLICY "public_read_nutrients"            ON nutrients            FOR SELECT USING (true);
CREATE POLICY "public_read_food_categories"      ON food_categories      FOR SELECT USING (true);
CREATE POLICY "public_read_foods"                ON foods                FOR SELECT USING (true);
CREATE POLICY "public_read_food_nutrients"       ON food_nutrients       FOR SELECT USING (true);
CREATE POLICY "public_read_preset_meals"         ON preset_meals         FOR SELECT USING (true);

-- Per-user access (authenticated only)
CREATE POLICY "user_access_saved_meals"       ON saved_meals       USING (auth.uid() = user_id);
CREATE POLICY "user_access_meal_plans"        ON meal_plans        USING (auth.uid() = user_id);
CREATE POLICY "user_access_rda_profiles"      ON user_rda_profiles USING (auth.uid() = user_id);
CREATE POLICY "user_access_filter_sets"       ON user_filter_sets  USING (auth.uid() = user_id);
-- food_data_status is internal only — no public policy
