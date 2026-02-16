export type ParsedBelief = {
  title: string;
  subtitle: string;
  body: string;
  scriptures: string[];
  slug: string;
};

export function parseBeliefs(beliefText: string): ParsedBelief[] {
  return beliefText
    .split("•")
    .map((b) => b.trim())
    .filter(Boolean)
    .map((raw) => {
      const scriptureMatch = raw.match(/\(([^)]+)\)\s*$/);

      const scriptures = scriptureMatch
        ? scriptureMatch[1]
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const withoutScripture = raw
        .replace(/\(([^)]+)\)\s*$/, "")
        .trim();

      const lines = withoutScripture
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const title = lines[0] || "";
      const subtitle = lines[1] || "";
      const body = lines.slice(2).join("\n");

      return {
        title,
        subtitle,
        body,
        scriptures,
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      };
    });
}
