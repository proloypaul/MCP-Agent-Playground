import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// We keep a reference to the client to use it across our agent
let mcpClient: Client | null = null;

export async function connectToServer(serverPath: string) {
  // Configure the transport to start our MCP server process
  // The client actually SPawns the server as a child process using the command below
  const transport = new StdioClientTransport({
    command: "node",
    args: [serverPath], // Path to the compiled weather-mcp-server index.js
  });

  // Initialize the MCP client
  mcpClient = new Client(
    { name: "weather-agent-client", version: "1.0.0" },
    { capabilities: {} }
  );

  // Connect to the transport
  await mcpClient.connect(transport);
  console.log("Connected to MCP Server!");
}

export async function listAvailableTools() {
  if (!mcpClient) throw new Error("MCP Client not connected.");
  const response = await mcpClient.listTools();
  return response.tools;
}

export async function callWeatherTool(city: string) {
  if (!mcpClient) throw new Error("MCP Client not connected.");
  
  console.log(`\n> Calling get_weather tool for city: ${city}...`);
  
  // Notice how we use the exact method and arguments we saw in Milestone 4!
  const result = await mcpClient.callTool({
    name: "get_weather",
    arguments: { city: city },
  });

  return result;
}
