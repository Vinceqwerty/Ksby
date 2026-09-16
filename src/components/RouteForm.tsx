"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function RouteForm() {
  const [originLabel, setOriginLabel] = useState("");
  const [originLat, setOriginLat] = useState("");
  const [originLng, setOriginLng] = useState("");
  const [destLabel, setDestLabel] = useState("");
  const [destLat, setDestLat] = useState("");
  const [destLng, setDestLng] = useState("");
  const [seats, setSeats] = useState("2");
  const [cost, setCost] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [time, setTime] = useState("06:30");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  function toggleDay(day: string) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase.rpc("create_route_straight", {
      p_origin_label: originLabel,
      p_destination_label: destLabel,
      p_origin_lng: parseFloat(originLng),
      p_origin_lat: parseFloat(originLat),
      p_dest_lng: parseFloat(destLng),
      p_dest_lat: parseFloat(destLat),
      p_seats_available: parseInt(seats, 10),
      p_cost_share: cost ? parseFloat(cost) : null,
      p_schedule_days: days,
      p_schedule_time: time,
    });

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }

    router.push("/driver/routes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div className="grid md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">
            Origin name
          </label>
          <input
            required
            value={originLabel}
            onChange={(e) => setOriginLabel(e.target.value)}
            placeholder="Montalban"
            className="w-full border border-border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Origin latitude
          </label>
          <input
            required
            type="number"
            step="any"
            value={originLat}
            onChange={(e) => setOriginLat(e.target.value)}
            placeholder="14.7306"
            className="w-full border border-border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Origin longitude
          </label>
          <input
            required
            type="number"
            step="any"
            value={originLng}
            onChange={(e) => setOriginLng(e.target.value)}
            placeholder="121.1289"
            className="w-full border border-border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Destination name
          </label>
          <input
            required
            value={destLabel}
            onChange={(e) => setDestLabel(e.target.value)}
            placeholder="BGC, Taguig"
            className="w-full border border-border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Destination latitude
          </label>
          <input
            required
            type="number"
            step="any"
            value={destLat}
            onChange={(e) => setDestLat(e.target.value)}
            placeholder="14.5510"
            className="w-full border border-border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Destination longitude
          </label>
          <input
            required
            type="number"
            step="any"
            value={destLng}
            onChange={(e) => setDestLng(e.target.value)}
            placeholder="121.0509"
            className="w-full border border-border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <p className="text-xs text-foreground/60 -mt-2">
        Tip: right-click a point on Google Maps and copy the coordinates
        shown. Later this can be replaced with a map picker.
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Empty seats
          </label>
          <input
            type="number"
            min="1"
            max="4"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Cost share per passenger (₱)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="150"
            className="w-full border border-border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Days you drive this route
        </label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              type="button"
              key={day}
              onClick={() => toggleDay(day)}
              className={`px-3 py-1.5 rounded-full border text-sm ${
                days.includes(day)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Usual departure time
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border border-border rounded-lg px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-primary text-primary-foreground rounded-full px-6 py-2 font-medium hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Posting…" : "Post this route"}
      </button>
    </form>
  );
}
