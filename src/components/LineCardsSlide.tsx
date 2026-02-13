import { useMemo } from 'react';
import type {
  ChartConfig,
  LineCardsSlide as LineCardsSlideType,
  LineChartConfig
} from '../types/slides';
import ChartCard from './ChartCard';
import LineChartCard from './LineChartCard';
import StackedBarChartCard from './StackedBarChartCard';

type Props = {
  slide: LineCardsSlideType;
};

const roundAxisNumber = (value: number) => Math.round(value * 1000) / 1000;

const buildAxisTicks = (minValue: number, maxValue: number): number[] => {
  const lowerBound = Math.min(minValue, maxValue);
  const upperBound = Math.max(minValue, maxValue);

  if (!Number.isFinite(lowerBound) || !Number.isFinite(upperBound)) {
    return [0];
  }

  if (Math.abs(upperBound - lowerBound) < 0.0001) {
    const center = roundAxisNumber(lowerBound);
    return [center - 1, center, center + 1];
  }

  const span = Math.max(1, upperBound - lowerBound);
  const roughStep = span / 6;
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(roughStep) || 1)));
  const multipliers = [1, 2, 2.5, 5, 10];
  const step =
    (multipliers.find((multiplier) => roughStep <= multiplier * magnitude) ?? 10) * magnitude;
  const start = Math.floor(lowerBound / step) * step;
  const end = Math.ceil(upperBound / step) * step;
  const ticks: number[] = [];

  for (let current = start; current <= end + step * 0.5; current += step) {
    ticks.push(roundAxisNumber(current));
  }

  if (!ticks.some((tick) => Math.abs(tick) < 0.0001)) {
    ticks.push(0);
  }

  return Array.from(new Set(ticks)).sort((a, b) => a - b);
};

const calculateLeftBarExtents = (chart: LineChartConfig) => {
  if (
    chart.barAxis !== 'left' ||
    !Array.isArray(chart.barData) ||
    chart.barData.length === 0 ||
    !Array.isArray(chart.barSeries) ||
    chart.barSeries.length === 0
  ) {
    return { min: 0, max: 0 };
  }

  const layout = chart.barLayout ?? 'stacked';
  const seriesIds = chart.barSeries.map((seriesItem) => seriesItem.id);
  let minValue = 0;
  let maxValue = 0;

  if (layout === 'grouped') {
    for (const row of chart.barData) {
      for (const id of seriesIds) {
        const value = row.values[id] ?? 0;
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    }
    return { min: minValue, max: maxValue };
  }

  if (layout === 'mixed') {
    const groups = new Map<string, string[]>();
    for (const seriesItem of chart.barSeries) {
      const key = seriesItem.stackGroup ?? seriesItem.id;
      const group = groups.get(key) ?? [];
      group.push(seriesItem.id);
      groups.set(key, group);
    }

    const groupedIds = Array.from(groups.values());
    for (const row of chart.barData) {
      for (const groupIds of groupedIds) {
        const groupTotal = groupIds.reduce((sum, id) => sum + (row.values[id] ?? 0), 0);
        minValue = Math.min(minValue, groupTotal);
        maxValue = Math.max(maxValue, groupTotal);
      }
    }
    return { min: minValue, max: maxValue };
  }

  for (const row of chart.barData) {
    const rowTotal = seriesIds.reduce((sum, id) => sum + (row.values[id] ?? 0), 0);
    minValue = Math.min(minValue, rowTotal);
    maxValue = Math.max(maxValue, rowTotal);
  }
  return { min: minValue, max: maxValue };
};

const calculateLineChartExtents = (chart: LineChartConfig) => {
  const lineValues = chart.series.flatMap((seriesItem) => seriesItem.values.map((value) => value.value));
  const lineMin = lineValues.length > 0 ? Math.min(...lineValues) : 0;
  const lineMax = lineValues.length > 0 ? Math.max(...lineValues) : 0;
  const barExtents = calculateLeftBarExtents(chart);

  return {
    min: Math.min(0, lineMin, barExtents.min),
    max: Math.max(0, lineMax, barExtents.max)
  };
};

const LineCardsSlide = ({ slide }: Props) => {
  const suppressDebtWordInTooltip =
    slide.id === 'exposicion-cartera-riesgo-cards' ||
    slide.id === 'tablero-liquidez-4-cards' ||
    slide.id === 'flujos-pais';
  const sharedYAxisMax = useMemo(() => {
    if (slide.id !== 'evolucion-rubros-balance') {
      return undefined;
    }

    const getChartMax = (chart: ChartConfig): number => {
      if (chart.type === 'line') {
        return 0;
      }

      if (chart.type === 'stacked-bar') {
        return chart.data.reduce((max, datum) => {
          const total = Object.values(datum.values).reduce((sum, value) => sum + value, 0);
          return Math.max(max, total);
        }, 0);
      }

      return chart.data.reduce((max, datum) => Math.max(max, datum.value), 0);
    };

    const maxValue = slide.cards.reduce((max, card) => {
      if (!card.chart) {
        return max;
      }
      return Math.max(max, getChartMax(card.chart));
    }, 0);

    return maxValue > 0 ? maxValue : undefined;
  }, [slide]);
  const sharedFlujosYAxis = useMemo(() => {
    if (slide.id !== 'flujos-pais') {
      return undefined;
    }

    const lineCharts = slide.cards
      .map((card) => card.chart)
      .filter((chart): chart is LineChartConfig => chart?.type === 'line');

    if (lineCharts.length === 0) {
      return undefined;
    }

    const extents = lineCharts.map((chart) => calculateLineChartExtents(chart));
    const globalMinRaw = Math.min(...extents.map((extent) => extent.min));
    const globalMaxRaw = Math.max(...extents.map((extent) => extent.max));
    const yMin = roundAxisNumber(globalMinRaw < 0 ? globalMinRaw * 1.08 : 0);
    const yMaxCandidate = roundAxisNumber(globalMaxRaw > 0 ? globalMaxRaw * 1.08 : 0);
    const yMax = yMaxCandidate <= yMin ? roundAxisNumber(yMin + 1) : yMaxCandidate;
    const yTickValues = buildAxisTicks(yMin, yMax);

    return { yMin, yMax, yTickValues };
  }, [slide]);

  const rootClassName = [
    'line-cards',
    slide.layout === 'stacked' ? 'line-cards--stacked' : '',
    slide.hideHeader ? 'line-cards--cards-only' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const renderChart = (card: NonNullable<LineCardsSlideType['cards'][number]['chart']>, key: string) => {
    const isLiquidityDashboardCard =
      slide.id === 'tablero-liquidez-4-cards' || key.startsWith('tablero-liquidez-');
    const hasFullscreenEnabled =
      isLiquidityDashboardCard || slide.id === 'flujos-pais' || slide.id === 'evolucion-rubros-balance';
    const compactCardClass = slide.id === 'flujos-pais' ? ' chart-card--compact' : '';
    const compactTooltipClass = slide.id === 'flujos-pais' ? ' flujos-tooltip--compact' : '';
    if (card.type === 'line') {
      const isRatioMoodysLiquidityCard =
        slide.id === 'tablero-liquidez-4-cards' && key === 'tablero-liquidez-card-2';
      const yAxisOverrides = slide.id === 'flujos-pais' ? sharedFlujosYAxis : undefined;
      return (
        <LineChartCard
          key={key}
          config={card}
          yMinOverride={yAxisOverrides?.yMin}
          yMaxOverride={yAxisOverrides?.yMax}
          yTickValuesOverride={yAxisOverrides?.yTickValues}
          className={`line-cards__chart${suppressDebtWordInTooltip ? ' no-deuda-tooltip' : ''}${
            isRatioMoodysLiquidityCard ? ' ratio-moodys-liquidity-chart' : ''
          }${isLiquidityDashboardCard ? ' chart-fullscreen--page' : ''}${compactCardClass}${compactTooltipClass}`}
          enableFullscreen={hasFullscreenEnabled}
        />
      );
    }
    if (card.type === 'stacked-bar') {
      return (
        <StackedBarChartCard
          key={key}
          config={card}
          yMaxOverride={sharedYAxisMax}
          showLegend={false}
          className={`line-cards__chart${
            isLiquidityDashboardCard ? ' chart-fullscreen--page' : ''
          }${compactCardClass}${compactTooltipClass}`}
          enableFullscreen={hasFullscreenEnabled}
        />
      );
    }
    return (
      <ChartCard
        key={key}
        config={card}
        variant="plain"
        hideHeader={slide.id === 'aprobaciones-y-cancelaciones'}
        yMaxOverride={sharedYAxisMax}
        enableFullscreen={hasFullscreenEnabled}
      />
    );
  };

  return (
    <div className={rootClassName}>
      {!slide.hideHeader && (
        <header className="line-cards__header">
          {slide.eyebrow ? <p className="line-cards__eyebrow">{slide.eyebrow}</p> : null}
          <h2 className="line-cards__title">{slide.title}</h2>
          {slide.description && <p className="line-cards__description">{slide.description}</p>}
        </header>
      )}
      <div className="line-cards__grid" aria-label="Grilla de gráficos">
        {slide.cards.map((card) =>
          card.chart ? (
            renderChart(card.chart, card.id)
          ) : (
            <ChartCard
              key={card.id}
              placeholder
              variant="plain"
              config={{
                title: card.placeholderTitle ?? 'Espacio para completar',
                subtitle: card.placeholderSubtitle ?? 'Pendiente',
                showValueLabels: false,
                data: []
              }}
            />
          )
        )}
      </div>
    </div>
  );
};

export default LineCardsSlide;
