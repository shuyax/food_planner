import { BASEURL } from "./config"
import axios from "axios";

export async function fetchFoods() {
    const res = await axios.get(`${BASEURL}/foods`)
    console.log(res.data)
    return res.data
};

export async function createFood(foodName, foodDescription) {
  const res = await axios.post(`${BASEURL}/foods`, {
    name: foodName,
    description: foodDescription
  });
  console.log(res.data)
  return res.data
};

export async function addIngredientsToFood(foodId, ingredients) {
    const res = await axios.post(`${BASEURL}/foods/add-ingredients`, {
        foodId: foodId,
        ingredients: ingredients
    });
    console.log(res.data)
    return res.data
};

export async function fetchFood(foodId) {
  try {
    const res = await axios.get(`${BASEURL}/foods/${foodId}`);
    console.log(res.data)
    return res.data; // Successfully fetched food
  } catch (error) {
    if (error.response) {
      // Server responded with a status code out of 2xx
      if (error.response.status === 404) {
        console.error(`Food with ID ${foodId} not found.`);
        return null; // Or throw a custom error if you prefer
      } else {
        console.error("Server error:", error.response.status, error.response.data);
        throw new Error("Failed to fetch food from the server.");
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response received:", error.request);
      throw new Error("No response from server.");
    } else {
      // Something else happened
      console.error("Error:", error.message);
      throw new Error("Error fetching food.");
    }
  }
}

export async function fetchRelatedIngredients(foodId) {
  const res = await axios.get(`${BASEURL}/foods/${foodId}/ingredients`);
    const transformed = res.data.map(item => ({
      ingredientId: item.ingredient.id,
      ingredientName: item.ingredient.name,
      ingredientUnitId: item.ingredient.canonical_unit_id,
      ingredientUnitName: item.ingredient.canonical_unit,
      ingredientUnitAbbreviation: item.ingredient.canonical_unit,
      foodIngredientId: item.id,
      note: item.note,
      quantity: item.quantity
    }));
    console.log(transformed)
    return transformed; 
}

export async function updateFood(updatedFood) {
  const res = await axios.put(`${BASEURL}/foods/update-food`, {
    id: updatedFood.foodId,
    name: updatedFood.foodName,
    description: updatedFood.foodDescription
  })
  return res.data
}

export async function updateFoodIngredients(updatedIngredients) {
  console.log(updatedIngredients)
  const res = await axios.put(`${BASEURL}/foods/update-ingredients`, {
    ingredients: updatedIngredients
  })
  return res.data
}