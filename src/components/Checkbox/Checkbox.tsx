import { forwardRef, useEffect, useId, useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import './Checkbox.css';

export type CheckboxSize = 's' | 'm';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Figma: Size — S (16 px box, 14/20 label) · M (20 px box, 16/24 label) */
  size?: CheckboxSize;
  /** Figma: Type = Indeterminate. Shows a minus; use for "select all" when only some rows are selected. */
  indeterminate?: boolean;
  /** Figma: Label. Omit for the box on its own (Checkbox base) and pass aria-label. */
  label?: ReactNode;
  /** Figma: Supporting text */
  supportingText?: ReactNode;
  /** Convenience: called with the new checked value */
  onCheckedChange?: (checked: boolean) => void;
}

const CheckIcon = () => (
  <svg className="rhia-checkbox__check" viewBox="0 0 24 24" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
);
const MinusIcon = () => (
  <svg className="rhia-checkbox__minus" viewBox="0 0 24 24" aria-hidden><path d="M5 12h14" /></svg>
);

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { size = 's', indeterminate = false, label, supportingText, onCheckedChange, onChange, className, id, disabled, ...rest }, ref,
) {
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current!);
  useEffect(() => { if (inner.current) inner.current.indeterminate = indeterminate; }, [indeterminate]);
  const auto = useId();
  const inputId = id ?? `cb-${auto}`;
  const hintId = supportingText ? `${inputId}-hint` : undefined;

  return (
    <label htmlFor={inputId} className={['rhia-checkbox', `rhia-checkbox--${size}`, disabled ? 'is-disabled' : '', label ? '' : 'is-bare', className].filter(Boolean).join(' ')}>
      <span className="rhia-checkbox__control">
        <input
          ref={inner} id={inputId} type="checkbox" className="rhia-checkbox__input" disabled={disabled}
          aria-checked={indeterminate ? 'mixed' : undefined} aria-describedby={hintId}
          onChange={(e) => { onChange?.(e); onCheckedChange?.(e.target.checked); }}
          {...rest}
        />
        <span className="rhia-checkbox__box" aria-hidden><CheckIcon /><MinusIcon /></span>
      </span>
      {label && (
        <span className="rhia-checkbox__text">
          <span className="rhia-checkbox__label">{label}</span>
          {supportingText && <span id={hintId} className="rhia-checkbox__hint">{supportingText}</span>}
        </span>
      )}
    </label>
  );
});
