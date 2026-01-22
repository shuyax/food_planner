const pool = require('../../database/pool');
const {
    createMeal,
    getMealById,
    addFoodToMeal,
    updateMealFoodCost,
    getRelatedFoods,
    getMeals,
    getMealTypes
} = require('../../src/services/MealService');

describe('meal post service', () => {
    afterEach(async () => {
        await pool.query(`DELETE FROM meals`);
    });
    test('createMeal adds a new meal entry in meals table and returns a meal id', async () => {
        const mealType = 'dinner';
        const mealDate = '2025-12-5';
        const mealId = await createMeal(mealType, mealDate);
        const { rows: mealRows } = await pool.query(
            `SELECT type, date
            FROM meals
            WHERE id=$1`,
            [mealId]
        );
        expect(mealRows).not.toBeNull();
        expect(mealRows.length).toBe(1);
        expect(mealRows[0].type).toBe(mealType);
        expect(new Date(mealRows[0].date)).toEqual(new Date(mealDate));
    });

    test('createMeal with an existing meal entry in meals table returns the existing meal id', async () => {
        const mealType = 'dinner';
        const mealDate = '2025-12-5';
        const mealId = await createMeal(mealType, mealDate);
        const newMealId = await createMeal(mealType, mealDate);
        expect(mealId).toBe(newMealId);
    });
});

describe('meal put service', () => {
    let foodId;
    const foodName = 'stir fry bok choy';
    const foodDescription = 'spicy stir fry bok choy with garlic';
    const mealType = 'dinner';
    const mealDate = '2025-12-5';
    let quantity;
    let ingredient1Id, price, purchaseQuant, baseUnitId, locationId;
    let mealId, mealFoodId;


    beforeAll(async () => {
        // create food
        const { rows } = await pool.query(
            `INSERT INTO foods (name, description)
            VALUES ($1, $2)
            RETURNING id`,
            [foodName, foodDescription]
        );
        foodId = rows[0].id;

        // create ingredient and add to food
        const ingredient1 = 'bok choy'; 
        const canonicalUnit1Id = 16;
        const { rows: ingredientRows } = await pool.query(
            `INSERT INTO ingredients(name, canonical_unit_id)
            VALUES ($1, $2)
            RETURNING id`,
            [ingredient1, canonicalUnit1Id]
        );
        ingredient1Id = ingredientRows[0].id;
        quantity = 1;
        unitId = 16;
        const { rows: foodIngredientRows } = await pool.query(
            `INSERT INTO food_ingredient (food_id, ingredient_id, quantity, unit_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [foodId, ingredient1Id, quantity, unitId]
        );
        const foodIngredientId = foodIngredientRows[0].id;

        // create location
        const location = 'enson market'
        const { rows: locationRows } = await pool.query(
            `INSERT INTO locations (name)
            VALUES ($1)
            RETURNING id`,
            [location]
        );
        locationId = locationRows[0].id;

        // create ingredient price history
        price = 2.45;
        purchaseQuant = 1.645 * 453.592;
        const baseUnitId = 1
        const { rows: ingredientPriceHistory } = await pool.query(
            `INSERT INTO ingredient_price_history (ingredient_id, price, quantity, unit_id, location_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
            [ingredient1Id, price, purchaseQuant, baseUnitId, locationId]
        );
        const ingredientPriceHistoryId = ingredientPriceHistory[0].id

        mealId = await createMeal(mealType, mealDate);
        mealFoodId = await addFoodToMeal(mealId, foodId);

    });
    afterAll(async () => {
        await pool.query(`DELETE FROM foods`);
        await pool.query(`DELETE FROM meals`);
        await pool.query(`DELETE FROM ingredients`);
        await pool.query(`DELETE FROM locations`);
    });

    test('addFoodToMeal adds an existing food without ingredients costs to a meal in meal_food table and returns meal_food id', async () => {
        const { rows: mealFoodRows } = await pool.query(
            `SELECT *
            FROM meal_food
            WHERE id=$1`,
            [mealFoodId]
        );
        expect(mealFoodRows).not.toBeNull();
        expect(mealFoodRows.length).toBe(1);
        expect(mealFoodRows[0].meal_id).toBe(mealId);
        expect(mealFoodRows[0].food_id).toBe(foodId);
        expect(Number(mealFoodRows[0].cost)).toBeCloseTo(price/(purchaseQuant / 453.592) * quantity);
    });

    test('updateMealFoodCost updates the costs of a food based on the latest purchase history and returns a new cost', async () => {
        // insert a latest ingredient purchase history
        const newPrice = 5;
        const newPurchaseQuant = 1.5 * 453.592;
        const baseUnitId = 1
        await pool.query(
            `INSERT INTO ingredient_price_history (ingredient_id, price, quantity, unit_id, location_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
            [ingredient1Id, newPrice, newPurchaseQuant, baseUnitId, locationId]
        );
        const newCost = await updateMealFoodCost(mealFoodId);
        expect(newCost).toBeCloseTo(newPrice/(newPurchaseQuant / 453.592) * quantity);
    });
});

describe('meal get service', () => {
    let food1Id, food2Id, food3Id;
    const food1Name = 'stir fry bok choy';
    const food1Description = 'spicy stir fry bok choy with garlic';
    const food2Name = 'spicy sour noodle';
    const food2Description = 'yuanxian big glass noodle';
    const mealType1 = 'dinner';
    const mealDate1 = '2025-12-5';
    const mealType2 = 'drink';
    const mealDate2 = '2025-12-16';
    const drinkName = 'taro milk tea';
    let quantity1, quantity2, quantity3, quantity4;
    let ingredient1Id, price1, purchaseQuant1, baseUnitId1, location1Id;
    let ingredient2Id, price2, purchaseQuant2, baseUnitId2, location2Id;
    let ingredient3Id, price3, purchaseQuant3, baseUnitId3, location3Id;
    let ingredient4Id, price4, purchaseQuant4, baseUnitId4, location4Id;
    let meal1Id, meal2Id, mealFood1Id, mealFood2Id, mealFood3Id;


    beforeAll(async () => {
        // create foods
        const { rows } = await pool.query(
            `INSERT INTO foods (name, description)
            VALUES ($1, $2), ($3, $4)
            RETURNING id`,
            [food1Name, food1Description, food2Name, food2Description]
        );
        [food1Id, food2Id] = rows.map(r => r.id);

        const { rows:foodRows } = await pool.query(
            `INSERT INTO foods (name)
            VALUES ($1)
            RETURNING id`,
            [drinkName]
        );
        food3Id = foodRows[0].id;

        // create ingredients and add to food
        const ingredient1 = 'bok choy'; 
        const canonicalUnit1Id = 16;
        const ingredient2 = 'yuanxian big glass noodle';
        const canonicalUnit2Id = 6;
        const ingredient3 = 'taro powder';
        const canonicalUnit3Id = 9; //tbsp
        const ingredient4 = 'milk';
        const canonicalUnit4Id = 11; //cup
        const { rows: ingredientRows } = await pool.query(
            `INSERT INTO ingredients(name, canonical_unit_id)
            VALUES ($1, $2), ($3, $4), ($5, $6), ($7, $8)
            RETURNING id`,
            [ingredient1, canonicalUnit1Id, ingredient2, canonicalUnit2Id, ingredient3, canonicalUnit3Id, ingredient4, canonicalUnit4Id]
        );
        [ingredient1Id, ingredient2Id, ingredient3Id, ingredient4Id] = ingredientRows.map(r => r.id);
        quantity1 = 1;
        unitId1 = 16;
        quantity2 = 2;
        unitId2 = 6;
        quantity3 = 2;
        unitId3 = 9;
        quantity4 = 3;
        unitId4 = 11;
        const { rows: foodIngredientRows } = await pool.query(
            `INSERT INTO food_ingredient (food_id, ingredient_id, quantity, unit_id)
            VALUES ($1, $2, $3, $4), ($5, $6, $7, $8), ($9, $10, $11, $12), ($9, $13, $14, $15)
            RETURNING id`,
            [food1Id, ingredient1Id, quantity1, unitId1, food2Id, ingredient2Id, quantity2, unitId2, food3Id, ingredient3Id, quantity3, unitId3, ingredient4Id, quantity4, unitId4]
        );

        // create location
        const location1 = 'enson market';
        const location2 = 'yami';
        const location3 = 'amazon';
        const location4 = 'giant eagle';
        const { rows: locationRows } = await pool.query(
            `INSERT INTO locations (name)
            VALUES ($1), ($2), ($3), ($4)
            RETURNING id`,
            [location1, location2, location3, location4]
        );
        [location1Id, location2Id, location3Id, location4Id] = locationRows.map(r => r.id);

        // create ingredient price history
        price1 = 2.45;
        purchaseQuant1 = 1.645 * 453.592;
        baseUnitId1 = 1;
        price2 = 1.99;
        purchaseQuant2 = 5;
        baseUnitId2 = 6;
        price3 = 28.42;
        purchaseQuant3 = 1000;
        baseUnitId3 = 1;
        price4 = 4.79;
        purchaseQuant4 = 3780;
        baseUnitId4 = 4;

        const { rows: ingredientPriceHistory } = await pool.query(
            `INSERT INTO ingredient_price_history (ingredient_id, price, quantity, unit_id, location_id)
            VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10), ($11, $12, $13, $14, $15), ($16, $17, $18, $19, $20)
            RETURNING id`,
            [ingredient1Id, price1, purchaseQuant1, baseUnitId1, location1Id, ingredient2Id, price2, purchaseQuant2, baseUnitId2, location2Id,
            ingredient3Id, price3, purchaseQuant3, baseUnitId3, location3Id,
            ingredient4Id, price4, purchaseQuant4, baseUnitId4, location4Id]
        );

        meal1Id = await createMeal(mealType1, mealDate1);
        meal2Id = await createMeal(mealType2, mealDate2);
        
        mealFood1Id = await addFoodToMeal(meal1Id, food1Id);
        mealFood2Id = await addFoodToMeal(meal1Id, food2Id);
        mealFood3Id = await addFoodToMeal(meal2Id, food3Id);

    });
    afterAll(async () => {
        await pool.query(`DELETE FROM foods`);
        await pool.query(`DELETE FROM ingredients`);
        await pool.query(`DELETE FROM meals`);
        await pool.query(`DELETE FROM locations`);
    });

    test('getRelatedFoods turns food ids, names, descriptions and costs in that meal, order by name', async () => {
        const relatedFoods = await getRelatedFoods(meal1Id);
        expect(relatedFoods).not.toBeNull();
        expect(relatedFoods.length).toBe(2);
        expect(relatedFoods[0].food_id).toBe(food2Id);
        expect(relatedFoods[0].name).toBe(food2Name);
        expect(relatedFoods[0].description).toBe(food2Description);
        expect(typeof(relatedFoods[0].cost)).toBe('number');
        expect(relatedFoods[0].cost).toBeCloseTo(price2/purchaseQuant2 * 1 * quantity2); 
        expect(relatedFoods[1].food_id).toBe(food1Id);
        expect(relatedFoods[1].cost).toBeCloseTo(price1/purchaseQuant1 * 453.592 * quantity1);
    });

    test('getMealById returns a meal with id, type, and date', async () => {
        const meal = await getMealById(meal1Id)
        expect(meal).not.toBeNull();
        expect(meal.length).toBe(1);
    });

    test('getMeals returns meals with  meal_id, meal_type, meal_date, food_id, meal_food_id, food_name, food_description in selected date range ordered by date, and meal type,food name', async () => {
        const meals = await getMeals('2025-12-01','2025-12-31');
        expect(meals).not.toBeNull();
        expect(meals.length).toBe(3);
        expect(meals[0].meal_date.toISOString().split("T")[0]).toBe('2025-12-05');
        expect(meals[0].meal_type).toBe('dinner');
    });

    test('getMealTypes turns all enum meal types', async () => {
        const mealTypes = await getMealTypes();
        expect(mealTypes).not.toBeNull();
        expect(mealTypes.length).toBe(5);
    });
});
afterAll(async () => {
  await pool.end();
});


