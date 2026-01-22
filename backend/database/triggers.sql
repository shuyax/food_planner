--------------------------------------------------------------
-- TRIGGERS FOR updated_at
--------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   -- Compare OLD and NEW row; if any column changes, update updated_at
   IF ROW(NEW.*) IS DISTINCT FROM ROW(OLD.*) THEN
       NEW.updated_at = NOW();
   END IF;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- attach triggers
CREATE TRIGGER trg_foods_updated_at
BEFORE UPDATE ON foods
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ingredients_updated_at
BEFORE UPDATE ON ingredients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_food_ingredient_updated_at
BEFORE UPDATE ON food_ingredient
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_meals_updated_at
BEFORE UPDATE ON meals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------------------
-- TRIGGER FOR price_per_base_unit
--------------------------------------------------------------
CREATE OR REPLACE FUNCTION compute_price_per_base_unit()
RETURNS TRIGGER AS $$
BEGIN
   IF NEW.quantity IS NOT NULL AND NEW.unit_id IS NOT NULL THEN
       NEW.price_per_base_unit = NEW.price / (NEW.quantity * (SELECT conversion_factor FROM units WHERE id = NEW.unit_id));
   ELSE
       NEW.price_per_base_unit = NULL;
   END IF;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_price_compute
BEFORE INSERT OR UPDATE ON ingredient_price_history
FOR EACH ROW
EXECUTE FUNCTION compute_price_per_base_unit();