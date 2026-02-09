import { useMemo, useState } from 'react';
import type { DebtAuthorizationSlide as DebtAuthorizationSlideType } from '../types/slides';
import DonutChart from './DonutChart';
import LineChartCard from './LineChartCard';
import TextCard from './TextCard';

const formatAmount = (value: number) => value.toLocaleString('es-ES');

const DebtAuthorizationSlide = ({ slide }: { slide: DebtAuthorizationSlideType }) => {
  const [isDrilldown, setIsDrilldown] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const donutConfig = slide.donut;
  const drilldown = donutConfig.drilldown;

  const activeDonutData = useMemo(() => {
    if (!drilldown || !isDrilldown) {
      return donutConfig.data;
    }

    const parentIndex = donutConfig.data.findIndex((item) => item.id === drilldown.parentId);
    if (parentIndex === -1) {
      return [...donutConfig.data, ...drilldown.data];
    }

    const merged = [...donutConfig.data];
    merged.splice(parentIndex, 1, ...drilldown.data);
    return merged;
  }, [donutConfig.data, drilldown, isDrilldown]);

  const donutTitle = donutConfig.title;

  const totalValue = activeDonutData.reduce((sum, item) => sum + item.value, 0);

  const handleDonutSelect = (id: string | null) => {
    if (!drilldown) {
      setSelectedId(id);
      return;
    }

    if (!isDrilldown) {
      setIsDrilldown(true);
      setSelectedId(null);
      return;
    }

    setIsDrilldown(false);
    setSelectedId(null);
  };

  const handleReset = () => {
    setIsDrilldown(false);
    setSelectedId(null);
  };

  return (
    <div className="debt-authorization">
      <TextCard
        eyebrow={slide.eyebrow}
        title={slide.title}
        description={slide.description}
        highlights={slide.highlights}
      />
      <section className="chart-card debt-authorization__donut-card" aria-label={donutTitle}>
        <div className="chart-card__header">
          <div>
            <p className="chart-card__eyebrow">Distribución</p>
            <h3>{donutTitle}</h3>
          </div>
          {isDrilldown && (
            <div className="chart-card__actions">
              <button
                type="button"
                className="chart-card__action-btn debt-authorization__back-btn"
                onClick={handleReset}
              >
                Volver
              </button>
            </div>
          )}
        </div>
        <div className="chart-card__body debt-authorization__donut-body">
          <div className="debt-authorization__donut">
            <DonutChart
              data={activeDonutData}
              selectedId={selectedId}
              onSelect={handleDonutSelect}
              enableFullscreen={false}
              format="percent"
              showCenter={false}
              showTooltip={false}
            />
          </div>
          <div className="debt-authorization__donut-legend" aria-hidden="true">
            {activeDonutData.map((item) => {
              const percent = totalValue > 0 ? item.value / totalValue : 0;
              return (
                <div key={item.id} className="debt-authorization__legend-item">
                  <span
                    className="debt-authorization__legend-swatch"
                    style={{ background: item.color }}
                  />
                  <span className="debt-authorization__legend-label">{item.label}</span>
                  <span className="debt-authorization__legend-value">{formatAmount(item.value)}</span>
                  <span className="debt-authorization__legend-percent">{percent.toLocaleString('es-ES', {
                    style: 'percent',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <div className="debt-authorization__chart">
        <LineChartCard
          config={{ ...slide.chart, showTooltip: true }}
          enableFullscreen={false}
          tooltipFixed
          hoverLabel={slide.chart.series[0]?.values[0]?.date ?? null}
        />
      </div>
    </div>
  );
};

export default DebtAuthorizationSlide;
