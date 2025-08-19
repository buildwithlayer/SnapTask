/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ViteTypeOptions {
    // By adding this line, you can make the type of ImportMetaEnv strict
    // to disallow unknown keys.
    strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_ASANA_CLIENT_ID: string;
    readonly VITE_ASANA_REDIRECT_URI: string;
    readonly VITE_CALLBACK_URL: string;
    readonly VITE_JIRA_CLIENT_ID: string;
    readonly VITE_JIRA_REDIRECT_URI: string;
    readonly VITE_LINEAR_CLIENT_ID: string;
    readonly VITE_LINEAR_REDIRECT_URI: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
