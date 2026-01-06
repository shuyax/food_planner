const pool = require('../../database/pool');
const { getRelatedIngredientsByFoodId } = require('./FoodService');
const { getRelatedFoods } = require('./MealService')
const { getIngredientById } = require('./IngredientService')



async function getIngredientsSummary(startDate, endDate) {
    const { rows: mealRows } = await pool.query(
        `SELECT id FROM meals
        WHERE date >= $1
        AND date <= $2`,
        [startDate, endDate]
    );
    const result = await Promise.all(mealRows.map(
        async r => {
            const relatedFoods = await getRelatedFoods(r.id);
            const foodsWithIngredients = await Promise.all(
                relatedFoods.map(
                    async r => {
                        const ingredients = await getRelatedIngredientsByFoodId(r.food_id)
                        return ingredients
                    }
                )
            )  
            return foodsWithIngredients;
        }
    ));
    const flatIngredients = result.flat(2);
    const sumIngredients = Object.values(flatIngredients.reduce((acc, { ingredient, quantity }) => {
        const id = ingredient.id
        if (!acc[id]) {
            acc[id] = {
                ingredient,
                total_quantity: 0
            };
        }
        acc[id].total_quantity += quantity
        return acc;
    },{})); // Object.values converts an object to an array
    const sumIngredientsWithPrice = await Promise.all(sumIngredients.map(
        async r => {
            const averagePrice = await getIngredientAverageCostPerBaseUnitById(r.ingredient.id)
            const latestPrice = await getIngredientLatestCostPerBaseUnitById(r.ingredient.id)
            return {
                ingredient: r.ingredient,
                total_quantity: r.total_quantity,
                average_price_per_base_unit: averagePrice[0].average_price_per_base_unit,
                latest_price_per_base_unit: latestPrice[0].price_per_base_unit,
                base_unit: averagePrice[0].base_unit,
                base_unit_id: averagePrice[0].base_unit_id
            }
        }
    ))
    // console.dir(result, { depth: null })
    return sumIngredientsWithPrice
};

// ingredient analytics
async function getIngredientAverageCostPerBaseUnitById(ingredientId) {
    const { rows:priceHistoryRows } = await pool.query(
        `SELECT i.id AS ingredient_id, i.name AS ingredient_name, AVG(iph.price_per_base_unit) AS average_price_per_base_unit, iph.unit_id AS base_unit_id, u.base_unit AS base_unit
        FROM ingredients i
        JOIN ingredient_price_history iph
        ON i.id = iph.ingredient_id
        LEFT JOIN units u
        ON u.id = iph.unit_id
        WHERE i.id=$1
        GROUP BY i.id, i.name, iph.unit_id, u.base_unit;`,
        [ingredientId]
    )
    if (!priceHistoryRows.length) return null;
    priceHistoryRows[0].average_price_per_base_unit = Number(priceHistoryRows[0].average_price_per_base_unit)
    
    return priceHistoryRows
};

// ingredient analytics
async function getIngredientLatestCostPerBaseUnitById(ingredientId) {
    const { rows: latestPurchaseRow } = await pool.query(
        `SELECT ingredient_id, price_per_base_unit, unit_id, recorded_at
        FROM ingredient_price_history
        WHERE ingredient_id=$1
        ORDER BY recorded_at DESC
        LIMIT 1`,
        [ingredientId]
    );
    latestPurchaseRow[0].price_per_base_unit = Number(latestPurchaseRow[0].price_per_base_unit);
    return latestPurchaseRow;
};

// ingredient analytics
async function getIngredientCurrentCostPerCanonicalUnitById(ingredientId) {
    const ingredient = await getIngredientById(ingredientId)
    const latestPurchase = await getIngredientLatestCostPerBaseUnitById(ingredientId)
    const { rows: rows } = await pool.query(
        `SELECT conversion_factor, abbreviation AS canonical_unit
        FROM units
        WHERE id=$1`,
        [ingredient.canonical_unit_id]
    );
    return {
        canonical_unit_id: ingredient.canonical_unit_id,
        canonical_unit_name: rows[0].canonical_unit,
        price_per_canonical_unit: latestPurchase[0].price_per_base_unit * Number(rows[0].conversion_factor)
    }
};

// food analytics
async function getFoodCurrentCostById(id) {
    const ingredients = await getRelatedIngredientsByFoodId(id);
    if (!ingredients || ingredients.length === 0) return 0;
    const ingredientCosts = await Promise.all(
        ingredients.map(async ing => {
            const latestPrice = await getIngredientCurrentCostPerCanonicalUnitById(ing.ingredient.id);
            return latestPrice.price_per_canonical_unit * ing.quantity; // total cost for this ingredient
        })
    );
    return ingredientCosts.reduce((sum, cost) => sum + cost, 0);
};

// meal analytics
async function getTotalMealsCost(startDate, endDate) {
    const { rows: mealRows } = await pool.query(
        `SELECT id FROM meals
        WHERE date >= $1
        AND date <= $2`,
        [startDate, endDate]
    );
    const result = await Promise.all(mealRows.map(
        async r => {
            const relatedFoods = await getRelatedFoods(r.id);
            return relatedFoods.reduce((sum, food) => sum + food.cost, 0)
        }
    ));
    return result.reduce((sum, cost) => sum + cost, 0);
};








module.exports = {
    getIngredientAverageCostPerBaseUnitById,
    getIngredientLatestCostPerBaseUnitById,
    getIngredientCurrentCostPerCanonicalUnitById,
    getFoodCurrentCostById,
    getTotalMealsCost,
    getIngredientsSummary,
};