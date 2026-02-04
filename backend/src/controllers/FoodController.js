const FoodService = require("../services/FoodService");

async function getFoods(req, res, next) {
  try {
    const foods = await FoodService.getAllFoods();
    res.status(200).json(foods);
  } catch (err) {
    next(err);
  }
}

// post request
async function createFood(req, res, next) {
    try {
        const { name, description = null } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }
        const foodId = await FoodService.createFood(name, description);
        res.status(201).json(foodId);
    } catch (err) {
        next(err);
    }
};

// put request
async function addImageToFood(req, res, next) {
    try {
        const { foodId, url, alt = null } = req.body;
        if (!foodId) {
            return res.status(400).json({ error: "foodId is required" });
        };
        if (!url) {
            return res.status(400).json({ error: "food image url is required" });
        };
        const imageId = await FoodService.addImageToFood(foodId, url, alt);
        res.status(201).json({ 
            id: imageId,
            foodId: foodId,
            url,
            alt
        });
    } catch (err) {
        next(err);
    }
};

// post service
async function addIngredientsToFood(req, res, next) {
    try {
        const {foodId, ingredients} = req.body;
        if (!foodId || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: "foodId and ingredients are required" });
        };
        const results = await Promise.all(
            ingredients.map(async ingredient => {
                let quantity = ingredient.quantity
                let unitId = ingredient.unitId
                let note = ingredient.note
                if (unitId === -1) {
                    unitId = null
                }
                if (quantity === 0) {
                    quantity = null
                }
                if (note === "") {
                    note = null
                }
                const foodIngredientId = await FoodService.addIngredientToFood(foodId, ingredient.ingredientId, quantity, unitId, note)
                return { 
                    ...ingredient,
                    foodIngredientId: foodIngredientId
                };
            })
        )
        res.status(201).json({
            foodId,
            ingredients: results
        });
    }catch (err) {
        next(err);
    }
}

async function getFood(req, res, next) {
    try {
        const { foodId } = req.params;
        if (!foodId) {
            return res.status(400).json({ error: "FoodId is required" });
        }
        const foodData = await FoodService.getFoodById(parseInt(foodId));
        if (!foodData) {
            return res.status(404).json({ error: "Food not found" });
        }
        res.status(200).json(foodData); // 200 for GET success
    } catch (err) {
        next(err);
    }
}

async function getRelatedIngredients(req, res, next) {
    try {
        const { foodId } = req.params;
        if (!foodId) {
            return res.status(400).json({ error: "FoodId is required" });
        }
        const relatedIngredients = await FoodService.getRelatedIngredientsByFoodId(parseInt(foodId));
        if (!relatedIngredients) {
            return res.status(404).json({ error: "Related ingredients not found" });
        }
        res.status(200).json(relatedIngredients); // 200 for GET success
    } catch (err) {
        next(err);
    }
}

async function updateFood(req, res, next) {
    try {
        const { id, name, description } = req.body;
        if (!id || !name) {
            return res.status(400).json({ error: "FoodId and FoodName are required" });
        }
        const foodId = await FoodService.updateFood({ id, name, description });
        res.status(200).json(foodId);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getFoods,
    getFood,
    createFood,
    updateFood,
    addImageToFood,
    addIngredientsToFood,
    getRelatedIngredients
};
