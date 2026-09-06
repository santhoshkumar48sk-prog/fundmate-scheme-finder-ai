import { ArrowDownToLine, FileArchive } from "lucide-react";

export default function DownloadPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-md border bg-card p-8 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-md border bg-background">
          <FileArchive className="h-7 w-7 text-primary" />
        </div>

        <h1 className="font-mono text-lg font-semibold">fundmate.zip</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete source code of the Fundmate project — pages, components, Convex
          backend, engines, tests, and configs.
        </p>

        <a
          href="/fundmate.zip"
          download="fundmate.zip"
          className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 font-mono text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Download ZIP
        </a>

        <p className="mt-4 text-[11px] leading-4 text-muted-foreground">
          After extracting: <code className="font-mono">bun install</code> →{" "}
          <code className="font-mono">bun convex dev --once</code> →{" "}
          <code className="font-mono">bun run dev</code>
        </p>
      </div>
    </div>
  );
}
