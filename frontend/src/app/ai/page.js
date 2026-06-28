import Link from "next/link";

export default function AiPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Material AI Assistant</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Open a material to use the AI assistant. Click &quot;Ask AI About This Material&quot; on any material detail page.
        </p>
        <Link
          href="/materials"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
        >
          Browse materials
        </Link>
      </div>
    </div>
  );
}
