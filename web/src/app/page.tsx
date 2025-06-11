"use client";
import ProviderSelector from "../../components/ProviderSelector";
import MotivationForm from "../../components/MotivationForm";
import { useState } from "react";

export default function Home() {
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");

  // Detect local mode (dev) vs. prod (GitHub Pages)
  const localMode = typeof window !== "undefined" && window.location.hostname === "localhost";

  const handleProviderChange = (prov: string) => {
    setProvider(prov);
  };

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-100 flex flex-col items-center justify-center py-10">
      <h1 className="text-3xl font-bold text-blue-900 mb-2 tracking-tight">Motivation Bot</h1>
      <p className="text-lg text-blue-800 mb-6 max-w-xl text-center">
        How are you feeling today? Get a motivational boost, actionable steps, or a fun fact to celebrate your mood. Powered by science and AI.
      </p>
      <ProviderSelector onProviderChange={handleProviderChange} onApiKeyChange={handleApiKeyChange} />
      <MotivationForm provider={provider} apiKey={apiKey} localMode={localMode} />
      <footer className="mt-12 text-sm text-blue-700 opacity-70">&copy; {new Date().getFullYear()} Motivation Bot</footer>
    </div>
  );
}
