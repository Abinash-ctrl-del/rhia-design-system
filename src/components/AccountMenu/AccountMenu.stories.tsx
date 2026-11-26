import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { AccountMenu } from './AccountMenu';
import { UserCard } from '../Sidebar/Sidebar';

const canvas: CSSProperties = { background: 'var(--color-bg-canvas)', minHeight: 420, padding: 32, boxSizing: 'border-box', fontFamily: 'var(--font-family-body)' };

const meta = {
  title: 'Components/Account menu',
  component: AccountMenu,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={canvas}><Story /></div>],
  args: { user: { name: 'Priya Shah', email: 'priya.shah@grandhotel.com', initials: 'PS' }, onSelect: fn(), onClose: fn() },
  argTypes: { user: { control: 'object', description: 'Figma: Name, Email, Initials' }, items: { control: false } },
} satisfies Meta<typeof AccountMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The panel on its own. Arrow keys move between rows; Esc closes. */
export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Log out' }));
    await expect(args.onSelect).toHaveBeenCalledWith('logout');
  },
};

/** How it's used: the ⋮ on the sidebar User card opens it above the card (to the right when the sidebar is collapsed). */
export const FromUserCard: Story = {
  name: 'Opened from the user card',
  render: (args) => (
    <div style={{ display: 'flex', gap: 48, alignItems: 'flex-end', height: 356 }}>
      <div style={{ width: 224 }}><UserCard user={{ name: 'Priya Shah', role: 'General manager', initials: 'PS', email: 'priya.shah@grandhotel.com', onMenuSelect: args.onSelect }} /></div>
      <div style={{ width: 40 }}><UserCard collapsed user={{ name: 'Priya Shah', role: 'General manager', initials: 'PS', email: 'priya.shah@grandhotel.com', onMenuSelect: args.onSelect }} /></div>
    </div>
  ),
  play: async ({ canvas, userEvent, args }) => {
    const [trigger] = canvas.getAllByRole('button', { name: 'Account menu for Priya Shah' });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'My profile' })).toHaveFocus());
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('menuitem', { name: 'Log out' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Preferences' }));
    await expect(args.onSelect).toHaveBeenCalledWith('preferences');
  },
};
