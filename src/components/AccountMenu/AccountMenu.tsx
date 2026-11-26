import { useEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { Keyboard, LogOut, SlidersHorizontal, UserRound, type LucideIcon } from 'lucide-react';
import '../Select/Select.css';
import './AccountMenu.css';

export type AccountAction = 'profile' | 'preferences' | 'shortcuts' | 'logout';
export type AccountMenuItem = { id: AccountAction | string; label: string; icon: LucideIcon; group?: 'main' | 'footer' };

/** Figma: Account menu rows (Menu item · Leading icon · S). Log out lives only here. */
export const ACCOUNT_ITEMS: AccountMenuItem[] = [
  { id: 'profile', label: 'My profile', icon: UserRound },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'shortcuts', label: 'Keyboard shortcuts', icon: Keyboard },
  { id: 'logout', label: 'Log out', icon: LogOut, group: 'footer' },
];

export interface AccountMenuProps {
  /** Figma: Name, Email, Initials */
  user: { name: string; email?: string; initials: string };
  items?: AccountMenuItem[];
  onSelect?: (id: string) => void;
  /** Called on Esc, Tab, or after an item is picked */
  onClose?: () => void;
  /** Move focus to the first item when shown (true when opened from a button) */
  autoFocus?: boolean;
  id?: string;
  style?: CSSProperties;
  className?: string;
}

export function AccountMenu({ user, items = ACCOUNT_ITEMS, onSelect, onClose, autoFocus, id, style, className }: AccountMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rows = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
  useEffect(() => { if (autoFocus) rows()[0]?.focus(); }, [autoFocus]);

  const onKeyDown = (e: KeyboardEvent) => {
    const list = rows(); const i = list.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => { e.preventDefault(); list[(n + list.length) % list.length]?.focus(); };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(list.length - 1);
    else if (e.key === 'Escape') { e.preventDefault(); onClose?.(); }
    else if (e.key === 'Tab') onClose?.();
  };
  const pick = (itemId: string) => { onSelect?.(itemId); onClose?.(); };
  const main = items.filter((it) => it.group !== 'footer');
  const footer = items.filter((it) => it.group === 'footer');
  const row = (it: AccountMenuItem) => (
    <button key={it.id} type="button" role="menuitem" tabIndex={-1} className="rhia-menu-item rhia-menu-item--s rhia-account-menu__item" onClick={() => pick(it.id)}>
      <it.icon className="rhia-menu-item__icon" size={16} strokeWidth={1.5} aria-hidden />
      <span className="rhia-menu-item__text">{it.label}</span>
    </button>
  );

  return (
    <div ref={ref} id={id} role="menu" aria-label={`Account menu for ${user.name}`} className={['rhia-account-menu', className].filter(Boolean).join(' ')} style={style} onKeyDown={onKeyDown}>
      <div className="rhia-account-menu__header" role="presentation">
        <span className="rhia-account-menu__avatar" aria-hidden>{user.initials}</span>
        <span className="rhia-account-menu__who">
          <span className="rhia-account-menu__name">{user.name}</span>
          {user.email && <span className="rhia-account-menu__email" title={user.email}>{user.email}</span>}
        </span>
      </div>
      <hr className="rhia-account-menu__divider" />
      <div className="rhia-account-menu__group" role="group">{main.map(row)}</div>
      {footer.length > 0 && <>
        <hr className="rhia-account-menu__divider" />
        <div className="rhia-account-menu__group" role="group">{footer.map(row)}</div>
      </>}
    </div>
  );
}
