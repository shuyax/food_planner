function DisplayMeal( {meal, color, setEditingMeal, editMode} ) {
    return(<>
    {editMode ? <div id={`meal-section-${meal.mealType}`} 
        key={`meal-section-${meal.mealType}`} className="meal-section" 
        style={{backgroundColor: color, borderColor: color}}
        onClick={() => setEditingMeal(meal)}>
        <strong>{meal.mealType.toUpperCase()}</strong>
        <ol className="meal-foods" id={`meal-foods-${meal.mealType}`}>
            {meal.foods.map(food => 
            (<li className="meal-food" id= {`${meal.mealType}-${food.foodName}`} key={`${meal.mealType}-${food.foodName}`}>
            <span>{food.foodName}</span>
            </li>))}
        </ol>
    </div> :<div id={`meal-section-${meal.mealType}`} 
        key={`meal-section-${meal.mealType}`} className="meal-section" 
        style={{backgroundColor: color, borderColor: color}}>
        <strong>{meal.mealType.toUpperCase()}</strong>
        <ol className="meal-foods" id={`meal-foods-${meal.mealType}`}>
            {meal.foods.map(food => 
            (<li className="meal-food" id= {`${meal.mealType}-${food.foodName}`} key={`${meal.mealType}-${food.foodName}`}>
            <span>{food.foodName}</span>
            </li>))}
        </ol>
    </div>}
    </>
    )
};
export default DisplayMeal;