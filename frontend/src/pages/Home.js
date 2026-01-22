import { useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";

function Home() {
    const navigate = useNavigate();

    return (<>
        <Calendar mode="browse" onAddMeal={(date) => navigate(`/add-meal?date=${date}`)} />
    </>)
};
export default Home;