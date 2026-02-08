import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { SlideDefinition } from '../types/slides';
import type { ChartConfig } from '../types/slides';
import type { LineChartBarDatum } from '../types/slides';
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

const buildRiskChartWithGeneral = (chart: ChartConfig): ChartConfig => {
  if (chart.type !== 'line') return chart;
  const rows = chart.barData ?? [];
  if (!rows.length) return chart;
  const hasGeneral = rows.some((row) => row.date.toLowerCase() === 'general');
  if (hasGeneral) return chart;

  const metricIds = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row.values ?? {})))
  );
  const generalValues = metricIds.reduce<Record<string, number>>((acc, metricId) => {
    acc[metricId] = rows.reduce((sum, row) => sum + (row.values?.[metricId] ?? 0), 0);
    return acc;
  }, {});

  const generalRow: LineChartBarDatum = {
    date: 'General',
    values: generalValues
  };

  return {
    ...chart,
    barData: [generalRow, ...rows]
  };
};

const DualChartsSlide = ({ slide }: Props) => {
  const isRiskExposureLayout = slide.id === 'exposicion-cartera-riesgo';
  const riskSecondaryChart = buildRiskChartWithGeneral(slide.charts[1]);
  const riskCountryOptions = useMemo(() => {
    if (!isRiskExposureLayout || riskSecondaryChart.type !== 'line') return [];
    const dataOptions = Array.from(new Set((riskSecondaryChart.barData ?? []).map((row) => row.date)));
    const preferredOrder = ['General', 'Arg', 'Bol', 'Bra', 'Par', 'Uru'];
    const ordered = preferredOrder.filter((option) => dataOptions.includes(option));
    const extra = dataOptions.filter((option) => !preferredOrder.includes(option));
    return [...ordered, ...extra];
  }, [isRiskExposureLayout, riskSecondaryChart]);
  const riskGeneralOption =
    riskCountryOptions.find((option) => option.toLowerCase() === 'general') ?? null;
  const riskCountryOnlyOptions = useMemo(
    () => riskCountryOptions.filter((option) => option.toLowerCase() !== 'general'),
    [riskCountryOptions]
  );
  const preferredDefaultCountry =
    riskCountryOnlyOptions.find((option) => option.toLowerCase() === 'arg') ??
    riskCountryOnlyOptions[0] ??
    null;
  const [riskViewMode, setRiskViewMode] = useState<'general' | 'pais'>(
    riskGeneralOption ? 'general' : 'pais'
  );
  const [selectedRiskCountry, setSelectedRiskCountry] = useState<string | null>(
    preferredDefaultCountry
  );
  const activeRiskCountry =
    riskViewMode === 'general'
      ? riskGeneralOption ?? riskCountryOnlyOptions[0] ?? null
      : selectedRiskCountry && riskCountryOnlyOptions.includes(selectedRiskCountry)
        ? selectedRiskCountry
        : preferredDefaultCountry;

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
      <div className="risk-exposure__controls">
        <div className="chart-card__switch risk-exposure__mode-switch" role="group" aria-label="Vista de capacidad">
          {riskGeneralOption && (
            <button
              type="button"
              className={`chart-card__switch-btn${riskViewMode === 'general' ? ' is-active' : ''}`}
              onClick={() => setRiskViewMode('general')}
              aria-pressed={riskViewMode === 'general'}
            >
              General
            </button>
          )}
          <button
            type="button"
            className={`chart-card__switch-btn${riskViewMode === 'pais' ? ' is-active' : ''}`}
            onClick={() => {
              setRiskViewMode('pais');
              if (preferredDefaultCountry) {
                setSelectedRiskCountry(preferredDefaultCountry);
              }
            }}
            aria-pressed={riskViewMode === 'pais'}
          >
            Países
          </button>
        </div>
        {riskViewMode === 'pais' && riskCountryOnlyOptions.length > 0 && (
          <select
            className="risk-exposure__country-select"
            value={activeRiskCountry ?? ''}
            onChange={(event) => setSelectedRiskCountry(event.target.value)}
            aria-label="Seleccionar país"
          >
            {riskCountryOnlyOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        )}
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
