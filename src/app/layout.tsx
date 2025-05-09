import "@/app/globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import { AuthButton } from "@/components/ui/auth-button";

export const metadata = {
  title: "Personal Finance Suite",
  description: "Track your personal finances with insight and ease.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-gradient-to-br from-slate-50 to-slate-100">
      <body className="min-h-screen antialiased font-inter flex flex-col">
        <header className="bg-white/80 shadow-sm sticky top-0 z-40">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-2xl font-black text-indigo-700 tracking-tight hover:text-indigo-900 transition-colors">
              💸 FinSuite
            </Link>
            <nav className="flex items-center gap-8 text-lg font-medium">
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-xl hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors data-[active=true]:bg-indigo-100 data-[active=true]:text-indigo-900"
                data-active={typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard") ? "true" : undefined}
              >
                Dashboard
              </Link>
              {/* Add other nav items here */}
              <AuthButton />
            </nav>
          </div>
        </header>
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="bg-white/80 border-t mt-12 py-6 px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} FinSuite. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
