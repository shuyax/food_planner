INSERT INTO ingredients (name, canonical_unit_id)
VALUES 
('tomato', 6),
('beef', 16),
('cheese', 7),
('taro powder', 9),
('milk', 11),
('bok choy', 16),
('oats', 11),
('cacao powder', 9),
('yogurt', 11),
('frozen blueberry', 11),
('yuanxian big glass noodle', 6),
('beef jerky', 6)
;

INSERT INTO foods (name, description)
VALUES
('tomato beef udon with cheese', 'how to cook tomato beef udon with cheese'),
('stir fry bok choy', 'how to make spicy stir fry bok choy with garlic'), 
('spicy sour noodle', 'how to make yuanxian big glass noodle'),
('taro milk tea', 'how to make taro milk tea'),
('overnight oats', 'how to make overnight oats'),
('beef jerky', '')
;

INSERT INTO food_ingredient (food_id, ingredient_id, quantity, unit_id)
VALUES 
(1, 1, 3, 6), 
(1, 2, 1.5, 16), 
(1, 3, 6, 7), 
(4, 4, 1, 9),
(4, 5, 2, 11),
(2, 6, 1.9, 16),
(5, 7, 1, 11),
(5, 8, 2, 9),
(5, 9, 1, 11),
(5, 10, 2, 11),
(3, 11, 2, 6),
(6, 12, 0.3, 6)
;

INSERT INTO meals (type, date)
VALUES 
('dinner', '2026-01-05'),
('drink', '2026-01-05'),
('dinner', '2026-01-06'),
('breakfast', '2026-01-05'),
('lunch', '2026-01-05'),
('snack', '2026-01-05')
;

INSERT INTO meal_food (meal_id, food_id)
VALUES (1, 1),
(2, 4),
(3, 2),
(4, 5),
(5, 3),
(6, 6)
;


