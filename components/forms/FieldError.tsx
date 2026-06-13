/**
 * Inline validation message. Rendered with role="alert" so assistive tech
 * announces it, and given a stable id so inputs can reference it via
 * aria-describedby.
 */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-alert">
      {message}
    </p>
  );
}
