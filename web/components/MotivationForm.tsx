import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { LLM_PROVIDERS } from "../utils/llmProviders";

interface MotivationFormProps {
  provider: string;
  apiKey: string;
  localMode: boolean;
}

function isPositiveFeeling(feeling: string) {
  // Simple check for positive words; can be improved
  const positiveWords = ["good", "great", "happy", "excited", "joy", "love", "awesome", "fantastic", "amazing", "proud", "confident", "positive", "celebrate"];
  return positiveWords.some(word => feeling.toLowerCase().includes(word));
}

async function fetchFunFact(): Promise<string> {
  // Use a public API for 'this day in history' or fallback to a static fact
  try {
    const res = await fetch("https://history.muffinlabs.com/date");
    const data = await res.json();
    if (data && data.data && data.data.Events && data.data.Events.length > 0) {
      const event = data.data.Events[Math.floor(Math.random() * data.data.Events.length)];
      return `Fun fact: On this day in ${event.year}, ${event.text}`;
    }
  } catch (e) {}
  return "Fun fact: Did you know honey never spoils? Archaeologists have found 3000-year-old honey in Egyptian tombs that is still edible!";
}

function preprocessMarkdown(text: string): string {
  // Replace single line breaks between non-empty lines with double line breaks
  return text.replace(/([^\n])\n([^\n])/g, "$1\n\n$2");
}

function getMotivationalVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  // Prefer Google US English
  let voice = voices.find(v => v.name.includes("Google US English"));
  // Fallback to first English voice
  if (!voice) voice = voices.find(v => v.lang.startsWith("en"));
  return voice || null;
}

export default function MotivationForm({ provider, apiKey, localMode }: MotivationFormProps) {
  const [feeling, setFeeling] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);

  // Ensure voices are loaded
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = () => setVoiceReady(true);
      setVoiceReady(true);
    }
  }, []);

  const getMotivation = async (feeling: string) => {
    setLoading(true);
    setOutput("");
    setError("");
    setShowOutput(false);

    // If positive, celebrate and add a fun fact
    if (isPositiveFeeling(feeling)) {
      const funFact = await fetchFunFact();
      setOutput(`🎉 That's wonderful! Let's celebrate your positive mood. ${funFact}`);
      setLoading(false);
      setTimeout(() => setShowOutput(true), 100); // Animate reveal
      return;
    }

    // Compose prompt
    const prompt = `The user is feeling: "${feeling}". Respond with a motivational message and 2-3 actionable steps they can take today. If the user expresses positive feelings, celebrate and include a fun analogy or a fun fact about this day in history. Limit your response to 500 words or less.`;

    // Prepare request for each provider
    const config = (LLM_PROVIDERS as any)[provider];
    const endpoint = config.endpoint;
    const headers = config.headers(apiKey);
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
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      let text = "";
      if (provider === "openai" || provider === "mistral" || provider === "perplexity") {
        text = data.choices?.[0]?.message?.content || "No response.";
      } else if (provider === "huggingface") {
        text = data[0]?.generated_text || "No response.";
      } else if (provider === "gemini") {
        text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
      }
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

  const handleSpeak = () => {
    if (!output) return;
    setSpeaking(true);
    const utterance = new window.SpeechSynthesisUtterance(output);
    const voice = getMotivationalVoice();
    if (voice) utterance.voice = voice;
    utterance.pitch = 1.15;
    utterance.rate = 1.05;
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
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
          {output && (
            <button
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50 font-bold text-lg shadow"
              onClick={handleSpeak}
              disabled={speaking || !voiceReady}
            >
              {speaking ? "Speaking..." : "🔊 Speak"}
            </button>
          )}
          <div className="w-full">
            {error && <div className="text-red-600 font-semibold">{error}</div>}
            {output && (
              <div className="prose max-w-none text-gray-900 text-xl leading-relaxed">
                <ReactMarkdown>{preprocessMarkdown(output)}</ReactMarkdown>
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