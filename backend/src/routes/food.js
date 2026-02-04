const express = require("express");
const router = express.Router();
const FoodController = require("../controllers/FoodController");

router.get("/", FoodController.getFoods);
router.get("/:foodId", FoodController.getFood);
router.get("/:foodId/ingredients", FoodController.getRelatedIngredients);
router.post("/", FoodController.createFood);
router.put('/add-image', FoodController.addImageToFood)
router.put('/update-food', FoodController.updateFood)
router.post("/add-ingredients", FoodController.addIngredientsToFood);

module.exports = router;