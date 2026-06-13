/** Read-only display of detected stress triggers as labelled chips. */
export function TriggerChips({ triggers }: { triggers: string[] }) {
  if (triggers.length === 0) {
    return <p className="text-ink-soft">No specific triggers stood out today.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {triggers.map((trigger) => (
        <li
          key={trigger}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1 text-sm text-ink"
        >
          <span aria-hidden="true" className="text-ink-faint">
            •
          </span>
          {trigger}
        </li>
      ))}
    </ul>
  );
}
