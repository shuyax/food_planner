const express = require("express");
const router = express.Router();
const FoodController = require("../controllers/FoodController");

router.get("/", FoodController.getFoods);
router.get("/:foodId", FoodController.getFood);
router.post("/", FoodController.createFood);
router.put('/add-image', FoodController.addImageToFood)
router.post("/add-ingredients", FoodController.addIngredientsToFood);

module.exports = router;