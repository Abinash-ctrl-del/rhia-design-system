import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ChevronRight, CircleHelp, Moon, PanelLeft, Sparkles, Sun, type LucideIcon } from 'lucide-react';
import { PropertySwitcher, type ChainOption, type Scope } from './PropertySwitcher';
import './TopBar.css';

/* ---------- Pill button (Figma: Pill button) ---------- */
export interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Figma: Style — default (white) or ai (lime, for Ask RHIA) */
  tone?: 'default' | 'ai';
  icon: LucideIcon;
  /** Figma: Content = Icon + label. Omit for icon-only (then pass aria-label). */
  label?: ReactNode;
}
export function PillButton({ tone = 'default', icon: Icon, label, className, ...rest }: PillButtonProps) {
  return (
    <button type="button" className={['rhia-pill', `rhia-pill--${tone}`, label ? 'has-label' : '', className].filter(Boolean).join(' ')} {...rest}>
      <span className="rhia-pill__disc"><Icon size={16} strokeWidth={1.5} aria-hidden /></span>
      {label && <span className="rhia-pill__label">{label}</span>}
    </button>
  );
}

/* ---------- Property switcher: see PropertySwitcher.tsx ---------- */
export { PropertySwitcher, scopeLabel, type ChainOption, type PropertyOption, type PropertyStatus, type Scope } from './PropertySwitcher';

/* ---------- Breadcrumb ---------- */
export type Crumb = { label: string; onClick?: () => void };
export function Breadcrumb({ items, icon: Icon }: { items: Crumb[]; icon: LucideIcon }) {
  return (
    <nav className="rhia-pill rhia-pill--default has-label rhia-breadcrumb" aria-label="Breadcrumb">
      <span className="rhia-pill__disc"><Icon size={16} strokeWidth={1.5} aria-hidden /></span>
      <ol>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.label + i}>
              {i > 0 && <ChevronRight className="rhia-breadcrumb__sep" size={12} strokeWidth={1.5} aria-hidden />}
              {last ? <span aria-current="page">{c.label}</span> : <button type="button" onClick={c.onClick}>{c.label}</button>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---------- Theme switcher ---------- */
export type Theme = 'light' | 'dark';
export function ThemeSwitcher({ value, onChange }: { value: Theme; onChange: (t: Theme) => void }) {
  return (
    <div className="rhia-pill rhia-pill--default rhia-theme-switcher" role="radiogroup" aria-label="Theme">
      {([['light', Sun, 'Light'], ['dark', Moon, 'Dark']] as const).map(([t, I, l]) => (
        <button key={t} type="button" role="radio" aria-checked={value === t} aria-label={l} className={`rhia-pill__disc${value === t ? ' is-filled is-selected' : ''}`} onClick={() => onChange(t)}>
          <I size={16} strokeWidth={1.5} aria-hidden />
        </button>
      ))}
    </div>
  );
}

/* ---------- Logo (placeholder until the logo is final, D-007) ---------- */
export function Logo() {
  return <span className="rhia-logo" aria-label="RHIA">RHIA<span className="rhia-logo__spark" aria-hidden /></span>;
}

/* ---------- Top bar ---------- */
/* Log out lives in the sidebar User card's account menu, not here (29 Oct). */
export interface TopBarProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  /** Figma: Property switcher. Chains and properties the user can see; scope = chain or one property. */
  property: { chains: ChainOption[]; value: Scope; onChange: (scope: Scope) => void; onManage?: () => void };
  breadcrumb: { icon: LucideIcon; items: Crumb[] };
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  onAskRhia?: () => void;
  onHelp?: () => void;
}
export function TopBar({ sidebarCollapsed, onToggleSidebar, property, breadcrumb, theme, onThemeChange, onAskRhia, onHelp }: TopBarProps) {
  return (
    <header className="rhia-topbar">
      <div className="rhia-topbar__group">
        <Logo />
        <span className="rhia-topbar__divider" aria-hidden />
        <PillButton icon={PanelLeft} onClick={onToggleSidebar} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-pressed={sidebarCollapsed} />
        <PropertySwitcher {...property} />
        <Breadcrumb {...breadcrumb} />
      </div>
      <div className="rhia-topbar__group">
        <PillButton tone="ai" icon={Sparkles} label="Ask RHIA" onClick={onAskRhia} aria-keyshortcuts="Meta+J" />
        <PillButton icon={CircleHelp} onClick={onHelp} aria-label="Help" />
        <ThemeSwitcher value={theme} onChange={onThemeChange} />
      </div>
    </header>
  );
}
