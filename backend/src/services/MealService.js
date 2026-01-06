// table: meals, meal_food

const pool = require('../../database/pool');
const { getFoodCurrentCostById } = require('./AnalyticsService')

// post service
async function createMeal(type, date) {
    const mealType = type.toLowerCase()
    const { rows } = await pool.query(
        `INSERT INTO meals(type, date)
        VALUES ($1, $2)
        RETURNING id`,
        [mealType, date]
    )
    return rows[0].id
};

// put service
async function addFoodToMeal(mealId, foodId) {
    const foodCost = await getFoodCurrentCostById(foodId);
    const { rows: mealFoodRows } = await pool.query(
        `INSERT INTO meal_food(meal_id, food_id, cost)
        VALUES ($1, $2, $3)
        RETURNING id`,
        [mealId, foodId, foodCost]
    );
    return mealFoodRows[0].id;
};

async function updateMealFoodCost(id) {
    const { rows: rows } = await pool.query(
        `SELECT food_id FROM meal_food
        WHERE id=$1`,
        [id]
    );
    const foodId = rows[0].food_id
    const foodCost = await getFoodCurrentCostById(foodId);
    const { rows: mealFoodRows } = await pool.query(
            `UPDATE meal_food
            SET cost = $1
            WHERE id = $2
            RETURNING id`,
            [foodCost, id]
        )
    return foodCost;
}

// get service
async function getRelatedFoods(mealId) {
    const { rows: mealFoodRows } =  await pool.query(
        `SELECT mf.id AS meal_food_id, mf.food_id, f.name, f.description, mf.cost
        FROM meal_food mf
        JOIN foods f
        ON f.id = mf.food_id
        WHERE mf.meal_id = $1
        ORDER BY f.name`,
        [mealId]
    );
    const result = mealFoodRows.map(r => ({
        ...r,
        cost: r.cost !== null ? Number(r.cost) : null
    }))
    return result
};


async function getMealById(id) {
    const { rows: mealFoodRows } = await pool.query(
        `SELECT id, type, date
        FROM meals
        WHERE id = $1`,
        [id]
    )
    return mealFoodRows
};



module.exports = {
    createMeal,
    getMealById,
    addFoodToMeal,
    updateMealFoodCost,
    getRelatedFoods
};