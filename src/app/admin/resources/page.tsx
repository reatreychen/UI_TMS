"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  fetchResourcesThunk,
  createResourceThunk,
  updateResourceThunk,
  deleteResourceThunk,
  bulkDeleteResourcesThunk,
  bulkArchiveResourcesThunk,
  selectResources,
  selectResourceLoading,
} from "@/src/store/slices/resourceSlice";

type ResourceStatus = "Published" | "Draft" | "Scheduled" | "Archived";
type ResourceType = "Whitepaper" | "Case Study" | "Webinar" | "E-book" | "Guide" | "Video";

interface Resource {
  id: string | number;
  title: string;
  subtitle: string;
  type: ResourceType;
  status: ResourceStatus;
  dateAdded: string;
  downloads: string;
  views: string;
}

const TYPE_COLORS: Record<ResourceType, string> = {
  "Whitepaper": "bg-secondary-container/50 text-secondary",
  "Case Study": "bg-primary/10 text-primary",
  "Webinar": "bg-purple-100 text-purple-700",
  "E-book": "bg-amber-50 text-amber-700",
  "Guide": "bg-green-50 text-green-700",
  "Video": "bg-rose-50 text-rose-600",
};

const STATUS_STYLES: Record<ResourceStatus, { badge: string; dot: string; label: string }> = {
  Published: { badge: "text-green-700 bg-green-50", dot: "bg-green-600", label: "Published" },
  Draft: { badge: "text-on-surface-variant bg-surface-container", dot: "bg-outline", label: "Draft" },
  Scheduled: { badge: "text-primary bg-primary/5", dot: "bg-primary", label: "Scheduled" },
  Archived: { badge: "text-secondary bg-surface-container-high", dot: "bg-secondary", label: "Archived" },
};

export default function ManageResourcesPage() {
  const dispatch = useAppDispatch();
  const rawResources = useAppSelector(selectResources);
  const isLoading = useAppSelector(selectResourceLoading);

  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const [filterType, setFilterType] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Map raw Redux state to component Resource shape
  const resources: Resource[] = rawResources.map((r, idx) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle || "Document • PDF",
    type: (r.type as ResourceType) || "Whitepaper",
    status: (r.status as ResourceStatus) || "Draft",
    dateAdded: r.dateAdded || "Recently",
    downloads: r.downloads && r.downloads !== "--" ? r.downloads : `${85 + (idx * 47)}`,
    views: r.views && r.views !== "--" ? r.views : `${(1.2 + (idx * 0.6)).toFixed(1)}k`,
  }));

  useEffect(() => {
    dispatch(
      fetchResourcesThunk({
        type: filterType,
        status: filterStatus,
        q: searchQuery,
      })
    );
  }, [dispatch, filterType, filterStatus, searchQuery]);

  const [showModal, setShowModal] = useState(false);
  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [itemsPerPage] = useState(10);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: "", subtitle: "", type: "Whitepaper" as ResourceType, status: "Draft" as ResourceStatus,
    dateAdded: "", downloads: "--", views: "--", description: "", scheduleDate: "", scheduleTime: "",
  });

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const filtered = resources.filter((r) => {
    const matchType = filterType === "All" || r.type === filterType;
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const toggleSelect = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  };

  const handleDelete = (id: string | number) => {
    dispatch(deleteResourceThunk(String(id)))
      .unwrap()
      .then(() => {
        triggerToast("Resource deleted successfully.");
        setSelectedIds((prev) => {
          const n = new Set(prev);
          n.delete(id);
          return n;
        });
      })
      .catch((err) => {
        console.error("Failed to delete resource:", err);
        triggerToast("Failed to delete resource.", "error");
      });
  };

  const handleArchive = (id: string | number) => {
    dispatch(updateResourceThunk({ id: String(id), payload: { status: "Archived" } }))
      .unwrap()
      .then(() => {
        triggerToast("Resource archived.");
      })
      .catch((err) => {
        console.error("Failed to archive resource:", err);
        triggerToast("Failed to archive resource.", "error");
      });
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds).map(String);
    dispatch(bulkDeleteResourcesThunk(ids))
      .unwrap()
      .then(() => {
        triggerToast(`${selectedIds.size} resource(s) deleted.`);
        setSelectedIds(new Set());
      })
      .catch((err) => {
        console.error("Failed to bulk delete:", err);
        triggerToast("Failed to delete selected resources.", "error");
      });
  };

  const handleBulkArchive = () => {
    const ids = Array.from(selectedIds).map(String);
    dispatch(bulkArchiveResourcesThunk(ids))
      .unwrap()
      .then(() => {
        triggerToast(`${selectedIds.size} resource(s) archived.`);
        setSelectedIds(new Set());
      })
      .catch((err) => {
        console.error("Failed to bulk archive:", err);
        triggerToast("Failed to archive selected resources.", "error");
      });
  };

  const openAddModal = () => {
    setEditResource(null);
    setForm({ title: "", subtitle: "", type: "Whitepaper", status: "Draft", dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }), downloads: "--", views: "--", description: "", scheduleDate: "", scheduleTime: "" });
    setUploadedFileName(null);
    setThumbnailPreview(null);
    setShowModal(true);
  };

  const openEditModal = (r: Resource) => {
    setEditResource(r);
    setForm({ title: r.title, subtitle: r.subtitle, type: r.type, status: r.status, dateAdded: r.dateAdded, downloads: r.downloads, views: r.views, description: "", scheduleDate: "", scheduleTime: "" });
    setUploadedFileName(null);
    setThumbnailPreview(null);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      triggerToast("Title is required.", "error");
      return;
    }
    const subtitle =
      form.subtitle || `${form.type}${uploadedFileName ? " • " + uploadedFileName : ""}`;

    if (editResource) {
      dispatch(
        updateResourceThunk({
          id: String(editResource.id),
          payload: {
            title: form.title,
            subtitle,
            type: form.type,
            status: form.status,
            description: form.description,
            scheduleDate: form.scheduleDate,
            scheduleTime: form.scheduleTime,
          },
        })
      )
        .unwrap()
        .then(() => {
          triggerToast("Resource updated successfully.");
          setShowModal(false);
        })
        .catch((err) => {
          console.error("Failed to update resource:", err);
          triggerToast("Failed to update resource.", "error");
        });
    } else {
      dispatch(
        createResourceThunk({
          title: form.title,
          subtitle,
          type: form.type,
          status: form.status,
          dateAdded: form.dateAdded,
          downloads: form.downloads,
          views: form.views,
          description: form.description,
          scheduleDate: form.scheduleDate,
          scheduleTime: form.scheduleTime,
        })
      )
        .unwrap()
        .then(() => {
          triggerToast("New resource added successfully.");
          setShowModal(false);
        })
        .catch((err) => {
          console.error("Failed to create resource:", err);
          triggerToast("Failed to add resource.", "error");
        });
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFileName(file.name);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFileName(file.name);
  };

  const handleThumbnailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const totalDownloadsNumber = resources.reduce((sum, r) => {
    const dStr = String(r.downloads || "").toLowerCase();
    if (dStr.endsWith("k")) return sum + Math.round(parseFloat(dStr) * 1000);
    const parsed = parseInt(dStr, 10);
    return sum + (isNaN(parsed) ? 0 : parsed);
  }, 0);

  const formattedTotalDownloads = totalDownloadsNumber >= 1000
    ? `${(totalDownloadsNumber / 1000).toFixed(1)}k`
    : `${totalDownloadsNumber}`;

  const todayDownloadsNumber = Math.round(totalDownloadsNumber * 0.15);
  const formattedTodayDownloads = todayDownloadsNumber >= 1000
    ? `${(todayDownloadsNumber / 1000).toFixed(1)}k today`
    : `${todayDownloadsNumber} today`;

  const stats = {
    total: resources.length,
    active: resources.filter((r) => r.status === "Published").length,
    pending: resources.filter((r) => r.status === "Draft" || r.status === "Scheduled").length,
    downloads: totalDownloadsNumber > 0 ? formattedTotalDownloads : "0",
    todayDownloads: totalDownloadsNumber > 0 ? formattedTodayDownloads : "0 today",
  };

  return (
    <div className="space-y-stack-lg max-w-[1440px] mx-auto w-full animate-in fade-in duration-300">

      {/* Page Header */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Manage Resources</h2>
          <p className="text-secondary font-body-md mt-1">
            Configure and organize corporate digital assets and knowledge base content.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add New Resource
        </button>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-white p-stack-md rounded-xl border border-outline-variant shadow-xs hover:shadow-md hover:border-primary transition-all cursor-default">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-primary/10 text-primary rounded-lg">inventory_2</span>
            <span className="text-label-md text-primary font-bold bg-primary/5 px-2 py-1 rounded">+12% vs LW</span>
          </div>
          <p className="text-label-md text-secondary uppercase tracking-wider font-semibold">Total Resources</p>
          <p className="font-display text-display text-on-surface font-bold">{stats.total.toLocaleString()}</p>
        </div>

        <div className="bg-white p-stack-md rounded-xl border border-outline-variant shadow-xs hover:shadow-md hover:border-primary transition-all cursor-default">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-green-50 text-green-600 rounded-lg">check_circle</span>
            <span className="text-label-md text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Healthy</span>
          </div>
          <p className="text-label-md text-secondary uppercase tracking-wider font-semibold">Published</p>
          <p className="font-display text-display text-on-surface font-bold">{stats.active}</p>
        </div>

        <div className="bg-white p-stack-md rounded-xl border border-outline-variant shadow-xs hover:shadow-md hover:border-primary transition-all cursor-default">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-error-container text-error rounded-lg">pending_actions</span>
            <span className="text-label-md text-error font-bold bg-error/5 px-2 py-1 rounded">Priority</span>
          </div>
          <p className="text-label-md text-secondary uppercase tracking-wider font-semibold">Pending Review</p>
          <p className="font-display text-display text-on-surface font-bold">{stats.pending}</p>
        </div>

        <div className="bg-white p-stack-md rounded-xl border border-outline-variant shadow-xs hover:shadow-md hover:border-primary transition-all cursor-default">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-secondary-container/40 text-secondary rounded-lg">download</span>
            <span className="text-label-md text-secondary font-bold bg-surface-container px-2 py-1 rounded">{stats.todayDownloads}</span>
          </div>
          <p className="text-label-md text-secondary uppercase tracking-wider font-semibold">Total Downloads</p>
          <p className="font-display text-display text-on-surface font-bold">{stats.downloads}</p>
        </div>
      </section>

      {/* Resource Table */}
      <section className="bg-white rounded-xl border border-outline-variant shadow-xs overflow-hidden flex flex-col">

        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-body-md bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-52"
              />
            </div>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-outline-variant rounded-lg text-body-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <option value="All">All Types</option>
              {(["Whitepaper", "Case Study", "Webinar", "E-book", "Guide", "Video"] as ResourceType[]).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-outline-variant rounded-lg text-body-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <option value="All">All Status</option>
              {(["Published", "Draft", "Scheduled", "Archived"] as ResourceStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Bulk actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkArchive}
                  className="px-3 py-2 border border-outline-variant text-secondary rounded-lg text-body-md hover:bg-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">archive</span>
                  Archive ({selectedIds.size})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-2 border border-error/40 text-error rounded-lg text-body-md hover:bg-error/5 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                  Delete ({selectedIds.size})
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-body-md text-secondary hidden sm:block">
              {filtered.length} of {resources.length} resources
            </span>
            {/* View toggle */}
            <div className="flex border border-outline-variant rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 transition-colors ${viewMode === "list" ? "bg-surface-container-high text-primary" : "hover:bg-surface-container-low text-secondary"}`}
              >
                <span className="material-symbols-outlined text-[20px]">list</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 transition-colors ${viewMode === "grid" ? "bg-surface-container-high text-primary" : "hover:bg-surface-container-low text-secondary"}`}
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
            </div>
          </div>
        </div>

        {/* LIST VIEW */}
        {viewMode === "list" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-label-md text-secondary font-bold border-b border-outline-variant">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filtered.length && filtered.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                      />
                      TITLE
                    </div>
                  </th>
                  <th className="px-6 py-4 text-label-md text-secondary font-bold border-b border-outline-variant">TYPE</th>
                  <th className="px-6 py-4 text-label-md text-secondary font-bold border-b border-outline-variant">STATUS</th>
                  <th className="px-6 py-4 text-label-md text-secondary font-bold border-b border-outline-variant">DATE ADDED</th>
                  <th className="px-6 py-4 text-label-md text-secondary font-bold border-b border-outline-variant">ENGAGEMENT</th>
                  <th className="px-6 py-4 text-label-md text-secondary font-bold border-b border-outline-variant text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-secondary font-body-md">
                      <span className="material-symbols-outlined text-4xl text-outline block mb-2">folder_open</span>
                      No resources found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const statusStyle = STATUS_STYLES[r.status];
                    const isSelected = selectedIds.has(r.id);
                    return (
                      <tr
                        key={r.id}
                        className={`group transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-surface-container-low"}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(r.id)}
                              className="rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                            />
                            <div>
                              <p className="text-body-md font-semibold text-on-surface leading-snug">{r.title}</p>
                              <p className="text-label-md text-secondary">{r.subtitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-label-md font-semibold ${TYPE_COLORS[r.type]}`}>
                            {r.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-label-md font-semibold px-2.5 py-1 rounded-full w-fit ${statusStyle.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-body-md text-secondary">{r.dateAdded}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4 text-secondary">
                            <span className="flex items-center gap-1 text-body-md">
                              <span className="material-symbols-outlined text-[16px]">download</span>
                              {r.downloads}
                            </span>
                            <span className="flex items-center gap-1 text-body-md">
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              {r.views}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(r)}
                              title="Edit Resource"
                              className="px-2.5 py-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs border border-primary/20 bg-primary/5 shadow-2xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setPreviewResource(r)}
                              title="Preview Resource"
                              className="px-2.5 py-1.5 hover:bg-surface-container-high rounded-lg text-secondary transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs border border-outline-variant bg-white shadow-2xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleArchive(r.id)}
                              title="Archive Resource"
                              className="p-1.5 hover:bg-surface-container-high rounded-lg text-secondary transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs border border-outline-variant bg-white shadow-2xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">archive</span>
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              title="Delete Resource"
                              className="p-1.5 hover:bg-error/10 rounded-lg text-error transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs border border-error/20 bg-error/5 shadow-2xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
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
        )}

        {/* GRID VIEW */}
        {viewMode === "grid" && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.length === 0 ? (
              <div className="col-span-full py-16 text-center text-secondary font-body-md">
                <span className="material-symbols-outlined text-4xl text-outline block mb-2">folder_open</span>
                No resources found.
              </div>
            ) : (
              filtered.map((r) => {
                const statusStyle = STATUS_STYLES[r.status];
                return (
                  <div key={r.id} className="bg-surface-container-low rounded-xl border border-outline-variant p-4 hover:shadow-md hover:border-primary transition-all group flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <span className={`px-2 py-0.5 rounded text-label-md font-semibold ${TYPE_COLORS[r.type]}`}>{r.type}</span>
                      <span className={`flex items-center gap-1 text-label-md font-semibold px-2 py-0.5 rounded-full ${statusStyle.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        {r.status}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-body-md text-on-surface leading-snug line-clamp-2">{r.title}</p>
                      <p className="text-label-md text-secondary mt-1">{r.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3 text-secondary mt-auto">
                      <span className="flex items-center gap-1 text-label-md">
                        <span className="material-symbols-outlined text-[14px]">download</span> {r.downloads}
                      </span>
                      <span className="flex items-center gap-1 text-label-md">
                        <span className="material-symbols-outlined text-[14px]">visibility</span> {r.views}
                      </span>
                      <span className="text-label-md ml-auto">{r.dateAdded}</span>
                    </div>
                    <div className="flex items-center gap-1 border-t border-outline-variant pt-2">
                      <button onClick={() => openEditModal(r)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-primary/10 text-primary text-label-md font-semibold transition-colors cursor-pointer bg-surface-container">
                        <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                      </button>
                      <button onClick={() => setPreviewResource(r)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-white text-secondary text-label-md font-semibold transition-colors cursor-pointer bg-surface-container">
                        <span className="material-symbols-outlined text-[16px]">visibility</span> View
                      </button>
                      <button onClick={() => handleArchive(r.id)} title="Archive" className="p-1.5 rounded-lg hover:bg-white text-secondary text-label-md font-semibold transition-colors cursor-pointer bg-surface-container">
                        <span className="material-symbols-outlined text-[16px]">archive</span>
                      </button>
                      <button onClick={() => handleDelete(r.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-error/10 text-error text-label-md font-semibold transition-colors cursor-pointer bg-surface-container">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 bg-surface-container-low flex items-center justify-between border-t border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="text-body-md text-secondary">Items per page:</span>
            <select className="bg-white border border-outline-variant rounded px-2 py-1 text-body-md focus:ring-primary">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-body-md text-secondary">1-{Math.min(itemsPerPage, filtered.length)} of {filtered.length}</span>
            <div className="flex gap-1">
              <button disabled className="w-8 h-8 flex items-center justify-center rounded hover:bg-white disabled:opacity-30 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-white transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto my-4 animate-in slide-in-from-bottom-4 duration-200 overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-gutter py-4 border-b border-outline-variant">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {editResource ? "Edit Resource" : "Add New Resource"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container-low rounded-full text-secondary transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-gutter py-5 space-y-gutter overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">

                {/* Title - full width */}
                <div className="md:col-span-2">
                  <label className="block text-label-md font-bold text-secondary uppercase tracking-wider mb-1">
                    Resource Title <span className="text-error">*</span>
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Annual Security Compliance Report"
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-label-md font-bold text-secondary uppercase tracking-wider mb-1">Resource Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer bg-white transition-all"
                  >
                    {(["Whitepaper", "Case Study", "Webinar", "E-book", "Guide", "Video"] as ResourceType[]).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-label-md font-bold text-secondary uppercase tracking-wider mb-1">Publishing Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ResourceStatus })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer bg-white transition-all"
                  >
                    {(["Published", "Draft", "Scheduled", "Archived"] as ResourceStatus[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Scheduled date/time — only shown when status is Scheduled */}
                {form.status === "Scheduled" && (
                  <div className="md:col-span-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-label-md font-bold text-secondary mb-1">Release Date</label>
                        <input
                          type="date"
                          value={form.scheduleDate}
                          onChange={(e) => setForm({ ...form, scheduleDate: e.target.value })}
                          className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-label-md font-bold text-secondary mb-1">Release Time</label>
                        <input
                          type="time"
                          value={form.scheduleTime}
                          onChange={(e) => setForm({ ...form, scheduleTime: e.target.value })}
                          className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Description - full width */}
                <div className="md:col-span-2">
                  <label className="block text-label-md font-bold text-secondary uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Provide a brief summary of the resource content..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  />
                </div>

                {/* File Upload - full width */}
                <div className="md:col-span-2">
                  <label className="block text-label-md font-bold text-secondary uppercase tracking-wider mb-1">Resource File</label>
                  <label
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer group transition-all ${
                      isDragOver
                        ? "border-primary bg-primary/5"
                        : "border-outline-variant bg-surface-container-low hover:bg-surface-container hover:border-primary/50"
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileDrop}
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-primary">
                        {uploadedFileName ? "check_circle" : "upload_file"}
                      </span>
                    </div>
                    {uploadedFileName ? (
                      <>
                        <p className="font-body-md text-body-md text-on-surface font-semibold">{uploadedFileName}</p>
                        <p className="text-xs text-secondary mt-1">Click to replace file</p>
                      </>
                    ) : (
                      <>
                        <p className="font-body-md text-body-md text-on-surface font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-secondary mt-1">PDF, MP4, PPTX, or ZIP (Max 50MB)</p>
                      </>
                    )}
                    <input type="file" className="hidden" accept=".pdf,.mp4,.pptx,.zip" onChange={handleFileInput} />
                  </label>
                </div>

                {/* Thumbnail - full width */}
                <div className="md:col-span-2">
                  <label className="block text-label-md font-bold text-secondary uppercase tracking-wider mb-2">Thumbnail Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-surface-container-high rounded-lg border border-outline-variant flex items-center justify-center overflow-hidden flex-shrink-0">
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-outline text-3xl">image</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="px-4 py-2 border border-outline-variant rounded-lg text-body-md font-medium hover:bg-surface-container-low transition-colors mb-2 inline-block cursor-pointer">
                        {thumbnailPreview ? "Change Image" : "Upload Image"}
                        <input type="file" className="hidden" accept="image/png,image/jpeg" onChange={handleThumbnailInput} />
                      </label>
                      <p className="text-xs text-secondary italic mt-1">Recommended: 800×450px (16:9). PNG or JPG only.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-gutter py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-lg font-semibold text-secondary hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
              >
                {editResource ? "Save Changes" : "Create Resource"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Preview Modal */}
      {previewResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setPreviewResource(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-auto p-6 animate-in slide-in-from-bottom-4 duration-200 border border-outline-variant relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-label-md font-semibold ${TYPE_COLORS[previewResource.type]}`}>
                  {previewResource.type}
                </span>
                <span className="flex items-center gap-1.5 text-label-md font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  {previewResource.status}
                </span>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="p-1.5 hover:bg-surface-container-low rounded-full text-secondary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
              {previewResource.title}
            </h3>
            <p className="text-secondary text-body-md mb-6">{previewResource.subtitle}</p>

            <div className="grid grid-cols-3 gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant mb-6 text-center">
              <div>
                <p className="text-xs text-secondary font-semibold uppercase">Added Date</p>
                <p className="font-bold text-on-surface text-body-md mt-1">{previewResource.dateAdded}</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-semibold uppercase">Downloads</p>
                <p className="font-bold text-primary text-body-md mt-1">{previewResource.downloads}</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-semibold uppercase">Views</p>
                <p className="font-bold text-on-surface text-body-md mt-1">{previewResource.views}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
              <button
                onClick={() => setPreviewResource(null)}
                className="px-5 py-2 rounded-lg font-semibold text-secondary hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  triggerToast(`Downloading asset: ${previewResource.title}`);
                  setPreviewResource(null);
                }}
                className="px-5 py-2 bg-primary text-on-primary rounded-lg font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200 ${toastType === "error" ? "bg-error-container text-on-error-container border border-error/30" : "bg-inverse-surface text-inverse-on-surface"}`}>
          <span className={`material-symbols-outlined ${toastType === "error" ? "text-error" : "text-green-400"}`}>
            {toastType === "error" ? "error" : "check_circle"}
          </span>
          <p className="text-body-md font-medium">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}
