import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const config = {
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || "",
};

if (!config.openWeatherApiKey) {
  console.error("Warning: OPENWEATHER_API_KEY is not set in environment variables");
}
