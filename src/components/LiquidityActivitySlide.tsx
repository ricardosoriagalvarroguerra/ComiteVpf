import { useMemo, useState } from 'react';
import type { SlideDefinition } from '../types/slides';
import DonutChart from './DonutChart';
import TextCard from './TextCard';

type Props = {
  slide: Extract<SlideDefinition, { type: 'liquidity-activity' }>;
};

const LiquidityActivitySlide = ({ slide }: Props) => {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [hoveredLegendId, setHoveredLegendId] = useState<string | null>(null);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [pinnedCol, setPinnedCol] = useState<number | null>(null);
  const [hoverRow, setHoverRow] = useState<string | null>(null);
  const [pinnedRow, setPinnedRow] = useState<string | null>(null);

  const activeCol = pinnedCol ?? hoverCol;
  const activeRow = pinnedRow ?? hoverRow;

  const galleryItems = slide.donutGallery.items;
  const activeGallery = galleryItems[activeGalleryIndex] ?? galleryItems[0];

  const activeColLabel =
    activeCol != null && activeCol >= 0 && activeCol < slide.table.columns.length
      ? slide.table.columns[activeCol]
      : null;

  const handlePrev = () => {
    setHoveredLegendId(null);
    setActiveGalleryIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  const handleNext = () => {
    setHoveredLegendId(null);
    setActiveGalleryIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const formatPercent = useMemo(
    () =>
      new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }),
    []
  );

  return (
    <div className="liquidity-activity__page">
      <div className="liquidity-activity liquidity-activity__layout" aria-label="Gráficos y tabla">
        <TextCard
          eyebrow={slide.eyebrow}
          title={slide.title}
          highlights={slide.highlights}
          description="Resumen del portafolio y señales clave del trimestre."
        />
        <div className="liquidity-activity__stack" aria-label="Gráfico y tabla">
          <section className="chart-card liquidity-gallery" aria-label={slide.donutGallery.title}>
        <div className="chart-card__header">
          <div>
            <div className="liquidity-gallery__subtitle-row">
              <p className="chart-card__eyebrow">{slide.donutGallery.subtitle}</p>
            </div>
            <h3>{slide.donutGallery.title}</h3>
          </div>
          <div className="liquidity-gallery__controls" aria-label="Navegación de gráficos">
            <button
              type="button"
              className="liquidity-gallery__nav-btn"
              onClick={handlePrev}
              aria-label="Gráfico anterior"
            >
              ‹
            </button>
            <div className="liquidity-gallery__dots" role="tablist" aria-label="Selección de gráfico">
              {galleryItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`liquidity-gallery__dot${index === activeGalleryIndex ? ' is-active' : ''}`}
                  onClick={() => {
                    setHoveredLegendId(null);
                    setActiveGalleryIndex(index);
                  }}
                  aria-label={item.title}
                  aria-pressed={index === activeGalleryIndex}
                />
              ))}
            </div>
            <button
              type="button"
              className="liquidity-gallery__nav-btn"
              onClick={handleNext}
              aria-label="Gráfico siguiente"
            >
              ›
            </button>
          </div>
        </div>
        <div className="chart-card__body">
            <div className="liquidity-gallery__body">
            <div className="liquidity-gallery__chart">
              <DonutChart
                data={activeGallery.data}
                enableFullscreen={false}
                format="percent"
                showCenter={false}
                showSegmentLabels={true}
                externalHoveredId={hoveredLegendId}
              />
            </div>
            <div className="liquidity-gallery__legend-panel">
              <p className="liquidity-gallery__subtitle">{activeGallery.title}</p>
              <div className="liquidity-gallery__legend" role="list" aria-label="Leyenda">
                {activeGallery.data.map((item) => (
                  <div
                    key={item.id}
                    className={`liquidity-gallery__legend-item${hoveredLegendId === item.id ? ' is-active' : ''}`}
                    role="listitem"
                    onMouseEnter={() => setHoveredLegendId(item.id)}
                    onMouseLeave={() => setHoveredLegendId(null)}
                  >
                    <span
                      className="liquidity-gallery__legend-swatch"
                      style={{ background: item.color }}
                      aria-hidden="true"
                    />
                    <span className="liquidity-gallery__legend-label">{item.label}</span>
                    <span className="liquidity-gallery__legend-value">
                      {formatPercent.format(item.value)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
          </section>

          <section className="table-card liquidity-activity__table" aria-label={slide.table.title}>
        <header className="table-card__header">
          <div>
            <h3 className="table-card__title">{slide.table.title}</h3>
          </div>
          <div className="liquidity-activity__table-meta" aria-label="Columna seleccionada">
            <span>Columna</span>
            <strong>{activeColLabel ?? '—'}</strong>
          </div>
        </header>
        <div className="table-card__body">
          <table className="metric-table">
            <thead>
              <tr>
              {slide.table.columns.map((column, index) => {
                const isActive = activeCol === index;
                  const isPinned = pinnedCol === index;
                  return (
                    <th
                      key={column}
                      className={`metric-table__col-header${isActive ? ' is-active' : ''}${
                        isPinned ? ' is-pinned' : ''
                      }`}
                      onMouseEnter={() => setHoverCol(index)}
                      onMouseLeave={() => setHoverCol(null)}
                      onClick={() => setPinnedCol((prev) => (prev === index ? null : index))}
                      role="button"
                      tabIndex={0}
                    >
                      {column}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {slide.table.rows.map((row) => {
                const rowKey = `${row.ticker}-${row.position}`;
                const isRowActive = activeRow === rowKey;
                const isRowPinned = pinnedRow === rowKey;
                const rowClassName = `${isRowActive ? ' is-row-active' : ''}${
                  isRowPinned ? ' is-row-pinned' : ''
                }${row.isTotal ? ' liquidity-activity__row--total' : ''}`;
                return (
                  <tr
                    key={rowKey}
                    className={rowClassName}
                    onMouseEnter={() => setHoverRow(rowKey)}
                    onMouseLeave={() => setHoverRow(null)}
                    onClick={() => setPinnedRow((prev) => (prev === rowKey ? null : rowKey))}
                    role="button"
                    tabIndex={0}
                  >
                    <td className={`metric-table__metric${activeCol === 0 ? ' is-col-active' : ''}`}>
                      {row.ticker}
                    </td>
                    {[row.region, row.sector, row.rating, row.position, row.liquidity].map((value, index) => {
                      const isColActive = activeCol === index + 1;
                      return (
                        <td
                          key={`${rowKey}-${index}`}
                          className={`metric-table__value${isColActive ? ' is-col-active' : ''}`}
                        >
                          {value || '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LiquidityActivitySlide;
