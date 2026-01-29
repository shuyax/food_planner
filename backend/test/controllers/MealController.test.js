const MealController = require("../../src/controllers/MealController");
const MealService = require("../../src/services/MealService");
jest.mock("../../src/services/MealService");

describe("MealController.getMeals", () => {
    it("returns all meals order by date", async () => {
        const req = { headers: {
            "startdate": "2026-01-01",
            "enddate": "2026-01-31"
        }};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        // Mock data to be returned by IngredientService.getIngredients
        const mockMeals = [
            { meal_id: 1, meal_type: 'dinner', meal_date: '2026-01-05', food_id: 1, meal_food_id: 1 },
            { meal_id: 2, meal_type: 'drink', meal_date: '2026-01-05', food_id: 4, meal_food_id: 2 },
            { meal_id: 3, meal_type: 'dinner', meal_date: '2026-01-06', food_id: 2, meal_food_id: 3 }
        ];
        // Define service returning new ingredients
        MealService.getMeals.mockResolvedValue(mockMeals);
        await MealController.getMeals(req, res, next);
        expect(res.json).toHaveBeenCalledWith(mockMeals);
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 if headers are missing", async () => {
        const req = { headers: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await MealController.getMeals(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "startDate and endDate headers are required" });
        expect(next).not.toHaveBeenCalled();
    });
    
    it("calls next on error", async () => {
        const req = { headers: {
            "startdate": "2026-01-01",
            "enddate": "2026-01-31"
        } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        // Make the mocked service throw an error
        const error = new Error("Database failure");
        MealService.getMeals.mockRejectedValue(error);
        await MealController.getMeals(req, res, next);
        expect(next).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled();
    });
});


describe("MealController.createMeal", () => {
    it("creates a meal and returns a mealId", async () => {
        const req = {
            body: {
                type: "dinner",
                date: "2026-01-15"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        // Mock the service to return a mealId
        const mockMealId = 42;
        // Mock MealService methods
        jest.spyOn(MealService, "createMeal").mockResolvedValue(mockMealId);
        await MealController.createMeal(req, res, next);
        // Verify createMeal called
        expect(MealService.createMeal).toHaveBeenCalledWith("dinner", "2026-01-15");
        // Verify response
        expect(res.json).toHaveBeenCalledWith(mockMealId);

        // next should not be called
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 if type or date is missing", async () => {
        const req = { body: { type: "dinner" } }; // date missing
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        await MealController.createMeal(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "meal type and meal date are required" });
        expect(next).not.toHaveBeenCalled();
    });

    it("calls next if there is an error", async () => {
        const req = { body: { type: "dinner", date: "2026-01-15" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        // Force the service to throw an error
        const mockError = new Error("DB error");
        MealService.createMeal = jest.fn().mockRejectedValue(mockError);
        await MealController.createMeal(req, res, next);
        expect(next).toHaveBeenCalledWith(mockError);
    });
});

describe("MealController.getMealTypes", () => {
    it("returns all meal types supported", async () => {
        const req = {};
        const res = {json: jest.fn()};
        const next = jest.fn();
        const mockMealTypes =  [ 'breakfast', 'lunch', 'dinner', 'snack', 'drink' ];
        MealService.getMealTypes.mockResolvedValue(mockMealTypes);
        await MealController.getMealTypes(req, res, next);
        expect(res.json).toHaveBeenCalledWith(mockMealTypes);
        expect(next).not.toHaveBeenCalled();
    });
    it("calls next if there is an error", async () => {
        const req = {};
        const res = {
            json: jest.fn()
        };
        const next = jest.fn();
        // Force the service to throw an error
        const mockError = new Error("DB error");
        MealService.getMealTypes = jest.fn().mockRejectedValue(mockError);
        await MealController.getMealTypes(req, res, next);
        expect(next).toHaveBeenCalledWith(mockError);
    });
});

describe("MealController.getRelatedFoods", () => {
    it("returns all foods in a meal ordered by food name", async () => {
        const req = {
            params: { mealId: "3" }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const mockFoods = [
            {
                meal_food_id: 3,
                food_id: 3,
                name: 'spicy sour noodle',
                description: 'yuanxian big glass noodle',
                cost: 0.796
            },
            {
                meal_food_id: 2,
                food_id: 2,
                name: 'stir fry bok choy',
                description: 'spicy stir fry bok choy with garlic',
                cost: 1.4894
            }
        ];

        MealService.getRelatedFoods.mockResolvedValue(mockFoods);

        await MealController.getRelatedFoods(req, res, next);

        expect(MealService.getRelatedFoods).toHaveBeenCalledWith("3");
        expect(res.json).toHaveBeenCalledWith(mockFoods);
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 if mealId param is missing", async () => {
        const req = { params: {} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await MealController.getRelatedFoods(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "mealId param is required"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("calls next on service error", async () => {
        const req = {
            params: { mealId: "3" }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const error = new Error("Database failure");
        MealService.getRelatedFoods.mockRejectedValue(error);

        await MealController.getRelatedFoods(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled();
    });
});

describe("MealController.addFoodsToMeal", () => {
    it("creates a meal food combination in meal_food table and returns a mealFoodId", async () => {
        const req = {
            body: {
                mealId: 3,
                foods: [{
                    "foodId": 4,
                    "foodName": "taro milk tea",
                    "foodDescription": "how to make taro milk tea"
                }, {
                    "foodId": 6,
                    "foodName": "beef jerky",
                    "foodDescription": ""
                }]
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        // Mock MealService methods
        jest.spyOn(MealService, "addFoodToMeal")
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(2);
        await MealController.addFoodsToMeal(req, res, next);
        // Verify createMeal called
        expect(MealService.addFoodToMeal).toHaveBeenCalledTimes(2);
        expect(MealService.addFoodToMeal).toHaveBeenCalledWith(3, 4);
        expect(MealService.addFoodToMeal).toHaveBeenCalledWith(3, 6);
        // Verify response
        const mockResult = {
            mealId: 3,
            addedFoods: [{ 
                foodId: 4,
                mealFoodId: 1
            }, { 
                foodId: 6,
                mealFoodId: 2
            }]
        };
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockResult);

        // next should not be called
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 if mealId or foods is missing", async () => {
        const req = { body: { mealId: 3 } }; // foods missing
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        await MealController.addFoodsToMeal(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "mealId and non-empty foods array are required" });
        expect(next).not.toHaveBeenCalled();
    });

    it("calls next if there is an error", async () => {
        const req = { body: {
            mealId: 3,
            foods: [{
                "foodId": 4,
                "foodName": "taro milk tea",
                "foodDescription": "how to make taro milk tea"
            }]
        }};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        // Force the service to throw an error
        const mockError = new Error("DB error");
        jest.spyOn(MealService, "addFoodToMeal").mockRejectedValue(mockError);
        await MealController.addFoodsToMeal(req, res, next);
        expect(next).toHaveBeenCalledWith(mockError);
        expect(res.json).not.toHaveBeenCalled();
    });
});
