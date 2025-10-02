import type { ForecastRow, GridCoordinates, PrecipitationTypeCode, SkyConditionCode } from '../types';

const DEGREE_TO_RAD = Math.PI / 180;
const EARTH_RADIUS = 6371.00877; // km
const GRID_SPACING = 5.0; // km
const STANDARD_PARALLEL_1 = 30.0;
const STANDARD_PARALLEL_2 = 60.0;
const REFERENCE_LONGITUDE = 126.0;
const REFERENCE_LATITUDE = 38.0;
const ORIGIN_X = 43;
const ORIGIN_Y = 136;

const BASE_TIMES = ['0200', '0500', '0800', '1100', '1400', '1700', '2000', '2300'] as const;

export const latLonToGrid = (latitude: number, longitude: number): GridCoordinates => {
  const re = EARTH_RADIUS / GRID_SPACING;
  const slat1 = STANDARD_PARALLEL_1 * DEGREE_TO_RAD;
  const slat2 = STANDARD_PARALLEL_2 * DEGREE_TO_RAD;
  const olon = REFERENCE_LONGITUDE * DEGREE_TO_RAD;
  const olat = REFERENCE_LATITUDE * DEGREE_TO_RAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + latitude * DEGREE_TO_RAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = longitude * DEGREE_TO_RAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const nx = Math.floor(ra * Math.sin(theta) + ORIGIN_X + 0.5);
  const ny = Math.floor(ro - ra * Math.cos(theta) + ORIGIN_Y + 0.5);

  return { nx, ny };
};

const padNumber = (value: number) => value.toString().padStart(2, '0');

export const latestBaseDateTime = (now: Date = new Date()) => {
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const kst = new Date(utc + 9 * 60 * 60 * 1000);
  const year = kst.getFullYear();
  const month = padNumber(kst.getMonth() + 1);
  const day = padNumber(kst.getDate());
  const current = kst.getHours() * 100 + kst.getMinutes();

  let baseDate = `${year}${month}${day}`;
  let baseTime = BASE_TIMES[0];

  for (const time of BASE_TIMES) {
    const baseValue = Number(time);
    if (current >= baseValue) {
      baseTime = time;
    }
  }

  if (current < Number(BASE_TIMES[0])) {
    kst.setDate(kst.getDate() - 1);
    baseDate = `${kst.getFullYear()}${padNumber(kst.getMonth() + 1)}${padNumber(kst.getDate())}`;
    baseTime = BASE_TIMES[BASE_TIMES.length - 1];
  }

  return { baseDate, baseTime } as const;
};

const ensurePrecipitationType = (value: number): PrecipitationTypeCode => {
  const validCodes: PrecipitationTypeCode[] = [0, 1, 2, 3, 4, 5, 6, 7];
  return validCodes.includes(value as PrecipitationTypeCode) ? (value as PrecipitationTypeCode) : 0;
};

const ensureSkyCondition = (value: number): SkyConditionCode => {
  const validCodes: SkyConditionCode[] = [1, 3, 4];
  return validCodes.includes(value as SkyConditionCode) ? (value as SkyConditionCode) : 1;
};

type ForecastCategory = 'TMP' | 'POP' | 'PTY' | 'SKY';

interface KMAApiItem {
  category: ForecastCategory;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
}

interface KMAApiResponse {
  response?: {
    header?: { resultCode?: string };
    body?: {
      items?: { item?: KMAApiItem[] };
    };
  };
}

const SERVICE_ENDPOINT = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';

export const getVillageForecast = async (latitude: number, longitude: number): Promise<ForecastRow[]> => {
  const rawServiceKey = process.env.KMA_SERVICE_KEY ?? import.meta.env.VITE_KMA_SERVICE_KEY;
  if (!rawServiceKey) {
    console.warn('KMA_SERVICE_KEY is not defined. Skipping forecast fetch.');
    return [];
  }

  let serviceKey = rawServiceKey;

  if (rawServiceKey.includes('%')) {
    try {
      serviceKey = decodeURIComponent(rawServiceKey);
    } catch (error) {
      serviceKey = rawServiceKey;
    }
  }

  const { nx, ny } = latLonToGrid(latitude, longitude);
  const { baseDate, baseTime } = latestBaseDateTime();

  const searchParams = new URLSearchParams({
    serviceKey,
    pageNo: '1',
    numOfRows: '200',
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const response = await fetch(`${SERVICE_ENDPOINT}?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch KMA forecast: ${response.status}`);
  }

  const payload = (await response.json()) as KMAApiResponse;
  const items = payload.response?.body?.items?.item ?? [];

  const grouped = new Map<string, Partial<ForecastRow>>();

  for (const item of items) {
    if (!['TMP', 'POP', 'PTY', 'SKY'].includes(item.category)) continue;
    const key = `${item.fcstDate}_${item.fcstTime}`;
    const existing = grouped.get(key) ?? { fcstDate: item.fcstDate, fcstTime: item.fcstTime };

    const value = Number(item.fcstValue);

    switch (item.category) {
      case 'TMP':
        if (!Number.isNaN(value)) {
          existing.temperature = value;
        }
        break;
      case 'POP':
        if (!Number.isNaN(value)) {
          existing.precipitationProbability = value;
        }
        break;
      case 'PTY':
        if (!Number.isNaN(value)) {
          existing.precipitationType = ensurePrecipitationType(value);
        }
        break;
      case 'SKY':
        if (!Number.isNaN(value)) {
          existing.skyCondition = ensureSkyCondition(value);
        }
        break;
      default:
        break;
    }

    grouped.set(key, existing);
  }

  const rows: ForecastRow[] = [];

  for (const entry of grouped.values()) {
    if (
      entry.fcstDate &&
      entry.fcstTime &&
      typeof entry.temperature === 'number' &&
      typeof entry.precipitationProbability === 'number' &&
      typeof entry.precipitationType !== 'undefined' &&
      typeof entry.skyCondition !== 'undefined'
    ) {
      rows.push({
        fcstDate: entry.fcstDate,
        fcstTime: entry.fcstTime,
        temperature: entry.temperature,
        precipitationProbability: entry.precipitationProbability,
        precipitationType: entry.precipitationType,
        skyCondition: entry.skyCondition,
      });
    }
  }

  return rows.sort((a, b) => {
    const dateDiff = a.fcstDate.localeCompare(b.fcstDate);
    if (dateDiff !== 0) return dateDiff;
    return a.fcstTime.localeCompare(b.fcstTime);
  });
};

