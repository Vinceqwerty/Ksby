import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold text-primary">
          Sabay<span className="text-accent">.ph</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/passenger/search" className="hover:text-primary">
            Find a ride
          </Link>
          <Link href="/driver/routes" className="hover:text-primary">
            Offer a ride
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-primary">
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-full hover:opacity-90"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
