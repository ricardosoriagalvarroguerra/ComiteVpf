import { useMemo, useState } from 'react';
import type { SlideDefinition } from '../types/slides';
import DonutChart from './DonutChart';

type Props = {
  slide: Extract<SlideDefinition, { type: 'liquidity-activity' }>;
};

const LiquidityActivitySlide = ({ slide }: Props) => {
  const [hoveredLegendByChartId, setHoveredLegendByChartId] = useState<Record<string, string | null>>({});
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [pinnedCol, setPinnedCol] = useState<number | null>(null);
  const [hoverRow, setHoverRow] = useState<string | null>(null);
  const [pinnedRow, setPinnedRow] = useState<string | null>(null);

  const activeCol = pinnedCol ?? hoverCol;
  const activeRow = pinnedRow ?? hoverRow;
  const galleryItems = slide.donutGallery.items;

  const ratingItem = galleryItems.find((item) => item.id === 'calificacion') ?? galleryItems[0] ?? null;
  const sectorItem =
    galleryItems.find((item) => item.id === 'sector') ??
    galleryItems.find((item) => item.id !== ratingItem?.id) ??
    null;
  const regionItem =
    galleryItems.find((item) => item.id === 'region') ??
    galleryItems.find((item) => item.id !== ratingItem?.id && item.id !== sectorItem?.id) ??
    null;

  const activeColLabel =
    activeCol != null && activeCol >= 0 && activeCol < slide.table.columns.length
      ? slide.table.columns[activeCol]
      : null;

  const formatPercent = useMemo(
    () =>
      new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }),
    []
  );

  const setLegendHover = (chartId: string, legendId: string | null) =>
    setHoveredLegendByChartId((prev) => ({
      ...prev,
      [chartId]: legendId
    }));

  const renderDonutCard = (
    item: NonNullable<Extract<SlideDefinition, { type: 'liquidity-activity' }>['donutGallery']['items'][number]>,
    className?: string
  ) => (
    <section key={item.id} className={`chart-card liquidity-activity__donut-card${className ? ` ${className}` : ''}`}>
      <div className="chart-card__header">
        <h3>{item.title}</h3>
      </div>
      <div className="chart-card__body">
        <div className="liquidity-gallery__body">
          <div className="liquidity-gallery__chart">
            <DonutChart
              data={item.data}
              enableFullscreen={false}
              format="percent"
              showCenter={false}
              showSegmentLabels
              externalHoveredId={hoveredLegendByChartId[item.id] ?? null}
            />
          </div>
          <div className="liquidity-gallery__legend-panel">
            <div className="liquidity-gallery__legend" role="list" aria-label={`Leyenda ${item.title}`}>
              {item.data.map((legendItem) => (
                <div
                  key={legendItem.id}
                  className={`liquidity-gallery__legend-item${
                    hoveredLegendByChartId[item.id] === legendItem.id ? ' is-active' : ''
                  }`}
                  role="listitem"
                  onMouseEnter={() => setLegendHover(item.id, legendItem.id)}
                  onMouseLeave={() => setLegendHover(item.id, null)}
                >
                  <span
                    className="liquidity-gallery__legend-swatch"
                    style={{ background: legendItem.color }}
                    aria-hidden="true"
                  />
                  <span className="liquidity-gallery__legend-label">{legendItem.label}</span>
                  <span className="liquidity-gallery__legend-value">{formatPercent.format(legendItem.value)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="liquidity-activity__page">
      <div className="liquidity-activity liquidity-activity--table-first" aria-label="Gráficos y tabla">
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
                      <td
                        className={`metric-table__metric${activeCol === 0 ? ' is-col-active' : ''}`}
                        data-label={slide.table.columns[0] ?? 'Ticker'}
                      >
                        {row.ticker}
                      </td>
                      {[row.region, row.sector, row.rating, row.position, row.liquidity].map((value, index) => {
                        const isColActive = activeCol === index + 1;
                        return (
                          <td
                            key={`${rowKey}-${index}`}
                            className={`metric-table__value${isColActive ? ' is-col-active' : ''}`}
                            data-label={slide.table.columns[index + 1] ?? ''}
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

        <div className="liquidity-activity__donut-layout" aria-label={slide.donutGallery.title}>
          <div className="liquidity-activity__donut-column">
            {sectorItem ? renderDonutCard(sectorItem, 'liquidity-activity__donut-card--sector') : null}
            {regionItem ? renderDonutCard(regionItem, 'liquidity-activity__donut-card--region') : null}
          </div>
          {ratingItem ? renderDonutCard(ratingItem, 'liquidity-activity__donut-card--rating') : null}
        </div>
      </div>
    </div>
  );
};

export default LiquidityActivitySlide;
