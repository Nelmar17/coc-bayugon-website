import { BookOpen } from "lucide-react";

type Props = {
  verses: string[];
};

export function ScriptureList({ verses }: Props) {
  return (
    <div className="space-y-2">
      <p className="font-medium">Scriptural Foundation:</p>

      <ul className="space-y-1">
        {verses.map((v, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
          >
            <BookOpen className="h-4 w-4 text-black dark:text-white mt-0.5" />
            <span>{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
