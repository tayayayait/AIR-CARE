
export interface Coordinates {
  latitude: number;
  longitude: number;
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
