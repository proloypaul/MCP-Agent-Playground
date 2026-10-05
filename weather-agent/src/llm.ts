import { GoogleGenerativeAI, ChatSession, Tool } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables so we can access GEMINI_API_KEY
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Warning: GEMINI_API_KEY is not set in the Agent's environment variables.");
}

// Initialize the Gemini SDK
const genAI = new GoogleGenerativeAI(apiKey || "");

/**
 * Initializes a new chat session with the Gemini model.
 * @param tools Array of tools (in Gemini's format) the LLM is allowed to use.
 */
export function createChatSession(tools: Tool[] = []): ChatSession {
  // We use gemini-2.5-flash as it is fast and supports function/tool calling very well
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // System instructions define the agent's core persona and rules
    systemInstruction: 
      "You are a helpful AI assistant. If the user asks for weather, " +
      "always use the provided weather tool to get accurate data. " +
      "Never guess the weather.",
    // We attach the tools to the model here
    tools: tools.length > 0 ? tools : undefined,
  });

  // Start a chat session. This automatically keeps track of the conversation history.
  return model.startChat({
    history: [], // We start with a blank conversation
  });
}
