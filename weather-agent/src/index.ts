import path from "path";
import { fileURLToPath } from "url";
import { connectToServer } from "./mcp-client.js";
import { runAgentLoop } from "./agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_PATH = path.resolve(__dirname, "../../weather-mcp-server/dist/index.js");

async function main() {
  try {
    console.log("Initializing Agent System...");
    
    // 1. Boot up the MCP Client and connect to the Server
    await connectToServer(SERVER_PATH);

    // 2. Test a question that requires the weather tool
    await runAgentLoop("What's the weather in Dhaka?");

    // 3. Test a question that does NOT require the tool
    await runAgentLoop("What is Node.js in one simple sentence?");

  } catch (error) {
    console.error("Agent System Error:", error);
  } finally {
    process.exit(0);
  }
}

main();
