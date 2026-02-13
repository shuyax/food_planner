import { useMutation, useQuery } from "@tanstack/react-query";
import { MealTypeList } from "../components/MealTypeList";
import { fetchFoods } from "../services/FoodService";
import { createMeal, deleteMeal, fetchMeals, fetchRelatedFoods, updateFoodsToMeal } from "../services/MealService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import "./AddMealForm.css"
import { FoodRow } from "../components/FoodRow";
import EditMeal from "../components/EditMeal";
import DisplayMeal from "../components/DisplayMeal";

function AddMealForm({ visibleBackButton = true }) {

    const navigate = useNavigate();
    const [editingMeal, setEditingMeal] = useState(null);
    // const prevMealRef = useRef(true);
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

    return (<div className="meal-form">
        <h1 id="meal-date">{mealDate}</h1>
        <div id="day-cell">
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
                />
            ))}
            {/* {meals.map(meal => {
                return(
                <div id={`meal-section-${meal.mealType}`} 
                    key={`meal-section-${meal.mealType}`} className="meal-section" 
                    style={{backgroundColor: MEAL_COLORS[meal.mealType], borderColor: MEAL_COLORS[meal.mealType]}}>
                    {meal.mealId === editingMeal?.mealId ? 
                        <button id={`meal-delete-btn-${meal.mealType}`} className="meal-delete-btn" title="Delete Meal" onClick={(e) => {
                            e.stopPropagation(); 
                            removeMeal(meal.mealId)}}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                        </button> : <button onClick={() => setEditingMeal(meal)} id={`meal-edit-btn-${meal.mealType}`} className="meal-edit-btn" title="Edit Meal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.41 6.34a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L15.13 4.34l3.75 3.75 2.53-2.53z"/>
                            </svg>
                        </button>
                    }
                    <strong>{meal.mealType.toUpperCase()}</strong>
                    {meal.mealId === editingMeal?.mealId ? <>
                    <ol className="meal-foods-edit">{editingMeal.foods.map((food, index) => {
                        if (!(food.foodId === -1 && food.mealFoodId !== -1)) {return(<li className="meal-food-edit" id={`${editingMeal.mealType}-${food.mealFoodId}`} key={`${food.mealFoodId}`}>
                        <span>{index+1}. </span>
                        <FoodRow key={`${food.foodId}`} existingFoods={availableFoods} food={food} mealType={editingMeal.mealType} 
                        updateFood={(updatedFood) => handleMealChange(food.mealFoodId, updatedFood)}  
                        />
                        <button id={`food-delete-btn-${editingMeal.mealType}-${food.mealFoodId}`} className="food-delete-btn" title="Delete Food From Meal" onClick={(e) => {
                            e.stopPropagation(); 
                            handleDeleteFood(food.mealFoodId);
                        }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                                <path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z"/>
                            </svg>
                        </button>
                        </li>)}
                        return <></>
                    })}
                    </ol>
                    <button id={`food-add-btn-${meal.mealType}`} className="food-add-btn" title="Add Food" disabled={editingMeal?.foods.some(f => f.foodId === -1)} onClick={(e) => {
                        e.stopPropagation(); 
                        handleAddFood();
                    }}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                    </> : <ol className="meal-foods" id={`meal-foods-${meal.mealType}`}>
                        {meal.foods.map(food => 
                        (<li className="meal-food" id= {`${meal.mealType}-${food.foodName}`} key={`${meal.mealType}-${food.foodName}`}>
                        <span>{food.foodName}</span>
                        </li>))}
                    </ol>}
                </div>)
            })}*/}
        </div> 
        
        <MealTypeList AddMeal={(mealType) => AddMeal(mealType)} /> 
        {visibleBackButton && <button id="food-back" onClick={() => navigate(`/`)}>Back</button>}
      </div>);
};

export default AddMealForm;

const MEAL_COLORS = {
    breakfast: '#FACC15', // yellow
    lunch: '#4ADE80',     // green
    dinner: '#60A5FA',    // blue
    snack: '#FB7185',     // pink/red
    drink: '#A78BFA'      // purple
};