import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';
import * as d3 from 'd3';
import type { StackedBarChartConfig, StackedBarSeries } from '../types/slides';

type StackedBarChartCardProps = {
  config: StackedBarChartConfig;
  placeholder?: boolean;
  enableFullscreen?: boolean;
  showLegend?: boolean;
  className?: string;
  tooltipFixed?: boolean;
  yMaxOverride?: number;
  tooltipRef?: RefObject<HTMLDivElement | null>;
  actions?: ReactNode;
  headerExtras?: ReactNode;
  footer?: ReactNode;
};

type StackDatum = {
  label: string;
  [key: string]: number | string;
};

type SegmentDatum = {
  seriesId: string;
  label: string;
  y0: number;
  y1: number;
  value: number;
  total: number;
  isTop: boolean;
};

type SeriesWithColor = StackedBarSeries & { color: string };

type StackedBarChartCanvasProps = {
  config: StackedBarChartConfig;
  placeholder?: boolean;
  seriesPalette: SeriesWithColor[];
  tooltipFixed?: boolean;
  tooltipRef?: RefObject<HTMLDivElement | null>;
  yMaxOverride?: number;
  footer?: ReactNode;
};

type StackedBarChartPanelProps = {
  config: StackedBarChartConfig;
  placeholder?: boolean;
  seriesPalette: SeriesWithColor[];
  showFullscreen?: boolean;
  showLegend?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
  tooltipFixed?: boolean;
  yMaxOverride?: number;
  tooltipRef?: RefObject<HTMLDivElement | null>;
  actions?: ReactNode;
  headerExtras?: ReactNode;
  footer?: ReactNode;
};

const buildSeriesPalette = (config: StackedBarChartConfig): SeriesWithColor[] => {
  const defaultColors = [
    'var(--series-1)',
    'var(--series-2)',
    'var(--series-3)',
    'var(--series-4)'
  ];
  return config.series.map((series, index) => ({
    ...series,
    color: series.color ?? defaultColors[index % defaultColors.length]
  }));
};

const formatTooltipUnitSuffix = (unit?: string) => {
  if (!unit) return '';
  const sanitized = unit.replace(/usd\s*mm/gi, '').replace(/\s{2,}/g, ' ').trim();
  return sanitized ? ` ${sanitized}` : '';
};

const getTooltipDotStyle = (seriesItem: SeriesWithColor) => {
  if (!seriesItem.hollow) {
    return `background:${seriesItem.color};`;
  }

  const strokeColor = seriesItem.stroke ?? seriesItem.color;
  const strokeWidth = Math.max(1, seriesItem.strokeWidth ?? 1.4);
  const strokeStyle = seriesItem.strokeDasharray ? 'dashed' : 'solid';

  return `background:#ffffff;border:${strokeWidth}px ${strokeStyle} ${strokeColor};box-sizing:border-box;`;
};

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

const StackedBarChartCanvas = ({
  config,
  placeholder = false,
  seriesPalette,
  tooltipFixed = false,
  tooltipRef,
  yMaxOverride,
  footer
}: StackedBarChartCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const internalTooltipRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const pinnedLabelRef = useRef<string | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(
    null
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
    const isCompact = computedWidth < 520;
    const isTiny = computedWidth < 400;
    const isCompactCard = Boolean(
      svgElement.closest('.chart-card')?.classList.contains('chart-card--compact')
    );
    const width = Math.max(computedWidth, isTiny ? 280 : 320);
    const minHeight = isCompactCard ? (isTiny ? 160 : isCompact ? 190 : 220) : isTiny ? 240 : 300;
    const height = Math.max(measuredHeight, minHeight);
    const labelCount = config.data.length;
    const rotateLabels = isCompact && labelCount > 40;
    const defaultMargin = {
      top: isCompactCard ? (isCompact ? 4 : 8) : isCompact ? 24 : 32,
      right: isCompactCard ? (isCompact ? 12 : 18) : isCompact ? 16 : 24,
      bottom: rotateLabels ? 66 : isCompactCard ? (isCompact ? 34 : 40) : isCompact ? 46 : 52,
      left: isCompactCard ? (isCompact ? 42 : 52) : isCompact ? 46 : 64
    };
    const margin = {
      top: config.marginTop ?? defaultMargin.top,
      right: config.marginRight ?? defaultMargin.right,
      bottom: config.marginBottom ?? defaultMargin.bottom,
      left: config.marginLeft ?? defaultMargin.left
    };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    const accent = 'var(--accent)';
    const border = 'var(--card-border)';
    const muted = 'var(--text-muted)';

    const seriesIds = seriesPalette.map((series) => series.id);
    const seriesById = new Map(seriesPalette.map((series) => [series.id, series]));
    if (seriesIds.length === 0) return;
    const segmentBorder = config.segmentBorder ?? 'none';
    const useDashedSegmentBorder = segmentBorder === 'dashed';

    const stackData: StackDatum[] = config.data.map((datum) => {
      const row: StackDatum = { label: datum.label };
      seriesIds.forEach((id) => {
        row[id] = datum.values[id] ?? 0;
      });
      return row;
    });

    const totalsByLabel = new Map<string, number>();
    stackData.forEach((row) => {
      const total = seriesIds.reduce(
        (sum, id) => sum + (typeof row[id] === 'number' ? row[id] : 0),
        0
      );
      totalsByLabel.set(row.label, total);
    });

    const labels = stackData.map((row) => row.label);
    const labelIndexByName = new Map(labels.map((label, index) => [label, index]));
    const maxTotalRaw = d3.max(Array.from(totalsByLabel.values())) ?? 0;
    const maxTotal =
      typeof yMaxOverride === 'number' && yMaxOverride > 0 ? yMaxOverride : maxTotalRaw;

    const x = d3
      .scaleBand<string>()
      .domain(labels)
      .range([0, innerWidth])
      .padding(Math.max(0.12, Math.min(0.8, config.xBandPadding ?? 0.24)));
    const barWidthScale = Math.max(0.7, Math.min(3, config.barWidthScale ?? 1));
    const barWidth = x.bandwidth() * barWidthScale;
    const barXOffset = (x.bandwidth() - barWidth) / 2;
    const getBarX = (label: string) => (x(label) ?? 0) + barXOffset;

    const y = d3
      .scaleLinear()
      .domain([0, maxTotal * 1.08])
      .nice()
      .range([innerHeight, 0]);

    const svg = d3
      .select(svgElement)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const targetTicks = isCompact ? 4 : 6;
    const tickEvery = Math.max(1, Math.ceil(labels.length / targetTicks));
    const configuredTickValues = (config.xTickValues ?? []).filter((label) => labels.includes(label));
    const tickValues = configuredTickValues.length
      ? configuredTickValues
      : labels.filter((_, index) => index % tickEvery === 0);
    const formatTickLabel = (label: string) => (config.xTickFormatter ? config.xTickFormatter(label) : label);
    const xAxis = d3.axisBottom(x).tickValues(tickValues).tickSize(0);
    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    const xAxisLabels = xAxisGroup
      .selectAll('text')
      .attr('class', 'chart-axis-label')
      .attr('fill', muted)
      .style(
        'font-size',
        isCompactCard ? (isCompact ? '0.52rem' : '0.58rem') : isCompact ? '0.68rem' : '0.78rem'
      )
      .style('font-family', "'Source Sans 3', 'Avenir Next', sans-serif")
      .style('font-weight', 600)
      .text((d) => formatTickLabel(String(d)));

    if (rotateLabels) {
      xAxisLabels
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-28)')
        .attr('dx', '-0.4em')
        .attr('dy', '0.6em');
    }

    const yAxis = d3
      .axisLeft(y)
      .ticks(4)
      .tickSize(-innerWidth)
      .tickPadding(isCompact ? 8 : 10);
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
      .style(
        'font-size',
        isCompactCard ? (isCompact ? '0.56rem' : '0.62rem') : isCompact ? '0.68rem' : '0.75rem'
      )
      .style('font-family', "'Source Sans 3', 'Avenir Next', sans-serif")
      .style('font-weight', 600);

    const stackGenerator = d3.stack<StackDatum>().keys(seriesIds);
    const stackedSeries = stackGenerator(stackData);
    const showTooltip = config.showTooltip !== false;
    const showSegmentLabels = Boolean(config.showSegmentLabels);
    const showTotalLabels = Boolean(config.showTotalLabels);
    const minSegmentLabelHeight = isCompact ? 14 : 18;

    const layers = g
      .selectAll<SVGGElement, d3.Series<StackDatum, string>>('g.stacked-bar__layer')
      .data(stackedSeries)
      .join('g')
      .attr('class', 'stacked-bar__layer')
      .attr('data-series', (d) => d.key);

    const projectedTailCount = Math.max(0, Math.floor(config.projectedTailCount ?? 4));
    const projectedLabels = new Set(
      projectedTailCount > 0 ? labels.slice(-projectedTailCount) : []
    );
    const revealSegmentsOnHover = Boolean(config.revealSegmentsOnHover);
    const collapsedSegmentColor = config.collapsedSegmentColor ?? accent;
    const isSegmentExpanded = (segment: SegmentDatum, activeLabel: string | null) =>
      !revealSegmentsOnHover || (activeLabel !== null && segment.label === activeLabel);

    const resolveSegmentFill = (segment: SegmentDatum, activeLabel: string | null) => {
      if (!isSegmentExpanded(segment, activeLabel)) return collapsedSegmentColor;
      const seriesItem = seriesById.get(segment.seriesId);
      if (seriesItem?.hollow) return 'none';
      return seriesItem?.color ?? accent;
    };

    const resolveSegmentStroke = (segment: SegmentDatum, activeLabel: string | null) => {
      if (!isSegmentExpanded(segment, activeLabel)) return 'transparent';
      const seriesItem = seriesById.get(segment.seriesId);
      if (seriesItem?.stroke) return seriesItem.stroke;
      if (seriesItem?.hollow) return seriesItem.stroke ?? 'var(--text-primary)';
      if (useDashedSegmentBorder && Math.abs(segment.y1 - segment.y0) > 1e-6) return 'var(--card-surface)';
      return 'transparent';
    };

    const resolveSegmentStrokeWidth = (segment: SegmentDatum, activeLabel: string | null) => {
      if (!isSegmentExpanded(segment, activeLabel)) return 0;
      const seriesItem = seriesById.get(segment.seriesId);
      if (seriesItem?.stroke) return seriesItem.strokeWidth ?? 1.8;
      if (seriesItem?.hollow) return seriesItem.strokeWidth ?? 2.8;
      return useDashedSegmentBorder ? 1.35 : 0;
    };

    const resolveSegmentStrokeDasharray = (segment: SegmentDatum, activeLabel: string | null) => {
      if (!isSegmentExpanded(segment, activeLabel)) return null;
      const seriesItem = seriesById.get(segment.seriesId);
      if (seriesItem?.stroke) return seriesItem.strokeDasharray ?? null;
      if (seriesItem?.hollow) return seriesItem.strokeDasharray ?? '4 3';
      return useDashedSegmentBorder ? '2 3' : null;
    };

    const resolveSegmentStrokeOpacity = (segment: SegmentDatum, activeLabel: string | null) => {
      if (!isSegmentExpanded(segment, activeLabel)) return 0;
      const seriesItem = seriesById.get(segment.seriesId);
      if (seriesItem?.stroke) return 1;
      if (seriesItem?.hollow) return 1;
      return useDashedSegmentBorder ? 0.92 : 0;
    };

    const segments = layers
      .selectAll<SVGRectElement, SegmentDatum>('rect.stacked-bar__segment')
      .data((series) =>
        series.map((segment) => {
          const label = segment.data.label;
          const total = totalsByLabel.get(label) ?? 0;
          const isTop = Math.abs(segment[1] - total) < 0.001;
          return {
            seriesId: series.key as string,
            label,
            y0: segment[0],
            y1: segment[1],
            value: segment[1] - segment[0],
            total,
            isTop
          };
        })
      )
      .join('rect')
      .attr('class', 'stacked-bar__segment')
      .attr('x', (d) => getBarX(d.label))
      .attr('y', innerHeight)
      .attr('width', barWidth)
      .attr('height', 0)
      .attr('rx', 0)
      .attr('ry', 0)
      .attr('data-projected', (d) => (projectedLabels.has(d.label) ? 'true' : null))
      .attr('data-label', (d) => d.label)
      .attr('fill', (d) => resolveSegmentFill(d, null));

    segments
      .attr('stroke', (d) => resolveSegmentStroke(d, null))
      .attr('stroke-width', (d) => resolveSegmentStrokeWidth(d, null))
      .attr('stroke-dasharray', (d) => resolveSegmentStrokeDasharray(d, null))
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-opacity', (d) => resolveSegmentStrokeOpacity(d, null));

    segments
      .transition()
      .duration(720)
      .delay((_, i) => i * 12)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => y(d.y1))
      .attr('height', (d) => Math.max(0, y(d.y0) - y(d.y1)));

    const formatValue = (value: number) => {
      if (config.valueFormat === 'integer') return d3.format(',.0f')(value);
      if (maxTotal >= 1000) return d3.format(',.0f')(value);
      if (maxTotal >= 100) return d3.format(',.1f')(value);
      if (maxTotal >= 10) return d3.format(',.2f')(value);
      return d3.format('.2f')(value);
    };
    const labelUnitSuffix = config.unit ? ` ${config.unit}` : '';
    const tooltipUnitSuffix = formatTooltipUnitSuffix(config.unit);
    const totalUnitSuffix = config.showTotalLabelUnit === false ? '' : labelUnitSuffix;
    const totalLabelPrefix = config.totalLabelPrefix ?? '';
    const tooltipTotalLabel = config.tooltipTotalLabel ?? 'Total';

    const segmentLabelData = showSegmentLabels
      ? stackedSeries.flatMap((series) =>
          series.map((segment) => {
            const label = segment.data.label;
            const total = totalsByLabel.get(label) ?? 0;
            const isTop = Math.abs(segment[1] - total) < 0.001;
            return {
              label,
              seriesId: series.key as string,
              y0: segment[0],
              y1: segment[1],
              value: segment[1] - segment[0],
              total,
              isTop
            };
          })
        )
      : [];

    const getSegmentLabelOpacity = (label: SegmentDatum & { value: number }, activeLabel: string | null) => {
      const height = y(label.y0) - y(label.y1);
      if (height < minSegmentLabelHeight || label.value <= 0) return 0;
      if (!activeLabel) return 1;
      return label.label === activeLabel ? 1 : 0.2;
    };

    const segmentLogoMap = new Map(
      (config.segmentLogos ?? []).map((entry) => [`${entry.label}::${entry.seriesId}`, entry.logos])
    );

    const segmentLogosData = stackedSeries.flatMap((series) =>
      series
        .map((segment) => {
          const label = segment.data.label;
          const seriesId = series.key as string;
          const logos = segmentLogoMap.get(`${label}::${seriesId}`) ?? [];
          if (!logos.length) return null;
          const value = segment[1] - segment[0];
          if (value <= 0) return null;
          return {
            label,
            seriesId,
            y0: segment[0],
            y1: segment[1],
            logos
          };
        })
        .filter(
          (entry): entry is { label: string; seriesId: string; y0: number; y1: number; logos: string[] } =>
            Boolean(entry)
        )
    );

    const segmentLabels = g
      .selectAll<SVGTextElement, SegmentDatum & { value: number }>('text.stacked-bar__segment-label')
      .data(segmentLabelData)
      .join('text')
      .attr('class', 'stacked-bar__segment-label')
      .attr('fill', (d) =>
        config.segmentLabelColor ??
        (seriesById.get(d.seriesId)?.hollow ? 'var(--text-primary)' : 'var(--ds-color-london-100)')
      )
      .attr('stroke', (d) =>
        config.segmentLabelColor
          ? null
          : seriesById.get(d.seriesId)?.hollow
            ? 'rgba(255,255,255,0.85)'
            : null
      )
      .attr('x', (d) => getBarX(d.label) + barWidth / 2)
      .attr('y', (d) => y(d.y1))
      .attr('text-anchor', 'middle')
      .text((d) => formatValue(d.value))
      .style('opacity', (d) => getSegmentLabelOpacity(d, null));

    if (showSegmentLabels) {
      segmentLabels
        .transition()
        .duration(720)
        .delay((_, i) => i * 12)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => y(d.y1 + (d.y0 - d.y1) / 2));
    }

    const isGreenLogoHref = (href: string) => /green/i.test(href);

    const segmentLogoItems = segmentLogosData.flatMap((segment) => {
      const logos = segment.logos.filter(Boolean);
      if (!logos.length) return [];

      const segmentTop = y(segment.y1);
      const segmentBottom = y(segment.y0);
      const segmentHeight = Math.max(0, segmentBottom - segmentTop);
      const segmentRight = getBarX(segment.label) + barWidth;
      const segmentCenterY = segmentTop + segmentHeight / 2;
      const outsideGap = Math.max(8, Math.round(x.step() * 0.1));
      const topInset = 2;
      const items: Array<{ key: string; href: string; label: string; x: number; y: number; size: number }> = [];
      const segmentIndex = labelIndexByName.get(segment.label) ?? -1;
      const nextLabel = segmentIndex >= 0 ? labels[segmentIndex + 1] : undefined;
      const nextBarLeft = nextLabel ? getBarX(nextLabel) : null;

      const greenLogo = logos.find((href) => isGreenLogoHref(href)) ?? null;
      const otherLogos = logos.filter((href) => !isGreenLogoHref(href)).slice(0, 3);

      let greenSize = 0;
      if (greenLogo) {
        const sizeByWidth = Math.round(x.step() * 0.34);
        const sizeByHeight = Math.round(segmentHeight * 0.72);
        greenSize = Math.min(34, Math.max(18, Math.min(sizeByWidth, sizeByHeight)));
        if (greenSize >= 14) {
          const proposedX = segmentRight - greenSize * 0.32;
          const proposedY = segmentTop - greenSize * 0.24;
          const maxX =
            nextBarLeft != null
              ? Math.min(nextBarLeft - greenSize - 4, innerWidth - greenSize - 1)
              : innerWidth - greenSize - 1;
          items.push({
            key: `${segment.label}-${segment.seriesId}-green`,
            href: greenLogo,
            label: segment.label,
            x: Math.max(0, Math.min(proposedX, maxX)),
            y: Math.max(topInset, Math.min(proposedY, innerHeight - greenSize - 1)),
            size: greenSize
          });
        }
      }

      if (otherLogos.length > 0) {
        const sizeByWidth = Math.round(x.step() * 0.38);
        const sizeByHeight = Math.round(segmentHeight * 0.98);
        let iconSize = Math.min(40, Math.max(22, Math.min(sizeByWidth, sizeByHeight)));
        if (nextBarLeft != null) {
          const maxSizeByNextBar = Math.max(14, nextBarLeft - (segmentRight + outsideGap) - 4);
          iconSize = Math.min(iconSize, maxSizeByNextBar);
        }
        const gap = Math.max(5, Math.floor(iconSize * 0.28));
        const totalHeight = otherLogos.length * iconSize + (otherLogos.length - 1) * gap;
        const proposedStartY = segmentCenterY - totalHeight / 2;
        const startY = Math.max(topInset, Math.min(proposedStartY, innerHeight - totalHeight - topInset));
        const proposedX = segmentRight + outsideGap;
        const maxXByNextBar =
          nextBarLeft != null
            ? Math.min(nextBarLeft - iconSize - 4, innerWidth - iconSize - 1)
            : innerWidth - iconSize - 1;
        const iconX = Math.max(segmentRight + 2, Math.min(proposedX, maxXByNextBar));

        otherLogos.forEach((href, index) => {
          items.push({
            key: `${segment.label}-${segment.seriesId}-right-${index}`,
            href,
            label: segment.label,
            x: iconX,
            y: startY + index * (iconSize + gap),
            size: iconSize
          });
        });
      }

      return items;
    });

    const segmentLogos = g
      .selectAll<SVGImageElement, { key: string; href: string; label: string; x: number; y: number; size: number }>(
        'image.stacked-bar__segment-logo'
      )
      .data(segmentLogoItems)
      .join('image')
      .attr('class', 'stacked-bar__segment-logo')
      .attr('href', (d) => d.href)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('width', (d) => d.size)
      .attr('height', (d) => d.size)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    segmentLogos
      .transition()
      .duration(720)
      .delay((_, i) => i * 12)
      .ease(d3.easeCubicOut)
      .style('opacity', 1);

    const totalLabelsData = stackData.map((row) => ({
      label: row.label,
      total: totalsByLabel.get(row.label) ?? 0
    }));

    const totalLabels = g
      .selectAll<SVGTextElement, { label: string; total: number }>('text.stacked-bar__total')
      .data(totalLabelsData)
      .join('text')
      .attr('class', 'stacked-bar__total')
      .attr('x', (d) => getBarX(d.label) + barWidth / 2)
      .attr('y', (d) => y(d.total) - 12)
      .attr('text-anchor', 'middle')
      .attr('fill', config.totalLabelColor ?? accent)
      .style('font-size', config.totalLabelFontSize ?? (isCompact ? '0.7rem' : '0.78rem'))
      .style('font-weight', 600)
      .style('opacity', showTotalLabels ? 1 : 0)
      .text((d) => `${totalLabelPrefix}${formatValue(d.total)}${totalUnitSuffix}`);

    const focusLine = g
      .append('line')
      .attr('class', 'chart-focus-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', border)
      .attr('stroke-dasharray', '2 2')
      .attr('opacity', 0);

    const overlay = g
      .append('rect')
      .attr('class', 'chart-overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent');

    const dataByLabel = new Map(config.data.map((datum) => [datum.label, datum]));
    const bandCenters = labels.map((label) => (x(label) ?? 0) + x.bandwidth() / 2);
    const tooltipElement = tooltipRef?.current ?? internalTooltipRef.current;
    const tooltip = tooltipElement ? d3.select(tooltipElement) : null;
    const tooltipLabel = tooltip?.select('.chart-tooltip__label') ?? null;
    const tooltipRows = tooltip?.select('.chart-tooltip__rows') ?? null;
    const isLegendTooltip = tooltipElement?.classList.contains('global-legend') ?? false;
    const legendItems = isLegendTooltip
      ? tooltip?.selectAll<HTMLDivElement, unknown>('.global-legend__item')
      : null;
    const legendDate = isLegendTooltip
      ? tooltip?.select<HTMLSpanElement>('.global-legend__date')
      : null;

    const positionTooltipAtPoint = (xPos: number, yPos: number, bodyRect: DOMRect) => {
      if (!tooltipElement) return;

      const tooltipEl = tooltipElement;
      const padding = 8;
      const tooltipWidth = tooltipEl.offsetWidth;
      const tooltipHeight = tooltipEl.offsetHeight;
      let left = xPos + padding;
      let top = yPos - tooltipHeight - padding;

      if (left + tooltipWidth > bodyRect.width - 8) {
        left = xPos - tooltipWidth - padding;
      }

      if (top < 8) {
        top = yPos + padding;
      }

      left = Math.min(Math.max(8, left), bodyRect.width - tooltipWidth - 8);
      top = Math.min(Math.max(8, top), bodyRect.height - tooltipHeight - 8);

      tooltipEl.style.transform = `translate(${left}px, ${top}px)`;
    };

    const positionTooltipFromClient = (clientX: number, clientY: number) => {
      if (!tooltipElement || tooltipFixed) return;
      const bodyRect = container.getBoundingClientRect();
      const xPos = clientX - bodyRect.left;
      const yPos = clientY - bodyRect.top;
      positionTooltipAtPoint(xPos, yPos, bodyRect);
    };

    const positionTooltipFromDatum = (label: string) => {
      if (!tooltipElement || tooltipFixed) return;
      const bodyRect = container.getBoundingClientRect();
      const svgRect = svgElement.getBoundingClientRect();
      const offsetX = svgRect.left - bodyRect.left;
      const offsetY = svgRect.top - bodyRect.top;
      const total = totalsByLabel.get(label) ?? 0;
      const xPos = offsetX + margin.left + (x(label) ?? 0) + x.bandwidth() / 2;
      const yPos = offsetY + margin.top + y(total);
      positionTooltipAtPoint(xPos, yPos, bodyRect);
    };

    const showTooltipForLabel = (label: string, clientX?: number, clientY?: number) => {
      if (!showTooltip) return;
      if (!tooltip) return;
      const datum = dataByLabel.get(label);
      if (!datum) return;
      const tooltipSkipZero = Boolean(config.tooltipSkipZero);
      const isZero = (value: number) => Math.abs(value) < 1e-6;

      if (isLegendTooltip && legendItems) {
        legendDate?.text(label);
        legendItems.each((_, index, nodes) => {
          const node = nodes[index] as HTMLDivElement;
          const seriesId = node.getAttribute('data-series-id');
          if (!seriesId) return;
          const value = datum.values[seriesId] ?? 0;
          const valueEl = node.querySelector<HTMLSpanElement>('.global-legend__value');
          if (valueEl) {
            valueEl.textContent = `${formatValue(value)}${tooltipUnitSuffix}`;
          }
        });
        return;
      }

      if (!tooltipLabel || !tooltipRows) return;

      tooltipLabel.text(label);
      const rowsHtml = seriesPalette
        .map((seriesItem) => {
          const value = datum.values[seriesItem.id] ?? 0;
          if (tooltipSkipZero && isZero(value)) {
            return '';
          }
          return `
              <div class="chart-tooltip__row">
                <span class="chart-tooltip__dot" style="${getTooltipDotStyle(seriesItem)}"></span>
                <span class="chart-tooltip__name">${seriesItem.label}</span>
                <span class="chart-tooltip__row-value">${formatValue(value)}${tooltipUnitSuffix}</span>
              </div>
            `;
        })
        .join('');

      const total = totalsByLabel.get(label) ?? 0;
      const totalHtml = `
        <div class="chart-tooltip__row chart-tooltip__row--total">
          <span class="chart-tooltip__dot" style="background:${accent};"></span>
          <span class="chart-tooltip__name">${tooltipTotalLabel}</span>
          <span class="chart-tooltip__row-value">${formatValue(total)}${tooltipUnitSuffix}</span>
        </div>
      `;

      tooltipRows.html(rowsHtml + totalHtml);
      tooltip.attr('data-state', 'visible');

      if (!tooltipFixed) {
        if (clientX != null && clientY != null) {
          positionTooltipFromClient(clientX, clientY);
        } else {
          positionTooltipFromDatum(label);
        }
      }
    };

    const hideTooltip = () => {
      if (!showTooltip) return;
      if (!tooltip) return;
      if (isLegendTooltip && legendItems) {
        legendItems.each((_, index, nodes) => {
          const node = nodes[index] as HTMLDivElement;
          const valueEl = node.querySelector<HTMLSpanElement>('.global-legend__value');
          if (valueEl) {
            valueEl.textContent = '';
          }
        });
        legendDate?.text('');
        return;
      }
      if (tooltipFixed) {
        if (!tooltipLabel || !tooltipRows) return;
        const rowsHtml = seriesPalette
          .map(
            (seriesItem) => `
              <div class="chart-tooltip__row">
                <span class="chart-tooltip__dot" style="${getTooltipDotStyle(seriesItem)}"></span>
                <span class="chart-tooltip__name">${seriesItem.label}</span>
                <span class="chart-tooltip__row-value"></span>
              </div>
            `
          )
          .join('');
        const totalHtml = `
          <div class="chart-tooltip__row chart-tooltip__row--total">
            <span class="chart-tooltip__dot" style="background:${accent};"></span>
            <span class="chart-tooltip__name">${tooltipTotalLabel}</span>
            <span class="chart-tooltip__row-value"></span>
          </div>
        `;
        tooltipLabel.text('');
        tooltipRows.html(rowsHtml + totalHtml);
        tooltip.attr('data-state', 'visible');
        return;
      }
      tooltip.attr('data-state', 'hidden');
    };

    const applyActive = (label: string | null) => {
      segments
        .attr('fill', (d) => resolveSegmentFill(d, label))
        .attr('stroke', (d) => resolveSegmentStroke(d, label))
        .attr('stroke-width', (d) => resolveSegmentStrokeWidth(d, label))
        .attr('stroke-dasharray', (d) => resolveSegmentStrokeDasharray(d, label))
        .attr('stroke-opacity', (d) => resolveSegmentStrokeOpacity(d, label));

      segments
        .attr('data-active', (d) => (label && d.label === label ? 'true' : null))
        .attr('data-dimmed', (d) => (label && d.label !== label ? 'true' : null));

      if (showTotalLabels) {
        totalLabels.style('opacity', (d) => (label ? (d.label === label ? 1 : 0.45) : 1));
      } else {
        totalLabels.style('opacity', (d) => (label && d.label === label ? 1 : 0));
      }
      segmentLabels.style('opacity', (d) => getSegmentLabelOpacity(d, label));
      segmentLogos.style('opacity', (d) => (label ? (d.label === label ? 1 : 0.25) : 1));

      if (label) {
        const xPos = (x(label) ?? 0) + x.bandwidth() / 2;
        focusLine.attr('opacity', 0.85).attr('x1', xPos).attr('x2', xPos);
      } else {
        focusLine.attr('opacity', 0);
      }

      xAxisGroup
        .selectAll<SVGTextElement, string>('text.chart-axis-label')
        .attr('fill', (d) => (label && d === label ? 'var(--text-primary)' : muted))
        .style('font-weight', (d) => (label && d === label ? 700 : 600));
    };

    const getNearestLabel = (xPos: number) => {
      if (labels.length === 0) return null;
      let nearestIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      bandCenters.forEach((center, index) => {
        const distance = Math.abs(center - xPos);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = index;
        }
      });

      return labels[nearestIndex] ?? null;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const [svgX] = d3.pointer(event, svgElement);
      const relativeX = Math.max(0, Math.min(innerWidth, svgX - margin.left));
      const nearest = getNearestLabel(relativeX);
      if (!nearest) return;
      applyActive(nearest);
      showTooltipForLabel(nearest, event.clientX, event.clientY);
    };

    const handlePointerLeave = () => {
      const pinnedLabel = pinnedLabelRef.current;
      if (pinnedLabel) {
        const datum = dataByLabel.get(pinnedLabel);
        if (datum) {
          applyActive(pinnedLabel);
          showTooltipForLabel(pinnedLabel);
          return;
        }
      }
      applyActive(null);
      hideTooltip();
    };

    const handleClick = (event: PointerEvent) => {
      const [svgX] = d3.pointer(event, svgElement);
      const relativeX = Math.max(0, Math.min(innerWidth, svgX - margin.left));
      const nearest = getNearestLabel(relativeX);
      if (!nearest) return;

      const pinnedLabel = pinnedLabelRef.current;
      const nextLabel = pinnedLabel === nearest ? null : nearest;
      pinnedLabelRef.current = nextLabel;

      if (nextLabel) {
        applyActive(nextLabel);
        showTooltipForLabel(nextLabel);
      } else {
        applyActive(null);
        hideTooltip();
      }
    };

    overlay
      .on('pointermove', handlePointerMove)
      .on('pointerleave', handlePointerLeave);
    if (showTooltip && !tooltipFixed) {
      overlay.on('click', handleClick);
    } else {
      overlay.on('click', null);
    }

    const pinnedLabel = pinnedLabelRef.current;
    if (pinnedLabel) {
      const datum = dataByLabel.get(pinnedLabel);
      if (datum) {
        applyActive(pinnedLabel);
        showTooltipForLabel(pinnedLabel);
      } else {
        pinnedLabelRef.current = null;
        applyActive(null);
        hideTooltip();
      }
    } else {
      applyActive(null);
      hideTooltip();
    }
  }, [
    config,
    containerSize,
    placeholder,
    seriesPalette,
    tooltipFixed,
    yMaxOverride,
    tooltipRef
  ]);

  if (placeholder) {
    return <div className="chart-card__body" />;
  }

  const bodyClassName = footer ? 'chart-card__body chart-card__body--with-footer' : 'chart-card__body';

  return (
    <div className={bodyClassName}>
      <svg ref={svgRef} role="img" aria-label={config.title} />
      {config.showTooltip !== false && !tooltipRef && (
        <div
          ref={internalTooltipRef}
          className={`chart-tooltip chart-tooltip--multi${
            tooltipFixed ? ' chart-tooltip--fixed' : ''
          }`}
          role="status"
        >
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
  );
};

const StackedBarChartPanel = ({
  config,
  placeholder = false,
  seriesPalette,
  showFullscreen = false,
  showLegend = true,
  isFullscreen = false,
  onToggleFullscreen,
  className,
  tooltipFixed = false,
  yMaxOverride,
  tooltipRef,
  actions,
  headerExtras,
  footer
}: StackedBarChartPanelProps) => {
  const cardClasses = ['chart-card'];
  if (className) cardClasses.push(className);
  if (isFullscreen) cardClasses.push('chart-card--fullscreen');
  const fixedTooltipRef = useRef<HTMLDivElement>(null);
  const resolvedTooltipRef = tooltipRef ?? (tooltipFixed ? fixedTooltipRef : undefined);

  if (placeholder) {
    return <div className={`${cardClasses.join(' ')} chart-card--placeholder`} aria-hidden="true" />;
  }

  return (
    <div className={cardClasses.join(' ')}>
      <div className="chart-card__header">
        <div>
          <p className="chart-card__eyebrow">{config.subtitle}</p>
          <h3>{config.title}</h3>
          {headerExtras && <div className="chart-card__header-extras">{headerExtras}</div>}
        </div>
        <div className="chart-card__meta">
          {config.showTooltip !== false && tooltipFixed && !tooltipRef && (
            <div
              ref={fixedTooltipRef}
              className="chart-tooltip chart-tooltip--multi chart-tooltip--fixed"
              role="status"
            >
              <span className="chart-tooltip__label" />
              <div className="chart-tooltip__rows" />
            </div>
          )}
          {showLegend && (
            <div className="chart-card__legend">
              {seriesPalette.map((series) => (
                <div key={series.id} className="chart-card__legend-item">
                  <span className="chart-card__legend-swatch" style={{ background: series.color }} />
                  <span>{series.label}</span>
                </div>
              ))}
            </div>
          )}
          <div className="chart-card__actions">
            {actions}
            {showFullscreen && onToggleFullscreen && (
              <button
                type="button"
                className="chart-card__action-btn"
                onClick={onToggleFullscreen}
                aria-label={
                  isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'
                }
              >
                <FullscreenIcon isOpen={isFullscreen} />
                <span className="chart-card__action-label">
                  {isFullscreen ? 'Salir' : 'Pantalla completa'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
      <StackedBarChartCanvas
        config={config}
        placeholder={placeholder}
        seriesPalette={seriesPalette}
        tooltipFixed={tooltipFixed}
        tooltipRef={resolvedTooltipRef}
        yMaxOverride={yMaxOverride}
        footer={footer}
      />
    </div>
  );
};

const StackedBarChartCard = ({
  config,
  placeholder = false,
  enableFullscreen = false,
  showLegend = true,
  className,
  tooltipFixed = false,
  yMaxOverride,
  tooltipRef,
  actions,
  headerExtras,
  footer
}: StackedBarChartCardProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const seriesPalette = useMemo(() => buildSeriesPalette(config), [config]);
  const previousOverflowRef = useRef('');

  useEffect(() => {
    if (!enableFullscreen || !isFullscreen) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflowRef.current;
    };
  }, [enableFullscreen, isFullscreen]);

  const closeModal = () => setIsFullscreen(false);
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  const modal =
    enableFullscreen &&
    isFullscreen &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        className="chart-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Pantalla completa: ${config.title}`}
      >
        <div className="chart-modal__backdrop" onClick={closeModal} />
        <div className="chart-modal__content">
          <StackedBarChartPanel
            config={config}
            seriesPalette={seriesPalette}
            showFullscreen
            showLegend={showLegend}
            isFullscreen
            onToggleFullscreen={closeModal}
            tooltipFixed={tooltipFixed}
            yMaxOverride={undefined}
            tooltipRef={undefined}
            actions={actions}
            headerExtras={headerExtras}
            footer={footer}
          />
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <StackedBarChartPanel
        config={config}
        placeholder={placeholder}
        seriesPalette={seriesPalette}
        showFullscreen={enableFullscreen}
        showLegend={showLegend}
        isFullscreen={false}
        onToggleFullscreen={toggleFullscreen}
        className={className}
        tooltipFixed={tooltipFixed}
        yMaxOverride={yMaxOverride}
        tooltipRef={tooltipRef}
        actions={actions}
        headerExtras={headerExtras}
        footer={footer}
      />
      {modal}
    </>
  );
};

export default StackedBarChartCard;
