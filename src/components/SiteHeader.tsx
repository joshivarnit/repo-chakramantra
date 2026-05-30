import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/5 supports-[backdrop-filter]:bg-background/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg
            className="h-6 w-6 text-blue-500 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
          </svg>
          <span className="font-heading font-bold text-lg sm:text-xl tracking-tight line-clamp-1">
            Chakramantra
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
          <Link
            href="/articles"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Articles
          </Link>
          <Link
            href="/about"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
