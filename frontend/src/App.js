import './App.css';
import AddFoodForm from './pages/AddFoodForm';
import AddIngredientForm from './pages/AddIngredientForm';
import AddMealForm from './pages/AddMealForm';
import Home from './pages/Home'
import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <nav>
        <Link to="/">HOME</Link> |{" "}
        <Link to="/add-ingredient">Add New Ingredient</Link> |{" "}
        <Link to="/add-food">Add New Food</Link>
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/add-ingredient' element={<AddIngredientForm />} />
        <Route path="/add-food" element={<AddFoodForm />} />
        <Route path='/add-meal' element={<AddMealForm />} />
       </Routes>
    </div>
  );
}

export default App;
