import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/5 supports-[backdrop-filter]:bg-background/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
          </svg>
          <span className="font-heading font-bold text-base sm:text-xl tracking-tight">
            Chakramantra
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium">
          <Link
            href="/articles"
            className="transition-colors hover:text-foreground/80 text-foreground/60 whitespace-nowrap"
          >
            Articles
          </Link>
          <Link
            href="/chess"
            className="transition-colors hover:text-primary text-foreground/80 font-semibold flex items-center gap-1 whitespace-nowrap px-2 sm:px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300"
          >
            <span className="text-sm leading-none">♟</span> Chess
          </Link>
          <Link
            href="/about"
            className="transition-colors hover:text-foreground/80 text-foreground/60 whitespace-nowrap"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
