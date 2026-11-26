import { createContext, useContext, useId, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, CircleHelp, Download, Filter, Search, Sparkles, type LucideIcon } from 'lucide-react';
import { Badge, type BadgeColor } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { Input } from '../Input/Input';
import './Table.css';

/* =========================================================================
   Table — mirrors Figma "Table cell", "Table header cell", "Table toolbar", "Table footer" (Tables page).
   Rows alternate white / grey (D-011). density: normal (52 / 72) or compact (36 / 56).
   ========================================================================= */

export type TableDensity = 'normal' | 'compact';
export type SortDir = 'asc' | 'desc';
export type Sort = { key: string; dir: SortDir } | null;

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Render the cell. Use the *Cell helpers below for the standard types. */
  cell: (row: T, index: number) => ReactNode;
  /** Figma: Align. Numbers go right. */
  align?: 'left' | 'right';
  /** CSS width, e.g. 280 or '20%'. */
  width?: number | string;
  sortable?: boolean;
  /** Figma: Show help icon — text shown as a tooltip on the ⓘ */
  help?: string;
  /** Plain-text column name for screen readers when header isn't text */
  label?: string;
}

const DensityContext = createContext<TableDensity>('normal');
export const useTableDensity = () => useContext(DensityContext);

export interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** Figma: Density */
  density?: TableDensity;
  /** Accessible name, e.g. "Guests" */
  caption: string;
  /** Adds the checkbox column */
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  sort?: Sort;
  onSortChange?: (sort: Sort) => void;
  onRowClick?: (row: T) => void;
  /** Shows placeholder rows */
  loading?: boolean;
  /** Shown when there are no rows */
  empty?: ReactNode;
  /** Slots — usually <TableToolbar> and <TablePagination> */
  toolbar?: ReactNode;
  footer?: ReactNode;
  /** Max height of the scroll area; the header stays put */
  maxHeight?: number | string;
  className?: string;
}

export function Table<T>({
  columns, rows, getRowId, density = 'normal', caption, selectable, selected = [], onSelectedChange,
  sort = null, onSortChange, onRowClick, loading, empty, toolbar, footer, maxHeight, className,
}: TableProps<T>) {
  const ids = rows.map(getRowId);
  const allOn = ids.length > 0 && ids.every((id) => selected.includes(id));
  const someOn = !allOn && ids.some((id) => selected.includes(id));
  const toggleAll = (on: boolean) => onSelectedChange?.(on ? Array.from(new Set([...selected, ...ids])) : selected.filter((id) => !ids.includes(id)));
  const toggleOne = (id: string, on: boolean) => onSelectedChange?.(on ? [...selected, id] : selected.filter((x) => x !== id));
  const nextSort = (key: string): Sort => (sort?.key !== key ? { key, dir: 'asc' } : sort.dir === 'asc' ? { key, dir: 'desc' } : null);
  const colCount = columns.length + (selectable ? 1 : 0);

  return (
    <DensityContext.Provider value={density}>
      <div className={['rhia-table-card', `rhia-table--${density}`, className].filter(Boolean).join(' ')}>
        {toolbar}
        <div className="rhia-table__scroll" style={{ maxHeight }} tabIndex={maxHeight ? 0 : undefined} role={maxHeight ? 'region' : undefined} aria-label={maxHeight ? caption : undefined}>
          <table className="rhia-table" aria-busy={loading || undefined}>
            <caption className="rhia-visually-hidden">{caption}</caption>
            <thead>
              <tr>
                {selectable && (
                  <th scope="col" className="rhia-table__check">
                    <Checkbox aria-label="Select all rows" checked={allOn} indeterminate={someOn} disabled={!rows.length} onCheckedChange={toggleAll} />
                  </th>
                )}
                {columns.map((c) => {
                  const dir = sort?.key === c.key ? sort.dir : undefined;
                  const inner = (
                    <>
                      <span className="rhia-table__th-label">{c.header}</span>
                      {c.help && <span className="rhia-table__help" title={c.help} aria-label={c.help} role="img"><CircleHelp size={16} strokeWidth={1.5} /></span>}
                      {c.sortable && (dir === 'asc' ? <ArrowUp className="rhia-table__sort is-on" size={16} strokeWidth={1.5} aria-hidden />
                        : dir === 'desc' ? <ArrowDown className="rhia-table__sort is-on" size={16} strokeWidth={1.5} aria-hidden />
                        : <ChevronsUpDown className="rhia-table__sort" size={16} strokeWidth={1.5} aria-hidden />)}
                    </>
                  );
                  return (
                    <th key={c.key} scope="col" style={{ width: c.width }} className={[c.align === 'right' ? 'is-right' : '', dir ? 'is-sorted' : ''].join(' ')}
                      aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : c.sortable ? 'none' : undefined}>
                      {c.sortable
                        ? <button type="button" className="rhia-table__sort-btn" onClick={() => onSortChange?.(nextSort(c.key))}>{inner}</button>
                        : <span className="rhia-table__th-inner">{inner}</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }, (_, i) => (
                <tr key={`sk${i}`} className="rhia-table__skeleton">
                  {Array.from({ length: colCount }, (_, j) => <td key={j}><span className="rhia-skeleton" /></td>)}
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr className="rhia-table__empty-row"><td colSpan={colCount}>{empty ?? <TableEmpty title="Nothing here yet" />}</td></tr>
              )}
              {!loading && rows.map((row, i) => {
                const id = getRowId(row); const isSel = selected.includes(id);
                return (
                  <tr key={id} aria-selected={selectable ? isSel : undefined} className={[isSel ? 'is-selected' : '', onRowClick ? 'is-clickable' : ''].join(' ')}
                    onClick={onRowClick ? (e) => { if (!(e.target as HTMLElement).closest('button, a, input, label')) onRowClick(row); } : undefined}>
                    {selectable && (
                      <td className="rhia-table__check"><Checkbox aria-label={`Select row ${i + 1}`} checked={isSel} onCheckedChange={(on) => toggleOne(id, on)} /></td>
                    )}
                    {columns.map((c) => <td key={c.key} className={c.align === 'right' ? 'is-right' : undefined}>{c.cell(row, i)}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {footer}
      </div>
    </DensityContext.Provider>
  );
}

/* ---------------- Cell types (Figma: Table cell › Type) ---------------- */

/** Type = Text. Optional grey second line (Show supporting text). */
export function TextCell({ text, supporting }: { text: ReactNode; supporting?: ReactNode }) {
  return <div className="rhia-cell-stack"><span className="rhia-cell-main">{text}</span>{supporting && <span className="rhia-cell-sub">{supporting}</span>}</div>;
}

/** Type = Number. Right-aligned, digits line up. Optional change line. */
export function NumberCell({ value, change, tone = 'success' }: { value: ReactNode; change?: ReactNode; tone?: 'success' | 'danger' | 'neutral' }) {
  return <div className="rhia-cell-stack rhia-cell-number"><span className="rhia-cell-main">{value}</span>{change && <span className={`rhia-cell-sub rhia-cell-change--${tone}`}>{change}</span>}</div>;
}

/** Type = Person. Avatar (32 / 24 compact) + name + email or room. */
export function PersonCell({ name, detail, initials }: { name: string; detail?: ReactNode; initials: string }) {
  return (
    <div className="rhia-cell-person">
      <span className="rhia-cell-avatar" aria-hidden>{initials}</span>
      <div className="rhia-cell-stack"><span className="rhia-cell-main rhia-cell-strong">{name}</span>{detail && <span className="rhia-cell-sub">{detail}</span>}</div>
    </div>
  );
}

/** Type = Icon + text. */
export function IconTextCell({ icon: Icon, text }: { icon: LucideIcon; text: ReactNode }) {
  return <div className="rhia-cell-icon"><Icon size={16} strokeWidth={1.5} aria-hidden /><span className="rhia-cell-main">{text}</span></div>;
}

/** Type = Status. One Badge S with a dot. */
export function StatusCell({ color, label }: { color: BadgeColor; label: string }) {
  return <Badge color={color} size="s" icon="dot">{label}</Badge>;
}

/** Type = Tags. Neutral badges; extra ones collapse into "+n". */
export function TagsCell({ tags, max = 2 }: { tags: string[]; max?: number }) {
  const shown = tags.slice(0, max), rest = tags.length - shown.length;
  return (
    <div className="rhia-cell-tags">
      {shown.map((t) => <Badge key={t} size="s">{t}</Badge>)}
      {rest > 0 && <Badge size="s" title={tags.slice(max).join(', ')} aria-label={`${rest} more: ${tags.slice(max).join(', ')}`}>+{rest}</Badge>}
    </div>
  );
}

/** Type = Date. Date + relative time underneath. */
export function DateCell({ date, relative }: { date: ReactNode; relative?: ReactNode }) {
  return <TextCell text={date} supporting={relative} />;
}

/** Type = Progress. Thin bar + percent. */
export function ProgressCell({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="rhia-cell-progress">
      <span className="rhia-cell-progress__track" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <span className="rhia-cell-progress__fill" style={{ width: `${v}%` }} />
      </span>
      <span className="rhia-cell-progress__value">{v}%</span>
    </div>
  );
}

/** Type = AI. Lime badge with a sparkle; neutral when there is no suggestion. */
export function AICell({ label, none }: { label: string; none?: boolean }) {
  return none ? <Badge size="s">{label}</Badge> : <Badge color="ai" size="s" icon="leading" iconComponent={Sparkles}>{label}</Badge>;
}

/** Type = Actions. Ghost XS icon buttons, right-aligned. */
export function ActionsCell({ actions }: { actions: { icon: LucideIcon; label: string; onClick?: () => void }[] }) {
  return (
    <div className="rhia-cell-actions">
      {actions.map((a) => <Button key={a.label} variant="ghost" size="xs" icon={a.icon} iconPosition="only" onClick={a.onClick}>{a.label}</Button>)}
    </div>
  );
}

/* ---------------- Toolbar, pagination, empty ---------------- */

export interface TableToolbarProps {
  title: ReactNode;
  count?: ReactNode;
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  onFilter?: () => void;
  onExport?: () => void;
  /** Extra actions on the right (e.g. an "Add guest" button). Use size="m" buttons so they match the S search field (36 px). */
  actions?: ReactNode;
  /** Figma: State = Selected — shown when > 0 */
  selectedCount?: number;
  onClearSelection?: () => void;
  /** Bulk actions — size="m" buttons */
  bulkActions?: ReactNode;
}

export function TableToolbar({ title, count, search, onFilter, onExport, actions, selectedCount = 0, onClearSelection, bulkActions }: TableToolbarProps) {
  if (selectedCount > 0) {
    return (
      <div className="rhia-table-toolbar is-selected" role="toolbar" aria-label="Bulk actions">
        <span className="rhia-table-toolbar__selected" aria-live="polite">{selectedCount} selected</span>
        <Button variant="ghost" size="m" onClick={onClearSelection}>Clear</Button>
        <span className="rhia-table-toolbar__spacer" />
        {bulkActions}
      </div>
    );
  }
  return (
    <div className="rhia-table-toolbar">
      <h2 className="rhia-table-toolbar__title">{title}</h2>
      {count != null && <Badge size="s">{count}</Badge>}
      <span className="rhia-table-toolbar__spacer" />
      {search && (
        <Input size="s" leadingIcon={Search} aria-label={search.placeholder ?? 'Search'} placeholder={search.placeholder ?? 'Search'}
          value={search.value} onChange={(e) => search.onChange(e.target.value)} className="rhia-table-toolbar__search" />
      )}
      {onFilter && <Button variant="outlined" size="m" icon={Filter} iconPosition="left" onClick={onFilter}>Filter</Button>}
      {onExport && <Button variant="outlined" size="m" icon={Download} iconPosition="left" onClick={onExport}>Export</Button>}
      {actions}
    </div>
  );
}

export const PAGE_SIZES = [10, 25, 50, 100];

export interface TablePaginationProps {
  page: number;
  /** Rows per page. Default 10. */
  pageSize?: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Shows the "Rows per page" picker when set */
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

/** Figma: Table footer — range, rows per page, previous / next. Controls are 36 px (S select + M buttons). */
export function TablePagination({ page, pageSize = 10, total, onPageChange, onPageSizeChange, pageSizeOptions = PAGE_SIZES }: TablePaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? (page - 1) * pageSize + 1 : 0, to = Math.min(total, page * pageSize);
  const n = (x: number) => x.toLocaleString('en-GB');
  const sizeId = useId();
  return (
    <nav className="rhia-table-footer" aria-label="Pagination">
      <span className="rhia-table-footer__range">Showing {n(from)}–{n(to)} of {n(total)}</span>
      <span className="rhia-table-toolbar__spacer" />
      {onPageSizeChange && (
        <span className="rhia-table-footer__size">
          <label htmlFor={sizeId}>Rows per page</label>
          <span className="rhia-table-footer__select">
            <select id={sizeId} value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
              {pageSizeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={16} strokeWidth={1.5} aria-hidden />
          </span>
        </span>
      )}
      {onPageSizeChange && <span className="rhia-table-footer__divider" aria-hidden />}
      <Button variant="outlined" size="m" icon={ChevronLeft} iconPosition="only" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous page</Button>
      <span className="rhia-table-footer__page" aria-current="page">Page {n(page)} of {n(pages)}</span>
      <Button variant="outlined" size="m" icon={ChevronRight} iconPosition="only" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Next page</Button>
    </nav>
  );
}

export function TableEmpty({ title, description, icon: Icon = Search, action }: { title: string; description?: string; icon?: LucideIcon; action?: ReactNode }) {
  return (
    <div className="rhia-table-empty">
      <span className="rhia-table-empty__icon"><Icon size={20} strokeWidth={1.5} aria-hidden /></span>
      <p className="rhia-table-empty__title">{title}</p>
      {description && <p className="rhia-table-empty__desc">{description}</p>}
      {action}
    </div>
  );
}
