const express = require("express");
const router = express.Router();
const MealController = require("../controllers/MealController");

router.get("/", MealController.getMeals);
router.get("/meal-types", MealController.getMealTypes);
router.post("/", MealController.createMeal)

module.exports = router;