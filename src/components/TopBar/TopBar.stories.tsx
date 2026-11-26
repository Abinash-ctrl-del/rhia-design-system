import { useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { CircleHelp, LayoutDashboard, PanelLeft, Sparkles, Users } from 'lucide-react';
import { Breadcrumb, Logo, PillButton, PropertySwitcher, ThemeSwitcher, TopBar, type Scope, type Theme } from './TopBar';
import { MULTI_CHAIN, ONE_CHAIN } from './demo-data';

const canvas: CSSProperties = { background: 'var(--color-bg-canvas)', minHeight: 560, fontFamily: 'var(--font-family-body)', color: 'var(--color-text-primary)' };
const setTheme = (t: Theme) => { document.documentElement.dataset.theme = t; };

const meta = {
  title: 'Components/Top bar',
  component: TopBar,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={canvas}><Story /></div>],
  args: {
    sidebarCollapsed: false,
    property: { chains: ONE_CHAIN, value: { chainId: 'gmh', propertyId: 'mum' }, onChange: fn() },
    breadcrumb: { icon: LayoutDashboard, items: [{ label: 'Overview' }] },
    theme: 'light',
    onThemeChange: fn(), onToggleSidebar: fn(), onAskRhia: fn(), onHelp: fn(),
  },
  argTypes: {
    sidebarCollapsed: { control: 'boolean', description: 'Changes the toggle label (Collapse / Expand sidebar)' },
    theme: { control: 'inline-radio', options: ['light', 'dark'] },
    property: { control: false, description: 'Figma: Property switcher — { chains, value, onChange, onManage }' }, breadcrumb: { control: false },
  },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The theme switch really changes the theme here. */
export const Playground: Story = {
  render: function Render(args) {
    const [theme, set] = useState<Theme>(args.theme);
    const [collapsed, setCollapsed] = useState(!!args.sidebarCollapsed);
    const [scope, setScope] = useState<Scope>(args.property.value);
    return (
      <TopBar {...args} theme={theme} sidebarCollapsed={collapsed} property={{ ...args.property, value: scope, onChange: (s) => { setScope(s); args.property.onChange(s); } }}
        onToggleSidebar={() => { setCollapsed((c) => !c); args.onToggleSidebar?.(); }}
        onThemeChange={(t) => { set(t); setTheme(t); args.onThemeChange(t); }} />
    );
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }));
    await expect(canvas.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Ask RHIA' }));
    await expect(args.onAskRhia).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('radio', { name: 'Dark' }));
    await expect(canvas.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(canvas.getByRole('radio', { name: 'Light' }));
  },
};

/** One chain (a GM or chain user): "All properties" for the chain view, then each hotel. Amber / red dots = data delayed / source offline. */
export const PropertyMenu: Story = {
  name: 'Property menu · one chain',
  parameters: { docs: { story: { height: '420px' } } },
  render: Playground.render,
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Scope: Grand Hotel Mumbai/ }));
    await expect(canvas.getByRole('option', { name: /Grand Hotel Mumbai/ })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(canvas.getByRole('option', { name: /All properties/ }));
    await expect(args.property.onChange).toHaveBeenCalledWith({ chainId: 'gmh' });
    await expect(canvas.getByRole('button', { name: /Scope: All properties/ })).toBeInTheDocument();
  },
};

/** Several chains (RHIA onboarding staff, or a user who works for two chains): one group per chain, search when the list is long, "Manage properties" for admins. */
export const PropertyMenuMultiChain: Story = {
  name: 'Property menu · several chains',
  args: { property: { chains: MULTI_CHAIN, value: { chainId: 'aurora' }, onChange: fn(), onManage: fn() } },
  render: Playground.render,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Scope: Aurora Boutique Hotels/ }));
    await expect(canvas.getAllByRole('group')).toHaveLength(2);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Search properties' }), 'porto');
    await expect(canvas.getAllByRole('option')).toHaveLength(1);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(canvas.getByRole('button', { name: /Scope: Aurora Porto/ })).toHaveFocus();
  },
};

/** Deeper page: earlier crumbs are links, the last one is the current page. */
export const DeepBreadcrumb: Story = {
  name: 'Breadcrumb, 3 levels',
  args: { breadcrumb: { icon: Users, items: [{ label: 'Guests', onClick: fn() }, { label: 'Segments', onClick: fn() }, { label: 'Lapsed VIPs' }] } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Lapsed VIPs')).toHaveAttribute('aria-current', 'page');
  },
};

const label: CSSProperties = { color: 'var(--color-text-tertiary)', width: 160 };
const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' };

/** Each part on its own. Hover and press the pills to see their states. */
export const Parts: Story = {
  render: function Render() {
    const [theme, set] = useState<Theme>('light');
    return (
      <div style={{ padding: 32, display: 'grid', gap: 24 }}>
        <div style={row}><span className="text-mono-overline" style={label}>Logo (placeholder)</span><Logo /></div>
        <div style={row}><span className="text-mono-overline" style={label}>Pill · icon</span>
          <PillButton icon={PanelLeft} aria-label="Collapse sidebar" /><PillButton icon={CircleHelp} aria-label="Help" /></div>
        <div style={row}><span className="text-mono-overline" style={label}>Pill · label</span>
          <PillButton icon={LayoutDashboard} label="Overview" /><PillButton tone="ai" icon={Sparkles} label="Ask RHIA" /></div>
        <div style={row}><span className="text-mono-overline" style={label}>Property switcher</span>
          <PropertySwitcher chains={ONE_CHAIN} value={{ chainId: 'gmh', propertyId: 'mum' }} onChange={() => {}} /><PropertySwitcher chains={ONE_CHAIN} value={{ chainId: 'gmh' }} onChange={() => {}} /><PropertySwitcher chains={MULTI_CHAIN} value={{ chainId: 'aurora' }} onChange={() => {}} /></div>
        <div style={row}><span className="text-mono-overline" style={label}>Breadcrumb</span>
          <Breadcrumb icon={LayoutDashboard} items={[{ label: 'Overview' }]} />
          <Breadcrumb icon={Users} items={[{ label: 'Guests', onClick: () => {} }, { label: 'Priya Shah' }]} />
          <Breadcrumb icon={Users} items={[{ label: 'Guests', onClick: () => {} }, { label: 'Segments', onClick: () => {} }, { label: 'Lapsed VIPs' }]} /></div>
        <div style={row}><span className="text-mono-overline" style={label}>Theme switcher</span>
          <ThemeSwitcher value={theme} onChange={(t) => { set(t); setTheme(t); }} /></div>
      </div>
    );
  },
};
