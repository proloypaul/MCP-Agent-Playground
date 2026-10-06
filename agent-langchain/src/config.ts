import dotenv from "dotenv";

dotenv.config();

export const config = {
  geminiApiKey: process.env.GEMINI_API_KEY || "",
};

if (!config.geminiApiKey) {
  console.error("Warning: GEMINI_API_KEY is not set in environment variables.");
}
