import { Fragment } from 'react';
import type { CapitalAdequacySlide as CapitalAdequacySlideType } from '../types/slides';
import LineChartCard from './LineChartCard';

type CapitalAdequacySlideProps = {
  slide: CapitalAdequacySlideType;
};

type PeriodGroup = {
  yearLabel: string;
  valueColumn: CapitalAdequacySlideType['table']['columns'][number];
  deltaColumn?: CapitalAdequacySlideType['table']['columns'][number];
};

const POLICY_HIGHLIGHTS = [
  'FONPLATA',
  'límite mínimo de requerimiento de capital',
  'gestión integral de riesgos',
  '35%',
  'activos ajustados por los riesgos financieros y operacionales'
] as const;

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const renderPolicyText = (text: string) => {
  let markedText = text;
  POLICY_HIGHLIGHTS.forEach((phrase, index) => {
    const token = `__POLICY_HIGHLIGHT_${index}__`;
    markedText = markedText.replace(new RegExp(escapeRegExp(phrase), 'g'), token);
  });

  return markedText.split(/(__POLICY_HIGHLIGHT_\d+__)/g).map((part, index) => {
    const match = part.match(/^__POLICY_HIGHLIGHT_(\d+)__$/);
    if (!match) return <Fragment key={`policy-part-${index}`}>{part}</Fragment>;
    const phrase = POLICY_HIGHLIGHTS[Number(match[1])];
    return <strong key={`policy-part-${index}`}>{phrase}</strong>;
  });
};

const formatIntegerWithThousands = (value: number): string => {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  const abs = Math.abs(rounded).toString();
  return `${sign}${abs.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const formatOneDecimal = (value: number): string =>
  value.toLocaleString('es-ES', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

const parseCellNumber = (value: string): number | null => {
  const normalized = value.trim().replace(/\s+/g, '').replace(/\./g, '').replace(',', '.');

  if (!/^[-+]?\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatCapitalAdequacyCell = (cell: string, cellIndex: number, isRatioRow: boolean): string => {
  if (cellIndex === 0) return cell;
  if (!cell) return '—';

  const parsed = parseCellNumber(cell);
  if (parsed === null) return cell;

  const isValueColumn = cellIndex % 2 === 1;
  if (isRatioRow && isValueColumn) {
    return formatOneDecimal(parsed);
  }

  if (isValueColumn) {
    return formatIntegerWithThousands(parsed / 1000);
  }

  return formatIntegerWithThousands(parsed);
};

const CapitalAdequacySlide = ({ slide }: CapitalAdequacySlideProps) => {
  const conceptColumn = slide.table.columns[0];
  const periodGroups: PeriodGroup[] = [];
  for (let index = 1; index < slide.table.columns.length; index += 2) {
    const valueColumn = slide.table.columns[index];
    const deltaColumn = slide.table.columns[index + 1];
    if (!valueColumn) continue;
    periodGroups.push({
      yearLabel: valueColumn.label,
      valueColumn,
      deltaColumn
    });
  }

  return (
    <div className="capital-adequacy">
      <div className="capital-adequacy__top">
        <LineChartCard
          config={slide.chart}
          className="capital-adequacy__chart no-deuda-tooltip"
          enableFullscreen={false}
          tooltipFixed
          fixedTooltipEmptyOnIdle
          hideFixedTooltipOnLeave
        />
        <article className="text-card capital-adequacy__text-card">
          <p className="text-card__eyebrow">{slide.eyebrow}</p>
          <h2 className="text-card__title">{slide.title}</h2>
          {slide.description && <p className="text-card__description">{slide.description}</p>}
          <p className="capital-adequacy__policy">{renderPolicyText(slide.policyText)}</p>
        </article>
      </div>

      <section className="table-card capital-adequacy__table-card" aria-label={slide.table.title}>
        {slide.table.title && (
          <header className="table-card__header">
            <h3 className="table-card__title">{slide.table.title}</h3>
          </header>
        )}
        <div className="table-card__body">
          <table className="capital-adequacy-table">
            <colgroup>
              <col style={{ width: conceptColumn?.width ?? '22%' }} />
              {periodGroups.map((group) => (
                <Fragment key={`group-col-${group.yearLabel}`}>
                  <col />
                  {group.deltaColumn && <col />}
                </Fragment>
              ))}
            </colgroup>
            <thead>
              <tr className="capital-adequacy-table__head-row capital-adequacy-table__head-row--years">
                <th
                  rowSpan={2}
                  className="capital-adequacy-table__head-concept"
                  style={{ textAlign: conceptColumn?.align ?? 'left' }}
                >
                  {conceptColumn?.label ?? 'Concepto'}
                </th>
                {periodGroups.map((group) => (
                  <th
                    key={`head-year-${group.yearLabel}`}
                    className="capital-adequacy-table__head-year"
                    colSpan={group.deltaColumn ? 2 : 1}
                  >
                    {group.yearLabel}
                  </th>
                ))}
              </tr>
              <tr className="capital-adequacy-table__head-row capital-adequacy-table__head-row--metrics">
                {periodGroups.map((group) => (
                  <Fragment key={`head-metric-${group.yearLabel}`}>
                    <th className="capital-adequacy-table__head-metric">Valor</th>
                    {group.deltaColumn && (
                      <th className="capital-adequacy-table__head-metric capital-adequacy-table__head-metric--delta">
                        Δ %
                      </th>
                    )}
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {slide.table.rows.map((row, rowIndex) => {
                const rowClassName = [
                  row.isTotal ? 'capital-adequacy-table__row--total' : '',
                  row.className ?? ''
                ]
                  .filter(Boolean)
                  .join(' ');
                const isRatioRow = row.className?.includes('capital-adequacy-table__row-ratio') ?? false;

                return (
                  <tr key={`capital-row-${rowIndex}`} className={rowClassName || undefined}>
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        key={`capital-cell-${rowIndex}-${cellIndex}`}
                        style={{
                          textAlign:
                            slide.table.columns[cellIndex]?.align ?? (cellIndex === 0 ? 'left' : 'right')
                        }}
                        className={
                          cellIndex > 0 && cellIndex % 2 === 0
                            ? 'capital-adequacy-table__cell capital-adequacy-table__cell--delta'
                            : 'capital-adequacy-table__cell'
                        }
                      >
                        {formatCapitalAdequacyCell(cell, cellIndex, isRatioRow)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CapitalAdequacySlide;
