"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/fetcher";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    apiFetch("/api/admin/audit-logs")
      .then((r) => r.json())
      .then(setLogs);
  }, []);

  return (
    <Card className="rounded-xl border shadow-lg bg-white dark:bg-slate-950/50 border-blue-100 px-2 dark:border-slate-700/50">
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {logs.map((l) => (
          <div key={l.id}>
            <strong>{l.action}</strong> — {l.targetEmail} by {l.actorRole} ({l.actorId})
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
