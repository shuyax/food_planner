const FoodController = require("../../src/controllers/FoodController");
const FoodService = require("../../src/services/FoodService");
jest.mock("../../src/services/FoodService");

describe("FoodController.createFood", () => {
  it("returns 201 and food data", async () => {
    const req = {
      body: { name: "Rice" }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    // Define service returning new food ID, 1
    FoodService.createFood.mockResolvedValue(1);
    await FoodController.createFood(req, res, next);
    expect(FoodService.createFood).toHaveBeenCalledWith("Rice", null);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
        id: 1,
        name: "Rice",
        description: null
    });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("FoodController.addImageToFood", () => {
  it("returns 201 and image data", async () => {
    const req = {
      body: { foodId: 3,
        url: '/uploads' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    FoodService.addImageToFood.mockResolvedValue(1);
    await FoodController.addImageToFood(req, res, next);
    expect(FoodService.addImageToFood).toHaveBeenCalledWith(3, '/uploads', null);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
        id: 1,
        foodId: 3,
        url: '/uploads',
        alt: null
    });
    expect(next).not.toHaveBeenCalled();
  });
});