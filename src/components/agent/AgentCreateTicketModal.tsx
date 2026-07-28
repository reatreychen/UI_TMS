"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Search, Bold, Italic, Link as LinkIcon, List, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

const createTicketSchema = z.object({
  customer: z.string().optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  category: z.enum([
    "Technical",
    "Billing",
    "Security",
    "Feature Request",
  ]),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  description: z.string().min(10, "Please provide more detail (10+ characters)"),
});

type CreateTicketFormValues = z.infer<typeof createTicketSchema>;

const categoryOptions = createTicketSchema.shape.category.options;
const priorityOptions = createTicketSchema.shape.priority.options;

interface AgentCreateTicketTriggerProps {
  children: ReactNode;
  className?: string;
}

export function AgentCreateTicketTrigger({
  children,
  className,
}: AgentCreateTicketTriggerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>
      {open ? <AgentCreateTicketModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}

interface AgentCreateTicketModalProps {
  onClose: () => void;
}

function AgentCreateTicketModal({ onClose }: AgentCreateTicketModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      customer: "",
      subject: "",
      category: "Technical",
      priority: "Medium",
      description: "",
    },
  });

  const onSubmit = async (_values: CreateTicketFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success("Ticket created successfully!");
    reset();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-ticket-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm"
    >
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-xl shadow-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-bright">
          <h2 id="create-ticket-title" className="text-headline-md font-bold text-on-surface">
            Create New Ticket
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
          >
            <X aria-hidden className="size-5" strokeWidth={2} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          <form id="create-ticket-form" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Customer & Subject */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-label-md text-on-surface-variant uppercase tracking-wider">
                  Customer
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" strokeWidth={2} />
                  <input
                    type="text"
                    {...register("customer")}
                    placeholder="Search customer name or email..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-label-md text-on-surface-variant uppercase tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  {...register("subject")}
                  placeholder="Brief summary of the issue"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
                {errors.subject && (
                  <p className="text-label-md text-error">{errors.subject.message}</p>
                )}
              </div>
            </div>

            {/* Priority & Category */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-label-md text-on-surface-variant uppercase tracking-wider">
                  Priority
                </label>
                <select
                  {...register("priority")}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                >
                  {priorityOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-label-md text-on-surface-variant uppercase tracking-wider">
                  Category
                </label>
                <select
                  {...register("category")}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 mb-4">
              <label className="text-label-md text-on-surface-variant uppercase tracking-wider">
                Description
              </label>
              <div className="border border-outline-variant rounded-lg overflow-hidden bg-surface-container-low">
                <div className="flex items-center gap-1 px-2 py-1.5 border-b border-outline-variant bg-surface-bright">
                  <button type="button" className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant">
                    <Bold className="size-4" strokeWidth={2} />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant">
                    <Italic className="size-4" strokeWidth={2} />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant">
                    <LinkIcon className="size-4" strokeWidth={2} />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant">
                    <List className="size-4" strokeWidth={2} />
                  </button>
                </div>
                <textarea
                  {...register("description")}
                  rows={5}
                  placeholder="Describe the issue in detail..."
                  className="w-full p-4 text-body-md border-none focus:ring-0 resize-none bg-surface-container-low outline-none"
                />
              </div>
              {errors.description && (
                <p className="text-label-md text-error">{errors.description.message}</p>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-1.5">
              <label className="text-label-md text-on-surface-variant uppercase tracking-wider">
                Attachments
              </label>
              <div className="border-2 border-dashed border-outline-variant rounded-lg p-6 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
                <UploadCloud className="size-6 text-on-surface-variant mb-2" strokeWidth={2} />
                <p className="text-body-md font-medium">Click to upload or drag and drop</p>
                <p className="text-label-md text-on-surface-variant">PDF, PNG, JPG or TXT (max. 10MB)</p>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-bright">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-on-surface-variant font-bold hover:bg-surface-container rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-ticket-form"
            disabled={isSubmitting}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}
