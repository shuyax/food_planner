import { useMutation, useQuery } from "@tanstack/react-query";
import { MealTypeList } from "../components/MealTypeList";
import { fetchFoods } from "../services/FoodService";
import { createMeal, deleteMeal, fetchMeals, fetchRelatedFoods } from "../services/MealService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import "./MealForm.css"
import EditMeal from "../components/EditMeal";
import DisplayMeal from "../components/DisplayMeal";

function MealForm({ visibleBackButton = true }) {

    const navigate = useNavigate();
    const [editingMeal, setEditingMeal] = useState(null);
    const [editMode, setEditMode] = useState(false)
    
    const [searchParams] = useSearchParams();
    const mealDate = searchParams.get("date");

    // fetch all existing foods
    const { data: foodData,
        isLoading: foodIsLoading,
        error: foodError } = useQuery({
        queryKey: ["foods"],
        queryFn: fetchFoods
    });

    // fetch a single day meals
    const { data: meals = [] } = useQuery({
        queryKey: ['meals-foods', mealDate],
        queryFn: async () => {
          const baseMeals = await fetchMeals(mealDate, mealDate);
          return Promise.all(
            baseMeals.map(async (meal) => ({
              ...meal,
              foods: await fetchRelatedFoods(meal.mealId),
            }))
          );
        },
        enabled: Boolean(mealDate),
        staleTime: 1000 * 60 * 5,
    });

    const queryClient = useQueryClient();
    const createMealMutation = useMutation({
        mutationFn: ({ mealType, mealDate}) =>
            createMeal(mealType, mealDate),
        onSuccess: (data, variables) => {
            const { mealType, mealDate } = variables;
            console.log("Meal created:" , data, "for", mealType, "on", mealDate);
            queryClient.invalidateQueries(['meals-foods', mealDate]);
        },
        onError: (error) => {
            console.error("Failed to create meal:", error);
            alert("Failed to save meal.");
        }
    });

    const deleteMealMutation = useMutation({
        mutationFn: (mealId) => deleteMeal(mealId), // your backend API call
        onSuccess: (_, mealId) => {
            console.log("Meal deleted:", mealId);
            queryClient.invalidateQueries(['meals-foods', mealDate]);
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

    async function removeMeal(mealId) {
        try {
            // Wait for backend to delete the meal first
            await deleteMealMutation.mutateAsync(mealId);
        } catch (err) {
            console.error("Failed to delete meal:", err);
            alert("Failed to delete meal.");
        }
    };

    return (<>
        <div className="meal-form">
            <h1 id="meal-date">{mealDate}</h1>
            {editMode ? <><div id="day-cell">
                {meals.map(meal => (
                    meal.mealId === editingMeal?.mealId ? 
                    <EditMeal 
                    key={`${editingMeal.mealId}-${editingMeal.foods}`}
                    color={MEAL_COLORS[meal.mealType]} 
                    mealId={meal.mealId}
                    removeMeal={() => removeMeal(meal.mealId)}
                    mealType={meal.mealType}
                    foodData={foodData}
                    /> : <DisplayMeal 
                    key={meal.mealId}
                    meal={meal} 
                    color={MEAL_COLORS[meal.mealType]} 
                    setEditingMeal={setEditingMeal}
                    editMode={editMode}
                    />
                ))}
            </div> 
            <MealTypeList AddMeal={(mealType) => AddMeal(mealType)} />
            <button id="day-meals-checkmark" title="Exit Edit Mode" className="save-btn" aria-label="Exit Edit Mode" onClick={(e) => {e.stopPropagation(); setEditingMeal(null)
                setEditMode(false);}}><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
            </> : <>
            {meals.map(meal => (<DisplayMeal 
                key={meal.mealId}
                meal={meal} 
                color={MEAL_COLORS[meal.mealType]} 
                setEditingMeal={setEditingMeal}
                editMode={editMode}
                />))}
            <button id={`day-meals-edit`} className="edit-btn" title="Edit Meals" aria-label="Edit Meals" onClick={(e) => {e.stopPropagation(); 
                setEditMode(true)}}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.41 6.34a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L15.13 4.34l3.75 3.75 2.53-2.53z"/></svg></button>
            </>}
        </div>
        {visibleBackButton && !editMode && <button id="food-back" className="back-btn" title="Back to Home Page" aria-label="Back to Home Page" onClick={(e) => {e.stopPropagation(); 
            navigate(`/`)}}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="12" r="10"></circle> <path d="M15 12H9"></path><polyline points="12 15 9 12 12 9"></polyline></svg></button>}
    </>);
};

export default MealForm;

const MEAL_COLORS = {
    breakfast: '#FACC15', // yellow
    lunch: '#4ADE80',     // green
    dinner: '#60A5FA',    // blue
    snack: '#FB7185',     // pink/red
    drink: '#A78BFA'      // purple
};