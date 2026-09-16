import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DriverRoutesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: routes } = await supabase
    .from("routes")
    .select("*")
    .eq("driver_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Your routes</h1>
        <Link
          href="/driver/routes/new"
          className="bg-primary text-primary-foreground px-5 py-2 rounded-full font-medium hover:opacity-90"
        >
          Post a route
        </Link>
      </div>

      {!routes || routes.length === 0 ? (
        <p className="text-foreground/70">
          You haven't posted a route yet. Post the one you already drive so
          neighbors along the way can find you.
        </p>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="border border-border rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="font-display font-bold">
                  {route.origin_label} → {route.destination_label}
                </p>
                <p className="text-sm text-foreground/70">
                  {route.seats_available} seat(s) ·{" "}
                  {route.cost_share ? `₱${route.cost_share} per rider` : "cost TBD"}{" "}
                  · {route.schedule_time || "no time set"}
                </p>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  route.active
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-foreground/60"
                }`}
              >
                {route.active ? "Active" : "Paused"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
