"use client";

import { useState, useEffect } from "react";

interface RoleRecord {
  id: string;
  name: string;
  badge: "DEFAULT" | "CUSTOM";
  description: string;
  usersAssigned: number;
  lastModified: string;
}

interface PermissionItem {
  id: string;
  title: string;
  desc: string;
  enabled: boolean;
  isDangerous?: boolean;
}

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<string>("Support Manager");
  const [selectedModule, setSelectedModule] = useState<string>("Ticket Management");
  const [enableAll, setEnableAll] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Create Role Form
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  // Initial Roles Dataset matching HTML mockup
  const initialRoles: RoleRecord[] = [
    {
      id: "ROLE-1",
      name: "Super Admin",
      badge: "DEFAULT",
      description: "Unrestricted access to all system modules and data.",
      usersAssigned: 2,
      lastModified: "Oct 12, 2023",
    },
    {
      id: "ROLE-2",
      name: "Support Manager",
      badge: "DEFAULT",
      description: "Management of ticket flows, reporting, and agent shifts.",
      usersAssigned: 5,
      lastModified: "Nov 04, 2023",
    },
    {
      id: "ROLE-3",
      name: "Senior Agent",
      badge: "DEFAULT",
      description: "Primary ticket handling with escalation permissions.",
      usersAssigned: 24,
      lastModified: "Dec 01, 2023",
    },
    {
      id: "ROLE-4",
      name: "Junior Agent",
      badge: "DEFAULT",
      description: "Basic ticket entry and customer communication access.",
      usersAssigned: 56,
      lastModified: "Dec 01, 2023",
    },
    {
      id: "ROLE-5",
      name: "Billing Specialist",
      badge: "CUSTOM",
      description: "Access to invoices, credit memos, and payment processing.",
      usersAssigned: 3,
      lastModified: "Jan 15, 2024",
    },
  ];

  const [roles, setRoles] = useState<RoleRecord[]>(initialRoles);

  // Permission Matrix State
  const [ticketPermissions, setTicketPermissions] = useState<PermissionItem[]>([
    { id: "read", title: "Read Access", desc: "View all tickets in assigned department", enabled: true },
    { id: "create", title: "Create Ticket", desc: "Initiate new ticket workflows", enabled: true },
    { id: "edit", title: "Edit Ticket", desc: "Modify metadata and priority levels", enabled: true },
    { id: "assign", title: "Assign Tasks", desc: "Delegate tickets to other agents", enabled: true },
    { id: "bulk", title: "Bulk Actions", desc: "Batch edit and resolve operations", enabled: true },
    { id: "delete", title: "Permanent Delete", desc: "Bypass archive and purge record", enabled: false, isDangerous: true },
  ]);

  const [userPermissions, setUserPermissions] = useState<PermissionItem[]>([
    { id: "invite", title: "Invite Agents", desc: "Add new support staff to organization", enabled: true },
    { id: "reset_pwd", title: "Reset Passwords", desc: "Force credentials reset for team", enabled: true },
  ]);

  // Listen to global admin header search
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

  const handleTogglePermission = (type: "ticket" | "user", id: string) => {
    if (type === "ticket") {
      setTicketPermissions(
        ticketPermissions.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
      );
    } else {
      setUserPermissions(
        userPermissions.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
      );
    }
  };

  const handleEnableAllToggle = () => {
    const nextState = !enableAll;
    setEnableAll(nextState);
    setTicketPermissions(ticketPermissions.map((p) => ({ ...p, enabled: nextState })));
    setUserPermissions(userPermissions.map((p) => ({ ...p, enabled: nextState })));
    triggerToast(nextState ? "All module permissions enabled." : "All module permissions disabled.");
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      triggerToast(`Permission matrix saved for role '${selectedRole}'. Audit trail logged.`);
    }, 800);
  };

  const handleResetPermissions = () => {
    setTicketPermissions(ticketPermissions.map((p) => ({ ...p, enabled: !p.isDangerous })));
    setUserPermissions(userPermissions.map((p) => ({ ...p, enabled: true })));
    triggerToast(`Permissions reset to default policies for '${selectedRole}'.`);
  };

  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRole: RoleRecord = {
      id: `ROLE-${roles.length + 1}`,
      name: newRoleName.trim(),
      badge: "CUSTOM",
      description: newRoleDesc.trim() || "Custom security boundary policy.",
      usersAssigned: 0,
      lastModified: "Just now",
    };

    setRoles([...roles, newRole]);
    setSelectedRole(newRole.name);
    setNewRoleName("");
    setNewRoleDesc("");
    setShowCreateModal(false);
    triggerToast(`Custom role '${newRole.name}' created!`);
  };

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
        {/* Total Roles */}
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

        {/* Active Permissions */}
        <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant flex items-center gap-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="bg-secondary-container p-3 rounded-lg">
            <span className="material-symbols-outlined text-on-secondary-container">vpn_key</span>
          </div>
          <div>
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-semibold">
              Active Permissions
            </p>
            <p className="text-headline-md font-headline-md text-on-surface font-bold">124</p>
          </div>
        </div>

        {/* Custom Roles */}
        <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant flex items-center gap-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="bg-surface-variant p-3 rounded-lg">
            <span className="material-symbols-outlined text-on-surface-variant">edit_attributes</span>
          </div>
          <div>
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-semibold">
              Custom Roles
            </p>
            <p className="text-headline-md font-headline-md text-on-surface font-bold">
              {roles.filter((r) => r.badge === "CUSTOM").length}
            </p>
          </div>
        </div>

        {/* Security Audit */}
        <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant flex items-center gap-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="bg-green-100 p-3 rounded-lg">
            <span className="material-symbols-outlined text-green-700">verified_user</span>
          </div>
          <div>
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-semibold">
              Security Audit
            </p>
            <p className="text-headline-md font-headline-md text-green-700 font-bold">Compliant</p>
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
            <button
              onClick={() => triggerToast("Roles configuration exported (JSON).")}
              className="px-3 py-1.5 border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">download</span> Export
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
                <th className="px-gutter py-4 font-semibold">Last Modified</th>
                <th className="px-gutter py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
              {roles.map((role) => {
                const isSelected = selectedRole === role.name;
                return (
                  <tr
                    key={role.id}
                    onClick={() => setSelectedRole(role.name)}
                    className={`transition-colors group cursor-pointer ${
                      isSelected
                        ? "bg-primary/5 border-l-4 border-l-primary font-medium"
                        : "hover:bg-primary/5"
                    }`}
                  >
                    <td className="px-gutter py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-on-surface">{role.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            role.badge === "DEFAULT"
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary-container text-on-secondary-container"
                          }`}
                        >
                          {role.badge}
                        </span>
                      </div>
                    </td>
                    <td className="px-gutter py-4 text-on-surface-variant">{role.description}</td>
                    <td className="px-gutter py-4 text-center font-bold">{role.usersAssigned}</td>
                    <td className="px-gutter py-4 text-on-surface-variant">{role.lastModified}</td>
                    <td className="px-gutter py-4 text-right">
                      <div
                        className={`flex justify-end gap-2 transition-opacity ${
                          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRole(role.name);
                            triggerToast(`Editing permissions for role '${role.name}'`);
                          }}
                          className="p-1.5 hover:bg-surface-container rounded-lg text-primary cursor-pointer"
                          title="Edit Permissions"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const clonedName = `${role.name} (Copy)`;
                            setRoles([
                              ...roles,
                              {
                                ...role,
                                id: `ROLE-${roles.length + 1}`,
                                name: clonedName,
                                badge: "CUSTOM",
                                lastModified: "Just now",
                              },
                            ]);
                            triggerToast(`Cloned role to '${clonedName}'`);
                          }}
                          className="p-1.5 hover:bg-surface-container rounded-lg text-secondary cursor-pointer"
                          title="Duplicate Role"
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                        {role.badge === "CUSTOM" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRoles(roles.filter((r) => r.id !== role.id));
                              triggerToast(`Deleted custom role '${role.name}'`);
                            }}
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
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">verified</span>
              <div>
                <p className="font-bold text-primary text-body-md leading-none">{selectedRole}</p>
                <p className="text-[11px] text-on-surface-variant mt-1 italic">
                  Active Config Session
                </p>
              </div>
            </div>

            <div className="space-y-1">
              {["Ticket Management", "User Management", "Reporting Suite", "System Policies"].map(
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
                      <span>{mod}</span>
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
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
            {/* Module Section: Ticket Management */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <span className="material-symbols-outlined">confirmation_number</span>
                <span className="uppercase tracking-widest text-[11px]">Ticket Management</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ticketPermissions.map((perm) => (
                  <div
                    key={perm.id}
                    onClick={() => handleTogglePermission("ticket", perm.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      perm.isDangerous
                        ? "bg-error-container/10 border-error/30 hover:border-error"
                        : perm.enabled
                        ? "border-primary/40 bg-primary/5"
                        : "border-outline-variant hover:border-outline"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`font-bold ${perm.isDangerous ? "text-error" : "text-on-surface"}`}>
                        {perm.title}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">{perm.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={perm.enabled}
                      onChange={() => handleTogglePermission("ticket", perm.id)}
                      className={`h-5 w-5 rounded focus:ring-primary cursor-pointer ${
                        perm.isDangerous ? "text-error focus:ring-error" : "text-primary"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <hr className="border-outline-variant" />

            {/* Module Section: User Management */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-secondary font-bold mb-2">
                <span className="material-symbols-outlined">person_add</span>
                <span className="uppercase tracking-widest text-[11px]">User Management</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userPermissions.map((perm) => (
                  <div
                    key={perm.id}
                    onClick={() => handleTogglePermission("user", perm.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      perm.enabled ? "border-primary/40 bg-primary/5" : "border-outline-variant hover:border-outline"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface">{perm.title}</span>
                      <span className="text-[11px] text-on-surface-variant">{perm.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={perm.enabled}
                      onChange={() => handleTogglePermission("user", perm.id)}
                      className="h-5 w-5 text-primary rounded border-outline focus:ring-primary cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

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
                  disabled={isSaving}
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
