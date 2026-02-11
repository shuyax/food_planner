import { useMutation, useQuery } from "@tanstack/react-query";
import { MealTypeList } from "../components/MealTypeList";
import { fetchFoods } from "../services/FoodService";
import { createMeal, deleteMeal, updateFoodsToMeal } from "../services/MealService";
import { useNavigate, useSearchParams } from "react-router-dom";
import MealModal from "../components/MealModal";
import { useState } from "react";
import Calendar from "../components/Calendar";
import { useQueryClient } from '@tanstack/react-query';

function AddMealForm({ visibleBackButton = true }) {

    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    
    const [searchParams] = useSearchParams();
    const mealDate = searchParams.get("date");

    // fetch all existing foods
    const { data: foodData,
        isLoading: foodIsLoading,
        error: foodError } = useQuery({
        queryKey: ["foods"],
        queryFn: fetchFoods
    });

    const queryClient = useQueryClient();
    const createMealMutation = useMutation({
        mutationFn: ({ mealType, mealDate}) =>
            createMeal(mealType, mealDate),
        onSuccess: (data, variables) => {
            const { mealType, mealDate } = variables;
            console.log("Meal created:" , data, "for", mealType, "on", mealDate);
            queryClient.invalidateQueries({
                queryKey: ['meals'],
            });
        },
        onError: (error) => {
            console.error("Failed to create meal:", error);
            alert("Failed to save meal.");
        }
    });

    const updateFoodsToMealMutation = useMutation({
        mutationFn: ({ mealId, foods}) =>
            updateFoodsToMeal(mealId, foods),
        onSuccess: (data) => {
            console.log("Foods updated to a meal" , data);
            queryClient.invalidateQueries({ queryKey: ['meals'] });
        },
        onError: (error) => {
            console.error("Failed to update foods to a meal:", error);
            alert("Failed to update foods to a meal.");
        }
    })

    const deleteMealMutation = useMutation({
        mutationFn: (mealId) => deleteMeal(mealId), // your backend API call
        onSuccess: (_, mealId) => {
            console.log("Meal deleted:", mealId);
            queryClient.invalidateQueries({ queryKey: ['meals'] });
        },
        onError: (err) => {
            console.error("Failed to delete meal:", err);
            alert("Failed to delete meal.");
        }
    });


    if (!mealDate) return <p>WARNING: You cannot add a meal without a date.</p>;

    if ( foodIsLoading) return <p>Foods Loading ...</p>;
    if ( foodError) return <p>Foods Error: {foodError.message}</p>;

    async function AddMeal(mealType) {
        if (!mealType || !mealDate) {
            alert('Must select a valid meal type')
            return;
        }
        try {
            await createMealMutation.mutateAsync({
                mealType: mealType,
                mealDate: mealDate,
            });
            console.log("Meal creation triggered!");
        } catch (err) {
            console.error("Failed to create meal:", err);
        }
    }


    async function updateMeal(mealId, updatedMeal) {
        try {
            await updateFoodsToMealMutation.mutateAsync({
                mealId: mealId,
                foods: updatedMeal.foods,
            });
            console.log("Meal-food update triggered!");
        } catch (err) {
            console.error("Failed to update foods to a meal:", err);
        }
    };

    async function removeMeal(mealId) {
        try {
            // Wait for backend to delete the meal first
            await deleteMealMutation.mutateAsync(mealId);
        } catch (err) {
            console.error("Failed to delete meal:", err);
            alert("Failed to delete meal.");
        }
    };

    return (<div className={modalOpen ? "meal-form-edit" : "meal-form"}>
        <MealModal
            open={modalOpen && editingMeal != null}
            onClose={() => setModalOpen(false)}
            existingFoods={foodData} 
            meal={editingMeal} 
            updateMeal={(updatedMeal) => updateMeal(editingMeal.mealId, updatedMeal)} 
            removeMeal={() => removeMeal(editingMeal.mealId)}
        />
        <Calendar 
            setEditingMeal={setEditingMeal} 
            setModalOpen={setModalOpen} 
            editDate={mealDate}
        />
        <MealTypeList AddMeal={(mealType) => AddMeal(mealType)} /> 
        {visibleBackButton && <button id="food-back" onClick={() => navigate(`/`)}>Back</button>}
      </div>);
};

export default AddMealForm;