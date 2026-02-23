import { BASEURL } from "./config"
import axios from "axios";

export async function fetchMeals(startDate, endDate) {
  const res = await axios.get(`${BASEURL}/meals`, {
    headers: {
      startdate: startDate,
      enddate: endDate
    }
  });
  const result = res.data.map(meal => ({
    mealId: meal.meal_id,
    mealType: meal.meal_type,
    mealDate: meal.meal_date
  }))
  return result
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
  const result = res.data.map(food => ({
    foodId: food.food_id,
    mealFoodId: food.meal_food_id,
    foodName: food.name,
    foodDescription: food.description,
    foodCost: food.cost
  }))
  console.log(result)
  return result
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

export async function deleteFoodFromMeal(mealFoodId) {
  const res = await axios.delete(`${BASEURL}/meals/delete-food/${mealFoodId}`)
  return res.data
}

export async function updateFoodInMeal(mealFoodId, updatedFoodId) {
  const res = await axios.put(`${BASEURL}/meals/update-food`, {
    mealFoodId,
    foodId: updatedFoodId
  });
  // console.log(res.data)
  return res.data
}

export async function createFoodInMeal(mealId,foodId) {
  const res = await axios.post(`${BASEURL}/meals/create-food`, {
    mealId,
    foodId
  });
  // console.log(res.data)
  return res.data
}