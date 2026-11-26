import { api } from "../lib/api";
import { AdminDepartment } from "./adminUserService";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Category {
  id: string;
  name: string;
  department_id: string;
  department?: AdminDepartment;
  itemCount?: number;
  isActive?: boolean;
}

export interface PaginatedCategories {
  data: Category[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryCategoryParams {
  page?: number;
  limit?: number;
  department_id?: string;
  q?: string;
}

export interface CreateCategoryPayload {
  name: string;
  department_id?: string | null;
  isActive?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  department_id?: string | null;
  isActive?: boolean;
}

export const adminCategoryService = {
  async getCategories(params?: QueryCategoryParams): Promise<PaginatedCategories> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.department_id) searchParams.append("department_id", params.department_id);
    if (params?.q) searchParams.append("q", params.q);

    const qs = searchParams.toString();
    const url = qs ? `/categories?${qs}` : "/categories";
    
    const res = await api.get<ApiResponse<PaginatedCategories>>(url);
    return res.data.data;
  },

  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    const res = await api.post<ApiResponse<Category>>("/categories", payload);
    return res.data.data;
  },

  async updateCategory(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    const res = await api.patch<ApiResponse<Category>>(`/categories/${id}`, payload);
    return res.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/categories/${id}`);
  }
};
