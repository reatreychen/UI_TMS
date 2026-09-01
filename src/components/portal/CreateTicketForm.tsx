"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { aiSuggestTicket, type AiSuggestResult, type AiKbArticle } from "@/src/services/aiAssistService";


const schema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  description: z
    .string()
    .min(10, "Please provide more detail (at least 10 characters)"),
});

type FormValues = z.infer<typeof schema>;

import { PRIORITY_OPTIONS } from "@/src/constants/appConfig";
import {
  createTicket,
  fetchPublicCategories,
  uploadTicketAttachment,
  type BackendCategory,
} from "@/src/services/portalService";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-label-md text-error">
      <AlertCircle className="size-3 shrink-0" aria-hidden />
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

import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";
import { submitTicketThunk, resetTicketState } from "@/src/store/slices/ticketSlice";
import { fetchCategoriesThunk } from "@/src/store/slices/categorySlice";

export function CreateTicketForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const { isSubmitting: isReduxSubmitting } = useAppSelector((state) => state.ticket);
  const { data, loading: categoriesLoading } = useAppSelector((state) => state.category);
  const categories = data?.data || [];
  
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // ── AI Assist state ───────────────────────────────────────────────────────
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
    defaultValues: { priority: "medium" },
  });

  const selectedPriority = watch("priority");
  const watchedDescription = watch("description");
  const watchedSubject = watch("subject");

  // ── AI debounced suggestion ───────────────────────────────────────────────
  useEffect(() => {
    if (!watchedDescription || watchedDescription.length < 20) {
      setAiResult(null);
      setAiApplied(false);
      return;
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


  /* Dropzone handlers */
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

  /* Submit */
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
      {/* Page header */}
      <div className="mb-stack-lg">
        <h1 className="text-headline-lg font-semibold mb-base">
          Submit a New Request
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Please provide the details below and our team will get back to you
          shortly.
        </p>
      </div>

      <form
        id="ticketForm"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-stack-lg"
        noValidate
      >
        {/* ── Section 1: Basic Information ─────────────────────────── */}
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-sm">
          <div className="mb-stack-md flex items-center gap-2">
            <Info
              className="size-5 text-primary"
              aria-hidden
              strokeWidth={2}
            />
            <h2 className="text-headline-md font-semibold">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
            {/* Subject */}
            <div className="space-y-base">
              <label
                htmlFor="subject"
                className="block text-label-md text-on-surface-variant"
              >
                Ticket Subject <span className="text-error">*</span>
              </label>
              <input
                id="subject"
                type="text"
                placeholder="e.g., Cannot access billing dashboard"
                aria-invalid={errors.subject ? "true" : "false"}
                {...register("subject")}
                className="w-full rounded-lg border border-outline-variant bg-transparent px-stack-sm py-stack-sm text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <FieldError message={errors.subject?.message} />
            </div>

            {/* Category */}
            <div className="space-y-base">
              <label
                htmlFor="categoryId"
                className="block text-label-md text-on-surface-variant"
              >
                Category <span className="text-error">*</span>
              </label>
              <select
                id="categoryId"
                disabled={categoriesLoading}
                aria-invalid={errors.categoryId ? "true" : "false"}
                {...register("categoryId")}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-stack-sm py-stack-sm text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
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
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-sm">
          <div className="mb-stack-md flex items-center gap-2">
            <AlertCircle
              className="size-5 text-primary"
              aria-hidden
              strokeWidth={2}
            />
            <h2 className="text-headline-md font-semibold">Details</h2>
          </div>

          <div className="space-y-stack-md">
            {/* Priority radio group */}
            <div className="space-y-stack-sm">
              <span className="block text-label-md text-on-surface-variant">
                Priority Level
              </span>
              <div className="flex flex-wrap gap-stack-md" role="radiogroup" aria-label="Priority level">
                {PRIORITY_OPTIONS.map((opt) => {
                  const isSelected = selectedPriority === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-base group"
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register("priority")}
                        className="size-4 border-outline-variant text-primary focus:ring-primary"
                      />
                      <span
                        className={`rounded px-stack-sm py-base text-body-md transition-colors ${opt.color} ${
                          isSelected
                            ? "bg-surface-container font-semibold"
                            : "bg-surface-container-low group-hover:bg-surface-variant"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-base">
              <label
                htmlFor="description"
                className="block text-label-md text-on-surface-variant"
              >
                Detailed Description <span className="text-error">*</span>
              </label>
              <textarea
                id="description"
                rows={6}
                placeholder="Please describe the issue in detail. Include any steps to reproduce if applicable..."
                aria-invalid={errors.description ? "true" : "false"}
                {...register("description")}
                className="w-full resize-none rounded-lg border border-outline-variant bg-transparent px-stack-sm py-stack-sm text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <FieldError message={errors.description?.message} />
            </div>
          </div>
        </section>

        {/* ── AI Suggestions Panel ─────────────────────────────────────── */}
        {(aiLoading || aiResult) && (
          <section
            className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-surface-container-lowest to-secondary/5 p-stack-lg shadow-sm"
            aria-live="polite"
            aria-label="AI Suggestions"
          >
            <div className="mb-stack-md flex items-center gap-2">
              <Sparkles className="size-5 text-primary" aria-hidden strokeWidth={2} />
              <h2 className="text-headline-md font-semibold text-on-surface">
                AI Suggestions
              </h2>
              {aiLoading && (
                <span className="ml-auto flex items-center gap-1.5 text-label-md text-on-surface-variant">
                  <Loader2 className="size-3.5 animate-spin" />
                  Analyzing…
                </span>
              )}
              {!aiLoading && aiResult && (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-label-sm text-primary font-medium">
                  ✨ Powered by Gemini
                </span>
              )}
            </div>

            {/* Loading skeleton */}
            {aiLoading && !aiResult && (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-3/4 rounded-md bg-outline-variant/40" />
                <div className="h-4 w-1/2 rounded-md bg-outline-variant/40" />
                <div className="h-12 w-full rounded-lg bg-outline-variant/30" />
              </div>
            )}

            {!aiLoading && aiResult && (
              <div className="space-y-stack-md">
                {/* Category suggestion */}
                {aiResult.suggestedCategoryId && aiResult.suggestedCategoryName && (
                  <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-surface-container-low p-stack-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="size-4 shrink-0 text-primary" aria-hidden />
                      <span className="text-body-md text-on-surface">
                        AI suggests category:{" "}
                        <strong className="text-primary">{aiResult.suggestedCategoryName}</strong>
                        {aiResult.reasoning && (
                          <span className="ml-1 text-label-sm text-on-surface-variant">
                            ({aiResult.reasoning})
                          </span>
                        )}
                      </span>
                    </div>
                    {aiApplied ? (
                      <span className="flex items-center gap-1 text-label-md text-primary font-medium shrink-0">
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
                        className="shrink-0 rounded-lg border border-primary bg-primary px-stack-sm py-base text-label-md font-semibold text-on-primary shadow-sm transition hover:opacity-90 active:scale-95"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                )}

                {/* KB Article suggestions */}
                {aiResult.kbArticles.length > 0 && (
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-label-md font-medium text-on-surface-variant">
                      <BookOpen className="size-4" aria-hidden />
                      These articles may help you resolve this without submitting a ticket:
                    </p>
                    <ul className="space-y-2">
                      {aiResult.kbArticles.map((article: AiKbArticle) => (
                        <li
                          key={article.id}
                          className="rounded-lg border border-outline-variant bg-surface-container-lowest transition-all"
                        >
                          <button
                            type="button"
                            id={`ai-kb-article-${article.id}`}
                            className="flex w-full items-center justify-between gap-3 px-stack-sm py-stack-sm text-left"
                            onClick={() =>
                              setExpandedArticle(
                                expandedArticle === article.id ? null : article.id
                              )
                            }
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <BookOpen className="size-4 shrink-0 text-secondary" aria-hidden />
                              <span className="truncate text-body-md font-medium text-on-surface">
                                {article.title}
                              </span>
                              <span className="shrink-0 rounded-full bg-secondary/10 px-2 py-px text-label-sm text-secondary">
                                {article.category}
                              </span>
                            </div>
                            {expandedArticle === article.id ? (
                              <ChevronUp className="size-4 shrink-0 text-on-surface-variant" />
                            ) : (
                              <ChevronDown className="size-4 shrink-0 text-on-surface-variant" />
                            )}
                          </button>
                          {expandedArticle === article.id && (
                            <div className="border-t border-outline-variant px-stack-sm py-stack-sm">
                              <p className="text-body-md text-on-surface-variant leading-relaxed">
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

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-sm">
          <div className="mb-stack-md flex items-center gap-2">
            <Paperclip
              className="size-5 text-primary"
              aria-hidden
              strokeWidth={2}
            />
            <h2 className="text-headline-md font-semibold">Attachments</h2>
          </div>

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="File upload dropzone"
            onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={handleDrop}
            onClick={handleBrowse}
            onKeyDown={(e) => e.key === "Enter" && handleBrowse()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-stack-sm rounded-xl border-2 border-dashed p-stack-lg transition-all ${
              dragOver
                ? "border-primary bg-surface-container-high"
                : "border-outline-variant hover:border-primary hover:bg-surface-container-low"
            }`}
          >
            <CloudUpload
              className={`size-12 transition-colors ${
                dragOver ? "text-primary" : "text-on-surface-variant"
              }`}
              strokeWidth={1.5}
              aria-hidden
            />
            <p className="text-headline-md font-semibold text-on-surface">
              Drag &amp; drop files here
            </p>
            <p className="text-center text-body-md text-on-surface-variant">
              Support for PNG, JPG, PDF, or CSV (Max 10MB per file)
            </p>
            <span className="mt-base text-body-md font-bold text-primary hover:underline">
              Or browse files
            </span>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <ul className="mt-stack-md space-y-stack-sm">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-low px-stack-sm py-stack-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2
                      className="size-4 shrink-0 text-primary"
                      aria-hidden
                      strokeWidth={2}
                    />
                    <span className="truncate text-body-md">{file.name}</span>
                    <span className="shrink-0 text-label-md text-on-surface-variant">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    aria-label={`Remove ${file.name}`}
                    className="ml-2 shrink-0 rounded-full p-1 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Action Buttons ───────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-stack-md py-stack-md">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-outline-variant px-container-margin py-stack-sm text-body-md font-bold text-secondary transition-colors hover:bg-surface-container-low active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isReduxSubmitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-container-margin py-stack-sm text-body-md font-bold text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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
