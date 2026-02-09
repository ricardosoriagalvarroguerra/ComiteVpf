import { useMemo } from 'react';
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

const renderChart = (chart: ChartConfig, key: string, actions?: ReactNode, className?: string) => {
  if (chart.type === 'line') {
    return (
      <LineChartCard
        key={key}
        config={chart}
        enableFullscreen={false}
        actions={actions}
        className={className}
      />
    );
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
  const suppressDebtWordInTooltip = isRiskExposureLayout ? 'no-deuda-tooltip' : undefined;
  const riskSecondaryChart = buildRiskChartWithGeneral(slide.charts[1]);

  const filteredRiskSecondaryChart = useMemo(() => {
    if (!isRiskExposureLayout || riskSecondaryChart.type !== 'line') return riskSecondaryChart;
    const generalRow = (riskSecondaryChart.barData ?? []).find(
      (row) => row.date.toLowerCase() === 'general'
    );
    if (!generalRow) return riskSecondaryChart;
    return {
      ...riskSecondaryChart,
      barData: [generalRow],
      series: riskSecondaryChart.series.map((seriesItem) => ({
        ...seriesItem,
        values: seriesItem.values.filter((point) => point.date.toLowerCase() === 'general')
      }))
    };
  }, [isRiskExposureLayout, riskSecondaryChart]);

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
          {renderChart(slide.charts[0], `${slide.id}-chart-1`, undefined, suppressDebtWordInTooltip)}
        </div>
        <div className="dual-charts__chart dual-charts__chart--secondary" aria-label="Gráfico complementario">
          {renderChart(
            filteredRiskSecondaryChart,
            `${slide.id}-chart-2`,
            undefined,
            suppressDebtWordInTooltip
          )}
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
