import { useState } from "react";
import { createMeal, fetchMealTypes } from "../services/MealService";
import { useMutation, useQuery } from "@tanstack/react-query";

export function MealTypeList( {mealDate, setCalendarRefresh} ) {

    const defaultMeal = {
        mealId: -1,
        mealType: '',
        mealDate: mealDate,
    }
    const [meal, setMeal] = useState(defaultMeal);

    const { data: mealTypesData,
        isLoading: mealTypesIsLoading,
        error: mealTypesError } = useQuery({
        queryKey: ["mealTypes"],
        queryFn: fetchMealTypes
    });

    const createMealMutation = useMutation({
        mutationFn: ({ mealType, mealDate}) =>
            createMeal(mealType, mealDate),
        onSuccess: (data) => {
            console.log("Meal created:" , data);
            setMeal(prev => ({
                ...prev,
                mealId: data,
            }));
        },
        onError: (error) => {
            console.error("Failed to create meal:", error);
            alert("Failed to save meal.");
        }
    })

    async function handleAddMeal() {
        if (!meal.mealType || !meal.mealDate) {
            alert('Must select a valid meal type')
            return;
        }
        try {
            await createMealMutation.mutateAsync({
                mealType: meal.mealType,
                mealDate: meal.mealDate,
            });
            console.log("Meal creation triggered!");
            setCalendarRefresh((prev) => prev + 1);
            setMeal({...defaultMeal});
        } catch (err) {
            console.error("Failed to create meal:", err);
        }
    }

    
    function handleMealChange (e) {
        setMeal({
            ...meal,
            mealType: e.target.value
        });
    }

    if ( mealTypesIsLoading) return <p>Meal Types Loading ...</p>;
    if ( mealTypesError) return <p>Meal Types Error: {mealTypesError.message}</p>;

    return (<div className="meal-type-list">
        <label htmlFor={`meal-type`}>Meal Type: </label>
        <select name="meal-type" 
            id={`meal-type`}
            value={meal.mealType} 
            onChange={(e) => handleMealChange(e)}
        >
            <option value="">-- Select a meal type --</option>
            {mealTypesData.map((mealType, index) => (
                <option key={index} value={mealType}>{mealType}</option>   
            ))}
        </select>
        <button id="add-meal" type="button" onClick={handleAddMeal}>Add Meal</button>
    </div>)
};
