
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
