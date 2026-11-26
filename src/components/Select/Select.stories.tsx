import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { Building2, Calendar, User } from 'lucide-react';
import { Select, type SelectOption, type SelectSize, type SelectType } from './Select';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';

const PROPERTIES: SelectOption[] = [
  { value: 'mum', label: 'Grand Hotel Mumbai', chip: 'Mumbai', supporting: 'Mumbai, IN', dot: 'success' },
  { value: 'goa', label: 'Grand Hotel Goa', chip: 'Goa', supporting: 'Goa, IN', dot: 'success' },
  { value: 'sea', label: 'Sea View Resort', chip: 'Sea View', supporting: 'Kochi, IN', dot: 'warning' },
  { value: 'pune', label: 'City Lodge Pune', chip: 'Pune', supporting: 'Pune, IN', dot: 'danger' },
  { value: 'air', label: 'Airport Inn', chip: 'Airport Inn', supporting: 'Delhi, IN', disabled: true },
];
const icons = { Building2, User, Calendar };

const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 320, minHeight: 360 }}><Story /></div>],
  args: { variant: 'default', size: 'm', options: PROPERTIES, label: 'Property', placeholder: 'Select a property', hint: 'Choose the hotel this applies to.', required: false, disabled: false, error: '', showSupporting: false, onChange: fn() },
  argTypes: {
    variant: { control: 'select', options: ['default', 'leading-icon', 'dot', 'search', 'multi'], description: 'Figma: Type' },
    size: { control: 'inline-radio', options: ['s', 'm', 'l'], description: 'Figma: Size (S 36 · M 40 · L 48)' },
    leadingIcon: { control: 'select', options: Object.keys(icons), mapping: icons, description: 'Figma: Swap leading icon' },
    error: { control: 'text', description: 'Figma: State = Error + Error message' },
    options: { control: false },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click or Tab + Enter to open; ↑ ↓ to move, Enter to pick, Esc to close. */
export const Playground: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const box = canvas.getByRole('combobox');
    box.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onChange).toHaveBeenCalledWith('goa');
    await expect(box).toHaveTextContent('Grand Hotel Goa');
  },
};

export const SearchFilter: Story = {
  name: 'Search',
  args: { variant: 'search', placeholder: 'Search properties' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('combobox'), 'grand');
    await expect(within(canvas.getByRole('listbox')).getAllByRole('option')).toHaveLength(2);
  },
};

export const MultiSelect: Story = {
  name: 'Multi-select',
  args: { variant: 'multi', label: 'Properties', placeholder: 'Select properties' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox'));
    await userEvent.click(canvas.getByRole('option', { name: /mumbai/i }));
    await userEvent.click(canvas.getByRole('option', { name: /goa/i }));
    await expect(canvas.getByRole('button', { name: 'Remove Grand Hotel Goa' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Grand Hotel Goa' }));
    await expect(canvas.queryByRole('button', { name: 'Remove Grand Hotel Goa' })).not.toBeInTheDocument();
  },
};

export const Dot: Story = { args: { variant: 'dot', label: 'Property status', defaultValue: 'mum' } };
export const ErrorState: Story = { name: 'Error', args: { error: 'Select a property.', required: true } };

const TYPES: SelectType[] = ['default', 'leading-icon', 'dot', 'search', 'multi'];
const SIZES: SelectSize[] = ['s', 'm', 'l'];

/** Every type × size (closed). All are live — open any of them. */
export const AllTypes: Story = {
  parameters: { layout: 'padded' },
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 320px)', gap: 32, paddingBottom: 320 }}>
      {TYPES.flatMap((t) => SIZES.map((s) => (
        <Select key={t + s} variant={t} size={s} options={PROPERTIES} label={`${t} · ${s.toUpperCase()}`}
          placeholder={t === 'multi' ? 'Select properties' : 'Select a property'} defaultValue={t === 'multi' ? ['mum', 'goa'] : 'mum'} hint="Choose the hotel this applies to." />
      )))}
    </div>
  ),
};

/** A dashboard filter bar (S size, matches the M button and S input) and a settings form (M size). */
export const InContext: Story = {
  parameters: { layout: 'padded' },
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gap: 40, paddingBottom: 280 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ width: 240 }}><Input size="s" aria-label="Search guests" placeholder="Search guests…" leadingIcon={undefined} /></div>
        <div style={{ width: 220 }}><Select size="s" variant="leading-icon" aria-label="Property" options={PROPERTIES} defaultValue="mum" /></div>
        <div style={{ width: 180 }}><Select size="s" variant="leading-icon" leadingIcon={Calendar} aria-label="Date range" options={[{ value: '7', label: 'Next 7 days' }, { value: '30', label: 'Next 30 days' }, { value: 'q', label: 'This quarter' }]} defaultValue="7" /></div>
        <Button variant="outlined">Export</Button>
      </div>
      <div style={{ display: 'grid', gap: 20, width: 420, padding: 24, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 12 }}>
        <p className="text-heading-md" style={{ margin: 0 }}>Invite a teammate</p>
        <Input label="Email" htmlType="email" placeholder="name@grandhotel.com" required />
        <Select label="Role" required options={[{ value: 'admin', label: 'Admin' }, { value: 'gm', label: 'General manager' }, { value: 'fo', label: 'Front office' }, { value: 'rev', label: 'Revenue' }]} placeholder="Select a role" />
        <Select variant="multi" label="Properties" options={PROPERTIES} placeholder="Select properties" hint="They’ll only see data for these hotels." />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}><Button variant="ghost" size="l">Cancel</Button><Button size="l">Send invite</Button></div>
      </div>
    </div>
  ),
};
