import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { addFoodIngredients, deleteFoodIngredients, fetchFood, fetchRelatedIngredients, updateFood, updateFoodIngredients } from "../services/FoodService";
import { fetchIngredients } from "../services/IngredientService"
import { useEffect, useMemo, useState } from "react";
import IngredientRow from "../components/IngredientRow";
import { IngredientModal } from "../components/IngredientModal";
import "./FoodPage.css"

function FoodPage({ visibleBackButton = true, preMode = 'browse' }) {
    const [searchParams] = useSearchParams();
    const lastPage = searchParams.get("lastpage")
    const queryClient = useQueryClient();
    
    const { foodId } = useParams();
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const [mode, setMode] = useState(preMode) // edit mode or browse mode
    const [errorNote, setErrorNote] = useState("")
    const [ingredientsAdded, setIngredientsAdded] = useState([])
    const [ingredientsDeleted, setIngredientsDeleted] = useState([])
    const [food, setFood] = useState({
        foodId: -1,
        foodName: "",
        foodDescription: ""
    });
    const [foodIngredients, setFoodIngredients] = useState([])

    const { data: foodData, isLoading: isFoodDataLoading, error: FoodDataError } = useQuery({
        queryKey: ["food", foodId], // unique key per foodId
        queryFn: () => fetchFood(foodId),
        enabled: !!foodId, // only fetch if foodId exists
    });
    const { data: relatedIngredients= [], isLoading: isRelatedIngredientsLoading, error:relatedIngredientsError } = useQuery({
        queryKey: ["food-ingredients", foodId], // unique key per foodId
        queryFn: () => fetchRelatedIngredients(foodId),
        enabled: !!foodId, // only fetch if foodId exists
    });
    // load all existing ingredients
    const { data: ingredientsData, isLoading: areIngredientsLoading, error: ingredientsError } = useQuery({
        queryKey: ["ingredients"],
        queryFn: fetchIngredients
    });
    const availableIngredients = useMemo(() => {
        if (!ingredientsData) return [];

        const existingIngredientIds = new Set(
            (foodIngredients || [])
                .filter(i => i.ingredientId !== -1) // ignore placeholders
                .map(i => i.ingredientId)
        );
        const addedIds = new Set(
            ingredientsAdded
                .filter(i => i.ingredientId !== -1)
                .map(i => i.ingredientId)
        );
        const deletedIds = new Set(
            ingredientsDeleted
                .filter(i => i.ingredientId !== -1)
                .map(i => i.ingredientId)
        );
        const availableIngredients = ingredientsData.filter(i => {
            const id = i.id;
            // If deleted → explicitly available
            if (deletedIds.has(id)) return true;
            // If in food or newly added → not available
            if (existingIngredientIds.has(id)) return false;
            if (addedIds.has(id)) return false;
            return true;
        });
        return availableIngredients.map(ingredient => ({
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            ingredientUnitId: ingredient.canonical_unit_id,
            ingredientUnitName: ingredient.canonical_unit,
            ingredientUnitAbbreviation: ingredient.canonical_unit_abbreviation,
            note: ingredient.note || "",
            quantity: ingredient.quantity || 0
        }))
    }, [ingredientsData, foodIngredients, ingredientsAdded, ingredientsDeleted]);
    console.log(availableIngredients)

    const updateFoodMutation = useMutation({
        mutationFn: (updatedFood) =>
            updateFood(updatedFood),
        onSuccess: (data) => {
            console.log('Food is updated successfully', data)
            queryClient.invalidateQueries(["food"]);
        },
        onError: (error) => {
            console.error("Failed to update food:", error);
            setErrorNote(error)
            alert("Failed to update food.");
        }
    });

    const AddFoodIngredientsMutation = useMutation({
        mutationFn: (foodIngredients) =>
            addFoodIngredients(foodId, foodIngredients),
        onSuccess: (data) => {
            console.log(data)
            queryClient.invalidateQueries(["food-ingredients"]);
            setIngredientsAdded([])
        },
        onError: (error) => {
            console.error("Failed to add foodIngredients:", error);
            setErrorNote(error)
            alert("Failed to add foodIngredients");
        }
    });

    const updateFoodIngredientsMutation = useMutation({
        mutationFn: ({foodId, updatedFoodIngredients}) =>
            updateFoodIngredients(foodId, updatedFoodIngredients),
        onSuccess: (data) => {
            console.log(data)
            queryClient.invalidateQueries(["food-ingredients"]);
        },
        onError: (error) => {
            console.error("Failed to update foodIngredients:", error);
            setErrorNote(error)
            alert("Failed to update food ingredients.");
        }
    });

    const deleteFoodIngredientsMutation = useMutation({
        mutationFn: (foodIngredientIds) =>
            deleteFoodIngredients(foodIngredientIds),
        onSuccess: () => {
            queryClient.invalidateQueries(["food-ingredients"]);
            setIngredientsDeleted([])
        },
        onError: (error) => {
            console.error("Delete failed:", error);
            alert("Failed to delete ingredients");
        }
    });

    useEffect(() => {
        if (foodData && relatedIngredients) {
            setFood({
                foodId: foodData.id,
                foodName: foodData.name,
                foodDescription: foodData.description,
            });
        }
        if (relatedIngredients) setFoodIngredients(relatedIngredients)
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
        const generateUUID = () => {
            if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
                return crypto.randomUUID();
            }
            return Math.random().toString(36).substring(2) + Date.now().toString(36);
        };
        const defaultIngredient = {
            tempId: generateUUID(),
            ingredientId: -1,
            ingredientName: "",
            ingredientUnitId: -1,
            ingredientUnitName: "",
            ingredientUnitAbbreviation: "",
            foodIngredientId: -1,
            quantity: 0,
            note: ""
        }
        setIngredientsAdded(prev  => [
            ...prev,
            { ...defaultIngredient }
        ])
    };

    function updateIngredientRow(foodIngredientId, updatedIngredientRow) {
        // update existing food ingredient with foodIngredientId
        if (!updatedIngredientRow.tempId) {
            setFoodIngredients(prev =>
                prev.map(row => row.foodIngredientId === foodIngredientId ? updatedIngredientRow : row)
            );
        } else {
            // update new food ingredient not exist in database
            setIngredientsAdded(prev =>
                prev.map(row =>row.tempId === updatedIngredientRow.tempId ? updatedIngredientRow : row)
            );
        } 
    };
    
    function removeIngredientRow(foodIngredientId, tempId) {
        // delete existing food ingredient with foodIngredientId
        if (!tempId) {
            setFoodIngredients(prev =>
                prev.filter(row =>
                    row.foodIngredientId !== foodIngredientId
                )
            );
            setIngredientsDeleted(prevItems => [...prevItems, foodIngredientId]);
        } else {
            // delete new food ingredient not exist in database
            setIngredientsAdded(prev =>
                prev.filter(row =>
                    row.tempId !== tempId
                )
            )
        }
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
            if (ingredientsDeleted.length !== 0) await deleteFoodIngredientsMutation.mutateAsync(ingredientsDeleted);
            const filteredIngredientsAdded = ingredientsAdded.filter(i => i.ingredientName !== "")
            if (filteredIngredientsAdded.length !== 0) await AddFoodIngredientsMutation.mutateAsync(filteredIngredientsAdded)
            if (foodIngredients.length !== 0) await updateFoodIngredientsMutation.mutateAsync({foodId: food.foodId, updatedFoodIngredients: foodIngredients});
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
                {foodIngredients.map(row => (<IngredientRow key={`${row.foodIngredientId}-${row.ingredientId}`} row={row} existingIngredients={availableIngredients} updateRow={((updatedIngredientRow) => updateIngredientRow(row.foodIngredientId, updatedIngredientRow))} removeRow={() => removeIngredientRow(row.foodIngredientId, row.tempId)} />))}
                {ingredientsAdded.map(row => (<IngredientRow key={row.tempId} row={row} existingIngredients={availableIngredients} updateRow={((updatedIngredientRow) => updateIngredientRow(row.foodIngredientId, updatedIngredientRow))} removeRow={() => removeIngredientRow(row.foodIngredientId, row.tempId)} />))}
            </ol>
            <div id="ingredient-group">
            <button id="add-ingredient" className="add-btn" type="button" title="Add Ingredient" aria-label="Add Ingredient" onClick={(e) => {e.stopPropagation();
                addIngredient()}}><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg><span className="btn-text">Add Ingredient</span></button>
            <button id="create-ingredient" type="button" className="create-btn" title="Create A New Ingredient" aria-label="Create A New Ingredient" onClick={(e) => {e.stopPropagation();
                setModalOpen(true)}}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="12" x2="12" y2="18"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg><span className="btn-text">Create New Ingredient</span></button>
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
            {foodIngredients.map(row => (
                <li key={row.foodIngredientId}><strong>{row.ingredientName.toUpperCase()}: </strong>{row.quantity} {row.ingredientUnitName}{row.ingredientUnitAbbreviation !== row.ingredientUnitName && <> ({row.ingredientUnitAbbreviation})</>} {row.note && <i>(Note: {row.note})</i>}</li>
            ))}
        </ol>
        <h3 id="instruction-title">Instructions</h3>
        <p id="food-description">{food.foodDescription}</p>
        <button id="edit-food" className="edit-btn" title="Edit Food" aria-label="Edit Food" onClick={(e) => {
            e.stopPropagation();
            handleEdit();
            }}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.41 6.34a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L15.13 4.34l3.75 3.75 2.53-2.53z"/></svg></button>
        </div>
        {errorNote !== "" && <p id="error-note">{errorNote}</p>}
        {visibleBackButton && <button className="back-btn" id="food-back" title="Back to Last Page" aria-label="Back to Last Page" onClick={(e) => {
            e.stopPropagation(); 
            navigate(`/${lastPage}`)}}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="12" r="10"></circle> <path d="M15 12H9"></path><polyline points="12 15 9 12 12 9"></polyline></svg></button>}
        </>}
    </>)
}

export default FoodPage;