export function MealTypeList( {mealIndex, mealTypes, meal, updateMeal} ) {

    function handleMealChange(e) {
        updateMeal ({
            ...meal,
            mealType: e.target.value
        });
    }

    return (<div className="meal-type-list">
        <label htmlFor={`meal-type-${mealIndex}`}>Meal Type: </label>
        <select name="meal-type" 
            id={`meal-type-${mealIndex}`}
            value={meal.mealType} 
            onChange={handleMealChange}
        >
            <option value="">-- Select a meal type --</option>
            {mealTypes.map((mealType, index) => (
                <option key={index} value={mealType}>{mealType}</option>   
            ))}
        </select>
    </div>)
};

