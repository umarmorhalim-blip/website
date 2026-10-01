import type { Chapter } from "@/content/chapters";
import { VALIDATOR_COUNT } from "@/lib/journey";
import { StaticIllustration } from "./StaticIllustration";
import { StoreButtons } from "./StoreButtons";

/**
 * One chapter of the story as real HTML. In cinematic mode it is an overlay card
 * on the pinned canvas; in flow mode it is a normal section with a still image.
 */
export function ChapterCard({ chapter }: { chapter: Chapter }) {
  const Heading = chapter.index === 0 ? "h1" : "h2";
  return (
    <li
      id={`chapter-${chapter.id}`}
      data-chapter={chapter.index}
      aria-labelledby={`chapter-${chapter.id}-title`}
      className="chapter mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 md:min-h-[80vh] md:grid-cols-2 md:gap-14"
    >
      <div className="chapter-card rounded-2xl p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-light">{chapter.eyebrow}</p>
        <Heading
          id={`chapter-${chapter.id}-title`}
          className={`mt-2 font-bold tracking-tight text-text ${
            chapter.index === 0 ? "text-3xl sm:text-5xl" : "text-2xl sm:text-4xl"
          }`}
        >
          {chapter.title}
        </Heading>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-muted sm:text-base">{chapter.body}</p>

        {chapter.facts && (
          <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
            {chapter.facts.map((f) => (
              <div key={f.label} className="rounded-lg bg-white/5 px-2.5 py-2">
                <dt className="text-[0.7rem] uppercase tracking-wider text-muted">{f.label}</dt>
                <dd className="mt-0.5 text-[0.82rem] font-semibold whitespace-nowrap text-text sm:text-sm">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {chapter.tags && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Checks passed">
            {chapter.tags.map((t) => (
              <li key={t} className="rounded-full border border-success/40 bg-success/10 px-3 py-1 text-sm font-medium text-success">
                ✓ {t}
              </li>
            ))}
          </ul>
        )}

        {chapter.id === "validation" && (
          <p className="mt-4 flex items-baseline gap-2 text-sm text-muted" aria-live="off">
            <span>Validator votes</span>
            <span className="font-mono text-lg font-semibold text-success">
              {/* Updated live by the scroll timeline; the static value is the finished state. */}
              <span data-votes>{VALIDATOR_COUNT}</span>/{VALIDATOR_COUNT}
            </span>
            <span className="text-xs">(illustrative)</span>
          </p>
        )}

        {chapter.note && <p className="mt-3 text-xs text-muted">{chapter.note}</p>}

        {chapter.id === "settlement" && <StoreButtons placement="chapter" className="mt-5" />}

        {chapter.index === 0 && (
          <p className="mt-5 flex items-center gap-2 text-sm text-purple-light">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 motion-safe:animate-bounce" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
            Scroll to follow the transfer
          </p>
        )}
      </div>
      <div className="chapter-illustration">
        <StaticIllustration chapter={chapter.index} />
      </div>
    </li>
  );
}
