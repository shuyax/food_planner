import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchFood, fetchRelatedIngredients, updateFood, updateFoodIngredients } from "../services/FoodService";
import { fetchIngredients } from "../services/IngredientService"
import { useEffect, useState } from "react";
import IngredientRow from "../components/IngredientRow";
import { IngredientModal } from "../components/IngredientModal";

function EditFoodForm({ visibleBackButton = true, preMode = 'browse' }) {
    const defaultIngredient = {
        ingredientId: -1,
        ingredientName: "",
        ingredientUnitId: -1,
        ingredientUnitName: "",
        ingredientUnitAbbreviation: "",
        foodIngredientId: -1,
        quantity: 0,
        note: ""
    }
    const { foodId } = useParams();
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const [mode, setMode] = useState(preMode) // edit mode or browse mode
    const [errorNote, setErrorNote] = useState("")

    const { data: foodData, isLoading: isFoodDataLoading, error: FoodDataError } = useQuery({
        queryKey: ["food", foodId], // unique key per foodId
        queryFn: () => fetchFood(foodId),
        enabled: !!foodId, // only fetch if foodId exists
    });
    const { data: relatedIngredients, isLoading: isRelatedIngredientsLoading, error:relatedIngredientsError } = useQuery({
        queryKey: ["food-ingredients", foodId], // unique key per foodId
        queryFn: () => fetchRelatedIngredients(foodId),
        enabled: !!foodId, // only fetch if foodId exists
    });
    // load all existing ingredients
    const { data: ingredientsData, isLoading: areIngredientsLoading, error: ingredientsError } = useQuery({
        queryKey: ["ingredients"],
        queryFn: fetchIngredients
    });
    const [food, setFood] = useState({
        foodId: -1,
        foodName: "",
        foodDescription: "",
        ingredients: []
    });

    const updateFoodMutation = useMutation({
        mutationFn: (updatedFood) =>
            updateFood(updatedFood),
        onSuccess: (data) => {
            console.log(data)
        },
        onError: (error) => {
            console.error("Failed to update food:", error);
            setErrorNote(error)
            alert("Failed to save food.");
        }
    });

    const updateFoodIngredientsMutation = useMutation({
        mutationFn: (updatedFood) =>
            updateFoodIngredients(updatedFood.ingredients),
        onSuccess: (data) => {
            console.log(data)
        },
        onError: (error) => {
            console.error("Failed to update foodIngredients:", error);
            setErrorNote(error)
            alert("Failed to save food.");
        }
    });

    useEffect(() => {
        if (foodData && relatedIngredients) {
            setFood({
                foodId: foodData.id,
                foodName: foodData.name,
                foodDescription: foodData.description,
                ingredients: relatedIngredients
            });
        }
    }, [foodData, relatedIngredients]);

    if (isFoodDataLoading || isRelatedIngredientsLoading || areIngredientsLoading) return <p>Loading food...</p>;
    if (FoodDataError) return <p>Error loading food: {FoodDataError.message}</p>;
    if (relatedIngredientsError) return <p>Error loading relatedIngredients: {relatedIngredientsError.message}</p>;
    if (ingredientsError) return <p>Error loading existing ingredients: {ingredientsError.message}</p>;
    if (!foodData) return <p>Food not found.</p>;
    if (!relatedIngredients) return <p>Related ingredients not found.</p>;

    function handleFoodNameChange(e) {
        setFood({
            ...food,
            foodName: e.target.value.toLowerCase().trimStart()
        })
    }

    function handleFoodDescriptionChange(e) {
        setFood({
            ...food,
            foodDescription: e.target.value.trimStart()
        })
    }
    function addIngredient() {
        setFood(prev => ({
            ...prev,
            ingredients: [
                ...prev.ingredients,
                { ...defaultIngredient }
            ]
        }));
    };

    function updateIngredientRow(index, updatedIngredientRow) {
        setFood(prev => ({
            ...prev,
            ingredients: prev.ingredients.map((row, i) =>
                i === index ? updatedIngredientRow : row
            )
        }));
    };
    
    function removeIngredientRow(index) {
        setFood(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) =>
                i !== index
            )
        }));
    };

    async function handleSave() {
        // updateIngredients
        if (!food.foodName || food.foodId === -1) {
            setErrorNote('Must enter a valid food name');
            return;
        }
        setErrorNote("")
        try {
            await updateFoodMutation.mutateAsync(food);
            await updateFoodIngredientsMutation.mutateAsync(food);
            setMode("browse")
            console.log("Food update triggered!");
        } catch (err) {
            console.error("Failed to update food:", err);
        }
    };

    function handleEdit() {
        setMode("edit")
    }

    return(<>
    <IngredientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)} 
    />
    {mode === "edit" ? <><div>
        <label htmlFor="edit-food-name"> 
            <span>Food Name: </span>
            <input id="edit-food-name" 
            name="edit-food-name" 
            value={food.foodName} 
            onChange={(e) => handleFoodNameChange(e)}
            required/>
        </label>
        <br />
        <label htmlFor="edit-food-description"> 
            <span>Food Description: </span>
            <textarea id="edit-food-description" 
            name="edit-food-description" 
            value={food.foodDescription} 
            autoCorrect="on"
            onChange={(e) => handleFoodDescriptionChange(e)}
            />
        </label>
        <h3 id="ingredient-title">Ingredients</h3>
        <ol id="ingredients-edit">
            {food.ingredients.map((row, index) => (<IngredientRow key={index} ingredientIndex={index} row={row} existingIngredients={ingredientsData} updateRow={((updatedIngredientRow) => updateIngredientRow(index, updatedIngredientRow))} removeRow={() => removeIngredientRow(index)} />))}
        </ol>
        <button id="add-ingredient" type="button" onClick={addIngredient}>Add An Ingredient</button>
        <button id="create-ingredient" type="button" onClick={() => setModalOpen(true)}>Create An Ingredient</button>
    </div>
    <button id="save-food" onClick={handleSave}>Save</button>
    </> : <>
        <h2 id="food-name">{food.foodName.toUpperCase()}</h2>
        <p id="food-description">{food.foodDescription}</p>
        <h3 id="ingredient-title">Ingredients</h3>
        <ol id="ingredients-browse">
            {food.ingredients.map(row => (
                <li key={row.foodIngredientId}><strong>{row.ingredientName.toUpperCase()}: </strong>{row.quantity} {row.ingredientUnitName}{row.ingredientUnitAbbreviation !== row.ingredientUnitName && <> ({row.ingredientUnitAbbreviation})</>}; <i>{row.note !== "" && <>Note: {row.note}</>}</i></li>
            ))}
        </ol>
        <button id="edit-food" onClick={handleEdit}>Edit</button>
    </>}
    {errorNote !== "" && <p>{errorNote}</p>}
    {visibleBackButton && <button id="food-back" onClick={() => navigate(`/`)}>Back</button>}
    </>)
}

export default EditFoodForm;