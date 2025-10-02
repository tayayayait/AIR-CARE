import type { RawAirData } from '../types';

type AirQualityItem = {
  stationName?: string;
  pm10Value?: string;
  pm25Value?: string;
  humidity?: string;
};

type AirQualityResponse = {
  response?: {
    header?: {
      resultCode?: string;
      resultMsg?: string;
    };
    body?: {
      items?: AirQualityItem[];
    };
  };
};

const SERVICE_ENDPOINT =
  'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty';

const SIDO_KEYWORDS: Array<{ pattern: RegExp; value: string }> = [
  { pattern: /(서울|서울특별시)/, value: '서울' },
  { pattern: /(부산|부산광역시)/, value: '부산' },
  { pattern: /(대구|대구광역시)/, value: '대구' },
  { pattern: /(인천|인천광역시)/, value: '인천' },
  { pattern: /(광주|광주광역시)/, value: '광주' },
  { pattern: /(대전|대전광역시)/, value: '대전' },
  { pattern: /(울산|울산광역시)/, value: '울산' },
  { pattern: /(세종|세종특별자치시)/, value: '세종' },
  { pattern: /(경기|경기도)/, value: '경기' },
  { pattern: /(강원|강원도)/, value: '강원' },
  { pattern: /(충북|충청북도)/, value: '충북' },
  { pattern: /(충남|충청남도)/, value: '충남' },
  { pattern: /(전북|전라북도)/, value: '전북' },
  { pattern: /(전남|전라남도)/, value: '전남' },
  { pattern: /(경북|경상북도)/, value: '경북' },
  { pattern: /(경남|경상남도)/, value: '경남' },
  { pattern: /(제주|제주특별자치도|제주도)/, value: '제주' },
  { pattern: /(전국|대한민국)/, value: '서울' },
];

const normalizeLocation = (location: string): string => location.replace(/[\s,·]/g, '');

const resolveSidoName = (location: string): string => {
  const trimmed = location.trim();
  for (const { pattern, value } of SIDO_KEYWORDS) {
    if (pattern.test(trimmed)) {
      return value;
    }
  }

  const tokens = trimmed
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  for (const token of tokens) {
    for (const { pattern, value } of SIDO_KEYWORDS) {
      if (pattern.test(token)) {
        return value;
      }
    }
  }

  throw new Error(`지원하지 않는 위치입니다: ${location}`);
};

const parseNumericValue = (value?: string): number | null => {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized || normalized === '-' || normalized === 'NA') {
    return null;
  }
  const result = Number(normalized);
  return Number.isFinite(result) ? result : null;
};

const selectBestItem = (items: AirQualityItem[], location: string): AirQualityItem => {
  const normalizedLocation = normalizeLocation(location);

  const candidates = items.filter((item) => {
    const pm10 = parseNumericValue(item.pm10Value);
    const pm25 = parseNumericValue(item.pm25Value);
    const humidity = parseNumericValue(item.humidity);
    return pm10 !== null && pm25 !== null && humidity !== null;
  });

  const preferred = candidates.find((item) => {
    const stationName = item.stationName ? normalizeLocation(item.stationName) : '';
    return stationName !== '' && normalizedLocation.includes(stationName);
  });

  if (preferred) {
    return preferred;
  }

  if (candidates.length > 0) {
    return candidates[0];
  }

  if (items.length > 0) {
    return items[0];
  }

  throw new Error('API 응답에 대기질 정보가 없습니다.');
};

export const getAirQualityData = async (location: string): Promise<RawAirData> => {
  const rawServiceKey =
    process.env.AIRKOREA_SERVICE_KEY ??
    process.env.KMA_SERVICE_KEY ??
    import.meta.env.VITE_AIRKOREA_SERVICE_KEY ??
    import.meta.env.VITE_KMA_SERVICE_KEY;

  if (!rawServiceKey) {
    throw new Error('대기질 API 서비스 키가 설정되지 않았습니다.');
  }

  let serviceKey = rawServiceKey;
  try {
    serviceKey = decodeURIComponent(rawServiceKey);
  } catch {
    serviceKey = rawServiceKey;
  }

  const sidoName = resolveSidoName(location);

  const params = new URLSearchParams({
    serviceKey,
    returnType: 'json',
    numOfRows: '100',
    pageNo: '1',
    sidoName,
    ver: '1.4',
  });

  const response = await fetch(`${SERVICE_ENDPOINT}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`대기질 API 요청에 실패했습니다: ${response.status}`);
  }

  const payload = (await response.json()) as AirQualityResponse;
  const resultCode = payload.response?.header?.resultCode;
  if (resultCode && resultCode !== '00') {
    const message = payload.response?.header?.resultMsg ?? '원인 미상 오류';
    throw new Error(`대기질 API 오류(${resultCode}): ${message}`);
  }

  const items = payload.response?.body?.items ?? [];
  const item = selectBestItem(items, location);

  const pm10 = parseNumericValue(item.pm10Value);
  const pm25 = parseNumericValue(item.pm25Value);
  const humidity = parseNumericValue(item.humidity);

  if (pm10 === null || pm25 === null || humidity === null) {
    throw new Error('대기질 데이터가 완전하지 않습니다.');
  }

  const locationName = item.stationName ?? `${sidoName} 측정소`;

  return {
    locationName,
    pm10,
    pm25,
    humidity,
  } satisfies RawAirData;
};
