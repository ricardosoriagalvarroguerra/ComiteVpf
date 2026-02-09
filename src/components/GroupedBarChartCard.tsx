import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { GroupedBarChartConfig, GroupedBarSeries } from '../types/slides';

type GroupedBarChartCardProps = {
  config: GroupedBarChartConfig;
  placeholder?: boolean;
  className?: string;
  hoverLabel?: string | null;
  onHoverLabelChange?: (label: string | null) => void;
  hideTooltip?: boolean;
  hideHeader?: boolean;
};

const buildSeriesPalette = (config: GroupedBarChartConfig): Array<GroupedBarSeries & { color: string }> => {
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

const GroupedBarChartCard = ({
  config,
  placeholder = false,
  className,
  hoverLabel = null,
  onHoverLabelChange,
  hideTooltip: hideTooltipProp = false,
  hideHeader = false
}: GroupedBarChartCardProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);
  const applyActiveRef = useRef<(label: string | null) => void>(() => {});
  const hoverLabelRef = useRef<string | null>(hoverLabel);
  const onHoverLabelChangeRef = useRef<typeof onHoverLabelChange>(onHoverLabelChange);

  useEffect(() => {
    onHoverLabelChangeRef.current = onHoverLabelChange;
  }, [onHoverLabelChange]);

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

    const computedWidth = containerSize?.width ?? container.clientWidth ?? 520;
    const measuredHeight =
      containerSize?.height ?? container.clientHeight ?? svgElement.getBoundingClientRect().height;
    const isCompact = computedWidth < 520;
    const isHorizontal = config.orientation === 'horizontal';
    const isMini = Boolean(className?.includes('grouped-bar-card--mini'));
    const width = Math.max(computedWidth, 320);
    const height = isMini ? Math.max(measuredHeight, 60) : Math.max(measuredHeight, 240);
    const lineLikeIsCompact = computedWidth < 560;
    const miniAlignedMargin = {
      top: 8,
      right: lineLikeIsCompact ? 40 : 42,
      bottom: 14,
      left: lineLikeIsCompact ? 14 : 26
    };

    const margin = isMini
      ? miniAlignedMargin
      : {
          top: 24,
          right: isHorizontal ? 36 : 24,
          bottom: isHorizontal ? 36 : isCompact ? 50 : 48,
          left: isHorizontal ? 80 : 56
        };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    const border = 'var(--card-border)';
    const muted = 'var(--text-muted)';
    const seriesPalette = buildSeriesPalette(config);
    const seriesIds = seriesPalette.map((series) => series.id);

    const svg = d3
      .select(svgElement)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const maxValue =
      d3.max(config.data, (d) => d3.max(seriesIds, (id) => d.values[id] ?? 0) ?? 0) ?? 0;

    const formatValue = (value: number) => {
      if (maxValue >= 100) return d3.format(',.0f')(value);
      if (maxValue >= 10) return d3.format(',.1f')(value);
      return d3.format('.2f')(value);
    };

    const tooltip = tooltipRef.current ? d3.select(tooltipRef.current) : null;
    const showTooltip = (label: string, seriesLabel: string, value: number, color: string) => {
      if (!tooltip || hideTooltipProp) return;
      tooltip.select('.chart-tooltip__label').text(label);
      tooltip.select('.chart-tooltip__series').text(seriesLabel);
      tooltip.select('.chart-tooltip__value').text(formatValue(value));
      tooltip.select('.chart-tooltip__swatch').style('background', color);
      tooltip.attr('data-state', 'visible');
    };
    const hideTooltipFn = () => {
      if (!tooltip) return;
      tooltip.attr('data-state', 'hidden');
    };

    const displayLabelById = new Map(
      config.data.map((datum) => [datum.label, datum.displayLabel ?? datum.label])
    );

    const applyActive = (label: string | null) => {
      g.selectAll<SVGRectElement, { groupLabel: string }>('rect')
        .attr('data-active', (d) => (label && d.groupLabel === label ? 'true' : null))
        .attr('data-dimmed', (d) => (label && d.groupLabel !== label ? 'true' : null));
      g.selectAll<SVGTextElement, string>('text.chart-axis-label')
        .attr('fill', (d) => (label && d === label ? 'var(--text-primary)' : 'var(--text-muted)'))
        .style('font-weight', (d) => (label && d === label ? 700 : 600));
    };
    applyActiveRef.current = applyActive;

    if (isHorizontal) {
      const y0 = d3
        .scaleBand<string>()
        .domain(config.data.map((d) => d.label))
        .range([0, innerHeight])
        .paddingInner(isMini ? 0.08 : 0.22)
        .paddingOuter(isMini ? 0.02 : 0.11);

      const y1 = d3
        .scaleBand<string>()
        .domain(seriesIds)
        .range([0, y0.bandwidth()])
        .paddingInner(isMini ? 0.04 : 0.12)
        .paddingOuter(isMini ? 0 : 0.06);

      const x = d3
        .scaleLinear()
        .domain([0, maxValue * 1.12])
        .nice()
        .range([0, innerWidth]);

      if (!isMini) {
        const xAxis = d3.axisBottom(x).ticks(4).tickSize(-innerHeight).tickPadding(8);
        const xAxisGroup = g
          .append('g')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(xAxis);
        xAxisGroup
          .selectAll('line')
          .attr('stroke', border)
          .attr('stroke-dasharray', '2 2')
          .attr('opacity', 0.55);
        xAxisGroup.select('.domain').attr('stroke', 'transparent');
        xAxisGroup
          .selectAll('text')
          .attr('fill', muted)
          .style('font-size', isCompact ? '0.68rem' : '0.75rem')
          .style('font-family', "'Source Sans 3', 'Avenir Next', sans-serif")
          .style('font-weight', 600);

        const yAxis = d3
          .axisLeft(y0)
          .tickSize(0)
          .tickFormat((value) => displayLabelById.get(String(value)) ?? String(value));
        const yAxisGroup = g.append('g').call(yAxis);
        yAxisGroup
          .selectAll('text')
          .attr('class', 'chart-axis-label')
          .attr('fill', muted)
          .style('font-size', isCompact ? '0.7rem' : '0.82rem')
          .style('font-family', "'Source Sans 3', 'Avenir Next', sans-serif")
          .style('font-weight', 600);
      }

      const group = g
        .selectAll('g.group')
        .data(config.data)
        .join('g')
        .attr('class', 'group')
        .attr('transform', (d) => `translate(0,${y0(d.label) ?? 0})`);

      const bars = group
        .selectAll('rect')
        .data((d) =>
          seriesPalette.map((series) => ({
            seriesId: series.id,
            seriesLabel: series.label,
            groupLabel: d.label,
            value: d.values[series.id] ?? 0,
            color: series.color
          }))
        )
        .join('rect')
        .attr('class', 'grouped-bar__bar')
        .attr('x', 0)
        .attr('y', (d) => y1(d.seriesId) ?? 0)
        .attr('height', y1.bandwidth())
        .attr('width', 0)
        .attr('rx', isMini ? 0 : 1)
        .attr('fill', (d) => d.color)
        .style('cursor', 'pointer')
        .on('mouseenter', function (_, d) {
          d3.select(this).attr('opacity', 0.85);
          if (onHoverLabelChangeRef.current && hoverLabelRef.current !== d.groupLabel) {
            hoverLabelRef.current = d.groupLabel;
            onHoverLabelChangeRef.current(d.groupLabel);
          }
          showTooltip(d.groupLabel, d.seriesLabel, d.value, d.color);
        })
        .on('mouseleave', function () {
          d3.select(this).attr('opacity', 1);
          if (onHoverLabelChangeRef.current) {
            hoverLabelRef.current = null;
            onHoverLabelChangeRef.current(null);
          }
          hideTooltipFn();
        });

      bars
        .transition()
        .duration(720)
        .delay((_, i) => i * 40)
        .ease(d3.easeCubicOut)
        .attr('width', (d) => x(d.value));

      if (config.showValueLabels) {
        group
          .selectAll('text')
          .data((d) =>
            seriesPalette.map((series) => ({
              seriesId: series.id,
              value: d.values[series.id] ?? 0,
              color: series.color
            }))
          )
          .join('text')
          .attr('x', (d) => x(d.value) + 8)
          .attr('y', (d) => (y1(d.seriesId) ?? 0) + y1.bandwidth() / 2)
          .attr('dominant-baseline', 'middle')
          .attr('fill', (d) => d.color)
          .style('font-size', config.valueLabelFontSize ?? (isCompact ? '0.68rem' : '0.76rem'))
          .style('font-weight', 600)
          .text((d) => formatValue(d.value));
      }
    } else {
      const parseMiniDate = (value: string) => {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      };
      const miniDates = isMini ? config.data.map((datum) => parseMiniDate(datum.label)) : [];
      const useMiniTimeAlignment = isMini && miniDates.every((date) => date !== null);
      const miniDateByLabel = useMiniTimeAlignment
        ? new Map(
            config.data.map((datum, index) => [datum.label, miniDates[index] as Date])
          )
        : null;

      const x0 = d3
        .scaleBand<string>()
        .domain(config.data.map((d) => d.label))
        .range([0, innerWidth])
        .paddingInner(isMini ? 0.01 : 0.22)
        .paddingOuter(isMini ? 0.005 : 0.11);

      let x1RangeWidth = x0.bandwidth();
      let miniTimeX:
        | d3.ScaleTime<number, number, never>
        | null = null;

      if (useMiniTimeAlignment && miniDateByLabel) {
        const dates = config.data
          .map((datum) => miniDateByLabel.get(datum.label))
          .filter((date): date is Date => Boolean(date))
          .sort((a, b) => a.getTime() - b.getTime());
        const domainStart = dates[0];
        const domainEnd = dates[dates.length - 1];
        if (domainStart && domainEnd) {
          miniTimeX = d3.scaleTime().domain([domainStart, domainEnd]).range([0, innerWidth]);
          const positions = dates.map((date) => miniTimeX?.(date) ?? 0);
          const spacing =
            positions.length > 1
              ? d3.min(
                  positions.slice(1).map((value, index) => value - positions[index])
                ) ?? 0
              : innerWidth;
          x1RangeWidth = Math.max(6, spacing * 0.82);
        }
      }

      const x1 = d3
        .scaleBand<string>()
        .domain(seriesIds)
        .range([0, x1RangeWidth])
        .paddingInner(isMini ? 0 : 0.12)
        .paddingOuter(isMini ? 0 : 0.06);

      const yHeadroom = isMini ? 1.04 : 1.12;
      const y = d3
        .scaleLinear()
        .domain([0, maxValue * yHeadroom])
        .nice()
        .range([innerHeight, 0]);

      if (!isMini) {
        const xAxis = d3
          .axisBottom(x0)
          .tickSize(0)
          .tickFormat((value) => displayLabelById.get(String(value)) ?? String(value));
        const xAxisGroup = g
          .append('g')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(xAxis);

        xAxisGroup
          .selectAll('text')
          .attr('class', 'chart-axis-label')
          .attr('fill', muted)
          .style('font-size', isCompact ? '0.7rem' : '0.82rem')
          .style('font-family', "'Source Sans 3', 'Avenir Next', sans-serif")
          .style('font-weight', 600);

        const yAxis = d3.axisLeft(y).ticks(4).tickSize(-innerWidth).tickPadding(8);
        const yAxisGroup = g.append('g').call(yAxis);

        yAxisGroup
          .selectAll('line')
          .attr('stroke', border)
          .attr('stroke-dasharray', '2 2')
          .attr('opacity', 0.55);
        yAxisGroup.select('.domain').attr('stroke', 'transparent');
        yAxisGroup
          .selectAll('text')
          .attr('fill', muted)
          .style('font-size', isCompact ? '0.68rem' : '0.75rem')
          .style('font-family', "'Source Sans 3', 'Avenir Next', sans-serif")
          .style('font-weight', 600);
      }

      const group = g
        .selectAll('g.group')
        .data(config.data)
        .join('g')
        .attr('class', 'group')
        .attr('transform', (d) => {
          if (miniTimeX && miniDateByLabel) {
            const date = miniDateByLabel.get(d.label);
            const center = date ? miniTimeX(date) : 0;
            return `translate(${center - x1RangeWidth / 2},0)`;
          }
          return `translate(${x0(d.label) ?? 0},0)`;
        });

      const bars = group
        .selectAll('rect')
        .data((d) =>
          seriesPalette.map((series) => ({
            seriesId: series.id,
            seriesLabel: series.label,
            groupLabel: d.label,
            value: d.values[series.id] ?? 0,
            color: series.color
          }))
        )
        .join('rect')
        .attr('class', 'grouped-bar__bar')
        .attr('x', (d) => x1(d.seriesId) ?? 0)
        .attr('y', innerHeight)
        .attr('width', x1.bandwidth())
        .attr('height', 0)
        .attr('rx', isMini ? 0 : 1)
        .attr('fill', (d) => d.color)
        .style('cursor', 'pointer')
        .on('mouseenter', function (_, d) {
          d3.select(this).attr('opacity', 0.85);
          onHoverLabelChangeRef.current?.(d.groupLabel);
          showTooltip(d.groupLabel, d.seriesLabel, d.value, d.color);
        })
        .on('mouseleave', function () {
          d3.select(this).attr('opacity', 1);
          onHoverLabelChangeRef.current?.(null);
          hideTooltipFn();
        });

      bars
        .transition()
        .duration(720)
        .delay((_, i) => i * 40)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => y(d.value))
        .attr('height', (d) => innerHeight - y(d.value));

      if (config.showValueLabels) {
        group
          .selectAll('text')
          .data((d) =>
            seriesPalette.map((series) => ({
              seriesId: series.id,
              value: d.values[series.id] ?? 0,
              color: series.color
            }))
          )
          .join('text')
          .attr('x', (d) => (x1(d.seriesId) ?? 0) + x1.bandwidth() / 2)
          .attr('y', (d) => Math.max(6, y(d.value) - (isMini ? 2 : 8)))
          .attr('text-anchor', 'middle')
          .attr('fill', (d) => d.color)
          .style('font-size', config.valueLabelFontSize ?? (isCompact ? '0.68rem' : '0.76rem'))
          .style('font-weight', 600)
          .text((d) => formatValue(d.value));
      }
    }
    applyActive(hoverLabelRef.current);
  }, [config, containerSize, placeholder, hideTooltipProp, className]);

  useEffect(() => {
    hoverLabelRef.current = hoverLabel ?? null;
    applyActiveRef.current(hoverLabel ?? null);
  }, [hoverLabel]);

  if (placeholder) {
    return <div className="chart-card chart-card--placeholder" aria-hidden="true" />;
  }

  const seriesPalette = buildSeriesPalette(config);

  return (
    <div className={`chart-card grouped-bar-card${className ? ` ${className}` : ''}`}>
      {!hideHeader && (
        <div className="chart-card__header">
          <div>
            <p className="chart-card__eyebrow">{config.subtitle}</p>
            <h3>{config.title}</h3>
          </div>
        </div>
      )}
      <div className="grouped-bar-card__legend" aria-hidden="true">
        {seriesPalette.map((series) => (
          <div key={series.id} className="grouped-bar-card__legend-item">
            <span className="grouped-bar-card__legend-swatch" style={{ background: series.color }} />
            <span>{series.label}</span>
          </div>
        ))}
      </div>
      <div className="chart-card__body">
        <svg ref={svgRef} role="img" aria-label={config.title} />
        {!hideTooltipProp && (
          <div ref={tooltipRef} className="grouped-bar-tooltip" role="status" aria-live="polite">
            <span className="grouped-bar-tooltip__row">
              <span className="chart-tooltip__swatch" />
              <span className="chart-tooltip__series" />
            </span>
            <span className="chart-tooltip__label" />
            <span className="chart-tooltip__value" />
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupedBarChartCard;
