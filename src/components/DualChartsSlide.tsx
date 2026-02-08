import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { SlideDefinition } from '../types/slides';
import type { ChartConfig } from '../types/slides';
import ChartCard from './ChartCard';
import LineChartCard from './LineChartCard';
import StackedBarChartCard from './StackedBarChartCard';
import TextCard from './TextCard';

type Props = {
  slide: Extract<SlideDefinition, { type: 'dual-charts' }>;
};

const renderChart = (chart: ChartConfig, key: string, actions?: ReactNode) => {
  if (chart.type === 'line') {
    return <LineChartCard key={key} config={chart} enableFullscreen={false} actions={actions} />;
  }
  if (chart.type === 'stacked-bar') {
    return (
      <StackedBarChartCard
        key={key}
        config={chart}
        enableFullscreen={false}
        showLegend={false}
        actions={actions}
      />
    );
  }
  return <ChartCard key={key} config={chart} enableFullscreen={false} />;
};

const DualChartsSlide = ({ slide }: Props) => {
  const isRiskExposureLayout = slide.id === 'exposicion-cartera-riesgo';
  const riskSecondaryChart = slide.charts[1];
  const riskCountryOptions = useMemo(() => {
    if (!isRiskExposureLayout || riskSecondaryChart.type !== 'line') return [];
    return Array.from(new Set((riskSecondaryChart.barData ?? []).map((row) => row.date)));
  }, [isRiskExposureLayout, riskSecondaryChart]);
  const [selectedRiskCountry, setSelectedRiskCountry] = useState<string | null>(() => {
    if (riskSecondaryChart.type !== 'line') return null;
    return riskSecondaryChart.barData?.[0]?.date ?? null;
  });
  const activeRiskCountry =
    selectedRiskCountry && riskCountryOptions.includes(selectedRiskCountry)
      ? selectedRiskCountry
      : riskCountryOptions[0] ?? null;

  const filteredRiskSecondaryChart = useMemo(() => {
    if (!isRiskExposureLayout || riskSecondaryChart.type !== 'line') return riskSecondaryChart;
    if (!activeRiskCountry) return riskSecondaryChart;
    return {
      ...riskSecondaryChart,
      barData: (riskSecondaryChart.barData ?? []).filter((row) => row.date === activeRiskCountry),
      series: riskSecondaryChart.series.map((seriesItem) => ({
        ...seriesItem,
        values: seriesItem.values.filter((point) => point.date === activeRiskCountry)
      }))
    };
  }, [isRiskExposureLayout, riskSecondaryChart, activeRiskCountry]);

  const riskSecondaryActions =
    riskCountryOptions.length > 0 ? (
      <div className="chart-card__switch risk-exposure__country-switch" role="group" aria-label="Seleccionar país">
        {riskCountryOptions.map((country) => (
          <button
            key={country}
            type="button"
            className={`chart-card__switch-btn${activeRiskCountry === country ? ' is-active' : ''}`}
            onClick={() => setSelectedRiskCountry(country)}
            aria-pressed={activeRiskCountry === country}
          >
            {country}
          </button>
        ))}
      </div>
    ) : null;

  if (isRiskExposureLayout) {
    return (
      <div className="dual-charts dual-charts--risk-exposure">
        <div className="dual-charts__text" aria-label="Resumen">
          <TextCard
            eyebrow={slide.eyebrow}
            title={slide.title}
            description={slide.description}
            highlights={slide.highlights}
          />
        </div>
        <div className="dual-charts__chart dual-charts__chart--primary" aria-label="Gráfico principal">
          {renderChart(slide.charts[0], `${slide.id}-chart-1`)}
        </div>
        <div className="dual-charts__chart dual-charts__chart--secondary" aria-label="Gráfico complementario">
          {renderChart(filteredRiskSecondaryChart, `${slide.id}-chart-2-${activeRiskCountry ?? 'all'}`, riskSecondaryActions)}
        </div>
      </div>
    );
  }

  return (
    <div className="dual-charts">
      <TextCard
        eyebrow={slide.eyebrow}
        title={slide.title}
        description={slide.description}
        highlights={slide.highlights}
      />
      <div className="dual-charts__stack" aria-label="Gráficos">
        {renderChart(slide.charts[0], `${slide.id}-chart-1`)}
        {renderChart(slide.charts[1], `${slide.id}-chart-2`)}
      </div>
    </div>
  );
};

export default DualChartsSlide;
