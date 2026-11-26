import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Building2, Calendar, Globe, Hash, Link, Mail, MapPin, Phone, Search, User } from 'lucide-react';
import { Input, type InputSize, type InputType } from './Input';
import { Button } from '../Button/Button';

const icons = { Mail, Search, User, Calendar, MapPin, Phone, Building2, Hash, Globe, Link };

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
  args: {
    variant: 'default', size: 'm', label: 'Email', placeholder: 'olivia@rhia.ai', hint: 'We’ll send the booking confirmation here.',
    required: false, disabled: false, error: '', helpText: 'Used for confirmations and receipts only.', leadingIcon: Mail, onButtonClick: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'leading-text', 'leading-dropdown', 'trailing-dropdown', 'phone', 'trailing-button', 'password'], description: 'Figma: Type' },
    size: { control: 'inline-radio', options: ['s', 'm', 'l'], description: 'Figma: Size (S 36 · M 40 · L 48)' },
    leadingIcon: { control: 'select', options: Object.keys(icons), mapping: icons, description: 'Figma: Swap leading icon' },
    error: { control: 'text', description: 'Figma: State = Error + Error message' },
    disabled: { control: 'boolean', description: 'Figma: State = Disabled' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Type in it, Tab to it (focus ring), switch type/size/error from Controls. */
export const Playground: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText(/email/i);
    await userEvent.type(input, 'guest@grandhotel.com');
    await expect(input).toHaveValue('guest@grandhotel.com');
  },
};

export const Password: Story = {
  args: { variant: 'password', label: 'Password', placeholder: 'Enter password', hint: 'At least 12 characters.', helpText: undefined },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText('Password', { selector: 'input' });
    await userEvent.type(input, 'secret-pass');
    await expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(canvas.getByRole('button', { name: /show password/i }));
    await expect(input).toHaveAttribute('type', 'text');
  },
};

export const ErrorState: Story = {
  name: 'Error',
  args: { defaultValue: 'olivia@', error: 'Enter a valid email address.' },
};

const TYPES: { v: InputType; label: string; ph: string; extra?: object }[] = [
  { v: 'default', label: 'Email', ph: 'olivia@rhia.ai' },
  { v: 'leading-text', label: 'Website', ph: 'rhia.ai/grand-hotel' },
  { v: 'leading-dropdown', label: 'Rate', ph: '212.00' },
  { v: 'trailing-dropdown', label: 'Room rate', ph: '212.00' },
  { v: 'phone', label: 'Phone number', ph: '98765 43210' },
  { v: 'trailing-button', label: 'Invite link', ph: '', extra: { defaultValue: 'rhia.ai/invite/x7Kq2', readOnly: true } },
  { v: 'password', label: 'Password', ph: 'Enter password' },
];
const SIZES: InputSize[] = ['s', 'm', 'l'];

/** Every type × size. All live: type, open the dropdowns, toggle the password, press Copy. */
export const AllTypes: Story = {
  parameters: { layout: 'padded' },
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 320px)', gap: 32, fontFamily: 'var(--font-family-body)' }}>
      {SIZES.map((s) => <div key={s} className="text-mono-overline" style={{ color: 'var(--color-text-tertiary)' }}>Size {s.toUpperCase()} · {s === 's' ? 36 : s === 'm' ? 40 : 48}px</div>)}
      {TYPES.flatMap((t) => SIZES.map((s) => (
        <Input key={t.v + s} variant={t.v} size={s} label={t.label} placeholder={t.ph} hint="This is a hint text to help the user." helpText={t.v === 'password' ? undefined : 'More info'} {...t.extra} />
      )))}
    </div>
  ),
};

/** Placeholder, filled, disabled and error, side by side (focus: click or Tab into any). */
export const States: Story = {
  parameters: { layout: 'padded' },
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 280px)', gap: 24 }}>
      <Input label="Placeholder" placeholder="olivia@rhia.ai" hint="Empty field." />
      <Input label="Filled" defaultValue="olivia@rhia.ai" hint="Has a value." />
      <Input label="Disabled" defaultValue="olivia@rhia.ai" hint="Can’t be edited." disabled />
      <Input label="Error" defaultValue="olivia@" error="Enter a valid email address." />
    </div>
  ),
};

/** A realistic form: guest details for a booking, with M inputs and an L button row. */
export const InContext: Story = {
  parameters: { layout: 'padded' },
  decorators: [(Story) => <Story />],
  render: () => (
    <form onSubmit={(e) => e.preventDefault()} style={{ display: 'grid', gap: 20, width: 480, padding: 24, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 12 }}>
      <p className="text-heading-md" style={{ margin: 0 }}>Guest details</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="First name" placeholder="Olivia" required leadingIcon={null} />
        <Input label="Last name" placeholder="Rhye" required leadingIcon={null} />
      </div>
      <Input label="Email" htmlType="email" placeholder="olivia@rhia.ai" required hint="We’ll send the confirmation here." />
      <Input variant="phone" label="Phone number" placeholder="98765 43210" />
      <Input variant="leading-dropdown" label="Agreed rate" placeholder="212.00" inputMode="decimal" />
      <Input variant="leading-text" label="Booking source" placeholder="booking.com/…" />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button variant="ghost" size="l">Cancel</Button>
        <Button size="l" htmlType="submit">Save guest</Button>
      </div>
    </form>
  ),
};
