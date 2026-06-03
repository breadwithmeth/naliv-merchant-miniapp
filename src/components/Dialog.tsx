import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';

export function Dialog({
  open,
  title,
  children,
  footer,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-hidden rounded-none border border-line bg-card shadow-none">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="section-title text-ink">{title}</h2>
          <Button
            variant="ghost"
            className="h-9 w-9 px-0"
            onClick={onClose}
            aria-label="Закрыть"
            icon={<X className="h-4 w-4" />}
          />
        </div>
        <div className="max-h-[68vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
