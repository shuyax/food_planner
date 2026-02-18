import './App.css';
import CreateFoodPage from './pages/CreateFoodPage';
import AddIngredientForm from './pages/AddIngredientForm';
import MealForm from './pages/MealFormPage';
import Home from './pages/Home'
import { Routes, Route, Link } from "react-router-dom";
import FoodPage from './pages/FoodPage';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <nav>
        <Link to="/">HOME</Link> |{" "}
        <Link to="/add-ingredient">Add New Ingredient</Link> |{" "}
        <Link to="/create-food">Create New Food</Link> 
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/add-ingredient' element={<AddIngredientForm />} />
        <Route path="/create-food" element={<CreateFoodPage />} />
        <Route path="/food/:foodId" element={<FoodPage />} />
        <Route path='/day-meals' element={<MealForm />} />
       </Routes>
    </div>
  );
}

export default App;
