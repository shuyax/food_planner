const pool = require('../../database/pool');
const { createIngredient, 
    getIngredientIdByName, 
    getIngredientById, 
    getIngredientByName, 
    addUnitToIngredient, 
    getIngredientCurrentCostPerCanonicalUnitById, 
    getIngredientPriceHistoryById,
    getAllIngredients,
    createIngredientPriceHistory,
    createLocation,
    getIngredientAverageCostPerBaseUnitById,
    getIngredientLatestCostPerBaseUnitById
} = require('../../src/services/IngredientService');

const pcsUnitId = 6;
const pcsBaseUnitId = 6
const tbspUnitId = 9;
const tbspBaseUnitId = 4;


describe('Ingredient post service', () => {
    afterEach(async() => {
        // Clean up explicitly
        await pool.query(`DELETE FROM ingredients`);
    });

    test('createIngredient adds a new ingredient without canonical_unit_id to the ingredient table and return the ingredient id', async () => {
        const testIngredient = 'egg';
        const ingredientId = await createIngredient(testIngredient);
        const { rows: ingredientRows } = await pool.query(
            `SELECT * FROM ingredients
            WHERE name=$1`,
            [testIngredient]
        );
        expect(ingredientRows).not.toBeNull();
        expect(ingredientRows.length).toBe(1);
        expect(ingredientRows[0].id).toBe(ingredientId);
        expect(ingredientRows[0].canonical_unit_id).toBeNull();
    });
    test('createIngredient adds a new ingredient with canonical_unit_id to the ingredient table and return the ingredient id', async () => {
        const testIngredient = 'egg';
        const canonicalUnitId = 6;
        const ingredientId = await createIngredient(testIngredient, canonicalUnitId);
        const { rows: ingredientRows } = await pool.query(
            `SELECT * FROM ingredients
            WHERE name=$1`,
            [testIngredient]
        );
        expect(ingredientRows).not.toBeNull();
        expect(ingredientRows.length).toBe(1);
        expect(ingredientRows[0].id).toBe(ingredientId);
        expect(ingredientRows[0].canonical_unit_id).toBe(canonicalUnitId);
        
    });
});

describe('Ingredient put service', () => {
    afterEach(async() => {
        // Clean up explicitly
        await pool.query(`DELETE FROM ingredients`);
    });
    test('addUnitToIngredient adds a canonical_unit_id to an ingredient without canonical_unit_id, the value of canonical_unit_id updated', async () => {
        const testIngredient = 'egg'
        const ingredientId = await createIngredient(testIngredient);
        const { rows: ingredientRows } = await pool.query(
            `SELECT * FROM ingredients
            WHERE name=$1`,
            [testIngredient]
        );
        expect(ingredientRows[0].canonical_unit_id).toBeNull();
        const canonicalUnitId = 6;
        await addUnitToIngredient(ingredientId, canonicalUnitId);
        const { rows: newIngredientRows } = await pool.query(
            `SELECT * FROM ingredients
            WHERE name=$1`,
            [testIngredient]
        );
        expect(newIngredientRows[0].canonical_unit_id).toBe(canonicalUnitId);
    });

    test('addUnitToIngredient adds a canonical_unit_id to an ingredient with canonical_unit_id, the value of canonical_unit_id will not be updated', async () => {
        const testIngredient = 'egg';
        const canonicalUnitId = 6;
        const ingredientId = await createIngredient(testIngredient, canonicalUnitId);

        const { rows: ingredientRows } = await pool.query(
            `SELECT * FROM ingredients
            WHERE name=$1`,
            [testIngredient]
        );
        expect(ingredientRows[0].canonical_unit_id).toBe(canonicalUnitId);
        const newCanonicalUnitId = 7;
        await addUnitToIngredient(ingredientId, newCanonicalUnitId);
        const { rows: newIngredientRows } = await pool.query(
            `SELECT * FROM ingredients
            WHERE name=$1`,
            [testIngredient]
        );
        expect(newIngredientRows[0].canonical_unit_id).toBe(canonicalUnitId);
    });
});

describe('location post service', () => {
    afterEach(async() => {
        // Clean up explicitly
        await pool.query(`DELETE FROM locations`);
    });
    test('createLocation adds a new location and returns a location id', async () => {
        const location = 'giant eagle';
        const locationId = await createLocation(location);
        const { rows: locationRows } = await pool.query(
            `SELECT * FROM locations
            WHERE name=$1`,
            [location]
        );
        expect(locationRows).not.toBeNull();
        expect(locationRows.length).toBe(1);
        expect(locationRows[0].id).toBe(locationId);
    })
});

describe('IngredientPriceHistory post service', () => {
    afterEach(async() => {
        // Clean up explicitly
        await pool.query(`DELETE FROM ingredients`);
        await pool.query(`DELETE FROM locations`);
    });
    test('createIngredientPriceHistory adds a new purchase entry of an existing ingredient and returns a ingredient_price_history id', async () => {
        const testIngredient = 'tomato';
        const ingredientId = await createIngredient(testIngredient);
        const price = 7.42;
        const quantity = 5; 
        const location = 'giant eagle';
        const locationId = await createLocation(location);
        const ingredientPriceHistoryId = await createIngredientPriceHistory(ingredientId, price, quantity, pcsBaseUnitId, locationId);
        const { rows: ingredientPriceHistoryRows } = await pool.query(
            `SELECT id, ingredient_id, price, quantity, price_per_base_unit, unit_id, location_id
            FROM ingredient_price_history
            WHERE id=$1`,
            [ingredientPriceHistoryId]
        );
        expect(ingredientPriceHistoryRows).not.toBeNull();
        expect(ingredientPriceHistoryRows.length).toBe(1);
        expect(ingredientPriceHistoryRows[0].ingredient_id).toBe(ingredientId);
        expect(Number(ingredientPriceHistoryRows[0].price)).toBe(price);
        expect(Number(ingredientPriceHistoryRows[0].quantity)).toBe(quantity);
        expect(Number(ingredientPriceHistoryRows[0].price_per_base_unit)).toBeCloseTo(price/quantity);
        expect(ingredientPriceHistoryRows[0].unit_id).toBe(pcsUnitId);
        expect(ingredientPriceHistoryRows[0].location_id).toBe(locationId);
    });

    test('createIngredientPriceHistory adds an ingredient purchase history with canonical unit, the entry should converted to base unit', async () => {
        const testIngredient = 'lamb';
        const ingredientId = await createIngredient(testIngredient);
        const price = 14.99;
        const quantity = 1.023; 
        const canonicalUnitId = 16;
        const baseUnitId = 1;
        const location = 'many more';
        const locationId = await createLocation(location);
        const ingredientPriceHistoryId = await createIngredientPriceHistory(ingredientId, price, quantity, canonicalUnitId, locationId);
        const { rows: ingredientPriceHistoryRows } = await pool.query(
            `SELECT id, ingredient_id, price, quantity, price_per_base_unit, unit_id, location_id
            FROM ingredient_price_history
            WHERE id=$1`,
            [ingredientPriceHistoryId]
        );
        expect(ingredientPriceHistoryRows).not.toBeNull();
        expect(ingredientPriceHistoryRows.length).toBe(1);
        expect(ingredientPriceHistoryRows[0].ingredient_id).toBe(ingredientId);
        expect(Number(ingredientPriceHistoryRows[0].price)).toBe(price);
        expect(Number(ingredientPriceHistoryRows[0].quantity)).toBeCloseTo(quantity * 453.592);
        expect(Number(ingredientPriceHistoryRows[0].price_per_base_unit)).toBeCloseTo(price/(quantity * 453.592));
        expect(ingredientPriceHistoryRows[0].unit_id).toBe(baseUnitId);
        expect(ingredientPriceHistoryRows[0].location_id).toBe(locationId);
    });
}); 

describe('Ingredient get service', () => {
    const testIngredient1Name = 'tomato';
    const testIngredient2Name = 'soy sauce';
    let testIngredient1Id, testIngredient2Id;

    beforeAll(async() => {
        // test ingredients
        testIngredient1Id = await createIngredient(testIngredient1Name, pcsUnitId);
        testIngredient2Id = await createIngredient(testIngredient2Name, tbspUnitId);
    });

    afterAll(async () => {
        await pool.query(`DELETE FROM ingredients`);
    });


    test('getIngredientIdByName takes ingredient name as input and returns correct ingredient id', async () => {
        const id = await getIngredientIdByName(testIngredient1Name);
        expect(id).toBe(testIngredient1Id);
    });

    test('getIngredientById returns ingredient with id, name, canonical_unit, canonical_unit_id', async () => {
        const ingredient = await getIngredientById(testIngredient1Id);
        expect(ingredient).not.toBeNull();
        expect(ingredient.name).toBe(testIngredient1Name);
        expect(ingredient.canonical_unit_id).toBe(pcsUnitId);
        expect(ingredient.canonical_unit).toBe('pcs');
    });

    test('getIngredientByName returns id, name, canonical_unit, canonical_unit_id', async () => {
        const ingredient = await getIngredientByName('tomato');
        expect(ingredient).not.toBeNull();
        expect(ingredient.name).toBe(testIngredient1Name);
        expect(ingredient.canonical_unit).toBe('pcs');
        expect(ingredient.canonical_unit_id).toBe(pcsUnitId);
    });

    test('getAllIngredientNames returns a list of all existing ingredients ordered by name', async () => {
        const allIngredients = await getAllIngredients();
        expect(allIngredients).not.toBeNull();
        expect(allIngredients.length).toBe(2);
        expect(allIngredients[0].id).toBe(testIngredient2Id);
        expect(allIngredients[0].name).toBe(testIngredient2Name);
        expect(allIngredients[0].canonical_unit_id).toBe(tbspUnitId);
    });
});

describe('Ingredient Price History get service', () => {
    const testIngredient1Name = 'tomato';
    const testIngredient2Name = 'soy sauce';
    let testIngredient1Id, testIngredient2Id;
    const location = 'giant eagle';
    let locationId;
    const testIngredient1PriceHistories = [
        { 
            price: 7.42,
            quantity: 5 
        },
    ];
    const testIngredient2PriceHistories = [
        { 
            price: 5,
            quantity: 500
        },
        { 
            price: 6,
            quantity: 300
        },
    ]; 
    let ingredient1PriceHistoryId, ingredient2PriceHistory1Id, ingredient2PriceHistory2Id;

    beforeAll(async() => {
        // test ingredients
        testIngredient1Id = await createIngredient(testIngredient1Name, pcsUnitId);
        testIngredient2Id = await createIngredient(testIngredient2Name, tbspUnitId);

        // test locations
        locationId = await createLocation(location);

        // test ingredients price histories
        ingredient1PriceHistoryId = await createIngredientPriceHistory(testIngredient1Id, testIngredient1PriceHistories[0].price, testIngredient1PriceHistories[0].quantity, pcsBaseUnitId, locationId);
        ingredient2PriceHistory1Id = await createIngredientPriceHistory(testIngredient2Id, testIngredient2PriceHistories[0].price, testIngredient2PriceHistories[0].quantity, tbspBaseUnitId, locationId);
        ingredient2PriceHistory2Id = await createIngredientPriceHistory(testIngredient2Id, testIngredient2PriceHistories[1].price, testIngredient2PriceHistories[1].quantity, tbspBaseUnitId, locationId);
    });

    afterAll(async () => {
        await pool.query(`DELETE FROM ingredient_price_history`);
        await pool.query(`DELETE FROM locations`);
        await pool.query(`DELETE FROM ingredients`);
    });
    test('getIngredientPriceHistoryById returns all purchase histories ordered by purchase time', async () => {
        const priceHistories = await getIngredientPriceHistoryById(testIngredient2Id);
        expect(priceHistories).not.toBeNull();
        expect(priceHistories.length).toBe(2);
        expect(priceHistories[0].name).toBe(testIngredient2Name);
        expect(typeof(priceHistories[0].purchased_price) == 'number').toBe(true);
        expect(typeof(priceHistories[0].purchased_quantity) == 'number').toBe(true);
        expect(typeof(priceHistories[0].price_per_base_unit) == 'number').toBe(true);
        expect(priceHistories[0].purchased_price).toBe(testIngredient2PriceHistories[1].price);
        expect(priceHistories[0].purchased_quantity).toBe(testIngredient2PriceHistories[1].quantity);
        expect(priceHistories[0].price_per_base_unit).toBeCloseTo(testIngredient2PriceHistories[1].price/testIngredient2PriceHistories[1].quantity);
        expect(priceHistories[0].base_unit_id).toBe(tbspBaseUnitId);
        expect(priceHistories[0].base_unit).toBe('ml');
        expect(priceHistories[0].location_id).toBe(locationId);
        expect(priceHistories[0].purchased_at).toBe(location);
        expect(priceHistories[0].purchase_time).not.toBeNull();

    });
});

afterAll(async () => {
  await pool.end();
});
