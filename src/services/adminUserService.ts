import { api } from "../lib/api";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminRole {
  id: string;
  name: string;
  description?: string | null;
}

export interface AdminDepartment {
  id: string;
  name: string;
  description?: string | null;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string | null;
  bio?: string | null;
  jobTitle?: string | null;
  departmentId?: string | null;
  department?: AdminDepartment | null;
  roleId?: string | null;
  role?: AdminRole | string | null;
  isActive: boolean;
  mfaEnabled: boolean;
  failedLoginAttempts?: number;
  accountLocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminUserPayload {
  fullName: string;
  email: string;
  password: string;
  jobTitle?: string;
  roleId?: string;
  departmentId?: string;
  isActive?: boolean;
}

export interface UpdateAdminUserPayload {
  fullName?: string;
  email?: string;
  jobTitle?: string | null;
  roleId?: string | null;
  departmentId?: string | null;
  isActive?: boolean;
  accountLocked?: boolean;
  failedLoginAttempts?: number;
}

export const adminUserService = {
  async getUsers(): Promise<AdminUser[]> {
    const res = await api.get<ApiResponse<AdminUser[]>>("/users");
    return res.data.data;
  },

  async createUser(payload: CreateAdminUserPayload): Promise<AdminUser> {
    const res = await api.post<ApiResponse<AdminUser>>("/users", payload);
    return res.data.data;
  },

  async updateUser(id: string, payload: UpdateAdminUserPayload): Promise<AdminUser> {
    const res = await api.patch<ApiResponse<AdminUser>>(`/users/${id}`, payload);
    return res.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/users/${id}`);
  },

  async getRoles(): Promise<AdminRole[]> {
    const res = await api.get<ApiResponse<AdminRole[]>>("/roles");
    return res.data.data;
  },

  async getDepartments(): Promise<AdminDepartment[]> {
    const res = await api.get<ApiResponse<AdminDepartment[]>>("/departments");
    return res.data.data;
  },
};
