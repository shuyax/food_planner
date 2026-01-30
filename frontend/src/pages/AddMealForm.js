import { createMeal } from "../services/MealService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MealTypeList } from "../components/MealTypeList";
import { fetchFoods } from "../services/FoodService";
import { deleteMeal } from "../services/MealService";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";
import { useState } from "react";

function AddMealForm() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mealDate = searchParams.get("date");

    const defaultMeal = {
        mealId: -1,
        mealDate: mealDate,
        mealType: '',
        foods: []
    }
    const [meals, setMeals] = useState([defaultMeal]);
    const [calendarRefresh, setCalendarRefresh] = useState(0); // trigger calendar update

    // fetch all existing foods
    const { data: foodData,
        isLoading: foodIsLoading,
        error: foodError } = useQuery({
        queryKey: ["foods"],
        queryFn: fetchFoods
    });

    const createMealMutation = useMutation({
        mutationFn: ({ mealType, mealDate}) =>
            createMeal(mealType, mealDate),
        onSuccess: (data, variables) => {
            const { mealType, mealDate } = variables;
            console.log("Meal created:" , data, "for", mealType, "on", mealDate);
            const newMeal = {
                mealId: data,
                mealType,
                mealDate,
                foods: []
            };
            setMeals(prev => [...prev, newMeal]);
            setCalendarRefresh((prev) => prev + 1);
        },
        onError: (error) => {
            console.error("Failed to create meal:", error);
            alert("Failed to save meal.");
        }
    })

    const deleteMealMutation = useMutation({
        mutationFn: (mealId) => deleteMeal(mealId), // your backend API call
        onSuccess: (_, mealId) => {
            // queryClient.invalidateQueries(["meals"]); // refresh meals list
            console.log("Meal deleted:", mealId);
        },
        onError: (err) => {
            console.error("Failed to delete meal:", err);
            alert("Failed to delete meal.");
        }
    });


    if (!mealDate) return <p>WARNING: You cannot add a meal without a date.</p>;

    if ( foodIsLoading) return <p>Foods Loading ...</p>;
    if ( foodError) return <p>Foods Error: {foodError.message}</p>;

    async function AddMeal(mealType) {
        if (!mealType || !mealDate) {
            alert('Must select a valid meal type')
            return;
        }
        try {
            await createMealMutation.mutateAsync({
                mealType: mealType,
                mealDate: mealDate,
            });
            console.log("Meal creation triggered!");
        } catch (err) {
            console.error("Failed to create meal:", err);
        }
    }


    function updateMeal(mealId, updatedMeal) {
        setMeals(prev => prev.map(row => row.mealId === mealId ? updatedMeal : row))
        setCalendarRefresh((prev) => prev + 1);
    };

    async function removeMeal(mealId) {
        try {
            // Wait for backend to delete the meal first
            await deleteMealMutation.mutateAsync(mealId);
            // Update local state after deletion succeeds
            setMeals(prev => prev.filter(meal => meal.mealId !== mealId));
            // Trigger calendar refresh
            setCalendarRefresh(prev => prev + 1);
        } catch (err) {
            console.error("Failed to delete meal:", err);
            alert("Failed to delete meal.");
        }
    };

    return (<div className="meal-form">
        <Calendar
            mode="add"
            selectedDate={mealDate}
            onDateChange={(newDate) =>
                navigate(`/add-meal?date=${newDate}`)
            }
            refreshTrigger={calendarRefresh}
            existingFoods={foodData}
            updateMeal={(mealId, updatedFood) => updateMeal(mealId, updatedFood)}
            removeMeal={(mealId) => removeMeal(mealId)}
        />
        <MealTypeList AddMeal={(mealType) => AddMeal(mealType)} /> 
      </div>);
};

export default AddMealForm;