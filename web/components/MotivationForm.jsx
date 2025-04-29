import { useState } from "react";

interface MotivationFormProps {
  provider: string;
  apiKey: string;
  localMode: boolean;
}

export default function MotivationForm({ provider, apiKey, localMode }: MotivationFormProps) {
  const [feeling, setFeeling] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  // Placeholder for LLM call
  const getMotivation = async (feeling: string) => {
    setLoading(true);
    setOutput("");
    // TODO: Implement LLM API call logic here
    setTimeout(() => {
      setOutput("[Motivational message and steps will appear here]");
      setLoading(false);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (feeling.trim()) {
      getMotivation(feeling);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
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
      <div className="min-h-[80px] text-gray-800 text-lg">
        {output && <div>{output}</div>}
      </div>
    </div>
  );
} 