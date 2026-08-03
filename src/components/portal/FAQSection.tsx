"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/src/constants/knowledgeBase";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-surface-container-low/30 px-container-margin py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <span className="text-label-md font-bold uppercase tracking-widest text-primary">
            Self-Service
          </span>
          <h2 className="mt-2 text-headline-lg font-bold">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-lg border border-outline-variant bg-surface-container-lowest transition-all duration-300 ${
                  isOpen ? "bg-surface-container-high/30" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-stack-md text-left outline-none"
                >
                  <span className="text-body-lg font-bold">{faq.question}</span>
                  <ChevronDown
                    aria-hidden
                    className={`size-5 text-on-surface-variant transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <p className="px-stack-md pb-stack-md text-body-md text-on-surface-variant">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
