import type { CSSProperties, ReactNode } from 'react';
import { icons } from 'lucide-react';
import { semantic } from '../tokens/semantic';
import { effects, textStyles } from '../tokens/styles';
import { iconGroups } from './icon-set';

const v = (name: string) => `var(--${name})`;
const page: CSSProperties = { fontFamily: v('font-family-body'), color: v('color-text-primary'), background: v('color-bg-page'), padding: v('spacing-32'), display: 'flex', flexDirection: 'column', gap: v('spacing-40'), textAlign: 'left', minHeight: '100vh', boxSizing: 'border-box' };
const card: CSSProperties = { background: v('color-bg-surface'), border: `1px solid ${v('color-border-subtle')}`, borderRadius: v('radius-12'), padding: v('spacing-24') };

function Header({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: v('spacing-8'), maxWidth: 880 }}>
      <span className="text-mono-overline" style={{ color: v('color-text-brand') }}>{eyebrow}</span>
      <p role="heading" aria-level={1} className="text-heading-xl" style={{ margin: 0 }}>{title}</p>
      <p className="text-body-md" style={{ margin: 0, color: v('color-text-secondary') }}>{children}</p>
    </div>
  );
}
const SectionTitle = ({ children }: { children: ReactNode }) => (
  <p role="heading" aria-level={2} className="text-heading-md" style={{ margin: 0 }}>{children}</p>
);

/* ---------- Semantic colours ---------- */
const semGroups: [string, string][] = [['Backgrounds', 'bg/'], ['Text', 'text/'], ['Borders', 'border/'], ['Icons', 'icon/'], ['Status', 'status/'], ['AI', 'ai/']];
export function SemanticColors() {
  return (
    <div style={page}>
      <Header eyebrow="Semantic colours · draft" title="Basic semantic tokens">
        Apply these in designs and code instead of raw primitives. Each token points to a primitive; Light/Dark switches through the primitives (toolbar → Theme). Colours are suggestions, not final. CSS: var(--color-bg-surface), var(--color-text-primary)…
      </Header>
      {semGroups.map(([title, prefix]) => (
        <section key={title} style={{ ...card, display: 'flex', flexDirection: 'column', gap: v('spacing-8') }}>
          <SectionTitle>{title}</SectionTitle>
          {semantic.filter((t) => t.name.startsWith(prefix)).map((t) => (
            <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '40px 220px 260px 1fr', alignItems: 'center', gap: v('spacing-12') }}>
              <div data-testid={t.name} style={{ width: 40, height: 24, borderRadius: v('radius-4'), background: v(t.cssVar.slice(2)), border: `1px solid ${v('color-border-subtle')}` }} />
              <span className="text-label-sm">{t.name}</span>
              <span className="text-mono-sm" style={{ color: v('color-text-tertiary') }}>{t.cssVar} → {t.alias}</span>
              <span className="text-caption" style={{ color: v('color-text-tertiary') }}>{t.description}</span>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

/* ---------- Text styles ---------- */
const samples: Record<string, string> = {
  'display/lg': '€ 184,920', 'display/md': '92% occupancy', 'heading/xl': 'Arrivals & departures', 'heading/lg': 'RevPAR vs same time last year', 'heading/md': 'Approve rate change', 'heading/sm': 'Today’s priorities',
  'body/lg': 'Three returning members arrive before 18:00; one quiet-room preference needs assignment.', 'body/md': 'Room readiness cannot be confirmed from the available context.', 'body/sm': 'Deluxe King · 2 nights · breakfast included',
  'label/lg': 'Request approval', 'label/md': 'Request approval', 'label/sm': 'Status', caption: 'Updated 2 minutes ago', 'mono/sm': 'As of 09:14 · Source: PMS · AH-103884', 'mono/overline': 'Guest insights',
};
export function TextStyles() {
  return (
    <div style={page}>
      <Header eyebrow={`Text styles · ${textStyles.length}`} title="Text styles">
        Use a class instead of setting size and weight by hand: className="text-heading-md". Each style uses the typography variables, so changing a variable updates every style. Use tabular numbers (font-variant-numeric: tabular-nums) for figures in tables.
      </Header>
      <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
        {textStyles.map((t) => (
          <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: v('spacing-24'), alignItems: 'center', padding: `${v('spacing-16')} 0`, borderBottom: `1px solid ${v('color-border-subtle')}` }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: v('spacing-4') }}>
              <span className="text-label-sm">{t.name}</span>
              <span className="text-mono-sm" style={{ color: v('color-text-tertiary') }}>.{t.className} · {t.family} {t.weight} {t.size}/{t.lineHeight}{t.letterSpacing !== '0' ? ` · ${t.letterSpacing}` : ''}</span>
              <span className="text-caption" style={{ color: v('color-text-tertiary') }}>{t.description}</span>
            </div>
            <span data-testid={t.name} className={t.className}>{samples[t.name] ?? t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Effects ---------- */
export function Effects() {
  const shadows = effects.filter((e) => e.name.startsWith('shadow/'));
  const rings = effects.filter((e) => e.name.startsWith('focus/'));
  return (
    <div style={page}>
      <Header eyebrow={`Effect styles · ${effects.length}`} title="Shadows & focus ring">
        Very soft, layered shadows inspired by Untitled UI, tinted with our darkest neutral. One shadow per element; bigger = higher above the page. Focus is a 4 px soft halo outside the element. CSS: box-shadow: var(--shadow-sm). Light-mode values.
      </Header>
      <SectionTitle>Shadows</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: v('spacing-32') }}>
        {shadows.map((e) => (
          <div key={e.name} data-testid={e.name} style={{ background: v('color-bg-surface'), borderRadius: v('radius-12'), padding: v('spacing-24'), height: 140, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: v('spacing-4'), boxShadow: v(e.cssVar.slice(2)) }}>
            <span className="text-label-md">{e.name}</span>
            <span className="text-mono-sm" style={{ color: v('color-text-tertiary') }}>var({e.cssVar})</span>
            <span className="text-caption" style={{ color: v('color-text-tertiary') }}>{e.description}</span>
          </div>
        ))}
      </div>
      <SectionTitle>Focus ring</SectionTitle>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: v('spacing-32') }}>
        {rings.map((e) => (
          <div key={e.name} style={{ display: 'flex', flexDirection: 'column', gap: v('spacing-12') }}>
            <div style={{ width: 240, height: 40, boxSizing: 'border-box', borderRadius: v('radius-8'), background: v('color-bg-surface'), border: `1px solid ${e.name.includes('error') ? v('color-status-danger-border') : v('color-border-brand')}`, boxShadow: v(e.cssVar.slice(2)), padding: `0 ${v('spacing-12')}`, display: 'flex', alignItems: 'center' }}>
              <span className="text-body-md" style={{ color: v('color-text-tertiary') }}>Search guests…</span>
            </div>
            <span className="text-mono-sm" style={{ color: v('color-text-tertiary') }}>{e.name} · {e.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Icons ---------- */
const pascal = (n: string) => n.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
export function IconSet({ size = 24, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) {
  const total = Object.values(iconGroups).flat().length;
  return (
    <div style={page}>
      <Header eyebrow="Icons · Lucide" title={`Icons · ${total}`}>
        Curated from Lucide (lucide-react), drawn at a 1.5 px stroke. Same names as Figma (icon/arrow-right → ArrowRight). Usage: {'<ArrowRight size={16} strokeWidth={1.5} />'}. Colour follows currentColor.
      </Header>
      {Object.entries(iconGroups).map(([group, names]) => (
        <section key={group} style={{ display: 'flex', flexDirection: 'column', gap: v('spacing-16') }}>
          <SectionTitle>{group} · {names.length}</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: v('spacing-8') }}>
            {names.map((n) => {
              const Icon = icons[pascal(n) as keyof typeof icons];
              return (
                <div key={n} title={pascal(n)} style={{ ...card, padding: v('spacing-16'), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v('spacing-8'), color: v('color-icon-default') }}>
                  {Icon ? <Icon data-testid={`icon-${n}`} size={size} strokeWidth={strokeWidth} /> : <span className="text-caption">missing</span>}
                  <span className="text-caption" style={{ color: v('color-text-tertiary') }}>{n}</span>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
