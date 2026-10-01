import { StoreButtons } from "./StoreButtons";

export function FinalCta() {
  return (
    <section id="get-the-app" aria-labelledby="get-the-app-title" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-purple/25 bg-ink-2 p-8 text-center sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Shariah-compliant · USDT ↔ MYR</p>
        <h2 id="get-the-app-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Make your first transfer with SafeFi+
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Verify once with eKYC, convert between Ringgit and USDT, and follow every transfer to settlement.
        </p>
        <StoreButtons placement="final" className="mt-8 flex flex-col items-center [&>div:first-child]:justify-center" />
      </div>
    </section>
  );
}
