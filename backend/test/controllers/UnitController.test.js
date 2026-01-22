const UnitController = require("../../src/controllers/UnitController");
const UnitService = require("../../src/services/UnitService");
jest.mock("../../src/services/UnitService");

describe("UnitController.getUnits", () => {
  it("returns all units grouped by type", async () => {
    const req = {};
    const res = {
      json: jest.fn()
    };
    const next = jest.fn();
    // Mock data to be returned by UnitService.getAllUnits
    const mockUnits = {
      count: [
        { id: 6, name: 'piece', abbreviation: 'pcs' },
        { id: 7, name: 'slice', abbreviation: 'slice' }
      ],
      volume: [
        { id: 11, name: 'cup', abbreviation: 'cup' },
        { id: 10, name: 'fluid ounce', abbreviation: 'fl oz' },
        { id: 14, name: 'gallon', abbreviation: 'gal' },
        { id: 5, name: 'liter', abbreviation: 'l' },
        { id: 4, name: 'milliliter', abbreviation: 'ml' },
        { id: 12, name: 'pint', abbreviation: 'pt' },
        { id: 13, name: 'quart', abbreviation: 'qt' },
        { id: 9, name: 'tablespoon', abbreviation: 'tbsp' },
        { id: 8, name: 'teaspoon', abbreviation: 'tsp' }
      ],
      weight: [
        { id: 1, name: 'gram', abbreviation: 'g' },
        { id: 2, name: 'kilogram', abbreviation: 'kg' },
        { id: 3, name: 'milligram', abbreviation: 'mg' },
        { id: 15, name: 'ounce', abbreviation: 'oz' },
        { id: 16, name: 'pound', abbreviation: 'lb' }
      ]
    };
    // Define service returning new food ID, 1
    UnitService.getAllUnits.mockResolvedValue(mockUnits);
    await UnitController.getUnits(req, res, next);
    expect(res.json).toHaveBeenCalledWith(mockUnits);
    expect(next).not.toHaveBeenCalled();
  });
  
  it("calls next on error", async () => {
    const req = {};
    const res = { json: jest.fn() };
    const next = jest.fn();

    // Make the mocked service throw an error
    const error = new Error("Database failure");
    UnitService.getAllUnits.mockRejectedValue(error);

    await UnitController.getUnits(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});