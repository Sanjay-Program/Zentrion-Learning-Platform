import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="container-narrow" style={{ padding: "var(--space-16) var(--space-6)", textAlign: "center" }}>
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p className="lead">The page you are looking for does not exist or has been moved.</p>
      <div className="flex justify-center gap-3 mt-8">
        <Button href="/">Back to home</Button>
        <Button variant="secondary" href="/courses">Browse courses</Button>
      </div>
    </div>
  );
}
