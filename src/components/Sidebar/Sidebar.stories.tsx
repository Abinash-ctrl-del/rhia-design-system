import { useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { LayoutDashboard, Bell } from 'lucide-react';
import { TopBar, type Scope, type Theme } from '../TopBar/TopBar';
import { ONE_CHAIN } from '../TopBar/demo-data';
import { BOOKING_ENGINE_BOTTOM, BOOKING_ENGINE_NAV, NavItem, PHASE1_BOTTOM, PHASE1_NAV, ProgressRing, SetupChecklist, Sidebar, navForRole, type Phase1Role, type SetupDef } from './Sidebar';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';

const SETUP: SetupDef = {
  done: 2, total: 5,
  steps: [
    { label: 'Add properties', status: 'done' },
    { label: 'Connect integrations', status: 'current' },
    { label: 'Fill property intelligence', status: 'todo' },
  ],
  cta: { label: 'Go to integrations' },
};

const canvas: CSSProperties = { background: 'var(--color-bg-canvas)', padding: 16, height: '100vh', boxSizing: 'border-box', display: 'flex', gap: 16 };

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  args: { collapsed: false, activeId: 'overview', setup: SETUP, onNavigate: fn(), onSearch: fn() },
  argTypes: {
    collapsed: { control: 'boolean', description: 'Figma: Collapsed (256 / 72 px)' },
    activeId: { control: 'select', options: [...PHASE1_NAV.flatMap((s) => s.items), ...PHASE1_BOTTOM].map((i) => i.id) },
    setup: { control: false, description: 'Figma: Show setup checklist (omit to hide)' },
    sections: { control: false }, bottom: { control: false }, user: { control: false },
  },
  // Canvas fills the viewport height. Stories can swap the canvas style (parameters.canvas) or skip it (parameters.bare).
  decorators: [(Story, ctx) => (ctx.parameters.bare ? <Story /> : <div style={{ ...canvas, ...(ctx.parameters.canvas ?? {}) }}><Story /></div>)],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click any item to make it active. Toggle Collapsed in Controls. */
export const Playground: Story = {
  render: function Render(args) {
    const [active, setActive] = useState(args.activeId);
    return <Sidebar {...args} activeId={active} onNavigate={(id) => { setActive(id); args.onNavigate?.(id); }} />;
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('link', { name: 'Guests' }));
    await expect(canvas.getByRole('link', { name: 'Guests' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current');
  },
};

export const Collapsed: Story = {
  args: { collapsed: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
    await expect(canvas.getByRole('link', { name: /Alerts, 4 open alerts/ })).toBeInTheDocument();
  },
};

/** What each Phase 1 role sees: items a role can't use are hidden, not disabled (E2). */
export const ByRole: Story = {
  name: 'By role',
  parameters: { canvas: { overflowX: 'auto' } },
  render: () => {
    const roles: [Phase1Role, string, string][] = [['gm', 'General manager', 'Daniel Fernandes'], ['crm', 'CRM manager', 'Sara D’Souza'], ['loyalty', 'Loyalty manager', 'Leena Joseph'], ['commercial', 'Commercial director', 'Anjali Mehra'], ['finance', 'Financial controller', 'Thomas Mathew']];
    return (
      <>
        {roles.map(([role, title, name]) => {
          const { sections, bottom } = navForRole(role);
          const initials = name.split(' ').map((w) => w[0]).join('');
          return <div key={role} style={{ display: 'flex' }}><Sidebar sections={sections} bottom={bottom} activeId="overview" user={{ name, role: title, initials }} /></div>;
        })}
      </>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('link', { name: /^Approvals/ })).toHaveLength(2);
    await expect(canvas.getAllByRole('link', { name: 'Programme' })).toHaveLength(1);
  },
};

/** The setup card can be minimised to its title, step count and progress bar (the app should remember the choice per user). */
export const SetupMinimised: Story = {
  name: 'Setup minimised',
  args: { setup: { ...SETUP, defaultMinimised: true } },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByText('Connect integrations')).not.toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Show setup steps' }));
    await expect(canvas.getByText('Connect integrations')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Hide setup steps' })).toHaveAttribute('aria-expanded', 'true');
  },
};

export const WithoutSetup: Story = { name: 'No setup checklist (property live)', args: { setup: undefined } };

/** The parts on their own. */
export const Parts: Story = {
  parameters: { canvas: { height: 'auto', minHeight: '100vh', flexWrap: 'wrap', alignItems: 'flex-start', gap: 32 } },
  render: () => (
    <>
      <div style={{ width: 224, display: 'grid', gap: 4 }}>
        <span className="text-mono-overline" style={{ color: 'var(--color-text-tertiary)' }}>Nav item</span>
        <NavItem item={{ id: 'a', label: 'Default', icon: LayoutDashboard }} />
        <NavItem item={{ id: 'b', label: 'Active', icon: LayoutDashboard }} active />
        <NavItem item={{ id: 'c', label: 'With badge', icon: Bell, badge: { count: 4, color: 'danger' } }} />
        <NavItem item={{ id: 'd', label: 'Disabled', icon: LayoutDashboard, disabled: true }} />
        <span className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>Hover any row to see the hover state.</span>
      </div>
      <div style={{ width: 224 }}><SetupChecklist setup={SETUP} /></div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {[0, 20, 40, 80, 100].map((v) => <ProgressRing key={v} value={v} />)}
        <SetupChecklist setup={SETUP} collapsed />
      </div>
    </>
  ),
};

/** Abinash's app shell (D-010): top bar + canvas → floating sidebar + main panel → white cards. The toggle collapses the sidebar; the sun/moon switch changes theme. */
export const AppShell: Story = {
  name: 'App shell',
  parameters: { bare: true },
  render: function Render() {
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState('overview');
    const [theme, setTheme] = useState<Theme>('light');
    const [scope, setScope] = useState<Scope>({ chainId: 'gmh', propertyId: 'mum' });
    const activeItem = [...PHASE1_NAV.flatMap((s) => s.items), ...PHASE1_BOTTOM].find((i) => i.id === active);
    const label = activeItem?.label ?? 'Overview';
    const card: CSSProperties = { background: 'var(--color-bg-surface)', borderRadius: 16, boxShadow: 'var(--shadow-sm)', padding: 24, display: 'grid', gap: 8 };
    return (
      <div style={{ background: 'var(--color-bg-canvas)', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font-family-body)', color: 'var(--color-text-primary)' }}>
        <TopBar
          sidebarCollapsed={collapsed} onToggleSidebar={() => setCollapsed((c) => !c)}
          property={{ chains: ONE_CHAIN, value: scope, onChange: setScope }}
          breadcrumb={{ icon: activeItem?.icon ?? LayoutDashboard, items: [{ label }] }}
          theme={theme} onThemeChange={(t) => { setTheme(t); document.documentElement.dataset.theme = t; }}
        />
        <div style={{ display: 'flex', gap: 16, padding: '0 16px 16px', height: 'calc(100vh - 72px)', boxSizing: 'border-box' }}>
          <Sidebar collapsed={collapsed} activeId={active} onNavigate={setActive} setup={SETUP} />
          <main style={{ flex: 1, minWidth: 0, background: 'var(--color-bg-page)', border: '1px solid var(--color-border-highlight)', borderRadius: 16, padding: 32, display: 'grid', alignContent: 'start', gap: 24, overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p className="text-heading-xl" style={{ margin: 0 }}>{active === 'overview' ? 'Good morning, Priya' : label}</p>
                <p className="text-body-md" style={{ margin: '4px 0 0', color: 'var(--color-text-tertiary)' }}>Thursday 29 Oct · business date 28 Oct (closed) · data as of 07:42</p>
              </div>
              <Button variant="outlined">Export</Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[['Occupancy', '82%', '+4 pts vs last week', 'success'], ['ADR', '€212', '+€9 vs last week', 'success'], ['RevPAR', '€174', '+6% vs last week', 'success'], ['Arrivals today', '46', '5 VIP · 3 need rooms', 'warning']].map(([l, v, d, c]) => (
                <div key={l} style={card}><span className="text-label-sm" style={{ color: 'var(--color-text-secondary)' }}>{l}</span><span className="text-display-md">{v}</span><span><Badge color={c as 'success'} icon="dot">{d}</Badge></span></div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }));
    await expect(canvas.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  },
};

/** RHIA Admin, booking engine Stage 1: only the areas we need now (10 Nov). Click an item to make it active. */
export const BookingEngine: Story = {
  name: 'Booking engine (Stage 1)',
  args: {
    sections: BOOKING_ENGINE_NAV, bottom: BOOKING_ENGINE_BOTTOM, activeId: 'overview',
    setup: { title: 'Go-live checklist', done: 3, total: 10, steps: [{ label: 'Invite your team', status: 'done' }, { label: 'Connect a payment provider', status: 'current' }, { label: 'Match booking codes', status: 'todo' }], cta: { label: 'Connect payments' }, defaultMinimised: true },
    user: { name: 'Abinash Bharali', role: 'Hotel admin', initials: 'AB' },
  },
  render: (args) => {
    const [active, setActive] = useState(args.activeId);
    return <Sidebar {...args} activeId={active} onNavigate={(id) => { setActive(id); args.onNavigate?.(id); }} />;
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Bookings' })).toBeInTheDocument();
    await expect(canvas.queryByRole('link', { name: 'Guests' })).toBeNull();
    await expect(canvas.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
  },
};
