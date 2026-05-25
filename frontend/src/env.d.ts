/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Minimal types for Google Identity Services to prevent compilation errors
declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClientConfig {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
        error_callback?: (error: unknown) => void;
      }

      interface TokenClient {
        requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
      }

      interface TokenResponse {
        access_token: string;
        expires_in: string;
        hd?: string;
        prompt?: string;
        scope: string;
        token_type: string;
        error?: string;
        error_description?: string;
        error_uri?: string;
      }

      function initTokenClient(config: TokenClientConfig): TokenClient;
    }
  }
}
