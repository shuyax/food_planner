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