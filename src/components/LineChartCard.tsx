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
  hideFixedTooltipOnLeave?: boolean;
  fixedTooltipEmptyOnIdle?: boolean;
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
  xValue: number | Date | string;
  xKey: number;
  value: number;
  label: string;
};

type SeriesPoint = {
  id: string;
  label: string;
  color: string;
  areaOpacity: number;
  areaColor: string;
  lineVisible: boolean;
  lineWidth?: number;
  scatterConnect: boolean;
  scatterConnectLabels?: string[];
  values: LinePoint[];
  valueByKey: Map<number, number>;
  labelByKey: Map<number, string>;
};

type BarLabelDatum = {
  key: number;
  x: number;
  y: number;
  value: number;
  baseOpacity: number;
};

const defaultLineColors = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)'
];
const isWhiteLikeColor = (color: string) => {
  const normalized = color.trim().toLowerCase();
  return normalized === '#fff' || normalized === '#ffffff' || normalized === 'white';
};

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
  hideFixedTooltipOnLeave = false,
  fixedTooltipEmptyOnIdle = false,
  hoverLabel = null,
  onHoverLabelChange,
  extraTooltipSeries = []
}: LineChartCardProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(
    null
  );
  const hoverApiRef = useRef<{ setHoverLabel: (label: string | null) => void } | null>(null);
  const hoverLabelRef = useRef<string | null>(null);
  const onLegendClickRef = useRef<typeof onLegendClick>(onLegendClick);
  const showTooltipEnabled = config.showTooltip !== false;
  const suppressDebtWordInTooltip = className?.includes('no-deuda-tooltip') ?? false;
  const showScatterLegend =
    config.lineMode === 'scatter' || className?.includes('endeudamiento-scatter');
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
    const footerHeight = footerRef.current?.offsetHeight ?? 0;
    const baseHeight =
      containerSize?.height ?? container.clientHeight ?? svgElement.getBoundingClientRect().height;
    const measuredHeight = Math.max(0, baseHeight - footerHeight);
    const isCompact = computedWidth < 560;
    const isTiny = computedWidth < 420;
    const width = Math.max(computedWidth, isTiny ? 300 : 340);
    const height = Math.max(measuredHeight, isTiny ? 240 : 300);
    const barAxis = config.barAxis ?? 'right';
    const margin = {
      top: isCompact ? 28 : 36,
      right: isCompact ? 52 : 120,
      bottom: isCompact ? 46 : 52,
      left: isCompact ? 52 : 64
    };
    if (barAxis !== 'right') {
      margin.right = isCompact ? 24 : 40;
    }
    if (className?.includes('endeudamiento-line-chart')) {
      margin.left = isCompact ? 48 : 56;
      margin.right = isCompact ? 26 : 42;
    }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    const accent = 'var(--accent)';
    const border = 'var(--card-border)';
    const muted = 'var(--text-muted)';
    const defaultColors = defaultLineColors;

    const parseDate = d3.timeParse('%d/%m/%y');
    const isCategoryX = config.xAxis === 'category';
    const isNumericX = config.xAxis === 'number';
    const isTimeX = !isNumericX && !isCategoryX;
    const shouldSortByX = isCategoryX ? false : config.sortByX !== false;
    const labelToDate = new Map<string, Date>();
    const labelByKey = new Map<number, string>();
    const labelToKey = new Map<string, number>();
    const labelOrder: string[] = [];
    let hasFallbackLabels = false;

    const registerLabel = (label: string) => {
      if (!labelToKey.has(label)) {
        const key = labelOrder.length;
        labelOrder.push(label);
        labelToKey.set(label, key);
        labelByKey.set(key, label);
      }
      return labelToKey.get(label) ?? 0;
    };

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
        if (isCategoryX) {
          const xKey = registerLabel(point.date);
          return {
            xValue: point.date,
            xKey,
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
        areaOpacity: Math.max(0, Math.min(1, seriesItem.areaOpacity ?? 0)),
        areaColor: seriesItem.areaColor ?? seriesItem.color ?? defaultColors[index % defaultColors.length],
        lineVisible: seriesItem.lineVisible !== false,
        lineWidth: seriesItem.lineWidth,
        scatterConnect: Boolean(seriesItem.scatterConnect),
        scatterConnectLabels: seriesItem.scatterConnectLabels,
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
        if (isCategoryX) {
          const xKey = registerLabel(row.date);
          barValueByKey.set(xKey, row.values);
          return { xValue: row.date, xKey, label: row.date, values: row.values };
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

    const allDates = isTimeX ? allKeys.map((time) => new Date(time)) : [];

    const lineMode = config.lineMode ?? 'line';
    const useScatter = lineMode === 'scatter';
    const useStackedArea = lineMode === 'stacked-area';
    const scatterSkipZero = Boolean(config.scatterSkipZero);
    const isZeroValue = (value?: number) => Math.abs(value ?? 0) < 1e-6;
    const getVisibleValues = (values: LinePoint[]) =>
      scatterSkipZero ? values.filter((point) => !isZeroValue(point.value)) : values;
    const envelopeWindow = Math.max(1, Math.floor(config.scatterEnvelopeWindow ?? 2));
    const envelopeSmoothing = Math.max(1, Math.floor(config.scatterEnvelopeSmoothing ?? 3));

    const buildScatterEnvelope = (values: LinePoint[]) => {
      if (values.length < 2) return null;
      const ordered = [...values].sort((a, b) => a.xKey - b.xKey);
      const envelope = ordered.map((point, index) => {
        const start = Math.max(0, index - envelopeWindow);
        const end = Math.min(ordered.length - 1, index + envelopeWindow);
        const windowSlice = ordered.slice(start, end + 1);
        const windowMax = d3.max(windowSlice, (item) => item.value) ?? point.value;
        const windowMin = d3.min(windowSlice, (item) => item.value) ?? point.value;
        return {
          xValue: point.xValue,
          xKey: point.xKey,
          upper: windowMax,
          lower: windowMin
        };
      });

      const smoothingRadius = Math.floor(envelopeSmoothing / 2);
      const smoothEnvelope = (key: 'upper' | 'lower') =>
        envelope.map((point, index) => {
          if (envelopeSmoothing <= 1) {
            return point[key];
          }
          const start = Math.max(0, index - smoothingRadius);
          const end = Math.min(envelope.length - 1, index + smoothingRadius);
          const windowValues = envelope.slice(start, end + 1).map((entry) => entry[key]);
          return d3.mean(windowValues) ?? point[key];
        });

      const upperValues = smoothEnvelope('upper');
      const lowerValues = smoothEnvelope('lower');

      return {
        upper: ordered.map((point, index) => ({
          xValue: point.xValue,
          xKey: point.xKey,
          value: upperValues[index] ?? point.value,
          label: point.label
        })),
        lower: ordered.map((point, index) => ({
          xValue: point.xValue,
          xKey: point.xKey,
          value: lowerValues[index] ?? point.value,
          label: point.label
        }))
      };
    };

    const hasBars = barSeries.length > 0 && barPoints.length > 0;
    const barLayout = config.barLayout ?? 'stacked';
    const useGroupedBars = barLayout === 'grouped';
    const useMixedBars = barLayout === 'mixed';
    const mixedBarGroups = hasBars
      ? Array.from(
          d3.group(barSeries, (seriesItem) => seriesItem.stackGroup ?? seriesItem.id),
          ([groupId, seriesItems]) => ({ groupId, seriesItems })
        )
      : [];
    const barTotals = hasBars
      ? barPoints.map((row) => barSeriesIds.reduce((sum, id) => sum + (row.values[id] ?? 0), 0))
      : [];
    const barMaximums = hasBars
      ? barPoints.map(
          (row) => d3.max(barSeriesIds, (id) => row.values[id] ?? 0) ?? 0
        )
      : [];
    const mixedGroupMaximums = hasBars && useMixedBars
      ? barPoints.map(
          (row) =>
            d3.max(
              mixedBarGroups,
              (group) =>
                group.seriesItems.reduce((sum, seriesItem) => sum + (row.values[seriesItem.id] ?? 0), 0)
            ) ?? 0
        )
      : [];
    const maxBarTotal = hasBars ? d3.max(barTotals) ?? 0 : 0;
    const maxBarValue = hasBars ? d3.max(barMaximums) ?? 0 : 0;
    const maxMixedGroupValue = hasBars && useMixedBars ? d3.max(mixedGroupMaximums) ?? 0 : 0;
    const barDomainMax = useMixedBars ? maxMixedGroupValue : useGroupedBars ? maxBarValue : maxBarTotal;
    const allValues = series.flatMap((seriesItem) => seriesItem.values).map((d) => d.value);
    const domainValues = scatterSkipZero
      ? allValues.filter((value) => !isZeroValue(value))
      : allValues;
    const stackedAreaTotals = useStackedArea
      ? allKeys.map((key) => series.reduce((sum, seriesItem) => sum + (seriesItem.valueByKey.get(key) ?? 0), 0))
      : [];
    const stackedAreaTotalByKey = new Map(allKeys.map((key, index) => [key, stackedAreaTotals[index] ?? 0]));
    const lineMaxValue = useStackedArea ? d3.max(stackedAreaTotals) ?? 0 : d3.max(domainValues) ?? 0;
    const lineMinValue = useStackedArea ? 0 : d3.min(domainValues) ?? 0;
    const barLeftAxisMax = hasBars && barAxis === 'left'
      ? useMixedBars
        ? maxMixedGroupValue
        : useGroupedBars
          ? maxBarValue
          : maxBarTotal
      : 0;
    const maxValue = Math.max(lineMaxValue, barLeftAxisMax);
    const minValue = hasBars && barAxis === 'left' ? Math.min(lineMinValue, 0) : lineMinValue;
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

    const categoryPadding = Math.max(0, Math.min(1, config.categoryPadding ?? 0.45));
    const x = isCategoryX
      ? d3.scalePoint<string>().domain(labelOrder).range([0, innerWidth]).padding(categoryPadding)
      : isNumericX
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

    const getX = (value: number | Date | string) => x(value as never) ?? 0;
    const keyToXValue = (key: number) => {
      if (isNumericX) return key;
      if (isCategoryX) return labelByKey.get(key) ?? '';
      return new Date(key);
    };
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
          .attr('stroke-dasharray', '2 2')
          .attr('opacity', 0.55)
      )
      .call((axis: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        axis.select('.domain').attr('stroke', 'transparent')
      );

    yAxisGroup
      .selectAll('text')
      .attr('fill', muted)
      .style('font-size', isCompact ? '0.68rem' : '0.75rem')
      .style('font-family', "'Source Sans 3', 'Avenir Next', sans-serif")
      .style('font-weight', 600);
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

    const formatBarValue =
      barDomainMax >= 1000
        ? d3.format(',.0f')
        : barDomainMax >= 100
          ? d3.format(',.1f')
          : d3.format(',.2f');
    const barOpacity = config.barOpacity ?? 0.2;
    const resolveBarOpacity = (seriesOpacity?: number) =>
      Math.max(0, Math.min(1, (seriesOpacity ?? 1) * barOpacity));
    const showBarTotalLabels = config.showBarTotalLabels !== false;
    if (hasBars) {
      const barScale =
        barAxis === 'right'
          ? d3
              .scaleLinear()
              .domain([0, barDomainMax * 1.08])
              .nice()
              .range([innerHeight, 0])
          : y;

      if (barAxis === 'right') {
        const barAxisScale = d3.axisRight(barScale).ticks(4).tickSize(0).tickPadding(8);
        const barAxisGroup = g
          .append('g')
          .attr('transform', `translate(${innerWidth},0)`)
          .call(barAxisScale);
        barAxisGroup.select('.domain').attr('stroke', 'transparent');
        barAxisGroup
          .selectAll('text')
          .attr('fill', muted)
          .style('font-size', isCompact ? '0.68rem' : '0.75rem')
          .style('font-family', "'Source Sans 3', 'Avenir Next', sans-serif")
          .style('font-weight', 600);
        if (isAnnualCombined) {
          barAxisGroup.selectAll('text').attr('dx', '0.45em');
        }
        if (isEndeudamientoChart) {
          barAxisGroup.selectAll<SVGGElement, number>('.tick').each(function (tickValue) {
            if (Math.abs(tickValue) < 1e-6) {
              d3.select(this).select('text').attr('display', 'none');
            }
          });
        }
      }

      const barTimes = barPoints.map((point) => point.xKey);
      const barSpacing =
        barTimes.length > 1
          ? d3.min(barTimes.slice(1).map((time, index) => getXForKey(time) - getXForKey(barTimes[index])))
          : innerWidth;
      const barsGroup = g.append('g').attr('class', 'line-series__bars');
      let barLabelRows: BarLabelDatum[] = [];
      let barSegmentLabelRows: BarLabelDatum[] = [];
      const minSegmentLabelHeight = isCompact ? 12 : 16;

      if (useMixedBars) {
        const mixedBarWidthRatio = Math.max(0.2, Math.min(1, config.categoryBarWidthRatio ?? 0.84));
        const baseGroupWidth = Math.max(
          20,
          (barSpacing ?? innerWidth) * (isCategoryX ? mixedBarWidthRatio : 0.74)
        );
        const barGap = 0;
        const groupCount = Math.max(1, mixedBarGroups.length);
        const rawBarWidth = (baseGroupWidth - barGap * (groupCount - 1)) / groupCount;
        const singleBarWidth = Math.max(7, rawBarWidth);
        const groupWidth = singleBarWidth * groupCount + barGap * (groupCount - 1);

        const mixedRows = barPoints.flatMap((row) =>
          mixedBarGroups.flatMap((group, groupIndex) => {
            let cumulative = 0;
            return group.seriesItems.map((seriesItem, seriesIndex) => {
              const value = row.values[seriesItem.id] ?? 0;
              const baseOpacity = resolveBarOpacity(seriesItem.opacity);
              const y0 = cumulative;
              const y1 = cumulative + value;
              cumulative = y1;
              return {
                key: row.xKey,
                baseOpacity,
                groupIndex,
                groupSize: group.seriesItems.length,
                y0,
                y1,
                value,
                hasTopBorderOnly: Boolean(seriesItem.topBorderOnly),
                color:
                  seriesItem.color ?? defaultColors[(groupIndex + seriesIndex) % defaultColors.length],
                opacity: baseOpacity
              };
            });
          })
        );

        const mixedRects = barsGroup
          .selectAll('rect')
          .data(mixedRows)
          .join('rect')
          .attr('data-bar-key', (d) => String(d.key))
          .attr('data-base-opacity', (d) => String(d.baseOpacity))
          .attr('fill', (d) => d.color)
          .attr('stroke', (d) => (isWhiteLikeColor(d.color) ? 'var(--card-border)' : 'transparent'))
          .attr('stroke-width', (d) => (isWhiteLikeColor(d.color) ? 1.1 : 0))
          .attr('opacity', (d) => d.opacity)
          .attr(
            'x',
            (d) =>
              getXForKey(d.key) -
              groupWidth / 2 +
              d.groupIndex * (singleBarWidth + barGap)
          )
          .attr('y', innerHeight)
          .attr('width', singleBarWidth)
          .attr('height', 0);
        mixedRects
          .transition()
          .duration(720)
          .delay((_, i) => i * 10)
          .ease(d3.easeCubicOut)
          .attr('y', (d) => barScale(d.y1))
          .attr('height', (d) => Math.max(0, barScale(d.y0) - barScale(d.y1)));

        if (config.showBarLabels) {
          const firstBarKey = barPoints[0]?.xKey;
          const lastBarKey = barPoints[barPoints.length - 1]?.xKey;

          if (showBarTotalLabels) {
            barLabelRows = barPoints.flatMap((row) =>
              mixedBarGroups
                .filter((group) => group.seriesItems.length === 1)
                .filter((group) => {
                  const singleSeries = group.seriesItems[0];
                  if (!singleSeries?.topBorderOnly) return true;
                  return row.xKey === firstBarKey || row.xKey === lastBarKey;
                })
                .map((group) => {
                  const groupIndex = mixedBarGroups.findIndex(
                    (groupItem) => groupItem.groupId === group.groupId
                  );
                  const groupTotal = group.seriesItems.reduce(
                    (sum, seriesItem) => sum + (row.values[seriesItem.id] ?? 0),
                    0
                  );
                  return {
                    key: row.xKey,
                    x:
                      getXForKey(row.xKey) -
                      groupWidth / 2 +
                      groupIndex * (singleBarWidth + barGap) +
                      singleBarWidth / 2,
                    y: Math.max(12, barScale(groupTotal) - 6),
                    value: groupTotal,
                    baseOpacity: 1
                  };
                })
            );
          }
          barSegmentLabelRows = mixedRows
            .map((row) => {
              const height = Math.max(0, barScale(row.y0) - barScale(row.y1));
              return {
                key: row.key,
                x:
                  getXForKey(row.key) -
                  groupWidth / 2 +
                  row.groupIndex * (singleBarWidth + barGap) +
                  singleBarWidth / 2,
                y: barScale((row.y0 + row.y1) / 2),
                value: row.value,
                baseOpacity: row.baseOpacity,
                height,
                showLabel: row.groupSize > 1 && !row.hasTopBorderOnly
              };
            })
            .filter((row) => row.value > 0 && row.height >= minSegmentLabelHeight && row.showLabel)
            .map(({ key, x, y, value, baseOpacity }) => ({ key, x, y, value, baseOpacity }));
        }

        const topBorderSeriesByGroup = mixedBarGroups
          .map((group, groupIndex) => ({
            group,
            groupIndex,
            series: group.seriesItems.find((seriesItem) => seriesItem.topBorderOnly)
          }))
          .filter(
            (
              item
            ): item is {
              group: (typeof mixedBarGroups)[number];
              groupIndex: number;
              series: NonNullable<(typeof mixedBarGroups)[number]['seriesItems'][number]>;
            } => Boolean(item.series)
          );

        const topBorderRows = barPoints.flatMap((row) =>
          topBorderSeriesByGroup.map((entry) => {
            const baseX = getXForKey(row.xKey) - groupWidth / 2;
            const groupTotal = entry.group.seriesItems.reduce(
              (sum, seriesItem) => sum + (row.values[seriesItem.id] ?? 0),
              0
            );
            const startGroupIndex =
              entry.series.topBorderExtendToPrevGroup && entry.groupIndex > 0
                ? entry.groupIndex - 1
                : entry.groupIndex;
            return {
              y: barScale(groupTotal),
              x1: baseX + startGroupIndex * (singleBarWidth + barGap),
              x2: baseX + entry.groupIndex * (singleBarWidth + barGap) + singleBarWidth,
              color: entry.series.topBorderColor ?? entry.series.color ?? accent,
              width: entry.series.topBorderWidth ?? 1.8,
              dasharray: entry.series.topBorderDasharray ?? '5 3'
            };
          })
        );

        barsGroup
          .selectAll('line.line-series__mixed-top-border')
          .data(topBorderRows)
          .join('line')
          .attr('class', 'line-series__mixed-top-border')
          .attr('x1', (d) => d.x1)
          .attr('x2', (d) => d.x2)
          .attr('y1', innerHeight)
          .attr('y2', innerHeight)
          .attr('stroke', (d) => d.color)
          .attr('stroke-width', (d) => d.width)
          .attr('stroke-dasharray', (d) => d.dasharray)
          .attr('stroke-linecap', 'round')
          .attr('opacity', 0.95)
          .transition()
          .duration(720)
          .delay((_, i) => i * 10)
          .ease(d3.easeCubicOut)
          .attr('y1', (d) => d.y)
          .attr('y2', (d) => d.y);
      } else if (useGroupedBars) {
        const groupedBarWidthRatio = Math.max(0.2, Math.min(1, config.categoryBarWidthRatio ?? 0.82));
        const baseGroupWidth = Math.max(
          18,
          (barSpacing ?? innerWidth) * (isCategoryX ? groupedBarWidthRatio : 0.72)
        );
        const barGap = Math.max(2, Math.min(8, baseGroupWidth * 0.08));
        const barCount = Math.max(1, barSeriesIds.length);
        const rawBarWidth = (baseGroupWidth - barGap * (barCount - 1)) / barCount;
        const singleBarWidth = Math.max(6, rawBarWidth);
        const groupWidth = singleBarWidth * barCount + barGap * (barCount - 1);

        const groupedRows = barPoints.flatMap((row) =>
          barSeries.map((seriesItem, index) => ({
            key: row.xKey,
            baseOpacity: resolveBarOpacity(seriesItem.opacity),
            value: row.values[seriesItem.id] ?? 0,
            color: seriesItem.color ?? defaultColors[index % defaultColors.length],
            offsetIndex: index,
            opacity: resolveBarOpacity(seriesItem.opacity)
          }))
        );

        const groupedRects = barsGroup
          .selectAll('rect')
          .data(groupedRows)
          .join('rect')
          .attr('data-bar-key', (d) => String(d.key))
          .attr('data-base-opacity', (d) => String(d.baseOpacity))
          .attr('fill', (d) => d.color)
          .attr('stroke', (d) => (isWhiteLikeColor(d.color) ? 'var(--card-border)' : 'transparent'))
          .attr('stroke-width', (d) => (isWhiteLikeColor(d.color) ? 1.1 : 0))
          .attr('opacity', (d) => d.opacity)
          .attr(
            'x',
            (d) =>
              getXForKey(d.key) -
              groupWidth / 2 +
              d.offsetIndex * (singleBarWidth + barGap)
          )
          .attr('y', innerHeight)
          .attr('width', singleBarWidth)
          .attr('height', 0);
        groupedRects
          .transition()
          .duration(720)
          .delay((_, i) => i * 12)
          .ease(d3.easeCubicOut)
          .attr('y', (d) => barScale(d.value))
          .attr('height', (d) => Math.max(0, innerHeight - barScale(d.value)));

        if (config.showBarLabels) {
          if (showBarTotalLabels) {
            barLabelRows = groupedRows.map((row) => ({
              key: row.key,
              x:
                getXForKey(row.key) -
                groupWidth / 2 +
                row.offsetIndex * (singleBarWidth + barGap) +
                singleBarWidth / 2,
              y: Math.max(12, barScale(row.value) - 6),
              value: row.value,
              baseOpacity: row.baseOpacity
            }));
          }
          barSegmentLabelRows = groupedRows
            .map((row) => {
              const height = Math.max(0, innerHeight - barScale(row.value));
              return {
                key: row.key,
                x:
                  getXForKey(row.key) -
                  groupWidth / 2 +
                  row.offsetIndex * (singleBarWidth + barGap) +
                  singleBarWidth / 2,
                y: barScale(row.value / 2),
                value: row.value,
                baseOpacity: row.baseOpacity,
                height
              };
            })
            .filter((row) => row.value > 0 && row.height >= minSegmentLabelHeight)
            .map(({ key, x, y, value, baseOpacity }) => ({ key, x, y, value, baseOpacity }));
        }
      } else {
        const stackedBarWidthRatio = Math.max(0.2, Math.min(1, config.categoryBarWidthRatio ?? 0.8));
        const barWidth = Math.max(
          6,
          (barSpacing ?? innerWidth) * (isCategoryX ? stackedBarWidthRatio : 0.6)
        );

        const stackedRows = barPoints.map((row) => {
          const values: Record<string, number> = { key: row.xKey };
          barSeriesIds.forEach((id) => {
            values[id] = row.values[id] ?? 0;
          });
          return values;
        });

        const stackGenerator = d3.stack<Record<string, number>>().keys(barSeriesIds);
        const stackedSeries = stackGenerator(stackedRows);

        const barLayers = barsGroup
          .selectAll('g.line-series__bar-layer')
          .data(stackedSeries)
          .join('g')
          .attr('class', 'line-series__bar-layer')
          .attr('fill', (_, index) => barSeries[index]?.color ?? defaultColors[index % defaultColors.length])
          .attr('opacity', 1);

        const stackedRects = barLayers
          .selectAll('rect')
          .data((seriesLayer, seriesIndex) =>
            seriesLayer.map((segment) => ({
              segment,
              key: (segment.data as { key: number }).key,
              baseOpacity: resolveBarOpacity(barSeries[seriesIndex]?.opacity),
              y0: segment[0],
              y1: segment[1],
              value: segment[1] - segment[0]
            }))
          )
          .join('rect')
          .attr('data-bar-key', (d) => String(d.key))
          .attr('data-base-opacity', (d) => String(d.baseOpacity))
          .attr('x', (d) => getXForKey(d.key) - barWidth / 2)
          .attr('opacity', (d) => d.baseOpacity)
          .attr('y', innerHeight)
          .attr('width', barWidth)
          .attr('height', 0);
        stackedRects
          .transition()
          .duration(720)
          .delay((_, i) => i * 12)
          .ease(d3.easeCubicOut)
          .attr('y', (d) => barScale(d.segment[1]))
          .attr('height', (d) => Math.max(0, barScale(d.segment[0]) - barScale(d.segment[1])));

        if (config.showBarLabels) {
          if (showBarTotalLabels) {
            barLabelRows = barPoints.map((row) => {
              const total = barSeriesIds.reduce((sum, id) => sum + (row.values[id] ?? 0), 0);
              return {
                key: row.xKey,
                x: getXForKey(row.xKey),
                y: Math.max(12, barScale(total) - 6),
                value: total,
                baseOpacity: 1
              };
            });
          }
          barSegmentLabelRows = stackedSeries
            .flatMap((seriesLayer, seriesIndex) =>
              seriesLayer.map((segment) => {
                const key = (segment.data as { key: number }).key;
                const y0 = segment[0];
                const y1 = segment[1];
                const value = y1 - y0;
                const height = Math.max(0, barScale(y0) - barScale(y1));
                return {
                  key,
                  x: getXForKey(key),
                  y: barScale((y0 + y1) / 2),
                  value,
                  baseOpacity: resolveBarOpacity(barSeries[seriesIndex]?.opacity),
                  height
                };
              })
            )
            .filter((row) => row.value > 0 && row.height >= minSegmentLabelHeight)
            .map(({ key, x, y, value, baseOpacity }) => ({ key, x, y, value, baseOpacity }));
        }
      }

      if (config.showBarLabels) {
        const visibleLabels = showBarTotalLabels
          ? barLabelRows.filter((row) => row.value > 0)
          : [];
        barsGroup
          .selectAll<SVGTextElement, BarLabelDatum>('text.line-series__bar-label')
          .data(visibleLabels)
          .join('text')
          .attr('class', 'line-series__bar-label')
          .attr('data-bar-key', (d) => String(d.key))
          .attr('data-base-opacity', (d) => String(d.baseOpacity))
          .attr('x', (d) => d.x)
          .attr('y', innerHeight)
          .attr('text-anchor', 'middle')
          .text((d) => formatBarValue(d.value))
          .style('opacity', (d) => d.baseOpacity)
          .transition()
          .duration(720)
          .delay((_, i) => i * 10)
          .ease(d3.easeCubicOut)
          .attr('y', (d) => d.y)
          .selection();

        barsGroup
          .selectAll<SVGTextElement, BarLabelDatum>('text.line-series__bar-segment-label')
          .data(barSegmentLabelRows)
          .join('text')
          .attr('class', 'line-series__bar-segment-label')
          .attr('data-bar-key', (d) => String(d.key))
          .attr('data-base-opacity', (d) => String(d.baseOpacity))
          .attr('x', (d) => d.x)
          .attr('y', innerHeight)
          .attr('text-anchor', 'middle')
          .text((d) => formatBarValue(d.value))
          .style('opacity', (d) => d.baseOpacity)
          .transition()
          .duration(720)
          .delay((_, i) => i * 10)
          .ease(d3.easeCubicOut)
          .attr('y', (d) => d.y)
          .selection();
      }
    }

    const formatDateTick = d3.timeFormat('%m/%y');
    const xAxisGroup = g.append('g').attr('transform', `translate(0,${innerHeight})`);
    if (isCategoryX) {
      const tickEvery = isCompact ? Math.max(1, Math.ceil(labelOrder.length / 6)) : 1;
      const configuredTickValues = (config.xTickValues ?? []).filter((label) =>
        labelOrder.includes(label)
      );
      const tickValues = configuredTickValues.length
        ? configuredTickValues
        : labelOrder.filter((_, index) => index % tickEvery === 0);
      const axis = d3.axisBottom(x as d3.ScalePoint<string>).tickValues(tickValues).tickSize(0);
      xAxisGroup.call(axis);
    } else if (isNumericX) {
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
      .style('font-family', "'Source Sans 3', 'Avenir Next', sans-serif")
      .style('font-weight', 600);

    if (isCategoryX && config.xTickFormatter) {
      xAxisGroup
        .selectAll<SVGTextElement, string>('text.chart-axis-label')
        .text((label) => config.xTickFormatter?.(String(label)) ?? String(label));
    }

    const lineCurve = useScatter
      ? d3.curveCatmullRom.alpha(0.65)
      : !shouldSortByX && isNumericX
        ? d3.curveLinear
        : d3.curveMonotoneX;
    const line = d3
      .line<LinePoint>()
      .x((d) => getX(d.xValue))
      .y((d) => y(d.value))
      .curve(lineCurve);

    const lineGroup = g.append('g').attr('class', 'line-series');
    const shouldEnhanceScatter = useScatter && className?.includes('endeudamiento-scatter');
    const scatterEnvelopeData =
      useScatter && config.scatterEnvelope
        ? series
            .map((seriesItem) => {
              const visibleValues = getVisibleValues(seriesItem.values);
              const envelope = buildScatterEnvelope(visibleValues);
              if (!envelope) return null;
              const areaValues = envelope.upper.map((point, index) => ({
                xValue: point.xValue,
                xKey: point.xKey,
                upper: point.value,
                lower: envelope.lower[index]?.value ?? point.value
              }));
              return { ...seriesItem, envelope, areaValues };
            })
            .filter(
              (
                item
              ): item is SeriesPoint & {
                envelope: { upper: LinePoint[]; lower: LinePoint[] };
                areaValues: Array<{
                  xValue: number | Date;
                  xKey: number;
                  upper: number;
                  lower: number;
                }>;
              } => Boolean(item)
            )
        : [];

    if (useStackedArea) {
      const stackedRows = allKeys.map((key) => {
        const row: Record<string, number> = { key };
        series.forEach((seriesItem) => {
          row[seriesItem.id] = seriesItem.valueByKey.get(key) ?? 0;
        });
        return row;
      });
      const stackedSeries = d3
        .stack<Record<string, number>>()
        .keys(series.map((seriesItem) => seriesItem.id))(stackedRows);
      const colorBySeriesId = new Map(series.map((seriesItem) => [seriesItem.id, seriesItem.color]));
      const stackedArea = d3
        .area<d3.SeriesPoint<Record<string, number>>>()
        .x((point) => getXForKey(point.data.key))
        .y0((point) => y(point[0]))
        .y1((point) => y(point[1]))
        .curve(lineCurve);
      const stackedTopLine = d3
        .line<d3.SeriesPoint<Record<string, number>>>()
        .x((point) => getXForKey(point.data.key))
        .y((point) => y(point[1]))
        .curve(lineCurve);

      lineGroup
        .selectAll('path.line-series__stacked-area')
        .data(stackedSeries)
        .join('path')
        .attr('class', 'line-series__stacked-area')
        .attr('fill', (layer) => colorBySeriesId.get(String(layer.key)) ?? accent)
        .attr('opacity', (layer) =>
          isWhiteLikeColor(colorBySeriesId.get(String(layer.key)) ?? accent) ? 1 : 0.8
        )
        .attr('stroke', (layer) =>
          isWhiteLikeColor(colorBySeriesId.get(String(layer.key)) ?? accent)
            ? 'var(--card-border)'
            : 'none'
        )
        .attr('stroke-width', (layer) =>
          isWhiteLikeColor(colorBySeriesId.get(String(layer.key)) ?? accent) ? 1.1 : 0
        )
        .attr('d', (layer) => stackedArea(layer) ?? '');

      const topLayer = stackedSeries[stackedSeries.length - 1];
      const totalLineColor = config.stackedAreaTotalColor ?? 'var(--series-1)';
      const totalLineWidth = config.stackedAreaTotalWidth ?? (isCompact ? 2.6 : 3);

      if (topLayer) {
        lineGroup
          .append('path')
          .datum(topLayer)
          .attr('class', 'line-series__stacked-total-line-shadow')
          .attr('fill', 'none')
          .attr('stroke', 'var(--card-surface)')
          .attr('stroke-width', totalLineWidth + 1.2)
          .attr('opacity', 0.95)
          .attr('d', (layer) => stackedTopLine(layer) ?? '');

        lineGroup
          .append('path')
          .datum(topLayer)
          .attr('class', 'line-series__stacked-total-line')
          .attr('fill', 'none')
          .attr('stroke', totalLineColor)
          .attr('stroke-width', totalLineWidth)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .attr('opacity', 1)
          .attr('d', (layer) => stackedTopLine(layer) ?? '');
      }
    } else if (!useScatter) {
      const areaBaseValue = Math.max(0, y.domain()[0] ?? 0);
      const area = d3
        .area<LinePoint>()
        .x((d) => getX(d.xValue))
        .y0(y(areaBaseValue))
        .y1((d) => y(d.value))
        .curve(lineCurve);

      lineGroup
        .selectAll('path.line-series__area')
        .data(series.filter((seriesItem) => seriesItem.areaOpacity > 0))
        .join('path')
        .attr('class', 'line-series__area')
        .attr('fill', (d) => d.areaColor)
        .attr('opacity', (d) => d.areaOpacity)
        .attr('d', (d) => (d.values.length > 1 ? area(d.values) ?? '' : ''));

      lineGroup
        .selectAll('path.line-series__path')
        .data(series.filter((seriesItem) => seriesItem.lineVisible))
        .join('path')
        .attr('class', 'line-series__path')
        .attr('fill', 'none')
        .attr('stroke', (d) => d.color)
        .attr('stroke-width', (d) => d.lineWidth ?? (isCompact ? 2.1 : 2.4))
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', (d) => line(d.values));
    }

    if (useScatter && shouldEnhanceScatter && scatterEnvelopeData.length) {
      const envelopeArea = d3
        .area<{ xValue: number | Date; upper: number; lower: number }>()
        .x((d) => getX(d.xValue))
        .y0((d) => y(d.lower))
        .y1((d) => y(d.upper))
        .curve(lineCurve);

      lineGroup
        .selectAll('path.line-series__envelope-fill')
        .data(scatterEnvelopeData)
        .join('path')
        .attr('class', 'line-series__envelope-fill')
        .attr('fill', (d) => d.color)
        .attr('opacity', 0.14)
        .attr('d', (d) => (d.areaValues.length > 1 ? envelopeArea(d.areaValues) : null));
    }

    if (useScatter && shouldEnhanceScatter) {
      lineGroup
        .selectAll('path.line-series__scatter-path')
        .data(series)
        .join('path')
        .attr('class', 'line-series__scatter-path')
        .attr('fill', 'none')
        .attr('stroke', (d) => d.color)
        .attr('stroke-width', isCompact ? 1.8 : 2.1)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-dasharray', '5 6')
        .attr('opacity', 0.85)
        .attr('d', (d) => line(d.values));
    }

    if (useScatter && config.scatterEnvelope) {
      const envelopeSeries = scatterEnvelopeData.flatMap((seriesItem) => [
        { ...seriesItem, envelopeType: 'upper' as const, values: seriesItem.envelope.upper },
        { ...seriesItem, envelopeType: 'lower' as const, values: seriesItem.envelope.lower }
      ]);
      lineGroup
        .selectAll('path.line-series__envelope')
        .data(envelopeSeries)
        .join('path')
        .attr(
          'class',
          (d) => `line-series__envelope line-series__envelope--${d.envelopeType}`
        )
        .attr('fill', 'none')
        .attr('stroke', (d) => d.color)
        .attr('stroke-width', isCompact ? 1.8 : 2.1)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('opacity', 0.82)
        .attr('d', (d) => (d.values.length > 1 ? line(d.values) : null));
    }

    const shouldRenderPoints = !useStackedArea && (useScatter || Boolean(config.showPoints));
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

    if (useScatter) {
      const scatterLine = d3
        .line<LinePoint>()
        .defined((point) => Number.isFinite(point.value))
        .x((point) => getX(point.xValue))
        .y((point) => y(point.value))
        .curve(lineCurve);

      lineGroup
        .selectAll('path.line-series__scatter-link')
        .data(series.filter((seriesItem) => seriesItem.scatterConnect))
        .join('path')
        .attr('class', 'line-series__scatter-link')
        .attr('fill', 'none')
        .attr('stroke', (seriesItem) => seriesItem.color)
        .attr('stroke-width', isCompact ? 1.8 : 2.1)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('opacity', 0.92)
        .attr('d', (seriesItem) => {
          const visibleValues = getVisibleValues(seriesItem.values);
          const connectLabels = seriesItem.scatterConnectLabels;
          const connectedValues =
            connectLabels && connectLabels.length
              ? visibleValues.filter((point) => connectLabels.includes(point.label))
              : visibleValues;
          return connectedValues.length > 1 ? scatterLine(connectedValues) : null;
        });
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
      .attr('stroke-dasharray', '2 2')
      .attr('stroke-width', 1.2);

    const focusDotRadius =
      config.tooltipMode === 'shared-x'
        ? isCompact
          ? 5
          : 6
        : isCompact
          ? 4
          : 5;

    const focusDots = focus
      .selectAll('circle.line-series__focus-dot')
      .data(series)
      .join('circle')
      .attr('class', 'line-series__focus-dot')
      .attr('r', focusDotRadius)
      .attr('fill', (d) => d.color)
      .attr('stroke', 'var(--card-surface)')
      .attr('stroke-width', 1.6);

    const shouldShowLegendDots =
      !useScatter && !useStackedArea && !className?.includes('endeudamiento-scatter');
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
        .data(series.filter((seriesItem) => seriesItem.lineVisible))
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
    const valueLabelUnitSuffix =
      config.unit && config.showValueLabelUnit !== false ? ` ${config.unit}` : '';
    if (config.showValueLabels && !useStackedArea) {
      lineGroup
        .selectAll('g.line-series__value-label-layer')
        .data(series.filter((seriesItem) => seriesItem.lineVisible))
        .join('g')
        .attr('class', 'line-series__value-label-layer')
        .attr('fill', (d) => d.color)
        .selectAll('text.line-series__value-label')
        .data((seriesItem) => getVisibleValues(seriesItem.values))
        .join('text')
        .attr('class', 'line-series__value-label')
        .attr('x', (point) => getX(point.xValue))
        .attr('y', (point) => Math.max(12, y(point.value) - (isCompact ? 8 : 10)))
        .attr('text-anchor', 'middle')
        .style('font-size', config.valueLabelFontSize ?? (isCompact ? '0.54rem' : '0.6rem'))
        .style('font-weight', 600)
        .text((point) => `${formatValue(point.value)}${valueLabelUnitSuffix}`);
    }
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
      if (!showTooltipEnabled) return;
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
                  metrics.push({
                    name: suppressDebtWordInTooltip ? 'Monto' : 'Deuda',
                    value: `${formatBarValue(debtValue)}${barUnitSuffix}`
                  });
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
      const stackedAreaTotalRowHtml =
        !shouldGroupTooltip && useStackedArea
          ? (() => {
              const totalValue = stackedAreaTotalByKey.get(key);
              if (typeof totalValue !== 'number') return '';
              const totalLabel = config.stackedAreaTotalLabel ?? 'Total';
              const totalColor = config.stackedAreaTotalColor ?? 'var(--series-1)';
              return `
                <div class="chart-tooltip__row">
                  <span class="chart-tooltip__dot" style="background:${totalColor};"></span>
                  <span class="chart-tooltip__name">${totalLabel}</span>
                  <span class="chart-tooltip__row-value">${formatValue(totalValue)}${unitSuffix}</span>
                </div>
              `;
            })()
          : '';

      const barRowsHtml =
        !shouldGroupTooltip && hasBars
          ? barSeries
              .map((seriesItem) => {
                const value = barValueByKey.get(key)?.[seriesItem.id] ?? 0;
                return `
                  <div class="chart-tooltip__row">
                    <span class="chart-tooltip__dot" style="background:${seriesItem.color};"></span>
                    <span class="chart-tooltip__name">${seriesItem.label}${
                      suppressDebtWordInTooltip ? '' : ' Deuda'
                    }</span>
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
        tooltipRows.innerHTML = shouldGroupTooltip
          ? groupedRowsHtml
          : rowsHtml + stackedAreaTotalRowHtml + barRowsHtml + extraRowsHtml;
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

    const showIdleTooltip = () => {
      if (!showTooltipEnabled) return;
      if (!tooltip) return;
      if (!tooltipFixed || !fixedTooltipEmptyOnIdle) return;

      if (tooltipLabel) {
        tooltipLabel.textContent = '';
      }
      if (tooltipRows) {
        const idleRowsHtml = series
          .map(
            (seriesItem) => `
              <div class="chart-tooltip__row">
                <span class="chart-tooltip__dot" style="background:${seriesItem.color};"></span>
                <span class="chart-tooltip__name">
                  <span class="chart-tooltip__series">${seriesItem.label}</span>
                </span>
                <span class="chart-tooltip__row-value">&nbsp;</span>
              </div>
            `
          )
          .join('');
        tooltipRows.innerHTML = idleRowsHtml;
      }
      tooltip.setAttribute('data-state', 'visible');
    };

    const hideTooltip = () => {
      if (!showTooltipEnabled) return;
      if (!tooltip) return;
      if (tooltipFixed && fixedTooltipEmptyOnIdle) {
        showIdleTooltip();
        return;
      }
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

    const getHoveredKey = (relativeX: number) => {
      if (isCategoryX) {
        return (
          allKeys.reduce(
            (nearest, key) => {
              const distance = Math.abs(getXForKey(key) - relativeX);
              return distance < nearest.distance ? { key, distance } : nearest;
            },
            { key: allKeys[0] ?? 0, distance: Number.POSITIVE_INFINITY }
          ).key ?? 0
        );
      }

      const invertibleScale = x as d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;
      const hoveredValue = invertibleScale.invert(relativeX);
      return isNumericX ? (hoveredValue as number) : (hoveredValue as Date).getTime();
    };

    const applyBarHighlight = (activeKey: number | null) => {
      if (!hasBars) return;
      g.selectAll<SVGRectElement, unknown>('.line-series__bars rect').each(function () {
        const rect = d3.select(this);
        const key = Number(rect.attr('data-bar-key'));
        const baseOpacity = Number(rect.attr('data-base-opacity') || '1');
        const nextOpacity =
          activeKey === null || key === activeKey
            ? baseOpacity
            : Math.max(0.12, baseOpacity * 0.26);
        rect.attr('opacity', nextOpacity);
      });
      g.selectAll<SVGTextElement, unknown>('text.line-series__bar-label, text.line-series__bar-segment-label').each(function () {
        const label = d3.select(this);
        const key = Number(label.attr('data-bar-key'));
        const baseOpacity = Number(label.attr('data-base-opacity') || '1');
        const nextOpacity =
          activeKey === null || key === activeKey
            ? baseOpacity
            : Math.max(0.22, baseOpacity * 0.35);
        label.style('opacity', String(nextOpacity));
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      const isSharedTooltip = config.tooltipMode === 'shared-x' || useStackedArea;
      const [svgX, svgY] = d3.pointer(event, svgElement);
      const relativeX = Math.max(0, Math.min(innerWidth, svgX - margin.left));
      const relativeY = Math.max(0, Math.min(innerHeight, svgY - margin.top));
      const hoveredKey = getHoveredKey(relativeX);
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
      applyBarHighlight(nearestKey);

      focus.style('opacity', 1);
      focusLine.attr('x1', getX(nearestXValue)).attr('x2', getX(nearestXValue));
      focusDots
        .attr('cx', getX(nearestXValue))
        .attr('cy', (d) => y(d.valueByKey.get(nearestKey) ?? 0))
        .attr('opacity', (d) =>
          useStackedArea ||
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

    const shouldHideFixedTooltip =
      tooltipFixed && (hideFixedTooltipOnLeave || className?.includes('endeudamiento-line-chart'));
    const handlePointerLeave = () => {
      if (tooltipFixed && !shouldHideFixedTooltip) {
        return;
      }
      focus.style('opacity', 0);
      applyBarHighlight(null);
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
            applyBarHighlight(null);
            hideTooltip();
          }
          return;
        }
        const key = labelToKey.get(label);
        if (typeof key !== 'number') return;
        const xValue = keyToXValue(key);
        focus.style('opacity', 1);
        applyBarHighlight(key);
        focusLine.attr('x1', getX(xValue)).attr('x2', getX(xValue));
        focusDots
          .attr('cx', getX(xValue))
          .attr('cy', (d) => y(d.valueByKey.get(key) ?? 0))
          .attr('opacity', (d) =>
            useStackedArea ||
            typeof d.valueByKey.get(key) !== 'number' ||
            (useScatter && scatterSkipZero && isZeroValue(d.valueByKey.get(key) ?? 0))
              ? 0
              : 1
          );
        showTooltip(key);
      }
    };

    if (tooltipFixed && fixedTooltipEmptyOnIdle) {
      showIdleTooltip();
    }

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
    onHoverLabelChange,
    showTooltipEnabled,
    hideFixedTooltipOnLeave,
    fixedTooltipEmptyOnIdle
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
        {(enableFullscreen || actions || (tooltipFixed && showTooltipEnabled)) && (
          <div className={`chart-card__actions${tooltipFixed ? ' chart-card__actions--stacked' : ''}`}>
            {actions}
            {tooltipFixed && showTooltipEnabled && (
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
          {!tooltipFixed && showTooltipEnabled && (
            <div ref={tooltipRef} className="chart-tooltip chart-tooltip--multi" role="status">
              <span className="chart-tooltip__label" />
              <div className="chart-tooltip__rows" />
            </div>
          )}
          {footer && (
            <div ref={footerRef} className="chart-card__footer">
              {footer}
            </div>
          )}
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
