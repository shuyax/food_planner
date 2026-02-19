import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchFood, fetchRelatedIngredients, updateFood, updateFoodIngredients } from "../services/FoodService";
import { fetchIngredients } from "../services/IngredientService"
import { useEffect, useState } from "react";
import IngredientRow from "../components/IngredientRow";
import { IngredientModal } from "../components/IngredientModal";
import "./FoodPage.css"

function FoodPage({ visibleBackButton = true, preMode = 'browse' }) {
    const [searchParams] = useSearchParams();
    const lastPage = searchParams.get("lastpage")

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
            updateFoodIngredients(updatedFood.foodId, updatedFood.ingredients),
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
            console.log(food)
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
    {mode === "edit" ? <>
        <div id="food-form-edit">
            <label htmlFor="edit-food-name" className="edit-food-line"> 
                <h3>Food Name: </h3>
                <input id="edit-food-name"
                className="food-input" 
                name="edit-food-name" 
                value={food.foodName} 
                onChange={(e) => handleFoodNameChange(e)}
                required/>
            </label>
            <h3 id="ingredient-title">Ingredients</h3>
            <ol id="ingredients-edit">
                {food.ingredients.map((row, index) => (<IngredientRow key={index} ingredientIndex={index} row={row} existingIngredients={ingredientsData} updateRow={((updatedIngredientRow) => updateIngredientRow(index, updatedIngredientRow))} removeRow={() => removeIngredientRow(index)} />))}
            </ol>
            <div id="ingredient-group">
            <button id="add-ingredient" className="add-btn" type="button" title="Add Ingredient" aria-label="Add Ingredient" onClick={(e) => {e.stopPropagation();
                addIngredient()}}><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg><span className="btn-text">Add Ingredient</span></button>
            <button id="create-ingredient" type="button" className="create-btn" title="Create A New Ingredient" aria-label="Create A New Ingredient" onClick={(e) => {e.stopPropagation();
                setModalOpen(true)}}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="12" x2="12" y2="18"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg><span class="btn-text">Create New Ingredient</span></button>
            </div>
            <label htmlFor="edit-food-description" className="edit-food-line" id="edit-food-description-section"> 
                <h3>Food Description: </h3>
                <textarea id="edit-food-description" 
                className="food-input"
                name="edit-food-description" 
                value={food.foodDescription} 
                autoCorrect="on"
                onChange={(e) => handleFoodDescriptionChange(e)}
                />
            </label>
        </div>
        <button className="save-btn" id="save-food" title="Save Edits" aria-label="Save Edits" onClick={(e) => {e.stopPropagation();
            handleSave()}}><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/><path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
    </> : <><div id="food-form">
        <h2 id="food-name">{food.foodName.toUpperCase()}</h2>
        <h3 id="ingredient-title">Ingredients</h3>
        <ol id="ingredients-browse">
            {food.ingredients.map(row => (
                <li key={row.foodIngredientId}><strong>{row.ingredientName.toUpperCase()}: </strong>{row.quantity} {row.ingredientUnitName}{row.ingredientUnitAbbreviation !== row.ingredientUnitName && <> ({row.ingredientUnitAbbreviation})</>} {row.note && <i>(Note: {row.note})</i>}</li>
            ))}
        </ol>
        <h3>Instructions</h3>
        <p id="food-description">{food.foodDescription}</p>
        <button id="edit-food" className="edit-btn" title="Edit Food" aria-label="Edit Food" onClick={(e) => {
            e.stopPropagation();
            handleEdit();
            }}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.41 6.34a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L15.13 4.34l3.75 3.75 2.53-2.53z"/></svg></button>
        </div>
        {errorNote !== "" && <p>{errorNote}</p>}
        {visibleBackButton && <button className="back-btn" id="food-back" title="Back to Last Page" aria-label="Back to Last Page" onClick={(e) => {
            e.stopPropagation(); 
            navigate(`/${lastPage}`)}}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="12" r="10"></circle> <path d="M15 12H9"></path><polyline points="12 15 9 12 12 9"></polyline></svg></button>}
        </>}
    </>)
}

export default FoodPage;