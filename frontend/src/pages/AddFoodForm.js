import { useState } from "react";
import IngredientRow from "../components/IngredientRow";
import { fetchIngredients } from "../services/IngredientService"
import { useQuery } from "@tanstack/react-query";

function AddFoodForm( {} ) {
    const [foodName, setFoodName] = useState("");

    const defaultIngredient = {
        ingredientId: -1,
        ingredientName: "",
        ingredientUnitId: -1,
        ingredientUnitName: "",
        ingredientUnitAbbreviation: "",
        quantity: 0
    };
    const [ingredients, setIngredients] = useState([defaultIngredient]);

    const { data, isLoading, error } = useQuery({
        queryKey: ["ingredients"],
        queryFn: fetchIngredients
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

    return(<div className="food-form">
        <h1>Food</h1>
        <label htmlFor="food-name-input">Food Name: </label>
        <input type="text" 
            id="food-name-input" 
            value={foodName}
            onChange={(e) => setFoodName(e.target.value.toLowerCase().trimStart())}
            required
        />
        <label htmlFor="food-description-input">Food Description: </label>
        <textarea 
            id="food-description-input"
            name="food-description-input"
            autoCorrect="on"
        />
        <br />
        <div id="ingredients-section">
            <h2>Ingredients</h2>
            {ingredients.map((row, index) => (<IngredientRow key={index} ingredientIndex={index} row={row} existingIngredients={data} updateRow={((updatedIngredientRow) => updateIngredientRow(index, updatedIngredientRow))} removeRow={() => removeIngredientRow(index)} />))}
            <button id="add-ingredient" type="button" onClick={addIngredient}>Add Ingredient</button>
        </div>
        <button id="food-save" disabled={foodName===""}>Save</button>
        <button id="food-cancel">Cancel</button>
    </div>)
}


export default AddFoodForm