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

const renderChart = (
  chart: ChartConfig,
  key: string,
  actions?: ReactNode,
  className?: string,
  tooltipFixed = false,
  lineTooltipOptions?: {
    hideFixedTooltipOnLeave?: boolean;
    fixedTooltipEmptyOnIdle?: boolean;
  }
) => {
  if (chart.type === 'line') {
    return (
      <LineChartCard
        key={key}
        config={chart}
        enableFullscreen={false}
        actions={actions}
        className={className}
        tooltipFixed={tooltipFixed}
        hideFixedTooltipOnLeave={lineTooltipOptions?.hideFixedTooltipOnLeave}
        fixedTooltipEmptyOnIdle={lineTooltipOptions?.fixedTooltipEmptyOnIdle}
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
        tooltipFixed={tooltipFixed}
      />
    );
  }
  return <ChartCard key={key} config={chart} enableFullscreen={false} />;
};

const DualChartsSlide = ({ slide }: Props) => {
  const isRiskExposureLayout = slide.id === 'exposicion-cartera-riesgo';
  const suppressDebtWordInTooltip = isRiskExposureLayout ? 'no-deuda-tooltip' : undefined;

  if (isRiskExposureLayout) {
    return (
      <div className="dual-charts dual-charts--risk-exposure">
        <div className="dual-charts__text" aria-label="Resumen">
          <TextCard
            eyebrow={slide.eyebrow}
            title={slide.title}
            description={slide.description}
            highlights={slide.highlights}
            infoPopover={
              slide.infoNote
                ? {
                    title: 'Supuestos de proyección',
                    body: [slide.infoNote]
                  }
                : undefined
            }
          />
        </div>
        <div className="dual-charts__chart dual-charts__chart--primary" aria-label="Gráfico principal">
          {renderChart(
            slide.charts[0],
            `${slide.id}-chart-1`,
            undefined,
            suppressDebtWordInTooltip,
            true
          )}
        </div>
        <div className="dual-charts__chart dual-charts__chart--secondary" aria-label="Gráfico complementario">
          {renderChart(
            slide.charts[1],
            `${slide.id}-chart-2`,
            undefined,
            suppressDebtWordInTooltip,
            true,
            {
              hideFixedTooltipOnLeave: true,
              fixedTooltipEmptyOnIdle: true
            }
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
        infoPopover={
          slide.infoNote
            ? {
                title: 'Supuestos de proyección',
                body: [slide.infoNote]
              }
            : undefined
        }
      />
      <div className="dual-charts__stack" aria-label="Gráficos">
        {renderChart(slide.charts[0], `${slide.id}-chart-1`)}
        {renderChart(slide.charts[1], `${slide.id}-chart-2`)}
      </div>
    </div>
  );
};

export default DualChartsSlide;
