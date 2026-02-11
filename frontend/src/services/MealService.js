import { BASEURL } from "./config"
import axios from "axios";

export async function fetchMeals(startDate, endDate) {
  const res = await axios.get(`${BASEURL}/meals`, {
    headers: {
      startdate: startDate,
      enddate: endDate
    }
  });
  // console.log(res.data)
  return res.data
};

export async function createMeal(mealType, mealDate) {
  const res = await axios.post(`${BASEURL}/meals`, {
    type: mealType,
    date: mealDate
  });
  // console.log(res.data)
  return res.data
};

export async function fetchMealTypes() {
  const res = await axios.get(`${BASEURL}/meals/meal-types`);
  // console.log(res.data)
  return res.data
};

export async function fetchRelatedFoods(mealId) {
  const res = await axios.get(`${BASEURL}/meals/${mealId}/foods`);
  // console.log(res.data)
  return res.data
}


export async function updateFoodsToMeal(mealId, foods) {
  const res = await axios.post(`${BASEURL}/meals/update-foods`, {
    mealId: mealId,
    foods: foods
  });
  // console.log(res.data)
  return res.data
}

export async function deleteMeal(mealId) {
  const res = await axios.delete(`${BASEURL}/meals/delete/${mealId}`);
  // console.log(res.data)
  return res.data; 
}