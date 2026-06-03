import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useToastStore, type ToastType } from '../store/toasts';

const icons: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const tones: Record<ToastType, string> = {
  success: 'border-foreground text-foreground',
  error: 'border-accent text-accent',
  info: 'border-line text-muted',
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="fixed right-4 top-4 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={clsx(
              'rounded-none border bg-card p-4 shadow-none',
              tones[toast.type],
            )}
          >
            <div className="flex gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold uppercase text-ink">{toast.title}</p>
                {toast.message ? (
                  <p className="mt-1 text-sm text-muted">{toast.message}</p>
                ) : null}
              </div>
              <button
                className="rounded-none p-1 text-muted hover:bg-mutedSurface hover:text-foreground"
                type="button"
                aria-label="Закрыть"
                onClick={() => dismissToast(toast.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
