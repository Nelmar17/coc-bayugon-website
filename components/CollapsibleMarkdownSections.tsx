"use client";

import { useMemo } from "react";
import MarkdownBlock from "@/components/MarkdownBlock";

type Section = { title: string; body: string };

function splitMarkdownByHeadings(md: string): Section[] {
  const lines = md.split("\n");
  const sections: Section[] = [];
  let currentTitle = "Outline";
  let currentBody: string[] = [];

  const push = () => {
    const body = currentBody.join("\n").trim();
    if (body) sections.push({ title: currentTitle, body });
    currentBody = [];
  };

  for (const line of lines) {
    const m = line.match(/^(##|###)\s+(.*)$/);
    if (m) {
      push();
      currentTitle = m[2].trim();
    } else {
      currentBody.push(line);
    }
  }
  push();

  return sections.length ? sections : [{ title: "Outline", body: md }];
}

export default function CollapsibleMarkdownSections({
  markdown,
  defaultOpen = true,
}: {
  markdown: string;
  defaultOpen?: boolean;
}) {
  const sections = useMemo(() => splitMarkdownByHeadings(markdown), [markdown]);

  // If only one section, just show normally (less noisy)
  if (sections.length === 1) {
    return <MarkdownBlock content={sections[0].body} />;
  }

  return (
    <div className="space-y-3">
      {sections.map((s, idx) => (
        <details
          key={idx}
          open={defaultOpen && idx === 0}
          className="rounded-lg border bg-background p-3"
        >
          <summary className="cursor-pointer font-medium">
            {s.title}
          </summary>
          <div className="pt-3">
            <MarkdownBlock content={s.body} />
          </div>
        </details>
      ))}
    </div>
  );
}
