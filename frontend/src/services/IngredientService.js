import { BASEURL } from "./config"
import axios from "axios";

export async function fetchIngredients() {
    const res = await axios.get(`${BASEURL}/ingredients`)
    console.log(res.data)
    return res.data
}

export async function createIngredient(ingredientName, canonicalUnitId = null) {
  const res = await axios.post(`${BASEURL}/ingredients`, {
    name: ingredientName,
    canonicalUnitId: canonicalUnitId
  });
  console.log(res.data)
  return res.data
};

