import type { WebcupApiResponse } from './types';

const DEFAULT_API_URL = 'https://24h.webcup.fr/wp-json/webcup/v1/requests';

export class WebcupApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'WebcupApiError';
  }
}

export function getWebcupApiUrl(): string {
  return process.env.WEBCUP_API_URL?.trim() || DEFAULT_API_URL;
}

function getWebcupApiKey(): string {
  const key = process.env.WEBCUP_API_KEY?.trim();

  if (!key) {
    throw new WebcupApiError('WEBCUP_API_KEY is not configured');
  }

  return key;
}

/**
 * Fetch the currently visible demands from the Terra Nova API.
 *
 * Server-only: the key is sent as a header so it never appears in a URL or in
 * client code. Always `no-store` because waves are revealed over time.
 */
export async function getWebcupApiResponse(): Promise<WebcupApiResponse> {
  const response = await fetch(getWebcupApiUrl(), {
    headers: { 'X-Webcup-Api-Key': getWebcupApiKey() },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new WebcupApiError(
      `Webcup API responded with ${response.status}`,
      response.status,
    );
  }

  const data = (await response.json()) as WebcupApiResponse;

  if (!data || !Array.isArray(data.requests)) {
    throw new WebcupApiError('Unexpected Webcup API payload');
  }

  return data;
}
