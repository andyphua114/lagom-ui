import { LOGIN_PATH, LOGOUT_PATH, REFRESH_PATH } from "../config";
import type { AuthSuccessResponse, LoginCredentials } from "../types/auth";
import { apiFetch, parseErrorResponse } from "./http";

async function parseAuthSuccessResponse(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    throw new Error("Backend response was empty.");
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(responseText) as unknown;
  } catch {
    throw new Error("Backend response was not valid JSON.");
  }

  const data = parsedBody as Partial<AuthSuccessResponse>;

  if (
    typeof data.accessToken !== "string" ||
    typeof data.expiresIn !== "number" ||
    !data.user ||
    typeof data.user.id !== "string" ||
    typeof data.user.username !== "string"
  ) {
    throw new Error("Backend response did not include a valid auth payload.");
  }

  return {
    accessToken: data.accessToken,
    expiresIn: data.expiresIn,
    user: {
      id: data.user.id,
      username: data.user.username,
    },
  } satisfies AuthSuccessResponse;
}

export async function loginWithPassword(
  baseUrl: string,
  credentials: LoginCredentials,
) {
  const response = await apiFetch(baseUrl, LOGIN_PATH, {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  return parseAuthSuccessResponse(response);
}

export async function refreshSession(baseUrl: string) {
  const response = await apiFetch(baseUrl, REFRESH_PATH, {
    method: "POST",
  });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  return parseAuthSuccessResponse(response);
}

export async function logoutSession(baseUrl: string) {
  const response = await apiFetch(baseUrl, LOGOUT_PATH, {
    method: "POST",
  });

  if (!response.ok && response.status !== 204) {
    await parseErrorResponse(response);
  }
}
