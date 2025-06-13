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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-100 flex flex-col items-center py-10 px-2">
      <h1 className="text-3xl font-extrabold text-blue-900 mb-2 tracking-tight drop-shadow-lg text-center">Motivation Bot</h1>
      <p className="text-base text-blue-800 mb-4 max-w-2xl text-center font-medium">
        How are you feeling today? Get a motivational boost, actionable steps, or a fun fact to celebrate your mood. Powered by science and AI.
      </p>
      <div className="w-full max-w-3xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
          <ProviderSelector onProviderChange={handleProviderChange} onApiKeyChange={handleApiKeyChange} />
        </div>
      </div>
      <div className="w-full max-w-3xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
          <MotivationForm provider={provider} apiKey={apiKey} localMode={localMode} />
        </div>
      </div>
      {/* Output/result card will be rendered by MotivationForm if present */}
      <footer className="mt-12 text-base text-blue-700 opacity-80 text-center">&copy; {new Date().getFullYear()} Motivation Bot</footer>
    </div>
  );
}
