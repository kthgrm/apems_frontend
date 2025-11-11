/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_MAPS_API_KEY: string;
    readonly VITE_API_URL: string;
    // Add other env variables here
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Extend Window interface for Google Maps
interface Window {
    google: typeof google;
}
