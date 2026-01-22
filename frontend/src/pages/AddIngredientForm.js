import { useState } from "react";
import UnitList from "../components/UnitList";


function AddIngredientForm() {
    const [ingredientName, setIngredientName] = useState("");
    const [selectedUnit, setSelectedUnit] = useState("");

    return(<div className="ingredient-form">
        <h1>Ingredient</h1>
        <label htmlFor="ingredient-name-input">Ingredient Name: </label>
        <input type="text" 
            id="ingredient-name-input" 
            value={ingredientName}
            onChange={(e) => setIngredientName(e.target.value.toLowerCase().trimStart())}
            required
        />
        <UnitList selectedUnit={selectedUnit} setSelectedUnit={setSelectedUnit}/>
        <button id="ingredient-save" disabled={ingredientName===""}>Save</button>
        <button id="ingredient-cancel">Cancel</button>
    </div>)
}


export default AddIngredientForm