import os
import asyncio
import json
import time
from typing import Dict, Any, Tuple, Optional, AsyncGenerator
import httpx

from config import (
    GEMINI_API_KEY,
    GEMINI_BASE_URL,
    DEFAULT_MODEL,
    SPIDERMAN_SYSTEM_PROMPT,
    BASE_SYSTEM_PROMPT
)


class GeminiServiceError(Exception):
    def __init__(self, message: str, status_code: int = 503):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class GeminiClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or GEMINI_API_KEY
        self._client: Optional[httpx.AsyncClient] = None

    def _get_client(self, timeout: float = 60.0) -> httpx.AsyncClient:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if self._client is None or self._client.is_closed or (hasattr(self, "_loop") and self._loop is not None and loop is not None and self._loop != loop):
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(timeout, connect=5.0),
                limits=httpx.Limits(max_keepalive_connections=10, max_connections=20)
            )
            self._loop = loop

        return self._client

    async def aclose(self):
        if self._client is not None and not self._client.is_closed:
            await self._client.aclose()

    def prepare_payload(self, model_key: str, prompt: str, history: Optional[list] = None) -> Dict[str, Any]:
        contents = []
        if history:
            for item in history[-6:]:
                role = item.get("role", "user") if isinstance(item, dict) else getattr(item, "role", "user")
                content = item.get("content", "") if isinstance(item, dict) else getattr(item, "content", "")
                if content:
                    gemini_role = "model" if role in ("assistant", "model") else "user"
                    if contents and contents[-1]["role"] == gemini_role:
                        contents[-1]["parts"][0]["text"] += f"\n{content}"
                    else:
                        contents.append({"role": gemini_role, "parts": [{"text": content}]})

        if contents and contents[0]["role"] == "model":
            contents.pop(0)

        if contents and contents[-1]["role"] == "user":
            contents[-1]["parts"][0]["text"] += f"\n{prompt}"
        else:
            contents.append({"role": "user", "parts": [{"text": prompt}]})

        system_prompt = SPIDERMAN_SYSTEM_PROMPT if model_key == "spiderman" else BASE_SYSTEM_PROMPT

        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.9
            }
        }
        return payload

    async def check_health(self) -> Tuple[bool, Dict[str, bool]]:
        models_available = {"spiderman": False, "base": False}
        if not self.api_key:
            return False, models_available
        try:
            client = self._get_client(timeout=5.0)
            res = await client.get(f"{GEMINI_BASE_URL}/models?key={self.api_key}")
            if res.status_code == 200:
                models_available["spiderman"] = True
                models_available["base"] = True
                return True, models_available
            return False, models_available
        except Exception:
            return False, models_available

    async def generate_single(self, model_key: str, prompt: str, history: Optional[list] = None, timeout: float = 60.0) -> Tuple[str, int]:
        if not self.api_key:
            raise GeminiServiceError("Gemini API key is not configured.", status_code=503)

        payload = self.prepare_payload(model_key, prompt, history=history)
        url = f"{GEMINI_BASE_URL}/models/{DEFAULT_MODEL}:generateContent?key={self.api_key}"

        start_time = time.perf_counter()
        try:
            client = self._get_client(timeout=timeout)
            res = await client.post(url, json=payload)
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)

            if res.status_code in (401, 403):
                try:
                    err_json = res.json()
                    err_msg = err_json.get("error", {}).get("message", "Invalid Gemini API key or unauthorized request.")
                except Exception:
                    err_msg = "Invalid Gemini API key or unauthorized request."
                raise GeminiServiceError(f"Gemini API Error ({res.status_code}): {err_msg}", status_code=503)
            if res.status_code != 200:
                raise GeminiServiceError(f"Gemini API returned status {res.status_code}: {res.text}", status_code=503)

            data = res.json()
            try:
                raw_response = data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError):
                raw_response = "No response text generated."

            return raw_response, elapsed_ms
        except httpx.ConnectError:
            raise GeminiServiceError("Gemini API service is unreachable.", status_code=503)
        except httpx.TimeoutException:
            raise GeminiServiceError("Model generation timed out (>60s).", status_code=504)

    async def generate_compare(self, prompt: str, history: Optional[list] = None, timeout: float = 60.0) -> Dict[str, Any]:
        try:
            tuned_task = self.generate_single("spiderman", prompt, history=history, timeout=timeout)
            base_task = self.generate_single("base", prompt, history=history, timeout=timeout)

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
        except GeminiServiceError:
            raise
        except Exception as e:
            raise GeminiServiceError(f"Comparison generation failed: {str(e)}", status_code=500)

    async def stream_single(self, model_key: str, prompt: str, history: Optional[list] = None, timeout: float = 60.0) -> AsyncGenerator[str, None]:
        if not self.api_key:
            yield f"data: {json.dumps({'error': 'Gemini API key is not configured.'})}\n\n"
            return

        payload = self.prepare_payload(model_key, prompt, history=history)
        url = f"{GEMINI_BASE_URL}/models/{DEFAULT_MODEL}:streamGenerateContent?alt=sse&key={self.api_key}"

        try:
            client = self._get_client(timeout=timeout)
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code != 200:
                    try:
                        err_bytes = await response.aread()
                        err_json = json.loads(err_bytes.decode('utf-8'))
                        err_msg = err_json.get("error", {}).get("message", f"Gemini API returned status {response.status_code}")
                    except Exception:
                        err_msg = f"Gemini API returned status {response.status_code}"
                    yield f"data: {json.dumps({'error': err_msg})}\n\n"
                    return

                async for line in response.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    json_str = line[6:].strip()
                    if not json_str:
                        continue
                    try:
                        chunk = json.loads(json_str)
                        candidates = chunk.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                token = parts[0]["text"]
                                yield f"data: {json.dumps({'token': token, 'done': False})}\n\n"
                    except json.JSONDecodeError:
                        continue

                yield f"data: {json.dumps({'token': '', 'done': True})}\n\n"

        except httpx.ConnectError:
            yield f"data: {json.dumps({'error': 'Gemini API service is unreachable.'})}\n\n"
        except httpx.TimeoutException:
            yield f"data: {json.dumps({'error': 'Generation timed out (>60s).'})}\n\n"
