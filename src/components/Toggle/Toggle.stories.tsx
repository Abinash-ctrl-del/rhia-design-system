import { useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Toggle } from './Toggle';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: { layout: 'centered' },
  args: { size: 's', label: 'Send arrival reminders', supportingText: '', disabled: false, onCheckedChange: fn() },
  argTypes: {
    size: { control: 'inline-radio', options: ['s', 'm'], description: 'Figma: Size (S 36×20 · M 44×24)' },
    label: { control: 'text', description: 'Figma: Label (empty = Toggle base, pass aria-label)' },
    supportingText: { control: 'text', description: 'Figma: Supporting text' },
    disabled: { control: 'boolean', description: 'Figma: State = Disabled' },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const sw = canvas.getByRole('switch', { name: 'Send arrival reminders' });
    await userEvent.click(canvas.getByText('Send arrival reminders'));
    await expect(sw).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
    await userEvent.keyboard(' ');
    await expect(sw).not.toBeChecked();
  },
};

export const WithSupportingText: Story = { name: 'With supporting text', args: { supportingText: 'Email guests 2 days before check-in.' } };

const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(5, auto)', gap: '20px 40px', alignItems: 'center' };
const head: CSSProperties = { color: 'var(--color-text-tertiary)' };

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'grid', gap: 40 }}>
      {(['s', 'm'] as const).map((size) => (
        <div key={size} style={grid}>
          <span className="text-mono-overline" style={head}>{size.toUpperCase()}</span>
          <span className="text-mono-overline" style={head}>Base</span><span className="text-mono-overline" style={head}>Base disabled</span>
          <span className="text-mono-overline" style={head}>With label</span><span className="text-mono-overline" style={head}>Disabled</span>
          {([false, true] as const).map((on) => {
            const p = { size, defaultChecked: on, readOnly: true };
            const t = on ? 'On' : 'Off';
            return [
              <span key={t} className="text-mono-sm" style={head}>{t}</span>,
              <Toggle key={t + 'b'} {...p} aria-label={t} />,
              <Toggle key={t + 'bd'} {...p} aria-label={t + ' disabled'} disabled />,
              <Toggle key={t + 'l'} {...p} label="Send arrival reminders" supportingText="Email guests 2 days before check-in." />,
              <Toggle key={t + 'ld'} {...p} label="Send arrival reminders" disabled />,
            ];
          })}
        </div>
      ))}
    </div>
  ),
};

/** A settings card: each toggle applies straight away. */
export const InContext: Story = {
  name: 'In context (settings)',
  parameters: { layout: 'padded' },
  render: function Render() {
    const rows = [
      ['Arrival reminders', 'Email guests 2 days before check-in.', true],
      ['Post-stay survey', 'Ask for feedback the day after check-out.', true],
      ['Birthday offers', 'Send a loyalty offer in the guest’s birthday month.', false],
      ['Win-back journey', 'Contact guests who haven’t stayed in 12 months.', false],
    ] as const;
    const [on, setOn] = useState<boolean[]>(rows.map((r) => r[2]));
    return (
      <div style={{ background: 'var(--color-bg-canvas)', padding: 24 }}>
        <div style={{ maxWidth: 560, background: 'var(--color-bg-surface)', borderRadius: 16, boxShadow: 'var(--shadow-sm)', padding: '8px 24px', fontFamily: 'var(--font-family-body)' }}>
          {rows.map(([title, hint], i) => (
            <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderTop: i ? '1px solid var(--color-border-subtle)' : 0 }}>
              <div style={{ flex: 1 }}>
                <div className="text-label-md">{title}</div>
                <div className="text-body-md" style={{ color: 'var(--color-text-tertiary)' }}>{hint}</div>
              </div>
              <Toggle aria-label={title} checked={on[i]} onCheckedChange={(c) => setOn((p) => p.map((v, j) => (j === i ? c : v)))} />
            </div>
          ))}
        </div>
      </div>
    );
  },
};
