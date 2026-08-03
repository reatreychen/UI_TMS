import { api } from "../lib/api";
import { AdminRole } from "./adminUserService";

export interface AdminPermission {
  id: string;
  module: string;
  action: string;
}

export const adminRoleService = {
  async getRoles(): Promise<AdminRole[]> {
    const res = await api.get("/roles");
    return res.data.data;
  },

  async createRole(payload: { name: string; description?: string }): Promise<AdminRole> {
    const res = await api.post("/roles", payload);
    return res.data.data;
  },

  async updateRole(id: string, payload: { name?: string; description?: string }): Promise<AdminRole> {
    const res = await api.patch(`/roles/${id}`, payload);
    return res.data.data;
  },

  async deleteRole(id: string): Promise<void> {
    await api.delete(`/roles/${id}`);
  },

  async getPermissions(): Promise<AdminPermission[]> {
    const res = await api.get("/permissions");
    return res.data.data;
  },

  async getRolePermissions(roleId: string): Promise<AdminPermission[]> {
    const res = await api.get(`/roles/${roleId}/permissions`);
    return res.data.data;
  },

  async replaceRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await api.put(`/roles/${roleId}/permissions`, { permissionIds });
  }
};
