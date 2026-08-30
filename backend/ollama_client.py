import asyncio
import json
import time
from typing import Dict, Any, Tuple, Optional, AsyncGenerator
import httpx

OLLAMA_BASE_URL = "http://localhost:11434"
MODEL_MAP = {
    "spiderman": "spiderman:latest",
    "base": "qwen2.5:1.5b"
}

class OllamaServiceError(Exception):
    def __init__(self, message: str, status_code: int = 503):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class OllamaClient:
    def __init__(self, base_url: str = OLLAMA_BASE_URL):
        self.base_url = base_url

    def get_ollama_model_name(self, model_key: str) -> str:
        return MODEL_MAP.get(model_key, "spiderman:latest")

    def prepare_payload(self, model_key: str, prompt: str, stream: bool = False) -> Dict[str, Any]:
        ollama_model = self.get_ollama_model_name(model_key)
        
        if model_key == "spiderman":
            # For fine-tuned model: use system instruction and prompt continuation to encourage full-paragraph responses
            formatted_prompt = f"User: {prompt}\n\nAssistant: In detail, "
            return {
                "model": ollama_model,
                "system": "You are a Spider-Man lore assistant. Provide a detailed, complete paragraph explaining background, origins, powers, and relationships in full detail.",
                "prompt": formatted_prompt,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "presence_penalty": 0.6,
                    "repeat_penalty": 1.15
                },
                "stream": stream
            }
        else:
            return {
                "model": ollama_model,
                "prompt": prompt,
                "stream": stream
            }

    async def check_health(self) -> Tuple[bool, Dict[str, bool]]:
        models_available = {"spiderman": False, "base": False}
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code != 200:
                    return False, models_available
                data = res.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                models_available["spiderman"] = any("spiderman" in m for m in models)
                models_available["base"] = any("qwen2.5:1.5b" in m or "qwen2.5" in m for m in models)
                return True, models_available
        except Exception:
            return False, models_available

    async def generate_single(self, model_key: str, prompt: str, timeout: float = 60.0) -> Tuple[str, int]:
        ollama_model = self.get_ollama_model_name(model_key)
        payload = self.prepare_payload(model_key, prompt, stream=False)
        
        start_time = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                elapsed_ms = int((time.perf_counter() - start_time) * 1000)

                if res.status_code == 404:
                    raise OllamaServiceError(
                        f"Model '{ollama_model}' not found in Ollama. Please run 'ollama create spiderman -f Modelfile' or 'ollama pull qwen2.5:1.5b'.",
                        status_code=503
                    )
                if res.status_code != 200:
                    raise OllamaServiceError(f"Ollama returned HTTP status {res.status_code}", status_code=503)

                data = res.json()
                raw_response = data.get("response", "")
                if model_key == "spiderman" and not raw_response.startswith("In detail"):
                    raw_response = "In detail, " + raw_response
                return raw_response, elapsed_ms
        except httpx.ConnectError:
            raise OllamaServiceError(
                "Ollama service is unreachable at http://localhost:11434. Please ensure Ollama is running.",
                status_code=503
            )
        except httpx.TimeoutException:
            raise OllamaServiceError("Model generation timed out (>60s).", status_code=504)

    async def generate_compare(self, prompt: str, timeout: float = 60.0) -> Dict[str, Any]:
        try:
            tuned_task = self.generate_single("spiderman", prompt, timeout=timeout)
            base_task = self.generate_single("base", prompt, timeout=timeout)

            (tuned_resp, tuned_ms), (base_resp, base_ms) = await asyncio.gather(
                tuned_task, base_task, return_exceptions=False
            )

            return {
                "tuned": tuned_resp,
                "base": base_resp,
                "latency_ms": {
                    "tuned": tuned_ms,
                    "base": base_ms
                }
            }
        except OllamaServiceError:
            raise
        except Exception as e:
            raise OllamaServiceError(f"Comparison generation failed: {str(e)}", status_code=500)

    async def stream_single(self, model_key: str, prompt: str, timeout: float = 60.0) -> AsyncGenerator[str, None]:
        ollama_model = self.get_ollama_model_name(model_key)
        payload = self.prepare_payload(model_key, prompt, stream=True)

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream("POST", f"{self.base_url}/api/generate", json=payload) as response:
                    if response.status_code != 200:
                        yield f"data: {json.dumps({'error': f'Ollama returned status {response.status_code}'})}\n\n"
                        return

                    if model_key == "spiderman":
                        yield f"data: {json.dumps({'token': 'In detail, ', 'done': False})}\n\n"

                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            chunk = json.loads(line)
                            token = chunk.get("response", "")
                            is_done = chunk.get("done", False)
                            payload_data = {"token": token, "done": is_done}
                            yield f"data: {json.dumps(payload_data)}\n\n"
                            if is_done:
                                break
                        except json.JSONDecodeError:
                            continue
        except httpx.ConnectError:
            yield f"data: {json.dumps({'error': 'Ollama service is unreachable.'})}\n\n"
        except httpx.TimeoutException:
            yield f"data: {json.dumps({'error': 'Generation timed out (>60s).'})}\n\n"
