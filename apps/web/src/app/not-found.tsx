import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#eeeeee] px-4 text-center">
      <div className="rounded-[24px] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold">Page not found</h1>
        <p className="mt-2 text-sm font-medium text-[#777]">The page you are looking for does not exist.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-[#111] px-6 py-3 text-sm font-bold text-white">
          Back to assignments
        </Link>
      </div>
    </main>
  );
}
