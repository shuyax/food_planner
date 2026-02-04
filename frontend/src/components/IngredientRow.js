function IngredientRow({ ingredientIndex, row, existingIngredients, updateRow, removeRow }) {
   
    const handleIngredientChange = (e) => {
        const ingredient = existingIngredients.find(
            i => i.name === e.target.value
        );
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
        updateRow({
            ...row,
            quantity: Number(e.target.value)
        })
    };

    const handleNoteChange = (e) => {
        updateRow({
            ...row,
            note: e.target.value
        })
    };

    return (<li className="ingredient-row">
        <label htmlFor={`ingredient-${ingredientIndex}`} />
        <select name={`ingredient-${ingredientIndex}`} 
            id={`ingredient-${ingredientIndex}`}
            value={row?.ingredientName ?? ""} 
            onChange={handleIngredientChange}
        >
            <option value="">-- Select an ingredient --</option>
            {existingIngredients.length > 0 && existingIngredients.map(ingredient => (
                <option key={ingredient.id} value={ingredient.name}>{ingredient.name}</option>
            ))}
        </select>
        {row.ingredientId !== -1 && <>
            <label htmlFor={`quantity-${ingredientIndex}`}><span>Unit Quantity: {"  "}</span>
            <input type="number" 
            id={`quantity-${ingredientIndex}`} 
            name={`quantity-${ingredientIndex}`} 
            min="0"
            value={row.quantity}
            onChange={handleQuantityChange}/>
            <span id={`quantity-unit-${ingredientIndex}`}>{row.ingredientUnitName} {row.ingredientUnitAbbreviation !== row.ingredientUnitName && <>({row.ingredientUnitAbbreviation})</>}</span></label>
            <label htmlFor={`ingredient-note-${ingredientIndex}`}>Note: </label>
            <textarea 
            id={`ingredient-note-${ingredientIndex}`}
            name={`ingredient-note-${ingredientIndex}`}
            autoCorrect="on"
            value={row.note}
            onChange={(e) => handleNoteChange(e)}
            ></textarea>
            {removeRow && (
                <button id={`remove-btn-${ingredientIndex}`} className="remove-btn" type="button" onClick={removeRow}>✕</button>
            )}
        </>}
    </li>)
}

export default IngredientRow