import { SignUpForm } from "./sign-up-form";

export const metadata = { title: "Sign up" };

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <SignUpContent searchParams={searchParams} />
    </Suspense>
  );
}

import { Suspense } from "react";

async function SignUpContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  return <SignUpForm next={sp.next || "/onboarding"} />;
}
