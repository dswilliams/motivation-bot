export const LLM_PROVIDERS = {
  openai: {
    name: "OpenAI",
    endpoint: "https://api.openai.com/v1/chat/completions",
    apiKeyLabel: "OpenAI API Key",
    headers: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  },
  mistral: {
    name: "Mistral",
    endpoint: "https://api.mistral.ai/v1/chat/completions",
    apiKeyLabel: "Mistral API Key",
    headers: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  },
  perplexity: {
    name: "Perplexity",
    endpoint: "https://api.perplexity.ai/chat/completions",
    apiKeyLabel: "Perplexity API Key",
    headers: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  },
  huggingface: {
    name: "Hugging Face",
    endpoint: "https://api-inference.huggingface.co/models",
    apiKeyLabel: "Hugging Face API Key",
    headers: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  },
  gemini: {
    name: "Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    apiKeyLabel: "Gemini API Key",
    headers: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  },
}; 