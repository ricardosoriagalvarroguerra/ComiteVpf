import type { LineCardsSlide as LineCardsSlideType } from '../types/slides';
import ChartCard from './ChartCard';
import LineChartCard from './LineChartCard';
import StackedBarChartCard from './StackedBarChartCard';

type Props = {
  slide: LineCardsSlideType;
};

const LineCardsSlide = ({ slide }: Props) => {
  const renderChart = (card: NonNullable<LineCardsSlideType['cards'][number]['chart']>, key: string) => {
    if (card.type === 'line') {
      return <LineChartCard key={key} config={card} className="line-cards__chart" />;
    }
    if (card.type === 'stacked-bar') {
      return (
        <StackedBarChartCard
          key={key}
          config={card}
          showLegend={false}
          className="line-cards__chart"
        />
      );
    }
    return <ChartCard key={key} config={card} variant="plain" />;
  };

  return (
    <div className="line-cards">
      <header className="line-cards__header">
        <p className="line-cards__eyebrow">{slide.eyebrow}</p>
        <h2 className="line-cards__title">{slide.title}</h2>
        {slide.description && <p className="line-cards__description">{slide.description}</p>}
      </header>
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
