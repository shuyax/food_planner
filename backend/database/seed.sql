INSERT INTO units (name, abbreviation, base_unit, conversion_factor, unit_type)
VALUES
-- Metric weight units
('gram', 'g', 'g', 1, 'weight'),
('kilogram', 'kg', 'g', 1000, 'weight'),
('milligram', 'mg', 'g', 0.001, 'weight'),

-- Metric volume units
('milliliter', 'ml', 'ml', 1, 'volume'),
('liter', 'l', 'ml', 1000, 'volume'),

-- Count / pieces
('piece', 'pcs', 'pcs', 1, 'count'),
('slice', 'slice', 'pcs', 1, 'count'),

-- US cooking volume units
('teaspoon', 'tsp', 'ml', 4.92892, 'volume'),
('tablespoon', 'tbsp', 'ml', 14.7868, 'volume'),
('fluid ounce', 'fl oz', 'ml', 29.5735, 'volume'),
('cup', 'cup', 'ml', 236.588, 'volume'),
('pint', 'pt', 'ml', 473.176, 'volume'),
('quart', 'qt', 'ml', 946.353, 'volume'),
('gallon', 'gal', 'ml', 3785.41, 'volume'),

-- US cooking weight units
('ounce', 'oz', 'g', 28.3495, 'weight'),
('pound', 'lb', 'g', 453.592, 'weight');

