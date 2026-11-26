"use client";

import { useState, useEffect, useMemo } from "react";
import {
  adminDepartmentService,
  Department,
} from "@/src/services/adminDepartmentService";
import { adminCategoryService, Category as SystemCategory } from "@/src/services/adminCategoryService";
import { Plus, Search, Edit2, Trash2, Building2, Layers, Users, RefreshCw, AlertCircle, CheckCircle2, X } from "lucide-react";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (message) return message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred. Please try again.";
}

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [allCategories, setAllCategories] = useState<SystemCategory[]>([]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectedCategoryIds: [] as string[],
    newCategoryName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToastNotification = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDepartments = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await adminDepartmentService.getDepartments();
      setDepartments(data);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const res = await adminCategoryService.getCategories({ limit: 100 });
      const cats = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : (res as any)?.data?.data || [];
      setAllCategories(cats);
    } catch (err) {
      console.warn("Failed to load category list:", err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchAllCategories();
  }, []);

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [departments, searchQuery]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setFormData({
      name: "",
      description: "",
      selectedCategoryIds: [],
      newCategoryName: "",
    });
    setShowCreateModal(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (dept: Department) => {
    setEditingDepartment(dept);
    const catIdsFromDept = dept.categories ? dept.categories.map((c: any) => c.id).filter(Boolean) : [];
    const catIdsFromAll = allCategories.filter((c) => c.department_id === dept.id || c.department?.id === dept.id).map((c) => c.id);
    const existingCatIds = Array.from(new Set([...catIdsFromDept, ...catIdsFromAll]));

    setFormData({
      name: dept.name,
      description: dept.description || "",
      selectedCategoryIds: existingCatIds,
      newCategoryName: "",
    });
  };

  // Create a new category inline from department modal
  const handleAddNewCategory = async () => {
    const name = formData.newCategoryName.trim();
    if (!name) return;

    setIsSubmitting(true);
    try {
      const created = await adminCategoryService.createCategory({
        name,
        department_id: editingDepartment?.id || undefined,
      });
      showToastNotification(`Category "${created.name}" created successfully!`);
      setAllCategories((prev) => [...prev, created]);
      setFormData((prev) => ({
        ...prev,
        selectedCategoryIds: Array.from(new Set([...prev.selectedCategoryIds, created.id])),
        newCategoryName: "",
      }));
    } catch (err) {
      showToastNotification(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create or Update Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      let targetDeptId = "";
      const deptName = formData.name.trim();

      if (editingDepartment) {
        const updated = await adminDepartmentService.updateDepartment(editingDepartment.id, {
          name: deptName,
          description: formData.description.trim() || undefined,
        });
        targetDeptId = updated.id;
      } else {
        const created = await adminDepartmentService.createDepartment({
          name: deptName,
          description: formData.description.trim() || undefined,
        });
        targetDeptId = created.id;
      }

      if (targetDeptId) {
        // Unassign categories removed during edit (send null to clear department_id)
        if (editingDepartment) {
          const prevCatIdsFromDept = editingDepartment.categories ? editingDepartment.categories.map((c: any) => c.id).filter(Boolean) : [];
          const prevCatIdsFromAll = allCategories.filter((c) => c.department_id === editingDepartment.id || c.department?.id === editingDepartment.id).map((c) => c.id);
          const prevCatIds = Array.from(new Set([...prevCatIdsFromDept, ...prevCatIdsFromAll]));
          
          const removedCatIds = prevCatIds.filter((id: string) => !formData.selectedCategoryIds.includes(id));
          await Promise.all(
            removedCatIds.map(async (catId) => {
              try {
                await adminCategoryService.updateCategory(catId, { department_id: null });
              } catch (cErr) {
                console.warn("Failed to unassign category", catId, cErr);
              }
            })
          );
        }

        // Assign checked categories concurrently
        await Promise.all(
          formData.selectedCategoryIds.map(async (catId) => {
            try {
              await adminCategoryService.updateCategory(catId, { department_id: targetDeptId });
            } catch (cErr) {
              console.warn("Failed to assign category", catId, cErr);
            }
          })
        );

        // Create new category if user entered a name
        if (formData.newCategoryName.trim()) {
          try {
            await adminCategoryService.createCategory({
              name: formData.newCategoryName.trim(),
              department_id: targetDeptId,
            });
          } catch (cErr) {
            console.warn("Failed to create new category", cErr);
          }
        }

        await Promise.all([fetchDepartments(), fetchAllCategories()]);

        showToastNotification(
          editingDepartment
            ? `Department "${deptName}" updated successfully!`
            : `Department "${deptName}" created successfully!`
        );

        setEditingDepartment(null);
        setShowCreateModal(false);
      }
    } catch (err) {
      showToastNotification(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Department
  const handleDeleteConfirm = async () => {
    if (!deletingDepartment) return;
    setIsSubmitting(true);
    try {
      await adminDepartmentService.deleteDepartment(deletingDepartment.id);
      setDepartments((prev) => prev.filter((d) => d.id !== deletingDepartment.id));
      showToastNotification(`Department "${deletingDepartment.name}" removed successfully.`);
      setDeletingDepartment(null);
    } catch (err) {
      showToastNotification(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-body-md font-semibold text-white transition-all animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div>
          <h1 className="text-display font-bold text-on-surface flex items-center gap-2.5">
            <Building2 className="w-8 h-8 text-primary" />
            Departments Management
          </h1>
          <p className="text-body-md text-secondary mt-1">
            Organize support teams, manage departments, and assign ticket categories.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-semibold text-body-md rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search departments or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-md transition-all shadow-xs"
          />
        </div>
        <button
          onClick={() => { fetchDepartments(); fetchAllCategories(); }}
          className="p-2.5 text-secondary hover:text-on-surface hover:bg-surface-container-high rounded-xl border border-outline-variant transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-body-md font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Departments Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-secondary flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="font-medium text-body-md">Loading departments and categories...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="p-12 text-center text-secondary flex flex-col items-center justify-center gap-2">
            <Building2 className="w-12 h-12 text-secondary/40" />
            <h3 className="text-title-md font-bold text-on-surface">No Departments Found</h3>
            <p className="text-body-md max-w-sm">
              {searchQuery ? "No departments match your search criteria." : "Get started by adding your first support department."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-label-md text-secondary uppercase tracking-wider font-bold">
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-center">Assigned Users</th>
                  <th className="py-4 px-6 text-center">Categories</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredDepartments.map((dept) => {
                  const deptCatMap = new Map<string, { id: string; name: string }>();
                  (dept.categories || []).forEach((c: any) => { if (c.id && c.name) deptCatMap.set(c.id, c); });
                  allCategories
                    .filter((c) => c.department_id === dept.id || c.department?.id === dept.id)
                    .forEach((c) => { deptCatMap.set(c.id, { id: c.id, name: c.name }); });
                  const deptCategories = Array.from(deptCatMap.values());

                  return (
                    <tr
                      key={dept.id}
                      className="hover:bg-surface-container-high/50 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-container/60 text-primary flex items-center justify-center font-bold text-title-md shrink-0">
                            {dept.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface text-body-md group-hover:text-primary transition-colors">
                              {dept.name}
                            </p>
                            <p className="text-body-xs text-secondary font-mono">
                              ID: {dept.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-body-md text-secondary max-w-md truncate">
                        {dept.description || <span className="italic opacity-60">No description provided</span>}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-body-xs font-semibold bg-surface-container-high text-on-surface">
                          <Users className="w-3.5 h-3.5 text-secondary" />
                          {dept.users?.length || 0}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {deptCategories.length > 0 ? (
                            deptCategories.map((cat) => (
                              <span
                                key={cat.id || cat.name}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20"
                              >
                                <Layers className="w-3 h-3" />
                                {cat.name}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-body-xs font-medium bg-surface-container-high text-secondary">
                              No categories assigned
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(dept)}
                            className="p-2 text-secondary hover:text-primary hover:bg-primary-container/40 rounded-lg transition-colors"
                            title="Edit Department"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingDepartment(dept)}
                            className="p-2 text-secondary hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Department"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(showCreateModal || editingDepartment) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                {editingDepartment ? "Edit Department" : "Add New Department"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingDepartment(null);
                }}
                className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1.5">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Support, Billing, Sales"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-md transition-all"
                />
              </div>

              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the purpose and responsibilities of this department..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-md transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-primary" />
                    Assign Categories
                  </span>
                  <span className="text-body-xs text-secondary font-normal">Optional</span>
                </label>
                
                <div className="p-3 bg-surface-container-low border border-outline-variant rounded-xl space-y-3">
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                    {allCategories.length === 0 ? (
                      <p className="text-body-xs text-secondary italic">No existing categories found. You can add one below.</p>
                    ) : (
                      allCategories.map((cat) => {
                        const isChecked = formData.selectedCategoryIds.includes(cat.id);
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => {
                              const newSelected = isChecked
                                ? formData.selectedCategoryIds.filter((id) => id !== cat.id)
                                : [...formData.selectedCategoryIds, cat.id];
                              setFormData({ ...formData, selectedCategoryIds: newSelected });
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-xs font-semibold transition-all cursor-pointer border ${
                              isChecked
                                ? "bg-primary text-on-primary border-primary shadow-xs"
                                : "bg-surface-container-lowest text-on-surface border-outline-variant hover:border-primary/50"
                            }`}
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>{cat.name}</span>
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-2 border-t border-outline-variant/60 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add new category name..."
                      value={formData.newCategoryName}
                      onChange={(e) => setFormData({ ...formData, newCategoryName: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddNewCategory();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-xs text-on-surface placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      disabled={!formData.newCategoryName.trim() || isSubmitting}
                      onClick={handleAddNewCategory}
                      className="px-3.5 py-1.5 bg-primary text-on-primary font-semibold text-body-xs rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Category</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingDepartment(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant text-secondary hover:bg-surface-container-high font-semibold text-body-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim()}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingDepartment ? "Update Department" : "Create Department"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-title-lg font-bold text-on-surface">Delete Department?</h3>
              <p className="text-body-md text-secondary mt-1">
                Are you sure you want to delete <span className="font-semibold text-on-surface">"{deletingDepartment.name}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingDepartment(null)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-outline-variant text-secondary hover:bg-surface-container-high font-semibold text-body-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-body-md shadow-xs hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Department</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
