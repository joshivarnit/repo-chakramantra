"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("Subscribed successfully!");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Failed to subscribe.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-left">
      <h3 className="font-heading font-bold text-lg mb-2">Subscribe to our daily digest</h3>
      <p className="text-foreground/60 text-sm mb-4">
        Get the latest high-signal articles and research summaries delivered directly to your inbox every morning. No spam, just pure signal.
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2 relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === "loading" || status === "success"}
          className="flex-1 h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-background/50 px-3 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="h-10 px-4 flex items-center justify-center rounded-md bg-foreground text-background font-medium text-sm transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 min-w-[100px]"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <>
              Subscribe <ArrowRight className="ml-2 h-3 w-3" />
            </>
          )}
        </button>
      </form>
      
      {message && (
        <p className={`text-xs mt-2 ${status === "success" ? "text-green-500" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
