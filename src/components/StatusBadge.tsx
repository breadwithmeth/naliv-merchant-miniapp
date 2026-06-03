import { clsx } from 'clsx';
import { getStatusName, getStatusTone } from '../lib/statuses';

const tones = {
  danger: 'border-accent text-accent',
  success: 'border-foreground text-foreground',
  warning: 'border-accent text-accent',
  neutral: 'border-line text-muted',
  info: 'border-line text-foreground',
};

export function StatusBadge({
  status,
  label,
}: {
  status?: number | null;
  label?: string | null;
}) {
  return (
    <span
      className={clsx(
        'label-text inline-flex items-center rounded-none border bg-transparent px-3 py-1',
        tones[getStatusTone(status)],
      )}
    >
      {getStatusName(status, label)}
    </span>
  );
}
