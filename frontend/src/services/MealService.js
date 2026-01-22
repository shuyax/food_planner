import { BASEURL } from "./config"
import axios from "axios";

export async function fetchMeals(startDate, endDate) {
  const res = await axios.get(`${BASEURL}/meals`, {
    headers: {
      startdate: startDate,
      enddate: endDate
    }
  });
  const result = res.data.reduce((acc, meal) => {
    const dateKey = meal.meal_date.split('T')[0];// 'YYYY-MM-DD'
    if (!acc[dateKey]) acc[dateKey] = {};
    if (!acc[dateKey][meal.meal_type]) acc[dateKey][meal.meal_type] = [];
    acc[dateKey][meal.meal_type].push(meal)
    return acc
  },{});
  console.log(result);
  return result
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