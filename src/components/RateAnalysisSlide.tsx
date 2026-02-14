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

  const toggleSeries = (seriesId: string) => {
    if (!activeItem) return;
    setSelectedSeriesByChart((prev) => {
      const current = prev[activeItem.id] ?? activeItem.chart.series.map((series) => series.id);
      if (current.includes(seriesId)) {
        const next = current.filter((item) => item !== seriesId);
        return {
          ...prev,
          [activeItem.id]: next.length === 0 ? current : next
        };
      }
      return {
        ...prev,
        [activeItem.id]: [...current, seriesId]
      };
    });
  };

  const filteredChart = useMemo(() => {
    if (!activeItem) return null;
    const activeSeries = activeItem.chart.series.filter((series) => selectedSeries.includes(series.id));
    const activeSeriesIds = new Set(activeSeries.map((series) => series.id));
    const data = activeItem.chart.data.map((datum) => {
      const values: Record<string, number> = {};
      Object.entries(datum.values).forEach(([key, value]) => {
        if (activeSeriesIds.has(key)) {
          values[key] = value;
        }
      });
      return { ...datum, values };
    });
    return {
      ...activeItem.chart,
      series: activeSeries,
      data
    };
  }, [activeItem, selectedSeries]);

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
          <h2 className="rate-analysis__title">{slide.title}</h2>
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

    return (
      <div className="rate-analysis rate-analysis--split">
        <TextCard
          eyebrow={slide.eyebrow}
          title={slide.title}
          description={slide.description}
          highlights={slide.highlights}
        />
        <div className="rate-analysis__split-stack" aria-label="Galería de gráficos">
          {soberanaItem ? (
            <StackedBarChartCard
              config={soberanaItem.chart}
              showLegend={false}
              className="rate-analysis__split-card rate-analysis__split-card--soberana"
            />
          ) : null}
          {noSoberanaItem ? (
            <StackedBarChartCard
              config={noSoberanaItem.chart}
              showLegend={false}
              className="rate-analysis__split-card rate-analysis__split-card--no-soberana"
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
