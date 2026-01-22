const express = require("express");
const router = express.Router();
const IngredientController = require("../controllers/IngredientController");

router.get("/", IngredientController.getIngredients);

module.exports = router;