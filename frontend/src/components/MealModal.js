import "./Modal.css"
import { useEffect, useState } from "react";
import { FoodRow } from './FoodRow';

function MealModal({ open, onClose, meal, existingFoods, updateMeal, removeMeal }) {
    const [localMeal, setLocalMeal] = useState(meal)
    const defaultFood = {
        "foodId": -1,
        "foodName": "",
        "description": "",
        "mealFoodId": -1
    };

    useEffect(() => {
        if (meal) {
            setLocalMeal(meal);
        }
    }, [meal]);

    if (!open || !meal || !localMeal) return null;

    function handleMealChange(foodId, updatedFood) {
        const updatedMeal = {
            ...localMeal,
            foods: localMeal.foods.map(f =>
                f.foodId === foodId ? updatedFood : f
            )
        };
        setLocalMeal(updatedMeal)
    };

    async function handleDoneBtn() {
        if (!localMeal) {
            alert('Cannot save an undefined meal')
            return;
        }
        if (!localMeal.mealId || !localMeal.foods) {
            alert('MealId and non-empty foods are required.')
        }
        updateMeal(localMeal)
        onClose();

    }
    function handleAddFood() {
        setLocalMeal({
            ...localMeal,
            foods: [...localMeal.foods, {...defaultFood}]
        })
    };
        
    function removeFood(mealFoodId) {
        const deletedFood = {
            "foodId": -1,
            "foodName": "",
            "description": "",
            "mealFoodId": mealFoodId
        };
        setLocalMeal({
            ...localMeal,
            foods: localMeal.foods.map(food => food.mealFoodId === mealFoodId ? {...deletedFood} : food)
        })
    };

    function handleDeleteMeal() {
        removeMeal();
        onClose();
    }


    return (
        <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 id="modal-title">{localMeal.mealType.toUpperCase()}</h3>
            <button id="add-food" type="button" onClick={handleAddFood} >Add Food</button>
            <button id="remove-meal" type="button" onClick={handleDeleteMeal}>Delete Meal</button>
            <ol id="active-meal-foods">
                {localMeal.foods?.length !== 0 ? localMeal.foods?.map(food => {
                    if (!(food.foodId === -1 && food.mealFoodId !== -1)) {
                        return <FoodRow 
                        key={food.foodId} 
                        existingFoods={existingFoods} 
                        food={food} 
                        updateFood={(updatedFood) => handleMealChange(food.foodId, updatedFood)} mealDate={localMeal.date} mealType={localMeal.mealType}
                        removeFood={() => removeFood(food.mealFoodId)} 
                        /> 
                    }
                }) : <>No food exists in this meal.<br />You can: 
                        <br />Click the <strong>Add Food</strong> button to add food
                        <br />Click the <strong>Delete Meal</strong> button to delete this meal.
                    </>
                }
            </ol> 
            {localMeal.foods?.length !== 0 && <button type="submit" id="foods-save" onClick={handleDoneBtn}>Done</button>}
        </div>
        </div>
    );
}

export default MealModal;