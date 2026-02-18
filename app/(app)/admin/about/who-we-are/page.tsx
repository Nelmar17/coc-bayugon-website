"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

type WhoWeAre = {
  id: number;
  intro?: string | null;
  mission: string;
  belief: string;
  identity: string;
  community: string;
};

export default function AdminWhoWeArePage() {
  const [data, setData] = useState<WhoWeAre | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/who-we-are", { cache: "no-store" });
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!data) return;

    setSaving(true);
    try {
      const res = await fetch("/api/who-we-are", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.success("Who We Are updated");
      await load();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <p>Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="rounded-xl border shadow-lg bg-white dark:bg-slate-950/50 border-blue-100 px-2 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Who We Are</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Intro (optional)</Label>
            <Textarea
              className="min-h-[150px]"
              value={data.intro ?? ""}
              onChange={(e) =>
                setData({ ...data, intro: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Our Mission</Label>
            <Textarea
              className="min-h-[150px]"
              value={data.mission}
              onChange={(e) =>
                setData({ ...data, mission: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Our Belief</Label>
            <Textarea
              className="min-h-[150px]"
              value={data.belief}
              onChange={(e) =>
                setData({ ...data, belief: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Our Identity</Label>
            <Textarea
              className="min-h-[150px]"
              value={data.identity}
              onChange={(e) =>
                setData({ ...data, identity: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Our Community</Label>
            <Textarea
              className="min-h-[150px]"
              value={data.community}
              onChange={(e) =>
                setData({ ...data, community: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
