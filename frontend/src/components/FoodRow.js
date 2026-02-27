import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFoodInMeal, deleteFoodFromMeal, updateFoodInMeal } from "../services/MealService";
import { useEffect, useMemo, useState } from "react";

export function FoodRow( { existingFoods, mealFoodId, food, mealType, mealId, setFoodsToBeCreated} ) {
    const [foodRow, setFoodRow] = useState(food)
    const queryClient = useQueryClient();
    const options = useMemo(() => {
        if (!existingFoods) return [];
        if (!foodRow) return existingFoods;
        let combined = existingFoods;
        console.log(foodRow)
        if (foodRow && foodRow.foodId !== -1) {
            combined = [...existingFoods, foodRow];
        }
        // Deduplicate by foodId
        const uniqueMap = new Map(
            combined.map(food => [food.foodId, food])
        );
        return Array.from(uniqueMap.values());
    }, [existingFoods, foodRow]);

    const createMealFoodMutation = useMutation({
        mutationFn: ({ mealId, updatedMealFood }) =>
            createFoodInMeal(mealId, updatedMealFood.foodId),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['meal-foods', mealId]);
            const newFoodRow = {
                ...variables.updatedMealFood,
                mealFoodId: data,
                tempId: undefined
            }
            setFoodRow(newFoodRow);
            setFoodsToBeCreated(prev => prev.filter(food => food.tempId !== variables.updatedMealFood.tempId))
        },
        onError: (error) => {
            console.error("Create failed:", error);
            if (error.response.data.error === `duplicate key value violates unique constraint "foods_name_key"`) {
                alert("The food has already existed in the current meal.")
            } else {
                alert("Failed to create the food in meal");
            }
        }
    });

    const updateMealFoodMutation = useMutation({
        mutationFn: ({ mealFoodId, updatedMealFood }) =>
            updateFoodInMeal(mealFoodId, updatedMealFood.foodId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['meal-foods', mealId]);
            setFoodRow(variables.updatedMealFood);
        },
        onError: (error) => {
            console.error("Update failed:", error);
            alert("Failed to update the food in meal");
        }
    });

    const deleteMealFoodMutation = useMutation({
        mutationFn: (mealFoodId) =>
            deleteFoodFromMeal(mealFoodId),
        onSuccess: () => {
            console.log('before delete')
            queryClient.invalidateQueries(['meal-foods', mealId]);
            console.log('after delete')
        },
        onError: (error) => {
            console.error("Delete failed:", error);
            alert("Failed to delete the food from meal");
        }
    });

    async function handleFoodChange(e) {
        const selected = existingFoods.find(
            i => i.foodName === e.target.value
        );
        if (!selected) return;
        const updatedMealFood = {
            ...foodRow,
            foodId: selected.foodId,
            foodName: selected.foodName,
            foodDescription: selected.foodDescription
        }
        if (mealFoodId !== -1) {
            await updateMealFoodMutation.mutateAsync({mealFoodId, updatedMealFood})
        } else {
            await createMealFoodMutation.mutateAsync({mealId, updatedMealFood})
        }
    };


    async function handleDeleteFood() {
        console.log('deleteMealFoodMutation', foodRow.mealFoodId)
        await deleteMealFoodMutation.mutateAsync(foodRow.mealFoodId); 
    }

    useEffect(() => console.log(foodRow),[foodRow])
    if (!foodRow) return null;

    return (<>
        <label htmlFor={`${mealType}-${foodRow.foodName}`}></label>
        <select name={`${mealType}-${foodRow.foodName}`} 
            data-new-row={foodRow.foodName === "" ? "true" : undefined}
            className="food-list-select"
            id={`${mealType}-${foodRow.foodName}`} 
            value={foodRow.foodName} 
            onChange={(e) => {
                e.stopPropagation()
                handleFoodChange(e)}}
        >
            <option value="">-- Select a food --</option>
            {options.map(food => (
                <option key={`${food.foodId}`} value={food.foodName}>{food.foodName}</option>   
            ))}
        </select>
        <button id={`food-delete-btn-${mealType}-${foodRow.mealFoodId}`} className="food-delete-btn" title="Delete Food From Meal" onClick={(e) => {
            e.stopPropagation(); 
            handleDeleteFood();
        }}><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z"/></svg>
        </button>
    </>)
};

