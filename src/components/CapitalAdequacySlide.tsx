import type { CapitalAdequacySlide as CapitalAdequacySlideType } from '../types/slides';
import LineChartCard from './LineChartCard';

type CapitalAdequacySlideProps = {
  slide: CapitalAdequacySlideType;
};

const CapitalAdequacySlide = ({ slide }: CapitalAdequacySlideProps) => {
  return (
    <div className="capital-adequacy">
      <div className="capital-adequacy__top">
        <LineChartCard config={slide.chart} className="capital-adequacy__chart" enableFullscreen={false} />
        <article className="text-card capital-adequacy__text-card">
          <p className="text-card__eyebrow">{slide.eyebrow}</p>
          <h2 className="text-card__title">{slide.title}</h2>
          {slide.description && <p className="text-card__description">{slide.description}</p>}
          <p className="capital-adequacy__policy">{slide.policyText}</p>
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
            <thead>
              <tr>
                {slide.table.columns.map((column, index) => (
                  <th
                    key={`${column.label}-${index}`}
                    style={{
                      textAlign: column.align ?? (index === 0 ? 'left' : 'right'),
                      width: column.width
                    }}
                  >
                    {column.label}
                  </th>
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

                return (
                  <tr key={`capital-row-${rowIndex}`} className={rowClassName || undefined}>
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        key={`capital-cell-${rowIndex}-${cellIndex}`}
                        style={{
                          textAlign:
                            slide.table.columns[cellIndex]?.align ?? (cellIndex === 0 ? 'left' : 'right')
                        }}
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
    </div>
  );
};

export default CapitalAdequacySlide;
