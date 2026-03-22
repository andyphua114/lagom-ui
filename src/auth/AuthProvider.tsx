import {
  createContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import {
  loginWithPassword,
  logoutSession,
  refreshSession,
} from "../services/auth";
import {
  createAuthorizedFetch,
  type AuthenticatedFetch,
} from "../services/http";
import type { AuthStatus, AuthUser, LoginCredentials } from "../types/auth";

interface AuthContextValue {
  authenticatedFetch: AuthenticatedFetch;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  status: AuthStatus;
  user: AuthUser | null;
}

interface AuthProviderProps extends PropsWithChildren {
  apiBaseUrl: string;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ apiBaseUrl, children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const refreshInFlightRef = useRef<Promise<string | null> | null>(null);

  function resetAuth() {
    setAccessToken(null);
    setStatus("unauthenticated");
    setUser(null);
  }

  function applyAuthState(nextAccessToken: string, nextUser: AuthUser) {
    setAccessToken(nextAccessToken);
    setStatus("authenticated");
    setUser(nextUser);
    return nextAccessToken;
  }

  async function refreshAccessToken() {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const refreshOperation = (async () => {
      try {
        const response = await refreshSession(apiBaseUrl);
        return applyAuthState(response.accessToken, response.user);
      } catch {
        resetAuth();
        return null;
      } finally {
        refreshInFlightRef.current = null;
      }
    })();

    refreshInFlightRef.current = refreshOperation;
    return refreshOperation;
  }

  async function login(credentials: LoginCredentials) {
    const response = await loginWithPassword(apiBaseUrl, credentials);
    applyAuthState(response.accessToken, response.user);
  }

  async function logout() {
    try {
      await logoutSession(apiBaseUrl);
    } finally {
      resetAuth();
    }
  }

  useEffect(() => {
    let isCancelled = false;

    setAccessToken(null);
    setStatus("loading");
    setUser(null);

    async function bootstrapAuth() {
      try {
        const response = await refreshSession(apiBaseUrl);

        if (isCancelled) {
          return;
        }

        applyAuthState(response.accessToken, response.user);
      } catch {
        if (isCancelled) {
          return;
        }

        resetAuth();
      }
    }

    void bootstrapAuth();

    return () => {
      isCancelled = true;
      refreshInFlightRef.current = null;
    };
  }, [apiBaseUrl]);

  const authenticatedFetch = createAuthorizedFetch({
    getAccessToken: () => accessToken,
    getApiBaseUrl: () => apiBaseUrl,
    onAuthFailure: resetAuth,
    refreshAccessToken,
  });

  return (
    <AuthContext.Provider
      value={{
        authenticatedFetch,
        isAuthenticated: status === "authenticated",
        login,
        logout,
        status,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
