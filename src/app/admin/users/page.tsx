"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminDepartment,
  AdminRole,
  AdminUser,
  adminUserService,
} from "@/src/services/adminUserService";

type UserStatus = "Active" | "Inactive" | "Locked";

interface UserFormState {
  fullName: string;
  email: string;
  password: string;
  jobTitle: string;
  roleId: string;
  departmentId: string;
  isActive: boolean;
}

const emptyInviteForm: UserFormState = {
  fullName: "",
  email: "",
  password: "TempPass123",
  jobTitle: "",
  roleId: "",
  departmentId: "",
  isActive: true,
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "US";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getAvatarStyle(id: string) {
  const styles = [
    "bg-primary-fixed text-primary",
    "bg-secondary-container text-secondary",
    "bg-tertiary-fixed text-tertiary",
    "bg-error-container text-error",
    "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-800",
    "bg-purple-100 text-purple-700",
  ];
  const index = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % styles.length;
  return styles[index];
}

function getStatus(user: AdminUser): UserStatus {
  if (user.accountLocked) return "Locked";
  return user.isActive ? "Active" : "Inactive";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getRoleName(user: AdminUser, rolesById: Map<string, AdminRole>) {
  if (typeof user.role === "object" && user.role?.name) return user.role.name;
  if (typeof user.role === "string") return user.role;
  if (user.roleId && rolesById.has(user.roleId)) return rolesById.get(user.roleId)?.name || "Unassigned";
  return user.jobTitle || "Unassigned";
}

function getDepartmentName(user: AdminUser, departmentsById: Map<string, AdminDepartment>) {
  if (user.department?.name) return user.department.name;
  if (user.departmentId && departmentsById.has(user.departmentId)) {
    return departmentsById.get(user.departmentId)?.name || "Unassigned";
  }
  return "Unassigned";
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (message) return message;
  }

  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<AdminUser | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<AdminUser | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [inviteForm, setInviteForm] = useState<UserFormState>(emptyInviteForm);
  const [editForm, setEditForm] = useState<Omit<UserFormState, "password">>({
    fullName: "",
    email: "",
    jobTitle: "",
    roleId: "",
    departmentId: "",
    isActive: true,
  });

  const rolesById = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);
  const departmentsById = useMemo(
    () => new Map(departments.map((department) => [department.id, department])),
    [departments]
  );

  useEffect(() => {
    let mounted = true;

    async function loadUsersData() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [usersData, rolesData, departmentsData] = await Promise.all([
          adminUserService.getUsers(),
          adminUserService.getRoles(),
          adminUserService.getDepartments(),
        ]);

        if (!mounted) return;
        setUsers(usersData);
        setRoles(rolesData);
        setDepartments(departmentsData);
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadUsersData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleSearch = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setSearchQuery(customEvent.detail || "");
      setCurrentPage(1);
    };

    window.addEventListener("admin-search", handleSearch);
    return () => window.removeEventListener("admin-search", handleSearch);
  }, []);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const roleName = getRoleName(user, rolesById);
      const departmentName = getDepartmentName(user, departmentsById);
      const status = getStatus(user);
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        roleName.toLowerCase().includes(query) ||
        departmentName.toLowerCase().includes(query);

      const matchesRole = roleFilter === "All Roles" || user.roleId === roleFilter || roleName === roleFilter;
      const matchesStatus = statusFilter === "All Statuses" || status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [departmentsById, roleFilter, rolesById, searchQuery, statusFilter, users]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const pagedUsers = filteredUsers.slice((safeCurrentPage - 1) * rowsPerPage, safeCurrentPage * rowsPerPage);

  const stats = {
    total: users.length,
    active: users.filter((user) => getStatus(user) === "Active").length,
    locked: users.filter((user) => getStatus(user) === "Locked").length,
    admins: users.filter((user) => getRoleName(user, rolesById).toLowerCase().includes("admin")).length,
  };

  const refreshUsers = async () => {
    const usersData = await adminUserService.getUsers();
    setUsers(usersData);
  };

  const handleExportCSV = () => {
    setIsExporting(true);

    const rows = filteredUsers.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: getRoleName(user, rolesById),
      department: getDepartmentName(user, departmentsById),
      status: getStatus(user),
      updatedAt: user.updatedAt,
    }));

    const headers = ["id", "fullName", "email", "role", "department", "status", "updatedAt"];
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-users.csv";
    link.click();
    URL.revokeObjectURL(url);

    setIsExporting(false);
    triggerToast("Users exported to CSV.");
  };

  const handleInviteSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inviteForm.fullName.trim() || !inviteForm.email.trim() || !inviteForm.password.trim()) return;

    setIsSaving(true);
    try {
      await adminUserService.createUser({
        fullName: inviteForm.fullName.trim(),
        email: inviteForm.email.trim(),
        password: inviteForm.password,
        jobTitle: inviteForm.jobTitle.trim() || undefined,
        roleId: inviteForm.roleId || undefined,
        departmentId: inviteForm.departmentId || undefined,
        isActive: inviteForm.isActive,
      });
      await refreshUsers();
      setInviteForm(emptyInviteForm);
      setShowInviteModal(false);
      triggerToast(`User ${inviteForm.email} created.`);
    } catch (error) {
      triggerToast(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (user: AdminUser) => {
    setShowEditModal(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      jobTitle: user.jobTitle || "",
      roleId: user.roleId || "",
      departmentId: user.departmentId || "",
      isActive: user.isActive,
    });
  };

  const handleEditSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!showEditModal) return;

    setIsSaving(true);
    try {
      await adminUserService.updateUser(showEditModal.id, {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        jobTitle: editForm.jobTitle.trim() || null,
        roleId: editForm.roleId || null,
        departmentId: editForm.departmentId || null,
        isActive: editForm.isActive,
      });
      await refreshUsers();
      setShowEditModal(null);
      triggerToast(`User ${editForm.fullName} updated.`);
    } catch (error) {
      triggerToast(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!showDeleteModal) return;

    setIsSaving(true);
    try {
      await adminUserService.deleteUser(showDeleteModal.id);
      setUsers((current) => current.filter((user) => user.id !== showDeleteModal.id));
      triggerToast(`User ${showDeleteModal.fullName} removed.`);
      setShowDeleteModal(null);
    } catch (error) {
      triggerToast(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-stack-lg animate-in fade-in duration-300">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            Users &amp; Stakeholders
          </h2>
          <p className="mt-1 text-body-lg text-secondary">
            Manage workforce accounts, support agents, roles, departments, and access status from the live API.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            disabled={isExporting || filteredUsers.length === 0}
            className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 py-2 font-semibold text-on-surface shadow-xs transition-all hover:bg-surface-container-low active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={`material-symbols-outlined ${isExporting ? "animate-spin" : ""}`}>
              {isExporting ? "sync" : "download"}
            </span>
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95"
          >
            <span className="material-symbols-outlined">person_add</span>
            <span>Invite User</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-error/30 bg-error-container/40 px-4 py-3 text-body-md text-on-error-container">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 md:grid-cols-4">
        {[
          { label: "Total Users", value: stats.total, icon: "group", badge: "API", color: "text-primary bg-primary-fixed" },
          { label: "Active Users", value: stats.active, icon: "check_circle", badge: "Enabled", color: "text-green-600 bg-green-50" },
          { label: "Locked Accounts", value: stats.locked, icon: "lock", badge: "Review", color: "text-error bg-error-container" },
          { label: "Admins", value: stats.admins, icon: "shield_person", badge: "Privileged", color: "text-orange-600 bg-orange-100" },
        ].map((card) => (
          <div
            key={card.label}
            className="flex h-32 flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-xs transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className={`material-symbols-outlined rounded-lg p-2 ${card.color}`}>{card.icon}</span>
              <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-md font-bold text-secondary">
                {card.badge}
              </span>
            </div>
            <div>
              <p className="text-label-md font-semibold uppercase tracking-wider text-secondary">{card.label}</p>
              <p className="text-headline-md font-bold text-on-surface">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant bg-surface-container-lowest p-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="cursor-pointer rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-body-md font-medium outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All Roles">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="cursor-pointer rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-body-md font-medium outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Locked">Locked</option>
            </select>

            {searchQuery && (
              <span className="text-xs font-semibold text-primary">Filter query: &quot;{searchQuery}&quot;</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-label-md font-medium text-outline">
            <button
              onClick={async () => {
                setIsLoading(true);
                try {
                  await refreshUsers();
                  triggerToast("Users refreshed.");
                } catch (error) {
                  triggerToast(getErrorMessage(error));
                } finally {
                  setIsLoading(false);
                }
              }}
              className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-body-md font-semibold text-secondary transition-colors hover:bg-surface-container-low"
            >
              <span className={`material-symbols-outlined text-[18px] ${isLoading ? "animate-spin" : ""}`}>refresh</span>
              Refresh
            </button>
            <span>
              Showing {filteredUsers.length} of {users.length} users
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-6 py-4 text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">User</th>
                <th className="px-6 py-4 text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">Role</th>
                <th className="px-6 py-4 text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">Department</th>
                <th className="px-6 py-4 text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                <th className="px-6 py-4 text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">Last Updated</th>
                <th className="px-6 py-4 text-right text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-secondary">
                    <span className="material-symbols-outlined mb-2 block animate-spin text-3xl text-primary">sync</span>
                    Loading users from API...
                  </td>
                </tr>
              ) : pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-outline">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                pagedUsers.map((user) => {
                  const status = getStatus(user);
                  const avatarStyle = getAvatarStyle(user.id);

                  return (
                    <tr key={user.id} className="group transition-colors hover:bg-surface-container-low/70">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={`${user.fullName} avatar`}
                              className="h-10 w-10 rounded-full border border-outline-variant object-cover shadow-xs"
                            />
                          ) : (
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold shadow-xs ${avatarStyle}`}>
                              {getInitials(user.fullName)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-on-surface transition-colors group-hover:text-primary">
                              {user.fullName}
                            </p>
                            <p className="font-mono text-label-md text-outline">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-body-md font-medium text-on-surface-variant">
                          {getRoleName(user, rolesById)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-body-md text-on-surface-variant">
                          {getDepartmentName(user, departmentsById)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              status === "Active"
                                ? "bg-green-500 ring-2 ring-green-500/20"
                                : status === "Locked"
                                ? "bg-error ring-2 ring-error/20"
                                : "bg-slate-300"
                            }`}
                          />
                          <span className="text-body-md font-medium">{status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-label-md text-outline">{formatDate(user.updatedAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          <button
                            onClick={() => openEditModal(user)}
                            className="cursor-pointer rounded-lg p-1.5 text-primary transition-colors hover:bg-surface-container-highest"
                            title="Edit user"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(user)}
                            className="cursor-pointer rounded-lg p-1.5 text-error transition-colors hover:bg-surface-container-highest"
                            title="Delete user"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-lowest p-4 sm:flex-row">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
              disabled={safeCurrentPage === 1}
              className="cursor-pointer rounded border border-outline-variant px-3 py-1.5 text-body-md transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-body-md font-semibold text-secondary">
              Page {safeCurrentPage} of {pageCount}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pageCount, safeCurrentPage + 1))}
              disabled={safeCurrentPage === pageCount}
              className="cursor-pointer rounded border border-outline-variant px-3 py-1.5 text-body-md transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-label-md font-medium text-secondary">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="cursor-pointer rounded-lg border border-outline-variant bg-surface px-2 py-1 text-label-md outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter pb-10 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-stack-md shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Department Coverage</h3>
              <p className="max-w-2xl text-body-md text-secondary">
                Real-time workforce distribution across departments from the live users API.
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full border border-primary/20">
              {departments.length} Departments
            </span>
          </div>

          <div className="mt-10 grid h-44 grid-cols-5 items-end gap-3 px-2">
            {(() => {
              const displayDepts = departments.length > 0
                ? departments.slice(0, 5)
                : [
                    { id: "1", name: "Customer Support" },
                    { id: "2", name: "IT Support" },
                    { id: "3", name: "Web Support" },
                    { id: "4", name: "Support Agent" },
                    { id: "5", name: "Engineering" },
                  ];

              const countsMap = displayDepts.map((department) => {
                return users.filter((user) => {
                  if (user.departmentId && user.departmentId === department.id) return true;
                  if (user.department?.id && user.department.id === department.id) return true;
                  if (
                    user.department?.name &&
                    department.name &&
                    user.department.name.toLowerCase() === department.name.toLowerCase()
                  )
                    return true;
                  return false;
                }).length;
              });

              const maxCount = Math.max(1, ...countsMap);

              return displayDepts.map((department, index) => {
                const count = countsMap[index];
                const heightPercent = Math.max(25, Math.min(100, Math.round((count / maxCount) * 80) + 20));

                return (
                  <div key={department.id || index} className="flex flex-col items-center h-full justify-end group">
                    <span className="mb-1 text-[11px] font-bold text-on-surface group-hover:text-primary transition-colors truncate max-w-full">
                      {department.name}
                    </span>
                    <div
                      className="relative w-full rounded-t-xl bg-gradient-to-t from-primary/70 to-primary transition-all duration-500 group-hover:from-primary group-hover:to-primary/90 shadow-sm flex items-start justify-center pt-2"
                      style={{ height: `${heightPercent}%` }}
                      title={`${department.name}: ${count} users`}
                    >
                      <span className="text-xs font-bold text-white bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl bg-inverse-surface p-stack-md text-inverse-on-surface shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-[32px] text-primary-fixed">security</span>
              <span className="text-xs font-bold bg-white/10 text-white px-2.5 py-0.5 rounded-full border border-white/20">
                Audit Mode
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold">Security Audit</h3>
            <p className="text-label-md opacity-70">Account lock and MFA signals come from the users API.</p>
            <div className="mt-5 space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-body-md font-bold">
                    {users.filter((user) => Boolean(user.mfaEnabled || (user as any).isMfaEnabled)).length} MFA enabled
                  </p>
                  <p className="text-label-md opacity-60">Across {users.length} accounts</p>
                </div>
                <span className="material-symbols-outlined text-green-400">verified_user</span>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-body-md font-bold">{stats.locked} locked accounts</p>
                  <p className="text-label-md opacity-60">Require administrator review</p>
                </div>
                <span className="material-symbols-outlined text-amber-400">lock_reset</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-xs">
          <div className="modal-pop w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-3">
              <h3 className="flex items-center gap-2 text-headline-md font-bold text-on-surface">
                <span className="material-symbols-outlined text-primary">person_add</span>
                Invite New User
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="cursor-pointer text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <UserFormFields
                form={inviteForm}
                setForm={setInviteForm}
                roles={roles}
                departments={departments}
                includePassword
              />
              <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="cursor-pointer rounded-lg px-4 py-2 text-body-md font-semibold text-secondary transition-colors hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="cursor-pointer rounded-lg bg-primary px-5 py-2 text-body-md font-semibold text-on-primary shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-xs">
          <div className="modal-pop w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-3">
              <h3 className="flex items-center gap-2 text-headline-md font-bold text-on-surface">
                <span className="material-symbols-outlined text-primary">edit</span>
                Edit User Details
              </h3>
              <button onClick={() => setShowEditModal(null)} className="cursor-pointer text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <UserFormFields
                form={editForm}
                setForm={setEditForm}
                roles={roles}
                departments={departments}
              />
              <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="cursor-pointer rounded-lg px-4 py-2 text-body-md font-semibold text-secondary transition-colors hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="cursor-pointer rounded-lg bg-primary px-5 py-2 text-body-md font-semibold text-on-primary transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-xs">
          <div className="modal-pop w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-center shadow-2xl">
            <span className="material-symbols-outlined mb-2 text-4xl text-error">warning</span>
            <h3 className="mb-2 text-headline-md font-bold text-on-surface">Revoke Access?</h3>
            <p className="mb-6 text-body-md text-on-surface-variant">
              Are you sure you want to remove <strong className="text-on-surface">{showDeleteModal.fullName}</strong>?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="cursor-pointer rounded-lg border border-outline-variant px-4 py-2 text-body-md font-semibold transition-colors hover:bg-surface-container-low"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSaving}
                className="cursor-pointer rounded-lg bg-error px-4 py-2 text-body-md font-semibold text-on-error transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Removing..." : "Revoke Access"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-inverse-surface px-4 py-3 text-inverse-on-surface shadow-2xl animate-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="text-body-md font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}

function UserFormFields<T extends Omit<UserFormState, "password"> | UserFormState>({
  form,
  setForm,
  roles,
  departments,
  includePassword = false,
}: {
  form: T;
  setForm: React.Dispatch<React.SetStateAction<T>>;
  roles: AdminRole[];
  departments: AdminDepartment[];
  includePassword?: boolean;
}) {
  const updateForm = <K extends keyof T>(key: K, value: T[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-outline">Full Name</label>
        <input
          type="text"
          required
          value={form.fullName}
          onChange={(event) => updateForm("fullName", event.target.value as T["fullName"])}
          placeholder="e.g. Taylor Reed"
          className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-outline">Corporate Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(event) => updateForm("email", event.target.value as T["email"])}
          placeholder="t.reed@corp.com"
          className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {includePassword && "password" in form && (
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-outline">Temporary Password</label>
          <input
            type="text"
            required
            minLength={6}
            value={(form as UserFormState).password || ""}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value } as unknown as T))}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-outline">Job Title</label>
        <input
          type="text"
          value={form.jobTitle}
          onChange={(event) => updateForm("jobTitle", event.target.value as T["jobTitle"])}
          placeholder="e.g. Support Engineer"
          className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-outline">Assign Role</label>
        <select
          value={form.roleId}
          onChange={(event) => updateForm("roleId", event.target.value as T["roleId"])}
          className="w-full cursor-pointer rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">No role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-outline">Department</label>
        <select
          value={form.departmentId}
          onChange={(event) => updateForm("departmentId", event.target.value as T["departmentId"])}
          className="w-full cursor-pointer rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">No department</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => updateForm("isActive", !form.isActive as T["isActive"])}
        className="flex w-full items-center justify-between rounded-lg py-2 text-left"
      >
        <span className="text-sm font-medium text-on-surface">Active account</span>
        <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-primary" : "bg-outline-variant"}`}>
          <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
        </span>
      </button>
    </>
  );
}
