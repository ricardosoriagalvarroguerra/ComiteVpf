import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { createPortal } from 'react-dom';

type DonutSegment = {
  id: string;
  label: string;
  value: number;
  color: string;
  labelColor?: string;
  labelPosition?: 'inside' | 'outside';
};

type DonutChartProps = {
  data: DonutSegment[];
  placeholder?: boolean;
  selectedId?: string | null;
  externalHoveredId?: string | null;
  onSelect?: (id: string | null) => void;
  dimUnselectedOnSelect?: boolean;
  enableFullscreen?: boolean;
  format?: 'millions' | 'percent';
  showCenter?: boolean;
  tooltipFixed?: boolean;
  showTooltip?: boolean;
  showSegmentLabels?: boolean;
  radiusScale?: number;
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

const DonutChart = ({
  data,
  placeholder = false,
  selectedId = null,
  externalHoveredId = null,
  onSelect,
  dimUnselectedOnSelect = false,
  enableFullscreen = true,
  format = 'millions',
  showCenter = true,
  tooltipFixed = false,
  showTooltip = true,
  showSegmentLabels = true,
  radiusScale = 1
}: DonutChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(
    null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const clearHover = useCallback(() => {
    setHoveredId(null);
    if (tooltipRef.current) {
      tooltipRef.current.setAttribute('data-state', 'hidden');
    }
  }, []);

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

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const container = svgElement.parentElement;
    if (!container) return;

    const computedWidth = containerSize?.width ?? container.clientWidth ?? 160;
    const measuredHeight = containerSize?.height ?? svgElement.getBoundingClientRect().height;
    const width = Math.max(computedWidth, 140);
    const height = Math.max(measuredHeight, 140);
    const radius = Math.min(width, height) / 2;
    const clampedRadiusScale = Math.max(0.7, Math.min(1.2, radiusScale));
    const outerRadius = radius * clampedRadiusScale - 8;
    const innerRadius = outerRadius * 0.62;

    if (outerRadius <= 0 || innerRadius <= 0) return;

    const svg = d3
      .select(svgElement)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    g.append('circle')
      .attr('r', outerRadius)
      .attr('fill', 'none')
      .attr('stroke', 'transparent')
      .attr('stroke-width', outerRadius - innerRadius);

    if (placeholder) return;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total <= 0) return;

    const pie = d3
      .pie<DonutSegment>()
      .value((d) => d.value)
      .sort(null);
    const pieData = pie(data);

    const arc = d3
      .arc<d3.PieArcDatum<DonutSegment>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .padAngle(0.01);

    const activeHoveredId = externalHoveredId ?? hoveredId;
    const hasHover = Boolean(activeHoveredId);
    const hasSelection = Boolean(selectedId) && dimUnselectedOnSelect;

    const arcs = g
      .selectAll('path')
      .data(pieData)
      .join('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', (d) => {
        if (activeHoveredId && d.data.id === activeHoveredId) return 'var(--accent)';
        if (selectedId && d.data.id === selectedId) return 'var(--text-primary)';
        return 'var(--card-surface)';
      })
      .attr('stroke-width', (d) => {
        if (activeHoveredId && d.data.id === activeHoveredId) return 2.2;
        if (selectedId && d.data.id === selectedId) return 1.8;
        return 0.8;
      })
      .attr('opacity', (d) => {
        if (hasHover) return d.data.id === activeHoveredId ? 1 : 0.5;
        if (hasSelection) return d.data.id === selectedId ? 1 : 0.45;
        return 1;
      })
      .style('cursor', onSelect ? 'pointer' : 'default')
      .style('transition', 'opacity 160ms ease, stroke-width 160ms ease');

    const percentFormat = (value: number) => (value < 0.01 ? d3.format('.1%')(value) : d3.format('.0%')(value));
    const getLabelColor = (color: string) => {
      const parsed = d3.color(color);
      if (!parsed) return 'var(--text-primary)';
      const rgb = parsed.rgb();
      const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
      return luminance > 0.62 ? 'var(--ds-color-london-5)' : 'var(--ds-color-london-100)';
    };
    const labelInsideArc = d3
      .arc<d3.PieArcDatum<DonutSegment>>()
      .innerRadius(innerRadius + (outerRadius - innerRadius) * 0.45)
      .outerRadius(innerRadius + (outerRadius - innerRadius) * 0.75);

    const labelOutsideArc = d3
      .arc<d3.PieArcDatum<DonutSegment>>()
      .innerRadius(outerRadius + 12)
      .outerRadius(outerRadius + 12);

    if (showSegmentLabels) {
      g.selectAll('text.donut-percent')
        .data(pieData)
        .join('text')
        .attr('class', 'donut-percent')
        .attr('transform', (d) => {
          const isOutside = d.data.labelPosition === 'outside';
          const [baseX, baseY] = isOutside
            ? labelOutsideArc.centroid(d)
            : labelInsideArc.centroid(d);
          const xOffset = isOutside ? (baseX >= 0 ? 8 : -8) : 0;
          return `translate(${baseX + xOffset},${baseY})`;
        })
        .attr('text-anchor', (d) => {
          if (d.data.labelPosition === 'outside') {
            const [x] = labelOutsideArc.centroid(d);
            return x >= 0 ? 'start' : 'end';
          }
          return 'middle';
        })
        .attr('dominant-baseline', 'middle')
        .attr('fill', (d) => d.data.labelColor ?? getLabelColor(d.data.color))
        .style('font-weight', 700)
        .style('opacity', (d) => {
          if (d.data.id === 'RNS') return 0;
          return d.data.value > 0 ? 1 : 0;
        })
        .text((d) => percentFormat(d.data.value / total));
    }

    if (showCenter) {
      const centerValue =
        format === 'percent' ? `${d3.format('.0f')(total)}%` : d3.format(',.1f')(total / 1_000_000);
      const centerUnit = format === 'percent' ? '' : 'MM';

      const center = g.append('text').attr('class', 'donut-center').attr('text-anchor', 'middle');
      center
        .append('tspan')
        .attr('class', 'donut-center__value')
        .attr('x', 0)
        .attr('dy', '-0.1em')
        .text(centerValue);
      if (centerUnit) {
        center
          .append('tspan')
          .attr('class', 'donut-center__unit')
          .attr('x', 0)
          .attr('dy', '1.2em')
          .text(centerUnit);
      }
    }

    const tooltip = showTooltip ? tooltipRef.current : null;
    const formatValue = format === 'percent' ? d3.format('.1f') : d3.format(',.1f');

    const positionTooltip = (clientX: number, clientY: number) => {
      if (!tooltip || !container) return;
      const rect = container.getBoundingClientRect();
      const padding = 10;
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;
      let left = clientX - rect.left + padding;
      let top = clientY - rect.top - tooltipHeight - padding;

      if (left + tooltipWidth > rect.width - 6) {
        left = clientX - rect.left - tooltipWidth - padding;
      }

      if (left < 6) left = 6;
      if (top < 6) {
        top = clientY - rect.top + padding;
      }

      tooltip.style.transform = `translate(${left}px, ${top}px)`;
    };

    const showTooltipContent = (event: PointerEvent, d: d3.PieArcDatum<DonutSegment>) => {
      if (!tooltip) return;
      const percent = total > 0 ? d.data.value / total : 0;
      const valueLabel =
        format === 'percent'
          ? `${formatValue(d.data.value)}%`
          : `${formatValue(d.data.value / 1_000_000)} MM`;
      tooltip.innerHTML = `
        <div class="donut-tooltip__title">${d.data.label}</div>
        <div class="donut-tooltip__value">${valueLabel}</div>
        <div class="donut-tooltip__percent">${percentFormat(percent)}</div>
      `;
      tooltip.setAttribute('data-state', 'visible');
      if (!tooltipFixed) {
        positionTooltip(event.clientX, event.clientY);
      } else {
        tooltip.style.transform = 'none';
      }
    };

    arcs
      .on('pointermove', (event, d) => {
        setHoveredId(d.data.id);
        if (showTooltip) {
          showTooltipContent(event as PointerEvent, d);
        }
      })
      .on('pointerleave', clearHover)
      .on('click', (_, d) => {
        if (!onSelect) return;
        onSelect(selectedId === d.data.id ? null : d.data.id);
      });
  }, [
    data,
    placeholder,
    containerSize,
    selectedId,
    externalHoveredId,
    hoveredId,
    onSelect,
    format,
    showCenter,
    tooltipFixed,
    showTooltip,
    showSegmentLabels,
    radiusScale,
    clearHover
  ]);

  return (
    <>
      <div className="donut-chart" onPointerLeave={clearHover} onPointerCancel={clearHover}>
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
        <svg ref={svgRef} role="img" aria-hidden="true" />
        {showTooltip && (
          <div
            ref={tooltipRef}
            className={`donut-tooltip${tooltipFixed ? ' donut-tooltip--fixed donut-tooltip--fixed-top-left' : ''}`}
            data-state="hidden"
          />
        )}
      </div>
      {enableFullscreen &&
        isFullscreen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="chart-modal" role="dialog" aria-modal="true" aria-label="Pantalla completa">
            <div className="chart-modal__backdrop" onClick={() => setIsFullscreen(false)} />
            <div className="chart-modal__content">
              <div className="chart-card chart-card--fullscreen">
                <div className="chart-card__actions">
                  <button
                    type="button"
                    className="chart-card__action-btn"
                    onClick={() => setIsFullscreen(false)}
                    aria-label="Salir de pantalla completa"
                  >
                    <FullscreenIcon isOpen />
                  </button>
                </div>
                <div className="chart-card__body">
                  <DonutChart
                    data={data}
                    placeholder={placeholder}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    format={format}
                    showCenter={showCenter}
                    tooltipFixed={tooltipFixed}
                    showTooltip={showTooltip}
                    showSegmentLabels={showSegmentLabels}
                    radiusScale={radiusScale}
                    enableFullscreen={false}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default DonutChart;
