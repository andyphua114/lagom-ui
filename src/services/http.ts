export type AuthenticatedFetch = (
  path: string,
  init?: RequestInit,
) => Promise<Response>;

interface AuthorizedFetchOptions {
  getAccessToken: () => string | null;
  getApiBaseUrl: () => string;
  onAuthFailure: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

function shouldSetJsonContentType(body: BodyInit | null | undefined) {
  return body !== undefined && body !== null && !(body instanceof FormData);
}

export function buildApiUrl(baseUrl: string, path: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
}

export async function parseErrorResponse(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  let errorBody:
    | {
        detail?: string;
        message?: string;
      }
    | undefined;

  try {
    errorBody = JSON.parse(responseText) as {
      detail?: string;
      message?: string;
    };
  } catch {
    throw new Error(responseText);
  }

  throw new Error(
    errorBody.detail ??
      errorBody.message ??
      `Request failed with status ${response.status}`,
  );
}

export async function apiFetch(
  baseUrl: string,
  path: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && shouldSetJsonContentType(init.body)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(buildApiUrl(baseUrl, path), {
    ...init,
    credentials: "include",
    headers,
  });
}

export function createAuthorizedFetch({
  getAccessToken,
  getApiBaseUrl,
  onAuthFailure,
  refreshAccessToken,
}: AuthorizedFetchOptions): AuthenticatedFetch {
  return async (path, init = {}) => {
    async function executeRequest(accessToken: string | null) {
      const headers = new Headers(init.headers);

      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      if (!headers.has("Content-Type") && shouldSetJsonContentType(init.body)) {
        headers.set("Content-Type", "application/json");
      }

      return fetch(buildApiUrl(getApiBaseUrl(), path), {
        ...init,
        credentials: "include",
        headers,
      });
    }

    let response = await executeRequest(getAccessToken());

    if (response.status !== 401) {
      return response;
    }

    const nextAccessToken = await refreshAccessToken();

    if (!nextAccessToken) {
      onAuthFailure();
      return response;
    }

    response = await executeRequest(nextAccessToken);

    if (response.status === 401) {
      onAuthFailure();
    }

    return response;
  };
}
