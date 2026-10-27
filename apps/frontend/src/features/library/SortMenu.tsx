import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { SiteSort, SortOrder } from '@entrelinhas/contracts';
import { Icon } from '../../components';

const SORTS: { value: SiteSort; label: string }[] = [
  { value: 'last_conversion', label: 'Última conversão' },
  { value: 'name', label: 'Nome do site' },
];

function orderOptions(sort: SiteSort): { value: SortOrder; label: string }[] {
  return sort === 'name'
    ? [
        { value: 'asc', label: 'A a Z' },
        { value: 'desc', label: 'Z a A' },
      ]
    : [
        { value: 'desc', label: 'Mais recentes primeiro' },
        { value: 'asc', label: 'Mais antigas primeiro' },
      ];
}

interface SortMenuProps {
  sort: SiteSort;
  order: SortOrder;
  onChange: (sort: SiteSort, order: SortOrder) => void;
}

// Menu button with two radio groups (frame 18). Escape closes and returns focus; arrows move.
export function SortMenu({ sort, order, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  const sortLabel = SORTS.find((s) => s.value === sort)?.label;
  const orders = orderOptions(sort);

  useEffect(() => {
    if (open) menu.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    button.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const items = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      items[(index + step + items.length) % items.length]?.focus();
    }
  };

  return (
    <div className="sort-menu">
      <button
        ref={button}
        type="button"
        className="el-button el-button--outline"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="visually-hidden">Ordenar: </span>
        {sortLabel}
        <Icon name="arrowDown" size={16} />
        <span className="visually-hidden">{`, ${orders.find((o) => o.value === order)?.label ?? ''}`}</span>
      </button>
      {open ? (
        <div ref={menu} id={id} role="menu" aria-label="Ordenar biblioteca" className="sort-menu__panel" onKeyDown={onKeyDown}>
          <p className="sort-menu__group" aria-hidden="true">
            Ordenar por
          </p>
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              role="menuitemradio"
              aria-checked={s.value === sort}
              tabIndex={-1}
              className="sort-menu__item"
              onClick={() => {
                onChange(s.value, orderOptions(s.value)[0]?.value ?? 'desc');
                close();
              }}
            >
              {s.label}
              {s.value === sort ? <Icon name="check" size={18} /> : null}
            </button>
          ))}
          <p className="sort-menu__group" aria-hidden="true">
            Sentido
          </p>
          {orders.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitemradio"
              aria-checked={o.value === order}
              tabIndex={-1}
              className="sort-menu__item"
              onClick={() => {
                onChange(sort, o.value);
                close();
              }}
            >
              {o.label}
              {o.value === order ? <Icon name="check" size={18} /> : null}
            </button>
          ))}
          <p className="sort-menu__note">Vale para todos os sites, inclusive os ainda não carregados.</p>
        </div>
      ) : null}
    </div>
  );
}
