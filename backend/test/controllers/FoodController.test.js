const FoodController = require("../../src/controllers/FoodController");
const FoodService = require("../../src/services/FoodService");
jest.mock("../../src/services/FoodService");

describe("FoodController.createFood", () => {
  it("returns 201 and foodId", async () => {
    const req = {
      body: { name: "Rice" }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    const mockFoodId = 46;
    FoodService.createFood.mockResolvedValue(mockFoodId);
    await FoodController.createFood(req, res, next);
    expect(FoodService.createFood).toHaveBeenCalledWith("Rice", null);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockFoodId);
    expect(next).not.toHaveBeenCalled();
  });

  it("with food description returns 201 and foodId", async () => {
    const req = {
      body: { name: "Rice",
        description: "How to cook rice"
       }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    const mockFoodId = 46;
    FoodService.createFood.mockResolvedValue(mockFoodId);
    await FoodController.createFood(req, res, next);
    expect(FoodService.createFood).toHaveBeenCalledWith("Rice", "How to cook rice");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockFoodId);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 if food name is missing", async () => {
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

describe("FoodController.addIngredientsToFood", () => {
  let req, res, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("adds ingredients to food and returns 201", async () => {
    req = {
      body: {
        foodId: 10,
        ingredients: [
          {
            ingredientId: 1,
            quantity: 2,
            unitId: 5,
            note: "chopped"
          },
          {
            ingredientId: 2,
            quantity: 0,
            unitId: -1,
            note: ""
          }
        ]
      }
    };

    jest
      .spyOn(FoodService, "addIngredientToFood")
      .mockResolvedValueOnce(101)
      .mockResolvedValueOnce(102);

    await FoodController.addIngredientsToFood(req, res, next);
    // Service calls
    expect(FoodService.addIngredientToFood).toHaveBeenCalledTimes(2);
    expect(FoodService.addIngredientToFood).toHaveBeenNthCalledWith(1,10,1,2,5,"chopped");

    expect(FoodService.addIngredientToFood).toHaveBeenNthCalledWith(2,10,2,null,null, null);

    // Response
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      foodId: 10,
      ingredients: [
        {
          ingredientId: 1,
          quantity: 2,
          unitId: 5,
          note: "chopped",
          foodIngredientId: 101
        },
        {
          ingredientId: 2,
          quantity: 0,
          unitId: -1,
          note: "",
          foodIngredientId: 102
        }
      ]
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 if foodId or ingredients are missing", async () => {
    req = {
      body: {
        foodId: null,
        ingredients: []
      }
    };

    await FoodController.addIngredientsToFood(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "foodId and ingredients are required"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next if FoodService throws an error", async () => {
    req = {
      body: {
        foodId: 10,
        ingredients: [
          {
            ingredientId: 1,
            quantity: 1,
            unitId: 2,
            note: null
          }
        ]
      }
    };

    const mockError = new Error("DB failure");
    jest
      .spyOn(FoodService, "addIngredientToFood")
      .mockRejectedValue(mockError);

    await FoodController.addIngredientsToFood(req, res, next);

    expect(next).toHaveBeenCalledWith(mockError);
    expect(res.status).not.toHaveBeenCalled();
  });
});