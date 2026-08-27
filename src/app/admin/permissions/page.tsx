"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminPermission } from "@/src/services/adminRoleService";
import { AdminRole } from "@/src/services/adminUserService";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { fetchPermissionsThunk, createPermissionThunk } from "@/src/store/slices/permissionSlice";
import {
  fetchRolesThunk,
  createRoleThunk,
  updateRoleThunk,
  deleteRoleThunk,
  fetchRolePermissionsThunk,
  replaceRolePermissionsThunk,
  setSelectedRole,
  toggleRolePermission,
  setSelectedRolePermissions,
} from "@/src/store/slices/roleSlice";

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

const SYSTEM_PERMISSION_CATALOG: (AdminPermission & { label: string })[] = [
  { id: "perm-tk-1", module: "tickets", action: "create", label: "Create Ticket" },
  { id: "perm-tk-2", module: "tickets", action: "read",   label: "View Tickets" },
  { id: "perm-tk-3", module: "tickets", action: "update", label: "Update Ticket" },
  { id: "perm-tk-4", module: "tickets", action: "delete", label: "Delete Ticket" },
  { id: "perm-tk-5", module: "tickets", action: "assign", label: "Assign Ticket" },
  { id: "perm-tk-6", module: "tickets", action: "close",  label: "Close Ticket" },

  { id: "perm-us-1", module: "users", action: "create", label: "Create User" },
  { id: "perm-us-2", module: "users", action: "read",   label: "View Users" },
  { id: "perm-us-3", module: "users", action: "update", label: "Update User" },
  { id: "perm-us-4", module: "users", action: "delete", label: "Delete User" },

  { id: "perm-ag-1", module: "agents", action: "create", label: "Onboard Agent" },
  { id: "perm-ag-2", module: "agents", action: "read",   label: "View Agents" },
  { id: "perm-ag-3", module: "agents", action: "update", label: "Edit Agent" },
  { id: "perm-ag-4", module: "agents", action: "delete", label: "Remove Agent" },

  { id: "perm-cat-1", module: "categories", action: "create", label: "Create Category" },
  { id: "perm-cat-2", module: "categories", action: "read",   label: "View Categories" },
  { id: "perm-cat-3", module: "categories", action: "update", label: "Update Category" },
  { id: "perm-cat-4", module: "categories", action: "delete", label: "Delete Category" },

  { id: "perm-dept-1", module: "departments", action: "create", label: "Create Department" },
  { id: "perm-dept-2", module: "departments", action: "read",   label: "View Departments" },
  { id: "perm-dept-3", module: "departments", action: "update", label: "Update Department" },
  { id: "perm-dept-4", module: "departments", action: "delete", label: "Delete Department" },

  { id: "perm-role-1", module: "roles", action: "create", label: "Create Role" },
  { id: "perm-role-2", module: "roles", action: "read",   label: "View Roles" },
  { id: "perm-role-3", module: "roles", action: "update", label: "Edit Permissions" },
  { id: "perm-role-4", module: "roles", action: "delete", label: "Delete Role" },

  { id: "perm-kb-1", module: "knowledge_base", action: "create", label: "Create Article" },
  { id: "perm-kb-2", module: "knowledge_base", action: "read",   label: "View Articles" },
  { id: "perm-kb-3", module: "knowledge_base", action: "update", label: "Update Article" },
  { id: "perm-kb-4", module: "knowledge_base", action: "delete", label: "Delete Article" },

  { id: "perm-audit-1", module: "audit_logs", action: "read",   label: "View Audit Logs" },
  { id: "perm-audit-2", module: "audit_logs", action: "export", label: "Export Audit Logs" },

  { id: "perm-rpt-1", module: "reports", action: "read",   label: "View Analytics & Reports" },
  { id: "perm-rpt-2", module: "reports", action: "export", label: "Export Reports (CSV/PDF)" },

  { id: "perm-tc-1", module: "ticket_comments", action: "create", label: "Add Comment" },
  { id: "perm-tc-2", module: "ticket_comments", action: "read",   label: "View Comments" },
  { id: "perm-tc-3", module: "ticket_comments", action: "delete", label: "Delete Comment" },
];

export default function PermissionsPage() {
  const dispatch = useAppDispatch();
  const { permissions: allPermissions } = useAppSelector((state) => state.permission);
  const { roles, selectedRole, selectedRolePermissionIds, loading: rolesLoading, isSaving } = useAppSelector(
    (state) => state.role
  );

  const [selectedModule, setSelectedModule] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Create Role Form
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  // Edit Role Form
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDesc, setEditRoleDesc] = useState("");

  // Create Permission Form
  const [newPermModule, setNewPermModule] = useState("");
  const [newPermAction, setNewPermAction] = useState("");

  const effectivePermissions = useMemo(() => {
    if (!allPermissions || allPermissions.length === 0) {
      return SYSTEM_PERMISSION_CATALOG;
    }

    const usedDbIds = new Set<string>();
    // Exact match: catalog module/action now == DB module/action
    const mappedCatalog = SYSTEM_PERMISSION_CATALOG.map((cat) => {
      const dbMatch = allPermissions.find(
        (dbP) =>
          !usedDbIds.has(dbP.id) &&
          dbP.module === cat.module &&
          dbP.action === cat.action
      );
      if (dbMatch) {
        usedDbIds.add(dbMatch.id);
        return { ...cat, id: dbMatch.id };
      }
      return cat;
    });

    // Append any DB permissions not in catalog
    allPermissions.forEach((dbP) => {
      if (!usedDbIds.has(dbP.id)) {
        mappedCatalog.push({
          id: dbP.id,
          module: dbP.module,
          action: dbP.action,
          label: `${dbP.action.replace(/_/g, " ")}`,
        });
        usedDbIds.add(dbP.id);
      }
    });

    return mappedCatalog;
  }, [allPermissions]);

  const modules = useMemo(() => {
    const mods = new Set(effectivePermissions.map((p) => p.module));
    return Array.from(mods).sort();
  }, [effectivePermissions]);

  const permissionsByModule = useMemo(() => {
    const map = new Map<string, (AdminPermission & { label: string })[]>();
    effectivePermissions.forEach((p) => {
      const list = map.get(p.module) || [];
      list.push(p);
      map.set(p.module, list);
    });
    return map;
  }, [effectivePermissions]);

  // Keep selectedModule synchronized with available modules
  useEffect(() => {
    if (modules.length > 0 && (!selectedModule || !modules.includes(selectedModule))) {
      setSelectedModule(modules[0]);
    }
  }, [modules, selectedModule]);

  useEffect(() => {
    dispatch(fetchRolesThunk());
    dispatch(fetchPermissionsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (selectedRole) {
      dispatch(fetchRolePermissionsThunk(selectedRole.id));
    }
  }, [selectedRole, dispatch]);

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
    dispatch(toggleRolePermission(id));
  };

  const currentModulePerms = useMemo(() => {
    return permissionsByModule.get(selectedModule) || [];
  }, [permissionsByModule, selectedModule]);

  const isModuleAllEnabled = useMemo(() => {
    if (currentModulePerms.length === 0) return false;
    return currentModulePerms.every((p) => selectedRolePermissionIds.includes(p.id));
  }, [currentModulePerms, selectedRolePermissionIds]);

  const handleEnableAllToggle = () => {
    const nextState = !isModuleAllEnabled;
    const currentModulePermIds = currentModulePerms.map((p) => p.id);
    let nextPermissionIds: string[];

    if (nextState) {
      const combined = new Set([...selectedRolePermissionIds, ...currentModulePermIds]);
      nextPermissionIds = Array.from(combined);
    } else {
      nextPermissionIds = selectedRolePermissionIds.filter((id) => !currentModulePermIds.includes(id));
    }

    dispatch(setSelectedRolePermissions(nextPermissionIds));
    triggerToast(
      nextState
        ? `All permissions enabled for module '${selectedModule}'.`
        : `All permissions disabled for module '${selectedModule}'.`
    );
  };

  const handleApplyPreset = (presetType: "admin" | "agent" | "user") => {
    let permIds: string[] = [];
    if (presetType === "admin") {
      permIds = effectivePermissions.map((p) => p.id);
      triggerToast("Applied Full Admin Preset (All permissions enabled)");
    } else if (presetType === "agent") {
      permIds = effectivePermissions
        .filter((p) =>
          ["tickets", "knowledge_base", "reports", "categories", "departments", "agents"].includes(p.module)
        )
        .map((p) => p.id);
      triggerToast("Applied Support Agent Preset (Tickets, KB, Reports & Team)");
    } else if (presetType === "user") {
      permIds = effectivePermissions
        .filter(
          (p) =>
            (p.module === "tickets" && (p.action === "create" || p.action === "read")) ||
            (p.module === "knowledge_base" && p.action === "read") ||
            (p.module === "ticket_comments" && (p.action === "create" || p.action === "read"))
        )
        .map((p) => p.id);
      triggerToast("Applied Standard User Preset (Ticket Creation & KB Access)");
    }

    dispatch(setSelectedRolePermissions(permIds));
  };

  const handleSaveChanges = async () => {
    if (!selectedRole) return;
    try {
      const validPermissionIds: string[] = [];
      for (const id of selectedRolePermissionIds) {
        const dbPerm = allPermissions.find((p) => p.id === id);
        if (dbPerm) {
          validPermissionIds.push(dbPerm.id);
        } else {
          const catalogItem = SYSTEM_PERMISSION_CATALOG.find((cat) => cat.id === id);
          if (catalogItem) {
            const formattedMod = catalogItem.module.toLowerCase().replace(/\s+/g, "_");
            const formattedAct = catalogItem.action.toLowerCase().replace(/\s+/g, "_");
            try {
              const res = await dispatch(
                createPermissionThunk({ module: formattedMod, action: formattedAct })
              );
              if (createPermissionThunk.fulfilled.match(res) && res.payload?.id) {
                validPermissionIds.push(res.payload.id);
              }
            } catch (err) {
              console.warn("Failed auto-creating permission:", catalogItem, err);
            }
          }
        }
      }

      const result = await dispatch(
        replaceRolePermissionsThunk({
          roleId: selectedRole.id,
          permissionIds: validPermissionIds,
        })
      );
      if (replaceRolePermissionsThunk.fulfilled.match(result)) {
        triggerToast(`Permission matrix saved for role '${selectedRole.name}'!`);
        dispatch(fetchPermissionsThunk());
        dispatch(fetchRolePermissionsThunk(selectedRole.id));
      } else {
        triggerToast((result.payload as string) || "Failed to save permissions.");
      }
    } catch (error) {
      triggerToast(getErrorMessage(error) || "Failed to save permissions.");
    }
  };

  const handleResetPermissions = () => {
    if (selectedRole) {
      dispatch(fetchRolePermissionsThunk(selectedRole.id));
      triggerToast(`Permissions reset to saved state for '${selectedRole.name}'.`);
    }
  };

  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      const result = await dispatch(
        createRoleThunk({
          name: newRoleName.trim(),
          description: newRoleDesc.trim(),
        })
      );
      if (createRoleThunk.fulfilled.match(result)) {
        setNewRoleName("");
        setNewRoleDesc("");
        setShowCreateModal(false);
        triggerToast(`Role '${result.payload.name}' created successfully!`);
      } else {
        triggerToast((result.payload as string) || "Failed to create role.");
      }
    } catch (error) {
      triggerToast(getErrorMessage(error) || "Failed to create role.");
    }
  };

  const handleCreatePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermModule.trim() || !newPermAction.trim()) return;

    try {
      const formattedModule = newPermModule.trim().toLowerCase().replace(/\s+/g, "_");
      const formattedAction = newPermAction.trim().toLowerCase().replace(/\s+/g, "_");

      const actionResult = await dispatch(
        createPermissionThunk({
          module: formattedModule,
          action: formattedAction,
        })
      );

      if (createPermissionThunk.fulfilled.match(actionResult)) {
        triggerToast(`Permission '${formattedModule}:${formattedAction}' created successfully!`);
        setSelectedModule(formattedModule);
        setNewPermModule("");
        setNewPermAction("");
        setShowPermissionModal(false);
      } else {
        triggerToast((actionResult.payload as string) || "Failed to create permission.");
      }
    } catch (err) {
      triggerToast(getErrorMessage(err));
    }
  };

  const handleEditRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoleName.trim() || !editingRole) return;

    try {
      const result = await dispatch(
        updateRoleThunk({
          id: editingRole.id,
          payload: {
            name: editRoleName.trim(),
            description: editRoleDesc.trim(),
          },
        })
      );
      if (updateRoleThunk.fulfilled.match(result)) {
        setShowEditModal(false);
        setEditingRole(null);
        triggerToast(`Role '${result.payload.name}' updated!`);
      } else {
        triggerToast((result.payload as string) || "Failed to update role.");
      }
    } catch (error) {
      triggerToast(getErrorMessage(error) || "Failed to update role.");
    }
  };

  const handleDeleteRole = async (role: AdminRole, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      try {
        const result = await dispatch(deleteRoleThunk(role.id));
        if (deleteRoleThunk.fulfilled.match(result)) {
          triggerToast(`Deleted role '${role.name}'`);
        } else {
          triggerToast((result.payload as string) || "Failed to delete role.");
        }
      } catch (error) {
        triggerToast("Failed to delete role. It may be in use.");
      }
    }
  };

  if (rolesLoading && roles.length === 0) {
    return (
      <div className="p-12 text-center text-on-surface flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
        <p className="font-bold text-body-lg">Loading security configurations...</p>
      </div>
    );
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPermissionModal(true)}
            className="border border-outline text-on-surface hover:bg-surface-container px-4 py-2.5 rounded-lg font-bold shadow-xs active:scale-95 transition-all flex items-center gap-2 h-fit cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary">vpn_key</span>
            <span>Add Permission</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 h-fit cursor-pointer"
          >
            <span className="material-symbols-outlined">add_moderator</span>
            <span>Create New Role</span>
          </button>
        </div>
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
              onClick={() => {
                dispatch(fetchRolesThunk());
                triggerToast("System roles refreshed.");
              }}
              className="px-3 py-1.5 border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant font-label-md text-label-md border-b border-outline-variant uppercase tracking-wider">
                <th className="px-gutter py-4 font-semibold">Role Name</th>
                <th className="px-gutter py-4 font-semibold">Description</th>
                <th className="px-gutter py-4 text-center font-semibold">Status</th>
                <th className="px-gutter py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
              {roles.map((role) => {
                const isSelected = selectedRole?.id === role.id;
                const isDefault = ["Super Admin", "Support Manager", "Senior Agent", "Junior Agent", "User"].includes(role.name);
                return (
                  <tr
                    key={role.id}
                    onClick={() => dispatch(setSelectedRole(role))}
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
                    <td className="px-gutter py-4 text-on-surface-variant">{role.description || "No description provided."}</td>
                    <td className="px-gutter py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </td>
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
              {modules.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic p-2">No modules found.</p>
              ) : (
                modules.map((mod) => {
                  const isActive = selectedModule === mod;
                  const modPerms = permissionsByModule.get(mod) || [];
                  const enabledCount = modPerms.filter((p) => selectedRolePermissionIds.includes(p.id)).length;
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
                      <span className="truncate pr-2 capitalize">{mod.replace(/_/g, " ")}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container-high font-semibold text-on-surface-variant">
                        {enabledCount}/{modPerms.length}
                      </span>
                    </button>
                  );
                })
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
                Configure granular actions for the <span className="font-bold text-on-surface capitalize">'{selectedModule || "N/A"}'</span> module.
              </p>
            </div>
            {selectedModule && currentModulePerms.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-label-md font-label-md text-on-surface-variant font-semibold">
                  Enable All in Module
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isModuleAllEnabled}
                    onChange={handleEnableAllToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            )}
          </div>

          <div className="p-gutter space-y-6">
            {/* Quick Role Presets */}
            {selectedRole && (
              <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-outline-variant">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mr-1">
                  Role Presets:
                </span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("admin")}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border border-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  Admin (Full Access)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("agent")}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">support_agent</span>
                  Support Agent
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("user")}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  Standard User
                </button>
              </div>
            )}

            {/* Dynamic Module Section */}
            {selectedModule && currentModulePerms.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold mb-2">
                  <span className="material-symbols-outlined">settings</span>
                  <span className="uppercase tracking-widest text-[11px]">{selectedModule.replace(/_/g, " ")}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentModulePerms.map((perm, idx) => {
                    const isEnabled = selectedRolePermissionIds.includes(perm.id);
                    return (
                      <div
                        key={`${perm.id}-${idx}`}
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`flex items-center justify-between p-3.5 rounded-lg border transition-all cursor-pointer ${
                          isEnabled
                            ? "border-primary/40 bg-primary/5 shadow-xs"
                            : "border-outline-variant hover:border-outline bg-surface-container-lowest"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface capitalize">
                            {(perm as AdminPermission & { label?: string }).label || perm.action.replace(/_/g, " ")}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">Module: {perm.module.replace(/_/g, " ")}</span>
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
            ) : (
              <div className="p-8 text-center border border-dashed border-outline-variant rounded-xl space-y-3">
                <span className="material-symbols-outlined text-4xl text-outline">key_off</span>
                <p className="font-bold text-on-surface">No permissions found for this module.</p>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Click "Add Permission" above to define actions for custom modules.
                </p>
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

      {/* Create Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">vpn_key</span>
                Add Module Permission
              </h3>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePermissionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Module Name
                </label>
                <input
                  type="text"
                  required
                  value={newPermModule}
                  onChange={(e) => setNewPermModule(e.target.value)}
                  placeholder="e.g. analytics, billing, tickets"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Action Name
                </label>
                <input
                  type="text"
                  required
                  value={newPermAction}
                  onChange={(e) => setNewPermAction(e.target.value)}
                  placeholder="e.g. read, export, manage, approve"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Create Permission
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
