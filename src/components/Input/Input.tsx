import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { ChevronDown, CircleAlert, CircleHelp, Copy, Eye, EyeOff, Lock, Mail, type LucideIcon } from 'lucide-react';
import './Input.css';

export type InputType = 'default' | 'leading-text' | 'leading-dropdown' | 'trailing-dropdown' | 'phone' | 'trailing-button' | 'password';
export type InputSize = 's' | 'm' | 'l';
export type Option = { value: string; label: string };

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'prefix'> {
  /** Figma: Type */
  variant?: InputType;
  /** S 36 (dense admin) · M 40 (default) · L 48 (mobile, spacious). Figma: Size */
  size?: InputSize;
  /** Figma: Label (+ Show label). Omit to hide; then pass aria-label. */
  label?: ReactNode;
  /** Figma: Required — adds the asterisk and the required attribute. */
  required?: boolean;
  /** Figma: Hint (+ Show hint) */
  hint?: ReactNode;
  /** Figma: State = Error + Error message. Any text turns the field red. */
  error?: ReactNode;
  /** Figma: Leading icon + Swap leading icon (default and trailing-button types). */
  leadingIcon?: LucideIcon | null;
  /** Figma: Help icon — tooltip text shown on hover / focus. */
  helpText?: string;
  /** Figma: Prefix (leading-text type) */
  prefix?: string;
  /** Dropdown value + options (leading-dropdown, trailing-dropdown, phone). Figma: Currency / Unit / Country code */
  dropdownValue?: string;
  dropdownOptions?: Option[];
  onDropdownChange?: (value: string) => void;
  dropdownLabel?: string;
  /** Figma: Button text + Button icon (trailing-button type) */
  buttonText?: string;
  buttonIcon?: LucideIcon;
  onButtonClick?: () => void;
  /** Native input type override (e.g. "email", "url", "tel"). Password type manages this itself. */
  htmlType?: string;
}

const ICON: Record<InputSize, number> = { s: 16, m: 20, l: 20 };

const DEFAULT_OPTIONS: Partial<Record<InputType, Option[]>> = {
  'leading-dropdown': [{ value: 'EUR', label: 'EUR' }, { value: 'GBP', label: 'GBP' }, { value: 'USD', label: 'USD' }, { value: 'INR', label: 'INR' }],
  'trailing-dropdown': [{ value: 'night', label: 'Per night' }, { value: 'stay', label: 'Per stay' }, { value: 'guest', label: 'Per guest' }],
  phone: [{ value: '+91', label: 'IN' }, { value: '+44', label: 'GB' }, { value: '+1', label: 'US' }, { value: '+971', label: 'AE' }],
};

export function Input({
  variant = 'default',
  size = 'm',
  label,
  required,
  hint,
  error,
  leadingIcon,
  helpText,
  prefix = 'https://',
  dropdownValue,
  dropdownOptions,
  onDropdownChange,
  dropdownLabel,
  buttonText = 'Copy',
  buttonIcon: ButtonIcon = Copy,
  onButtonClick,
  htmlType,
  disabled,
  id,
  className,
  ...rest
}: InputProps) {
  const auto = useId();
  const inputId = id ?? `in-${auto}`;
  const hintId = `${inputId}-hint`;
  const [show, setShow] = useState(false);
  const options = dropdownOptions ?? DEFAULT_OPTIONS[variant] ?? [];
  const [ddLocal, setDdLocal] = useState(options[0]?.value ?? '');
  const dd = dropdownValue ?? ddLocal;
  const invalid = Boolean(error);
  const message = error || hint;
  const iconSize = ICON[size];

  const Lead = leadingIcon === null ? null : leadingIcon ?? (variant === 'password' ? Lock : variant === 'default' || variant === 'trailing-button' ? Mail : null);
  const nativeType = htmlType ?? (variant === 'password' ? (show ? 'text' : 'password') : variant === 'phone' ? 'tel' : variant === 'leading-text' ? 'text' : undefined);

  const select = (side: 'left' | 'right' | 'inline') => (
    <span className={`rhia-input__select rhia-input__select--${side}`}>
      <select
        value={dd}
        disabled={disabled}
        aria-label={dropdownLabel ?? (variant === 'phone' ? 'Country code' : variant === 'leading-dropdown' ? 'Currency' : 'Unit')}
        onChange={(e) => { setDdLocal(e.target.value); onDropdownChange?.(e.target.value); }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={16} strokeWidth={1.5} aria-hidden />
    </span>
  );

  return (
    <div className={['rhia-field', `rhia-field--${size}`, invalid ? 'is-error' : '', disabled ? 'is-disabled' : '', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="rhia-field__label" htmlFor={inputId}>
          {label}
          {required && <span className="rhia-field__required" aria-hidden>*</span>}
        </label>
      )}
      <div className="rhia-input">
        {variant === 'leading-text' && <span className="rhia-input__addon rhia-input__addon--left">{prefix}</span>}
        {variant === 'leading-dropdown' && select('left')}
        <div className="rhia-input__field">
          {variant === 'phone' && select('inline')}
          {Lead && <Lead className="rhia-input__icon" size={iconSize} strokeWidth={1.5} aria-hidden />}
          <input
            id={inputId}
            type={nativeType}
            disabled={disabled}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={message ? hintId : undefined}
            {...rest}
          />
          {variant === 'password' && (
            <button type="button" className="rhia-input__iconbtn" onClick={() => setShow((v) => !v)} disabled={disabled} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
              {show ? <EyeOff size={iconSize} strokeWidth={1.5} /> : <Eye size={iconSize} strokeWidth={1.5} />}
            </button>
          )}
          {invalid ? (
            <CircleAlert className="rhia-input__icon rhia-input__icon--error" size={iconSize} strokeWidth={1.5} aria-hidden />
          ) : helpText ? (
            <span className="rhia-input__help" tabIndex={0} role="img" aria-label={helpText} title={helpText}>
              <CircleHelp size={iconSize} strokeWidth={1.5} aria-hidden />
            </span>
          ) : null}
        </div>
        {variant === 'trailing-dropdown' && select('right')}
        {variant === 'trailing-button' && (
          <button type="button" className="rhia-input__addon rhia-input__addon--right rhia-input__button" onClick={onButtonClick} disabled={disabled}>
            <ButtonIcon size={iconSize} strokeWidth={1.5} aria-hidden />
            {buttonText}
          </button>
        )}
      </div>
      {message && <p id={hintId} className="rhia-field__hint">{message}</p>}
    </div>
  );
}
