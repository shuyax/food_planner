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

    return (<li className="ingredient-row-li">
        <div className="ingredient-row">
        <label htmlFor={`ingredient-${ingredientIndex}`}>
        <select name={`ingredient-${ingredientIndex}`} 
            id={`ingredient-${ingredientIndex}`}
            className="ingredient-select"
            value={row?.ingredientName ?? ""} 
            onChange={handleIngredientChange}
        >
            <option value="">-- Select an ingredient --</option>
            {existingIngredients.length > 0 && existingIngredients.map(ingredient => (
                <option key={ingredient.id} value={ingredient.name}>{ingredient.name}</option>
            ))}
        </select></label>
        {row.ingredientId !== -1 && <>
            <label htmlFor={`quantity-${ingredientIndex}`} className="ingredient-quantity"><span>Unit Quantity: {"  "}</span>
            <input type="number" 
            className="ingredient-input"
            id={`quantity-${ingredientIndex}`} 
            name={`quantity-${ingredientIndex}`} 
            min="0"
            value={row.quantity}
            onChange={handleQuantityChange}/>
            <span id={`quantity-unit-${ingredientIndex}`}>{row.ingredientUnitName} {row.ingredientUnitAbbreviation !== row.ingredientUnitName && <>({row.ingredientUnitAbbreviation})</>}</span></label>
            <label htmlFor={`ingredient-note-${ingredientIndex}`} className="ingredient-note"><span>Note: {"  "}</span>
            <textarea 
            id={`ingredient-note-${ingredientIndex}`}
            className="ingredient-input"
            name={`ingredient-note-${ingredientIndex}`}
            autoCorrect="on"
            value={row.note}
            onChange={(e) => handleNoteChange(e)}
            ></textarea></label>
            {removeRow && (
                <button id={`remove-btn-${ingredientIndex}`} className="remove-btn" type="button" title="Delete Ingredient From Food" aria-label="Delete Ingredient From Food" onClick={(e) => {
                    e.stopPropagation();
                    removeRow()}}><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z"/></svg></button>
            )}
        </>}
        </div>
    </li>)
}

export default IngredientRow