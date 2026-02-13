export function FoodRow( { existingFoods, food, updateFood, mealType } ) {
    const options = food.foodId && food.foodId !== -1 && !existingFoods.some(f => f.foodId === food.foodId)
        ? [food, ...existingFoods]   // prepend current food if missing
        : existingFoods;
    function handleFoodChange(e) {
        const selected = existingFoods.find(
            i => i.foodName === e.target.value
        );
        if (!selected) return;
        const updatedFood = {
            ...food,
            foodId: selected.foodId,
            foodName: selected.foodName,
            foodDescription: selected.foodDescription
        }
        updateFood(updatedFood)
    };
    return (<>
        <label htmlFor={`${mealType}-${food.foodName}`}></label>
        <select name={`${mealType}-${food.foodName}`} 
            className="food-list-select"
            id={`${mealType}-${food.foodName}`} 
            value={food.foodName ?? ""} 
            onChange={(e) => {
                e.stopPropagation()
                handleFoodChange(e)}}
        >
            <option value="">-- Select a food --</option>
            {options.map(food => (
                <option key={`${food.foodId}`} value={food.foodName}>{food.foodName}</option>   
            ))}
        </select>
    </>)
};

