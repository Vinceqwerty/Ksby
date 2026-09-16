import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6">
      <section className="py-24 md:py-32 max-w-2xl">
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight text-foreground">
          Hindi negosyo,
          <br />
          kapit-bahay.
        </h1>
        <p className="mt-6 text-lg text-foreground/80 max-w-md">
          Sabay.ph connects drivers and passengers already heading the same
          way. A neighbor with an empty seat, a neighbor who needs one —
          nothing more, nothing less.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/passenger/search"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90"
          >
            Find a ride
          </Link>
          <Link
            href="/driver/routes/new"
            className="border border-border px-6 py-3 rounded-full font-medium hover:border-primary hover:text-primary"
          >
            Offer a ride
          </Link>
        </div>
      </section>

      <section className="py-16 border-t border-border grid md:grid-cols-3 gap-10">
        <div>
          <h2 className="font-display font-bold text-lg mb-2">Cost only</h2>
          <p className="text-foreground/70 text-sm">
            Drivers share the actual cost of a trip they were already
            taking — fuel, tolls, parking. Never a markup.
          </p>
        </div>
        <div>
          <h2 className="font-display font-bold text-lg mb-2">
            Verified neighbors
          </h2>
          <p className="text-foreground/70 text-sm">
            Every driver and passenger signs up with a verified number.
            Ratings build trust over time.
          </p>
        </div>
        <div>
          <h2 className="font-display font-bold text-lg mb-2">
            Your route, your terms
          </h2>
          <p className="text-foreground/70 text-sm">
            Drivers only get matched with passengers already along the
            route they were driving anyway.
          </p>
        </div>
      </section>
    </div>
  );
}
