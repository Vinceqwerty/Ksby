"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [role, setRole] = useState(profile.role);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await supabase
      .from("profiles")
      .update({ full_name: fullName, role })
      .eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="max-w-md space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">Full name</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">I want to</label>
        <div className="flex gap-3">
          {(["passenger", "driver", "both"] as const).map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setRole(option)}
              className={`px-4 py-2 rounded-full border text-sm capitalize ${
                role === option
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary"
              }`}
            >
              {option === "both" ? "Both" : `Be a ${option}`}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-primary text-primary-foreground rounded-full px-6 py-2 font-medium hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
      {saved && <p className="text-sm text-primary">Saved.</p>}
    </form>
  );
}
