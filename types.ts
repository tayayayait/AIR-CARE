
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GridCoordinates {
  nx: number;
  ny: number;
}

export interface LocationSelection {
  city?: string | null;
  coordinates?: Coordinates | null;
}

export interface RawAirData {
  locationName: string;
  pm10: number;
  pm25: number;
  humidity: number;
}

export interface SignalData {
  isMaskOn: boolean;
  isVentilateOn: boolean;
  isHumidifyOn: boolean;
}

export type PrecipitationTypeCode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const PRECIPITATION_TYPE_LABELS: Record<PrecipitationTypeCode, string> = {
  0: '없음',
  1: '비',
  2: '비/눈',
  3: '눈',
  4: '소나기',
  5: '빗방울',
  6: '빗방울/눈날림',
  7: '눈날림',
};

export type SkyConditionCode = 1 | 3 | 4;

export const SKY_CONDITION_LABELS: Record<SkyConditionCode, string> = {
  1: '맑음',
  3: '구름 많음',
  4: '흐림',
};

export interface ForecastRow {
  fcstDate: string;
  fcstTime: string;
  temperature: number;
  precipitationProbability: number;
  precipitationType: PrecipitationTypeCode;
  skyCondition: SkyConditionCode;
}
