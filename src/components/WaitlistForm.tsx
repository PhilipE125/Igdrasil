"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1200);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2">
      {status === "success" ? (
        <p className="h-11 inline-flex items-center text-base font-semibold text-foreground">
          You&apos;re on the list. We&apos;ll be in touch.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center gap-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={status === "loading"}
            aria-label="Email address"
            className="h-11 flex-1 rounded-[10px] border border-input bg-layer-3 px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 focus:ring-2 focus:ring-foreground/15 transition-all"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-foreground px-6 text-base font-semibold text-background shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.2)] hover:bg-foreground/85 hover:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {status === "loading" ? "…" : "Get notified"}
          </button>
        </form>
      )}
      <p className="text-sm text-muted-foreground">
        Join waitlist for free onboarding
      </p>
    </div>
  );
}
