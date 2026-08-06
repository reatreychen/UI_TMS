import { api } from "../lib/api";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  users?: any[];
  categories?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
}

export interface UpdateDepartmentPayload {
  name?: string;
  description?: string;
}

export const adminDepartmentService = {
  async getDepartments(): Promise<Department[]> {
    const res = await api.get<ApiResponse<Department[]>>("/departments");
    return res.data.data || [];
  },

  async getDepartment(id: string): Promise<Department> {
    const res = await api.get<ApiResponse<Department>>(`/departments/${id}`);
    return res.data.data;
  },

  async createDepartment(payload: CreateDepartmentPayload): Promise<Department> {
    const res = await api.post<ApiResponse<Department>>("/departments", payload);
    return res.data.data;
  },

  async updateDepartment(id: string, payload: UpdateDepartmentPayload): Promise<Department> {
    const res = await api.patch<ApiResponse<Department>>(`/departments/${id}`, payload);
    return res.data.data;
  },

  async deleteDepartment(id: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/departments/${id}`);
  },
};
