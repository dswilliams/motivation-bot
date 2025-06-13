import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { LLM_PROVIDERS } from "../utils/llmProviders";

// Add index signature for dynamic access
const PROVIDERS: { [key: string]: any } = LLM_PROVIDERS;

interface MotivationFormProps {
  provider: string;
  apiKey: string;
  localMode: boolean;
}

export default function MotivationForm({ provider, apiKey, localMode }: MotivationFormProps) {
  const [feeling, setFeeling] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOutput, setShowOutput] = useState(false);

  const getMotivation = async (feeling: string) => {
    setLoading(true);
    setOutput("");
    setError("");
    setShowOutput(false);

    // Compose prompt
    const prompt = `The user is feeling: "${feeling}". Respond with a motivational message and 2-3 actionable steps they can take today. If the user expresses positive feelings, celebrate and include a fun analogy or a fun fact about this day in history. Limit your response to 500 words or less.`;

    // Prepare request for Netlify Function
    const endpoint = localMode ? "http://localhost:3001/api/get_motivation" : "/.netlify/functions/get_motivation";
    const currentProvider = PROVIDERS[provider];
    const headers = {
      "Content-Type": "application/json",
      ...currentProvider.headers(apiKey), // Add API key to headers
    };
    let body: any = {};

    if (provider === "openai" || provider === "mistral") {
      body = {
        model: "gpt-3.5-turbo", // or appropriate model for provider
        messages: [
          { role: "system", content: "You are a motivational coach and science communicator." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500, // ~500 words
        temperature: 0.7,
      };
    } else if (provider === "perplexity") {
      body = {
        model: "sonar",
        messages: [
          { role: "system", content: "You are a motivational coach and science communicator." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      };
    } else if (provider === "huggingface") {
      body = {
        inputs: prompt,
        parameters: { max_new_tokens: 1500, temperature: 0.7 },
      };
    } else if (provider === "gemini") {
      body = {
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: prompt, provider: provider, api_key: apiKey }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      let text = data.text || "No response."; // Netlify Function returns { text: "..." }
      setOutput(text);
      setTimeout(() => setShowOutput(true), 100); // Animate reveal
    } catch (e: any) {
      setError(e.message || "Failed to fetch motivational message.");
      setShowOutput(true);
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (feeling.trim()) {
      getMotivation(feeling);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow p-8 w-full max-w-3xl mx-auto mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          <div className="flex flex-col gap-2">
            <label htmlFor="feeling-textarea" className="font-bold text-gray-800 text-base mb-1">How are you feeling today?</label>
            <textarea
              id="feeling-textarea"
              className="block w-full !px-8 !py-2 border-2 border-gray-500 rounded focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-base resize-none min-h-[80px] placeholder:text-gray-400"
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="Type your feelings here..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition text-base focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
            disabled={loading}
          >
            {loading ? "Thinking..." : "Get Motivation"}
          </button>
        </form>
      </div>
      {showOutput && (
        <div className="bg-blue-50 rounded-xl shadow p-8 w-full max-w-2xl mx-auto mt-8">
          <div className="w-full">
            {error && <div className="text-red-600 font-semibold text-lg mb-2">{error}</div>}
            {output && (
              <div className="prose max-w-none text-blue-900 text-xl leading-relaxed">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
