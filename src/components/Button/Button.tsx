import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle, type LucideIcon } from 'lucide-react';
import './Button.css';

export type ButtonType =
  | 'primary' | 'secondary' | 'outlined' | 'ghost' | 'link'
  | 'destructive' | 'destructive-outlined' | 'destructive-ghost';
export type ButtonSize = 'xs' | 's' | 'm' | 'l' | 'xl';
export type ButtonIconPosition = 'none' | 'left' | 'right' | 'only';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Visual style. Mirrors the Figma "Type" property. */
  variant?: ButtonType;
  /** XS 28 · S 32 · M 36 · L 40 · XL 48 px tall. */
  size?: ButtonSize;
  /** Where the icon sits. "only" hides the label visually (it stays as aria-label). */
  iconPosition?: ButtonIconPosition;
  /** Any Lucide icon, e.g. Plus, ArrowRight. Mirrors Figma "Swap icon". */
  icon?: LucideIcon;
  /** Button text. Mirrors Figma "Label". */
  children?: ReactNode;
  /** Shows a spinner in the icon slot (or on the left), blocks clicks and sets aria-busy. Figma: State = Loading. */
  loading?: boolean;
  /** Native button type (submit, reset, button). */
  htmlType?: 'button' | 'submit' | 'reset';
}

const ICON_SIZE: Record<ButtonSize, number> = { xs: 16, s: 16, m: 16, l: 20, xl: 20 };

export function Button({
  variant = 'primary',
  size = 'm',
  iconPosition = 'none',
  icon: Icon,
  children = 'Button',
  htmlType = 'button',
  loading = false,
  className,
  disabled,
  onClick,
  ...rest
}: ButtonProps) {
  const Glyph = loading ? LoaderCircle : Icon;
  const iconClass = loading ? 'rhia-btn__icon rhia-btn__spinner' : 'rhia-btn__icon';
  const showIcon = Glyph && (iconPosition !== 'none' || loading);
  const iconEl = showIcon ? <Glyph className={iconClass} size={ICON_SIZE[size]} strokeWidth={1.5} aria-hidden /> : null;
  const label = <span className="rhia-btn__text">{children}</span>;
  const onlyIcon = iconPosition === 'only' && Glyph;
  return (
    <button
      type={htmlType}
      className={['rhia-btn', `rhia-btn--${variant}`, `rhia-btn--${size}`, onlyIcon ? 'rhia-btn--icon-only' : '', loading ? 'rhia-btn--loading' : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-label={onlyIcon && typeof children === 'string' ? children : rest['aria-label']}
      aria-busy={loading || undefined}
      disabled={disabled}
      onClick={loading ? (e) => e.preventDefault() : onClick}
      {...rest}
    >
      {onlyIcon ? iconEl : (
        <>
          {(iconPosition === 'left' || (loading && iconPosition === 'none')) && iconEl}
          {label}
          {iconPosition === 'right' && iconEl}
        </>
      )}
    </button>
  );
}
