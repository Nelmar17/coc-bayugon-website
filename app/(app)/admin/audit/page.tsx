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
    <Card>
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
