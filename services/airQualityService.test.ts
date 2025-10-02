import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAirQualityData } from './airQualityService';

describe('getAirQualityData', () => {
  const originalAirKey = process.env.AIRKOREA_SERVICE_KEY;
  const originalKmaKey = process.env.KMA_SERVICE_KEY;
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    if (originalAirKey === undefined) {
      delete process.env.AIRKOREA_SERVICE_KEY;
    } else {
      process.env.AIRKOREA_SERVICE_KEY = originalAirKey;
    }

    if (originalKmaKey === undefined) {
      delete process.env.KMA_SERVICE_KEY;
    } else {
      process.env.KMA_SERVICE_KEY = originalKmaKey;
    }

    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      delete (globalThis as { fetch?: typeof fetch }).fetch;
    }

    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('handles percent-encoded service keys without double encoding', async () => {
    process.env.AIRKOREA_SERVICE_KEY = 'ABC%2B123';
    delete process.env.KMA_SERVICE_KEY;

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: {
          header: { resultCode: '00' },
          body: {
            items: [
              {
                stationName: '서울',
                pm10Value: '10',
                pm25Value: '5',
                humidity: '40',
              },
            ],
          },
        },
      }),
    });

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await getAirQualityData('서울');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestedUrl = fetchMock.mock.calls[0][0] as string;
    expect(requestedUrl).toContain('serviceKey=ABC%2B123');
    expect(requestedUrl).not.toContain('ABC%252B123');
    expect(result).toEqual({
      locationName: '서울',
      pm10: 10,
      pm25: 5,
      humidity: 40,
    });
  });

  it('falls back to the original service key when decoding fails', async () => {
    process.env.AIRKOREA_SERVICE_KEY = '%';
    delete process.env.KMA_SERVICE_KEY;

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: {
          header: { resultCode: '00' },
          body: {
            items: [
              {
                stationName: '서울',
                pm10Value: '11',
                pm25Value: '6',
                humidity: '41',
              },
            ],
          },
        },
      }),
    });

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(getAirQualityData('서울')).resolves.toEqual({
      locationName: '서울',
      pm10: 11,
      pm25: 6,
      humidity: 41,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
