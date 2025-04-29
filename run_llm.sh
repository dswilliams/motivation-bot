#!/bin/bash

# Define paths
MODEL_DIR="/Users/Dan/Projects/corpscope"
LLAMA_BIN="$MODEL_DIR/llama.cpp/build/bin/llama-cli"
MODEL_PATH="$MODEL_DIR/mistral-7b-instruct-v0.1.Q4_K_M.gguf"

# Check if model exists
if [ ! -f "$MODEL_PATH" ]; then
    echo "Error: Model file not found at $MODEL_PATH"
    exit 1
fi

# Check if llama-cli exists
if [ ! -f "$LLAMA_BIN" ]; then
    echo "Error: llama-cli not found at $LLAMA_BIN"
    exit 1
fi

# Default prompt if none provided
DEFAULT_PROMPT="Write a short greeting."
PROMPT=${1:-$DEFAULT_PROMPT}

# Run the model
echo "Running Mistral-7B with prompt: $PROMPT"
echo "-----------------------------------"
"$LLAMA_BIN" -m "$MODEL_PATH" -p "$PROMPT"