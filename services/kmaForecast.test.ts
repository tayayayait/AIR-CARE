import { afterEach, describe, expect, it, vi } from 'vitest';

import { getVillageForecast } from './kmaForecast';

describe('getVillageForecast', () => {
  const originalServiceKey = process.env.KMA_SERVICE_KEY;
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    if (originalServiceKey === undefined) {
      delete process.env.KMA_SERVICE_KEY;
    } else {
      process.env.KMA_SERVICE_KEY = originalServiceKey;
    }

    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      delete (globalThis as { fetch?: typeof fetch }).fetch;
    }

    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('uses decoded service keys when encoded values are provided', async () => {
    process.env.KMA_SERVICE_KEY = 'ABC%2B123';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: {
          body: {
            items: {
              item: [],
            },
          },
        },
      }),
    });

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await getVillageForecast(37.5, 127.0);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestedUrl = fetchMock.mock.calls[0][0] as string;
    expect(requestedUrl).toContain('serviceKey=ABC%2B123');
    expect(requestedUrl).not.toContain('ABC%252B123');
  });

  it('retains the original service key when decoding fails', async () => {
    process.env.KMA_SERVICE_KEY = '%';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: {
          body: {
            items: {
              item: [],
            },
          },
        },
      }),
    });

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(getVillageForecast(37.5, 127.0)).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
