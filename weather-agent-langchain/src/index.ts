import path from "path";
import { fileURLToPath } from "url";
import * as readline from "readline";
import { connectToServer } from "./mcp-client.js";
import { runLangChainAgentLoop } from "./agent-langchain.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shared MCP Server: We point to the SAME server built in Milestone 2-3!
// The LangChain version doesn't need a different MCP Server.
const SERVER_PATH = path.resolve(__dirname, "../../weather-mcp-server/dist/index.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function promptUser() {
  rl.question("You: ", async (input) => {
    const text = input.trim();

    if (text.toLowerCase() === "exit" || text.toLowerCase() === "quit") {
      console.log("Shutting down LangChain Agent...");
      rl.close();
      process.exit(0);
    }

    if (text) {
      try {
        const answer = await runLangChainAgentLoop(text);
        console.log(`\nAgent: ${answer}\n`);
      } catch (error: any) {
        console.error("Error:", error.message || error);
      }
    }

    promptUser();
  });
}

async function main() {
  try {
    console.log("=================================================");
    console.log("   MCP Weather Agent — LangChain Version       ");
    console.log("=================================================");
    console.log("Initializing LangChain Agent System...");

    // The MCP Client connects to the SAME weather-mcp-server
    await connectToServer(SERVER_PATH);

    console.log("System Ready! Type 'exit' to quit.\n");
    promptUser();
  } catch (error) {
    console.error("System Error:", error);
    process.exit(1);
  }
}

main();
