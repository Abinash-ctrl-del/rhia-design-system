import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import './Toggle.css';

export type ToggleSize = 's' | 'm';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Figma: Size — S (36×20) · M (44×24) */
  size?: ToggleSize;
  /** Figma: Label. Omit for the switch on its own (Toggle base) and pass aria-label. */
  label?: ReactNode;
  /** Figma: Supporting text */
  supportingText?: ReactNode;
  /** Convenience: called with the new on/off value */
  onCheckedChange?: (checked: boolean) => void;
}

/** A switch for settings that apply immediately. Native checkbox with role="switch". */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { size = 's', label, supportingText, onCheckedChange, onChange, className, id, disabled, ...rest }, ref,
) {
  const auto = useId();
  const inputId = id ?? `tg-${auto}`;
  const hintId = supportingText ? `${inputId}-hint` : undefined;
  return (
    <label htmlFor={inputId} className={['rhia-toggle', `rhia-toggle--${size}`, disabled ? 'is-disabled' : '', label ? '' : 'is-bare', className].filter(Boolean).join(' ')}>
      <span className="rhia-toggle__control">
        <input
          ref={ref} id={inputId} type="checkbox" role="switch" className="rhia-toggle__input" disabled={disabled} aria-describedby={hintId}
          onChange={(e) => { onChange?.(e); onCheckedChange?.(e.target.checked); }}
          {...rest}
        />
        <span className="rhia-toggle__track" aria-hidden><span className="rhia-toggle__knob" /></span>
      </span>
      {label && (
        <span className="rhia-toggle__text">
          <span className="rhia-toggle__label">{label}</span>
          {supportingText && <span id={hintId} className="rhia-toggle__hint">{supportingText}</span>}
        </span>
      )}
    </label>
  );
});
