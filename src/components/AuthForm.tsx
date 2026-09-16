"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({ phone });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("otp");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (step === "phone") {
    return (
      <form onSubmit={sendOtp} className="max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Mobile number
          </label>
          <input
            type="tel"
            required
            placeholder="+639171234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-foreground/60 mt-1">
            Use the full number with country code, e.g. +63.
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground rounded-full py-2 font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Sending code…" : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyOtp} className="max-w-sm space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Enter the code sent to {phone}
        </label>
        <input
          type="text"
          required
          inputMode="numeric"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground rounded-full py-2 font-medium hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Verifying…" : "Verify & continue"}
      </button>
      <button
        type="button"
        onClick={() => setStep("phone")}
        className="w-full text-sm text-foreground/60 hover:text-primary"
      >
        Use a different number
      </button>
    </form>
  );
}
