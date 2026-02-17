"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./ui";

export function Accordion({
  items,
}: {
  items: Array<{ q: string; a: string }>;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {items.map((it, idx) => {
        const isOpen = open === idx;
        return (
          <div key={it.q} className="rounded-2xl border border-slate-200 bg-white">
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpen(isOpen ? null : idx)}
              type="button"
            >
              <span className="text-sm font-semibold text-slate-900">{it.q}</span>
              <ChevronDown className={cn("h-4 w-4 text-slate-500 transition", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 text-sm leading-relaxed text-slate-600">
                {it.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
