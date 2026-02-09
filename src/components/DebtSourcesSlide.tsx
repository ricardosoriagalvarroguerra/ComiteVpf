import type { DebtSourcesSlide as DebtSourcesSlideType } from '../types/slides';
import SimpleTableCard from './SimpleTableCard';

type DebtSourcesSlideProps = {
  slide: DebtSourcesSlideType;
};

const DebtSourcesSlide = ({ slide }: DebtSourcesSlideProps) => (
  <div className="debt-sources">
    <div className="debt-sources__header">
      <p className="debt-sources__eyebrow">{slide.eyebrow}</p>
      <h2 className="debt-sources__title">{slide.title}</h2>
      {slide.description && <p className="debt-sources__description">{slide.description}</p>}
    </div>
    <div className="debt-sources__tables">
      {slide.tables.map((table, index) => {
        const totalRow = table.rows.find((row) => row.isTotal);
        const totalColumnIndex = table.columns.findIndex((column) =>
          /total|monto/i.test(column.label)
        );
        const fallbackColumnIndex = table.columns.length > 1 ? 1 : 0;
        const valueIndex = totalColumnIndex >= 0 ? totalColumnIndex : fallbackColumnIndex;
        const headerTotal =
          totalRow && typeof totalRow.cells[valueIndex] === 'string'
            ? {
                label: 'Total (MM USD)',
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

export default DebtSourcesSlide;
