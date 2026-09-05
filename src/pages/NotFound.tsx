import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Prompt, TerminalCard } from "@/components/terminal";

export default function NotFound() {
  return (
    <main className="grid-paper flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md">
        <TerminalCard title="404.ts — route_not_found">
          <div className="space-y-3 font-mono text-xs">
            <Prompt>cd /unknown-route</Prompt>
            <p className="text-muted-foreground">
              <span className="text-primary">error&gt;</span> no such page in the YOJANAI
              filesystem. The scheme index is intact — your session is safe.
            </p>
            <div className="flex gap-2 pt-1">
              <Button asChild size="sm" className="font-mono text-[11px]">
                <Link to="/">back to landing</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="font-mono text-[11px]">
                <Link to="/dashboard">open dashboard</Link>
              </Button>
            </div>
          </div>
        </TerminalCard>
      </div>
    </main>
  );
}
