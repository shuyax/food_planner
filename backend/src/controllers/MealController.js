const MealService = require("../services/MealService");

async function getMeals(req, res, next) {
  try {
    // Get dates from headers
    const startDate = req.headers["startdate"];
    const endDate = req.headers["enddate"];
    // Validate that headers exist
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate headers are required" });
    }
    const meals = await MealService.getMeals(startDate, endDate);
    res.json(meals);
  } catch (err) {
    next(err);
  }
};

async function createMeal(req, res, next) {
  try {
    const { type, date } = req.body;
    if (!type || !date) {
      return res.status(400).json({ error: "meal type and meal date are required"})
    }
    const mealId = await MealService.createMeal(type, date)
    res.json(mealId)
  } catch (err) {
    next(err);
  }
};

async function getMealTypes(req, res, next) {
  try {
    const mealTypes = await MealService.getMealTypes()
    res.json(mealTypes)
  } catch (err) {
    next(err);
  }
};

async function getRelatedFoods(req, res, next) {
  try {
    const { mealId } = req.params;
    if (!mealId) {
      return res.status(400).json({ error: "mealId param is required" });
    }
    const relatedFoods = await MealService.getRelatedFoods(mealId)
    res.json(relatedFoods)
  } catch (err) {
    next(err);
  }
};

async function addFoodsToMeal(req, res, next) {
  try {
    const { mealId, foods } = req.body;
    if (!mealId || !Array.isArray(foods) || foods.length === 0) {
      return res.status(400).json({ error: "mealId and non-empty foods array are required"})
    }
    const results = await Promise.all(
      foods.map(async (food) => {
        const mealFoodId = await MealService.addFoodToMeal(mealId, food.foodId);
        return { 
          foodId: food.foodId,
          mealFoodId
        };
      })
    );
    res.status(201).json({
      mealId,
      addedFoods: results
    })
  } catch (err) {
    next(err);
  }
}

module.exports = {
    getMeals,
    createMeal,
    getMealTypes,
    getRelatedFoods,
    addFoodsToMeal
};
