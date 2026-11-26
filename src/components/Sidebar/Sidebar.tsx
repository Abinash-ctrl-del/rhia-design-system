import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Activity, ArrowLeftRight, CalendarCheck, ChartLine, Globe, Mail, ShieldCheck, Tag, ArrowRight, Award, BedDouble, Bell, Building2, ChartColumn, ChartPie, Check, ChevronDown, ChevronRight, ChevronUp, CircleCheckBig, Clock, ClipboardList,
  Coins, EllipsisVertical, FileText, LayoutDashboard, Plug, ReceiptText, Search, Settings, UserCheck, Users, Workflow, type LucideIcon,
} from 'lucide-react';
import { Badge, type BadgeColor } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { AccountMenu, type AccountMenuItem } from '../AccountMenu/AccountMenu';
import './Sidebar.css';

/* ---------- Types ---------- */
export type NavItemDef = { id: string; label: string; icon: LucideIcon; badge?: { count: number; color?: BadgeColor; label?: string }; disabled?: boolean };
export type NavSectionDef = { title?: string; items: NavItemDef[] };
export type SetupStep = { label: string; status: 'done' | 'current' | 'todo' };
export type SetupDef = {
  title?: string; done: number; total: number; steps: SetupStep[]; cta?: { label: string; onClick?: () => void };
  /** Start minimised (title + progress only). The app should remember the user's choice. */
  defaultMinimised?: boolean;
  /** Controlled minimised state */
  minimised?: boolean;
  onMinimisedChange?: (minimised: boolean) => void;
};
export type UserDef = {
  name: string; role: string; initials: string; email?: string;
  /** Account menu rows; defaults to My profile, Preferences, Keyboard shortcuts, Log out */
  menuItems?: AccountMenuItem[];
  /** Called with the picked row id ('profile' | 'preferences' | 'shortcuts' | 'logout') */
  onMenuSelect?: (id: string) => void;
  /** Called whenever the account menu opens */
  onMenu?: () => void;
};

/* ---------- Phase 1 defaults (see sidebar.md) ---------- */
export const PHASE1_NAV: NavSectionDef[] = [
  { items: [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'approvals', label: 'Approvals', icon: CircleCheckBig, badge: { count: 3, color: 'brand', label: 'waiting for approval' } },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: { count: 4, color: 'danger', label: 'open alerts' } },
    { id: 'reports', label: 'Reports', icon: ChartColumn },
  ] },
  { title: 'Guests', items: [
    { id: 'guests', label: 'Guests', icon: Users },
    { id: 'segments', label: 'Segments', icon: ChartPie },
  ] },
  { title: 'Marketing', items: [
    { id: 'journeys', label: 'Journeys', icon: Workflow },
    { id: 'templates', label: 'Templates', icon: FileText },
  ] },
  { title: 'Loyalty', items: [
    { id: 'programme', label: 'Programme', icon: Award },
    { id: 'members', label: 'Members & points', icon: Coins },
    { id: 'claims', label: 'Claims', icon: ReceiptText },
    { id: 'settlement', label: 'Settlement', icon: ArrowLeftRight },
  ] },
  { title: 'Booking engine', items: [{ id: 'rooms', label: 'Rooms & content', icon: BedDouble }] },
  { title: 'Data', items: [
    { id: 'data-health', label: 'Data health', icon: Activity },
    { id: 'matching', label: 'Guest matching', icon: UserCheck, badge: { count: 38, color: 'warning', label: 'records to review' } },
  ] },
];
export const PHASE1_BOTTOM: NavItemDef[] = [
  { id: 'properties', label: 'Properties', icon: Building2 },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'settings', label: 'Settings', icon: Settings },
];

/** RHIA Admin — booking engine, Stage 1 (10 Nov). Only the areas the booking-engine admin needs now;
 *  Guests, Marketing, Loyalty and Data return when those areas are designed. See booking-engine-admin-ia.md. */
export const BOOKING_ENGINE_NAV: NavSectionDef[] = [
  { items: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }] },
  { title: 'Booking engine', items: [
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'rooms', label: 'Rooms & content', icon: BedDouble },
    { id: 'rates', label: 'Rates & offers', icon: Tag },
    { id: 'rules', label: 'Rules & policies', icon: ShieldCheck },
    { id: 'messages', label: 'Guest messages', icon: Mail },
    { id: 'site', label: 'Site & brand', icon: Globe },
    { id: 'performance', label: 'Performance', icon: ChartLine },
  ] },
];
export const BOOKING_ENGINE_BOTTOM: NavItemDef[] = PHASE1_BOTTOM;

/** Which nav items each Phase 1 role sees (hide what a role can't use — E2). Ids refer to PHASE1_NAV / PHASE1_BOTTOM. */
export type Phase1Role = 'admin' | 'gm' | 'crm' | 'loyalty' | 'commercial' | 'finance';
export const PHASE1_ROLE_NAV: Record<Phase1Role, string[] | 'all'> = {
  admin: 'all',
  gm: ['overview', 'approvals', 'alerts', 'reports', 'guests', 'segments', 'settings'],
  crm: ['overview', 'guests', 'segments', 'journeys', 'templates', 'settings'],
  loyalty: ['overview', 'guests', 'segments', 'programme', 'members', 'claims', 'settlement', 'settings'],
  commercial: ['overview', 'approvals', 'reports', 'settings'],
  finance: ['overview', 'reports', 'settlement', 'settings'],
};

/** Filters the Phase 1 nav for a role; empty sections disappear. */
export function navForRole(role: Phase1Role, sections: NavSectionDef[] = PHASE1_NAV, bottom: NavItemDef[] = PHASE1_BOTTOM) {
  const allow = PHASE1_ROLE_NAV[role];
  if (allow === 'all') return { sections, bottom };
  const keep = (i: NavItemDef) => allow.includes(i.id);
  return {
    sections: sections.map((s) => ({ ...s, items: s.items.filter(keep) })).filter((s) => s.items.length > 0),
    bottom: bottom.filter(keep),
  };
}

/* ---------- Pieces ---------- */
export function Kbd({ children = '⌘K' }: { children?: ReactNode }) {
  return <kbd className="rhia-kbd">{children}</kbd>;
}

export function NavItem({ item, active, collapsed, onSelect }: { item: NavItemDef; active?: boolean; collapsed?: boolean; onSelect?: (id: string) => void }) {
  const Icon = item.icon;
  const badgeText = item.badge ? `${item.badge.count} ${item.badge.label ?? ''}`.trim() : '';
  return (
    <a
      href={`#${item.id}`}
      className={['rhia-nav-item', active ? 'is-active' : '', item.disabled ? 'is-disabled' : '', collapsed ? 'is-collapsed' : ''].filter(Boolean).join(' ')}
      aria-current={active ? 'page' : undefined}
      aria-disabled={item.disabled || undefined}
      aria-label={collapsed ? `${item.label}${badgeText ? `, ${badgeText}` : ''}` : undefined}
      title={collapsed ? item.label : undefined}
      onClick={(e) => { e.preventDefault(); if (!item.disabled) onSelect?.(item.id); }}
    >
      <Icon className="rhia-nav-item__icon" size={20} strokeWidth={1.5} aria-hidden />
      {!collapsed && <span className="rhia-nav-item__label">{item.label}</span>}
      {!collapsed && item.badge && (
        <Badge size="s" color={item.badge.color ?? 'neutral'} aria-label={badgeText}>{item.badge.count}</Badge>
      )}
      {collapsed && item.badge && <span className={`rhia-nav-item__dot rhia-nav-item__dot--${item.badge.color ?? 'neutral'}`} aria-hidden />}
    </a>
  );
}

export function SidebarSearch({ collapsed, onOpen, placeholder = 'Search' }: { collapsed?: boolean; onOpen?: () => void; placeholder?: string }) {
  return (
    <button type="button" className={`rhia-sidebar-search${collapsed ? ' is-collapsed' : ''}`} onClick={onOpen} aria-label={collapsed ? `${placeholder} (⌘K)` : undefined} aria-keyshortcuts="Meta+K">
      <Search size={20} strokeWidth={1.5} aria-hidden />
      {!collapsed && <><span className="rhia-sidebar-search__placeholder">{placeholder}</span><Kbd /></>}
    </button>
  );
}

/** Ring with the percentage inside. The arc is calculated from `value` (0–100), so it always matches the number. */
export function ProgressRing({ value, size = 32, stroke = 3, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <span className="rhia-progress-ring" style={{ width: size, height: size }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={label ?? `${v}% complete`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="rhia-progress-ring__track" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="rhia-progress-ring__value"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span className="rhia-progress-ring__text" aria-hidden>{v}%</span>
    </span>
  );
}

const STEP_ICON = { done: Check, current: ArrowRight, todo: Clock } as const;

export function SetupChecklist({ setup, collapsed, onOpen }: { setup: SetupDef; collapsed?: boolean; onOpen?: () => void }) {
  const pct = setup.total ? (setup.done / setup.total) * 100 : 0;
  const title = setup.title ?? 'Finish setting up';
  if (collapsed) {
    return (
      <button type="button" className="rhia-setup-tile" onClick={onOpen} title={`${title}: ${setup.done} of ${setup.total} steps done`} aria-label={`${title}: ${setup.done} of ${setup.total} steps done`}>
        <ProgressRing value={pct} />
      </button>
    );
  }
  return <SetupCard setup={setup} title={title} pct={pct} />;
}

function SetupCard({ setup, title, pct }: { setup: SetupDef; title: string; pct: number }) {
  const [inner, setInner] = useState(!!setup.defaultMinimised);
  const minimised = setup.minimised ?? inner;
  const toggle = () => { const next = !minimised; setInner(next); setup.onMinimisedChange?.(next); };
  const bodyId = `setup-${useId()}`;
  return (
    <section className={`rhia-setup${minimised ? ' is-minimised' : ''}`} aria-label={title}>
      <div className="rhia-setup__head">
        <div className="rhia-setup__title-row">
          <div className="rhia-setup__title"><ClipboardList size={16} strokeWidth={1.5} aria-hidden />{title}</div>
          {minimised && <span className="rhia-setup__count">{setup.done}/{setup.total}</span>}
          <Button variant="ghost" size="xs" iconPosition="only" icon={minimised ? ChevronDown : ChevronUp} className="rhia-setup__toggle"
            aria-expanded={!minimised} aria-controls={bodyId} onClick={toggle}>{minimised ? 'Show setup steps' : 'Hide setup steps'}</Button>
        </div>
        {!minimised && <div className="rhia-setup__detail">{setup.done} of {setup.total} steps done</div>}
        <div className="rhia-setup__bar" role="progressbar" aria-valuemin={0} aria-valuemax={setup.total} aria-valuenow={setup.done} aria-label="Setup progress">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div id={bodyId} className="rhia-setup__body" hidden={minimised}>
        <ul className="rhia-setup__steps">
          {setup.steps.map((s) => { const I = STEP_ICON[s.status]; return (
            <li key={s.label} className={`rhia-setup__step is-${s.status}`} aria-current={s.status === 'current' ? 'step' : undefined}>
              <I size={12} strokeWidth={1.5} aria-hidden /><span>{s.label}</span>
              <span className="rhia-visually-hidden">{s.status === 'done' ? ' (done)' : s.status === 'current' ? ' (next)' : ' (to do)'}</span>
            </li>); })}
        </ul>
        {setup.cta && (
          <Button variant="outlined" size="s" icon={ChevronRight} iconPosition="right" className="rhia-setup__cta" onClick={setup.cta.onClick}>{setup.cta.label}</Button>
        )}
      </div>
    </section>
  );
}

export function UserCard({ user, collapsed }: { user: UserDef; collapsed?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<CSSProperties>({});
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = `account-menu-${useId()}`;

  const show = () => {
    const r = wrap.current!.getBoundingClientRect();
    // The sidebar clips overflow, so the menu is fixed-positioned: above the card when expanded, to the right when collapsed.
    setPos(collapsed
      ? { position: 'fixed', left: r.right + 8, bottom: window.innerHeight - r.bottom, zIndex: 30 }
      : { position: 'fixed', left: r.left, bottom: window.innerHeight - r.top + 8, zIndex: 30 });
    setOpen(true); user.onMenu?.();
  };
  const close = (refocus = true) => { setOpen(false); if (refocus) trigger.current?.focus(); };

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) close(false); };
    const hide = () => close(false);
    document.addEventListener('pointerdown', away);
    window.addEventListener('resize', hide);
    return () => { document.removeEventListener('pointerdown', away); window.removeEventListener('resize', hide); };
  }, [open]);

  return (
    <div ref={wrap} className={`rhia-user-card${collapsed ? ' is-collapsed' : ''}${open ? ' is-open' : ''}`}>
      <span className="rhia-user-card__avatar" aria-hidden>{user.initials}</span>
      {!collapsed && <span className="rhia-user-card__text"><span className="rhia-user-card__name">{user.name}</span><span className="rhia-user-card__role">{user.role}</span></span>}
      <button ref={trigger} type="button" className="rhia-user-card__menu" onClick={() => (open ? close() : show())}
        onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); show(); } }}
        aria-label={`Account menu for ${user.name}`} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}>
        {!collapsed && <EllipsisVertical size={16} strokeWidth={1.5} aria-hidden />}
      </button>
      {open && <AccountMenu id={menuId} autoFocus style={pos} user={user} items={user.menuItems} onSelect={user.onMenuSelect} onClose={() => close()} />}
    </div>
  );
}

/* ---------- Sidebar ---------- */
export interface SidebarProps {
  /** Figma: Collapsed (False 256 px / True 72 px) */
  collapsed?: boolean;
  activeId?: string;
  onNavigate?: (id: string) => void;
  sections?: NavSectionDef[];
  bottom?: NavItemDef[];
  /** Figma: Show setup checklist. Omit to hide. */
  setup?: SetupDef;
  user?: UserDef;
  onSearch?: () => void;
  className?: string;
}

export function Sidebar({
  collapsed = false, activeId = 'overview', onNavigate, sections = PHASE1_NAV, bottom = PHASE1_BOTTOM, setup,
  user = { name: 'Priya Shah', role: 'General manager', initials: 'PS', email: 'priya.shah@grandhotel.com' }, onSearch, className,
}: SidebarProps) {
  return (
    <aside className={['rhia-sidebar', collapsed ? 'is-collapsed' : '', className].filter(Boolean).join(' ')} aria-label="Sidebar">
      <div className="rhia-sidebar__top">
        <SidebarSearch collapsed={collapsed} onOpen={onSearch} />
        {setup && <SetupChecklist setup={setup} collapsed={collapsed} onOpen={() => onNavigate?.('setup')} />}
        <nav className="rhia-sidebar__nav" aria-label="Main">
          {sections.map((s, i) => (
            <div key={s.title ?? i} className="rhia-nav-group" role="group" aria-label={s.title}>
              {s.title && (collapsed ? <hr className="rhia-nav-group__divider" /> : <div className="rhia-nav-group__title" aria-hidden>{s.title}</div>)}
              {s.items.map((it) => <NavItem key={it.id} item={it} active={it.id === activeId} collapsed={collapsed} onSelect={onNavigate} />)}
            </div>
          ))}
        </nav>
      </div>
      <hr className="rhia-sidebar__divider" />
      <nav className="rhia-sidebar__bottom" aria-label="Setup and settings">
        {bottom.map((it) => <NavItem key={it.id} item={it} active={it.id === activeId} collapsed={collapsed} onSelect={onNavigate} />)}
      </nav>
      <div className="rhia-sidebar__user"><UserCard user={user} collapsed={collapsed} /></div>
    </aside>
  );
}
