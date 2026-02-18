import { useState } from "react";
import UnitList from "../components/UnitList";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createIngredient } from "../services/IngredientService";
import { useQueryClient } from "@tanstack/react-query";

function AddIngredientForm( {visibleBackButton = true} ) {
    // Back button only visible when not open as a modal
    const [ingredientName, setIngredientName] = useState("");
    const [selectedUnit, setSelectedUnit] = useState({id: -1, 
        name: "", 
        abbreviation: ""});
    const [submittedNote, setSubmittedNote] = useState("")

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const createIngredientMutation = useMutation({
            mutationFn: ({ ingredientName, canonicalUnitId }) =>
                createIngredient(ingredientName, canonicalUnitId),
            onSuccess: (data, variables) => {
                const { ingredientName, canonicalUnitId } = variables;
                setIngredientName("")
                setSubmittedNote(`Ingredient ${ingredientName} created successfully!`)
                queryClient.invalidateQueries({ queryKey: ["ingredients"] });
            },
            onError: (error) => {
                console.error("Failed to create ingredient:", error);
                alert("Failed to save ingredient.");
            }
        });
    
    async function handleCreateIngredient() {
        if (!ingredientName) {
            alert('Must enter a valid ingredient name')
            return;
        }
        try {
            await createIngredientMutation.mutateAsync({
                ingredientName,
                canonicalUnitId: selectedUnit.id,
            });
            console.log("Ingredient creation triggered!");
        } catch (err) {
            console.error("Failed to create ingredient:", err);
        }
    }

    return(<div className="ingredient-form">
        <h1>Ingredient</h1>
        <label htmlFor="ingredient-name-input"><span>Ingredient Name: {"  "}</span>
        <input type="text" 
            id="ingredient-name-input" 
            value={ingredientName}
            onChange={(e) => setIngredientName(e.target.value.toLowerCase().trimStart())}
            required
        /></label>
        <UnitList selectedUnit={selectedUnit} setSelectedUnit={setSelectedUnit}/>
        <button id="ingredient-save" onClick={handleCreateIngredient} disabled={ingredientName===""}>Save</button>
        {visibleBackButton && <button id="ingredient-back" onClick={() => navigate(`/`)}>Back</button>}
        {submittedNote !== '' && <p id="ingredient-form-note">{submittedNote}</p>}
    </div>)
}


export default AddIngredientForm