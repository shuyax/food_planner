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

  it("returns 400 if fodd name is missing", async () => {
          const req = { body: {} }; // date missing
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn()
          };
          const next = jest.fn();
          await FoodController.createFood(req, res, next);
          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.json).toHaveBeenCalledWith({ error: "Name is required" });
          expect(next).not.toHaveBeenCalled();
      });
  
      it("calls next if there is an error", async () => {
          const req = { body: { name: "Rice" } };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn()
          };
          const next = jest.fn();
          // Force the service to throw an error
          const mockError = new Error("DB error");
          FoodService.createFood = jest.fn().mockRejectedValue(mockError);
          await FoodController.createFood(req, res, next);
          expect(next).toHaveBeenCalledWith(mockError);
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