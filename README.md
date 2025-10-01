<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/127IEIc4eg4TQB7G3pPbMCIPppKkFojQN

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.local.example` to `.env.local` and set the required keys:
   - `AIRKOREA_SERVICE_KEY` (or `KMA_SERVICE_KEY`): 한국환경공단 실시간 대기질(OpenAPI) 서비스 키
   - `KMA_SERVICE_KEY`: 한국 기상청 마을예보 OpenAPI 서비스 키 (동일 키를 재사용해도 됩니다)
3. Run the app:
   `npm run dev`

### KMA 대기질 API 연동

실시간 대기질 데이터는 한국환경공단 `getCtprvnRltmMesureDnsty` 엔드포인트를 호출합니다. 발급받은 서비스 키를 `AIRKOREA_SERVICE_KEY` 또는 `KMA_SERVICE_KEY`에 저장하면 클라이언트에서 자동으로 사용됩니다. 시·도명은 사용자가 선택한 위치를 기반으로 변환되며, 측정소 정보가 없거나 값이 비정상인 경우에는 예외가 발생합니다.

## Android API keys

If you plan to open the native Android project (`app/`), create or update `local.properties` in the project root with the line below:

```
GOOGLE_MAPS_API_KEY=your-android-key
```

The Gradle build reads this property and propagates it to:

- `AndroidManifest.xml` for the Maps SDK meta-data entry.
- `MainActivity.kt` for reverse geocoding and air-quality tile requests.
- `PlacesSearch.kt` for Places SDK initialization.

This keeps the key out of source control (the file is ignored by Git) and ensures every Maps-related feature shares the same value.
