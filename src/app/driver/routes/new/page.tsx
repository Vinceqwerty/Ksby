import RouteForm from "@/components/RouteForm";

export default function NewRoutePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-bold mb-2">Post a route</h1>
      <p className="text-foreground/70 mb-8">
        Only the route you already drive — this isn't a taxi dispatch, just
        neighbors sharing a trip.
      </p>
      <RouteForm />
    </div>
  );
}
