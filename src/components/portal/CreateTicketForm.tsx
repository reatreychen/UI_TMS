"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Info,
  AlertCircle,
  Paperclip,
  CloudUpload,
  Loader2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  aiSuggestTicket,
  type AiSuggestResult,
  type AiKbArticle,
} from "@/src/services/aiAssistService";
import { PRIORITY_OPTIONS } from "@/src/constants/appConfig";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";
import { submitTicketThunk, resetTicketState } from "@/src/store/slices/ticketSlice";
import { fetchCategoriesThunk } from "@/src/store/slices/categorySlice";

const schema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  description: z
    .string()
    .min(10, "Please provide more detail (at least 10 characters)"),
});

type FormValues = z.infer<typeof schema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
      <AlertCircle className="size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  if (error instanceof Error) return error.message;
  return "Failed to submit ticket. Please try again.";
}

export function CreateTicketForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const { isSubmitting: isReduxSubmitting } = useAppSelector((state) => state.ticket);
  const { data, loading: categoriesLoading } = useAppSelector((state) => state.category);
  const categories = data?.data || [];

  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const [aiResult, setAiResult] = useState<AiSuggestResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiApplied, setAiApplied] = useState(false);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const aiDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium", categoryId: "" },
  });

  const selectedPriority = watch("priority");
  const watchedDescription = watch("description");
  const watchedSubject = watch("subject");

  useEffect(() => {
    if (!watchedDescription || watchedDescription.length < 20) {
      if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
      const resetTimer = setTimeout(() => {
        setAiResult(null);
        setAiApplied(false);
      }, 0);
      return () => clearTimeout(resetTimer);
    }
    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    aiDebounceRef.current = setTimeout(async () => {
      setAiLoading(true);
      const result = await aiSuggestTicket(
        watchedSubject || "Support Request",
        watchedDescription
      );
      setAiLoading(false);
      if (result && (result.suggestedCategoryId || result.kbArticles.length > 0)) {
        setAiResult(result);
        setAiApplied(false);
      } else {
        setAiResult(null);
      }
    }, 1200);
    return () => {
      if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    };
  }, [watchedDescription, watchedSubject]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  }, []);

  const handleBrowse = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".png,.jpg,.jpeg,.pdf,.csv";
    input.onchange = (e) => {
      const selected = Array.from((e.target as HTMLInputElement).files ?? []);
      setFiles((prev) => [...prev, ...selected]);
    };
    input.click();
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (values: FormValues) => {
    if (!currentUser?.id) {
      toast.error("You must be logged in to submit a ticket.");
      return;
    }

    try {
      const resultAction = await dispatch(
        submitTicketThunk({
          payload: {
            customerId: currentUser.id,
            subject: values.subject,
            description: values.description,
            priority: values.priority.toUpperCase() as
              | "LOW"
              | "MEDIUM"
              | "HIGH"
              | "CRITICAL",
            categoryId: values.categoryId,
          },
          files,
          uploadedById: currentUser.id,
        })
      );

      if (submitTicketThunk.fulfilled.match(resultAction)) {
        toast.success("Ticket submitted successfully! Redirecting to My Tickets…");
        reset();
        setFiles([]);
        dispatch(resetTicketState());
        setTimeout(() => router.push("/customer/my-ticket"), 1200);
      } else {
        toast.error(
          (resultAction.payload as string) || "Failed to submit ticket."
        );
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="lg:col-span-8">
      <div className="mb-6">
        <Link
          href="/customer/my-ticket"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft className="size-4" />
          Back to My Tickets
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-1.5">
          Submit a New Request
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Share the details of your issue below and our support specialists will get back to you promptly.
        </p>
      </div>

      <form
        id="ticketForm"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        {/* ── Section 1: Basic Information ─────────────────────────── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
            <Info className="size-5 text-blue-600" aria-hidden strokeWidth={2} />
            <h2 className="font-display text-lg font-bold text-slate-900">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="subject"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
              >
                Ticket Subject <span className="text-red-600">*</span>
              </label>
              <input
                id="subject"
                type="text"
                placeholder="e.g., Cannot access billing dashboard"
                aria-invalid={errors.subject ? "true" : "false"}
                {...register("subject")}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
              <FieldError message={errors.subject?.message} />
            </div>

            <div>
              <label
                htmlFor="categoryId"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
              >
                Category <span className="text-red-600">*</span>
              </label>
              <select
                id="categoryId"
                disabled={categoriesLoading}
                aria-invalid={errors.categoryId ? "true" : "false"}
                {...register("categoryId")}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                <option value="" disabled>
                  {categoriesLoading ? "Loading categories…" : "Select a category"}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FieldError message={errors.categoryId?.message} />
            </div>
          </div>
        </section>

        {/* ── Section 2: Details ───────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
            <AlertCircle className="size-5 text-blue-600" aria-hidden strokeWidth={2} />
            <h2 className="font-display text-lg font-bold text-slate-900">Issue Details</h2>
          </div>

          <div className="space-y-5">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                Priority Level
              </span>
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
                role="radiogroup"
                aria-label="Priority level"
              >
                {PRIORITY_OPTIONS.map((opt) => {
                  const isSelected = selectedPriority === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-colors ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register("priority")}
                        className="size-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm font-semibold ${isSelected ? "text-blue-700" : opt.color}`}>
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
              >
                Detailed Description <span className="text-red-600">*</span>
              </label>
              <textarea
                id="description"
                rows={6}
                placeholder="Describe what happened, steps to reproduce, and any error codes you see..."
                aria-invalid={errors.description ? "true" : "false"}
                {...register("description")}
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
              <FieldError message={errors.description?.message} />
            </div>
          </div>
        </section>

        {/* ── AI Suggestions Panel ─────────────────────────────────────── */}
        {(aiLoading || aiResult) && (
          <section
            className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 shadow-xs"
            aria-live="polite"
            aria-label="AI Suggestions"
          >
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-5 text-blue-600" aria-hidden strokeWidth={2} />
              <h2 className="font-display text-base font-bold text-slate-900">
                Suggested Answers &amp; Routing
              </h2>
              {aiLoading && (
                <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Loader2 className="size-3.5 animate-spin text-blue-600" />
                  Analyzing…
                </span>
              )}
              {!aiLoading && aiResult && (
                <span className="ml-auto rounded-full bg-white border border-blue-200 px-2.5 py-0.5 text-[11px] text-blue-700 font-semibold">
                  Smart Assist
                </span>
              )}
            </div>

            {aiLoading && !aiResult && (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-3/4 rounded-md bg-blue-200/50" />
                <div className="h-4 w-1/2 rounded-md bg-blue-200/50" />
                <div className="h-12 w-full rounded-xl bg-blue-200/40" />
              </div>
            )}

            {!aiLoading && aiResult && (
              <div className="space-y-4">
                {aiResult.suggestedCategoryId && aiResult.suggestedCategoryName && (
                  <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <Zap className="size-4 shrink-0 text-blue-600 mt-0.5 sm:mt-0" aria-hidden />
                      <span className="text-sm text-slate-700">
                        Suggested category:{" "}
                        <strong className="text-blue-700">{aiResult.suggestedCategoryName}</strong>
                        {aiResult.reasoning && (
                          <span className="ml-1.5 text-xs text-slate-500">
                            ({aiResult.reasoning})
                          </span>
                        )}
                      </span>
                    </div>
                    {aiApplied ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold shrink-0">
                        <CheckCircle2 className="size-4" />
                        Applied
                      </span>
                    ) : (
                      <button
                        type="button"
                        id="ai-apply-category-btn"
                        onClick={() => {
                          if (aiResult.suggestedCategoryId) {
                            setValue("categoryId", aiResult.suggestedCategoryId, { shouldValidate: true });
                            setAiApplied(true);
                          }
                        }}
                        className="shrink-0 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        Apply Category
                      </button>
                    )}
                  </div>
                )}

                {aiResult.kbArticles.length > 0 && (
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      <BookOpen className="size-4 text-blue-600" aria-hidden />
                      Helpful articles that might answer your question right away:
                    </p>
                    <ul className="space-y-2">
                      {aiResult.kbArticles.map((article: AiKbArticle) => (
                        <li
                          key={article.id}
                          className="rounded-xl border border-slate-200 bg-white transition-colors"
                        >
                          <button
                            type="button"
                            id={`ai-kb-article-${article.id}`}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
                            onClick={() =>
                              setExpandedArticle(
                                expandedArticle === article.id ? null : article.id
                              )
                            }
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <BookOpen className="size-4 shrink-0 text-blue-600" aria-hidden />
                              <span className="truncate text-sm font-semibold text-slate-900">
                                {article.title}
                              </span>
                              <span className="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                {article.category}
                              </span>
                            </div>
                            {expandedArticle === article.id ? (
                              <ChevronUp className="size-4 shrink-0 text-slate-400" />
                            ) : (
                              <ChevronDown className="size-4 shrink-0 text-slate-400" />
                            )}
                          </button>
                          {expandedArticle === article.id && (
                            <div className="border-t border-slate-100 px-4 py-3">
                              <p className="text-sm text-slate-600 leading-relaxed">
                                {article.excerpt}
                              </p>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Section 3: Attachments ───────────────────────────────── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
            <Paperclip className="size-5 text-blue-600" aria-hidden strokeWidth={2} />
            <h2 className="font-display text-lg font-bold text-slate-900">Attachments</h2>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="File upload dropzone"
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            onDrop={handleDrop}
            onClick={handleBrowse}
            onKeyDown={(e) => e.key === "Enter" && handleBrowse()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 transition-colors ${
              dragOver
                ? "border-blue-500 bg-blue-50/70"
                : "border-slate-300 bg-slate-50/60 hover:border-blue-400 hover:bg-slate-50"
            }`}
          >
            <CloudUpload
              className={`size-10 transition-colors ${dragOver ? "text-blue-600" : "text-slate-400"}`}
              strokeWidth={1.5}
              aria-hidden
            />
            <p className="text-sm font-semibold text-slate-900">Drag &amp; drop files here</p>
            <p className="text-center text-xs text-slate-500">
              Supports PNG, JPG, PDF, or CSV (Max 10MB per file)
            </p>
            <span className="mt-1 text-xs font-semibold text-blue-600 hover:underline">
              Or browse files
            </span>
          </div>

          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden strokeWidth={2} />
                    <span className="truncate text-sm font-medium text-slate-900">{file.name}</span>
                    <span className="shrink-0 text-xs text-slate-500 tabular-nums">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    aria-label={`Remove ${file.name}`}
                    className="ml-2 shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Action Buttons ───────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isReduxSubmitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting || isReduxSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Processing…
              </>
            ) : (
              "Submit Ticket"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
