import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getTrips = () => axios.get(`${API_URL}/trips`);

export const createTrip = (trip) => axios.post(`${API_URL}/trips`, trip);
export const addExpense = (tripId, expense) =>
  axios.post(`${API_URL}/trips/${tripId}/expenses`, expense);
