const IngredientController = require("../../src/controllers/IngredientController");
const IngredientService = require("../../src/services/IngredientService");
jest.mock("../../src/services/IngredientService");

describe("IngredientController.getIngredients", () => {
  it("returns all ingredients order by name", async () => {
    const req = {};
    const res = {
      json: jest.fn()
    };
    const next = jest.fn();
    // Mock data to be returned by IngredientService.getIngredients
    const mockIngredients = [
        { id: 12474, name: 'soy sauce', canonical_unit_id: 9 },
        { id: 12473, name: 'tomato', canonical_unit_id: 6 }
    ];
    // Define service returning new ingredients
    IngredientService.getAllIngredients.mockResolvedValue(mockIngredients);
    await IngredientController.getIngredients(req, res, next);
    expect(res.json).toHaveBeenCalledWith(mockIngredients);
    expect(next).not.toHaveBeenCalled();
  });
  
  it("calls next on error", async () => {
    const req = {};
    const res = { json: jest.fn() };
    const next = jest.fn();

    // Make the mocked service throw an error
    const error = new Error("Database failure");
    IngredientService.getAllIngredients.mockRejectedValue(error);
    await IngredientController.getIngredients(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});