"use client";

import { useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Comma-separated list editor. The visible input is for typing; the hidden
 * input submits the same CSV shape the existing server actions expect.
 */
export function TagInput({
  id,
  name,
  defaultValue = [],
  placeholder,
  className,
  maxTags = 30,
}: {
  id: string;
  name: string;
  defaultValue?: string[];
  placeholder?: string;
  className?: string;
  maxTags?: number;
}) {
  const [tags, setTags] = useState<string[]>(() => defaultValue.filter(Boolean));
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function add(raw: string) {
    const parts = raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setTags((current) => {
      const seen = new Set(current.map((tag) => tag.toLowerCase()));
      const next = [...current];
      for (const part of parts) {
        const key = part.toLowerCase();
        if (!seen.has(key) && next.length < maxTags) {
          seen.add(key);
          next.push(part);
        }
      }
      return next;
    });
    setDraft("");
  }

  function remove(index: number) {
    setTags((current) => current.filter((_, position) => position !== index));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && draft.trim()) {
      event.preventDefault();
      add(draft);
      return;
    }
    if (event.key === ",") {
      event.preventDefault();
      add(draft);
      return;
    }
    if (event.key === "Backspace" && !draft && tags.length > 0) {
      remove(tags.length - 1);
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    if (text.includes(",")) {
      event.preventDefault();
      add(text);
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-xl border border-line-strong bg-surface px-2 py-1.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center gap-1 rounded-lg bg-paper px-2 py-1 text-xs text-ink"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(index)}
            aria-label={`Remove ${tag}`}
            className="rounded p-0.5 text-muted hover:text-danger focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={() => add(draft)}
        placeholder={tags.length === 0 ? placeholder : "Add another…"}
        className="min-w-24 flex-1 border-0 bg-transparent px-1 py-1 text-sm text-ink placeholder:text-muted/70 focus:outline-none"
        autoComplete="off"
      />
      <input type="hidden" name={name} value={tags.join(", ")} />
    </div>
  );
}
