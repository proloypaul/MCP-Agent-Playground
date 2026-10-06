# 🌤️ MCP Weather Agent Playground

A professional playground demonstrating the integration of **Model Context Protocol (MCP)** with **LangChain (LangGraph)** to build a dynamic, tool-calling AI agent. 

This project showcases how to decouple AI orchestration logic from tool execution by running tools on an independent MCP Server and securely connecting them to a conversational AI Agent.

---

## 🏗️ Architecture

The project is split into two independent, robust modules:

1. **`mcp-server/`**: A standalone Node.js server implementing the Model Context Protocol. It exposes a `get_weather` tool and communicates over standard input/output (`stdio`). It handles external API requests to OpenWeather independently of the AI model.
2. **`agent-langchain/`**: A LangChain-powered AI Agent (`gemini-3.8-flash`) that acts as the MCP Client. It spawns the MCP Server as a child process, dynamically discovers its tools, and uses LangGraph's ReAct framework to reason and execute weather queries based on human input.

### Why MCP?
By using MCP, the tools (Weather APIs) are **not hardcoded into the Agent**. 
* The `mcp-server` can be seamlessly reused by **Claude Desktop**, **Cursor IDE**, or any other MCP-compliant host.
* The Agent doesn't need to know how the weather API works—it just reads the MCP schema dynamically!

---

## 🚀 Features

- **Standardized Tool Protocol:** Uses `@modelcontextprotocol/sdk` for universal tool discovery and execution.
- **LangGraph ReAct Agent:** Employs `@langchain/langgraph` to create a robust reasoning-and-acting (`ReAct`) loop.
- **Conversational Memory:** The agent remembers previous context, allowing you to ask follow-up questions (e.g., *"What about in London?"*).
- **Environment Isolation:** The Server and the Agent safely manage their own `.env` files and dependencies.

---

## 🛠️ Prerequisites

- **Node.js** (v18 or higher)
- **TypeScript**
- **Free API Keys** (You can get these for free from their respective websites):
  - **Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/)
  - **OpenWeather API Key**: Get one from [OpenWeatherMap](https://openweathermap.org/api)

---

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/proloypaul/MCP-Agent-Playground.git
   cd MCP-Agent-Playground
   ```

2. **Setup the MCP Server**
   ```bash
   cd mcp-server
   npm install
   
   # Create and configure the environment file
   cp .env.example .env
   # Edit .env and add: OPENWEATHER_API_KEY=your_key_here
   
   # Build the server
   npm run build
   ```

3. **Setup the LangChain Agent**
   ```bash
   cd ../agent-langchain
   npm install
   
   # Create and configure the environment file
   cp .env.example .env
   # Edit .env and add: GEMINI_API_KEY=your_key_here
   
   # Build the agent
   npm run build
   ```

---

## 💻 Usage

### Starting the Conversational Agent
The primary way to use this project is through the interactive Agent CLI. 

1. Ensure both projects are built (`npm run build`).
2. Run the agent:
   ```bash
   cd agent-langchain
   npm run start
   ```

**Example Interaction:**
```text
=================================================
   MCP Weather Agent — LangChain Version       
=================================================
System Ready! Type 'exit' to quit.

You: What is the weather in Dhaka right now?
[LangChain Agent]: Invoking ReAct agent...
[LangChain Tool]: Calling MCP get_weather for "Dhaka"...
[LangChain Tool]: MCP result received.
Agent: The current weather in Dhaka is 31°C with clear skies.

You: And what about London?
[LangChain Agent]: Invoking ReAct agent...
[LangChain Tool]: Calling MCP get_weather for "London"...
Agent: In London, it is currently 14°C and raining.
```

---

## 📁 Project Structure

```text
MCP-Agent-Playground/
│
├── mcp-server/                 # The Independent Tool Provider
│   ├── src/
│   │   ├── index.ts            # MCP Server initialization & Stdio transport
│   │   ├── weather.ts          # OpenWeather API integration logic
│   │   └── config.ts           # Env loading (Absolute path resolution)
│   └── package.json
│
└── agent-langchain/            # The AI Orchestrator (Client)
    ├── src/
    │   ├── index.ts            # Interactive CLI (readline)
    │   ├── langchain-agent.ts  # LangGraph ReAct agent & memory setup
    │   ├── mcp-client.ts       # MCP Client connection logic
    │   └── config.ts           # Env loading
    └── package.json
```

## 🔮 Future Roadmap / Extensibility

Currently, the `mcp-server` only implements the OpenWeather API (`get_weather` tool). However, thanks to the standardized **Model Context Protocol**, this architecture is highly extensible! 

In the future, we plan to improve the Agent by integrating more tools into the MCP Server, such as:
- **Web Search Tools** (to answer general knowledge questions)
- **Database Query Tools** (to fetch internal user data)
- **File System Tools** (to read and analyze local files)

Because the Agent dynamically discovers tools at runtime, adding a new tool to the `mcp-server` will instantly allow the LangChain Agent to answer entirely new categories of questions without rewriting the orchestration logic!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/proloypaul/MCP-Agent-Playground/issues).

---

## 📝 License

This project is licensed under the **MIT License**. You are free to use, modify, and distribute this project as you see fit.
