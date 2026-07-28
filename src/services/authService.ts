import { api } from "../lib/api";

export interface UserRole {
  id: string;
  name: string;
  description?: string;
}

export interface UserDepartment {
  id: string;
  name: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string;
  bio?: string;
  jobTitle?: string;
  departmentId?: string;
  department?: UserDepartment;
  roleId?: string;
  role?: UserRole | string;
  isActive: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  roleId?: string;
  departmentId?: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const authService = {
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    const res = await api.post<ApiResponse<AuthResponseData>>("/auth/login", payload);
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> {
    const res = await api.post<ApiResponse<AuthResponseData>>("/auth/register", payload);
    return res.data;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const res = await api.get<ApiResponse<User>>("/auth/profile");
    return res.data;
  },

  async refreshTokens(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken?: string }>> {
    const res = await api.post<ApiResponse<{ accessToken: string; refreshToken?: string }>>("/auth/refresh", { refreshToken });
    return res.data;
  },
};
