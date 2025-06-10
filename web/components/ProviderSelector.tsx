import { useState } from "react";
import { LLM_PROVIDERS } from "../utils/llmProviders";

interface ProviderConfig {
  name: string;
  endpoint: string;
  apiKeyLabel: string;
  headers: (apiKey: string) => Record<string, string>;
}

interface ProviderSelectorProps {
  onProviderChange: (provider: string) => void;
}

// Add index signature for dynamic access
const PROVIDERS: { [key: string]: ProviderConfig } = LLM_PROVIDERS;

export default function ProviderSelector({ onProviderChange }: ProviderSelectorProps) {
  const [provider, setProvider] = useState("openai");

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProvider(e.target.value);
    onProviderChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md w-full max-w-xl mx-auto mt-6">
      <label className="font-semibold text-gray-700">
        LLM Provider:
        <select
          className="block w-full mt-1 p-2 border border-gray-300 rounded"
          value={provider}
          onChange={handleProviderChange}
        >
          {Object.entries(PROVIDERS).map(([key, { name }]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
