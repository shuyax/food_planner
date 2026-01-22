const IngredientService = require("../services/IngredientService");

async function getIngredients(req, res, next) {
  try {
    const ingredients = await IngredientService.getAllIngredients();
    res.json(ingredients);
  } catch (err) {
    next(err);
  }
}

module.exports = {
    getIngredients
};
