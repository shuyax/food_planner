import { BASEURL } from "./config"
import axios from "axios";

export async function fetchMeals(startDate, endDate) {
  const res = await axios.get(`${BASEURL}/meals`, {
    headers: {
      startdate: startDate,
      enddate: endDate
    }
  });
  console.log(res.data)
  return res.data
};

export async function createMeal(mealType, mealDate, foods) {
  const res = await axios.post(`${BASEURL}/meals`, {
    type: mealType,
    date: mealDate,
    foods: foods
  });
  console.log(res.data)
  return res.data
};

export async function fetchMealTypes() {
  const res = await axios.get(`${BASEURL}/meals/meal-types`);
  console.log(res.data)
  return res.data
};