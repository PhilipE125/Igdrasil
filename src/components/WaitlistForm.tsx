"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    // TODO: wire real provider (Formspree, Resend, Vercel KV, etc.)
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1200);
  };

  if (status === "success") {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-card border border-border rounded-xl shadow-sm">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-success/30 flex items-center justify-center text-foreground mb-2">
            <Check size={24} />
          </div>
          <h3 className="text-xl font-light text-foreground tracking-tight">You're on the list.</h3>
          <p className="text-sm font-light text-muted-foreground">We'll be in touch when the beta opens.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 rounded-lg blur opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
      <form onSubmit={handleSubmit} className="relative flex items-center shadow-sm rounded-lg">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-card border border-border text-foreground placeholder-muted-foreground rounded-l-lg py-4 px-6 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/60 transition-all text-sm font-light tracking-wide"
          disabled={status === "loading"}
          required
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-foreground text-background font-medium py-4 px-6 rounded-r-lg hover:bg-foreground/85 transition-colors flex items-center justify-center min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed border border-foreground"
        >
          {status === "loading" ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <span className="mr-2 text-xs font-medium uppercase tracking-widest">Notify me</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
