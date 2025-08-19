interface ImportMetaEnv {
    readonly VITE_ASSEMBLYAI_API_KEY: string;
    readonly VITE_ASANA_CLIENT_ID: string;
    readonly VITE_ASANA_CLIENT_SECRET: string;
    readonly VITE_ASANA_REDIRECT_URI: string;
    readonly VITE_LINEAR_CLIENT_ID: string;
    readonly VITE_LINEAR_CLIENT_SECRET: string;
    readonly VITE_LINEAR_REDIRECT_URI: string;
    readonly VITE_OPENAI_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
