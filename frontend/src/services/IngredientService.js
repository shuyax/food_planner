import { BASEURL } from "./config"
import axios from "axios";

export async function fetchIngredients() {
    const res = await axios.get(`${BASEURL}/ingredients`)
    console.log(res.data)
    return res.data
}
