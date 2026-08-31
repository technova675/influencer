import Link from "next/link";

export default function NotFound() {
  return (
    <main className="ground-1 grid min-h-screen place-items-center px-5">
      <div className="max-w-md text-center">
        <p className="overline">404</p>
        <h1 className="display-sm mt-4 text-3xl">
          There&rsquo;s nothing at this address.
        </h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          The page may have moved, or the link may be out of date.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/for-brands" className="btn btn-primary">
            I&rsquo;m hiring
          </Link>
          <Link href="/join" className="btn btn-ghost">
            Join as a creator
          </Link>
        </div>
      </div>
    </main>
  );
}
