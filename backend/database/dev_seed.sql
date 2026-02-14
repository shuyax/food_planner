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
('beef jerky', 6),
('zucchini', 6),
('spam', 6),
('egg', 6)
;

INSERT INTO foods (name, description)
VALUES
('tomato beef udon with cheese', 'how to cook tomato beef udon with cheese'),
('stir fry bok choy', 'how to make spicy stir fry bok choy with garlic'), 
('spicy sour noodle', 'how to make yuanxian big glass noodle'),
('taro milk tea', 'how to make taro milk tea'),
('overnight oats', 'how to make overnight oats'),
('beef jerky', ''),
('stir fry zucchini spam egg',
 'Heat a pan or wok on medium-high
Add a little oil (Spam has fat, so do not overdo it)
Fry Spam until golden and crispy
Push it to one side of the pan
Add a bit more oil if needed
Pour in beaten eggs
Gently scramble until just set
Mix eggs with Spam
Remove everything from the pan and set aside
Add a touch of oil
Add garlic, stir for ~10 seconds until fragrant
Add zucchini
Stir-fry on high heat for 2 to 3 minutes
Add Spam + eggs back in
Season:
Small splash soy sauce (go light—Spam is salty)
Optional oyster sauce
Pepper or chili
Toss everything for 30 to 60 seconds')
;

INSERT INTO food_ingredient (food_id, ingredient_id, quantity, unit_id, note)
VALUES 
(1, 1, 3, 6, NULL),
(1, 2, 1.5, 16, NULL),
(1, 3, 6, 7, NULL), 
(4, 4, 1, 9, NULL),
(4, 5, 2, 11, NULL),
(2, 6, 1.9, 16, NULL),
(5, 7, 1, 11, NULL),
(5, 8, 2, 9, NULL),
(5, 9, 1, 11, NULL),
(5, 10, 2, 11, NULL),
(3, 11, 2, 6, NULL),
(6, 12, 0.3, 6, NULL),
(7, 13, 3, 6, 'Cut into large chunks'),
(7, 14, 1, 6, 'Cut the can of spam into small cubes'),
(7, 15, 2, 6, 'beaten eggs')
;

INSERT INTO meals (type, date)
VALUES 
('dinner', '2026-01-05'),
('drink', '2026-01-05'),
('dinner', '2026-01-06'),
('breakfast', '2026-01-05'),
('lunch', '2026-01-05'),
('snack', '2026-01-05'),
('dinner', '2026-01-16'),
('dinner', '2026-01-07'),
('lunch', '2026-01-07'),
('breakfast', '2026-01-07'),
('lunch', '2026-01-08')
;

INSERT INTO meal_food (meal_id, food_id)
VALUES (1, 1),
(2, 4),
(3, 2),
(4, 5),
(5, 3),
(6, 6),
(7, 2),
(9, 7),
(11, 2)
;


