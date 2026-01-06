// table: ingredients, ingredient_price_history, location

const pool = require('../../database/pool');
const { convertCanonicalUnitToBaseUnit } = require('../services/UnitService')

// post service
async function createIngredient(name, canonical_unit_id = null) {
    const { rows } = await pool.query(
        `INSERT INTO ingredients(name, canonical_unit_id)
        VALUES ($1, $2)
        RETURNING id`,
        [name, canonical_unit_id]
    )
    return rows[0].id
};

async function createLocation(name) {
    const { rows: locationRows } = await pool.query(
        `INSERT INTO locations (name)
        VALUES ($1) 
        RETURNING id`,
        [name]
    );
    return locationRows[0].id
};

async function createIngredientPriceHistory(ingredientId, price, quantity, unitId, locationId) {
    
    const { baseUnitId, baseUnitName, baseUnitQuantity } = await convertCanonicalUnitToBaseUnit(unitId, quantity)
    const { rows } = await pool.query(
        `INSERT INTO ingredient_price_history (ingredient_id, price, quantity, unit_id, location_id)
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id`,
        [ingredientId, price, baseUnitQuantity, baseUnitId, locationId]
    );
    return rows[0].id;
};


// put service
async function addUnitToIngredient(ingredientId, unitId) {
    const { rows: unitRow } = await pool.query(
        `SELECT canonical_unit_id from ingredients
        WHERE id=$1`,
        [ingredientId]
    );
    if (unitRow[0].canonical_unit_id === null || unitRow[0].canonical_unit_id === undefined) {
        await pool.query(
            `UPDATE ingredients
            SET canonical_unit_id = $2
            WHERE id=$1`,
            [ingredientId, unitId]
        );
    };
};


// get service
async function getIngredientIdByName(name) {
    const { rows:ingredientRows } = await pool.query(
        `SELECT id
        FROM ingredients
        WHERE name=$1`, 
        [name]
    )
    if (!ingredientRows.length) return null;
    return ingredientRows[0].id;
};

async function getIngredientById(id) {
    // Fetch ingredient
    const { rows:ingredientRows } = await pool.query(
        `SELECT i.id AS ingredient_id, i.name, u.abbreviation AS canonical_unit, u.id AS canonical_unit_id
        FROM ingredients i
        LEFT JOIN units u
        ON i.canonical_unit_id = u.id
        WHERE i.id=$1`, 
        [id]
    )
    if (!ingredientRows.length) return null;
    const ingredient = { 
            id: id, 
            name: ingredientRows[0].name,
            canonical_unit: ingredientRows[0].canonical_unit,
            canonical_unit_id: ingredientRows[0].canonical_unit_id
        }
    return ingredient;
};

async function getIngredientByName(name) {
    const id = await getIngredientIdByName(name)
    const result = await getIngredientById(id)
    return result;
};


async function getAllIngredients() {
    const { rows } = await pool.query(`
        SELECT id, name, canonical_unit_id 
        FROM ingredients 
        ORDER BY name
    `);
    return rows;
};

async function getIngredientPriceHistoryById(ingredientId) {
    const { rows:priceHistoryRows } = await pool.query(
        `SELECT iph.id, i.name, iph.price_per_base_unit AS price_per_base_unit, iph.unit_id AS base_unit_id, u.base_unit AS base_unit, iph.price AS purchased_price, iph.quantity AS purchased_quantity, l.id AS location_id, l.name AS purchased_at, iph.recorded_at AS purchased_time
        FROM ingredients i
        JOIN ingredient_price_history iph
        ON i.id = iph.ingredient_id
        LEFT JOIN units u
        ON u.id = iph.unit_id
        LEFT JOIN locations l
        on l.id = iph.location_id
        WHERE i.id=$1
        ORDER BY iph.recorded_at DESC`, // ordered by the latest price
        [ingredientId]
    )
    if (!priceHistoryRows.length) return null;
    // Convert numeric strings to JS numbers
    const mapped = priceHistoryRows.map(row => ({
        ...row,
        purchased_price: Number(row.purchased_price),
        purchased_quantity: Number(row.purchased_quantity),
        price_per_base_unit: Number(row.price_per_base_unit)
    }));

    return mapped;
};







module.exports = {
    createIngredient,
    getIngredientIdByName,
    getIngredientById,
    getIngredientByName,
    addUnitToIngredient,
    getAllIngredients,
    createIngredientPriceHistory,
    createLocation,
    getIngredientPriceHistoryById
};