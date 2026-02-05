import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as d3 from 'd3';
import type { LineChartConfig } from '../types/slides';
import { createPortal } from 'react-dom';

type LineChartCardProps = {
  config: LineChartConfig;
  placeholder?: boolean;
  activeLegendId?: string | null;
  onLegendClick?: (seriesId: string) => void;
  className?: string;
  enableFullscreen?: boolean;
  actions?: ReactNode;
  footer?: ReactNode;
  tooltipFixed?: boolean;
  hoverLabel?: string | null;
  onHoverLabelChange?: (label: string | null) => void;
  extraTooltipSeries?: Array<{
    id: string;
    label: string;
    color?: string;
    values: Record<string, number>;
  }>;
};

type LinePoint = {
  xValue: number | Date;
  xKey: number;
  value: number;
  label: string;
};

type SeriesPoint = {
  id: string;
  label: string;
  color: string;
  values: LinePoint[];
  valueByKey: Map<number, number>;
  labelByKey: Map<number, string>;
};

const defaultLineColors = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--accent)'];

const LineChartCard = ({
  config,
  placeholder = false,
  activeLegendId = null,
  onLegendClick,
  className,
  enableFullscreen = true,
  actions,
  footer,
  tooltipFixed = false,
  hoverLabel = null,
  onHoverLabelChange,
  extraTooltipSeries = []
}: LineChartCardProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(
    null
  );
  const hoverApiRef = useRef<{ setHoverLabel: (label: string | null) => void } | null>(null);
  const hoverLabelRef = useRef<string | null>(null);
  const onLegendClickRef = useRef<typeof onLegendClick>(onLegendClick);
  const showScatterLegend = config.lineMode === 'scatter' || className?.includes('endeudamiento-scatter');
  const legendItems = config.series.map((seriesItem, index) => ({
    id: seriesItem.id,
    label: seriesItem.label,
    color: seriesItem.color ?? defaultLineColors[index % defaultLineColors.length]
  }));

  useEffect(() => {
    onLegendClickRef.current = onLegendClick;
  }, [onLegendClick]);

  useEffect(() => {
    if (!enableFullscreen || !isFullscreen) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [enableFullscreen, isFullscreen]);

  const FullscreenIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {isOpen ? (
        <path
          d="M6 6l12 12M18 6l-12 12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );

  useEffect(() => {
    if (placeholder) return;
    if (!svgRef.current || typeof window === 'undefined') return;

    const parent = svgRef.current.parentElement;
    if (!parent) return;

    const updateSize = () => {
      const nextWidth = parent.clientWidth;
      const nextHeight = parent.clientHeight;
      setContainerSize((prev) =>
        prev && prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight }
      );
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateSize());
      observer.observe(parent);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [placeholder]);

  useEffect(() => {
    if (placeholder) return;
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const container = svgElement.parentElement;
    if (!container) return;

    const computedWidth = containerSize?.width ?? container.clientWidth ?? 560;
    const measuredHeight = containerSize?.height ?? svgElement.getBoundingClientRect().height;
    const isCompact = computedWidth < 560;
    const isTiny = computedWidth < 420;
    const width = Math.max(computedWidth, isTiny ? 300 : 340);
    const height = Math.max(measuredHeight, isTiny ? 240 : 300);
    const margin = {
      top: isCompact ? 28 : 36,
      right: isCompact ? 52 : 120,
      bottom: isCompact ? 46 : 52,
      left: isCompact ? 52 : 64
    };
    if (className?.includes('endeudamiento-line-chart')) {
      margin.right = isCompact ? 2 : 4;
    }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    const accent = 'var(--accent)';
    const border = 'var(--card-border)';
    const muted = 'var(--text-muted)';
    const defaultColors = defaultLineColors;

    const parseDate = d3.timeParse('%d/%m/%y');
    const isNumericX = config.xAxis === 'number';
    const shouldSortByX = config.sortByX !== false;
    const labelToDate = new Map<string, Date>();
    const labelByKey = new Map<number, string>();
    const labelToKey = new Map<string, number>();
    let hasFallbackLabels = false;

    const resolveDate = (label: string) => {
      const parsed = parseDate(label) ?? new Date(label);
      if (!Number.isNaN(parsed.getTime())) {
        labelToDate.set(label, parsed);
        return parsed;
      }
      hasFallbackLabels = true;
      if (!labelToDate.has(label)) {
        labelToDate.set(label, new Date(2000, 0, 1 + labelToDate.size));
      }
      return labelToDate.get(label) as Date;
    };

    const series: SeriesPoint[] = config.series.map((seriesItem, index) => {
      const labelByKey = new Map<number, string>();
      const values = seriesItem.values.map((point) => {
        if (isNumericX) {
          const rawX = typeof point.x === 'number' ? point.x : Number(point.date);
          const xValue = Number.isFinite(rawX) ? rawX : 0;
          labelByKey.set(xValue, point.date);
          labelToKey.set(point.date, xValue);
          return {
            xValue,
            xKey: xValue,
            value: point.value,
            label: point.date
          };
        }
        const date = resolveDate(point.date);
        const xKey = date.getTime();
        labelByKey.set(xKey, point.date);
        labelToKey.set(point.date, xKey);
        return {
          xValue: date,
          xKey,
          value: point.value,
          label: point.date
        };
      });

      const orderedValues = shouldSortByX ? values.sort((a, b) => a.xKey - b.xKey) : values;
      const valueByKey = new Map(orderedValues.map((point) => [point.xKey, point.value]));
      return {
        id: seriesItem.id,
        label: seriesItem.label,
        color: seriesItem.color ?? defaultColors[index % defaultColors.length],
        values: orderedValues,
        valueByKey,
        labelByKey
      };
    });

    const barSeries = (config.barSeries ?? []).map((seriesItem, index) => ({
      ...seriesItem,
      color: seriesItem.color ?? defaultColors[index % defaultColors.length]
    }));
    const barSeriesIds = barSeries.map((seriesItem) => seriesItem.id);
    const barValueByKey = new Map<number, Record<string, number>>();
    const barPoints = (config.barData ?? [])
      .map((row) => {
        if (isNumericX) {
          const rawX = Number(row.date);
          const xValue = Number.isFinite(rawX) ? rawX : 0;
          labelByKey.set(xValue, row.date);
          labelToKey.set(row.date, xValue);
          barValueByKey.set(xValue, row.values);
          return { xValue, xKey: xValue, label: row.date, values: row.values };
        }
        const date = resolveDate(row.date);
        const xKey = date.getTime();
        labelByKey.set(xKey, row.date);
        labelToKey.set(row.date, xKey);
        barValueByKey.set(xKey, row.values);
        return { xValue: date, xKey, label: row.date, values: row.values };
      })
      .sort((a, b) => a.xKey - b.xKey);

    const allKeys = Array.from(
      new Set([
        ...series.flatMap((seriesItem) => seriesItem.values.map((point) => point.xKey)),
        ...barPoints.map((point) => point.xKey)
      ])
    ).sort((a, b) => a - b);

    if (allKeys.length === 0) return;

    const allDates = isNumericX ? [] : allKeys.map((time) => new Date(time));

    const lineMode = config.lineMode ?? 'line';
    const useScatter = lineMode === 'scatter';
    const scatterSkipZero = Boolean(config.scatterSkipZero);
    const isZeroValue = (value?: number) => Math.abs(value ?? 0) < 1e-6;
    const getVisibleValues = (values: LinePoint[]) =>
      scatterSkipZero ? values.filter((point) => !isZeroValue(point.value)) : values;

    const allValues = series.flatMap((seriesItem) => seriesItem.values).map((d) => d.value);
    const domainValues = scatterSkipZero
      ? allValues.filter((value) => !isZeroValue(value))
      : allValues;
    const maxValue = d3.max(domainValues) ?? 0;
    const minValue = d3.min(domainValues) ?? 0;
    const yMax = maxValue * 1.08;
    const configuredMin = typeof config.yMin === 'number' ? config.yMin : null;
    const autoMin = Math.max(0, minValue * 0.9);
    const yMin =
      configuredMin !== null
        ? configuredMin < yMax
          ? configuredMin
          : autoMin
        : scatterSkipZero
          ? autoMin
          : 0;

    const x = isNumericX
      ? d3
          .scaleLinear()
          .domain([d3.min(allKeys) ?? 0, d3.max(allKeys) ?? 0])
          .nice()
          .range([0, innerWidth])
      : d3
          .scaleTime()
          .domain(d3.extent(allDates) as [Date, Date])
          .range([0, innerWidth]);

    const formatXValue = isNumericX
      ? (() => {
          const maxX = d3.max(allKeys) ?? 0;
          if (maxX >= 25) return d3.format(',.0f');
          if (maxX >= 10) return d3.format(',.1f');
          return d3.format(',.2f');
        })()
      : null;

    const getX = (value: number | Date) => x(value as never);
    const keyToXValue = (key: number) => (isNumericX ? key : new Date(key));
    const getXForKey = (key: number) => getX(keyToXValue(key));

    const y = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .nice()
      .range([innerHeight, 0]);

    const svg = d3
      .select(svgElement)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const yAxis = d3
      .axisLeft(y)
      .ticks(4)
      .tickSize(-innerWidth)
      .tickPadding(isCompact ? 8 : 12);
    if (config.valueFormat === 'integer') {
      const formatInteger = d3.format(',.0f');
      yAxis.tickFormat((value: d3.NumberValue) => formatInteger(Number(value)));
    }
    const yAxisGroup = g
      .append('g')
      .call(yAxis)
      .call((axis: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        axis
          .selectAll('line')
          .attr('stroke', border)
          .attr('stroke-dasharray', '3 6')
          .attr('opacity', 0.7)
      )
      .call((axis: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        axis.select('.domain').attr('stroke', 'transparent')
      );

    yAxisGroup
      .selectAll('text')
      .attr('fill', muted)
      .style('font-size', isCompact ? '0.68rem' : '0.75rem');
    const isEndeudamientoChart = className?.includes('endeudamiento-line-chart');
    const isAnnualCombined = className?.includes('is-annual');
    if (isEndeudamientoChart) {
      const minValue = y.domain()[0];
      yAxisGroup.selectAll<SVGGElement, number>('.tick').each(function (tickValue) {
        if (Math.abs(tickValue - minValue) < 1e-6) {
          d3.select(this).select('text').attr('display', 'none');
        }
      });
    }

    const hasBars = barSeries.length > 0 && barPoints.length > 0;
    const barTotals = hasBars
      ? barPoints.map((row) => barSeriesIds.reduce((sum, id) => sum + (row.values[id] ?? 0), 0))
      : [];
    const maxBarTotal = hasBars ? d3.max(barTotals) ?? 0 : 0;
    const formatBarValue =
      maxBarTotal >= 1000
        ? d3.format(',.0f')
        : maxBarTotal >= 100
          ? d3.format(',.1f')
          : d3.format(',.2f');
    const barOpacity = config.barOpacity ?? 0.2;
    if (hasBars) {
      const yBar = d3
        .scaleLinear()
        .domain([0, maxBarTotal * 1.08])
        .nice()
        .range([innerHeight, 0]);

      const barAxis = d3.axisRight(yBar).ticks(4).tickSize(0).tickPadding(8);
      const barAxisGroup = g.append('g').attr('transform', `translate(${innerWidth},0)`).call(barAxis);
      barAxisGroup.select('.domain').attr('stroke', 'transparent');
      barAxisGroup
        .selectAll('text')
        .attr('fill', muted)
        .style('font-size', isCompact ? '0.68rem' : '0.75rem');
      if (isAnnualCombined) {
        barAxisGroup.selectAll('text').attr('dx', '0.6em');
      }
      if (isEndeudamientoChart) {
        barAxisGroup.selectAll<SVGGElement, number>('.tick').each(function (tickValue) {
          if (Math.abs(tickValue) < 1e-6) {
            d3.select(this).select('text').attr('display', 'none');
          }
        });
      }

      const barTimes = barPoints.map((point) => point.xKey);
      const barSpacing =
        barTimes.length > 1
          ? d3.min(barTimes.slice(1).map((time, index) => getXForKey(time) - getXForKey(barTimes[index])))
          : innerWidth;
      const barWidth = Math.max(6, (barSpacing ?? innerWidth) * 0.6);

      const stackedRows = barPoints.map((row) => {
        const values: Record<string, number> = { key: row.xKey };
        barSeriesIds.forEach((id) => {
          values[id] = row.values[id] ?? 0;
        });
        return values;
      });

      const stackGenerator = d3.stack<Record<string, number>>().keys(barSeriesIds);
      const stackedSeries = stackGenerator(stackedRows);

      const barsGroup = g.append('g').attr('class', 'line-series__bars');
      const barLayers = barsGroup
        .selectAll('g.line-series__bar-layer')
        .data(stackedSeries)
        .join('g')
        .attr('class', 'line-series__bar-layer')
        .attr('fill', (_, index) => barSeries[index]?.color ?? defaultColors[index % defaultColors.length])
        .attr('opacity', barOpacity);

      barLayers
        .selectAll('rect')
        .data((seriesLayer) =>
          seriesLayer.map((segment) => ({
            segment,
            key: (segment.data as { key: number }).key
          }))
        )
        .join('rect')
        .attr('x', (d) => getXForKey(d.key) - barWidth / 2)
        .attr('y', innerHeight)
        .attr('width', barWidth)
        .attr('height', 0)
        .transition()
        .duration(720)
        .delay((_, i) => i * 12)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => yBar(d.segment[1]))
        .attr('height', (d) => Math.max(0, yBar(d.segment[0]) - yBar(d.segment[1])));
    }

    const formatDateTick = d3.timeFormat('%m/%y');
    const xAxisGroup = g.append('g').attr('transform', `translate(0,${innerHeight})`);
    if (isNumericX) {
      const axis = d3
        .axisBottom(x as d3.ScaleLinear<number, number>)
        .ticks(isCompact ? 4 : 6)
        .tickSize(0)
        .tickFormat((value: d3.NumberValue) =>
          formatXValue ? formatXValue(Number(value)) : String(value)
        );
      xAxisGroup.call(axis);
    } else {
      const axis = d3.axisBottom(x as d3.ScaleTime<number, number>).tickSize(0);
      if (hasFallbackLabels) {
        axis
          .tickValues(allDates)
          .tickFormat((value: d3.NumberValue | Date) => {
            const date = value instanceof Date ? value : new Date(Number(value));
            return labelByKey.get(date.getTime()) ?? '';
          });
      } else {
        axis
          .ticks(isCompact ? 4 : 6)
          .tickFormat((value: d3.NumberValue | Date) => {
            const date = value instanceof Date ? value : new Date(Number(value));
            return formatDateTick(date);
          });
      }
      xAxisGroup.call(axis);
    }

    xAxisGroup
      .selectAll('text')
      .attr('class', 'chart-axis-label')
      .attr('fill', muted)
      .style('font-size', isCompact ? '0.7rem' : '0.78rem')
      .style('font-weight', 500);

    const lineCurve = !shouldSortByX && isNumericX ? d3.curveLinear : d3.curveMonotoneX;
    const line = d3
      .line<LinePoint>()
      .x((d) => getX(d.xValue))
      .y((d) => y(d.value))
      .curve(lineCurve);

    const lineGroup = g.append('g').attr('class', 'line-series');

    if (!useScatter) {
      lineGroup
        .selectAll('path.line-series__path')
        .data(series)
        .join('path')
        .attr('class', 'line-series__path')
        .attr('fill', 'none')
        .attr('stroke', (d) => d.color)
        .attr('stroke-width', isCompact ? 2.1 : 2.4)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', (d) => line(d.values));
    }

    const shouldRenderPoints = useScatter || Boolean(config.showPoints);
    if (shouldRenderPoints) {
      const scatterGroup = g.append('g').attr('class', 'line-series__points');
      const scatterRadius = isCompact ? 3.5 : 4.2;
      scatterGroup
        .selectAll('g.line-series__points-layer')
        .data(series)
        .join('g')
        .attr('class', 'line-series__points-layer')
        .attr('fill', (d) => d.color)
        .selectAll('circle')
        .data((seriesItem) => getVisibleValues(seriesItem.values))
        .join('circle')
        .attr('cx', (d) => getX(d.xValue))
        .attr('cy', (d) => y(d.value))
        .attr('r', scatterRadius)
        .attr('opacity', 0.9);
    }

    const overlay = g
      .append('rect')
      .attr('class', 'chart-overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent');

    const focus = g.append('g').attr('class', 'line-series__focus').style('opacity', 0);
    const focusLine = focus
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', border)
      .attr('stroke-dasharray', '4 6')
      .attr('stroke-width', 1.2);

    const focusDots = focus
      .selectAll('circle.line-series__focus-dot')
      .data(series)
      .join('circle')
      .attr('class', 'line-series__focus-dot')
      .attr('r', isCompact ? 4 : 5)
      .attr('fill', (d) => d.color)
      .attr('stroke', 'var(--card-surface)')
      .attr('stroke-width', 1.6);

    const shouldShowLegendDots = !useScatter && !className?.includes('endeudamiento-scatter');
    if (shouldShowLegendDots) {
      const lastPointGroup = g.append('g').attr('class', 'line-series__legend');

      const getLegendPoint = (seriesItem: SeriesPoint) => {
        const visible = getVisibleValues(seriesItem.values);
        return visible[visible.length - 1] ?? seriesItem.values[seriesItem.values.length - 1];
      };

      const getLegendX = (seriesItem: SeriesPoint) => {
        const fallbackKey = allKeys[0] ?? 0;
        const lastValue = getLegendPoint(seriesItem)?.xValue ?? keyToXValue(fallbackKey);
        const maxX = innerWidth - (isCompact ? 6 : 4);
        return Math.min(getX(lastValue), maxX);
      };
      const legendDots = lastPointGroup
        .selectAll('circle.line-series__dot')
        .data(series)
        .join('circle')
        .attr('class', 'line-series__dot')
        .attr('cx', (d) => getLegendX(d))
        .attr('cy', (d) => y(getLegendPoint(d)?.value ?? 0))
        .attr('r', isCompact ? 4 : 4.5)
        .attr('fill', (d) => d.color)
        .attr('stroke', 'var(--card-surface)')
        .attr('stroke-width', 1.5)
        .attr('data-active', (d) => (activeLegendId && d.id === activeLegendId ? 'true' : null))
        .attr('data-dimmed', (d) => (activeLegendId && d.id !== activeLegendId ? 'true' : null));

      if (onLegendClickRef.current) {
        legendDots
          .style('cursor', 'pointer')
          .on('click', (_, d) => onLegendClickRef.current?.(d.id));
      }
    }

    const formatValue =
      config.valueFormat === 'integer'
        ? d3.format(',.0f')
        : d3.format(maxValue >= 100 ? ',.1f' : ',.2f');
    const formatPlazo = d3.format(',.1f');
    const formatTooltipValue = (value: number, label?: string) =>
      label?.toLowerCase().includes('plazo') ? formatPlazo(value) : formatValue(value);
    const formatDate = d3.timeFormat('%d/%m/%y');
    const getLabelForKey = (key: number) => {
      if (isNumericX) {
        return formatXValue ? formatXValue(key) : String(key);
      }
      const label = labelByKey.get(key);
      return label ?? formatDate(new Date(key));
    };
    const unitSuffix = config.unit ? ` ${config.unit}` : '';

    const tooltip = tooltipRef.current;
    const tooltipLabel = tooltip?.querySelector('.chart-tooltip__label') as HTMLSpanElement | null;
    const tooltipRows = tooltip?.querySelector('.chart-tooltip__rows') as HTMLDivElement | null;

    const positionTooltip = (xPos: number, yPos: number) => {
      if (!tooltip) return;
      const bodyRect = container.getBoundingClientRect();
      const padding = 12;
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;
      let left = xPos + padding;
      let top = yPos - tooltipHeight - padding;

      if (left + tooltipWidth > bodyRect.width - 8) {
        left = xPos - tooltipWidth - padding;
      }

      if (top < 8) {
        top = yPos + padding;
      }

      tooltip.style.transform = `translate(${left}px, ${top}px)`;
    };

    const showTooltip = (
      key: number,
      clientX?: number,
      clientY?: number,
      activeSeries: SeriesPoint[] = series
    ) => {
      if (!tooltip) return;
      const label = getLabelForKey(key);
      const shouldGroupTooltip = tooltipFixed && (hasBars || extraTooltipSeries.length > 0);
      const seriesForTooltip = activeSeries.length > 0 ? activeSeries : series;
      const groupedRowsHtml = shouldGroupTooltip
        ? (() => {
            const barValues = barValueByKey.get(key);
            const extraById = new Map(extraTooltipSeries.map((seriesItem) => [seriesItem.id, seriesItem]));
            const barUnitSuffix = config.barUnit ? ` ${config.barUnit}` : '';

            return seriesForTooltip
              .map((seriesItem) => {
                const spreadValue = seriesItem.valueByKey.get(key) ?? 0;
                const skipSpread = useScatter && scatterSkipZero && isZeroValue(spreadValue);
                const metrics: Array<{ name: string; value: string }> = [
                  ...(skipSpread ? [] : [{ name: 'Spread', value: `${formatValue(spreadValue)}${unitSuffix}` }])
                ];

                const debtValue = barValues?.[seriesItem.id];
                if (typeof debtValue === 'number' && (!scatterSkipZero || !isZeroValue(debtValue))) {
                  metrics.push({ name: 'Deuda', value: `${formatBarValue(debtValue)}${barUnitSuffix}` });
                }

                const extraSeries = extraById.get(seriesItem.id);
                if (extraSeries) {
                  const plazoValue = extraSeries.values[label];
                  if (typeof plazoValue === 'number' && (!scatterSkipZero || !isZeroValue(plazoValue))) {
                    metrics.push({ name: 'Plazo', value: formatPlazo(plazoValue) });
                  }
                }

                if (metrics.length === 0) {
                  return '';
                }
                const metricsHtml = metrics
                  .map(
                    (metric) => `
                      <div class="chart-tooltip__metric">
                        <span class="chart-tooltip__metric-name">${metric.name}</span>
                        <span class="chart-tooltip__metric-value">${metric.value}</span>
                      </div>
                    `
                  )
                  .join('');

                return `
                  <div class="chart-tooltip__group">
                    <div class="chart-tooltip__group-header">
                      <span class="chart-tooltip__dot" style="background:${seriesItem.color};"></span>
                      <span class="chart-tooltip__group-name">${seriesItem.label}</span>
                    </div>
                    ${metricsHtml}
                  </div>
                `;
              })
              .join('');
          })()
        : '';

      const rowsHtml = !shouldGroupTooltip
        ? seriesForTooltip
            .map((seriesItem) => {
              if (!seriesItem.valueByKey.has(key)) {
                return '';
              }
              const value = seriesItem.valueByKey.get(key) ?? 0;
              if (useScatter && scatterSkipZero && isZeroValue(value)) {
                return '';
              }
              const pointLabel = isNumericX ? seriesItem.labelByKey.get(key) : null;
              const pointDetail = pointLabel
                ? `<span class="chart-tooltip__detail">${pointLabel}</span>`
                : '';
              return `
                <div class="chart-tooltip__row">
                  <span class="chart-tooltip__dot" style="background:${seriesItem.color};"></span>
                  <span class="chart-tooltip__name">
                    <span class="chart-tooltip__series">${seriesItem.label}</span>
                    ${pointDetail}
                  </span>
                  <span class="chart-tooltip__row-value">${formatValue(value)}${unitSuffix}</span>
                </div>
              `;
            })
            .join('')
        : '';

      const barRowsHtml =
        !shouldGroupTooltip && hasBars
          ? barSeries
              .map((seriesItem) => {
                const value = barValueByKey.get(key)?.[seriesItem.id] ?? 0;
                return `
                  <div class="chart-tooltip__row">
                    <span class="chart-tooltip__dot" style="background:${seriesItem.color};"></span>
                    <span class="chart-tooltip__name">${seriesItem.label} Deuda</span>
                    <span class="chart-tooltip__row-value">${formatBarValue(value)} ${
                      config.barUnit ?? ''
                    }</span>
                  </div>
                `;
              })
              .join('')
          : '';

      const extraRowsHtml = !shouldGroupTooltip
        ? extraTooltipSeries
            .map((seriesItem) => {
              const value = seriesItem.values[label] ?? 0;
              return `
                <div class="chart-tooltip__row">
                  <span class="chart-tooltip__dot" style="background:${seriesItem.color ?? accent};"></span>
                  <span class="chart-tooltip__name">${seriesItem.label}</span>
                  <span class="chart-tooltip__row-value">${formatTooltipValue(value, seriesItem.label)}</span>
                </div>
              `;
            })
            .join('')
        : '';

      if (tooltipLabel) {
        tooltipLabel.textContent = label;
      }
      if (tooltipRows) {
        tooltipRows.innerHTML = shouldGroupTooltip ? groupedRowsHtml : rowsHtml + barRowsHtml + extraRowsHtml;
      }

      tooltip.setAttribute('data-state', 'visible');

      if (!tooltipFixed && clientX != null && clientY != null) {
        const bodyRect = container.getBoundingClientRect();
        positionTooltip(clientX - bodyRect.left, clientY - bodyRect.top);
      } else if (!tooltipFixed) {
        const xPos = margin.left + getX(keyToXValue(key));
        const yPos = margin.top + innerHeight * 0.25;
        positionTooltip(xPos, yPos);
      }
    };

    const hideTooltip = () => {
      if (!tooltip) return;
      tooltip.setAttribute('data-state', 'hidden');
    };

    const bisectValue = d3.bisector<number, number>((d) => d).left;
    const bisectSeriesValues = d3.bisector<LinePoint, number>((d) => d.xKey).left;
    const getInterpolatedValue = (seriesItem: SeriesPoint, key: number) => {
      const values = seriesItem.values;
      if (values.length === 0) return null;
      const index = bisectSeriesValues(values, key, 1);
      const prev = values[index - 1] ?? values[0];
      const next = values[index] ?? prev;
      if (!prev || !next) return null;
      if (prev.xKey === next.xKey) return prev.value;
      const ratio = (key - prev.xKey) / (next.xKey - prev.xKey);
      return prev.value + (next.value - prev.value) * ratio;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const isSharedTooltip = config.tooltipMode === 'shared-x';
      const [svgX, svgY] = d3.pointer(event, svgElement);
      const relativeX = Math.max(0, Math.min(innerWidth, svgX - margin.left));
      const relativeY = Math.max(0, Math.min(innerHeight, svgY - margin.top));
      const hoveredValue = x.invert(relativeX);
      const hoveredKey = isNumericX ? (hoveredValue as number) : (hoveredValue as Date).getTime();
      const index = bisectValue(allKeys, hoveredKey, 1);
      const prev = allKeys[index - 1] ?? allKeys[0];
      const next = allKeys[index] ?? prev;
      const nearestKey = hoveredKey - prev > next - hoveredKey ? next : prev;
      const nearestXValue = keyToXValue(nearestKey);
      const proximityThreshold = (useScatter || className?.includes('endeudamiento-scatter'))
        ? isCompact
          ? 24
          : 32
        : isCompact
          ? 18
          : 24;
      const seriesDistances = series.map((seriesItem) => {
        if (!seriesItem.valueByKey.has(nearestKey)) {
          return { seriesItem, distance: Number.POSITIVE_INFINITY };
        }
        const valueAtKey = seriesItem.valueByKey.get(nearestKey) ?? 0;
        if (useScatter && scatterSkipZero && isZeroValue(valueAtKey)) {
          return { seriesItem, distance: Number.POSITIVE_INFINITY };
        }
        const interpolatedValue = getInterpolatedValue(seriesItem, hoveredKey);
        if (typeof interpolatedValue !== 'number') {
          return { seriesItem, distance: Number.POSITIVE_INFINITY };
        }
        const distance = Math.abs(relativeY - y(interpolatedValue));
        return { seriesItem, distance };
      });
      const finiteDistances = seriesDistances.filter((entry) => Number.isFinite(entry.distance));
      const nearestDistance = finiteDistances.length
        ? Math.min(...finiteDistances.map((entry) => entry.distance))
        : Number.POSITIVE_INFINITY;
      const activeCutoff = Math.max(proximityThreshold, nearestDistance + 6);
      const activeSeries = isSharedTooltip
        ? series
        : finiteDistances.length === 0
          ? series
          : seriesDistances
              .filter((entry) => Number.isFinite(entry.distance) && entry.distance <= activeCutoff)
              .map((entry) => entry.seriesItem);
      const activeSeriesIds = new Set(activeSeries.map((seriesItem) => seriesItem.id));

      focus.style('opacity', 1);
      focusLine.attr('x1', getX(nearestXValue)).attr('x2', getX(nearestXValue));
      focusDots
        .attr('cx', getX(nearestXValue))
        .attr('cy', (d) => y(d.valueByKey.get(nearestKey) ?? 0))
        .attr('opacity', (d) =>
          !activeSeriesIds.has(d.id) ||
          typeof d.valueByKey.get(nearestKey) !== 'number' ||
          (useScatter && scatterSkipZero && isZeroValue(d.valueByKey.get(nearestKey) ?? 0))
            ? 0
            : 1
        );
      const nextLabel = getLabelForKey(nearestKey);
      if (onHoverLabelChange && hoverLabelRef.current !== nextLabel) {
        hoverLabelRef.current = nextLabel;
        onHoverLabelChange(nextLabel);
      }
      showTooltip(nearestKey, event.clientX, event.clientY, activeSeries);
    };

    const shouldHideFixedTooltip = tooltipFixed && className?.includes('endeudamiento-line-chart');
    const handlePointerLeave = () => {
      if (tooltipFixed && !shouldHideFixedTooltip) {
        return;
      }
      focus.style('opacity', 0);
      if (onHoverLabelChange) {
        hoverLabelRef.current = null;
        onHoverLabelChange(null);
      }
      hideTooltip();
    };

    overlay.on('pointermove', handlePointerMove).on('pointerleave', handlePointerLeave);

    hoverApiRef.current = {
      setHoverLabel: (label) => {
        if (!label) {
          if (!tooltipFixed || shouldHideFixedTooltip) {
            focus.style('opacity', 0);
            hideTooltip();
          }
          return;
        }
        const key = labelToKey.get(label);
        if (typeof key !== 'number') return;
        const xValue = keyToXValue(key);
        focus.style('opacity', 1);
        focusLine.attr('x1', getX(xValue)).attr('x2', getX(xValue));
        focusDots
          .attr('cx', getX(xValue))
          .attr('cy', (d) => y(d.valueByKey.get(key) ?? 0))
          .attr('opacity', (d) =>
            typeof d.valueByKey.get(key) !== 'number' ||
            (useScatter && scatterSkipZero && isZeroValue(d.valueByKey.get(key) ?? 0))
              ? 0
              : 1
          );
        showTooltip(key);
      }
    };

    return () => {
      hoverApiRef.current = null;
    };
  }, [
    config,
    containerSize,
    placeholder,
    activeLegendId,
    tooltipFixed,
    extraTooltipSeries,
    className,
    onHoverLabelChange
  ]);

  useEffect(() => {
    hoverLabelRef.current = hoverLabel;
    hoverApiRef.current?.setHoverLabel(hoverLabel);
  }, [hoverLabel]);

  if (placeholder) {
    return (
      <div
        className={`chart-card chart-card--placeholder${className ? ` ${className}` : ''}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <>
      <div className={`chart-card${className ? ` ${className}` : ''}`}>
        <div className="chart-card__header">
          <div>
            <p className="chart-card__eyebrow">{config.subtitle}</p>
            <h3>{config.title}</h3>
          </div>
        </div>
        {(enableFullscreen || actions) && (
          <div className={`chart-card__actions${tooltipFixed ? ' chart-card__actions--stacked' : ''}`}>
            {actions}
            {tooltipFixed && (
              <div
                ref={tooltipRef}
                className="chart-tooltip chart-tooltip--multi chart-tooltip--fixed chart-tooltip--fixed-vertical"
                role="status"
              >
                <span className="chart-tooltip__label" />
                <div className="chart-tooltip__rows" />
              </div>
            )}
            {enableFullscreen && (
              <button
                type="button"
                className="chart-card__action-btn"
                onClick={() => setIsFullscreen(true)}
                aria-label="Ver en pantalla completa"
              >
                <FullscreenIcon isOpen={false} />
              </button>
            )}
          </div>
        )}
        <div className={`chart-card__body${footer ? ' chart-card__body--with-footer' : ''}`}>
          <svg ref={svgRef} role="img" aria-label={config.title} />
          {showScatterLegend && (
            <div className="chart-card__legend" aria-hidden="true">
              {legendItems.map((item) => (
                <div key={item.id} className="chart-card__legend-item">
                  <span className="chart-card__legend-dot" style={{ background: item.color }} />
                  <span className="chart-card__legend-label">{item.label}</span>
                </div>
              ))}
            </div>
          )}
          {!tooltipFixed && (
            <div ref={tooltipRef} className="chart-tooltip chart-tooltip--multi" role="status">
              <span className="chart-tooltip__label" />
              <div className="chart-tooltip__rows" />
            </div>
          )}
          {footer && <div className="chart-card__footer">{footer}</div>}
        </div>
      </div>
      {enableFullscreen &&
        isFullscreen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="chart-modal" role="dialog" aria-modal="true" aria-label={`Pantalla completa`}>
            <div className="chart-modal__backdrop" onClick={() => setIsFullscreen(false)} />
            <div className="chart-modal__content">
              <LineChartCard
                config={config}
                placeholder={placeholder}
                activeLegendId={activeLegendId}
                onLegendClick={onLegendClick}
                className={className}
                actions={actions}
                enableFullscreen={false}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default LineChartCard;
