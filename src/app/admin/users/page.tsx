"use client";

import { useState, useEffect } from "react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  initials: string;
  initialsBg: string;
  initialsColor: string;
  role: string;
  department: string;
  status: "Online" | "Away" | "Offline";
  lastActive: string;
}

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<UserItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<UserItem | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Invite Form State
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Agent");
  const [inviteDept, setInviteDept] = useState("Customer Support");

  // Initial user dataset matching specs
  const initialUsers: UserItem[] = [
    {
      id: "USR-001",
      name: "Jordan Smith",
      email: "j.smith@corp.com",
      initials: "JS",
      initialsBg: "bg-primary-fixed",
      initialsColor: "text-primary",
      role: "Senior Agent",
      department: "Customer Support",
      status: "Online",
      lastActive: "Just now",
    },
    {
      id: "USR-002",
      name: "Morgan Ellis",
      email: "m.ellis@corp.com",
      initials: "ME",
      initialsBg: "bg-secondary-container",
      initialsColor: "text-secondary",
      role: "System Admin",
      department: "IT Operations",
      status: "Away",
      lastActive: "14 mins ago",
    },
    {
      id: "USR-003",
      name: "Kim Dang",
      email: "k.dang@corp.com",
      initials: "KD",
      initialsBg: "bg-tertiary-fixed",
      initialsColor: "text-tertiary",
      role: "Lead Developer",
      department: "Engineering",
      status: "Offline",
      lastActive: "2 days ago",
    },
    {
      id: "USR-004",
      name: "Riley Brown",
      email: "r.brown@corp.com",
      initials: "RB",
      initialsBg: "bg-error-container",
      initialsColor: "text-error",
      role: "Agent",
      department: "Billing",
      status: "Online",
      lastActive: "Active now",
    },
    {
      id: "USR-005",
      name: "Alex Rivera",
      email: "alex.rivera@enterprise.tms",
      initials: "AR",
      initialsBg: "bg-primary-container",
      initialsColor: "text-on-primary",
      role: "Super Admin",
      department: "Executive",
      status: "Online",
      lastActive: "Active now",
    },
    {
      id: "USR-006",
      name: "Sarah Jenkins",
      email: "s.jenkins@corp.com",
      initials: "SJ",
      initialsBg: "bg-purple-100",
      initialsColor: "text-purple-700",
      role: "Technical Agent",
      department: "Tier 2 Support",
      status: "Online",
      lastActive: "5 mins ago",
    },
    {
      id: "USR-007",
      name: "Marcus Thompson",
      email: "m.thompson@corp.com",
      initials: "MT",
      initialsBg: "bg-blue-100",
      initialsColor: "text-blue-700",
      role: "Security Lead",
      department: "InfoSec",
      status: "Online",
      lastActive: "1 min ago",
    },
    {
      id: "USR-008",
      name: "Elena Rossi",
      email: "e.rossi@corp.com",
      initials: "ER",
      initialsBg: "bg-amber-100",
      initialsColor: "text-amber-800",
      role: "Manager",
      department: "Finance",
      status: "Away",
      lastActive: "30 mins ago",
    },
  ];

  const [users, setUsers] = useState<UserItem[]>(initialUsers);

  // Listen to global admin search bar in header
  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvt = e as CustomEvent<string>;
      setSearchQuery(customEvt.detail || "");
    };

    window.addEventListener("admin-search", handleSearch);
    return () => window.removeEventListener("admin-search", handleSearch);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "All Roles" ||
      (roleFilter === "Admin" && u.role.toLowerCase().includes("admin")) ||
      (roleFilter === "Agent" && u.role.toLowerCase().includes("agent")) ||
      (roleFilter === "Manager" && u.role.toLowerCase().includes("manager"));

    const matchesStatus =
      statusFilter === "All Statuses" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      triggerToast("Users dataset exported to CSV successfully!");
    }, 800);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const names = inviteName.trim().split(" ");
    const initials =
      names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0].substring(0, 2).toUpperCase();

    const newUser: UserItem = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      initials,
      initialsBg: "bg-primary-fixed",
      initialsColor: "text-primary",
      role: inviteRole,
      department: inviteDept,
      status: "Offline",
      lastActive: "Invited",
    };

    setUsers([newUser, ...users]);
    setInviteName("");
    setInviteEmail("");
    setShowInviteModal(false);
    triggerToast(`Invitation sent to ${inviteEmail}!`);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    setUsers(users.map((u) => (u.id === showEditModal.id ? showEditModal : u)));
    triggerToast(`User ${showEditModal.name} updated.`);
    setShowEditModal(null);
  };

  const handleDeleteConfirm = () => {
    if (!showDeleteModal) return;
    setUsers(users.filter((u) => u.id !== showDeleteModal.id));
    triggerToast(`User ${showDeleteModal.name} has been removed.`);
    setShowDeleteModal(null);
  };

  return (
    <div className="space-y-stack-lg max-w-[1440px] mx-auto w-full animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Users &amp; Stakeholders
          </h2>
          <p className="text-body-lg text-secondary mt-1">
            Manage your organization's workforce, support agents, and system access permissions.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant bg-surface hover:bg-surface-container-low text-on-surface font-semibold rounded-lg transition-all active:scale-95 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined ${isExporting ? "animate-spin" : ""}`}>
              {isExporting ? "sync" : "download"}
            </span>
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-semibold rounded-lg shadow-sm hover:opacity-90 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined">person_add</span>
            <span>Invite User</span>
          </button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 group">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary p-2 bg-primary-fixed rounded-lg group-hover:scale-110 transition-transform">
              group
            </span>
            <span className="text-label-md text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
              +12%
            </span>
          </div>
          <div>
            <p className="text-label-md text-secondary uppercase tracking-wider font-semibold">
              Total Users
            </p>
            <p className="text-headline-md font-bold text-on-surface">1,284</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 group">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-purple-600 p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
              support_agent
            </span>
            <span className="text-label-md text-secondary font-bold bg-surface-container-high px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <div>
            <p className="text-label-md text-secondary uppercase tracking-wider font-semibold">
              Active Agents
            </p>
            <p className="text-headline-md font-bold text-on-surface">42</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 group">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-blue-600 p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
              hourglass_empty
            </span>
            <span className="text-label-md text-error font-bold bg-error-container/20 px-2 py-0.5 rounded-full">
              3 Pending
            </span>
          </div>
          <div>
            <p className="text-label-md text-secondary uppercase tracking-wider font-semibold">
              Invites Pending
            </p>
            <p className="text-headline-md font-bold text-on-surface">18</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 group">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-orange-600 p-2 bg-orange-100 rounded-lg group-hover:scale-110 transition-transform">
              shield_person
            </span>
            <span className="text-label-md text-secondary font-bold bg-orange-50 px-2 py-0.5 rounded-full">
              High Security
            </span>
          </div>
          <div>
            <p className="text-label-md text-secondary uppercase tracking-wider font-semibold">
              Admins
            </p>
            <p className="text-headline-md font-bold text-on-surface">6</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-body-md outline-none focus:ring-2 focus:ring-primary font-medium cursor-pointer"
            >
              <option value="All Roles">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Agent">Agent</option>
              <option value="Manager">Manager</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-body-md outline-none focus:ring-2 focus:ring-primary font-medium cursor-pointer"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Online">Online</option>
              <option value="Away">Away</option>
              <option value="Offline">Offline</option>
            </select>

            {searchQuery && (
              <span className="text-xs text-primary font-semibold">
                Filter query: "{searchQuery}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-outline text-label-md font-medium">
            <span>
              Showing {filteredUsers.length} of {users.length} users
            </span>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-label-md uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-label-md uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-label-md uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-label-md uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-label-md uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-label-md uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-outline">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-surface-container-low/70 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${user.initialsBg} flex items-center justify-center ${user.initialsColor} font-bold text-body-md shadow-xs`}
                        >
                          {user.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                            {user.name}
                          </p>
                          <p className="text-label-md text-outline font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-body-md font-medium text-on-surface-variant">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-body-md text-on-surface-variant">
                        {user.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            user.status === "Online"
                              ? "bg-green-500 ring-2 ring-green-500/20"
                              : user.status === "Away"
                              ? "bg-orange-400 ring-2 ring-orange-400/20"
                              : "bg-slate-300"
                          }`}
                        />
                        <span className="text-body-md font-medium">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-outline text-label-md">{user.lastActive}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                        <button
                          onClick={() => setShowEditModal(user)}
                          className="p-1.5 hover:bg-surface-container-highest rounded-lg transition-colors text-primary cursor-pointer"
                          title="Edit User"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(user)}
                          className="p-1.5 hover:bg-surface-container-highest rounded-lg transition-colors text-error cursor-pointer"
                          title="Revoke / Delete User"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border border-outline-variant hover:bg-surface-container-low transition-colors disabled:opacity-50 text-body-md cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-3 py-1.5 rounded font-semibold text-body-md cursor-pointer ${
                currentPage === 1
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant hover:bg-surface-container-low"
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`px-3 py-1.5 rounded font-semibold text-body-md cursor-pointer ${
                currentPage === 2
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant hover:bg-surface-container-low"
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`px-3 py-1.5 rounded font-semibold text-body-md cursor-pointer ${
                currentPage === 3
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant hover:bg-surface-container-low"
              }`}
            >
              3
            </button>
            <span className="px-2 text-outline">...</span>
            <button
              onClick={() => setCurrentPage(128)}
              className={`px-3 py-1.5 rounded font-semibold text-body-md cursor-pointer ${
                currentPage === 128
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant hover:bg-surface-container-low"
              }`}
            >
              128
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1.5 rounded border border-outline-variant hover:bg-surface-container-low transition-colors text-body-md cursor-pointer"
            >
              Next
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-label-md text-secondary font-medium">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-surface border border-outline-variant rounded-lg px-2 py-1 text-label-md outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contextual Insights / Asymmetric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter pb-10">
        {/* Department Activity Card */}
        <div className="lg:col-span-2 bg-surface-container-low p-stack-md rounded-xl border border-outline-variant relative overflow-hidden group shadow-xs">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold">
                Department Activity
              </h3>
              <p className="text-body-md text-secondary max-w-md">
                Real-time engagement across departments shows Support as the leading active group today with 98% online presence.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-5 items-end gap-3 h-32">
              <div className="bg-primary/20 rounded-t-lg h-[60%] group-hover:bg-primary/40 transition-all duration-500 relative">
                <span className="absolute -top-6 inset-x-0 text-center text-[10px] font-bold text-outline">
                  IT
                </span>
              </div>
              <div className="bg-primary/20 rounded-t-lg h-[40%] group-hover:bg-primary/40 transition-all duration-500 delay-75 relative">
                <span className="absolute -top-6 inset-x-0 text-center text-[10px] font-bold text-outline">
                  Eng
                </span>
              </div>
              <div className="bg-primary rounded-t-lg h-[95%] shadow-md relative">
                <span className="absolute -top-6 inset-x-0 text-center text-[10px] font-bold text-primary">
                  Support
                </span>
              </div>
              <div className="bg-primary/20 rounded-t-lg h-[70%] group-hover:bg-primary/40 transition-all duration-500 delay-150 relative">
                <span className="absolute -top-6 inset-x-0 text-center text-[10px] font-bold text-outline">
                  Finance
                </span>
              </div>
              <div className="bg-primary/20 rounded-t-lg h-[30%] group-hover:bg-primary/40 transition-all duration-500 delay-200 relative">
                <span className="absolute -top-6 inset-x-0 text-center text-[10px] font-bold text-outline">
                  Exec
                </span>
              </div>
            </div>
          </div>
          {/* Aesthetic Glass Element */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
        </div>

        {/* Security Audit Card */}
        <div className="bg-inverse-surface text-inverse-on-surface p-stack-md rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <span className="material-symbols-outlined text-[32px] mb-2 text-primary-fixed">
                security
              </span>
              <h3 className="font-headline-md text-headline-md font-bold">Security Audit</h3>
              <p className="text-label-md opacity-70">Last scan: Today at 04:00 AM</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
                <div>
                  <p className="text-body-md font-semibold">2FA Enabled</p>
                  <p className="text-label-md opacity-60">94% compliance across agents</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="material-symbols-outlined text-orange-400">warning</span>
                <div>
                  <p className="text-body-md font-semibold">Pending Approvals</p>
                  <p className="text-label-md opacity-60">3 high-level access requests</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => triggerToast("Security audit reports loaded for review.")}
            className="mt-6 w-full py-2.5 bg-white text-inverse-surface font-bold rounded-lg hover:bg-primary-fixed transition-colors shadow-sm cursor-pointer"
          >
            Review Reports
          </button>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_add</span>
                Invite New User
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Taylor Reed"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="t.reed@corp.com"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Assign Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="Senior Agent">Senior Agent</option>
                  <option value="Agent">Agent</option>
                  <option value="System Admin">System Admin</option>
                  <option value="Lead Developer">Lead Developer</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Department
                </label>
                <select
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="Customer Support">Customer Support</option>
                  <option value="IT Operations">IT Operations</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Billing">Billing</option>
                  <option value="InfoSec">InfoSec</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit</span>
                Edit User Details
              </h3>
              <button
                onClick={() => setShowEditModal(null)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={showEditModal.name}
                  onChange={(e) => setShowEditModal({ ...showEditModal, name: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={showEditModal.role}
                  onChange={(e) => setShowEditModal({ ...showEditModal, role: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={showEditModal.department}
                  onChange={(e) => setShowEditModal({ ...showEditModal, department: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <span className="material-symbols-outlined text-4xl text-error mb-2">warning</span>
            <h3 className="text-headline-md font-bold text-on-surface mb-2">Revoke Access?</h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              Are you sure you want to revoke system access for <strong className="text-on-surface">{showDeleteModal.name}</strong>?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-body-md font-semibold border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-body-md font-semibold bg-error text-on-error rounded-lg hover:opacity-90 transition-all cursor-pointer"
              >
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="text-body-md font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
