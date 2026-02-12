import { useMemo, useState } from 'react';
import type { SlideDefinition } from '../types/slides';
import ChartCard from './ChartCard';
import DonutChart from './DonutChart';
import TextCard from './TextCard';

type Props = {
  slide: Extract<SlideDefinition, { type: 'investment-portfolio' }>;
};

const InvestmentPortfolioSlide = ({ slide }: Props) => {
  const formatPercent = useMemo(
    () =>
      new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }),
    []
  );

  const assetTotal = useMemo(
    () => slide.assetClasses.reduce((sum, item) => sum + (item.value ?? 0), 0),
    [slide.assetClasses]
  );

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [pinnedCol, setPinnedCol] = useState<number | null>(null);
  const activeCol = pinnedCol ?? hoverCol;

  const [hoverRow, setHoverRow] = useState<string | null>(null);
  const [pinnedRow, setPinnedRow] = useState<string | null>(null);
  const activeRow = pinnedRow ?? hoverRow;
  const [assetLegendHoveredId, setAssetLegendHoveredId] = useState<string | null>(null);

  const activeColLabel =
    activeCol != null && activeCol >= 0 && activeCol < slide.table.columns.length
      ? slide.table.columns[activeCol]
      : null;
  const activeRowData = activeRow
    ? slide.table.rows.find((row) => row.metric === activeRow) ?? null
    : null;
  const activeCellValue =
    activeRowData && activeCol != null ? (activeRowData.values[activeCol] || '—') : null;
  const activeMonthLabel = activeColLabel ? activeColLabel.toUpperCase() : null;
  const activeTableSummary =
    activeRowData && activeMonthLabel
      ? `${activeRowData.metric} ${activeCellValue ?? '—'} ${activeMonthLabel}`
      : activeMonthLabel ?? '—';

  const galleryItems = [
    {
      id: 'asset-classes',
      title: 'Clases de activos',
      eyebrow: 'Participación',
      render: (
        <>
          <div className="chart-card__body">
            <div className="liquidity-gallery__body">
              <div className="liquidity-gallery__chart">
                <DonutChart
                  data={slide.assetClasses}
                  externalHoveredId={assetLegendHoveredId}
                  enableFullscreen={false}
                  format={slide.assetChartFormat}
                  showCenter={slide.assetChartShowCenter}
                  showSegmentLabels={slide.id !== 'cartera-inversiones-fonplata'}
                />
              </div>
              <div className="liquidity-gallery__legend" role="list" aria-label="Leyenda">
                {slide.assetClasses.map((item) => {
                  const percentValue =
                    slide.assetChartFormat === 'percent'
                      ? item.value
                      : assetTotal > 0
                        ? (item.value / assetTotal) * 100
                        : 0;
                  return (
                    <div
                      key={item.id}
                      className={`liquidity-gallery__legend-item${
                        assetLegendHoveredId === item.id ? ' is-active' : ''
                      }`}
                      role="listitem"
                      tabIndex={0}
                      onMouseEnter={() => setAssetLegendHoveredId(item.id)}
                      onMouseLeave={() => setAssetLegendHoveredId((prev) => (prev === item.id ? null : prev))}
                      onFocus={() => setAssetLegendHoveredId(item.id)}
                      onBlur={() => setAssetLegendHoveredId((prev) => (prev === item.id ? null : prev))}
                    >
                      <span
                        className="liquidity-gallery__legend-swatch"
                        style={{ background: item.color }}
                        aria-hidden="true"
                      />
                      <span className="liquidity-gallery__legend-label">{item.label}</span>
                      <span className="liquidity-gallery__legend-value">
                        {formatPercent.format(percentValue)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'maturity-profile',
      title: slide.maturityProfile.title,
      eyebrow: slide.maturityProfile.subtitle,
      render: (
        <div className="investment-portfolio__embedded-chart">
          <ChartCard config={slide.maturityProfile} enableFullscreen={false} variant="plain" hideHeader />
        </div>
      )
    }
  ];

  const activeGallery = galleryItems[activeGalleryIndex] ?? galleryItems[0];

  return (
    <div className="investment-portfolio">
      <div className="investment-portfolio__top">
        <TextCard
          eyebrow={slide.eyebrow}
          title={slide.title}
          description={slide.description}
          highlights={slide.highlights}
          highlightEmphasisPrefixes={
            slide.id === 'cartera-inversiones-fonplata'
              ? [
                  'Metodología time-weighted:',
                  'Tasas efectivas del período:',
                  'Base del índice:',
                  'Benchmark Bloomberg:'
                ]
              : undefined
          }
          infoPopover={slide.infoPopover}
        />
        <div className="investment-portfolio__charts investment-portfolio__gallery">
          <section className="chart-card investment-portfolio__gallery-card" aria-label={activeGallery.title}>
            <div className="chart-card__header">
              <div>
                <p className="chart-card__eyebrow">{activeGallery.eyebrow}</p>
                <h3>{activeGallery.title}</h3>
              </div>
              <div className="chart-gallery__controls" aria-label="Navegación de gráficos">
                <button
                  type="button"
                  className="chart-gallery__nav-btn"
                  onClick={() =>
                    setActiveGalleryIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)
                  }
                  aria-label="Gráfico anterior"
                >
                  ‹
                </button>
                <div className="chart-gallery__dots" role="tablist" aria-label="Selección de gráfico">
                  {galleryItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`chart-gallery__dot${index === activeGalleryIndex ? ' is-active' : ''}`}
                      onClick={() => setActiveGalleryIndex(index)}
                      aria-label={item.title}
                      aria-pressed={index === activeGalleryIndex}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="chart-gallery__nav-btn"
                  onClick={() => setActiveGalleryIndex((prev) => (prev + 1) % galleryItems.length)}
                  aria-label="Gráfico siguiente"
                >
                  ›
                </button>
              </div>
            </div>
            {activeGallery.render}
          </section>
        </div>
      </div>

      <section className="table-card investment-portfolio__table" aria-label={slide.table.title}>
        <header className="table-card__header">
          <div>
            <h3 className="table-card__title">{slide.table.title}</h3>
          </div>
          <div className="investment-portfolio__table-meta" aria-label="Valor seleccionado">
            <span className="investment-portfolio__table-meta-label">Valor</span>
            <span className="investment-portfolio__table-meta-value">{activeTableSummary}</span>
          </div>
        </header>
        <div className="table-card__body">
          <table className="metric-table">
            <thead>
              <tr>
                <th>Métrica</th>
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
                const rowKey = row.metric;
                const isRowActive = activeRow === rowKey;
                const isRowPinned = pinnedRow === rowKey;
                return (
                  <tr
                    key={rowKey}
                    className={`${isRowActive ? ' is-row-active' : ''}${isRowPinned ? ' is-row-pinned' : ''}`}
                    onMouseEnter={() => setHoverRow(rowKey)}
                    onMouseLeave={() => setHoverRow(null)}
                    onClick={() => setPinnedRow((prev) => (prev === rowKey ? null : rowKey))}
                    role="button"
                    tabIndex={0}
                  >
                    <td className="metric-table__metric" data-label="Métrica">
                      {row.metric}
                    </td>
                    {row.values.map((value, index) => {
                      const isColActive = activeCol === index;
                      return (
                        <td
                          key={`${rowKey}-${index}`}
                          className={`metric-table__value${isColActive ? ' is-col-active' : ''}`}
                          onMouseEnter={() => setHoverCol(index)}
                          onMouseLeave={() => setHoverCol((prev) => (prev === index ? null : prev))}
                          data-label={slide.table.columns[index] ?? ''}
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
  );
};

export default InvestmentPortfolioSlide;
