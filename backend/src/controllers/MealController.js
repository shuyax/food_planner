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
    const { type, date, foods } = req.body;
    if (!type || !date) {
      return res.status(400).json({ error: "meal type and meal date are required"})
    }
    const mealId = await MealService.createMeal(type, date)
    let mealFoodIdList = [];
    if (foods && foods.length !== 0) {
      for (const food of foods) {
        const mealFoodId = await MealService.addFoodToMeal(mealId, food.foodId)
        mealFoodIdList.push(mealFoodId)
      }
    }
    res.json({ mealId, mealFoodIds: mealFoodIdList })
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
}

module.exports = {
    getMeals,
    createMeal,
    getMealTypes
};
