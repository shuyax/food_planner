import { useState } from "react";
import IngredientRow from "../components/IngredientRow";
import { fetchIngredients } from "../services/IngredientService"
import { useQuery, useMutation  } from "@tanstack/react-query";
import { createFood, addIngredientsToFood } from "../services/FoodService";
import { useNavigate } from "react-router-dom";
import "./AddFoodForm.css"
import { IngredientModal } from "../components/IngredientModal";

function AddFoodForm( {} ) {
   const defaultFood = {
        foodId: -1,
        foodName: "",
        foodDescription: ""
   }

    const defaultIngredient = {
        ingredientId: -1,
        ingredientName: "",
        ingredientUnitId: -1,
        ingredientUnitName: "",
        ingredientUnitAbbreviation: "",
        quantity: 0,
        note: ""
    };
    const [ingredients, setIngredients] = useState([defaultIngredient]);
    const [food, setFood] = useState(defaultFood);
    const [foodCreated, setFoodCreated] = useState(false)
    const [enableIngredient, setEnableIngredient] = useState(false)
    const [errorNote, setErrorNote] = useState("")
    const [ingredientsAdded, setIngredientsAdded] = useState(false)
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();

    // load all existing ingredients
    const { data, isLoading, error } = useQuery({
        queryKey: ["ingredients"],
        queryFn: fetchIngredients
    });

    const createFoodMutation = useMutation({
        mutationFn: ({ foodName, foodDescription }) =>
            createFood(foodName, foodDescription),
        onSuccess: (data, variables) => {
            const { foodName, foodDescription } = variables;
            setFood({
                foodId: data,
                foodName, 
                foodDescription
            });
            setFoodCreated(true);
        },
        onError: (error) => {
            console.error("Failed to create food:", error);
            if (error.response.data.error === `duplicate key value violates unique constraint "foods_name_key"`) {
                setErrorNote("The food name you entered already exists.")
            } else {
                alert("Failed to save food.");
            }
        }
    });

    const addIngredientsToFoodMutation = useMutation({
        mutationFn: ({ foodId, ingredients}) =>
            addIngredientsToFood( foodId, ingredients),
        onSuccess: (data) => {
            console.log("Ingredients added to a food" , data);
            setIngredients(data.ingredients)
            setIngredientsAdded(true)
            setEnableIngredient(false);
        },
        onError: (error) => {
            console.error("Failed to add ingredients to a food:", error);
            alert("Failed to add ingredients to a food.");
        }
    })


    if (isLoading) return <p>Loading ingredients...</p>;
    if (error) return <p>Error loading ingredients: {error.message}</p>;


    function addIngredient() {
        setIngredients(prev => [...prev, { ...defaultIngredient}]);
    };

    function updateIngredientRow(index, updatedIngredientRow) {
        setIngredients(prev => prev.map((row, i) => i === index ? updatedIngredientRow : row))
    };
    
    function removeIngredientRow(index) {
        setIngredients(prev => prev.filter((_, i) => i !== index));
    };

    function handleInput(e) {
        setFood({
            ...food,
            foodName: e.target.value.toLowerCase().trimStart()
        })
    };

    function handleTextarea(e) {
        setFood({
            ...food,
            foodDescription: e.target.value.trimStart()
        })
    }

    function filterOutEmptyIngredients(ingredients) {
        return ingredients.filter(ingredient => ingredient.ingredientId !== -1)
    }

    async function handleCreateFood() {
        if (!food.foodName) {
            setErrorNote('Must enter a valid food name');
            return;
        }
        setErrorNote("")
        try {
            await createFoodMutation.mutateAsync({
                foodName: food.foodName,
                foodDescription: food.foodDescription,
            });
            console.log("Food creation triggered!");
        } catch (err) {
            console.error("Failed to create food:", err);
        }
    }


    async function handleAddIngredientsToFood() {
        const filtedIngredients = filterOutEmptyIngredients(ingredients)
        if (filtedIngredients.length === 0) {
            setErrorNote('Must select a valid ingredient');
            return;
        }
        setErrorNote("")
        try {
            await addIngredientsToFoodMutation.mutateAsync({
                foodId: food.foodId, 
                ingredients: filtedIngredients
            });
            console.log("Ingredients attachment triggered!");
        } catch (err) {
            console.error("Failed to attach ingredients to a food:", err);
        }
        
        
    }

    return(<>
    <IngredientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)} 
    />
    <div className="food-form">
        {foodCreated ? <>
        <h2 id="food-name">{food.foodName.toUpperCase()}</h2>
        <p id="food-description">{food.foodDescription}</p>
        </> : <>
        <h1>Food</h1>
        <label htmlFor="food-name-input">Food Name: </label>
        <input type="text" 
            id="food-name-input" 
            value={food.foodName}
            onChange={(e) => handleInput(e)}
            required
        />
        <br />
        <label htmlFor="food-description-input">Food Description: </label>
        <textarea 
            id="food-description-input"
            name="food-description-input"
            autoCorrect="on"
            value={food.foodDescription}
            onChange={(e) => handleTextarea(e)}
        />
        <br />
        <button id="food-save" onClick={handleCreateFood} disabled={food.foodName ===""}>Save</button></>}
        {errorNote !== "" && <p>{errorNote}</p>}
        {foodCreated && !ingredientsAdded && <div id="ingredients-section-edit">
            {!enableIngredient ? <button id="enable-ingredients" onClick={() => setEnableIngredient(true)}>Add Ingredients To Food</button> : <>
            <h3 id="ingredient-title">Ingredients</h3>
            <button id="add-ingredient" type="button" onClick={addIngredient}>Add An Ingredient</button>
            <button id="create-ingredient" type="button" onClick={() => setModalOpen(true)}>Create An Ingredient</button>
            <ol id="ingredients-edit">
                {ingredients.map((row, index) => (<IngredientRow key={index} ingredientIndex={index} row={row} existingIngredients={data} updateRow={((updatedIngredientRow) => updateIngredientRow(index, updatedIngredientRow))} removeRow={() => removeIngredientRow(index)} />))}
            </ol>
            <button id="ingredients-save" onClick={handleAddIngredientsToFood} disabled={ingredients.length === 0}>Save</button>
            </>}
        </div>}
        {foodCreated && ingredientsAdded && <div id="ingredients-section-browse"><h3 id="ingredient-title">Ingredients</h3><ol id="ingredients-browse">
            {ingredients.map(row => (
                <li key={row.foodIngredientId}><strong>{row.ingredientName.toUpperCase()}: </strong>{row.quantity} {row.ingredientUnitName}{row.ingredientUnitAbbreviation !== row.ingredientUnitName && <> ({row.ingredientUnitAbbreviation})</>}; <i>{row.note !== "" && <>Note: {row.note}</>}</i></li>
            ))}
        </ol></div>}
        <br />
        <button id="food-back" onClick={() => navigate(`/`)}>Back</button>
    </div></>)
}


export default AddFoodForm