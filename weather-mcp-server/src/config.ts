import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the absolute path of THIS config.ts file (works wherever the process is launched from)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build an absolute path to .env relative to THIS file's location
// __dirname = .../weather-mcp-server/dist/  (in compiled JS)
// We go one level up to find .../weather-mcp-server/.env
const envPath = path.resolve(__dirname, "../.env");

// Load .env using the absolute path — works regardless of CWD
dotenv.config({ path: envPath });

export const config = {
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || "",
};

if (!config.openWeatherApiKey) {
  console.error(
    `[MCP Server] Warning: OPENWEATHER_API_KEY is not set. Looked for .env at: ${envPath}`
  );
}
