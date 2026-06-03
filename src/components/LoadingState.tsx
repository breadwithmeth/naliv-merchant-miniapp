export function LoadingState({ label = 'Загрузка данных' }: { label?: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center">
      <div className="flex items-center gap-3 rounded-none border border-line bg-card px-4 py-3 text-sm text-muted shadow-none">
        <span className="h-4 w-4 animate-spin rounded-none border-2 border-accent border-t-transparent" />
        {label}
      </div>
    </div>
  );
}
