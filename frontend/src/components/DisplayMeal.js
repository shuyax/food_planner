function DisplayMeal( {meal, color, setEditingMeal} ) {
    return(<div id={`meal-section-${meal.mealType}`} 
        key={`meal-section-${meal.mealType}`} className="meal-section" 
        style={{backgroundColor: color, borderColor: color}}
        onClick={() => setEditingMeal(meal)}>
        {/* <button onClick={() => setEditingMeal(meal)} id={`meal-edit-btn-${meal.mealType}`} className="meal-edit-btn" title="Edit Meal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.41 6.34a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L15.13 4.34l3.75 3.75 2.53-2.53z"/>
            </svg>
        </button> */}
        <strong>{meal.mealType.toUpperCase()}</strong>
        <ol className="meal-foods" id={`meal-foods-${meal.mealType}`}>
            {meal.foods.map(food => 
            (<li className="meal-food" id= {`${meal.mealType}-${food.foodName}`} key={`${meal.mealType}-${food.foodName}`}>
            <span>{food.foodName}</span>
            </li>))}
        </ol>
    </div>)
};
export default DisplayMeal;