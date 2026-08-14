import { apiClient } from "./client";
import { User } from "../types";

export interface LoginParams {
  username: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginParams): Promise<User> => {
    return apiClient<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout: async (): Promise<void> => {
    return apiClient<void>("/api/auth/logout", {
      method: "POST",
    });
  },

  getMe: async (): Promise<User> => {
    return apiClient<User>("/api/auth/me", {
      method: "GET",
    });
  },
};
