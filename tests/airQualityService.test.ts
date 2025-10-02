import assert from 'node:assert/strict';
import { getAirQualityData } from '../services/airQualityService';

type FetchCall = { url: string };

const stubResponsePayload = {
  response: {
    header: { resultCode: '00' },
    body: {
      items: [
        {
          stationName: '서울',
          pm10Value: '12',
          pm25Value: '8',
          humidity: '55',
        },
      ],
    },
  },
};

const calls: FetchCall[] = [];

const originalFetch = globalThis.fetch;

globalThis.fetch = (async (input: RequestInfo | URL) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  calls.push({ url });
  return new Response(JSON.stringify(stubResponsePayload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}) as typeof fetch;

async function run(): Promise<void> {
  const encodedKey = encodeURIComponent('encoded-service-key');
  process.env.AIRKOREA_SERVICE_KEY = encodedKey;

  const result = await getAirQualityData('서울특별시 중구');

  assert.equal(result.pm10, 12);
  assert.equal(result.pm25, 8);
  assert.equal(result.humidity, 55);
  assert.equal(result.locationName, '서울');

  assert.equal(calls.length, 1, 'fetch should be called exactly once');
  const requestUrl = new URL(calls[0]?.url ?? '');
  assert.equal(requestUrl.searchParams.get('serviceKey'), 'encoded-service-key');

  console.log('Encoded service key test passed.');
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    }
    delete process.env.AIRKOREA_SERVICE_KEY;
  });
