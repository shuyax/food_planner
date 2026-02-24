import { useState } from "react";
import {  useMutation  } from "@tanstack/react-query";
import { createFood } from "../services/FoodService";
import { useNavigate } from "react-router-dom";
import "./CreateFoodPage.css"

function CreateFoodPage( {visibleBackButton = true} ) {
   const defaultFood = {
        foodId: -1,
        foodName: "",
        foodDescription: ""
   }
    const [food, setFood] = useState(defaultFood);
    const [errorNote, setErrorNote] = useState("")
    const [toastMessage, setToastMessage] = useState("")
    const navigate = useNavigate();

    const createFoodMutation = useMutation({
        mutationFn: ({ foodName, foodDescription }) =>
            createFood(foodName, foodDescription),
        onSuccess: (data, variables) => {
            const { foodName, foodDescription } = variables;
            setToastMessage(`${foodName.toUpperCase()} was created successfully. You can attach ingredients to the food now.`)
            setTimeout(() => {
                navigate(`/food/${data}`)
            }, 2000);
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


    return(<>
    <div id="food-form">
        <h1>Food</h1>
        <div id="food-section">
        <label htmlFor="food-name-input"><h3>Food Name: {"    "}</h3>
        <input type="text" 
            id="food-name-input" 
            className="food-input"
            value={food.foodName}
            onChange={(e) => handleInput(e)}
            required
        /></label>
        <label htmlFor="food-description-input"><h3>Food Description: {"    "}</h3>
        <textarea 
            id="food-description-input"
            className="food-input"
            name="food-description-input"
            autoCorrect="on"
            value={food.foodDescription}
            onChange={(e) => handleTextarea(e)}
        /></label>
        <button id="food-create" onClick={(e) => {e.stopPropagation();
            handleCreateFood()}} disabled={food.foodName ===""} title="Create Food" aria-label="Create Food" className="create-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="12" x2="12" y2="18"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg></button>
        {errorNote !== "" && <p>{errorNote}</p>}
        {toastMessage !== "" && <p className="toast-message">{toastMessage}</p>}
        </div>
        {visibleBackButton && <button id="food-back" className="back-btn" title="Back to Home Page" aria-label="Back to Home Page" onClick={(e) => {e.stopPropagation();
            navigate(`/`)}}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="12" r="10"></circle> <path d="M15 12H9"></path><polyline points="12 15 9 12 12 9"></polyline></svg></button>}
    </div></>)
}


export default CreateFoodPage;