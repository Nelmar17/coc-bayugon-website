type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl p-10 text-center shadow-sm">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
