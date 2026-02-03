// table: foods, food_images, food_ingredient 

const pool = require('../../database/pool');
const { getIngredientById } = require('./IngredientService');

// post service
async function createFood(name, description = null) {
    const { rows } = await pool.query(
        `INSERT INTO foods (name, description)
        VALUES ($1, $2)
        RETURNING id`,
        [name, description]
    );

    return rows[0].id;
};

// put service
async function addImageToFood(foodId, url, alt=null) {
    const { rows } = await pool.query(
        `INSERT INTO food_images (food_id, url, alt)
        VALUES ($1, $2, $3)
        RETURNING id`,
        [foodId, url, alt]
    );
    return rows[0].id;
};

async function addIngredientToFood(foodId, ingredientId, quantity, unitId, note=null) {
    const { rows } = await pool.query(
        `INSERT INTO food_ingredient (food_id, ingredient_id, quantity, unit_id, note)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [foodId, ingredientId, quantity, unitId, note]
    );
    return rows[0].id;
};

// get service
async function getFoodIdByName(name) {
    const { rows: foodRows } = await pool.query(
        `SELECT id 
        FROM foods
        WHERE name = $1`,
        [name]
    );

    if (!foodRows.length) return null;

    return foodRows[0].id
};


async function getAllFoods() {
    const { rows } = await pool.query(`
        SELECT id, name, description 
        FROM foods 
        ORDER BY name
    `);
    return rows;
};


async function getAllImagesByFoodId(foodId) {
    const { rows: foodImageRows } = await pool.query(
        `SELECT id, url, alt
        FROM food_images
        WHERE food_id = $1
        ORDER BY url`,
        [foodId]
    );
    return foodImageRows;
};


async function getFoodById(id) {
    const { rows: foodRows } = await pool.query(
        `SELECT id, name, description 
        FROM foods 
        WHERE id = $1`,
        [id]
    );
    if (!foodRows.length) return null;
    return foodRows[0]
};


async function getFoodByName(name) {
    const id = await getFoodIdByName(name)
    if (!id) return null;
    const food = await getFoodById(id)
    return food
};



async function getRelatedIngredientsByFoodId(foodId) {
    const { rows } = await pool.query(
        `SELECT id, ingredient_id, quantity, unit_id, note
        FROM food_ingredient 
        WHERE food_id=$1 
        ORDER BY ingredient_id`,
        [foodId]
    );
    const result = await Promise.all(
        rows.map(async row => {
            const ingredient = await getIngredientById(row.ingredient_id);
            return {
                id: row.id,
                ingredient: ingredient,
                note: row.note,
                quantity: Number(row.quantity)
            };
        })
    );
    // sort final results alphabetically by name
    result.sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name));
    // console.dir(result, { depth: null });
    return result;
}




module.exports = {
    getFoodIdByName,
    getFoodByName,
    getFoodById,
    createFood,
    addIngredientToFood,
    getRelatedIngredientsByFoodId,
    addImageToFood,
    getAllFoods,
    getAllImagesByFoodId
}