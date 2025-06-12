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
    const endpoint = "http://localhost:5000/api/get_motivation"; // Direct call to Flask server for debugging
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
        body: JSON.stringify({ text: prompt, provider: provider, apiKey: apiKey }),
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
      <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-md w-full max-w-xl mx-auto mt-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="font-semibold text-gray-700">
            How are you feeling today?
            <textarea
              className="block w-full mt-1 p-2 border border-gray-300 rounded resize-none min-h-[60px]"
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="Type your feelings here..."
              required
            />
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Thinking..." : "Get Motivation"}
          </button>
        </form>
      </div>
      {showOutput && (
        <div
          className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto mt-6 p-8 bg-gradient-to-br from-blue-100 via-white to-cyan-100 rounded-2xl shadow-xl opacity-0 animate-bounce-in"
          style={{ animation: 'bounceIn 0.9s cubic-bezier(.68,-0.55,.27,1.55) forwards' }}
        >
          <div className="w-full">
            {error && <div className="text-red-600 font-semibold">{error}</div>}
            {output && (
              <div className="prose max-w-none text-gray-900 text-xl leading-relaxed">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.8) translateY(40px); }
          60% { opacity: 1; transform: scale(1.05) translateY(-10px); }
          80% { transform: scale(0.97) translateY(2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
