"use client";

import { useState, useEffect, useMemo } from "react";
import { adminRoleService, AdminPermission } from "@/src/services/adminRoleService";
import { AdminRole } from "@/src/services/adminUserService";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { fetchPermissionsThunk } from "@/src/store/slices/permissionSlice";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

export default function PermissionsPage() {
  const dispatch = useAppDispatch();
  const { permissions: allPermissions } = useAppSelector((state) => state.permission);

  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [selectedRolePermissionIds, setSelectedRolePermissionIds] = useState<Set<string>>(new Set());
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const [enableAll, setEnableAll] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Create Role Form
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  // Edit Role Form
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDesc, setEditRoleDesc] = useState("");

  const modules = useMemo(() => {
    const mods = new Set(allPermissions.map((p) => p.module));
    return Array.from(mods).sort();
  }, [allPermissions]);

  const permissionsByModule = useMemo(() => {
    const map = new Map<string, AdminPermission[]>();
    allPermissions.forEach((p) => {
      const list = map.get(p.module) || [];
      list.push(p);
      map.set(p.module, list);
    });
    return map;
  }, [allPermissions]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [fetchedRoles, actionResult] = await Promise.all([
        adminRoleService.getRoles(),
        dispatch(fetchPermissionsThunk())
      ]);
      setRoles(fetchedRoles);
      
      if (fetchedRoles.length > 0) {
        setSelectedRole(fetchedRoles[0]);
      }
      
      const fetchedPermissions = actionResult.payload as AdminPermission[];
      if (fetchedPermissions && Array.isArray(fetchedPermissions)) {
        const mods = Array.from(new Set(fetchedPermissions.map(p => p.module)));
        if (mods.length > 0) {
          setSelectedModule(mods.sort()[0]);
        }
      }
    } catch (err) {
      triggerToast("Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRole) {
      adminRoleService.getRolePermissions(selectedRole.id).then((perms) => {
        setSelectedRolePermissionIds(new Set(perms.map(p => p.id)));
      });
    }
  }, [selectedRole]);

  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvt = e as CustomEvent<string>;
      if (customEvt.detail) {
        triggerToast(`Filtering roles for "${customEvt.detail}"`);
      }
    };

    window.addEventListener("admin-search", handleSearch);
    return () => window.removeEventListener("admin-search", handleSearch);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleTogglePermission = (id: string) => {
    const nextSet = new Set(selectedRolePermissionIds);
    if (nextSet.has(id)) {
      nextSet.delete(id);
    } else {
      nextSet.add(id);
    }
    setSelectedRolePermissionIds(nextSet);
  };

  const handleEnableAllToggle = () => {
    const nextState = !enableAll;
    setEnableAll(nextState);
    if (nextState) {
      setSelectedRolePermissionIds(new Set(allPermissions.map(p => p.id)));
    } else {
      setSelectedRolePermissionIds(new Set());
    }
    triggerToast(nextState ? "All permissions enabled." : "All permissions disabled.");
  };

  const handleSaveChanges = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      await adminRoleService.replaceRolePermissions(selectedRole.id, Array.from(selectedRolePermissionIds));
      triggerToast(`Permission matrix saved for role '${selectedRole.name}'. Audit trail logged.`);
    } catch (error) {
      triggerToast("Failed to save permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPermissions = () => {
    if (selectedRole) {
      adminRoleService.getRolePermissions(selectedRole.id).then((perms) => {
        setSelectedRolePermissionIds(new Set(perms.map(p => p.id)));
        triggerToast(`Permissions reset to saved state for '${selectedRole.name}'.`);
      });
    }
  };

  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      const newRole = await adminRoleService.createRole({
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
      });
      setRoles([...roles, newRole]);
      setSelectedRole(newRole);
      setNewRoleName("");
      setNewRoleDesc("");
      setShowCreateModal(false);
      triggerToast(`Role '${newRole.name}' created!`);
    } catch (error) {
       triggerToast(getErrorMessage(error) || "Failed to create role.");
    }
  };

  const handleEditRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoleName.trim() || !editingRole) return;

    try {
      const updated = await adminRoleService.updateRole(editingRole.id, {
        name: editRoleName.trim(),
        description: editRoleDesc.trim(),
      });
      setRoles(roles.map((r) => (r.id === editingRole.id ? updated : r)));
      if (selectedRole?.id === editingRole.id) {
        setSelectedRole(updated);
      }
      setShowEditModal(false);
      setEditingRole(null);
      triggerToast(`Role '${updated.name}' updated!`);
    } catch (error) {
      triggerToast(getErrorMessage(error) || "Failed to update role.");
    }
  };

  const handleDeleteRole = async (role: AdminRole, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the role ${role.name}?`)) {
      try {
        await adminRoleService.deleteRole(role.id);
        const newRoles = roles.filter(r => r.id !== role.id);
        setRoles(newRoles);
        if (selectedRole?.id === role.id) {
           setSelectedRole(newRoles[0] || null);
        }
        triggerToast(`Deleted role '${role.name}'`);
      } catch (error) {
        triggerToast("Failed to delete role. It may be in use.");
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-on-surface">Loading configurations...</div>;
  }

  return (
    <div className="space-y-stack-lg max-w-[1440px] mx-auto w-full animate-in fade-in duration-300">
      {/* Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Permissions &amp; Roles
          </h2>
          <p className="text-on-surface-variant font-body-lg text-body-lg max-w-2xl mt-1">
            Configure granular access control, define administrative boundaries, and manage role-based security policies for the entire kinetic enterprise ecosystem.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 h-fit cursor-pointer"
        >
          <span className="material-symbols-outlined">add_moderator</span>
          <span>Create New Role</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant flex items-center gap-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="bg-primary/10 p-3 rounded-lg">
            <span className="material-symbols-outlined text-primary">groups</span>
          </div>
          <div>
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-semibold">
              Total Roles
            </p>
            <p className="text-headline-md font-headline-md text-on-surface font-bold">
              {roles.length}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant flex items-center gap-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="bg-secondary-container p-3 rounded-lg">
            <span className="material-symbols-outlined text-on-secondary-container">vpn_key</span>
          </div>
          <div>
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-semibold">
              Active Permissions
            </p>
            <p className="text-headline-md font-headline-md text-on-surface font-bold">{allPermissions.length}</p>
          </div>
        </div>
      </div>

      {/* Roles Management Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden">
        <div className="p-gutter border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
            System Roles
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => triggerToast("System roles list filtered.")}
              className="px-3 py-1.5 border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant font-label-md text-label-md border-b border-outline-variant uppercase tracking-wider">
                <th className="px-gutter py-4 font-semibold">Role Name</th>
                <th className="px-gutter py-4 font-semibold">Description</th>
                <th className="px-gutter py-4 text-center font-semibold">Users Assigned</th>
                <th className="px-gutter py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
              {roles.map((role) => {
                const isSelected = selectedRole?.id === role.id;
                const isDefault = ["Super Admin", "Support Manager", "Senior Agent", "Junior Agent"].includes(role.name);
                return (
                  <tr
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`transition-colors group cursor-pointer ${
                      isSelected
                        ? "bg-primary/5 border-l-4 border-l-primary font-medium"
                        : "hover:bg-primary/5"
                    }`}
                  >
                    <td className="px-gutter py-4 border-l-[3px] border-l-transparent">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-on-surface">{role.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isDefault
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary-container text-on-secondary-container"
                          }`}
                        >
                          {isDefault ? "DEFAULT" : "CUSTOM"}
                        </span>
                      </div>
                    </td>
                    <td className="px-gutter py-4 text-on-surface-variant">{role.description}</td>
                    <td className="px-gutter py-4 text-center font-bold">-</td>
                    <td className="px-gutter py-4 text-right">
                      <div
                        className={`flex justify-end gap-2 transition-opacity ${
                          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {!isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingRole(role);
                              setEditRoleName(role.name);
                              setEditRoleDesc(role.description || "");
                              setShowEditModal(true);
                            }}
                            className="p-1.5 hover:bg-surface-container rounded-lg text-primary cursor-pointer"
                            title="Edit Role"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        )}
                        {!isDefault && (
                          <button
                            onClick={(e) => handleDeleteRole(role, e)}
                            className="p-1.5 hover:bg-surface-container rounded-lg text-error cursor-pointer"
                            title="Delete Role"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left Sidebar for Matrix (Categories) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-surface-container-lowest p-gutter rounded-xl border border-outline-variant shadow-xs">
            <h4 className="font-bold text-on-surface mb-4">Editing Role:</h4>
            {selectedRole && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">verified</span>
                <div>
                  <p className="font-bold text-primary text-body-md leading-none">{selectedRole.name}</p>
                  <p className="text-[11px] text-on-surface-variant mt-1 italic">
                    Active Config Session
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {modules.map(
                (mod) => {
                  const isActive = selectedModule === mod;
                  return (
                    <button
                      key={mod}
                      onClick={() => setSelectedModule(mod)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-bold flex items-center justify-between transition-colors cursor-pointer text-body-md ${
                        isActive
                          ? "bg-surface-container text-primary"
                          : "hover:bg-surface-container text-on-surface-variant font-normal"
                      }`}
                    >
                      <span className="truncate pr-2">{mod.replace(/_/g, ' ')}</span>
                      <span className="material-symbols-outlined text-sm shrink-0">chevron_right</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Matrix Content */}
        <div className="lg:col-span-9 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden">
          <div className="p-gutter border-b border-outline-variant bg-surface-bright flex items-center justify-between">
            <div>
              <h4 className="font-headline-md text-headline-md font-bold text-on-surface">
                Module Permissions
              </h4>
              <p className="text-on-surface-variant font-body-md">
                Configure granular actions for the '{selectedModule}' module.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-label-md font-label-md text-on-surface-variant font-semibold">
                Enable All
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAll}
                  onChange={handleEnableAllToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </div>

          <div className="p-gutter space-y-6">
            {/* Dynamic Module Section */}
            {selectedModule && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold mb-2">
                  <span className="material-symbols-outlined">settings</span>
                  <span className="uppercase tracking-widest text-[11px]">{selectedModule.replace(/_/g, ' ')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissionsByModule.get(selectedModule)?.map((perm) => {
                    const isEnabled = selectedRolePermissionIds.has(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                          isEnabled
                          ? "border-primary/40 bg-primary/5"
                          : "border-outline-variant hover:border-outline"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface">
                            {perm.action}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">{perm.module}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          readOnly
                          className="h-5 w-5 text-primary rounded border-outline focus:ring-primary cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Divider */}
            <hr className="border-outline-variant" />

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2">
              <div className="flex items-center gap-2 text-on-surface-variant italic font-body-md text-[13px]">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Changes are logged for security compliance.
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleResetPermissions}
                  className="px-6 py-2 border border-outline-variant text-on-surface rounded-lg font-bold hover:bg-surface-container transition-all active:scale-95 cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving || !selectedRole}
                  className="px-8 py-2 bg-primary text-on-primary rounded-lg font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Create New Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_moderator</span>
                Create Security Role
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Compliance Auditor"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Describe access boundaries and responsibilities for this role..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit</span>
                Edit Security Role
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRole(null);
                }}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  placeholder="e.g. Compliance Auditor"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editRoleDesc}
                  onChange={(e) => setEditRoleDesc(e.target.value)}
                  placeholder="Describe access boundaries and responsibilities for this role..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRole(null);
                  }}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="text-body-md font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
