export interface AuthUser {
  id: string;
  username: string;
  displayName?: string;
  roles: string[];
}

export interface AuthSuccessResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
