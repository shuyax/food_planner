
const pool = require('../../database/pool');
const { getIngredientsSummary, 
    getIngredientAverageCostPerBaseUnitById, 
    getIngredientLatestCostPerBaseUnitById, 
    getIngredientCurrentCostPerCanonicalUnitById, 
    getFoodCurrentCostById,
    getTotalMealsCost } = require('../../src/services/AnalyticsService');

describe('analytics/summary service', () => {
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
    const ingredient1 = 'bok choy'; 
    const canonicalUnit1Id = 16;
    const ingredient2 = 'yuanxian big glass noodle';
    const canonicalUnit2Id = 6;
    const ingredient3 = 'taro powder';
    const canonicalUnit3Id = 9; //tbsp
    const ingredient4 = 'milk';
    const canonicalUnit4Id = 11; //cup
    let quantity1, quantity2, quantity3, quantity4;
    let ingredient1Id, price1, purchaseQuant1, baseUnitId1, location1Id;
    let ingredient2Id, price2, purchaseQuant2, baseUnitId2, location2Id;
    let ingredient3Id, price3, purchaseQuant3, baseUnitId3, location3Id;
    let ingredient4Id, price4, purchaseQuant4, baseUnitId4, location4Id;
    let price5, purchaseQuant5;
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
        price2 = 9.95;
        purchaseQuant2 = 5;
        baseUnitId2 = 6;
        price3 = 28.42;
        purchaseQuant3 = 1000;
        baseUnitId3 = 1;
        price4 = 4.79;
        purchaseQuant4 = 3780;
        baseUnitId4 = 4;
        price5 = 9.99; 
        purchaseQuant5 = 2 * 453.592;

        const { rows: ingredientPriceHistory } = await pool.query(
            `INSERT INTO ingredient_price_history (ingredient_id, price, quantity, unit_id, location_id)
            VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10), ($11, $12, $13, $14, $15), ($16, $17, $18, $19, $20)
            RETURNING id`,
            [ingredient1Id, price1, purchaseQuant1, baseUnitId1, location1Id, 
            ingredient2Id, price2, purchaseQuant2, baseUnitId2, location2Id,
            ingredient3Id, price3, purchaseQuant3, baseUnitId3, location3Id,
            ingredient4Id, price4, purchaseQuant4, baseUnitId4, location4Id]
        );
        
        const { rows: mealRows } = await pool.query(
            `INSERT INTO meals(type, date)
            VALUES ($1, $2), ($3, $4)
            RETURNING id`,
            [mealType1.toLowerCase(), mealDate1, mealType2.toLowerCase(), mealDate2]
        );
        [meal1Id, meal2Id] = mealRows.map(r => r.id);

        const foodCost1 = await getFoodCurrentCostById(food1Id);
        const foodCost2 = await getFoodCurrentCostById(food2Id);
        const foodCost3 = await getFoodCurrentCostById(food3Id);
        const { rows: mealFoodRows } = await pool.query(
            `INSERT INTO meal_food(meal_id, food_id, cost)
            VALUES ($1, $2, $3), ($1, $4, $5), ($6, $7, $8)
            RETURNING id`,
            [meal1Id, food1Id, foodCost1, food2Id, foodCost2, meal2Id, food3Id, foodCost3]
        );
        [mealFood1Id, mealFood2Id, mealFood3Id] = mealFoodRows.map(r => r.id);

        // enter seperately to make sure the latest entry and this purchase happened after made meal1
        const { rows: ingredientPriceHistoryRow } = await pool.query(
            `INSERT INTO ingredient_price_history (ingredient_id, price, quantity, unit_id, location_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
            [ingredient1Id, price5, purchaseQuant5, baseUnitId1, location1Id]
        );



    });
    afterAll(async () => {
        await pool.query(`DELETE FROM foods`);
        await pool.query(`DELETE FROM ingredients`);
        await pool.query(`DELETE FROM meals`);
        await pool.query(`DELETE FROM locations`);
    });

    test('getIngredientAverageCostPerBaseUnitById returns an average cost per base unit of an ingredient', async () => {
        const averagePrice = await getIngredientAverageCostPerBaseUnitById(ingredient1Id);
        expect(averagePrice).not.toBeNull();
        expect(averagePrice.length).toBe(1);
        expect(averagePrice[0].ingredient_name).toBe(ingredient1);
        expect(typeof(averagePrice[0].average_price_per_base_unit) == 'number').toBe(true);
        expect(averagePrice[0].average_price_per_base_unit).toBeCloseTo((price1/purchaseQuant1+price5/purchaseQuant5)/2);
        expect(averagePrice[0].base_unit_id).toBe(baseUnitId1);
        expect(averagePrice[0].base_unit).toBe('g');
    });

    test('getIngredientLatestCostPerBaseUnitById returns the most recent purchase entry of an ingredient', async () => {
        const latestPurchase = await getIngredientLatestCostPerBaseUnitById(ingredient1Id);
        expect(latestPurchase).not.toBeNull();
        expect(latestPurchase.length).toBe(1);
        expect(typeof(latestPurchase[0].price_per_base_unit) == 'number').toBe(true);
        expect(latestPurchase[0].price_per_base_unit).toBeCloseTo(price5/purchaseQuant5);
    });

    test('getIngredientCurrentCostPerCanonicalUnitById returns converted the price per base unit to price per ingredient canonical unit', async () => {
        const currentCostPerCanonicalUnit = await getIngredientCurrentCostPerCanonicalUnitById(ingredient4Id)
        expect(currentCostPerCanonicalUnit.canonical_unit_id).toBe(canonicalUnit4Id);
        expect(currentCostPerCanonicalUnit.canonical_unit_name).toBe('cup');
        expect(typeof(currentCostPerCanonicalUnit.price_per_canonical_unit) == 'number').toBe(true);
        expect(currentCostPerCanonicalUnit.price_per_canonical_unit).toBeCloseTo(price4/(purchaseQuant4 / 236.588));
    });

    test('getFoodCurrentCostById returns total cost of all ingredients of a food', async () => {
        const cost = await getFoodCurrentCostById(food3Id);
        expect(typeof cost === 'number' || cost === null ).toBe(true);
        expect(cost).toBeCloseTo(price3/(purchaseQuant3/14.7868) * quantity3 + price4/(purchaseQuant4/236.588) * quantity4);
    });

    test('getTotalMealsCost returns a total cost of meals in selected date range', async () => {
        const startDate = '2025-12-1';
        const endDate = '2026-12-31';
        const cost = await getTotalMealsCost(startDate, endDate);
        expect(typeof(cost)).toBe('number');
        expect(cost).toBeCloseTo(price1/purchaseQuant1 * 453.592 * quantity1 + price2/purchaseQuant2 * 1 * quantity2 + price3/purchaseQuant3 * 14.7868 * quantity3 + price4/purchaseQuant4 * 236.588 * quantity4);
    });


    test('getIngredientsSummary should return unique ingredients', async () => {
        const startDate = '2025-12-1';
        const endDate = '2026-12-31';
        const ingredients = await getIngredientsSummary(startDate, endDate);
        expect(ingredients).not.toBeNull();
        expect(ingredients.length).toBe(4);
        const ids = ingredients.map(r => r.ingredient.id);
        const names = ingredients.map(r => r.ingredient.name);
        const uniqueIds = new Set(ids);
        const uniqueNames = new Set(names);
        expect(uniqueIds.size).toBe(ids.length);
        expect(uniqueNames.size).toBe(names.length);
        expect(uniqueIds.size === uniqueNames.size).toBe(true);
    });
});
afterAll(async () => {
  await pool.end();
});
