import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { getWeather } from "./weather.js";

// 1. Initialize the MCP Server
const server = new Server(
  {
    name: "weather-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // This tells the client we support tools
    },
  }
);

// 2. Register Tool Discovery (List Tools)
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_weather",
        description: "Get the current weather for a city",
        inputSchema: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "The name of the city (e.g., Dhaka, London)",
            },
          },
          required: ["city"],
        },
      },
    ],
  };
});

// 3. Register Tool Execution (Call Tool)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "get_weather") {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${request.params.name}`
    );
  }

  // Extract arguments
  const args = request.params.arguments as any;
  if (!args || typeof args.city !== "string") {
    throw new McpError(ErrorCode.InvalidParams, "Invalid or missing 'city' argument");
  }

  const city = args.city;

  // 4. Return Real Weather Data (Milestone 3)
  try {
    const weatherData = await getWeather(city);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(weatherData, null, 2),
        },
      ],
    };
  } catch (error: any) {
    // If the API call fails, return the error gracefully inside the tool response
    // so the LLM knows what went wrong and can tell the user.
    return {
      isError: true, // Standard MCP way to flag a tool failure
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
});

// 5. Start the Server with stdio transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // NOTE: When using StdioServerTransport, we MUST NOT use console.log
  // because stdout is used for the MCP protocol JSON messages.
  // We use console.error to write to stderr, which the client ignores or logs.
  console.error("Weather MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Server startup error:", error);
  process.exit(1);
});
