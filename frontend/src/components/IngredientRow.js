import { useState } from "react";

function IngredientRow({ row, existingIngredients, updateRow, removeRow }) {

    const [ingredient, setIngredient] = useState(row)
    const handleIngredientChange = (e) => {
        const ingredient = existingIngredients.find(
            i => i.name === e.target.value
        );
        setIngredient({
            ...row,
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            ingredientUnitId: ingredient.canonical_unit_id,
            ingredientUnitName: ingredient.canonical_unit,
            ingredientUnitAbbreviation: ingredient.canonical_unit_abbreviation,
            note: ingredient.note || "",
            quantity: ingredient.quantity || 0
        })
        updateRow ({
            ...row,
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            ingredientUnitId: ingredient.canonical_unit_id,
            ingredientUnitName: ingredient.canonical_unit,
            ingredientUnitAbbreviation: ingredient.canonical_unit_abbreviation,
            note: ingredient.note || "",
            quantity: ingredient.quantity || 0
        });
    };

    const handleQuantityChange = (e) => {
        setIngredient(prev => ({
            ...prev,
            quantity: Number(e.target.value)
        }))
        updateRow({
            ...row,
            quantity: Number(e.target.value)
        })
    };

    const handleNoteChange = (e) => {
        setIngredient(prev => ({
            ...prev,
            note: e.target.value
        }))
        updateRow({
            ...row,
            note: e.target.value
        })
    };

    return (
    <li className="ingredient-row-li">
        <div className="ingredient-row">
        <label htmlFor={`ingredient-${ingredient.tempId ? ingredient.tempId :ingredient.foodIngredientId}`}>
        <select name={`ingredient-${ingredient.tempId ? ingredient.tempId :ingredient.foodIngredientId}`} 
            id={`ingredient-${ingredient.tempId ? ingredient.tempId :ingredient.foodIngredientId}`}
            className="ingredient-select"
            value={ingredient?.ingredientName ?? ""} 
            onChange={handleIngredientChange}
        >
            <option value="">-- Select an ingredient --</option>
            {existingIngredients.length > 0 && existingIngredients.map(ingredient => (
                <option key={ingredient.id} value={ingredient.name}>{ingredient.name}</option>
            ))}
        </select></label>
        {/* {!ingredient.tempId && <> */}
        <label htmlFor={`quantity-${ingredient.tempId ? ingredient.tempId : ingredient.foodIngredientId}`} className="ingredient-quantity"><span>Unit Quantity: {"  "}</span>
        <input type="number" 
        className="ingredient-input"
        id={`quantity-${ingredient.tempId ? ingredient.tempId : ingredient.foodIngredientId}`} 
        name={`quantity-${ingredient.tempId ? ingredient.tempId : ingredient.foodIngredientId}`} 
        min="0"
        value={ingredient.quantity}
        onChange={handleQuantityChange}/>
        <span id={`quantity-unit-${ingredient.tempId ? ingredient.tempId : ingredient.foodIngredientId}`}>{ingredient.ingredientUnitName} {ingredient.ingredientUnitAbbreviation !== ingredient.ingredientUnitName && <>({ingredient.ingredientUnitAbbreviation})</>}</span></label>
        <label htmlFor={`ingredient-note-${ingredient.tempId ? ingredient.tempId : ingredient.foodIngredientId}`} className="ingredient-note"><span>Note: {"  "}</span>
        <textarea 
        id={`ingredient-note-${ingredient.tempId ? ingredient.tempId : ingredient.foodIngredientId}`}
        className="ingredient-input"
        name={`ingredient-note-${ingredient.tempId ? ingredient.tempId : ingredient.foodIngredientId}`}
        autoCorrect="on"
        value={ingredient.note}
        onChange={(e) => handleNoteChange(e)}
        ></textarea></label>
        {removeRow && (
            <button id={`remove-btn-${ingredient.tempId ? ingredient.tempId : ingredient.foodIngredientId}`} className="remove-btn" type="button" title="Delete Ingredient From Food" aria-label="Delete Ingredient From Food" onClick={(e) => {
                e.stopPropagation();
                removeRow()}}><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z"/></svg></button>
        )}
        {/* </>} */}
        </div>
    </li>)
}

export default IngredientRow