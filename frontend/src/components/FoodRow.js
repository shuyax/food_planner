export function FoodRow( { existingFoods, food, updateFood, mealDate, mealType, removeFood } ) {

    function handleFoodChange(e) {
        const selected = existingFoods.find(
            i => i.name === e.target.value
        );
        if (!selected) return;
        const updatedFood = {
            ...food,
            foodId: selected.id,
            foodName: selected.name,
            description: selected.description
        }
        updateFood(updatedFood)
    };

    return (<>
        <li key={`${mealDate}-${mealType}-${food.foodId}`}>
            <label htmlFor={`${mealDate}-${mealType}-${food.foodId}`}></label>
            <select name={`${mealDate}-${mealType}-${food.foodId}`} 
                id={`${mealDate}-${mealType}-${food.foodId}`} 
                value={food.foodName ?? ""} 
                onChange={(e) => handleFoodChange(e)}
            >
                <option value="">-- Select a food --</option>
                {existingFoods.map((food, i) => (
                    <option key={`${mealDate}-${mealType}-${food.foodId}-${i}`} value={food.name}>{food.name}</option>   
                ))}
            </select>
            <button id={`remove-${mealDate}-${mealType}-${food.foodId}`} className="remove-food-btn" type="button" onClick={removeFood}>✕</button>
        </li>
    </>)
};

