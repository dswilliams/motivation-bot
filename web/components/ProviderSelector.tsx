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
  onApiKeyChange: (apiKey: string) => void;
}

// Add index signature for dynamic access
const PROVIDERS: { [key: string]: ProviderConfig } = LLM_PROVIDERS;

export default function ProviderSelector({ onProviderChange, onApiKeyChange }: ProviderSelectorProps) {
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProvider(e.target.value);
    onProviderChange(e.target.value);
    setApiKey(""); // Clear API key when provider changes
    onApiKeyChange("");
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    onApiKeyChange(e.target.value);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow p-8 w-full max-w-3xl mx-auto mb-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="provider-select" className="font-bold text-gray-800 text-base mb-1">LLM Provider</label>
          <select
            id="provider-select"
            className="block w-full !px-8 !py-2 border-2 border-gray-500 rounded focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-base"
            value={provider}
            onChange={handleProviderChange}
          >
            {Object.entries(PROVIDERS).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
        {provider && PROVIDERS[provider]?.apiKeyLabel && (
          <div className="flex flex-col gap-2">
            <label htmlFor="api-key-input" className="font-bold text-gray-800 text-base mb-1">{PROVIDERS[provider].apiKeyLabel}</label>
            <input
              id="api-key-input"
              type="password"
              className="block w-full !px-8 !py-2 border-2 border-gray-500 rounded focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-base"
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder={`Enter your ${PROVIDERS[provider].apiKeyLabel}`}
              autoComplete="off"
            />
          </div>
        )}
      </div>
    </div>
  );
}
