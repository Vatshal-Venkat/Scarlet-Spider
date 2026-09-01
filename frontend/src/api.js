const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return {
      ok: false,
      status: 503,
      data: {
        status: 'down',
        gemini_reachable: false,
        ollama_reachable: false,
        models_available: { spiderman: false, base: false }
      }
    };
  }
}

export async function fetchMetrics() {
  try {
    const res = await fetch(`${API_BASE}/api/metrics`);
    if (!res.ok) throw new Error('Failed to load metrics');
    return await res.json();
  } catch (err) {
    console.error('Error fetching metrics:', err);
    return [];
  }
}

export async function sendChat({ message, model = 'spiderman', compare = false, history = [], onChunk }) {
  // If compare mode is enabled, we use standard JSON POST
  if (compare) {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, model, compare: true, history })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Unknown server error' }));
      throw new Error(errData.detail || `Server error ${res.status}`);
    }
    return await res.json();
  }

  // Single-model streaming response via Server-Sent Events (SSE)
  const res = await fetch(`${API_BASE}/api/chat?stream=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify({ message, model, compare: false, history })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Unknown server error' }));
    throw new Error(errData.detail || `Server error ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Hold onto partial line until next chunk arrives
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.token !== undefined) {
            fullText += parsed.token;
            if (onChunk) onChunk(fullText);
          }
        } catch (e) {
          if (e.message && !e.message.includes('JSON')) {
            throw e;
          }
        }
      }
    }
  }

  if (buffer.trim().startsWith('data: ')) {
    const jsonStr = buffer.trim().slice(6).trim();
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.token) {
          fullText += parsed.token;
          if (onChunk) onChunk(fullText);
        }
      } catch (e) {}
    }
  }

  return {
    tuned: model === 'spiderman' ? fullText : null,
    base: model === 'base' ? fullText : null,
    latency_ms: {
      tuned: model === 'spiderman' ? null : null,
      base: model === 'base' ? null : null
    }
  };
}
