import { useMemo, useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { BedDouble, Building2, EllipsisVertical, Globe, Merge, Pencil, Plus, Trash2, Users, Download } from 'lucide-react';
import {
  ActionsCell, AICell, DateCell, IconTextCell, NumberCell, PersonCell, ProgressCell, StatusCell, Table, TableEmpty,
  TablePagination, TableToolbar, TagsCell, TextCell, type Column, type Sort, type TableDensity,
} from './Table';
import { Button } from '../Button/Button';
import { Toggle } from '../Toggle/Toggle';
import type { BadgeColor } from '../Badge/Badge';

type Guest = {
  id: string; name: string; email: string; initials: string; status: [BadgeColor, string]; tags: string[];
  value: number; lastStay: string; lastStayAgo: string; match: string; noMatch?: boolean;
};
const GUESTS: Guest[] = [
  { id: 'g1', name: 'Priya Shah', email: 'priya.shah@gmail.com', initials: 'PS', status: ['success', 'Checked in'], tags: ['VIP', 'Business', 'Spa', 'Late check-out'], value: 4820, lastStay: '28 Oct 2026', lastStayAgo: '2 days ago', match: 'Same guest · 94%' },
  { id: 'g2', name: 'Daniel Okafor', email: 'd.okafor@outlook.com', initials: 'DO', status: ['brand', 'Arriving today'], tags: ['Leisure'], value: 1260, lastStay: '14 Sep 2026', lastStayAgo: '6 weeks ago', match: 'Likely VIP · 88%' },
  { id: 'g3', name: 'Mei Tanaka', email: 'mei.tanaka@me.com', initials: 'MT', status: ['neutral', 'Checked out'], tags: ['Corporate', 'Repeat'], value: 9310, lastStay: '2 Aug 2026', lastStayAgo: '3 months ago', match: 'Same guest · 71%' },
  { id: 'g4', name: 'Lucas Moreau', email: 'lucas@moreau.fr', initials: 'LM', status: ['warning', 'Pending payment'], tags: ['Leisure', 'Family'], value: 640, lastStay: '19 Jul 2026', lastStayAgo: '3 months ago', match: 'Upsell: suite · 63%' },
  { id: 'g5', name: 'Aisha Khan', email: 'aisha.khan@yahoo.com', initials: 'AK', status: ['danger', 'Cancelled'], tags: ['Business'], value: 0, lastStay: '—', lastStayAgo: 'Never stayed', match: 'No match found', noMatch: true },
  { id: 'g6', name: 'Rahul Mehta', email: 'rahul.m@rhia.ai', initials: 'RM', status: ['success', 'In house'], tags: ['VIP', 'Loyalty gold', 'Business'], value: 12480, lastStay: '26 Oct 2026', lastStayAgo: '4 days ago', match: 'Same guest · 99%' },
];
const eur = (n: number) => `€${n.toLocaleString('en-GB')}`;

const guestColumns: Column<Guest>[] = [
  { key: 'name', header: 'Guest', width: 280, sortable: true, cell: (g) => <PersonCell name={g.name} detail={g.email} initials={g.initials} /> },
  { key: 'status', header: 'Stay status', width: 160, cell: (g) => <StatusCell color={g.status[0]} label={g.status[1]} /> },
  { key: 'tags', header: 'Segments', width: 240, cell: (g) => <TagsCell tags={g.tags} /> },
  { key: 'value', header: 'Lifetime value', width: 140, align: 'right', sortable: true, cell: (g) => <NumberCell value={eur(g.value)} /> },
  { key: 'lastStay', header: 'Last stay', width: 160, sortable: true, cell: (g) => <DateCell date={g.lastStay} relative={g.lastStayAgo} /> },
  { key: 'match', header: 'RHIA match', width: 220, help: 'How sure RHIA is that this profile matches another one', cell: (g) => <AICell label={g.match} none={g.noMatch} /> },
  { key: 'actions', header: <span className="rhia-visually-hidden">Actions</span>, width: 104, align: 'right', cell: (g) => <ActionsCell actions={[{ icon: Pencil, label: `Edit ${g.name}` }, { icon: EllipsisVertical, label: `More for ${g.name}` }]} /> },
];

const canvas: CSSProperties = { background: 'var(--color-bg-canvas)', padding: 24, minHeight: '100vh', boxSizing: 'border-box' };

const meta = {
  title: 'Components/Table',
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={canvas}><Story /></div>],
  args: { density: 'normal' as TableDensity },
  argTypes: { density: { control: 'inline-radio', options: ['normal', 'compact'], description: 'Figma: Density (Normal 52 / 72 · Compact 36 / 56)' } },
} satisfies Meta<{ density: TableDensity }>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Guests list: tick rows to see the bulk toolbar, click Guest / Lifetime value / Last stay to sort, search by name. Switch Density in Controls. */
export const Playground: Story = {
  render: function Render({ density }) {
    const [selected, setSelected] = useState<string[]>([]);
    const [sort, setSort] = useState<Sort>({ key: 'value', dir: 'desc' });
    const [q, setQ] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const rows = useMemo(() => {
      const r = GUESTS.filter((g) => g.name.toLowerCase().includes(q.toLowerCase()));
      if (!sort) return r;
      const k = sort.key as keyof Guest; const m = sort.dir === 'asc' ? 1 : -1;
      return [...r].sort((a, b) => (a[k]! > b[k]! ? m : a[k]! < b[k]! ? -m : 0));
    }, [q, sort]);
    return (
      <Table
        caption="Guests" density={density} columns={guestColumns} rows={rows} getRowId={(g) => g.id}
        selectable selected={selected} onSelectedChange={setSelected} sort={sort} onSortChange={setSort}
        empty={<TableEmpty title="No guests found" description={`Nothing matches “${q}”. Check the spelling or clear the search.`} action={<Button variant="outlined" size="s" onClick={() => setQ('')}>Clear search</Button>} />}
        toolbar={
          <TableToolbar
            title="Guests" count="1,240" search={{ value: q, onChange: setQ, placeholder: 'Search guests' }} onFilter={() => {}} onExport={() => {}}
            selectedCount={selected.length} onClearSelection={() => setSelected([])}
            bulkActions={<>
              <Button variant="outlined" size="m" icon={Merge} iconPosition="left">Merge guests</Button>
              <Button variant="outlined" size="m" icon={Download} iconPosition="left">Export</Button>
              <Button variant="destructive-outlined" size="m" icon={Trash2} iconPosition="left">Delete</Button>
            </>}
          />
        }
        footer={<TablePagination page={page} pageSize={pageSize} total={1240} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />}
      />
    );
  },
  play: async ({ canvas, userEvent }) => {
    const table = canvas.getByRole('table', { name: 'Guests' });
    const rows = within(table).getAllByRole('row');
    await expect(Math.round(rows[1].getBoundingClientRect().height)).toBe(72);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all rows' }));
    await expect(canvas.getByText('6 selected')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row 1' }));
    await expect(canvas.getByRole('checkbox', { name: 'Select all rows' })).toHaveAttribute('aria-checked', 'mixed');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(canvas.getByText('Showing 1–10 of 1,240')).toBeInTheDocument();
    await userEvent.selectOptions(canvas.getByLabelText('Rows per page'), '25');
    await expect(canvas.getByText('Page 1 of 50')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Guest' }));
    await expect(canvas.getByRole('columnheader', { name: /Guest/ })).toHaveAttribute('aria-sort', 'ascending');
  },
};

export const Compact: Story = {
  args: { density: 'compact' },
  render: Playground.render,
  play: async ({ canvas }) => {
    const rows = within(canvas.getByRole('table', { name: 'Guests' })).getAllByRole('row');
    await expect(Math.round(rows[1].getBoundingClientRect().height)).toBe(56);
  },
};

type Demo = { id: string };
const one: Demo[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

/** All 12 cell types (Figma: Table cell › Type). Switch Density to compare. */
export const CellTypes: Story = {
  name: 'Cell types',
  render: function Render({ density }) {
    const [on, setOn] = useState([true, false, true]);
    const a: Column<Demo>[] = [
      { key: 'text', header: 'Text', width: 240, cell: (_, i) => <TextCell text="Late check-out requested" supporting={i === 1 ? 'Room 412 · 2 nights' : undefined} /> },
      { key: 'num', header: 'Number', width: 140, align: 'right', cell: (_, i) => <NumberCell value={['€4,820', '€212.00', '38'][i]} change={i === 1 ? '+12% vs last year' : undefined} /> },
      { key: 'person', header: 'Person', width: 260, cell: () => <PersonCell name="Priya Shah" detail="priya.shah@gmail.com" initials="PS" /> },
      { key: 'icon', header: 'Icon + text', width: 200, cell: (_, i) => <IconTextCell icon={[Building2, Globe, BedDouble][i]} text={['Grand Hotel Mumbai', 'Booking.com', 'Deluxe King'][i]} /> },
      { key: 'status', header: 'Status', width: 160, cell: (_, i) => <StatusCell color={(['success', 'warning', 'danger'] as const)[i]} label={['Connected', 'Sync delayed', 'Failed'][i]} /> },
      { key: 'tags', header: 'Tags', width: 240, cell: (_, i) => <TagsCell tags={[['VIP', 'Business', 'Spa', 'Gym'], ['Leisure'], ['Corporate', 'Repeat']][i]} /> },
    ];
    const b: Column<Demo>[] = [
      { key: 'date', header: 'Date', width: 160, cell: () => <DateCell date="28 Oct 2026" relative="2 days ago" /> },
      { key: 'progress', header: 'Progress', width: 200, cell: (_, i) => <ProgressCell value={[82, 45, 100][i]} label="Profile completeness" /> },
      { key: 'ai', header: 'AI', width: 220, cell: (_, i) => <AICell label={['Same guest · 94%', 'Likely VIP · 88%', 'No match found'][i]} none={i === 2} /> },
      { key: 'toggle', header: 'Toggle', width: 80, cell: (_, i) => <Toggle aria-label={`Journey ${i + 1} active`} checked={on[i]} onCheckedChange={(c) => setOn((p) => p.map((v, j) => (j === i ? c : v)))} /> },
      { key: 'actions', header: 'Actions', width: 104, align: 'right', cell: () => <ActionsCell actions={[{ icon: Pencil, label: 'Edit' }, { icon: EllipsisVertical, label: 'More' }]} /> },
    ];
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <Table caption="Cell types, part 1" density={density} columns={a} rows={one} getRowId={(r) => r.id} selectable selected={['b']} toolbar={<TableToolbar title="Checkbox · Text · Number · Person · Icon + text · Status · Tags" />} />
        <Table caption="Cell types, part 2" density={density} columns={b} rows={one} getRowId={(r) => r.id} toolbar={<TableToolbar title="Date · Progress · AI · Toggle · Actions" />} />
      </div>
    );
  },
};

export const Loading: Story = {
  render: ({ density }) => <Table caption="Guests" density={density} columns={guestColumns} rows={[]} getRowId={(g) => g.id} selectable loading toolbar={<TableToolbar title="Guests" />} />,
  play: async ({ canvas }) => { await expect(canvas.getByRole('table')).toHaveAttribute('aria-busy', 'true'); },
};

export const Empty: Story = {
  render: ({ density }) => (
    <Table caption="Guests" density={density} columns={guestColumns} rows={[]} getRowId={(g) => g.id} selectable
      toolbar={<TableToolbar title="Guests" count="0" />}
      empty={<TableEmpty icon={Users} title="No guests yet" description="Guests appear here once your PMS is connected and the first bookings sync." action={<Button size="s" icon={Plus} iconPosition="left">Connect PMS</Button>} />} />
  ),
};
