import type { ReactNode } from 'react';

export function EmptyState({
  title,
  message,
  icon,
}: {
  title: string;
  message?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex min-h-56 items-center justify-center px-4">
      <div className="w-full max-w-md rounded-none border border-line bg-card p-6 text-center shadow-none">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none bg-mutedSurface text-muted">
          {icon}
        </div>
        <h2 className="section-title mt-3 text-ink">{title}</h2>
        {message ? <p className="mt-2 text-sm text-muted">{message}</p> : null}
      </div>
    </div>
  );
}
