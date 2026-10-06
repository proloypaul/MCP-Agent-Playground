import path from "path";
import { fileURLToPath } from "url";
import * as readline from "readline";
import { connectToServer } from "./mcp-client.js";
import { runAgentLoop } from "./agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_PATH = path.resolve(__dirname, "../../weather-mcp-server/dist/index.js");

// Setup interactive terminal interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function promptUser() {
  rl.question("You: ", async (input) => {
    const text = input.trim();
    
    // Support graceful exit
    if (text.toLowerCase() === "exit" || text.toLowerCase() === "quit") {
      console.log("Shutting down Agent...");
      rl.close();
      process.exit(0);
    }
    
    if (text) {
      try {
        await runAgentLoop(text);
      } catch (error: any) {
        console.error("Error during Agent Loop:", error.message || error);
      }
    }
    
    // Prompt the user again for the next question
    promptUser();
  });
}

async function main() {
  try {
    console.log("=================================");
    console.log("       MCP Weather Agent       ");
    console.log("=================================");
    console.log("Initializing Agent System...");
    
    // 1. Boot up the MCP Client and connect to the Server
    await connectToServer(SERVER_PATH);

    console.log("System Ready! Type 'exit' to quit.\n");
    
    // 2. Start the interactive loop
    promptUser();

  } catch (error) {
    console.error("Agent System Error:", error);
    process.exit(1);
  }
}

main();
