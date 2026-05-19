import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">403</h1>
        <p className="text-xl">Unauthorized Access</p>
        <p className="text-gray-600">
          You don&apos;t have permission to access this page.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded bg-black px-6 py-2 text-white"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
