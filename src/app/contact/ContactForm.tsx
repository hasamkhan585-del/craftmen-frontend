"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CF7Field } from "./page";

interface CF7Result {
  status:          string;
  message:         string;
  invalid_fields?: { field: string; message: string; idref?: string | null }[];
}

const ERROR_STYLE = { borderColor: "#EF4444" };

export default function ContactForm({ fields }: { fields: CF7Field[] }) {
  const router = useRouter();

  const [form,    setForm]    = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, ""]))
  );
  const [sending, setSending] = useState(false);
  const [result,  setResult]  = useState<CF7Result | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function fieldError(name: string): string {
    return result?.invalid_fields?.find((f) => f.field === name)?.message ?? "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult(null);

    try {
      const res  = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json() as CF7Result;
      setResult(data);
      if (data.status === "mail_sent") {
        router.push("/thank-you");
      }
    } catch {
      setResult({ status: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSending(false);
    }
  }

  function renderField(field: CF7Field) {
    const err = fieldError(field.name);
    const label = field.name
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
      <div key={field.name}>
        <label htmlFor={field.name} className="contact-label">
          {label}{field.required && " *"}
        </label>

        {field.type === "textarea" ? (
          <textarea
            id={field.name}
            name={field.name}
            required={field.required}
            rows={6}
            value={form[field.name] ?? ""}
            onChange={handleChange}
            className="contact-input resize-none"
            placeholder={field.placeholder}
            style={err ? ERROR_STYLE : undefined}
          />
        ) : field.type === "select" ? (
          <select
            id={field.name}
            name={field.name}
            required={field.required}
            value={form[field.name] ?? ""}
            onChange={handleChange}
            className="contact-input"
            style={err ? ERROR_STYLE : undefined}
          >
            {field.options.map((opt) => (
              <option key={opt} value={opt === field.placeholder ? "" : opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={field.name}
            name={field.name}
            type={field.type === "tel" ? "tel" : field.type === "email" ? "email" : "text"}
            required={field.required}
            value={form[field.name] ?? ""}
            onChange={handleChange}
            className="contact-input"
            placeholder={field.placeholder}
            style={err ? ERROR_STYLE : undefined}
          />
        )}

        {err && <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>{err}</p>}
      </div>
    );
  }

  // Group first two non-textarea/select fields side-by-side (name + email)
  const inlineFields  = fields.filter((f) => f.type !== "textarea" && f.type !== "select").slice(0, 2);
  const inlineNames   = new Set(inlineFields.map((f) => f.name));
  const remainingFields = fields.filter((f) => !inlineNames.has(f.name));

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* First two short fields side-by-side */}
      {inlineFields.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {inlineFields.map(renderField)}
        </div>
      )}

      {/* Remaining fields stacked */}
      {remainingFields.map(renderField)}

      {/* Non-field / server errors */}
      {result && result.status !== "mail_sent" && result.status !== "validation_failed" && (
        <div
          className="p-4 rounded-lg text-sm"
          style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}
        >
          {result.message || "Something went wrong. Please try again or email us directly."}
        </div>
      )}

      {/* Validation summary — only shown when no per-field messages */}
      {result?.status === "validation_failed" && !result.invalid_fields?.length && (
        <div
          className="p-4 rounded-lg text-sm"
          style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}
        >
          {result.message || "Please check the fields above and try again."}
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="btn-primary w-full text-center"
        style={{ opacity: sending ? 0.7 : 1, cursor: sending ? "not-allowed" : "pointer" }}
      >
        {sending ? "Sending…" : "Send Message"}
      </button>

      <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
        We reply within one business day. Your information is never shared.
      </p>
    </form>
  );
}
