import { useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  args: { size: 's', label: 'Remember this device', supportingText: '', indeterminate: false, disabled: false, onCheckedChange: fn() },
  argTypes: {
    size: { control: 'inline-radio', options: ['s', 'm'], description: 'Figma: Size (S 16 · M 20)' },
    label: { control: 'text', description: 'Figma: Label (empty = Checkbox base, pass aria-label)' },
    supportingText: { control: 'text', description: 'Figma: Supporting text' },
    indeterminate: { control: 'boolean', description: 'Figma: Type = Indeterminate' },
    disabled: { control: 'boolean', description: 'Figma: State = Disabled' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const box = canvas.getByRole('checkbox', { name: 'Remember this device' });
    await userEvent.click(canvas.getByText('Remember this device'));
    await expect(box).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
    await userEvent.keyboard(' ');
    await expect(box).not.toBeChecked();
  },
};

export const WithSupportingText: Story = { name: 'With supporting text', args: { supportingText: 'You won’t need to sign in again for 30 days.' } };

/** "Select all" goes indeterminate when only some items are ticked — like the header checkbox in a table. */
export const SelectAll: Story = {
  name: 'Select all (indeterminate)',
  render: function Render(args) {
    const items = ['Grand Hotel Mumbai', 'Grand Hotel Goa', 'Airport Inn Delhi'];
    const [picked, setPicked] = useState<string[]>(['Grand Hotel Goa']);
    const all = picked.length === items.length, some = picked.length > 0 && !all;
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <Checkbox size={args.size} label="All properties" checked={all} indeterminate={some} onCheckedChange={(c) => setPicked(c ? items : [])} />
        <div style={{ display: 'grid', gap: 12, paddingLeft: 24 }}>
          {items.map((it) => (
            <Checkbox key={it} size={args.size} label={it} checked={picked.includes(it)} onCheckedChange={(c) => setPicked((p) => (c ? [...p, it] : p.filter((x) => x !== it)))} />
          ))}
        </div>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const all = canvas.getByRole('checkbox', { name: 'All properties' });
    await expect(all).toHaveAttribute('aria-checked', 'mixed');
    await userEvent.click(all);
    await expect(canvas.getByRole('checkbox', { name: 'Airport Inn Delhi' })).toBeChecked();
    await expect(all).not.toHaveAttribute('aria-checked');
    await userEvent.click(all);
    await expect(canvas.getByRole('checkbox', { name: 'Grand Hotel Goa' })).not.toBeChecked();
  },
};

const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(5, auto)', gap: '20px 40px', alignItems: 'center' };
const head: CSSProperties = { color: 'var(--color-text-tertiary)' };

/** Every type and state. Hover and tab to see Hover and Focused for real. */
export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'grid', gap: 40 }}>
      {(['s', 'm'] as const).map((size) => (
        <div key={size} style={grid}>
          <span className="text-mono-overline" style={head}>{size.toUpperCase()}</span>
          <span className="text-mono-overline" style={head}>Base</span><span className="text-mono-overline" style={head}>Base disabled</span>
          <span className="text-mono-overline" style={head}>With label</span><span className="text-mono-overline" style={head}>Disabled</span>
          {(['Unchecked', 'Checked', 'Indeterminate'] as const).map((t) => {
            const p = { size, defaultChecked: t === 'Checked', indeterminate: t === 'Indeterminate', readOnly: true };
            return [
              <span key={t} className="text-mono-sm" style={head}>{t}</span>,
              <Checkbox key={t + 'b'} {...p} aria-label={t} />,
              <Checkbox key={t + 'bd'} {...p} aria-label={t + ' disabled'} disabled />,
              <Checkbox key={t + 'l'} {...p} label="Remember this device" supportingText="You won’t need to sign in again." />,
              <Checkbox key={t + 'ld'} {...p} label="Remember this device" disabled />,
            ];
          })}
        </div>
      ))}
    </div>
  ),
};
