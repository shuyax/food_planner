import AddIngredientForm from "../pages/AddIngredientForm";
import "./Modal.css"

// components/MealModal.jsx
export function IngredientModal({ open, onClose }) {

    if (!open) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <AddIngredientForm visibleBackButton={false} />
            </div>
        </div>
    );
}
