import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Building2, Check, ChevronDown, ChevronUp, CircleAlert, Search, type LucideIcon } from 'lucide-react';
import { Badge } from '../Badge/Badge';
import '../Input/Input.css';
import './Select.css';

export type SelectType = 'default' | 'leading-icon' | 'dot' | 'search' | 'multi';
export type SelectSize = 's' | 'm' | 'l';
export type DotColor = 'success' | 'warning' | 'danger' | 'neutral' | 'brand';
export type SelectOption = { value: string; label: string; supporting?: string; dot?: DotColor; disabled?: boolean; chip?: string };

export interface SelectProps {
  /** Figma: Type */
  variant?: SelectType;
  /** S 36 · M 40 · L 48 (same as Input). Figma: Size */
  size?: SelectSize;
  options: SelectOption[];
  /** Controlled value: string, or string[] for multi. */
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  /** Figma: Label / Required / Hint / Error message / Placeholder */
  label?: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  /** Figma: Swap leading icon (leading-icon type). */
  leadingIcon?: LucideIcon;
  /** Shows supporting text next to each option label (Menu item: Show supporting text). */
  showSupporting?: boolean;
  /** Accessible name when there is no visible label. */
  'aria-label'?: string;
  id?: string;
  className?: string;
}

const ICON: Record<SelectSize, number> = { s: 16, m: 20, l: 20 };

/** A row in a select or dropdown menu. Mirrors the Figma "Menu item" component. */
export function MenuItem({ option, selected, active, checkbox, showIcon: Icon, showDot, size, showSupporting, ...rest }: {
  option: SelectOption; selected: boolean; active: boolean; checkbox?: boolean; showIcon?: LucideIcon; showDot?: boolean; size: SelectSize; showSupporting?: boolean;
} & React.LiHTMLAttributes<HTMLLIElement>) {
  const px = ICON[size];
  return (
    <li role="option" aria-selected={selected} aria-disabled={option.disabled || undefined}
      className={['rhia-menu-item', `rhia-menu-item--${size === 's' ? 's' : 'm'}`, active ? 'is-active' : '', selected ? 'is-selected' : '', option.disabled ? 'is-disabled' : ''].filter(Boolean).join(' ')} {...rest}>
      {checkbox && <span className={`rhia-menu-item__checkbox${selected ? ' is-checked' : ''}`} aria-hidden>{selected && <Check size={12} strokeWidth={2} />}</span>}
      {Icon && <Icon className="rhia-menu-item__icon" size={px} strokeWidth={1.5} aria-hidden />}
      {showDot && <span className={`rhia-menu-item__dot rhia-dot--${option.dot ?? 'neutral'}`} aria-hidden />}
      <span className="rhia-menu-item__text">
        <span>{option.label}</span>
        {showSupporting && option.supporting && <span className="rhia-menu-item__supporting">{option.supporting}</span>}
      </span>
      {selected && !checkbox && <Check className="rhia-menu-item__check" size={px} strokeWidth={1.5} aria-hidden />}
    </li>
  );
}

export function Select({
  variant = 'default', size = 'm', options, value, defaultValue, onChange, label, required, hint, error,
  placeholder, disabled, leadingIcon: Lead = Building2, showSupporting, id, className, ...aria
}: SelectProps) {
  const multi = variant === 'multi';
  const auto = useId();
  const baseId = id ?? `sel-${auto}`;
  const listId = `${baseId}-list`, hintId = `${baseId}-hint`, labelId = `${baseId}-label`;
  const [inner, setInner] = useState<string | string[]>(defaultValue ?? (multi ? [] : ''));
  const current = value ?? inner;
  const selected = useMemo(() => (Array.isArray(current) ? current : current ? [current] : []), [current]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement>(null);

  const list = useMemo(() => (variant === 'search' && query ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : options), [options, query, variant]);
  const invalid = Boolean(error);
  const message = error || hint;
  const px = ICON[size];
  const single = options.find((o) => o.value === selected[0]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) { setOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const commit = (next: string | string[]) => { if (value === undefined) setInner(next); onChange?.(next); };
  const pick = (o: SelectOption) => {
    if (o.disabled) return;
    if (multi) commit(selected.includes(o.value) ? selected.filter((v) => v !== o.value) : [...selected, o.value]);
    else { commit(o.value); setOpen(false); setQuery(''); trigger.current?.focus(); }
  };
  const openList = () => { if (disabled) return; setOpen(true); const i = list.findIndex((o) => selected.includes(o.value)); setActive(i >= 0 ? i : 0); };
  const move = (d: number) => {
    if (!list.length) return;
    let i = active;
    for (let n = 0; n < list.length; n++) { i = (i + d + list.length) % list.length; if (!list[i].disabled) break; }
    setActive(i);
  };
  const onKey = (e: KeyboardEvent) => {
    if (disabled) return;
    if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key) && !(variant === 'search' && e.key === ' ')) { e.preventDefault(); openList(); return; }
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(list.length - 1); }
    else if (e.key === 'Enter' || (e.key === ' ' && variant !== 'search')) { e.preventDefault(); if (list[active]) pick(list[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); setQuery(''); }
    else if (e.key === 'Tab') { setOpen(false); setQuery(''); }
  };

  const comboProps = {
    role: 'combobox', 'aria-expanded': open, 'aria-controls': listId, 'aria-haspopup': 'listbox' as const,
    'aria-labelledby': label ? labelId : undefined, 'aria-label': label ? undefined : aria['aria-label'],
    'aria-invalid': invalid || undefined, 'aria-describedby': message ? hintId : undefined, 'aria-required': required || undefined,
    'aria-activedescendant': open && list[active] ? `${baseId}-opt-${list[active].value}` : undefined,
  };

  const content = variant === 'search' ? (
    <input ref={trigger as React.RefObject<HTMLInputElement>} id={baseId} className="rhia-select__search" disabled={disabled}
      value={open ? query : single?.label ?? ''} placeholder={placeholder ?? 'Search'} autoComplete="off"
      onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }} onFocus={openList} onKeyDown={onKey} {...comboProps} />
  ) : multi && selected.length ? (
    <span className="rhia-select__chips">
      {selected.map((v) => { const o = options.find((x) => x.value === v); return o ? (
        <Badge key={v} size={size === 'l' ? 'm' : 's'} onRemove={disabled ? undefined : () => commit(selected.filter((x) => x !== v))} removeLabel={`Remove ${o.label}`}>{o.chip ?? o.label}</Badge>
      ) : null; })}
    </span>
  ) : (
    <span className={`rhia-select__value${single ? '' : ' is-placeholder'}`}>{single?.label ?? placeholder ?? 'Select an option'}</span>
  );

  return (
    <div ref={root} className={['rhia-field', 'rhia-select', `rhia-field--${size}`, invalid ? 'is-error' : '', disabled ? 'is-disabled' : '', open ? 'is-open' : '', className].filter(Boolean).join(' ')}>
      {label && <span id={labelId} className="rhia-field__label">{label}{required && <span className="rhia-field__required" aria-hidden>*</span>}</span>}
      <div className="rhia-select__anchor">
        <div className="rhia-select__trigger"
          {...(variant === 'search' ? { onClick: () => (trigger.current as HTMLInputElement | null)?.focus() } : {
            ref: trigger as React.RefObject<HTMLDivElement>, id: baseId, tabIndex: disabled ? -1 : 0, onKeyDown: onKey,
            onClick: (e: React.MouseEvent) => { if ((e.target as HTMLElement).closest('.rhia-badge__remove')) return; open ? setOpen(false) : openList(); }, ...comboProps,
          })}>
          {variant === 'leading-icon' && <Lead className="rhia-select__icon" size={px} strokeWidth={1.5} aria-hidden />}
          {variant === 'dot' && <span className={`rhia-menu-item__dot rhia-dot--${single?.dot ?? 'neutral'}`} aria-hidden />}
          {variant === 'search' && <Search className="rhia-select__icon" size={px} strokeWidth={1.5} aria-hidden />}
          {content}
          {invalid && <CircleAlert className="rhia-select__icon rhia-select__icon--error" size={px} strokeWidth={1.5} aria-hidden />}
          {open ? <ChevronUp className="rhia-select__icon" size={px} strokeWidth={1.5} aria-hidden /> : <ChevronDown className="rhia-select__icon" size={px} strokeWidth={1.5} aria-hidden />}
        </div>
        {open && (
          <ul id={listId} role="listbox" aria-multiselectable={multi || undefined} className="rhia-menu" aria-labelledby={label ? labelId : undefined}>
            {list.length === 0 && <li className="rhia-menu__empty">No matches</li>}
            {list.map((o, i) => (
              <MenuItem key={o.value} id={`${baseId}-opt-${o.value}`} option={o} size={size} selected={selected.includes(o.value)} active={i === active}
                checkbox={multi} showIcon={variant === 'leading-icon' ? Lead : undefined} showDot={variant === 'dot'} showSupporting={showSupporting}
                onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(o)} />
            ))}
          </ul>
        )}
      </div>
      {message && <p id={hintId} className="rhia-field__hint">{message}</p>}
    </div>
  );
}
