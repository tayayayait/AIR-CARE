import { GoogleGenAI, Type } from "@google/genai";
import type { RawAirData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const getAirQualityData = async (location: string): Promise<RawAirData> => {
  const prompt = `You are a mock API for the AirCare app, specifically for South Korea. Based on the location "${location}" (which will be a city name in Korean), generate a realistic JSON object for current air quality and weather. The location is an urban area in South Korea. Provide PM10 (a number between 5 and 250), PM2.5 (a number between 2 and 150), and humidity (a number between 20 and 90). For 'locationName', use a more specific, well-known area within the provided location, like a district ('-gu' or '-si'). For example, if the input is '서울특별시', you could return '강남구, 서울특별시'. Only return the JSON object.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          locationName: {
            type: Type.STRING,
            description: "A specific district or neighborhood within the provided location, in Korean.",
          },
          pm10: {
            type: Type.NUMBER,
            description: "Particulate Matter < 10µm, value between 5 and 250.",
          },
          pm25: {
            type: Type.NUMBER,
            description: "Particulate Matter < 2.5µm, value between 2 and 150.",
          },
          humidity: {
            type: Type.NUMBER,
            description: "Relative humidity percentage, value between 20 and 90.",
          },
        },
        required: ["locationName", "pm10", "pm25", "humidity"],
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    const data: RawAirData = JSON.parse(jsonText);
    return data;
  } catch (error) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Invalid data format received from the API.");
  }
};