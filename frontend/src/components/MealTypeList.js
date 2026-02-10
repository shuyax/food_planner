import { useState } from "react";
import { fetchMealTypes } from "../services/MealService";
import { useQuery } from "@tanstack/react-query";

export function MealTypeList( {AddMeal} ) {

    const [mealType, setMealType] = useState('');

    const { data: mealTypesData,
        isLoading: mealTypesIsLoading,
        error: mealTypesError } = useQuery({
        queryKey: ["mealTypes"],
        queryFn: fetchMealTypes
    });
    
    function handleMealChange (e) {
        setMealType(e.target.value);
    }

    async function handleAddMeal() {
        try {
            await AddMeal(mealType);   
            setMealType('');           // only clear on success
        } catch (err) {
            console.error("Add meal failed:", err);
        }
    };

    if ( mealTypesIsLoading) return <p>Meal Types Loading ...</p>;
    if ( mealTypesError) return <p>Meal Types Error: {mealTypesError.message}</p>;

    return (<div className={`meal-type-list-${mealType}`}>
        <label htmlFor={`meal-type`}>Meal Type: </label>
        <select name="meal-type" 
            id={`meal-type`}
            value={mealType} 
            onChange={(e) => handleMealChange(e)}
        >
            <option value="">-- Select a meal type --</option>
            {mealTypesData.map((mealType, index) => (
                <option key={index} value={mealType}>{mealType}</option>   
            ))}
        </select>
        <button id="add-meal" type="button" onClick={handleAddMeal} disabled={mealType === ''}>Add Meal</button>
    </div>)
};
