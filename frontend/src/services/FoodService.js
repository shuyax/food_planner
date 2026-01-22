import { BASEURL } from "./config"
import axios from "axios";

export async function fetchFoods() {
    const res = await axios.get(`${BASEURL}/foods`)
    console.log(res.data)
    return res.data
}