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
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

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
