import type { CSSProperties, ReactNode } from 'react';
import { primitives, type PrimitiveToken } from '../tokens/primitives';

const v = (name: string) => `var(--${name})`;

const page: CSSProperties = {
  fontFamily: v('font-family-body'),
  color: v('color-neutral-10'),
  padding: v('spacing-32'),
  display: 'flex',
  flexDirection: 'column',
  gap: v('spacing-32'),
  textAlign: 'left',
};
const heading: CSSProperties = {
  fontFamily: v('font-family-heading'),
  fontWeight: v('font-weight-semibold'),
  fontSize: v('font-size-24'),
  lineHeight: v('font-line-height-32'),
  letterSpacing: v('font-letter-spacing-tight'),
  margin: 0,
};
const sub: CSSProperties = { fontSize: v('font-size-14'), lineHeight: v('font-line-height-20'), color: v('color-neutral-8'), margin: 0 };
const small: CSSProperties = { fontSize: v('font-size-12'), lineHeight: v('font-line-height-16'), color: v('color-neutral-7') };
const label: CSSProperties = { fontSize: v('font-size-13'), lineHeight: v('font-line-height-20'), fontWeight: 600 };

const group = (prefix: string) => primitives.filter((t) => t.name.startsWith(prefix + '/'));

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: v('spacing-16') }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: v('spacing-4') }}>
        <p role="heading" aria-level={2} style={heading}>{title}</p>
        <p style={sub}>{description}</p>
      </div>
      {children}
    </section>
  );
}

function Meta({ t, extra }: { t: PrimitiveToken; extra?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={label}>{t.name}</span>
      <code style={{ ...small, background: 'none', padding: 0, fontFamily: v('font-family-body') }}>{t.cssVar}</code>
      {extra && <span style={small}>{extra}</span>}
    </div>
  );
}

export function ColorPrimitives() {
  const hues = ['neutral', 'violet', 'lime', 'green', 'amber', 'red'];
  return (
    <div style={page}>
      <Section
        title="Colour primitives"
        description="60 colours in 6 families, steps 1–10 with the same role per step. Violet = brand / primary, lime = AI spark (D-006). Switch Light / Dark in the toolbar — values come from the Figma “Primitives” collection modes."
      >
        {hues.map((hue) => (
          <div key={hue} style={{ display: 'flex', flexDirection: 'column', gap: v('spacing-8') }}>
            <span style={{ ...label, textTransform: 'capitalize' }}>{hue}</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(96px, 1fr))', gap: v('spacing-12') }}>
              {group(`color/${hue}`).map((t) => (
                <div key={t.name} style={{ display: 'flex', flexDirection: 'column', gap: v('spacing-8') }}>
                  <div
                    data-testid={t.name}
                    title={t.description}
                    style={{ height: 64, borderRadius: v('radius-12'), background: v(t.cssVar.slice(2)), border: `1px solid ${v('color-neutral-3')}` }}
                  />
                  <Meta t={t} extra={`${t.value} / ${t.dark ?? t.value}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}

export function SpacingPrimitives() {
  return (
    <div style={page}>
      <Section title="Spacing" description="13 steps on a 4 px grid (with 2 and 6 for dense data UI). Name = pixel value.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: v('spacing-12') }}>
          {group('spacing').map((t) => (
            <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'center', gap: v('spacing-16') }}>
              <Meta t={t} extra={t.description} />
              <div style={{ height: 16, width: `calc(${v(t.cssVar.slice(2))} * 4)`, background: v('color-violet-5'), borderRadius: v('radius-4') }} />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function RadiusPrimitives() {
  return (
    <div style={page}>
      <Section title="Corner radius" description="7 steps. Name = pixel value; full = 9999 px for pills and avatars.">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: v('spacing-24') }}>
          {group('radius').map((t) => (
            <div key={t.name} style={{ display: 'flex', flexDirection: 'column', gap: v('spacing-8'), width: 128 }}>
              <div style={{ height: 80, borderRadius: v(t.cssVar.slice(2)), background: v('color-violet-2'), border: `1.5px solid ${v('color-violet-5')}` }} />
              <Meta t={t} extra={t.description} />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

const scale: Array<[number, number, 'heading' | 'body' | 'mono', number, string, string]> = [
  [48, 56, 'heading', 600, 'tighter', '€ 184,920'],
  [36, 44, 'heading', 600, 'tighter', 'Revenue overview'],
  [30, 36, 'heading', 600, 'tight', 'Arrivals & departures'],
  [24, 32, 'heading', 600, 'tight', 'RevPAR vs same time last year'],
  [20, 28, 'heading', 600, 'tight', 'Approve rate change'],
  [18, 24, 'heading', 600, 'normal', 'Today’s priorities'],
  [16, 24, 'body', 400, 'normal', 'Three returning members arrive before 18:00; one quiet-room preference needs assignment.'],
  [14, 20, 'body', 400, 'normal', 'Room readiness cannot be confirmed from the available context.'],
  [13, 20, 'body', 500, 'normal', 'AH-103884 · Deluxe King · 2 nights · €212.00'],
  [12, 16, 'mono', 400, 'normal', 'As of 09:14 · Source: PMS · Business date 23 Oct'],
];

export function TypographyPrimitives() {
  return (
    <div style={page}>
      <Section
        title="Typography"
        description="Geist for headings, body, UI and numbers (tabular figures); Geist Mono for captions, small labels and metadata (D-009). Sizes paired with line heights on a 4 px rhythm; letter spacing is code-only (em)."
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {scale.map(([size, lh, fam, weight, ls, sample]) => (
            <div key={size} style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: v('spacing-24'), alignItems: 'center', padding: `${v('spacing-12')} 0`, borderBottom: `1px solid ${v('color-neutral-3')}` }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={label}>{size} / {lh}</span>
                <span style={small}>--font-size-{size} · --font-line-height-{lh}</span>
                <span style={small}>--font-family-{fam} · weight {weight} · letter-spacing {ls}</span>
              </div>
              <span
                data-testid={`type-${size}`}
                style={{
                  fontFamily: v(`font-family-${fam}`),
                  fontSize: v(`font-size-${size}`),
                  lineHeight: v(`font-line-height-${lh}`),
                  fontWeight: weight,
                  letterSpacing: v(`font-letter-spacing-${ls}`),
                  fontVariantNumeric: fam !== 'heading' ? 'tabular-nums' : undefined,
                }}
              >
                {sample}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: v('spacing-32'), flexWrap: 'wrap' }}>
          {group('font/weight').map((t) => (
            <div key={t.name} style={{ fontSize: v('font-size-16'), lineHeight: v('font-line-height-24'), fontWeight: Number(t.value) }}>
              {t.name} · {t.value}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
