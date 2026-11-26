import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { ArrowDown, ArrowUpRight, BedDouble, Check, CircleAlert, Clock, Flag, Sparkles, Star, User, Wifi } from 'lucide-react';
import { Badge, type BadgeColor, type BadgeIcon, type BadgeSize, type BadgeVariant } from './Badge';

const icons = { ArrowUpRight, ArrowDown, Check, Sparkles, Clock, Star, Flag, User, BedDouble, Wifi, CircleAlert };

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  args: { children: 'Confirmed', color: 'success', variant: 'soft', size: 'm', icon: 'dot', iconComponent: ArrowUpRight },
  argTypes: {
    color: { control: 'inline-radio', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'ai'], description: 'Figma: Color' },
    variant: { control: 'inline-radio', options: ['soft', 'solid'], description: 'Figma: Style' },
    size: { control: 'inline-radio', options: ['s', 'm', 'l'], description: 'Figma: Size (S 20 · M 24 · L 28)' },
    icon: { control: 'inline-radio', options: ['none', 'dot', 'leading', 'trailing'], description: 'Figma: Icon (Close = pass onRemove)' },
    iconComponent: { control: 'select', options: Object.keys(icons), mapping: icons, description: 'Figma: Swap icon' },
    children: { control: 'text', description: 'Figma: Label' },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas }) => {
    const b = canvas.getByText('Confirmed').parentElement!;
    await expect(getComputedStyle(b).height).toBe('24px');
  },
};

export const Removable: Story = {
  args: { children: 'Grand Hotel', color: 'neutral', icon: 'none', onRemove: fn() },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Grand Hotel' }));
    await expect(args.onRemove).toHaveBeenCalled();
  },
};

const COLORS: BadgeColor[] = ['neutral', 'brand', 'success', 'warning', 'danger', 'ai'];
const VARIANTS: BadgeVariant[] = ['soft', 'solid'];
const SIZES: BadgeSize[] = ['s', 'm', 'l'];
const ICONS: BadgeIcon[] = ['none', 'dot', 'leading', 'trailing'];
const head = { font: '500 12px/16px var(--font-family-mono)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' } as const;

/** Colour × style rows; size × icon columns, plus a removable chip. Same grid as Figma. */
export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 12, fontFamily: 'var(--font-family-body)' }}>
      {COLORS.flatMap((c) => VARIANTS.map((v) => (
        <div key={c + v} style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span style={{ ...head, width: 120 }}>{c} · {v}</span>
          {SIZES.map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 380 }}>
              {ICONS.map((i) => <Badge key={i} color={c} variant={v} size={s} icon={i}>Label</Badge>)}
              <Badge color={c} variant={v} size={s} onRemove={() => {}}>Label</Badge>
            </div>
          ))}
        </div>
      )))}
    </div>
  ),
};

/** How badges read in the product: table statuses, integration health, AI tags and removable filter chips. */
export const InContext: Story = {
  parameters: { layout: 'padded' },
  render: function Render() {
    const [filters, setFilters] = useState(['Grand Hotel', 'Arrivals today', 'Loyalty members']);
    const row = { display: 'grid', gridTemplateColumns: '160px 140px 1fr', alignItems: 'center', gap: 16, padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)' } as const;
    return (
      <div style={{ display: 'grid', gap: 24, width: 640, fontFamily: 'var(--font-family-body)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} aria-label="Active filters">
          {filters.map((f) => <Badge key={f} size="m" onRemove={() => setFilters((xs) => xs.filter((x) => x !== f))}>{f}</Badge>)}
          {filters.length === 0 && <span className="text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>No filters</span>}
        </div>
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
          {[
            ['AH-103884', <Badge size="s" color="success" icon="dot">Confirmed</Badge>, 'Deluxe King · 2 nights'],
            ['AH-103901', <Badge size="s" color="warning" icon="dot">Pending payment</Badge>, 'Twin · 1 night'],
            ['AH-103917', <Badge size="s" color="danger" icon="dot">Cancelled</Badge>, 'Suite · 3 nights'],
            ['AH-103922', <Badge size="s" color="brand" icon="leading" iconComponent={Star}>Member</Badge>, 'Deluxe King · 4 nights'],
          ].map(([id, badge, desc]) => (
            <div key={id as string} style={row}>
              <span className="text-mono-sm">{id}</span>{badge}<span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>{desc}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge color="success" icon="dot">PMS connected</Badge>
          <Badge color="warning" icon="leading" iconComponent={Clock}>Synced 2 h ago</Badge>
          <Badge color="ai" icon="leading" iconComponent={Sparkles}>AI insight</Badge>
          <Badge color="ai" variant="solid" icon="leading" iconComponent={Sparkles}>RHIA suggests</Badge>
          <Badge color="brand" variant="solid" size="s">New</Badge>
        </div>
      </div>
    );
  },
};
