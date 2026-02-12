import { useMemo } from 'react';
import type { ChartConfig, LineCardsSlide as LineCardsSlideType } from '../types/slides';
import ChartCard from './ChartCard';
import LineChartCard from './LineChartCard';
import StackedBarChartCard from './StackedBarChartCard';

type Props = {
  slide: LineCardsSlideType;
};

const LineCardsSlide = ({ slide }: Props) => {
  const suppressDebtWordInTooltip =
    slide.id === 'exposicion-cartera-riesgo-cards' || slide.id === 'tablero-liquidez-4-cards';
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

  const rootClassName = [
    'line-cards',
    slide.layout === 'stacked' ? 'line-cards--stacked' : '',
    slide.hideHeader ? 'line-cards--cards-only' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const renderChart = (card: NonNullable<LineCardsSlideType['cards'][number]['chart']>, key: string) => {
    if (card.type === 'line') {
      const isRatioMoodysLiquidityCard =
        slide.id === 'tablero-liquidez-4-cards' && key === 'tablero-liquidez-card-2';
      return (
        <LineChartCard
          key={key}
          config={card}
          className={`line-cards__chart${suppressDebtWordInTooltip ? ' no-deuda-tooltip' : ''}${
            isRatioMoodysLiquidityCard ? ' ratio-moodys-liquidity-chart' : ''
          }`}
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
          className="line-cards__chart"
        />
      );
    }
    return <ChartCard key={key} config={card} variant="plain" yMaxOverride={sharedYAxisMax} />;
  };

  return (
    <div className={rootClassName}>
      {!slide.hideHeader && (
        <header className="line-cards__header">
          <p className="line-cards__eyebrow">{slide.eyebrow}</p>
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
