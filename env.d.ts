interface ImportMetaEnv {
  readonly VITE_AIRKOREA_SERVICE_KEY?: string;
  readonly VITE_KMA_SERVICE_KEY?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
