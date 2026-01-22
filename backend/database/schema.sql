

-- ENUM types
--------------------------------------------------------------
-- unit types
-- CREATE TYPE unit_enum AS ENUM ('weight', 'volume', 'count');
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_enum') THEN
       CREATE TYPE unit_enum AS ENUM ('weight', 'volume', 'count');
   END IF;
END$$;

-- meal types
-- CREATE TYPE meal_enum AS ENUM ('breakfast', 'lunch', 'dinner', 'snack', 'drink');
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meal_enum') THEN
       CREATE TYPE meal_enum AS ENUM ('breakfast', 'lunch', 'dinner', 'snack', 'drink');
   END IF;
END$$;

--------------------------------------------------------------
-- UNITS (canonical list)
--------------------------------------------------------------
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,          -- e.g., "gram"
    abbreviation TEXT UNIQUE,           -- e.g., "g"
    base_unit TEXT,                     -- e.g., "g"
    conversion_factor NUMERIC,          -- e.g., 1000 (kg → g)
    unit_type unit_enum                 -- "weight", "volume", "count"
);

--------------------------------------------------------------
-- LOCATIONS (store list)
--------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE           -- e.g., "Walmart"
);

-- ------------------------------------------------------------
-- foods: main entity (a dish, recipe, etc.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS foods (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- index to speed up name lookups (optional)
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods (name);

-- ------------------------------------------------------------
-- ingredients: canonical ingredient list
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    canonical_unit_id INT REFERENCES units(id),       -- default unit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients (name);

-- ------------------------------------------------------------
-- food_ingredient: join table for many-to-many relationship
-- - stores optional quantity and unit for that specific usage
-- - composite UNIQUE to avoid duplicate pairs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_ingredient (
    id SERIAL PRIMARY KEY,
    food_id INT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    ingredient_id INT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity NUMERIC(10,3),             -- amount used in recipe
    unit_id INT REFERENCES units(id),   -- override canonical unit if needed
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT uq_food_ingredient UNIQUE (food_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS idx_food_ing_food ON food_ingredient (food_id);
CREATE INDEX IF NOT EXISTS idx_food_ing_ing ON food_ingredient (ingredient_id);

-- ------------------------------------------------------------
-- ingredient_price_history: historical prices for ingredients
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingredient_price_history (
    id SERIAL PRIMARY KEY,
    ingredient_id INT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    price NUMERIC(12,2) NOT NULL,       -- price per quantity
    quantity NUMERIC(10,3) NOT NULL,             -- size of package
    price_per_base_unit NUMERIC(16,8),   -- computed by trigger
    unit_id INT REFERENCES units(id) ON DELETE SET NULL,   -- for the quantity
    location_id INT REFERENCES locations(id),  -- where price was recorded
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_ing ON ingredient_price_history (ingredient_id);
CREATE INDEX IF NOT EXISTS idx_price_date ON ingredient_price_history (recorded_at);

-- ------------------------------------------------------------
-- meals: grouping of foods (breakfast, lunch, etc.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meals (
    id SERIAL PRIMARY KEY,
    type meal_enum,
    date DATE NOT NULL,                       
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT uq_meal_type_date UNIQUE (type, date)
);


-- meal_food: many-to-many between meals and foods
CREATE TABLE IF NOT EXISTS meal_food (
    id SERIAL PRIMARY KEY,
    meal_id INT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    food_id INT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    cost NUMERIC(12,4),
    CONSTRAINT uq_meal_food UNIQUE (meal_id, food_id)
);

CREATE TABLE IF NOT EXISTS food_images (
    id SERIAL PRIMARY KEY,
    food_id INT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_images_food ON food_images (food_id);

