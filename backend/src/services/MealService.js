// table: meals, meal_food
const pool = require('../../database/pool');
const { getFoodCurrentCostById } = require('./AnalyticsService')

// post service
async function createMeal(type, date) {
    const mealType = type.toLowerCase()
    const { rows } = await pool.query(
        `INSERT INTO meals(type, date)
        VALUES ($1, $2)
        ON CONFLICT (type, date)
        DO UPDATE SET type = EXCLUDED.type
        RETURNING id`,
        [mealType, date]
    )
    return rows[0].id
};

// put service
async function addFoodToMeal(mealId, foodId) {
    const foodCost = await getFoodCurrentCostById(foodId) || 0;
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

async function getMeals(startDate, endDate) {
    const { rows: mealRows } = await pool.query(
        `SELECT m.id AS meal_id, m.type AS meal_type, m.date AS meal_date, mf.food_id AS food_id, mf.id AS meal_food_id, f.name AS food_name, f.description AS food_description
        FROM meals m
        LEFT JOIN meal_food mf
        ON m.id = mf.meal_id
        LEFT JOIN foods f
        ON mf.food_id = f.id
        WHERE m.date >= $1
        AND m.date <= $2
        ORDER BY m.date, m.type, f.name`,
        [startDate, endDate]
    );
    return mealRows;
}

async function getMealTypes() {
    const { rows: mealTypeRows } = await pool.query(
        `SELECT e.enumlabel AS meal_type
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'meal_enum'
        ORDER BY e.enumsortorder;`
    )
    const rows = mealTypeRows.map(r => r.meal_type);
    return rows;
};

module.exports = {
    createMeal,
    getMealById,
    addFoodToMeal,
    updateMealFoodCost,
    getRelatedFoods,
    getMeals,
    getMealTypes
};