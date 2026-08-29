import { useCallback, useEffect, useRef, useState } from 'react';
import { CLIENT_ID, SCOPES } from './config';

// Minimal shape of the pieces of the Google Identity Services script we use.
// The full types live in @types/google.accounts, but declaring just what we
// call keeps this dependency-free.
interface TokenResponse {
  access_token: string;
  error?: string;
}

interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: TokenResponse) => void;
            error_callback?: (err: { type: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services script')));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
    document.head.appendChild(script);
  });
}

export function useGoogleAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenClientRef = useRef<TokenClient | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGisScript()
      .then(() => {
        if (cancelled || !window.google) return;
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (resp) => {
            if (resp.error) {
              setError(resp.error);
              return;
            }
            setAccessToken(resp.access_token);
            setError(null);
          },
          error_callback: (err) => {
            // Fires if the user closes the popup, or a network issue, etc.
            setError(err.type);
          },
        });
        setReady(true);
      })
      .catch((err: Error) => setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  // prompt: '' asks for consent only the very first time ever for this
  // client + scope combination; every call after that resolves silently.
  const signIn = useCallback((prompt: '' | 'consent' = '') => {
    tokenClientRef.current?.requestAccessToken({ prompt });
  }, []);

  const signOut = useCallback(() => {
    if (accessToken) {
      // Revoking is optional but polite — drops Google's record that this
      // browser session holds a live token.
      fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, { method: 'POST' }).catch(() => {});
    }
    setAccessToken(null);
  }, [accessToken]);

  return { accessToken, ready, error, signIn, signOut };
}
