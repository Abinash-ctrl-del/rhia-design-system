import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowUpRight, X, type LucideIcon } from 'lucide-react';
import './Badge.css';

export type BadgeColor = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'ai';
export type BadgeVariant = 'soft' | 'solid';
export type BadgeSize = 's' | 'm' | 'l';
export type BadgeIcon = 'none' | 'dot' | 'leading' | 'trailing';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Figma: Color */
  color?: BadgeColor;
  /** Soft = everyday status, Solid = strong emphasis. Figma: Style */
  variant?: BadgeVariant;
  /** S 20 · M 24 · L 28. Figma: Size */
  size?: BadgeSize;
  /** Figma: Icon (None, Dot, Leading icon, Trailing icon). Close comes from onRemove. */
  icon?: BadgeIcon;
  /** Any Lucide icon for leading / trailing. Figma: Swap icon */
  iconComponent?: LucideIcon;
  /** Shows the × button (Figma: Icon = Close). */
  onRemove?: () => void;
  /** Accessible name for the × button; defaults to "Remove <label>". */
  removeLabel?: string;
  /** Figma: Label */
  children?: ReactNode;
}

const ICON: Record<BadgeSize, number> = { s: 12, m: 12, l: 16 };

export function Badge({
  color = 'neutral',
  variant = 'soft',
  size = 'm',
  icon = 'none',
  iconComponent: Icon = ArrowUpRight,
  onRemove,
  removeLabel,
  children = 'Label',
  className,
  ...rest
}: BadgeProps) {
  const px = ICON[size];
  const glyph = <Icon className="rhia-badge__icon" size={px} strokeWidth={1.5} aria-hidden />;
  return (
    <span className={['rhia-badge', `rhia-badge--${color}`, `rhia-badge--${variant}`, `rhia-badge--${size}`, className].filter(Boolean).join(' ')} {...rest}>
      {icon === 'dot' && <span className="rhia-badge__dot" aria-hidden />}
      {icon === 'leading' && glyph}
      <span className="rhia-badge__text">{children}</span>
      {icon === 'trailing' && glyph}
      {onRemove && (
        <button type="button" className="rhia-badge__remove" onClick={onRemove} aria-label={removeLabel ?? `Remove ${typeof children === 'string' ? children : 'item'}`}>
          <X size={px} strokeWidth={1.5} aria-hidden />
        </button>
      )}
    </span>
  );
}
