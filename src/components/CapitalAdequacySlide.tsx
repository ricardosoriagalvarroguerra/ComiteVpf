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

const racSpThresholdRanges = [
  { label: 'Very Weak', value: 0 },
  { label: 'Weak', value: 3 },
  { label: 'Moderate', value: 5 },
  { label: 'Adequate', value: 7 },
  { label: 'Strong', value: 10 },
  { label: 'Very Strong', value: 15 },
  { label: 'Extremely Strong', value: 23 }
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

const CapitalAdequacySlide = ({ slide }: CapitalAdequacySlideProps) => {
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
      showTooltip: true,
      tooltipPrimarySeriesId: 'rac_sp',
      tooltipThresholdRanges: [...racSpThresholdRanges],
      yMin: 0,
      yTickValues: [3, 5, 7, 10, 15, 23],
      yTickFormatter: (value: number) => String(Math.round(value)),
      backgroundZoneLabelPlacement: 'outside-right',
      backgroundZones: [
        { label: 'Very Weak', max: 3, color: '#B91C1C', opacity: 0.2, textColor: '#7F1D1D' },
        { label: 'Weak', min: 3, max: 5, color: '#EF4444', opacity: 0.2, textColor: '#7F1D1D' },
        { label: 'Moderate', min: 5, max: 7, color: '#F97316', opacity: 0.2, textColor: '#7C2D12' },
        { label: 'Adequate', min: 7, max: 10, color: '#F59E0B', opacity: 0.2, textColor: '#78350F' },
        { label: 'Strong', min: 10, max: 15, color: '#84CC16', opacity: 0.2, textColor: '#3F6212' },
        { label: 'Very Strong', min: 15, max: 23, color: '#4ADE80', opacity: 0.2, textColor: '#14532D' },
        { label: 'Extremely Strong', min: 23, color: '#16A34A', opacity: 0.2, textColor: '#14532D' }
      ],
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

  return (
    <div className="capital-adequacy">
      <div className="capital-adequacy__top">
        <LineChartCard
          config={slide.chart}
          className="capital-adequacy__chart no-deuda-tooltip"
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
        />
        <article className="text-card capital-adequacy__detail-text-card">
          <h3 className="text-card__title">Evolución del RAC</h3>
          <p className="capital-adequacy__detail-message">
            <strong>Al 31/12/2025</strong>, el RAC evoluciona de <strong>22,2%</strong> bajo la
            metodología anterior a <strong>31,6%</strong> con la nueva metodología de S&amp;P (
            <strong>+9,4 p.p.</strong>) y a <strong>38,3%</strong> incluyendo el impacto de los EEA (
            <strong>+6,7 p.p.</strong>), lo que representa un <strong>incremento total de +16,1 p.p.</strong>,
            explicado en un <strong>58% por el efecto metodológico</strong> y en un{' '}
            <strong>42% por la optimización estructural</strong>, fortaleciendo significativamente la
            posición de capital ajustado por riesgo del Banco.
          </p>
        </article>
      </div>
    </div>
  );
};

export default CapitalAdequacySlide;
