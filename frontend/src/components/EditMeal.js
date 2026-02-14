import { useMemo } from "react";
import { FoodRow } from "./FoodRow";

function EditMeal( {color, editingMeal, setEditingMeal, handleMealChange, removeMeal, foodData}) {
    const availableFoods = useMemo(() => {
        if (!foodData) return [];
        if (!editingMeal) return foodData;

        const existingFoodIds = new Set(
            editingMeal.foods
                .filter(f => f.foodId !== -1) // ignore placeholders
                .map(f => f.foodId)
        );
        return foodData.filter(food => 
            !existingFoodIds.has(food.foodId)
        );
    }, [foodData, editingMeal]);
    function handleAddFood() {
        const defaultFood = {
            "foodId": -1,
            "foodName": "",
            "foodDescription": "",
            "mealFoodId": -1,
            "foodCost": null
        };
        setEditingMeal(prevMeal => ({
            ...prevMeal,
            foods: [...prevMeal.foods, defaultFood]
        })); 
    }

    function handleDeleteFood(mealFoodId) {
        const deletedFood = {
            "foodId": -1,
            "foodName": "",
            "description": "",
            "mealFoodId": mealFoodId
        };
        setEditingMeal(prevMeal => ({
            ...prevMeal,
            foods: [...prevMeal.foods.map(food => food.mealFoodId === mealFoodId ? {...deletedFood} : food)]
        })); 
    }

    return(<div id={`meal-section-${editingMeal.mealType}`} 
        key={`meal-section-${editingMeal.mealType}`} className="meal-section" 
        style={{backgroundColor: color, borderColor: color}}>
        <button id={`meal-delete-btn-${editingMeal.mealType}`} className="meal-delete-btn" title="Delete Meal" onClick={(e) => {
            e.stopPropagation(); 
            removeMeal(editingMeal.mealId)}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button> 
        <strong>{editingMeal.mealType.toUpperCase()}</strong>
        <ol className="meal-foods-edit">{editingMeal.foods.map((food, index) => (
            !(food.foodId === -1 && food.mealFoodId !== -1) ? <li className="meal-food-edit" id={`${editingMeal.mealType}-${food.mealFoodId}`} key={`${food.mealFoodId}`}>
            <span>{index+1}. </span>
            <FoodRow key={`${food.foodId}`} existingFoods={availableFoods} food={food} mealType={editingMeal.mealType} 
            updateFood={(updatedFood) => handleMealChange(food.mealFoodId, updatedFood)}  
            />
            <button id={`food-delete-btn-${editingMeal.mealType}-${food.mealFoodId}`} className="food-delete-btn" title="Delete Food From Meal" onClick={(e) => {
                e.stopPropagation(); 
                handleDeleteFood(food.mealFoodId);
            }}><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z"/></svg>
            </button>
            </li> : <></>))}
        </ol>
        <button id={`food-add-btn-${editingMeal.mealType}`} className="food-add-btn" title="Add Food" disabled={editingMeal?.foods.some(f => f.foodId === -1)} onClick={(e) => {
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