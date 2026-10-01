import path from "path";
import { fileURLToPath } from "url";
import { connectToServer, listAvailableTools, callWeatherTool } from "./mcp-client.js";

// Calculate absolute path to the server's entry point
// This assumes weather-mcp-server is built and located adjacent to weather-agent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_PATH = path.resolve(__dirname, "../../weather-mcp-server/dist/index.js");

async function main() {
  try {
    console.log("--- Starting MCP Client Test (No LLM yet) ---");
    
    // 1. Connect
    await connectToServer(SERVER_PATH);

    // 2. Discover Tools
    const tools = await listAvailableTools();
    console.log("\nDiscovered tools from server:");
    console.log(JSON.stringify(tools, null, 2));

    // 3. Call Tool (Test: Dhaka)
    const result = await callWeatherTool("Dhaka");
    console.log("\nTool Result (Dhaka):");
    console.log(JSON.stringify(result, null, 2));
    
    // 4. Test an error case
    const errorResult = await callWeatherTool("UnknownCity123987");
    console.log("\nTool Error Result (Unknown City):");
    console.log(JSON.stringify(errorResult, null, 2));

  } catch (error) {
    console.error("\nAgent Error:", error);
  } finally {
    process.exit(0);
  }
}

main();
