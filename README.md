# Raw LLM

**Unfiltered, direct access to LLM providers — for research and testing purposes.**

Raw LLM is an open-source research tool that provides unfiltered, direct access to various LLM providers (Mistral, OpenRouter, Together AI, Anthropic, and custom endpoints). It acts as a local proxy that connects your browser directly to LLM APIs without any filtering, moderation, or prompt rewriting on our end.

> ⚠️ **Important:** This tool is designed for **research and educational purposes only**. By using this software, you agree to take full responsibility for your actions and to use it only in compliance with applicable laws and regulations. **Do not use against production systems without authorization.**

---

## Features

- **Unfiltered Access** — Direct connection to LLM providers with no filtering or moderation
- **Multi-Provider Support** — Mistral AI, OpenRouter, Together AI, Anthropic, and custom OpenAI-compatible endpoints
- **Key Rotation** — Automatic failover to backup API keys if rate-limited
- **Persistent Memory** — Local storage of conversation history and extracted context
- **Responsive UI** — Clean dark theme with mobile support
- **Serverless Architecture** — Runs locally as a proxy, no cloud dependencies
- **Research Focused** — Built for AI security testing and educational purposes

---

## Supported Providers

| Provider | Models |
|----------|--------|
| **Mistral AI** | mistral-large-latest, pixtral-large-latest, open-mistral-nemo, codestral-latest |
| **OpenRouter** | google/gemini-2.5-flash, anthropic/claude-3.5-sonnet, deepseek/deepseek-chat, meta-llama/llama-3.3-70b-instruct |
| **Together AI** | meta-llama/Llama-3.3-70B-Instruct-Turbo, deepseek-ai/DeepSeek-V3, Qwen/Qwen2.5-Coder-32B-Instruct |
| **Anthropic** | claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022, claude-3-opus-20240229 |
| **Custom** | Any OpenAI-compatible endpoint (Groq, Cerebras, Ollama, Hugging Face, etc.) |

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/latent-unshackled/raw-llm.git
cd raw-llm

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Configuration

1. Open the application in your browser (`http://localhost:3000`)
2. Accept the disclaimer
3. Navigate to Settings (gear icon in sidebar)
4. Add your API keys for the providers you want to use:
   - Mistral: https://console.mistral.ai/api-keys/
   - OpenRouter: https://openrouter.ai/keys
   - Together AI: https://api.together.ai/settings/api-keys
   - Anthropic: https://console.anthropic.com/account/keys

### Custom Sources

You can add any OpenAI-compatible endpoint as a custom source:
1. Go to Settings → Custom Sources
2. Click "New Custom Source" or select a pre-filled template
3. Enter:
   - Source Name (e.g., "My Groq", "Local Ollama")
   - Base URL (e.g., `https://api.groq.com/openai/v1`)
   - Model names (comma-separated)
   - API Keys (supports multiple backup keys)

---

## Project Structure

```text
raw-llm/
├── server.ts              # Express proxy server with prompt processing
├── src/
│   ├── App.tsx            # Main application component
│   ├── types.ts           # TypeScript type definitions
│   ├── components/
│   │   ├── Disclaimer.tsx # Legal disclaimer popup
│   │   ├── Sidebar.tsx    # Navigation sidebar
│   │   ├── ChatWindow.tsx # Main chat interface
│   │   ├── SettingsPage.tsx # API key and provider settings
│   │   └── MemoryLogsPage.tsx # Conversation memory viewer
│   └── hooks/
│       └── useLocalStorage.ts # Local storage persistence
├── public/
└── package.json
```

---

## How It Works

### Backend (`server.ts`)

The server acts as a proxy between the frontend and LLM providers:
- Receives requests from the frontend with provider, API key, messages, and model
- When `unfilteredMode` is enabled, it applies a research-mode prompt processor
- The prompt processor builds a layered payload with:
  - System override instructions
  - Preset-based injection (developer, roleplay, system, etc.)
  - Smart prefills
  - Optional obfuscation for research testing
- Forwards the request to the chosen provider
- Streams responses back to the frontend in real-time

### Frontend

- React + TypeScript with Tailwind CSS
- Local storage for chats, API keys, and settings
- Responsive design with mobile support
- Streaming responses with live thinking display

---

## Disclaimer

This tool is provided "AS IS" without any warranties of any kind, express or implied. The developers and contributors assume NO LIABILITY for any misuse, damage, or legal consequences arising from the use of this software.

By using this software, you agree that:
- You will use it ONLY for research and educational purposes
- You will NOT use it against production systems without authorization
- You will NOT use it for illegal or malicious purposes
- You take full responsibility for how you use this tool

---

## License

This project is licensed under the MIT License — see the `LICENSE` file for details.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.
