import type { DebtSourcesSlide as DebtSourcesSlideType } from '../types/slides';
import SimpleTableCard from './SimpleTableCard';

type DebtSourcesSlideProps = {
  slide: DebtSourcesSlideType;
};

const parseSpanishNumber = (value: string) => {
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatSpanishNumber = (value: number) =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
    value
  );

const resolveTotalColumnIndex = (table: DebtSourcesSlideType['tables'][number]) => {
  const circulanteColumnIndex = table.columns.findIndex((column) => /circulante/i.test(column.label));
  if (circulanteColumnIndex >= 0) {
    return circulanteColumnIndex;
  }

  const totalColumnIndex = table.columns.findIndex((column) => /total|monto/i.test(column.label));
  if (totalColumnIndex >= 0) {
    return totalColumnIndex;
  }

  return table.columns.length > 1 ? 1 : 0;
};

const DebtSourcesSlide = ({ slide }: DebtSourcesSlideProps) => {
  const grandTotalLabel =
    slide.id === 'proyecciones-desembolsos' ? 'Total Desembolsos' : 'Total endeudamiento (USD mm)';
  const totalEndeudamiento = slide.tables.reduce((sum, table) => {
    const totalRow = table.rows.find((row) => row.isTotal);
    const valueIndex = resolveTotalColumnIndex(table);
    const value = totalRow && typeof totalRow.cells[valueIndex] === 'string'
      ? parseSpanishNumber(totalRow.cells[valueIndex])
      : 0;
    return sum + value;
  }, 0);

  return (
    <div className="debt-sources">
      <div className="debt-sources__header">
        <div>
          <p className="debt-sources__eyebrow">{slide.eyebrow}</p>
          <h2 className="debt-sources__title">{slide.title}</h2>
          {slide.description && <p className="debt-sources__description">{slide.description}</p>}
        </div>
        <div className="debt-sources__grand-total">
          <span>{grandTotalLabel}</span>
          <strong>{formatSpanishNumber(totalEndeudamiento)}</strong>
        </div>
      </div>
      <div className="debt-sources__tables">
        {slide.tables.map((table, index) => {
          const totalRow = table.rows.find((row) => row.isTotal);
          const valueIndex = resolveTotalColumnIndex(table);
          const headerTotal =
            totalRow && typeof totalRow.cells[valueIndex] === 'string'
              ? {
                  label: 'Total (USD mm)',
                  value: totalRow.cells[valueIndex]
                }
              : undefined;

          return (
            <SimpleTableCard
              key={`${table.title ?? 'table'}-${index}`}
              table={table}
              headerTotal={headerTotal}
            />
          );
        })}
      </div>
      {slide.hint && <div className="debt-sources__hint">{slide.hint}</div>}
    </div>
  );
};

export default DebtSourcesSlide;
