const FoodService = require("../services/FoodService");

async function getFoods(req, res, next) {
  try {
    const foods = await FoodService.getAllFoods();
    res.json(foods);
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
        const id = await FoodService.createFood(name, description);
        res.status(201).json({
            id,
            name,
            description
        });
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

module.exports = {
    getFoods,
    createFood,
    addImageToFood
};
