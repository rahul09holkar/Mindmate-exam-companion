import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col justify-center">
      <Card className="text-center">
        <h1 className="text-xl font-semibold text-ink">Page not found</h1>
        <p className="mt-2 text-ink-soft">
          That page doesn&apos;t exist. Let&apos;s get you back on track.
        </p>
        <ButtonLink href="/" className="mt-4">
          Go home
        </ButtonLink>
      </Card>
    </div>
  );
}
