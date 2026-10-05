import { createChatSession } from "./llm.js";
import { listAvailableTools, callWeatherTool } from "./mcp-client.js";
import { Tool } from "@google/generative-ai";

/**
 * Utility to convert MCP tools schema into Gemini tools schema.
 * This is the crucial bridge between standard MCP formats and what the LLM expects!
 */
function mcpToGeminiTools(mcpTools: any[]): Tool[] {
  const functionDeclarations = mcpTools.map((tool) => {
    const properties: any = {};
    for (const [key, val] of Object.entries<any>(tool.inputSchema?.properties || {})) {
      properties[key] = {
        type: (val.type || "string").toUpperCase(), // e.g. "STRING"
        description: val.description,
      };
    }

    return {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "OBJECT" as any,
        properties: properties,
        required: tool.inputSchema?.required || [],
      },
    };
  });

  return [{ functionDeclarations }];
}

export async function runAgentLoop(question: string) {
  console.log(`\n=================================`);
  console.log(`You: ${question}`);
  
  // 1. Get MCP Tools and convert them to Gemini format
  const mcpTools = await listAvailableTools();
  const geminiTools = mcpToGeminiTools(mcpTools);

  // 2. Start Chat Session with LLM, passing the tools
  const chat = createChatSession(geminiTools);

  // 3. Send the user's question to the LLM
  console.log("\n[Agent Loop]: Sending question to LLM...");
  let response = await chat.sendMessage(question);
  let functionCalls = response.response.functionCalls();

  // 4. THE AGENT LOOP
  // As long as the LLM responds with a "Tool Call", we must execute it and give back the result.
  while (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0]; // For simplicity, handle the first call
    console.log(`[Agent Loop]: LLM paused execution and requested tool -> ${call.name}(${JSON.stringify(call.args)})`);

    if (call.name === "get_weather") {
      const city = (call.args as any).city as string;
      
      // 5. Execute the tool using our MCP Client
      console.log(`[Agent Loop]: Executing MCP tool get_weather for ${city}...`);
      const result = await callWeatherTool(city);
      
      // We extract the string result from MCP's content array
      const content = result.content as any[];
      const textResult = content[0].text;
      const isError = result.isError || false;
      
      console.log(`[Agent Loop]: Tool execution complete. Sending result back to LLM...`);

      // 6. Send the result back to the LLM so it can resume its thought process
      response = await chat.sendMessage([
        {
          functionResponse: {
            name: call.name,
            response: { 
               result: textResult, 
               isError: isError 
            }
          }
        }
      ]);
    } else {
      console.error("[Agent Loop]: Unknown tool requested by LLM.");
      break;
    }

    // Check if the LLM made ANOTHER tool call after receiving the previous result
    functionCalls = response.response.functionCalls();
  }

  // 7. Loop ends. The LLM has finished thinking and output text instead of a tool call.
  const finalAnswer = response.response.text();
  console.log(`\nAgent: ${finalAnswer}`);
  console.log(`=================================\n`);
}
