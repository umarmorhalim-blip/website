import { Logo } from "./Logo";
import { StoreButtons } from "./StoreButtons";

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-linear-to-b from-ink via-ink/75 to-transparent">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 md:py-4"
      >
        <a href="#top" className="text-lg text-text" aria-label="SafeFi+ home">
          <Logo />
        </a>
        {/* One button on phones (the sticky bar carries the rest), both on larger screens. */}
        <StoreButtons placement="nav" compact showHint={false} className="[&_a:nth-child(n+2)]:hidden sm:[&_a:nth-child(n+2)]:inline-flex" />
      </nav>
    </header>
  );
}
