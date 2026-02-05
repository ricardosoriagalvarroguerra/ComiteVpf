import type { SlideDefinition } from '../types/slides';
import type { ChartConfig } from '../types/slides';
import ChartCard from './ChartCard';
import LineChartCard from './LineChartCard';
import StackedBarChartCard from './StackedBarChartCard';
import TextCard from './TextCard';

type Props = {
  slide: Extract<SlideDefinition, { type: 'dual-charts' }>;
};

const renderChart = (chart: ChartConfig, key: string) => {
  if (chart.type === 'line') {
    return <LineChartCard key={key} config={chart} enableFullscreen={false} />;
  }
  if (chart.type === 'stacked-bar') {
    return (
      <StackedBarChartCard key={key} config={chart} enableFullscreen={false} showLegend={false} />
    );
  }
  return <ChartCard key={key} config={chart} enableFullscreen={false} />;
};

const DualChartsSlide = ({ slide }: Props) => {
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

