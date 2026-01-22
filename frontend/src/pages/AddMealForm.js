import { createMeal, fetchMealTypes } from "../services/MealService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MealTypeList } from "../components/MealTypeList";
import { FoodRow } from "../components/FoodRow";
import { fetchFoods } from "../services/FoodService";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";
import { useState } from "react";
import "./AddMealForm.css"

function AddMealForm() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mealDate = searchParams.get("date");
    const defaultMeal = {
        mealDate: mealDate,
        mealType: '',
        foods: []
    }
    const [meals, setMeals] = useState([defaultMeal]);

    const { data: mealTypesData,
        isLoading: mealTypesIsLoading,
        error: mealTypesError } = useQuery({
        queryKey: ["mealTypes"],
        queryFn: fetchMealTypes
    });
    const { data: foodData,
        isLoading: foodIsLoading,
        error: foodError } = useQuery({
        queryKey: ["foods"],
        queryFn: fetchFoods
    });
    const createMealMutation = useMutation({
        mutationFn: ({ mealType, mealDate, foods }) =>
            createMeal(mealType, mealDate, foods),
        onSuccess: (data) => {
            console.log("Meal created:" , data);
        },
        onError: (error) => {
            console.error("Failed to create meal:", error);
            alert("Failed to save meal.");
        }
    })

    if (!mealDate) return <p>WARNING: You cannot add a meal without a date.</p>;
    if ( mealTypesIsLoading) return <p>Meal Types Loading ...</p>;
    if ( mealTypesError) return <p>Meal Types Error: {mealTypesError.message}</p>;
    if ( foodIsLoading) return <p>Foods Loading ...</p>;
    if ( foodError) return <p>Foods Error: {foodError.message}</p>;

    function addMeal() {
        setMeals(prev => [...prev, { ...defaultMeal}]);
    };

    function updateMeal(index, updatedMeal) {
        setMeals(prev => prev.map((row, i) => i === index ? updatedMeal : row))
    };

    function removeMeal(index) {
        setMeals(prev => prev.filter((_, i) => i !== index));
    };

    async function handleSave() {
        const mealMap = new Map();
        for (const meal of meals) {
            const foods = meal.foods.filter((food) => food.foodId !== -1)
            const hasMealType = meal.mealType.trim() !== "";

            if (!hasMealType && foods.length > 0) {
                // Rule 1: meal type empty + foods exist → alert & stop
                alert("Please select a meal type before submitting.");
                return;
            } else if (!hasMealType && foods.length === 0) {
                // Rule 2: meal type empty + no foods → skip (delete)
                continue
            }
            // Rule 3: merge by mealType
            if (!mealMap.has(meal.mealType)) {
                mealMap.set(meal.mealType, {
                    ...meal,
                    foods: [...foods]
                });
            } else {
                mealMap.get(meal.mealType).foods.push(...foods);
            }
        }
        const mergedMeals = Array.from(mealMap.values());
        if (mergedMeals.length === 0) {
            alert("Nothing to save.");
            return;
        }
        // update UI state so it matches what will be saved
        setMeals(mergedMeals);
        console.log(mergedMeals)
        try {
            await Promise.all(
                mergedMeals.map(meal =>
                    createMealMutation.mutateAsync({
                        mealType: meal.mealType,
                        mealDate: meal.mealDate,
                        foods: meal.foods
                    })
                )
            );

            alert("Meals saved successfully!");
        } catch (err) {
            alert("Failed to save meals.");
        }
    };

    return (<div className="meal-form">
        <Calendar
            mode="add"
            selectedDate={mealDate}
            onDateChange={(newDate) =>
                navigate(`/add-meal?date=${newDate}`)
            }
        />
        {meals.map((meal, index) => (<div className="meal-row" key={`meal-row-${index}`}>
            <MealTypeList mealTypes={mealTypesData} mealIndex={index} meal={meal} updateMeal={(updatedMeal) => updateMeal(index, updatedMeal)} /> 
            <FoodRow existingFoods={foodData} mealIndex={index} meal={meal} updateMeal={(updatedMeal) => updateMeal(index, updatedMeal)} />
            <button className="remove-meal-btn" type="button" onClick={() => removeMeal(index)}>Delete Meal</button>
            <p>-------------------------------------------------------------------------------------------------------------------</p>
        </div>))}
        
        <button id="add-meal" type="button" onClick={addMeal}>Add Meal</button>
        <br />
        <button id="meal-save" onClick={handleSave} disabled={createMealMutation.isPending}>Save</button>
        <button id="meal-cancel">Cancel</button>
    </div>);
};

export default AddMealForm;