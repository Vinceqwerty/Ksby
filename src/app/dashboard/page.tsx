import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({ id: user.id, phone: user.phone })
      .select("*")
      .single();
    profile = created;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-bold mb-2">
        Kumusta, {profile?.full_name || "neighbor"}!
      </h1>
      <p className="text-foreground/70 mb-10">
        {profile?.trip_count || 0} trips completed · rating{" "}
        {profile?.rating_avg ?? "—"}
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/profile"
          className="border border-border rounded-xl p-6 hover:border-primary"
        >
          <h2 className="font-display font-bold mb-1">Complete your profile</h2>
          <p className="text-sm text-foreground/70">
            Add your name and choose whether you're a driver, passenger, or
            both.
          </p>
        </Link>
        <Link
          href="/driver/routes"
          className="border border-border rounded-xl p-6 hover:border-primary"
        >
          <h2 className="font-display font-bold mb-1">Your routes</h2>
          <p className="text-sm text-foreground/70">
            Post a route you already drive and see who's requested a seat.
          </p>
        </Link>
        <Link
          href="/passenger/search"
          className="border border-border rounded-xl p-6 hover:border-primary"
        >
          <h2 className="font-display font-bold mb-1">Find a ride</h2>
          <p className="text-sm text-foreground/70">
            Search for drivers already heading your way.
          </p>
        </Link>
      </div>
    </div>
  );
}
