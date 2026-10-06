import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// We keep a reference to the client to use it across our agent
let mcpClient: Client | null = null;

export async function connectToServer(serverPath: string) {
  const transport = new StdioClientTransport({
    command: "node",
    args: [serverPath],
  });

  mcpClient = new Client(
    { name: "weather-agent-langchain-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await mcpClient.connect(transport);
  console.log("MCP Client connected to Weather Server!");
}

export async function listAvailableTools() {
  if (!mcpClient) throw new Error("MCP Client not connected.");
  const response = await mcpClient.listTools();
  return response.tools;
}

export async function callWeatherTool(city: string): Promise<string> {
  if (!mcpClient) throw new Error("MCP Client not connected.");

  const result = await mcpClient.callTool({
    name: "get_weather",
    arguments: { city },
  });

  // Extract text from the MCP content array
  const content = result.content as any[];
  return content[0]?.text || "No result returned.";
}
