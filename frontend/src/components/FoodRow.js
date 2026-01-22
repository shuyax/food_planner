import { useState } from "react";

export function FoodRow( { existingFoods, mealIndex, meal, updateMeal } ) {

    function handleMealChange(e, index) {
        const food = existingFoods.find(
            i => i.name === e.target.value
        );
        if (!food) return;
        const updatedFood = {
            foodId: food.id,
            foodName: food.name,
            foodDescription: food.description
        }
        updateMeal ({
            ...meal,
            foods: meal.foods.map((f, i) => i === index ? updatedFood : f)
        })
    };

    function handleAddFood() {
        updateMeal ({
            ...meal,
            foods: [...meal.foods, { foodId: -1, foodName: "", foodDescription: "" }]
        })
    };

    function removeFood(index) {
        updateMeal ({
            ...meal,
            foods: meal.foods.filter((_, i) => i !== index)
        })
    };



    return (<ol className="food-list">
        {meal.foods.map((food, index) => (<li key={index}>
            <label htmlFor={`food-${mealIndex}-${index}`}>Food: </label>
            <select name={`food-${mealIndex}-${index}`} 
                id={`food-${mealIndex}-${index}`} 
                value={food.foodName ?? ""} 
                onChange={(e) => handleMealChange(e, index)}
            >
                <option value="">-- Select a food --</option>
                {existingFoods.map((food, i) => (
                    <option key={`food-${mealIndex}-${index}-${i}`} value={food.name}>{food.name}</option>   
                ))}
            </select>
            <button id={`food-remove-${mealIndex}-${index}`} className="remove-food-btn" type="button" onClick={() => removeFood(index)}>✕</button>
        </li>))}
        
        {meal.mealType !== '' && <button id="add-food" type="button" onClick={handleAddFood} >Add Food</button>}
    </ol>)
};

