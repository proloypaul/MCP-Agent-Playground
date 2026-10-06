import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicTool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { config } from "./config.js";
import { callWeatherTool } from "./mcp-client.js";

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON POINT 1: LLM Initialization
// Custom agent:  new GoogleGenerativeAI(key).getGenerativeModel({ model })
// LangChain:     new ChatGoogleGenerativeAI({ model, apiKey })
//
// The LangChain version implements the standardized "BaseChatModel" interface.
// This means you can swap one line — ChatGoogleGenerativeAI → ChatOpenAI —
// and the rest of the agent code stays 100% unchanged.
// ─────────────────────────────────────────────────────────────────────────────
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.8-flash",
  apiKey: config.geminiApiKey,
  temperature: 0,
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON POINT 2: Tool Definition
// Custom agent:  We manually called callWeatherTool() inside the while loop.
// LangChain:     We wrap our MCP Client call in a DynamicTool.
//                LangChain's ReAct agent will automatically invoke tool.func()
//                based on the LLM's decision.
//
// CRITICAL: Notice that tool.func() STILL calls our MCP Client!
// LangChain replaces the AGENT LOOP — NOT the MCP transport layer.
// ─────────────────────────────────────────────────────────────────────────────
const weatherTool = new DynamicTool({
  name: "get_weather",
  description:
    "Get the current weather for a given city. " +
    "Input should be the city name as a plain string (e.g., 'Dhaka', 'London', 'New York').",
  func: async (city: string): Promise<string> => {
    console.log(`\n[LangChain Tool]: Calling MCP get_weather for "${city}"...`);
    const result = await callWeatherTool(city);
    console.log(`[LangChain Tool]: MCP result received.`);
    return result;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON POINT 3: The Agent Executor (The Agent Loop)
// Custom agent:  We wrote ~40 lines of while loop manually:
//   while (functionCalls) {
//     call tool → send result back → check for more calls
//   }
//
// LangChain/LangGraph: createReactAgent() builds a state machine graph
//   (LangGraph StateGraph) that handles the exact same loop automatically.
//   Under the hood it:
//     1. Sends message to LLM
//     2. Detects ToolCall nodes in the response
//     3. Executes matching tools via ToolNode
//     4. Feeds ToolMessage results back to LLM
//     5. Loops until LLM produces a final AIMessage (no more tool calls)
// ─────────────────────────────────────────────────────────────────────────────
const agent = createReactAgent({
  llm,
  tools: [weatherTool],
  prompt:
    "You are a helpful AI assistant specializing in weather information. " +
    "If the user asks about weather, always use the get_weather tool. " +
    "Never guess or make up weather data.",
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON POINT 4: Conversation History (Memory)
// Custom agent:  The Gemini SDK's chat.sendMessage() tracked history
//                internally but we had no explicit control over it.
// LangChain:     We manage history explicitly as an array of BaseMessage objects.
//                This gives full control — we can inspect, trim, or save history.
// ─────────────────────────────────────────────────────────────────────────────
const conversationHistory: BaseMessage[] = [];

export async function runLangChainAgentLoop(question: string): Promise<string> {
  // Add the new user message to history
  conversationHistory.push(new HumanMessage(question));

  console.log(`\n[LangChain Agent]: Invoking ReAct agent...`);

  // Invoke the LangGraph ReAct agent with the full conversation history
  const result = await agent.invoke({
    messages: conversationHistory,
  });

  // The final response is the last AIMessage in the result
  const messages = result.messages as BaseMessage[];
  const lastMessage = messages[messages.length - 1];
  const answer = typeof lastMessage.content === "string"
    ? lastMessage.content
    : JSON.stringify(lastMessage.content);

  // Add the AI's response to history for future turns
  conversationHistory.push(new AIMessage(answer));

  return answer;
}
