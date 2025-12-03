"use client";

import { useState } from "react";
import { HiChevronDown, HiQuestionMarkCircle } from "react-icons/hi2";

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: "How long does it take to get approved?",
    answer:
      "Most applications are reviewed within 24-48 hours. You'll receive an email notification once your application is approved, and you can start promoting immediately.",
  },
  {
    question: "When and how do I get paid?",
    answer:
      "Commissions are calculated in real-time and paid out according to the program's schedule (typically monthly or bi-weekly). You can choose from multiple payment methods including PayPal, bank transfer, or wire transfer.",
  },
  {
    question: "What marketing materials are provided?",
    answer:
      "You'll get access to banners, email templates, social media content, and tracking links. All materials are professionally designed and optimized for conversions.",
  },
  {
    question: "Is there a minimum payout threshold?",
    answer:
      "Yes, most programs have a minimum payout threshold (typically $50-$100). Your commissions will accumulate until you reach this threshold, then payment is processed automatically.",
  },
  {
    question: "Can I promote on social media?",
    answer:
      "Absolutely! Social media promotion is encouraged. You can share your affiliate links on Twitter, Facebook, Instagram, YouTube, TikTok, and other platforms following the program's guidelines.",
  },
  {
    question: "Do I need a website to join?",
    answer:
      "While having a website is beneficial, it's not always required. Many affiliates successfully promote through social media, YouTube, email lists, or other channels.",
  },
];

export function ProgramFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <HiQuestionMarkCircle className="w-5 h-5 text-[var(--accent)]" />
        Frequently Asked Questions
      </h2>

      <div className="space-y-2">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className="rounded-lg border border-[var(--border)] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-5 py-3.5 flex items-center justify-between gap-4 text-left hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <span className="font-medium text-[var(--text-primary)] text-sm flex-1">
                  {faq.question}
                </span>
                <HiChevronDown
                  className={`w-5 h-5 text-[var(--text-secondary)] shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 pb-3.5 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
