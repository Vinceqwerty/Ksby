"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import RideCard from "@/components/RideCard";
import type { RouteSearchResult } from "@/lib/types";

export default function PassengerSearchPage() {
  const [originLat, setOriginLat] = useState("");
  const [originLng, setOriginLng] = useState("");
  const [destLat, setDestLat] = useState("");
  const [destLng, setDestLng] = useState("");
  const [results, setResults] = useState<RouteSearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setError(null);
    setResults(null);

    const { data, error } = await supabase.rpc("search_routes", {
      origin_lng: parseFloat(originLng),
      origin_lat: parseFloat(originLat),
      dest_lng: parseFloat(destLng),
      dest_lat: parseFloat(destLat),
      buffer_meters: 700,
    });

    setSearching(false);
    if (error) {
      setError(error.message);
      return;
    }
    setResults(data as RouteSearchResult[]);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-bold mb-2">Find a ride</h1>
      <p className="text-foreground/70 mb-8">
        Enter where you're starting and where you're headed — we'll match
        you to drivers already going that way.
      </p>

      <form
        onSubmit={handleSearch}
        className="grid md:grid-cols-4 gap-3 mb-10 max-w-2xl"
      >
        <input
          required
          type="number"
          step="any"
          placeholder="Origin latitude"
          value={originLat}
          onChange={(e) => setOriginLat(e.target.value)}
          className="border border-border rounded-lg px-3 py-2"
        />
        <input
          required
          type="number"
          step="any"
          placeholder="Origin longitude"
          value={originLng}
          onChange={(e) => setOriginLng(e.target.value)}
          className="border border-border rounded-lg px-3 py-2"
        />
        <input
          required
          type="number"
          step="any"
          placeholder="Destination latitude"
          value={destLat}
          onChange={(e) => setDestLat(e.target.value)}
          className="border border-border rounded-lg px-3 py-2"
        />
        <input
          required
          type="number"
          step="any"
          placeholder="Destination longitude"
          value={destLng}
          onChange={(e) => setDestLng(e.target.value)}
          className="border border-border rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          disabled={searching}
          className="md:col-span-4 bg-primary text-primary-foreground rounded-full py-2 font-medium hover:opacity-90 disabled:opacity-50"
        >
          {searching ? "Searching…" : "Search rides"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

      {results && results.length === 0 && (
        <p className="text-foreground/70">
          No drivers along that route yet. Try widening your pickup point or
          check back later.
        </p>
      )}

      {results && results.length > 0 && (
        <div className="space-y-4 max-w-2xl">
          {results.map((ride) => (
            <RideCard key={ride.route_id} ride={ride} />
          ))}
        </div>
      )}
    </div>
  );
}
