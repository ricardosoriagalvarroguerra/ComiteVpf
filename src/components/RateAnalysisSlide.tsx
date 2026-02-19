import { useMemo, useState } from 'react';
import type { RateAnalysisSlide as RateAnalysisSlideType } from '../types/slides';
import StackedBarChartCard from './StackedBarChartCard';
import TextCard from './TextCard';

type RateAnalysisSlideProps = {
  slide: RateAnalysisSlideType;
};

const RateAnalysisSlide = ({ slide }: RateAnalysisSlideProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const isPerfilAmortizacionSlide = slide.id === 'perfil-amortizacion';
  const isAnalisisTasasSlide = slide.id === 'analisis-tasas';
  const [selectedSeriesByChart, setSelectedSeriesByChart] = useState<Record<string, string[]>>(() =>
    slide.charts.reduce<Record<string, string[]>>((acc, chartItem) => {
      acc[chartItem.id] = chartItem.chart.series.map((series) => series.id);
      return acc;
    }, {})
  );
  const galleryItems = slide.charts;
  const activeItem = galleryItems[activeIndex] ?? galleryItems[0];

  const selectedSeries = useMemo(() => {
    if (!activeItem) return [];
    return selectedSeriesByChart[activeItem.id] ?? activeItem.chart.series.map((series) => series.id);
  }, [activeItem, selectedSeriesByChart]);

  const toggleSeriesByChart = (chartId: string, chartSeriesIds: string[], seriesId: string) => {
    setSelectedSeriesByChart((prev) => {
      const current = prev[chartId] ?? chartSeriesIds;
      if (current.includes(seriesId)) {
        const next = current.filter((item) => item !== seriesId);
        return {
          ...prev,
          [chartId]: next.length === 0 ? current : next
        };
      }
      return {
        ...prev,
        [chartId]: [...current, seriesId]
      };
    });
  };

  const toggleSeries = (seriesId: string) => {
    if (!activeItem) return;
    toggleSeriesByChart(
      activeItem.id,
      activeItem.chart.series.map((series) => series.id),
      seriesId
    );
  };

  const getFilteredChartBySelection = (
    chartItem: (typeof slide.charts)[number]
  ): (typeof slide.charts)[number]['chart'] => {
    const allSeriesIds = chartItem.chart.series.map((series) => series.id);
    const selectedForChart = selectedSeriesByChart[chartItem.id] ?? allSeriesIds;
    const activeSeries = chartItem.chart.series.filter((series) => selectedForChart.includes(series.id));
    const activeSeriesIds = new Set(activeSeries.map((series) => series.id));
    const data = chartItem.chart.data.map((datum) => {
      const values: Record<string, number> = {};
      Object.entries(datum.values).forEach(([key, value]) => {
        if (activeSeriesIds.has(key)) {
          values[key] = value;
        }
      });
      return { ...datum, values };
    });
    return {
      ...chartItem.chart,
      series: activeSeries,
      data
    };
  };

  const filteredChart = useMemo(() => {
    if (!activeItem) return null;
    return getFilteredChartBySelection(activeItem);
  }, [activeItem, selectedSeriesByChart]);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % galleryItems.length);
  };

  if (isPerfilAmortizacionSlide) {
    const amortizacionItem = slide.charts.find((item) => item.id === 'amortizacion') ?? slide.charts[0];
    const flujosItem = slide.charts.find((item) => item.id === 'flujos');
    const stockItem = slide.charts.find((item) => item.id === 'stock');
    const secondaryItems = [flujosItem, stockItem].filter(
      (
        item
      ): item is {
        id: string;
        label: string;
        chart: (typeof slide.charts)[number]['chart'];
      } => Boolean(item)
    );

    return (
      <div className="rate-analysis rate-analysis--perfil">
        <header className="rate-analysis__header">
          {slide.eyebrow && <p className="rate-analysis__eyebrow">{slide.eyebrow}</p>}
          <div className="rate-analysis__title-row">
            <h2 className="rate-analysis__title">{slide.title}</h2>
            <p className="rate-analysis__title-note">Plazo P.P (en años): 4,18</p>
          </div>
        </header>
        <div className="rate-analysis__perfil-grid">
          {amortizacionItem && (
            <StackedBarChartCard
              config={amortizacionItem.chart}
              showLegend={false}
              tooltipFixed
              className="rate-analysis__perfil-top"
            />
          )}
          <div className="rate-analysis__perfil-bottom">
            {secondaryItems.map((item) => (
              <StackedBarChartCard
                key={item.id}
                config={item.chart}
                showLegend={false}
                tooltipFixed
                className="rate-analysis__perfil-card"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isAnalisisTasasSlide) {
    const soberanaItem = slide.charts.find((item) => item.id === 'soberana') ?? slide.charts[0];
    const noSoberanaItem =
      slide.charts.find((item) => item.id === 'no-soberana') ??
      slide.charts.find((item) => item.id !== soberanaItem?.id);
    const soberanaChart = soberanaItem ? getFilteredChartBySelection(soberanaItem) : null;
    const noSoberanaChart = noSoberanaItem ? getFilteredChartBySelection(noSoberanaItem) : null;

    return (
      <div className="rate-analysis rate-analysis--split">
        <TextCard
          eyebrow={slide.eyebrow}
          title={slide.title}
          description={slide.description}
          highlights={slide.highlights}
          highlightEmphasisPrefixes={slide.highlightEmphasisPrefixes}
          highlightHeadingItems={slide.highlightHeadingItems}
        />
        <div className="rate-analysis__split-stack" aria-label="Galería de gráficos">
          {soberanaItem ? (
            <StackedBarChartCard
              config={soberanaChart ?? soberanaItem.chart}
              showLegend={false}
              className="rate-analysis__split-card rate-analysis__split-card--soberana"
              headerExtras={
                <div className="rate-analysis__filters" aria-label="Categorías Riesgo soberano">
                  {soberanaItem.chart.series.map((series) => {
                    const selectedForChart =
                      selectedSeriesByChart[soberanaItem.id] ??
                      soberanaItem.chart.series.map((item) => item.id);
                    const isChecked = selectedForChart.includes(series.id);
                    return (
                      <label key={series.id} className="rate-analysis__filter">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            toggleSeriesByChart(
                              soberanaItem.id,
                              soberanaItem.chart.series.map((item) => item.id),
                              series.id
                            )
                          }
                        />
                        <span
                          className="rate-analysis__filter-swatch"
                          style={{ background: series.color ?? 'currentColor' }}
                        />
                        <span>{series.label}</span>
                      </label>
                    );
                  })}
                </div>
              }
            />
          ) : null}
          {noSoberanaItem ? (
            <StackedBarChartCard
              config={noSoberanaChart ?? noSoberanaItem.chart}
              showLegend={false}
              className="rate-analysis__split-card rate-analysis__split-card--no-soberana"
              headerExtras={
                <div className="rate-analysis__filters" aria-label="Categorías Riesgo no soberano">
                  {noSoberanaItem.chart.series.map((series) => {
                    const selectedForChart =
                      selectedSeriesByChart[noSoberanaItem.id] ??
                      noSoberanaItem.chart.series.map((item) => item.id);
                    const isChecked = selectedForChart.includes(series.id);
                    return (
                      <label key={series.id} className="rate-analysis__filter">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            toggleSeriesByChart(
                              noSoberanaItem.id,
                              noSoberanaItem.chart.series.map((item) => item.id),
                              series.id
                            )
                          }
                        />
                        <span
                          className="rate-analysis__filter-swatch"
                          style={{ background: series.color ?? 'currentColor' }}
                        />
                        <span>{series.label}</span>
                      </label>
                    );
                  })}
                </div>
              }
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rate-analysis">
      <TextCard
        eyebrow={slide.eyebrow}
        title={slide.title}
        description={slide.description}
        highlights={slide.highlights}
        highlightEmphasisPrefixes={slide.highlightEmphasisPrefixes}
        highlightHeadingItems={slide.highlightHeadingItems}
      />
      <div className="rate-analysis__gallery" aria-label="Galería de gráficos">
        <div className="rate-analysis__gallery-body">
          {filteredChart && (
            <StackedBarChartCard
              config={filteredChart}
              showLegend={false}
              tooltipFixed={isPerfilAmortizacionSlide}
              footer={
                <div
                  className="rate-analysis__gallery-controls chart-gallery__controls"
                  aria-label="Navegación de gráficos"
                >
                  <button
                    type="button"
                    className="chart-gallery__nav-btn"
                    onClick={goPrev}
                    aria-label="Gráfico anterior"
                  >
                    ‹
                  </button>
                  <div className="chart-gallery__dots" role="tablist" aria-label="Selección de gráfico">
                    {galleryItems.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`chart-gallery__dot${index === activeIndex ? ' is-active' : ''}`}
                        onClick={() => setActiveIndex(index)}
                        aria-label={item.label}
                        aria-pressed={index === activeIndex}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="chart-gallery__nav-btn"
                    onClick={goNext}
                    aria-label="Gráfico siguiente"
                  >
                    ›
                  </button>
                </div>
              }
              headerExtras={
                activeItem && (
                  <div className="rate-analysis__filters" aria-label="Categorías">
                    {activeItem.chart.series.map((series) => (
                      <label key={series.id} className="rate-analysis__filter">
                        <input
                          type="checkbox"
                          checked={selectedSeries.includes(series.id)}
                          onChange={() => toggleSeries(series.id)}
                        />
                        <span
                          className="rate-analysis__filter-swatch"
                          style={{ background: series.color ?? 'currentColor' }}
                        />
                        <span>{series.label}</span>
                      </label>
                    ))}
                  </div>
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RateAnalysisSlide;
