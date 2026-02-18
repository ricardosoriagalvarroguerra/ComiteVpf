import { Fragment, useMemo } from 'react';
import type { CapitalAdequacySlide as CapitalAdequacySlideType } from '../types/slides';
import type { LineChartConfig } from '../types/slides';
import LineChartCard from './LineChartCard';

type CapitalAdequacySlideProps = {
  slide: CapitalAdequacySlideType;
};

const POLICY_HIGHLIGHTS = [
  'FONPLATA',
  'límite mínimo de requerimiento de capital',
  'gestión integral de riesgos',
  '35%',
  'activos ajustados por los riesgos financieros y operacionales'
] as const;

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const renderPolicyText = (text: string) => {
  let markedText = text;
  POLICY_HIGHLIGHTS.forEach((phrase, index) => {
    const token = `__POLICY_HIGHLIGHT_${index}__`;
    markedText = markedText.replace(new RegExp(escapeRegExp(phrase), 'g'), token);
  });

  return markedText.split(/(__POLICY_HIGHLIGHT_\d+__)/g).map((part, index) => {
    const match = part.match(/^__POLICY_HIGHLIGHT_(\d+)__$/);
    if (!match) return <Fragment key={`policy-part-${index}`}>{part}</Fragment>;
    const phrase = POLICY_HIGHLIGHTS[Number(match[1])];
    return <strong key={`policy-part-${index}`}>{phrase}</strong>;
  });
};

const formatOneDecimal = (value: number): string =>
  value.toLocaleString('es-ES', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

const formatPercent = (value: number): string =>
  value.toLocaleString('es-ES', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

const CapitalAdequacySlide = ({ slide }: CapitalAdequacySlideProps) => {
  const adequacySeries = useMemo(() => {
    const barRows = slide.chart.barData ?? [];
    return barRows.map((row) => {
      const activosAjustados = row.values.activos_ajustados ?? 0;
      const patrimonio = row.values.patrimonio ?? 0;
      const capitalMinimo = activosAjustados * 0.35;
      return {
        label: row.date,
        patrimonio,
        capitalMinimo,
        holgura: patrimonio - capitalMinimo
      };
    });
  }, [slide.chart.barData]);

  const adequacyDetailChart = useMemo<LineChartConfig>(() => {
    return {
      type: 'line',
      title: 'Ratio de Capital Ajustado por Riesgo (RAC) S&P',
      subtitle: '',
      unit: '%',
      xAxis: 'category',
      sortByX: false,
      showLegend: false,
      showPoints: true,
      showValueLabels: true,
      showValueLabelUnit: false,
      valueFormat: 'one-decimal',
      xTickFormatter: (label: string) => label.slice(-2),
      series: [
        {
          id: 'rac_sp',
          label: 'RAC S&P',
          color: '#E3120B',
          projectedFromLabel: '2025',
          projectedDasharray: '6 4',
          values: [
            { date: '2020', value: 26.4 },
            { date: '2021', value: 23.0 },
            { date: '2022', value: 21.0 },
            { date: '2023', value: 24.1 },
            { date: '2024', value: 21.6 },
            { date: '2025', value: 38.3 },
            { date: '2026', value: 35.8 },
            { date: '2027', value: 32.2 }
          ]
        }
      ]
    };
  }, []);

  const adequacyInsights = useMemo(() => {
    const ratioSeries = slide.chart.series.find((seriesItem) => seriesItem.id === 'ratio_capital') ?? slide.chart.series[0];
    const firstRatio = ratioSeries?.values[0]?.value;
    const lastRatio = ratioSeries?.values[ratioSeries.values.length - 1]?.value;
    const minHolguraPoint = adequacySeries.reduce<(typeof adequacySeries)[number] | null>(
      (currentMin, point) => {
        if (!currentMin || point.holgura < currentMin.holgura) return point;
        return currentMin;
      },
      null
    );
    const holgura2025 = adequacySeries.find((point) => point.label === '12/25');
    const holgura2027 = adequacySeries.find((point) => point.label === '12/27');

    return [
      minHolguraPoint
        ? `La holgura de capital se mantiene positiva en toda la serie; mínimo de USD ${formatOneDecimal(
            minHolguraPoint.holgura
          )} mm en ${minHolguraPoint.label}.`
        : null,
      holgura2025 && holgura2027
        ? `Holgura estimada: USD ${formatOneDecimal(holgura2025.holgura)} mm en 12/25 y USD ${formatOneDecimal(
            holgura2027.holgura
          )} mm en 12/27 (e).`
        : null,
      typeof firstRatio === 'number' && typeof lastRatio === 'number'
        ? `El ratio de adecuación converge de ${formatPercent(firstRatio)}% a ${formatPercent(
            lastRatio
          )}%, siempre sobre el umbral mínimo del 35%.`
        : null
    ].filter((item): item is string => Boolean(item));
  }, [adequacySeries, slide.chart.series]);

  return (
    <div className="capital-adequacy">
      <div className="capital-adequacy__top">
        <LineChartCard
          config={slide.chart}
          className="capital-adequacy__chart no-deuda-tooltip"
          enableFullscreen={false}
          tooltipFixed
          fixedTooltipEmptyOnIdle
          hideFixedTooltipOnLeave
        />
        <article className="text-card capital-adequacy__text-card">
          <p className="text-card__eyebrow">{slide.eyebrow}</p>
          <h2 className="text-card__title">{slide.title}</h2>
          {slide.description && <p className="text-card__description">{slide.description}</p>}
          <p className="capital-adequacy__policy">{renderPolicyText(slide.policyText)}</p>
        </article>
      </div>

      <div className="capital-adequacy__bottom">
        <LineChartCard
          config={adequacyDetailChart}
          className="capital-adequacy__detail-chart no-deuda-tooltip"
          enableFullscreen={false}
        />
        <article className="text-card capital-adequacy__detail-text-card">
          <p className="text-card__eyebrow">Detalle</p>
          <h3 className="text-card__title">Lectura de Suficiencia de Capital</h3>
          <ul className="text-card__highlights">
            {adequacyInsights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
};

export default CapitalAdequacySlide;
