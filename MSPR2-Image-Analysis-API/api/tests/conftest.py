import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("OLLAMA_MODELS", "['llama3.2-vision', 'gemma3']")
os.environ.setdefault("OLLAMA_SELECTED_MODEL", "0")
os.environ.setdefault("OLLAMA_HOST", "http://localhost")
os.environ.setdefault("OLLAMA_PORT", "11434")

os.environ.setdefault("LARAVEL_HOST", "http://localhost")
os.environ.setdefault("LARAVEL_PORT", "8080")
os.environ.setdefault("LARAVEL_ME_URL", "/api/me")
