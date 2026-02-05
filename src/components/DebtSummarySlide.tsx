import { useState } from 'react';
import type { DebtSummarySlide as DebtSummarySlideType } from '../types/slides';
import DonutChart from './DonutChart';
import GroupedBarChartCard from './GroupedBarChartCard';
import SimpleTableCard from './SimpleTableCard';

type DebtSummarySlideProps = {
  slide: DebtSummarySlideType;
};

const DebtSummarySlide = ({ slide }: DebtSummarySlideProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTableId, setActiveTableId] = useState<'summary' | 'disbursement' | 'pipeline'>(
    'summary'
  );
  const galleryItems = [
    {
      id: 'donut',
      label: slide.donut.title,
      content: (
        <div className="chart-card debt-summary__donut-card">
          <div className="chart-card__header">
            <div>
              <p className="chart-card__eyebrow">Distribución</p>
              <h3>{slide.donut.title}</h3>
            </div>
          </div>
          <div className="chart-card__body debt-summary__donut-body">
            <div className="debt-summary__donut">
              <DonutChart
                data={slide.donut.data}
                format="percent"
                showCenter={false}
                tooltipFixed
                enableFullscreen={false}
              />
            </div>
            <div className="debt-summary__legend" aria-hidden="true">
              {slide.donut.data.map((item) => (
                <div key={item.id} className="debt-summary__legend-item">
                  <span className="debt-summary__legend-swatch" style={{ background: item.color }} />
                  <span className="debt-summary__legend-label">{item.label}</span>
                  <span className="debt-summary__legend-value">{item.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'spread',
      label: slide.spreadComparison.title,
      content: <GroupedBarChartCard config={slide.spreadComparison} />
    }
  ];

  return (
    <div className="debt-summary">
      <div className="debt-summary__header">
        <p className="debt-summary__eyebrow">{slide.eyebrow}</p>
        <h2 className="debt-summary__title">{slide.title}</h2>
        {slide.description && <p className="debt-summary__description">{slide.description}</p>}
      </div>
      <div className="debt-summary__content">
        <div className="debt-summary__left">
          <SimpleTableCard
            table={slide.summaryTable}
            className="debt-summary__table debt-summary__table--full"
            isCollapsed={activeTableId !== 'summary'}
            onToggle={() => setActiveTableId('summary')}
          />
          <SimpleTableCard
            table={slide.disbursementTable}
            className="debt-summary__table debt-summary__table--compact"
            isCollapsed={activeTableId !== 'disbursement'}
            onToggle={() => setActiveTableId('disbursement')}
          />
          <SimpleTableCard
            table={slide.pipelineTable}
            className="debt-summary__table debt-summary__table--compact"
            isCollapsed={activeTableId !== 'pipeline'}
            onToggle={() => setActiveTableId('pipeline')}
          />
        </div>
        <div className="debt-summary__right debt-summary__gallery">
          <div className="debt-summary__gallery-body">{galleryItems[activeIndex]?.content}</div>
          <div className="debt-summary__gallery-dots" role="tablist" aria-label="Galería de gráficos">
            {galleryItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`debt-summary__gallery-dot${index === activeIndex ? ' is-active' : ''}`}
                aria-label={item.label}
                aria-pressed={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtSummarySlide;
