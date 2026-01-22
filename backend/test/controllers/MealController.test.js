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
    it("creates a meal and returns a mealId and mealFoodIds", async () => {
        const req = {
            body: {
                type: "dinner",
                date: "2026-01-15",
                foods: [{
                    "foodId": 5,
                    "foodName": "overnight oats",
                    "foodDescription": "how to make overnight oats"
                },{
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
        // Mock the service to return a mealId
        const mockMealId = 42;
        const mockMealFoodIds = [101, 102]
        // Mock MealService methods
        jest.spyOn(MealService, "createMeal").mockResolvedValue(mockMealId);
        jest.spyOn(MealService, "addFoodToMeal")
            .mockResolvedValueOnce(mockMealFoodIds[0])
            .mockResolvedValueOnce(mockMealFoodIds[1]);

        await MealController.createMeal(req, res, next);
        // Verify createMeal called
        expect(MealService.createMeal).toHaveBeenCalledWith("dinner", "2026-01-15");
        // Verify addFoodToMeal called for each food
        expect(MealService.addFoodToMeal).toHaveBeenCalledTimes(req.body.foods.length);
        expect(MealService.addFoodToMeal).toHaveBeenCalledWith(mockMealId, 5);
        expect(MealService.addFoodToMeal).toHaveBeenCalledWith(mockMealId, 6);
        // Verify response
        expect(res.json).toHaveBeenCalledWith({
            mealId: mockMealId,
            mealFoodIds: mockMealFoodIds
        });

        // next should not be called
        expect(next).not.toHaveBeenCalled();
    });

    it("creates a meal when no foods are provided", async () => {
        const req = {
            body: { type: "lunch", date: "2026-01-16", foods: [] }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        const mockMealId = 43;
        jest.spyOn(MealService, "createMeal").mockResolvedValue(mockMealId);
        await MealController.createMeal(req, res, next);
        expect(MealService.createMeal).toHaveBeenCalledWith("lunch", "2026-01-16");
        expect(res.json).toHaveBeenCalledWith({ mealId: mockMealId, mealFoodIds: [] });
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