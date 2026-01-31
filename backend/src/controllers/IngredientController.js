const IngredientService = require("../services/IngredientService");

async function getIngredients(req, res, next) {
  try {
    const ingredients = await IngredientService.getAllIngredients();
    res.json(ingredients);
  } catch (err) {
    next(err);
  }
};

async function createIngredient(req, res, next) {
  try {
    const { name, canonicalUnitId = null } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Ingredient name is required"})
    }
    const ingredientId = await IngredientService.createIngredient(name, canonicalUnitId)
    res.json(ingredientId)
  } catch (err) {
    next(err);
  }
};

module.exports = {
    getIngredients,
    createIngredient
};
