import axios from "axios";

export default axios.create({
  baseURL: "https://cernikiw3.chickenkiller.com", 
  headers: {
    "Content-Type": "application/json"
  }
});