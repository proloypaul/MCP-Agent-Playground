import axios from "axios";
import { config } from "./config.js";

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
}

export async function getWeather(city: string): Promise<WeatherData> {
  if (!config.openWeatherApiKey) {
    throw new Error("OpenWeather API key is not configured.");
  }

  try {
    // We use units=metric for Celsius
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${config.openWeatherApiKey}&units=metric`;
    
    const response = await axios.get(url);
    const data = response.data;

    // Normalize the response to our WeatherData interface
    return {
      city: data.name, // the official name returned by the API
      temperature: data.main.temp,
      humidity: data.main.humidity,
      condition: data.weather[0]?.main || "Unknown",
      windSpeed: data.wind.speed,
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`City not found: ${city}`);
      }
      if (error.response?.status === 401) {
        throw new Error("Invalid OpenWeather API key. Please check your .env file.");
      }
      throw new Error(`OpenWeather API error: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}
