import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { triggerTelegramImpact } from '../telegram/webApp';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'relative px-0 text-accent after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-accent after:transition-transform hover:after:scale-x-110',
  secondary:
    'border border-foreground bg-transparent px-6 text-foreground hover:bg-foreground hover:text-background',
  danger:
    'border border-accent bg-transparent px-6 text-accent hover:bg-accent hover:text-background',
  ghost:
    'relative px-4 text-muted hover:text-foreground after:absolute after:inset-x-4 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform hover:after:scale-x-100',
};

export function Button({
  className,
  variant = 'primary',
  icon,
  children,
  type = 'button',
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={(event) => {
        triggerTelegramImpact();
        onClick?.(event);
      }}
      className={clsx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-none py-2 text-sm font-bold uppercase transition duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px',
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
