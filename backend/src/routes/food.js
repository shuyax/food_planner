const express = require("express");
const router = express.Router();
const FoodController = require("../controllers/FoodController");

router.get("/", FoodController.getFoods);
router.post("/", FoodController.createFood);
router.put('/add-image', FoodController.addImageToFood)

module.exports = router;