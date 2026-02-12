import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { BarChartConfig, ChartDatum } from '../types/slides';
import { createPortal } from 'react-dom';

type ChartCardProps = {
  config: BarChartConfig;
  placeholder?: boolean;
  hideHeader?: boolean;
  variant?: 'default' | 'plain';
  enableFullscreen?: boolean;
  yMaxOverride?: number;
  tooltipFixed?: boolean;
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

const formatTooltipUnitSuffix = (unit?: string) => {
  if (!unit) return '';
  const sanitized = unit.replace(/usd\s*mm/gi, '').replace(/\s{2,}/g, ' ').trim();
  return sanitized ? ` ${sanitized}` : '';
};

const ChartCard = ({
  config,
  placeholder = false,
  hideHeader = false,
  variant = 'default',
  enableFullscreen = true,
  yMaxOverride,
  tooltipFixed = false
}: ChartCardProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const pinnedLabelRef = useRef<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    const measuredHeight = containerSize?.height ?? svgElement.getBoundingClientRect().height;
    const isCompact = computedWidth < 520;
    const isTiny = computedWidth < 400;
    const rotateLabels = isCompact && config.data.length > 6;
    const width = Math.max(computedWidth, isTiny ? 280 : 320);
    const height = Math.max(measuredHeight, isTiny ? 240 : 300);
    const margin = {
      top: isCompact ? 24 : 32,
      right: isCompact ? 16 : 24,
      bottom: rotateLabels ? 66 : isCompact ? 46 : 52,
      left: isCompact ? 46 : 60
    };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    const accent = 'var(--accent)';
    const border = 'var(--card-border)';
    const muted = 'var(--text-muted)';
    const usePlain = variant === 'plain';

    const svg = d3
      .select(svgElement)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand<string>()
      .domain(config.data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.32);

    const maxValueRaw = d3.max(config.data, (d) => d.value) ?? 0;
    const maxValue =
      typeof yMaxOverride === 'number' && yMaxOverride > 0 ? yMaxOverride : maxValueRaw;
    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.12])
      .nice()
      .range([innerHeight, 0]);

    const fallbackTickEvery = isCompact ? Math.max(1, Math.ceil(config.data.length / 5)) : 1;
    const tickEvery = Math.max(1, config.tickEvery ?? fallbackTickEvery);
    const tickValues = config.data
      .map((d) => d.label)
      .filter((_, index) => index % tickEvery === 0);
    const xAxis = d3.axisBottom(x).tickValues(tickValues).tickSize(0);
    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    const xAxisLabels = xAxisGroup
      .selectAll('text')
      .attr('class', 'chart-axis-label')
      .attr('fill', muted)
      .style('font-size', isCompact ? '0.7rem' : '0.82rem')
      .style('font-family', "'Source Sans 3', 'Avenir Next', sans-serif")
      .style('font-weight', 600);

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
      .style('font-size', isCompact ? '0.68rem' : '0.75rem')
      .style('font-family', "'Source Sans 3', 'Avenir Next', sans-serif")
      .style('font-weight', 600);

    const bars = g
      .selectAll<SVGRectElement, ChartDatum>('rect.chart-bar')
      .data(config.data)
      .join('rect')
      .attr('class', 'chart-bar')
      .attr('x', (d) => x(d.label) ?? 0)
      .attr('y', innerHeight)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('rx', usePlain ? 0 : 1)
      .attr('ry', usePlain ? 0 : 1)
      .attr('fill', (d) => d.color ?? accent)
      .attr('stroke', 'var(--card-surface)')
      .attr('stroke-width', 0.8)
      .attr('opacity', 0.94);

    bars
      .transition()
      .duration(720)
      .delay((_, i) => i * 60)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => innerHeight - y(d.value));

    const formatValue = (value: number) => {
      if (maxValue >= 100) return d3.format(',.0f')(value);
      if (maxValue >= 10) return d3.format(',.1f')(value);
      return d3.format('.2f')(value);
    };
    const valueLabelUnitSuffix =
      config.unit && config.showValueLabelUnit !== false ? ` ${config.unit}` : '';
    const tooltipUnitSuffix = formatTooltipUnitSuffix(config.unit);

    const baseLabelColor = (datum: ChartDatum) => datum.color ?? accent;
    const alwaysShowValueLabels = Boolean(config.showValueLabels);

    const valueLabels = g
      .selectAll<SVGTextElement, ChartDatum>('text.bar-value')
      .data(config.data)
      .join('text')
      .attr('class', 'bar-value')
      .attr('x', (d) => (x(d.label) ?? 0) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.value) - 12)
      .attr('text-anchor', 'middle')
      .attr('fill', baseLabelColor)
      .style(
        'font-size',
        config.valueLabelFontSize ?? (isCompact ? '0.75rem' : '0.85rem')
      )
      .style('font-weight', 600)
      .style('opacity', alwaysShowValueLabels ? 1 : 0)
      .text((d) => `${formatValue(d.value)}${valueLabelUnitSuffix}`);

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
    const bandCenters = config.data.map((datum) => (x(datum.label) ?? 0) + x.bandwidth() / 2);
    const tooltip = tooltipRef.current ? d3.select(tooltipRef.current) : null;
    const tooltipLabel = tooltip?.select('.chart-tooltip__label') ?? null;
    const tooltipValue = tooltip?.select('.chart-tooltip__value') ?? null;
    const tooltipCountries = tooltip?.select('.chart-tooltip__countries') ?? null;

    const positionTooltipAtPoint = (xPos: number, yPos: number, bodyRect: DOMRect) => {
      if (!tooltipRef.current) return;

      const tooltipEl = tooltipRef.current;
      const padding = 12;
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

      tooltipEl.style.transform = `translate(${left}px, ${top}px)`;
    };

    const positionTooltipFromClient = (clientX: number, clientY: number) => {
      if (!tooltipRef.current) return;
      const bodyRect = container.getBoundingClientRect();
      const xPos = clientX - bodyRect.left;
      const yPos = clientY - bodyRect.top;
      positionTooltipAtPoint(xPos, yPos, bodyRect);
    };

    const positionTooltipFromDatum = (datum: ChartDatum) => {
      if (!tooltipRef.current) return;
      const bodyRect = container.getBoundingClientRect();
      const svgRect = svgElement.getBoundingClientRect();
      const offsetX = svgRect.left - bodyRect.left;
      const offsetY = svgRect.top - bodyRect.top;
      const xPos = offsetX + margin.left + (x(datum.label) ?? 0) + x.bandwidth() / 2;
      const yPos = offsetY + margin.top + y(datum.value);
      positionTooltipAtPoint(xPos, yPos, bodyRect);
    };

    const showTooltip = (datum: ChartDatum, clientX?: number, clientY?: number) => {
      if (!tooltip) return;
      tooltipLabel?.text(datum.label);
      tooltipValue?.text(`${formatValue(datum.value)}${tooltipUnitSuffix}`);
      if (tooltipCountries) {
        const countries = datum.countries?.length ? datum.countries.join(', ') : '';
        tooltipCountries.text(countries ? `Países: ${countries}` : '');
        tooltip.attr('data-has-countries', countries ? 'true' : 'false');
      }
      tooltip.attr('data-state', 'visible');

      if (!tooltipFixed) {
        if (clientX != null && clientY != null) {
          positionTooltipFromClient(clientX, clientY);
        } else {
          positionTooltipFromDatum(datum);
        }
      } else if (tooltipRef.current) {
        tooltipRef.current.style.transform = 'none';
      }
    };

    const hideTooltip = () => {
      if (!tooltip) return;
      tooltip.attr('data-state', 'hidden');
    };

    const applyActive = (label: string | null) => {
      bars
        .attr('data-active', (d) => (label && d.label === label ? 'true' : null))
        .attr('data-dimmed', (d) => (label && d.label !== label ? 'true' : null));

      valueLabels
        .style('opacity', () => (alwaysShowValueLabels ? 1 : label ? 1 : 0))
        .attr('fill', (d) => {
          if (alwaysShowValueLabels) {
            if (!label || d.label === label) return baseLabelColor(d);
            return muted;
          }
          if (!label || d.label !== label) return muted;
          return d.color ?? accent;
        });

      if (label) {
        const xPos = (x(label) ?? 0) + x.bandwidth() / 2;
        focusLine.attr('opacity', 0.9).attr('x1', xPos).attr('x2', xPos);
      } else {
        focusLine.attr('opacity', 0);
      }

      xAxisGroup
        .selectAll<SVGTextElement, string>('text.chart-axis-label')
        .attr('fill', (d) => (label && d === label ? 'var(--text-primary)' : muted))
        .style('font-weight', (d) => (label && d === label ? 700 : 600));
    };

    const getNearestDatum = (xPos: number) => {
      if (config.data.length === 0) return null;
      let nearestIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      bandCenters.forEach((center, index) => {
        const distance = Math.abs(center - xPos);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = index;
        }
      });

      return config.data[nearestIndex] ?? null;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const [svgX] = d3.pointer(event, svgElement);
      const relativeX = Math.max(0, Math.min(innerWidth, svgX - margin.left));
      const nearest = getNearestDatum(relativeX);
      if (!nearest) return;
      applyActive(nearest.label);
      showTooltip(nearest, event.clientX, event.clientY);
    };

    const handlePointerLeave = () => {
      const pinnedLabel = pinnedLabelRef.current;
      if (pinnedLabel) {
        const datum = dataByLabel.get(pinnedLabel);
        if (datum) {
          applyActive(pinnedLabel);
          showTooltip(datum);
          return;
        }
      }
      applyActive(null);
      hideTooltip();
    };

    const handleClick = (event: PointerEvent) => {
      const [svgX] = d3.pointer(event, svgElement);
      const relativeX = Math.max(0, Math.min(innerWidth, svgX - margin.left));
      const nearest = getNearestDatum(relativeX);
      if (!nearest) return;

      const pinnedLabel = pinnedLabelRef.current;
      const nextLabel = pinnedLabel === nearest.label ? null : nearest.label;
      pinnedLabelRef.current = nextLabel;

      if (nextLabel) {
        applyActive(nextLabel);
        showTooltip(nearest);
      } else {
        applyActive(null);
        hideTooltip();
      }
    };

    overlay
      .on('pointermove', handlePointerMove)
      .on('pointerleave', handlePointerLeave)
      .on('click', handleClick);

    const pinnedLabel = pinnedLabelRef.current;
    if (pinnedLabel) {
      const datum = dataByLabel.get(pinnedLabel);
      if (datum) {
        applyActive(pinnedLabel);
        showTooltip(datum);
      } else {
        pinnedLabelRef.current = null;
        applyActive(null);
        hideTooltip();
      }
    } else {
      applyActive(null);
      hideTooltip();
    }
  }, [config, containerSize, placeholder, variant, yMaxOverride, tooltipFixed]);

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

  const tooltipElement = (
    <div
      ref={tooltipRef}
      className={`chart-tooltip${tooltipFixed ? ' chart-tooltip--fixed chart-tooltip--fixed-top-left' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="chart-tooltip__label" />
      <span className="chart-tooltip__value" />
      <span className="chart-tooltip__countries" />
    </div>
  );

  const card = (
    <div className={`chart-card${isFullscreen ? ' chart-card--fullscreen' : ''}`}>
      {!hideHeader && (
        <div className="chart-card__header">
          <div>
            <p className="chart-card__eyebrow">{config.subtitle}</p>
            <h3>{config.title}</h3>
          </div>
        </div>
      )}
      {enableFullscreen && (
        <div className="chart-card__actions">
          <button
            type="button"
            className="chart-card__action-btn"
            onClick={() => setIsFullscreen(true)}
            aria-label="Ver en pantalla completa"
          >
            <FullscreenIcon isOpen={false} />
          </button>
        </div>
      )}
      {tooltipFixed && tooltipElement}
      <div className="chart-card__body">
        <svg ref={svgRef} role="img" aria-label={config.title} />
        {!tooltipFixed && tooltipElement}
      </div>
    </div>
  );

  const modal =
    enableFullscreen &&
    isFullscreen &&
    typeof document !== 'undefined' &&
    createPortal(
      <div className="chart-modal" role="dialog" aria-modal="true" aria-label={`Pantalla completa`}>
        <div className="chart-modal__backdrop" onClick={() => setIsFullscreen(false)} />
        <div className="chart-modal__content">
          <ChartCard
            config={config}
            placeholder={placeholder}
            hideHeader={false}
            variant={variant}
            enableFullscreen={false}
            yMaxOverride={undefined}
          />
        </div>
      </div>,
      document.body
    );

  if (placeholder) {
    return <div className="chart-card chart-card--placeholder" aria-hidden="true" />;
  }

  return (
    <>
      {card}
      {modal}
    </>
  );
};

export default ChartCard;
