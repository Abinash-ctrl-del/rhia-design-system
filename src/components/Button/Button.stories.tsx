import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import {
  ArrowLeft, ArrowRight, Calendar, Check, ChevronDown, Download, Pencil, Plus, Search, Send, Settings, Sparkles, Trash2, X, Ban,
} from 'lucide-react';
import { Button, type ButtonSize, type ButtonType } from './Button';

const icons = { Plus, ArrowRight, ArrowLeft, ChevronDown, Check, X, Search, Download, Pencil, Trash2, Settings, Sparkles, Send, Calendar };

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'centered' },
  args: { children: 'Button', variant: 'primary', size: 'm', iconPosition: 'none', icon: Plus, disabled: false, loading: false, onClick: fn() },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outlined', 'ghost', 'link', 'destructive', 'destructive-outlined', 'destructive-ghost'], description: 'Figma: Type' },
    size: { control: 'inline-radio', options: ['xs', 's', 'm', 'l', 'xl'], description: 'Figma: Size' },
    iconPosition: { control: 'inline-radio', options: ['none', 'left', 'right', 'only'], description: 'Figma: Icon' },
    icon: { control: 'select', options: Object.keys(icons), mapping: icons, description: 'Figma: Swap icon' },
    children: { control: 'text', description: 'Figma: Label' },
    disabled: { control: 'boolean', description: 'Figma: State = Disabled' },
    loading: { control: 'boolean', description: 'Figma: State = Loading' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover, click-and-hold (pressed) and Tab (focus ring) to feel the states. Change everything from Controls. */
export const Playground: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const btn = canvas.getByRole('button', { name: /button/i });
    await expect(getComputedStyle(btn).backgroundColor).toBe('rgb(107, 43, 255)');
    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

const TYPES: ButtonType[] = ['primary', 'secondary', 'outlined', 'ghost', 'link', 'destructive', 'destructive-outlined', 'destructive-ghost'];
const SIZES: ButtonSize[] = ['xs', 's', 'm', 'l', 'xl'];
const cell = { display: 'flex', alignItems: 'center', gap: 16 } as const;
const head = { font: '500 12px/16px var(--font-family-mono)', color: 'var(--color-neutral-7)', textTransform: 'uppercase', letterSpacing: '0.08em' } as const;

/** Every type × size: no icon, left, right, icon-only, loading (with label and icon-only) and disabled. All are live: hover and click them. */
export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 32, fontFamily: 'var(--font-family-body)' }}>
      {TYPES.map((t) => (
        <section key={t} style={{ display: 'grid', gap: 12 }}>
          <div style={head}>{t}</div>
          {SIZES.map((s) => (
            <div key={s} style={cell}>
              <span style={{ ...head, width: 24 }}>{s}</span>
              <Button variant={t} size={s}>Button</Button>
              <Button variant={t} size={s} icon={Plus} iconPosition="left">Add guest</Button>
              <Button variant={t} size={s} icon={ArrowRight} iconPosition="right">Continue</Button>
              <Button variant={t} size={s} icon={Settings} iconPosition="only">Settings</Button>
              <Button variant={t} size={s} icon={Plus} iconPosition="left" loading>Saving…</Button>
              <Button variant={t} size={s} icon={Settings} iconPosition="only" loading>Saving</Button>
              <Button variant={t} size={s} icon={Plus} iconPosition="left" disabled>Disabled</Button>
            </div>
          ))}
        </section>
      ))}
    </div>
  ),
};

/** Realistic pairings: dialog footers (normal and destructive), a danger toolbar with a loading button, and a toolbar. */
export const InContext: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 32, maxWidth: 560, fontFamily: 'var(--font-family-body)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: 16, borderTop: '1px solid var(--color-neutral-3)' }}>
        <Button variant="ghost">Cancel</Button>
        <Button variant="outlined" icon={Download} iconPosition="left">Export</Button>
        <Button variant="primary" icon={Check} iconPosition="left">Approve rate change</Button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
        <Button variant="ghost">Keep booking</Button>
        <Button variant="destructive" icon={Trash2} iconPosition="left">Cancel booking</Button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button variant="destructive-outlined" size="s" icon={Ban} iconPosition="left">Block guest</Button>
        <Button variant="destructive-ghost" size="s" icon={Trash2} iconPosition="only">Delete note</Button>
        <Button variant="primary" size="s" loading>Syncing PMS…</Button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button variant="secondary" size="s" icon={Sparkles} iconPosition="left">Ask RHIA</Button>
        <Button variant="outlined" size="s" icon={Calendar} iconPosition="left">Next 7 days</Button>
        <Button variant="ghost" size="s" icon={Search} iconPosition="only">Search</Button>
        <Button variant="link" size="s" icon={ArrowRight} iconPosition="right">View all arrivals</Button>
      </div>
    </div>
  ),
};

/** Click to start a fake 2-second save: the button switches to loading, then back. */
export const LoadingDemo: Story = {
  render: function Render() {
    const [busy, setBusy] = useState(false);
    return (
      <Button icon={Check} iconPosition="left" loading={busy} onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 2000); }}>
        {busy ? 'Saving…' : 'Save changes'}
      </Button>
    );
  },
};
