import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-bold mb-2">Log in</h1>
      <p className="text-foreground/70 mb-8">
        We'll text you a one-time code — no password to remember.
      </p>
      <AuthForm />
    </div>
  );
}
