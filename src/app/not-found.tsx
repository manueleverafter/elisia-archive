import Link from "next/link";
import { Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-6xl" aria-hidden>
        🐰
      </p>
      <h1 className="mt-4 font-display text-4xl">this bunny hopped away</h1>
      <p className="mt-2 text-muted">We couldn&apos;t find that page.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-primary px-5 py-3 font-semibold text-primary-fg"
      >
        Back home
      </Link>
    </Container>
  );
}
