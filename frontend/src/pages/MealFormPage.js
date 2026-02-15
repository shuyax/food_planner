import { useMutation, useQuery } from "@tanstack/react-query";
import { MealTypeList } from "../components/MealTypeList";
import { fetchFoods } from "../services/FoodService";
import { createMeal, deleteMeal, fetchMeals, fetchRelatedFoods, updateFoodsToMeal } from "../services/MealService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import "./MealForm.css"
import EditMeal from "../components/EditMeal";
import DisplayMeal from "../components/DisplayMeal";

function MealForm({ visibleBackButton = true }) {

    const navigate = useNavigate();
    const [editingMeal, setEditingMeal] = useState(null);
    const [editMode, setEditMode] = useState(false)
    const prevMealRef = useRef(null);
    
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
        queryKey: ['meals', mealDate],
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
            queryClient.invalidateQueries({
                queryKey: ['meals'],
            });
        },
        onError: (error) => {
            console.error("Failed to create meal:", error);
            alert("Failed to save meal.");
        }
    });

    const updateFoodsToMealMutation = useMutation({
        mutationFn: ({ mealId, foods}) =>
            updateFoodsToMeal(mealId, foods),
        onSuccess: (data) => {
            console.log("Foods updated to a meal" , data);
            queryClient.invalidateQueries({ queryKey: ['meals'] });
            // only update foods with new mealFoodIds if the editing meal doesn't change
            if (editingMeal.mealId === data.mealId) {
                setEditingMeal(prevMeal => ({
                ...prevMeal,
                foods: data.foods
                }));
            }
        },
        onError: (error) => {
            console.error("Failed to update foods to a meal:", error);
            alert("Failed to update foods to a meal.");
        }
    })

    const deleteMealMutation = useMutation({
        mutationFn: (mealId) => deleteMeal(mealId), // your backend API call
        onSuccess: (_, mealId) => {
            console.log("Meal deleted:", mealId);
            queryClient.invalidateQueries({ queryKey: ['meals'] });
        },
        onError: (err) => {
            console.error("Failed to delete meal:", err);
            alert("Failed to delete meal.");
        }
    });
    
    useEffect(() => {
        if (!editingMeal) return;
        const filteredMeal = {
            ...editingMeal,
            foods: editingMeal.foods.filter(food => !(food.foodId === -1 && food.mealFoodId === -1))
        };
        const prevMeal = prevMealRef.current;
        // FIRST TIME: just store and exit
        if (!prevMeal) {
            prevMealRef.current = filteredMeal;
            return;
        }
        // 🟢 CASE 1: User switched meals
        if (prevMeal.mealId !== filteredMeal.mealId) {
            // Save previous meal before switching
            updateMeal(prevMeal.mealId, prevMeal);
            // Store new one
            prevMealRef.current = filteredMeal;
            return;
        }
        // 🟢 CASE 2: Same meal, content changed
        if (JSON.stringify(prevMeal) !== JSON.stringify(filteredMeal)) {
            prevMealRef.current = filteredMeal;
            updateMeal(filteredMeal.mealId, filteredMeal);
        }
        // eslint-disable-next-line
    }, [editingMeal]);

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


    async function updateMeal(mealId, updatedMeal) {
        if (!mealId || updatedMeal.foods.length === 0) return;
        try {
            await updateFoodsToMealMutation.mutateAsync({
                mealId: mealId,
                foods: updatedMeal.foods,
            });
            console.log("Meal-food update triggered!");
        } catch (err) {
            console.error("Failed to update foods to a meal:", err);
        }
    };

    function handleMealChange(mealFoodId, updatedFood) {
        setEditingMeal(prevMeal => ({
            ...prevMeal,
            foods: prevMeal.foods.map(f =>
                f.mealFoodId === mealFoodId ? updatedFood : f
            )
        }));
    };


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
                    key={editingMeal.mealId}
                    color={MEAL_COLORS[meal.mealType]} 
                    editingMeal={editingMeal} 
                    setEditingMeal={setEditingMeal} 
                    handleMealChange={(mealFoodId, updatedFood) => handleMealChange(mealFoodId, updatedFood)} 
                    removeMeal={() => removeMeal(meal.mealId)}
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
            <button id="day-meals-checkmark" title="Exit Edit Mode" onClick={(e) => {
                e.stopPropagation();
                setEditMode(false);
            }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            </> : <>
            {meals.map(meal => (<DisplayMeal 
                key={meal.mealId}
                meal={meal} 
                color={MEAL_COLORS[meal.mealType]} 
                setEditingMeal={setEditingMeal}
                editMode={editMode}
                />))}
            <button id={`day-meals-edit`} className="day-meals-edit-btn" title="Edit Meals" onClick={(e) => {
                e.stopPropagation(); 
                setEditMode(true)
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.41 6.34a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L15.13 4.34l3.75 3.75 2.53-2.53z"/>
                </svg>
            </button>
            </>}
        </div>
        {visibleBackButton && <button id="food-back" onClick={(e) => {
            e.stopPropagation(); 
            navigate(`/`)}}>Back</button>}
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