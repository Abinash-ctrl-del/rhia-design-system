import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Building2, Check, ChevronsUpDown, Hotel, Search, Settings } from 'lucide-react';

/* =========================================================================
   Property switcher — Figma: "Property switcher" (trigger) + "Property menu" (Navigation page).
   Pick the scope every screen uses (PRD §6.1): a whole chain ("All properties") or one property.
   Users with access to several chains (e.g. RHIA onboarding staff) see one group per chain.
   ========================================================================= */

export type PropertyStatus = 'ok' | 'delayed' | 'offline';
export type PropertyOption = { id: string; name: string; city?: string; status?: PropertyStatus };
export type ChainOption = { id: string; name: string; properties: PropertyOption[] };
/** propertyId omitted = chain scope (all properties the user can see in that chain) */
export type Scope = { chainId: string; propertyId?: string };

export interface PropertySwitcherProps {
  chains: ChainOption[];
  value: Scope;
  onChange: (scope: Scope) => void;
  /** Shows a "Manage properties" link at the bottom (admins) */
  onManage?: () => void;
  /** Search appears when the user can see more properties than this. Default 6. */
  searchThreshold?: number;
}

const STATUS_TEXT: Record<PropertyStatus, string> = { ok: '', delayed: 'Data delayed', offline: 'Source offline' };

export function scopeLabel(chains: ChainOption[], value: Scope) {
  const chain = chains.find((c) => c.id === value.chainId);
  if (!chain) return { label: 'Select property', isChain: false };
  if (!value.propertyId) return { label: chains.length > 1 ? chain.name : 'All properties', isChain: true };
  return { label: chain.properties.find((p) => p.id === value.propertyId)?.name ?? 'Select property', isChain: false };
}

export function PropertySwitcher({ chains, value, onChange, onManage, searchThreshold = 6 }: PropertySwitcherProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const multi = chains.length > 1;
  const total = chains.reduce((n, c) => n + c.properties.length, 0);
  const showSearch = total > searchThreshold;
  const { label, isChain } = scopeLabel(chains, value);
  const Icon = isChain ? Building2 : Hotel;

  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    return chains.map((c) => ({
      chain: c,
      showAll: !t || c.name.toLowerCase().includes(t) || 'all properties'.includes(t),
      props: c.properties.filter((p) => !t || `${p.name} ${p.city ?? ''}`.toLowerCase().includes(t)),
    })).filter((g) => g.showAll || g.props.length);
  }, [chains, q]);

  const options = () => Array.from(list.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
  const close = (refocus = true) => { setOpen(false); setQ(''); if (refocus) trigger.current?.focus(); };
  const pick = (s: Scope) => { onChange(s); close(); };

  useEffect(() => {
    if (!open) return;
    options().find((o) => o.getAttribute('aria-selected') === 'true')?.scrollIntoView({ block: 'nearest' });
    (showSearch ? searchRef.current : options().find((o) => o.getAttribute('aria-selected') === 'true') ?? options()[0])?.focus();
    const away = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) close(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onListKey = (e: KeyboardEvent) => {
    const o = options(); const i = o.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => { e.preventDefault(); o[(n + o.length) % o.length]?.focus(); };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') { if (i <= 0 && showSearch) { e.preventDefault(); searchRef.current?.focus(); } else go(i - 1); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(o.length - 1);
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') close(false);
  };

  const isSel = (s: Scope) => s.chainId === value.chainId && s.propertyId === value.propertyId;
  const row = (s: Scope, name: string, opts: { icon: typeof Hotel; meta?: string; status?: PropertyStatus; key: string }) => {
    const sel = isSel(s); const st = opts.status && opts.status !== 'ok' ? opts.status : undefined;
    return (
      <div key={opts.key} role="option" tabIndex={-1} aria-selected={sel} className={`rhia-pmenu__row${sel ? ' is-selected' : ''}`}
        onClick={() => pick(s)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(s); } }}>
        <opts.icon className="rhia-pmenu__icon" size={16} strokeWidth={1.5} aria-hidden />
        <span className="rhia-pmenu__name">{name}</span>
        {opts.meta && <span className="rhia-pmenu__meta">{opts.meta}</span>}
        {st && <span className={`rhia-pmenu__status is-${st}`} title={STATUS_TEXT[st]}><span className="rhia-visually-hidden">({STATUS_TEXT[st]})</span></span>}
        <Check className="rhia-pmenu__check" size={16} strokeWidth={1.5} aria-hidden style={{ visibility: sel ? 'visible' : 'hidden' }} />
      </div>
    );
  };

  return (
    <div ref={wrap} className="rhia-pswitch">
      <button ref={trigger} type="button" className="rhia-pill rhia-pill--default has-label rhia-property-switcher"
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' && !open) { e.preventDefault(); setOpen(true); } }}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? `${uid}-menu` : undefined} aria-label={`Scope: ${label}. Change property`}>
        <span className="rhia-pill__disc is-filled"><Icon size={16} strokeWidth={1.5} aria-hidden /></span>
        <span className="rhia-pill__label">{label}</span>
        <ChevronsUpDown className="rhia-property-switcher__chevron" size={16} strokeWidth={1.5} aria-hidden />
      </button>
      {open && (
        <div id={`${uid}-menu`} className="rhia-pmenu">
          {showSearch && (
            <label className="rhia-pmenu__search">
              <Search size={16} strokeWidth={1.5} aria-hidden />
              <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search properties" aria-label="Search properties"
                onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); options()[0]?.focus(); } else if (e.key === 'Escape') { e.preventDefault(); close(); } }} />
            </label>
          )}
          <div ref={list} role="listbox" aria-label="Properties" className="rhia-pmenu__list" onKeyDown={onListKey}>
            {groups.map(({ chain, showAll, props }) => (
              <div key={chain.id} role="group" aria-labelledby={multi ? `${uid}-${chain.id}` : undefined} aria-label={multi ? undefined : chain.name} className="rhia-pmenu__group">
                {multi && <div id={`${uid}-${chain.id}`} className="rhia-pmenu__heading">{chain.name}</div>}
                {showAll && row({ chainId: chain.id }, 'All properties', { icon: Building2, meta: `${chain.properties.length} hotels`, key: `${chain.id}-all` })}
                {props.map((p) => row({ chainId: chain.id, propertyId: p.id }, p.name, { icon: Hotel, meta: p.city, status: p.status, key: p.id }))}
              </div>
            ))}
            {!groups.length && <p className="rhia-pmenu__empty">No properties match “{q}”.</p>}
          </div>
          {onManage && (
            <button type="button" className="rhia-pmenu__footer" onClick={() => { close(); onManage(); }}>
              <Settings size={16} strokeWidth={1.5} aria-hidden />Manage properties
            </button>
          )}
        </div>
      )}
    </div>
  );
}
