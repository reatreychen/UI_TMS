"use client";

import { useState, useEffect } from "react";
import { fetchAuditLogs } from "@/src/services/auditLogService";
import { adminUserService } from "@/src/services/adminUserService";

interface AuditLogRow {
  id: string;
  timestamp: string;
  user: string;
  avatar?: string;
  entity: string;
  entityId: string;
  action: string;
  ipAddress: string;
  browserSignature: string;
  fullUserAgent?: string;
  payloadHash?: string;
}

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All Action Types");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [rowsPerPage] = useState(10);

  const initialLogs: AuditLogRow[] = [
    {
      id: "LOG-1001",
      timestamp: "2026-10-14 14:22:01",
      user: "Alex Chen",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB99YeAUskvkHZjvnm2Z5TXXwClWUzk-fVqx_l_Ks62T7nUbhVYmcmGPuh5ZOgoNmEMpKoh569MiedQn3HFqHryJ5Ku4YwC5mdPWmFkHrfsA4rQfSojixfTeTqCTY6AkqI-kzvl-wIco_fRXKeqJHnHuX88nIjuRsoPmujK-VbbNpPTnHFLluX-ANfobhpE-vUQq_6RFX9kn7YrY_roK0IZuvMsjwewcSj8XoY9B1Ra_HAvFzDBiikQ3qvj_n1FJFEB5EYbqbAzFG6a",
      entity: "Ticket_Config",
      entityId: "#992-XC",
      action: "UPDATE",
      ipAddress: "192.168.1.144",
      browserSignature: "Chrome/117.0.0.0",
      fullUserAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
      payloadHash: "0x8f2a91b4c731e05d94bc6",
    },
    {
      id: "LOG-1002",
      timestamp: "2026-10-14 13:05:45",
      user: "Sarah Jenkins",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuArqdja1UL6ZB5gUcFwjGIeIxZJ1-REz22roVMx4zp_S2z_V4e3uSq-LKJl1eUuGxmGEhhL-_tdW5TlsXdwcocJthucfOQNnDoCkiKekgHao3kQFFTGaP_QlXHllbGsyEnKAnC0-3FejcMqnRgj4slF2vYeyV06aDUeUl343gjQGYcJznMcBtrillEljDXO0nz126H8LXUh9lPV6312BUqrKg1TcXfoEFOa-lF3sXliIm5Jphd9jR8orNBkO-46dJK4cL5jxanGi3eC",
      entity: "System_Access",
      entityId: "UID-8812",
      action: "LOGIN",
      ipAddress: "172.24.9.12",
      browserSignature: "Safari/16.6",
      fullUserAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",
      payloadHash: "0x4e12c6a911f4d8b2e5910",
    },
    {
      id: "LOG-1003",
      timestamp: "2026-10-14 12:44:12",
      user: "Marcus Vane",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjnYrJwwX4XrThJtdnPf9Y59jzgDV4QHVit0ptVTT7vGhP2aGnnUltSVuVaqc3oiPIXEJbPQoAGlRt_rx-bGSjyc8hA52Q45MDWrNhNO753EYIBVOlRwbH1WJq0yQa3RcaFjZrBsUon86jSD44mkiQITUg7AAFje4D1q_8JMhJRxkjN7SuNTswtCf_L-tbM_g6xetN-8cezFnNA1fzI4V22iGuqRsbVptjbrDsHysj5l0hNweyy2M5U-fQn-ZGQHIVNBBnud09Q24N",
      entity: "Audit_Log_Export",
      entityId: "EXP-77",
      action: "EXPORT",
      ipAddress: "10.0.0.45",
      browserSignature: "Firefox/118.0",
      fullUserAgent: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:118.0) Gecko/20100101 Firefox/118.0",
      payloadHash: "0x77c2a10459eb19a0f329d",
    },
    {
      id: "LOG-1004",
      timestamp: "2026-10-14 11:15:33",
      user: "Elena Rodriguez",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrZXEmnKVEw7gmc7dqKmE3z-oYHcP-eepvwJJ5R1SiVFJfHPazl7aBuCDp_Gv-jJ5LtW9J3H7Z9OwyIa3dmqqvySUdW-IPBxsz-PfxkV1zjrZgWSIC3W2EcGd2cQilnrLrtUywnyNwZVO9yVIe2QPx_wUQwCMh9mLQDf1C75M5FDgpCx5ctI9RIzSJYM9A1DmYxL5aHVRqDtPleQmVPWxEwlGz9_XcXiLyVk3qLGxyt8MXF3APYralFb-PkpEzt_X4sBnR8-v7_5pg",
      entity: "User_Profile",
      entityId: "USR-004",
      action: "DELETE",
      ipAddress: "45.76.12.8",
      browserSignature: "Edge/117.0.2045.47",
      fullUserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47",
      payloadHash: "0x9911e3b7d1000cf56aa21",
    },
    {
      id: "LOG-1005",
      timestamp: "2026-10-14 10:50:09",
      user: "System Daemon",
      entity: "Global_Config",
      entityId: "SYS-MAIN",
      action: "AUTOMATION",
      ipAddress: "::1 (Local)",
      browserSignature: "CronJob/TaskScheduler",
      fullUserAgent: "Kinetic-Daemon-Internal-Worker/4.2.1-stable",
      payloadHash: "0x1102aef773b092c45189f",
    },
  ];

  const [logs, setLogs] = useState<AuditLogRow[]>(initialLogs);

  // Global search bar listener
  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvt = e as CustomEvent<string>;
      setCurrentPage(1);
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

  useEffect(() => {
    let cancelled = false;

    async function loadAuditLogs() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [records, users] = await Promise.all([
          fetchAuditLogs(
            actionFilter === "All Action Types"
              ? undefined
              : { action: actionFilter.toUpperCase() },
          ),
          adminUserService.getUsers().catch(() => []),
        ]);
        if (cancelled) return;

        const usersById = new Map(users.map((user) => [user.id, user]));
        setLogs(
          records.map((record) => {
            const user = record.userId ? usersById.get(record.userId) : undefined;
            return {
              id: record.id,
              timestamp: record.createdAt,
              user: user?.fullName || record.userId || "System",
              avatar: user?.profileImage || undefined,
              entity: record.entity,
              entityId: record.entityId,
              action: record.action,
              ipAddress: record.ipAddress || "—",
              browserSignature: record.browserSignature || "—",
              fullUserAgent: record.browserSignature || undefined,
            };
          }),
        );
      } catch (error) {
        if (!cancelled) {
          setLogs([]);
          setErrorMessage(error instanceof Error ? error.message : "Could not load audit logs.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void loadAuditLogs();
    return () => {
      cancelled = true;
    };
  }, [actionFilter, refreshKey]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((key) => key + 1);
    triggerToast("Refreshing audit logs...");
  };

  const handleExportCSV = () => {
    setIsExportingCSV(true);
    try {
      const headers = ["timestamp", "user", "entity", "entityId", "action", "ipAddress", "browserSignature"];
      const csv = [
        headers.join(","),
        ...logs.map((log) =>
          headers
            .map((header) => `"${String(log[header as keyof AuditLogRow] ?? "").replace(/"/g, '""')}"`)
            .join(","),
        ),
      ].join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "audit-logs.csv";
      link.click();
      URL.revokeObjectURL(url);
      triggerToast("Compliance audit log exported to CSV.");
    } finally {
      setIsExportingCSV(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.timestamp.includes(searchQuery);

    const matchesAction =
      actionFilter === "All Action Types" ||
      log.action.toLowerCase() === actionFilter.toLowerCase();

    return matchesSearch && matchesAction;
  });
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / rowsPerPage));
  const visibleLogs = filteredLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const activeUserCount = new Set(logs.map((log) => log.user)).size;
  const securityAlertCount = logs.filter((log) => ["DELETE", "UPDATE"].includes(log.action.toUpperCase())).length;

  return (
    <div className="space-y-stack-lg max-w-[1440px] mx-auto w-full animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant font-label-md mb-2 text-xs">
            <span>Reports</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">Audit Logs</span>
          </nav>
          <h1 className="font-display text-display text-on-surface font-bold">
            System Audit Logs
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Monitoring system-wide actions for compliance and security forensics.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={isExportingCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-lg font-label-md text-secondary hover:bg-surface-container-low transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[20px] ${isExportingCSV ? "animate-spin" : ""}`}>
              {isExportingCSV ? "sync" : "file_download"}
            </span>
            <span>{isExportingCSV ? "Exporting..." : "Export CSV"}</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-label-md font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? "animate-spin" : ""}`}>
              refresh
            </span>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Dashboard Overview (Bento Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-stack-md">
        <div className="bg-white border border-outline-variant rounded-xl p-stack-md shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary font-label-md text-label-md uppercase font-semibold">
              TOTAL EVENTS
            </span>
            <span className="material-symbols-outlined text-primary bg-primary-container/20 p-1 rounded">
              event_note
            </span>
          </div>
          <div className="text-headline-lg font-display text-on-surface font-bold">{logs.length}</div>
          <div className="text-xs text-green-600 font-bold mt-1">↑ 12% from last week</div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-stack-md shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary font-label-md text-label-md uppercase font-semibold">
              ACTIVE USERS
            </span>
            <span className="material-symbols-outlined text-primary bg-primary-container/20 p-1 rounded">
              group
            </span>
          </div>
          <div className="text-headline-lg font-display text-on-surface font-bold">{activeUserCount}</div>
          <div className="text-xs text-secondary mt-1">Global enterprise access</div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-stack-md shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary font-label-md text-label-md uppercase font-semibold">
              SECURITY ALERTS
            </span>
            <span className="material-symbols-outlined text-error bg-error-container p-1 rounded">
              warning
            </span>
          </div>
          <div className="text-headline-lg font-display text-on-surface font-bold">{securityAlertCount}</div>
          <div className="text-xs text-error font-bold mt-1">Action required (3)</div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-stack-md shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary font-label-md text-label-md uppercase font-semibold">
              UPTIME
            </span>
            <span className="material-symbols-outlined text-primary bg-primary-container/20 p-1 rounded">
              speed
            </span>
          </div>
          <div className="text-headline-lg font-display text-on-surface font-bold">—</div>
          <div className="text-xs text-secondary mt-1">Server region: US-East-1</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-outline-variant rounded-t-xl p-stack-md flex flex-wrap items-center gap-stack-md shadow-xs">
        <div className="flex-1 min-w-[240px] relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchQuery(e.target.value);
            }}
            placeholder="Search by user, entity, or ID..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all text-body-md"
          />
        </div>

        <div className="flex flex-wrap items-center gap-stack-md">
          <select
            value={actionFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setActionFilter(e.target.value);
            }}
            className="bg-white border border-outline-variant rounded-lg px-4 py-2 font-label-md text-secondary focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
          >
            <option value="All Action Types">All Action Types</option>
            <option value="Create">Create</option>
            <option value="Update">Update</option>
            <option value="Delete">Delete</option>
            <option value="Login">Login</option>
            <option value="Export">Export</option>
            <option value="Automation">Automation</option>
          </select>

          <div className="flex items-center bg-white border border-outline-variant rounded-lg overflow-hidden">
            <span className="material-symbols-outlined text-[20px] px-3 text-secondary border-r border-outline-variant">
              calendar_today
            </span>
            <input
              type="text"
              readOnly
              value="Oct 01 - Oct 14, 2026"
              className="px-4 py-2 border-none focus:ring-0 font-label-md text-secondary w-44 bg-transparent outline-none cursor-default"
            />
          </div>

          <button
            onClick={() => triggerToast("Advanced filter tuning panel opened.")}
            className="p-2 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container-low transition-colors cursor-pointer"
            title="Tune Filters"
          >
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white border-x border-b border-outline-variant rounded-b-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-y border-outline-variant">
              <tr>
                <th className="px-6 py-3 font-label-md text-secondary uppercase tracking-wider text-xs">
                  Timestamp
                </th>
                <th className="px-6 py-3 font-label-md text-secondary uppercase tracking-wider text-xs">
                  User
                </th>
                <th className="px-6 py-3 font-label-md text-secondary uppercase tracking-wider text-xs">
                  Entity
                </th>
                <th className="px-6 py-3 font-label-md text-secondary uppercase tracking-wider text-xs">
                  Entity ID
                </th>
                <th className="px-6 py-3 font-label-md text-secondary uppercase tracking-wider text-xs">
                  Action
                </th>
                <th className="px-6 py-3 font-label-md text-secondary uppercase tracking-wider text-xs">
                  IP Address
                </th>
                <th className="px-6 py-3 font-label-md text-secondary uppercase tracking-wider text-xs">
                  Browser Signature
                </th>
                <th className="px-6 py-3 font-label-md text-secondary uppercase tracking-wider text-xs text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-outline">
                    Loading audit logs...
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-error">
                    {errorMessage}
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-outline">
                    No system logs matching current query parameters.
                  </td>
                </tr>
              ) : (
                visibleLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-100 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-code text-on-surface">{log.timestamp}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {log.avatar ? (
                          <div className="w-6 h-6 rounded-full bg-surface-dim overflow-hidden flex-shrink-0">
                            <img src={log.avatar} alt={log.user} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-surface-dim flex items-center justify-center text-secondary">
                            <span className="material-symbols-outlined text-[16px]">person</span>
                          </div>
                        )}
                        <span className="font-bold text-on-surface group-hover:text-primary transition-colors">
                          {log.user}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-medium">{log.entity}</td>
                    <td className="px-6 py-4 font-code text-on-surface-variant">{log.entityId}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          log.action === "UPDATE"
                            ? "bg-blue-100 text-blue-800"
                            : log.action === "LOGIN"
                            ? "bg-green-100 text-green-800"
                            : log.action === "EXPORT"
                            ? "bg-purple-100 text-purple-800"
                            : log.action === "DELETE"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-code text-on-surface-variant">{log.ipAddress}</td>
                    <td
                      className="px-6 py-4 truncate max-w-[150px] text-on-surface-variant font-mono text-xs"
                      title={log.fullUserAgent || log.browserSignature}
                    >
                      {log.browserSignature}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="opacity-0 group-hover:opacity-100 material-symbols-outlined text-secondary hover:text-primary transition-all cursor-pointer"
                        title="View Log Telemetry Payload"
                      >
                        visibility
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-stack-md border-t border-outline-variant">
            <span className="font-label-md text-secondary font-medium">
            Showing {filteredLogs.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-2 border border-outline-variant rounded-lg text-secondary disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <span className="px-2 text-label-md text-secondary">
                Page {currentPage} of {totalPages}
              </span>
              <button
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="p-2 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container-highest transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Compliance Note */}
      <div className="p-stack-md bg-secondary-container/10 border border-secondary-container rounded-xl flex items-start gap-stack-md shadow-xs">
        <span className="material-symbols-outlined text-secondary mt-1">info</span>
        <div>
          <h4 className="font-bold text-on-secondary-container text-body-md">Data Compliance Policy</h4>
          <p className="text-xs text-secondary max-w-2xl mt-1 leading-relaxed">
            Logs are retained for 365 days in accordance with SOC2 and GDPR requirements. Any manual alteration of these logs is strictly prohibited and cryptographically monitored by the security gateway. Contact the InfoSec team for advanced forensic exports.
          </p>
        </div>
      </div>

      {/* Log Detail Forensic Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">visibility</span>
                Log Entry Forensics [{selectedLog.id}]
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-body-md">
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-outline font-bold">TIMESTAMP:</span>
                  <span className="text-on-surface">{selectedLog.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline font-bold">USER:</span>
                  <span className="text-primary font-bold">{selectedLog.user}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline font-bold">ACTION:</span>
                  <span className="font-bold text-on-surface">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline font-bold">TARGET ENTITY:</span>
                  <span className="text-on-surface">{selectedLog.entity} ({selectedLog.entityId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline font-bold">ORIGIN IP:</span>
                  <span className="text-on-surface">{selectedLog.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline font-bold">HASH SIG:</span>
                  <span className="text-secondary">{selectedLog.payloadHash || "Not provided by API"}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-outline uppercase mb-1">Full User Agent</p>
                <p className="bg-slate-100 p-2.5 rounded-lg text-xs font-mono text-on-surface-variant break-all">
                  {selectedLog.fullUserAgent || selectedLog.browserSignature}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const logId = selectedLog.id;
                    setSelectedLog(null);
                    triggerToast(`Cryptographic audit proof generated for ${logId}`);
                  }}
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all cursor-pointer"
                >
                  Export Audit Proof
                </button>
              </div>
            </div>
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
