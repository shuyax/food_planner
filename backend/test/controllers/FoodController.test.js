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

describe("FoodController.getAllFoods", () => {
  it("should return an array of foods", async () => {
    const req = {};
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    const next = jest.fn();
    const mockFoods = [
      { foodId: 1, foodName: "Pizza", foodDescription: "Cheesy" },
      { foodId: 2, foodName: "Salad", foodDescription: "Healthy" }
    ];
    jest.spyOn(FoodService, "getAllFoods").mockResolvedValue(mockFoods);
    await FoodController.getFoods(req, res, next);
    expect(res.json).toHaveBeenCalledWith(mockFoods);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Array.isArray(res.json.mock.calls[0][0])).toBe(true);
  });

  it("should return empty array if no foods", async () => {
    const req = {};
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    const next = jest.fn();
    jest.spyOn(FoodService, "getAllFoods").mockResolvedValue([]);
    await FoodController.getFoods(req, res, next);
    expect(res.json).toHaveBeenCalledWith([]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should call next(err) if service throws an error", async () => {
    const req = {};
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    const next = jest.fn();
    const error = new Error("Database failure");
    jest.spyOn(FoodService, "getAllFoods").mockRejectedValue(error);
    await FoodController.getFoods(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("FoodController.getFood with foodId", () => {
  it("should return 400 if no foodId is provided", async () => {
    const req = { params: {} };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    const next = jest.fn();
    await FoodController.getFood(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400); // Express will 404 route not found
  });

  it("should return 404 if food not found", async () => {
    const req = { params: { foodId: "3" } }
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    const next = jest.fn();
    jest.spyOn(FoodService, "getFoodById").mockResolvedValue(null);
    await FoodController.getFood(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Food not found" });
  });

  it("should return 200 and food data if found", async () => {
    const req = { params: { foodId: "1" } }
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    const next = jest.fn();
    const mockFood = { foodId: 1, foodName: "Pizza", foodDescription: "Cheesy" };
    jest.spyOn(FoodService, "getFoodById").mockResolvedValue(mockFood);
    await FoodController.getFood(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockFood);
  });

  it("should call next() if an error occurs", async () => {
      const req = { params: { foodId: "3" } };
      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
      };
      const next = jest.fn();
      const error = new Error("Database failure");
      jest.spyOn(FoodService, "getFoodById").mockRejectedValue(error);
      await FoodController.getFood(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
  });
});