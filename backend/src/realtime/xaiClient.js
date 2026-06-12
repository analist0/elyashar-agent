const clientSecretsUrl = "https://api.x.ai/v1/realtime/client_secrets";

export function createXaiClient({
  apiKey = process.env.XAI_API_KEY,
  fetchImpl = globalThis.fetch,
} = {}) {
  return {
    async createClientSecret(sessionConfig) {
      if (!apiKey) {
        throw new Error("XAI_API_KEY is not configured");
      }

      const response = await fetchImpl(clientSecretsUrl, {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          session: sessionConfig,
        }),
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(`xAI client secret request failed with status ${response.status}`);
      }

      if (!data.client_secret) {
        throw new Error("xAI response did not include client_secret");
      }

      return sanitizeClientSecret(data);
    },
  };
}

function sanitizeClientSecret(data) {
  const result = {
    client_secret: data.client_secret,
  };

  if (data.expires_at !== undefined) {
    result.expires_at = data.expires_at;
  }

  return result;
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    throw new Error("xAI returned an invalid JSON response");
  }
}
