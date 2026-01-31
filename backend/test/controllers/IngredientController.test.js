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

describe("IngredientController.createIngredient", () => {
    it("creates an ingredient and returns an ingredientId", async () => {
        const req = {
            body: {
                name: "tomato", 
                canonicalUnitId: 6
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        // Mock the service to return an IngredientId
        const mockIngredientId = 42;
        // Mock IngredientService methods
        jest.spyOn(IngredientService, "createIngredient").mockResolvedValue(mockIngredientId);
        await IngredientController.createIngredient(req, res, next);
        // Verify createIngredient called
        expect(IngredientService.createIngredient).toHaveBeenCalledWith("tomato", 6);
        // Verify response
        expect(res.json).toHaveBeenCalledWith(mockIngredientId);

        // next should not be called
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 if name is missing", async () => {
        const req = { body: {} }; 
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        await IngredientController.createIngredient(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Ingredient name is required" });
        expect(next).not.toHaveBeenCalled();
    });

    it("calls next if there is an error", async () => {
        const req = { body: {
                name: "tomato", 
                canonicalUnitId: 6
            } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        // Force the service to throw an error
        const mockError = new Error("DB error");
        IngredientService.createIngredient = jest.fn().mockRejectedValue(mockError);
        await IngredientController.createIngredient(req, res, next);
        expect(next).toHaveBeenCalledWith(mockError);
    });
});