import { useMemo, useState } from "react";
import { FoodRow } from "./FoodRow";
import { useQuery } from "@tanstack/react-query";
import { fetchRelatedFoods } from "../services/MealService";

function EditMeal( {color, mealId, removeMeal, mealType, foodData}) {

    const [foodsToBeCreated, setFoodsToBeCreated] = useState([])
    const { data: mealFoodsData = [], isLoading, error} = useQuery({
        queryKey: ['meal-foods', mealId],
        queryFn: () => fetchRelatedFoods(mealId),
        enabled: !!mealId,
    });
    const mealFoods = useMemo(() => {
        return [...mealFoodsData, ...foodsToBeCreated];
    }, [mealFoodsData, foodsToBeCreated]);

    const availableFoods = useMemo(() => {
        if (!foodData) return [];
        if (!mealFoods) return foodData;

        const existingFoodIds = new Set(
            mealFoods
                .filter(f => f.foodId !== -1) // ignore placeholders
                .map(f => f.foodId)
        );
        return foodData.filter(food => 
            !existingFoodIds.has(food.foodId)
        );
    }, [foodData, mealFoods]);

    if ( isLoading ) return <p>Foods Loading ...</p>;
    if ( error) return <p>Foods Error: {error.message}</p>;
    
    function handleAddFood() {
        const generateUUID = () => {
            if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
                return crypto.randomUUID();
            }
            return Math.random().toString(36).substring(2) + Date.now().toString(36);
        };
        const defaultFood = {
            tempId: generateUUID(),
            foodId: -1,
            foodName: "",
            foodDescription: "",
            mealFoodId: -1,
            foodCost: null
        };
        setFoodsToBeCreated(prev => [...prev, defaultFood]);
    }

    return(<div id={`meal-section-${mealType}`} 
        key={`meal-section-${mealType}`} className="meal-section" 
        style={{backgroundColor: color, borderColor: color}}>
        <button id={`meal-delete-btn-${mealType}`} className="meal-delete-btn" title="Delete Meal" onClick={(e) => {
            e.stopPropagation(); 
            removeMeal(mealId)}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button> 
        <strong>{mealType.toUpperCase()}</strong>
        <ol className="meal-foods-edit"><>
            {mealFoods.map((food, index) => (
                <li className="meal-food-edit" id={`${mealType}-${food.mealFoodId}`} key={`${food.mealFoodId}`}>
                <span>{index+1}. </span>
                <FoodRow key={food.tempId ? food.tempId : `${food.mealFoodId}-${food.foodId}`} existingFoods={availableFoods} mealFoodId={food.mealFoodId} food={food} mealType={mealType} mealId={mealId} setFoodsToBeCreated={setFoodsToBeCreated} />
                </li> 
            ))}
        </></ol>
        <button id={`food-add-btn-${mealType}`} className="food-add-btn" title="Add Food" disabled={foodsToBeCreated.length > 0} onClick={(e) => {
            e.stopPropagation(); 
            handleAddFood();
        }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        </button>
    </div>)
};

export default EditMeal;