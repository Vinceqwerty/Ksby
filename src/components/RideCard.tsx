"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RouteSearchResult } from "@/lib/types";

export default function RideCard({ ride }: { ride: RouteSearchResult }) {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleRequest() {
    setRequesting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.from("ride_requests").insert({
      route_id: ride.route_id,
      passenger_id: user.id,
      cost_share: ride.cost_share,
    });

    setRequesting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setRequested(true);
  }

  return (
    <div className="border border-border rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display font-bold">
            {ride.origin_label} → {ride.destination_label}
          </p>
          <p className="text-sm text-foreground/70 mt-1">
            Driver: {ride.driver_name || "Neighbor"} ·{" "}
            {ride.seats_available} seat(s) left
          </p>
          <p className="text-sm text-foreground/70">
            {ride.schedule_days?.join(", ") || "Schedule flexible"}
            {ride.schedule_time ? ` · ${ride.schedule_time}` : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display font-bold text-lg text-primary">
            {ride.cost_share ? `₱${ride.cost_share}` : "TBD"}
          </p>
          <button
            onClick={handleRequest}
            disabled={requesting || requested}
            className="mt-2 bg-primary text-primary-foreground text-sm px-4 py-1.5 rounded-full hover:opacity-90 disabled:opacity-50"
          >
            {requested ? "Requested" : requesting ? "Requesting…" : "Request seat"}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
