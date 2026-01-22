import { BASEURL } from "./config"
import axios from "axios";

export async function fetchUnits() {
    const res = await axios.get(`${BASEURL}/units`)
    return res.data
}
