const pool = require('../../database/pool');
const {
    getFoodIdByName,
    getFoodByName,
    getFoodById,
    createFood,
    addIngredientToFood,
    getRelatedIngredientsByFoodId,
    addImageToFood,
    getAllFoods,
    getAllImagesByFoodId,
    updateFood,
    updateFoodIngredient
} = require('../../src/services/FoodService');

describe('food post service', () => {
    afterEach(async () => {
        await pool.query(`DELETE FROM foods`);
    });

    test('createFood adds a new food entry without description in food table and returns the food id', async () => {
        const foodName = 'tomato-egg-noodle';
        const foodId = await createFood(foodName);
        const { rows: foodRows } = await pool.query(
            `SELECT * FROM foods
            WHERE name=$1`,
            [foodName]
        );
        expect(foodRows).not.toBeNull();
        expect(foodRows.length).toBe(1);
        expect(foodRows[0].id).toBe(foodId);
        expect(foodRows[0].created_at).toBeDefined();     
        expect(foodRows[0].updated_at).toBeDefined();  
        expect(foodRows[0].description).toBeNull();
    });

    test('createFood adds a new food entry with description in food table and returns the food id', async () => {
        const foodName = 'tomato egg noodle';
        const foodDescription = 'test tomato egg noodle';
        const foodId = await createFood(foodName, foodDescription);
        const { rows: foodRows } = await pool.query(
            `SELECT * FROM foods
            WHERE name=$1`,
            [foodName]
        );
        expect(foodRows).not.toBeNull();
        expect(foodRows.length).toBe(1);
        expect(foodRows[0].id).toBe(foodId);
        expect(foodRows[0].created_at).toBeDefined();     
        expect(foodRows[0].updated_at).toBeDefined();  
        expect(foodRows[0].description).toBe(foodDescription);
    });
});


describe('food put service', () => {
    let foodId;
    const foodName = 'beef cheese udon';
    beforeEach(async () => {
        foodId = await createFood(foodName);
    });
    afterEach(async () => {
        await pool.query(`DELETE FROM foods`);
    });

    test('addImageToFood adds a new image entry of a food in food_image table and returns a food_image id', async () => {
        const url = '/uploads/tomato-egg-noodle.jpeg';
        const foodImageId = await addImageToFood(foodId, url);
        const { rows: foodImageRows } = await pool.query(
            `SELECT *
            FROM food_images 
            WHERE id=$1`,
            [foodImageId]
        );
        expect(foodImageRows).not.toBeNull();
        expect(foodImageRows.length).toBe(1);
        expect(foodImageRows[0].url).toBe(url);
    });

    test('use addImageToFood to add multiple images of a food in food_image table should return multiple rows', async () => {
        const url1 = '/uploads/tomato-egg-noodle.jpeg';
        const url2 = '/uploads/beef-cheese-tomato-udon.webp';
        const foodImage1Id = await addImageToFood(foodId, url1);
        const foodImage2Id = await addImageToFood(foodId, url2);
        const { rows: foodImageRows } = await pool.query(
            `SELECT *
            FROM food_images 
            WHERE food_id=$1`,
            [foodId]
        );
        expect(foodImageRows).not.toBeNull();
        expect(foodImageRows.length).toBe(2);
        expect(foodImageRows[0].id).toBe(foodImage1Id);
        expect(foodImageRows[1].id).toBe(foodImage2Id);
        expect(foodImageRows[0].url).toBe(url1);
        expect(foodImageRows[1].url).toBe(url2);
    });

    test('addIngredientToFood adds an existing ingredient to an existing food in food_ingredient table and returns food_ingredient_id', async () => {
        const testIngredient = 'egg';
        const canonicalUnitId = 6;
        const { rows } = await pool.query(
            `INSERT INTO ingredients(name, canonical_unit_id)
            VALUES ($1, $2)
            RETURNING id`,
            [testIngredient, canonicalUnitId]
        );
        const ingredientId = rows[0].id;
        const quantity = 4;
        const foodIngredientId = await addIngredientToFood(foodId, ingredientId, quantity, canonicalUnitId);
        const { rows: foodIngredientRows } = await pool.query(
            `SELECT food_id, ingredient_id, quantity, unit_id, created_at, updated_at
            FROM food_ingredient 
            WHERE id=$1`,
            [foodIngredientId]
        );
        expect(foodIngredientRows).not.toBeNull();
        expect(foodIngredientRows.length).toBe(1);
        expect(foodIngredientRows[0].food_id).toBe(foodId);
        expect(foodIngredientRows[0].ingredient_id).toBe(ingredientId);
        expect(Number(foodIngredientRows[0].quantity)).toBe(quantity);
        expect(foodIngredientRows[0].unit_id).toBe(canonicalUnitId);
        expect(foodIngredientRows[0].created_at).toBeDefined();
        expect(foodIngredientRows[0].updated_at).toBeDefined();
        await pool.query(`DELETE FROM ingredients`);
    });

    test('use addIngredientToFood to add multiple existing ingredients to an existing food in food_ingredient table and returns multiple rows', async () => {
        const ingredient1 = 'beef';
        const canonicalUnit1Id = 16;
        
        const ingredient2 = 'cheese';
        const canonicalUnit2Id = 7;
        const { rows } = await pool.query(
            `INSERT INTO ingredients(name, canonical_unit_id)
            VALUES ($1, $2), ($3, $4)
            RETURNING id`,
            [ingredient1, canonicalUnit1Id, ingredient2, canonicalUnit2Id]
        );
        const [ingredient1Id, ingredient2Id] = rows.map(r => r.id);
        const quantity1 = 0.4;
        const quantity2 = 6;
        const foodIngredient1Id = await addIngredientToFood(foodId, ingredient1Id, quantity1, canonicalUnit1Id);
        const foodIngredient2Id = await addIngredientToFood(foodId, ingredient2Id, quantity2, canonicalUnit2Id);
        const { rows: foodIngredientRows } = await pool.query(
            `SELECT id, food_id, ingredient_id, quantity, unit_id, created_at, updated_at
            FROM food_ingredient 
            WHERE food_id=$1`,
            [foodId]
        );
        expect(foodIngredientRows).not.toBeNull();
        expect(foodIngredientRows.length).toBe(2);
        expect(foodIngredientRows[0].id).toBe(foodIngredient1Id);
        expect(foodIngredientRows[0].ingredient_id).toBe(ingredient1Id);
        expect(Number(foodIngredientRows[0].quantity)).toBe(quantity1);
        expect(foodIngredientRows[0].unit_id).toBe(canonicalUnit1Id);
        expect(foodIngredientRows[0].created_at).toBeDefined();
        expect(foodIngredientRows[0].updated_at).toBeDefined();
        expect(foodIngredientRows[1].id).toBe(foodIngredient2Id);
        expect(foodIngredientRows[1].ingredient_id).toBe(ingredient2Id);
        expect(Number(foodIngredientRows[1].quantity)).toBe(quantity2);
        expect(foodIngredientRows[1].unit_id).toBe(canonicalUnit2Id);
        expect(foodIngredientRows[1].created_at).toBeDefined();
        expect(foodIngredientRows[1].updated_at).toBeDefined();
        await pool.query(`DELETE FROM ingredients`);
    });

    test('updateFood updates an existing food', async () => {
        const newFood = {
            id: foodId,
            name: 'beef cheese udon#',
            description: "how to cook beef cheese udon"
        }
        await updateFood(newFood);
        const { rows: foodRows } = await pool.query(
            `SELECT *
            FROM foods 
            WHERE id=$1`,
            [foodId]
        );
        expect(foodRows).not.toBeNull();
        expect(foodRows.length).toBe(1);
        expect(foodRows[0].name).toBe('beef cheese udon#');
        expect(foodRows[0].description).toBe('how to cook beef cheese udon');
    });

    test('updateFoodIngredient update food_ingredient table', async () => {
        const ingredient1 = 'pork', canonicalUnit1Id = 16, quantity1 = 0.4;
        const ingredient2 = 'spam', canonicalUnit2Id = 7, quantity2 = 6;
        // create ingredients and add to food
        const { rows: ingredientRows } = await pool.query(
            `INSERT INTO ingredients(name, canonical_unit_id)
            VALUES ($1, $2), ($3, $4)
            RETURNING id`,
            [ingredient1, canonicalUnit1Id, ingredient2, canonicalUnit2Id]
        );
        const [ingredient1Id, ingredient2Id] = ingredientRows.map(r => r.id);
        const foodIngredientId = await addIngredientToFood(foodId, ingredient1Id, quantity1, canonicalUnit1Id, note="ground pork")
        const newFoodIngredient = {
            "ingredientId": ingredient2Id,
            "ingredientName": ingredient2,
            "ingredientUnitId": canonicalUnit2Id,
            "ingredientUnitName": "slice",
            "ingredientUnitAbbreviation": "slice",
            "foodIngredientId": foodIngredientId,
            "note": "less sault spam",
            "quantity": quantity2
        }
        await updateFoodIngredient(newFoodIngredient)
        const { rows: foodIngredientRows } = await pool.query(
            `SELECT *
            FROM food_ingredient 
            WHERE id=$1`,
            [foodIngredientId]
        );
        expect(foodIngredientRows).not.toBeNull();
        expect(foodIngredientRows.length).toBe(1);
        expect(foodIngredientRows[0].ingredient_id).toBe(ingredient2Id);
        expect(Number(foodIngredientRows[0].quantity)).toBe(quantity2);
        expect(foodIngredientRows[0].unit_id).toBe(canonicalUnit2Id);
        expect(foodIngredientRows[0].note).toBe("less sault spam");
    });
});


describe('food get service', () => {
    let food1Name, food1Id, food1Description, food2Name, food2Id, food2Description;
    let url1, url2, url3;
    let food1ImageId, food2ImageId1, food2ImageId2;
    let location1 = 'many more', location2 = 'aldi';
    // ingredient records
    let ingredient1 = 'beef', canonicalUnit1Id = 16, quantity1 = 0.4;
    let ingredient2 = 'cheese', canonicalUnit2Id = 7, quantity2 = 6;
    let ingredient3 = 'short rib', canonicalUnit3Id = 16, quantity3 = 1.705;
    // purchase records
    let price1 = 21.99, purchaseQuant1 = 1.4 * 453.592, unit1Id = 1;
    let price2 = 1.85, purchaseQuant2 = 16, unit2Id = 6;
    let price3 = 8.51, purchaseQuant3 = 1.705 * 453.592, unit3Id = 1;
    let foodIngredient1Id, foodIngredient2Id, foodIngredient3Id;


    beforeAll(async () => {
        // create food
        food1Name = 'tomato beef cheese udon';
        food1Description = 'test beef cheese tomato udon';
        food1Id = await createFood(food1Name,food1Description);

        food2Name = 'pork short rib';
        food2Description = 'sweet and sour pork short rib';
        food2Id = await createFood(food2Name,food2Description);

        // add food image
        url1 = '/uploads/beef-cheese-tomato-udon.webp';
        food1ImageId = await addImageToFood(food1Id, url1);
        url2 = '/uploads/pork-short-rib.jpeg'
        food2ImageId1 = await addImageToFood(food2Id, url2);
        url3 = '/uploads/pork-short-rib.webp'
        food2ImageId2 = await addImageToFood(food2Id, url3);

        // create ingredients and add to food
        const { rows: ingredientRows } = await pool.query(
            `INSERT INTO ingredients(name, canonical_unit_id)
            VALUES ($1, $2), ($3, $4), ($5, $6)
            RETURNING id`,
            [ingredient1, canonicalUnit1Id, ingredient2, canonicalUnit2Id, ingredient3, canonicalUnit3Id]
        );
        const [ingredient1Id, ingredient2Id, ingredient3Id] = ingredientRows.map(r => r.id);

        foodIngredient1Id = await addIngredientToFood(food1Id, ingredient1Id, quantity1, canonicalUnit1Id);
        foodIngredient2Id = await addIngredientToFood(food1Id, ingredient2Id, quantity2, canonicalUnit2Id);
        foodIngredient3Id = await addIngredientToFood(food2Id, ingredient3Id, quantity3, canonicalUnit3Id);

        // create location
        const { rows: locationRows } = await pool.query(
            `INSERT INTO locations (name)
            VALUES ($1), ($2)
            RETURNING id`,
            [location1, location2]
        );
        const [location1Id, location2Id] = locationRows.map(r => r.id)
        
        // create ingredient purchase history
        const { rows: ingredientPriceHistory } = await pool.query(
            `INSERT INTO ingredient_price_history (ingredient_id, price, quantity, unit_id, location_id)
            VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10), ($11, $12, $13, $14, $5)
            RETURNING id`,
            [ingredient1Id, price1, purchaseQuant1, unit1Id, location1Id, ingredient2Id, price2, purchaseQuant2, unit2Id, location2Id, ingredient3Id, price3, purchaseQuant3, unit3Id]
        );

    });

    afterAll(async () => {
        await pool.query(`DELETE FROM ingredients`);
        await pool.query(`DELETE FROM foods`);
        await pool.query(`DELETE FROM locations`);
    });

    test('getFoodIdByName returns correct food id', async () => {
        const testFoodId = await getFoodIdByName(food1Name);
        expect(testFoodId).toBe(food1Id);
    });

    test('getAllFoods returns a list of foods with id, name, and description, ordered by name', async () => {
        const allFoods = await getAllFoods();
        expect(allFoods).not.toBeNull();
        expect(allFoods.length).toBe(2);
        expect(allFoods[0].id).toBe(food2Id);
        expect(allFoods[1].id).toBe(food1Id);
        expect(allFoods[0].name).toBe(food2Name);
        expect(allFoods[1].name).toBe(food1Name);
        expect(allFoods[0].description).toBe(food2Description);
        expect(allFoods[1].description).toBe(food1Description);
    });

    test('getAllImagesByFoodId returns all images with id, url and alt, order by url', async () => {
        const images = await getAllImagesByFoodId(food2Id);
        expect(images).not.toBeNull();
        expect(images.length).toBe(2);
        expect(images[0].id).toBe(food2ImageId1)
        expect(images[0].url).toBe(url2);
    });

    test('getFoodById returns correct food with id, name, and description without iamges and ingredients', async () => {
        const food = await getFoodById(food1Id);
        expect(food).not.toBeNull();
        expect(food.description).toBe(food1Description);
    });

    test('getFoodById with an invalid id returns null', async () => {
        const id = food2Id + 1
        const food = await getFoodById(id);
        expect(food).toBeNull();
    });

    test('getFoodByName returns correct food with id, name, and description without iamges and ingredients', async () => {
        const food = await getFoodByName(food1Name);
        expect(food).not.toBeNull();
        expect(food.id).toBe(food1Id)
        expect(food.description).toBe(food1Description);
    });

    test('getRelatedIngredientsByFoodId returns all related ingredients and required quantity of a food', async () => {
        const relatedIngredients = await getRelatedIngredientsByFoodId(food1Id);
        expect(relatedIngredients.length).toBe(2);
        expect(relatedIngredients[0].ingredient.name).toBe(ingredient1);
        expect(relatedIngredients[1].ingredient.name).toBe(ingredient2);
        expect(typeof relatedIngredients[0].quantity).toBe('number');
        expect(relatedIngredients[0].note).toBeNull();
        expect(relatedIngredients[1].note).toBeNull();
        expect(relatedIngredients[0].id).toBe(foodIngredient1Id);
        expect(relatedIngredients[1].id).toBe(foodIngredient2Id);
        expect(typeof relatedIngredients[1].quantity).toBe('number');
        expect(relatedIngredients[0].ingredient.canonical_unit_id).toBe(canonicalUnit1Id);
        expect(relatedIngredients[1].ingredient.canonical_unit_id).toBe(canonicalUnit2Id);
    });

});



afterAll(async () => {
  await pool.end();
});

