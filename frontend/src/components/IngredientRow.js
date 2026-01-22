

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
        });
    };

    const handleQuantityChange = (e) => {
        updateRow({
            ...row,
            quantity: Number(e.target.value)
        })
    };


    return (<div className="ingredient-row">
        <label htmlFor={`ingredient-${ingredientIndex}`}>Ingredient: </label>
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
            <label htmlFor={`quantity-${ingredientIndex}`}>Unit Quantity:
            <input type="number" 
            id={`quantity-${ingredientIndex}`} 
            name={`quantity-${ingredientIndex}`} 
            min="0"
            value={row.quantity}
            onChange={handleQuantityChange}/>
            {row.ingredientUnitName} ({row.ingredientUnitAbbreviation})</label>
            {removeRow && (
                <button className="remove-btn" type="button" onClick={removeRow}>✕</button>
            )}
        </>}
    </div>)
}

export default IngredientRow