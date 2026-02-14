import { useState } from 'react';
import type { SimpleTable, SimpleTableColumn } from '../types/slides';

type SimpleTableCardProps = {
  table: SimpleTable;
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
  headerTotal?: {
    label: string;
    value: string;
  };
};

const resolveAlign = (column: SimpleTableColumn, index: number) => {
  if (column.align) return column.align;
  return index === 0 ? 'left' : 'right';
};

const SimpleTableCard = ({
  table,
  className,
  isCollapsed = false,
  onToggle,
  headerTotal
}: SimpleTableCardProps) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [pinnedRow, setPinnedRow] = useState<number | null>(null);

  return (
    <section
      className={`table-card simple-table-card${isCollapsed ? ' is-collapsed' : ''}${
        className ? ` ${className}` : ''
      }`}
    >
      {table.title && (
        <header className="table-card__header">
          <div>
            {onToggle ? (
              <button type="button" className="simple-table-card__toggle" onClick={onToggle}>
                <span className="table-card__title">{table.title}</span>
                <span className="simple-table-card__caret" aria-hidden="true">
                  {isCollapsed ? '▾' : '▴'}
                </span>
              </button>
            ) : (
              <h3 className="table-card__title">{table.title}</h3>
            )}
          </div>
          {headerTotal && (
            <div className="table-card__total">
              <span>{headerTotal.label}</span>
              <strong>{headerTotal.value}</strong>
            </div>
          )}
        </header>
      )}
      <div className="table-card__body">
        <table className="simple-table">
          <thead>
            <tr>
              {table.columns.map((column, index) => (
                <th
                  key={`${column.label}-${index}`}
                  style={{ textAlign: resolveAlign(column, index), width: column.width }}
                >
                  {column.label.includes('\n') ? (
                    <span className="simple-table__th-multiline">
                      {column.label.split('\n').map((line, lineIndex) => (
                        <span
                          key={`${column.label}-${lineIndex}`}
                          className={lineIndex === 0 ? 'simple-table__th-tag' : 'simple-table__th-line'}
                        >
                          {line}
                        </span>
                      ))}
                    </span>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => {
              const isPinned = pinnedRow === rowIndex;
              const isActive = isPinned || hoveredRow === rowIndex;
              const rowClassName = [
                row.isTotal ? 'simple-table__row--total' : '',
                row.className ?? '',
                isActive ? 'is-row-active' : '',
                isPinned ? 'is-row-pinned' : ''
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <tr
                  key={`row-${rowIndex}`}
                  className={rowClassName || undefined}
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow((prev) => (prev === rowIndex ? null : prev))}
                  onClick={() => setPinnedRow((prev) => (prev === rowIndex ? null : rowIndex))}
                >
                  {row.cells.map((cell, cellIndex) => (
                    <td
                      key={`cell-${rowIndex}-${cellIndex}`}
                      style={{ textAlign: resolveAlign(table.columns[cellIndex], cellIndex) }}
                      data-label={table.columns[cellIndex]?.label ?? ''}
                    >
                      {cell || '—'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SimpleTableCard;
