"use client";

import React, { useEffect, useState } from "react";
import { adminCategoryService, Category, PaginatedCategories } from "@/src/services/adminCategoryService";
import { AdminDepartment } from "@/src/services/adminUserService";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { fetchCategoriesThunk } from "@/src/store/slices/categorySlice";

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.category);
  
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", department_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterInput, setShowFilterInput] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchDepartments();
  }, []);

  const fetchCategories = () => {
    dispatch(fetchCategoriesThunk());
  };

  const fetchDepartments = async () => {
    try {
      const { adminUserService } = await import("@/src/services/adminUserService");
      const res = await adminUserService.getDepartments();
      setDepartments(res);
    } catch (err) {
      console.error("Failed to load departments", err);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, department_id: category.department_id || "" });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", department_id: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", department_id: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        ...(formData.department_id ? { department_id: formData.department_id } : {})
      };
      
      if (editingCategory) {
        await adminCategoryService.updateCategory(editingCategory.id, payload);
      } else {
        await adminCategoryService.createCategory(payload);
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      console.error("Failed to save category", err);
      alert("Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (!data?.data || data.data.length === 0) {
      alert("No category data available to export.");
      return;
    }

    const headers = ["Category ID", "Category Name", "Type", "Status", "Assigned Department", "Ticket Items"];
    const rows = data.data.map((c) => [
      `"${c.id}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"Ticket"`,
      `"Active"`,
      `"${(c.department?.name || "Unassigned").replace(/"/g, '""')}"`,
      c.itemCount ?? 0,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `categories_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCategories = React.useMemo(() => {
    if (!data?.data) return [];
    if (!searchQuery.trim()) return data.data;
    const q = searchQuery.toLowerCase().trim();
    return data.data.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.department?.name && c.department.name.toLowerCase().includes(q))
    );
  }, [data, searchQuery]);
  return (
    <div className="space-y-stack-lg max-w-[1440px] mx-auto w-full animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-headline-md">category</span>
            <h2 className="font-headline-lg text-headline-lg">Manage Categories</h2>
          </div>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Organize, edit, and maintain classification structures for support tickets and system resources.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add New Category
        </button>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-label-md text-label-md">Total Categories</span>
            <span className="material-symbols-outlined text-primary">inventory_2</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display">{data?.meta.total || data?.data.length || 0}</span>
            <span className="text-label-md text-on-surface-variant">types</span>
          </div>
        </div>
        
        <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-label-md text-label-md">Active Categories</span>
            <span className="material-symbols-outlined text-green-600">check_circle</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display">{data?.meta.total || data?.data.length || 0}</span>
            <span className="flex items-center text-[12px] font-bold text-green-600">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              100%
            </span>
          </div>
        </div>
        
        <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-label-md text-label-md">Departments</span>
            <span className="material-symbols-outlined text-secondary">account_tree</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display">{departments.length}</span>
            <span className="text-label-md text-on-surface-variant">active</span>
          </div>
        </div>
        
        <div className="bg-error-container border border-error/20 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-error-container font-label-md text-label-md">Unassigned Categories</span>
            <span className="material-symbols-outlined text-error animate-pulse">warning</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display text-on-error-container">
              {data?.data.filter((c) => !c.department_id && !c.department).length || 0}
            </span>
            <span className="text-label-md text-on-error-container/70">needs department</span>
          </div>
        </div>
      </div>

      {/* Main Full Width Layout */}
      <div className="w-full">
        {/* Registry Table */}
        <div className="w-full bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md">Category Registry</h3>
            <div className="flex items-center gap-2">
              {showFilterInput && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter categories..."
                  className="px-3 py-1.5 border border-outline-variant rounded-lg text-body-md outline-none focus:border-primary animate-in fade-in duration-200"
                />
              )}
              <button
                onClick={() => setShowFilterInput(!showFilterInput)}
                title="Filter Categories"
                className={`p-2 border border-outline-variant rounded-lg transition-colors cursor-pointer ${
                  showFilterInput ? "bg-primary/10 text-primary border-primary/30" : "hover:bg-surface-container-low text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined">filter_list</span>
              </button>
              <button
                onClick={handleExportCSV}
                title="Export Categories CSV"
                className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer text-on-surface-variant hover:text-primary active:scale-95"
              >
                <span className="material-symbols-outlined">download</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Category Name</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Type</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Status</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Assigned Department</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant text-center">Items</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant font-label-md">
                      Loading categories...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant font-label-md">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary/60">category</span>
                          <span className="font-body-md text-body-md font-bold">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">Ticket</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-green-700 text-body-md">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant">
                        {category.department?.name || "No Department"}
                      </td>
                      <td className="px-6 py-4 text-center text-body-md font-code">
                        {category.itemCount ?? 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant"
                            onClick={() => handleOpenModal(category)}
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button 
                            className="p-2 hover:bg-surface-container-highest rounded-lg text-error"
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this category?")) {
                                try {
                                  await adminCategoryService.deleteCategory(category.id);
                                  fetchCategories();
                                } catch (err) {
                                  console.error("Failed to delete category", err);
                                  alert("Failed to delete category");
                                }
                              }
                            }}
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
          
          <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
            <span className="text-body-md text-on-surface-variant">
              Showing {data?.data.length || 0} of {data?.meta.total || 0} categories
            </span>
            <div className="flex items-center gap-4">
              <button disabled={!data || data.meta.page <= 1} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-label-md text-label-md transition-colors disabled:opacity-50">Previous</button>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded-lg font-label-md text-label-md">{data?.meta.page || 1}</button>
              </div>
              <button disabled={!data || data.meta.page >= data.meta.totalPages} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-label-md text-label-md transition-colors disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>
      <div className="h-12"></div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="font-headline-md text-headline-md mb-4">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1">
                  Department (Optional)
                </label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">No Department</option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>{dep.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
