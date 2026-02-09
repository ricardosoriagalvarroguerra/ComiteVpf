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
