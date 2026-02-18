import { useMemo, useState } from 'react';
import type { RefObject } from 'react';
import type {
  ChartConfig,
  LineCardsSlide as LineCardsSlideType,
  LineChartConfig
} from '../types/slides';
import ChartCard from './ChartCard';
import LineChartCard from './LineChartCard';
import StackedBarChartCard from './StackedBarChartCard';

type Props = {
  slide: LineCardsSlideType;
  globalLegendRef?: RefObject<HTMLDivElement | null>;
};

const roundAxisNumber = (value: number) => Math.round(value * 1000) / 1000;

const buildAxisTicks = (minValue: number, maxValue: number): number[] => {
  const lowerBound = Math.min(minValue, maxValue);
  const upperBound = Math.max(minValue, maxValue);

  if (!Number.isFinite(lowerBound) || !Number.isFinite(upperBound)) {
    return [0];
  }

  if (Math.abs(upperBound - lowerBound) < 0.0001) {
    const center = roundAxisNumber(lowerBound);
    return [center - 1, center, center + 1];
  }

  const span = Math.max(1, upperBound - lowerBound);
  const roughStep = span / 6;
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(roughStep) || 1)));
  const multipliers = [1, 2, 2.5, 5, 10];
  const step =
    (multipliers.find((multiplier) => roughStep <= multiplier * magnitude) ?? 10) * magnitude;
  const start = Math.floor(lowerBound / step) * step;
  const end = Math.ceil(upperBound / step) * step;
  const ticks: number[] = [];

  for (let current = start; current <= end + step * 0.5; current += step) {
    ticks.push(roundAxisNumber(current));
  }

  if (!ticks.some((tick) => Math.abs(tick) < 0.0001)) {
    ticks.push(0);
  }

  return Array.from(new Set(ticks)).sort((a, b) => a - b);
};

const calculateLeftBarExtents = (chart: LineChartConfig) => {
  if (
    chart.barAxis !== 'left' ||
    !Array.isArray(chart.barData) ||
    chart.barData.length === 0 ||
    !Array.isArray(chart.barSeries) ||
    chart.barSeries.length === 0
  ) {
    return { min: 0, max: 0 };
  }

  const layout = chart.barLayout ?? 'stacked';
  const seriesIds = chart.barSeries.map((seriesItem) => seriesItem.id);
  let minValue = 0;
  let maxValue = 0;

  if (layout === 'grouped') {
    for (const row of chart.barData) {
      for (const id of seriesIds) {
        const value = row.values[id] ?? 0;
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    }
    return { min: minValue, max: maxValue };
  }

  if (layout === 'mixed') {
    const groups = new Map<string, string[]>();
    for (const seriesItem of chart.barSeries) {
      const key = seriesItem.stackGroup ?? seriesItem.id;
      const group = groups.get(key) ?? [];
      group.push(seriesItem.id);
      groups.set(key, group);
    }

    const groupedIds = Array.from(groups.values());
    for (const row of chart.barData) {
      for (const groupIds of groupedIds) {
        const groupTotal = groupIds.reduce((sum, id) => sum + (row.values[id] ?? 0), 0);
        minValue = Math.min(minValue, groupTotal);
        maxValue = Math.max(maxValue, groupTotal);
      }
    }
    return { min: minValue, max: maxValue };
  }

  for (const row of chart.barData) {
    const rowTotal = seriesIds.reduce((sum, id) => sum + (row.values[id] ?? 0), 0);
    minValue = Math.min(minValue, rowTotal);
    maxValue = Math.max(maxValue, rowTotal);
  }
  return { min: minValue, max: maxValue };
};

const calculateLineChartExtents = (chart: LineChartConfig) => {
  const lineValues = chart.series.flatMap((seriesItem) => seriesItem.values.map((value) => value.value));
  const lineMin = lineValues.length > 0 ? Math.min(...lineValues) : 0;
  const lineMax = lineValues.length > 0 ? Math.max(...lineValues) : 0;
  const barExtents = calculateLeftBarExtents(chart);

  return {
    min: Math.min(0, lineMin, barExtents.min),
    max: Math.max(0, lineMax, barExtents.max)
  };
};

type RatioTableRow = {
  rank: string;
  bmd: string;
  ratio: string;
  color?: string;
  textColor?: string;
  compactLabel?: boolean;
};

const moodysComparisonColumns: RatioTableRow[][] = [
  [
    { rank: '1', bmd: 'CCMM', ratio: '1336%' },
    { rank: '2', bmd: 'ESM', ratio: '493%' },
    { rank: '3', bmd: 'CDB', ratio: '438%', color: '#F0C330', textColor: '#0b0b0b' },
    { rank: '4', bmd: 'NADB', ratio: '431%' },
    { rank: '5', bmd: 'GuarantCo', ratio: '410%' },
    { rank: '6', bmd: 'CEB', ratio: '352%' },
    { rank: '7', bmd: 'IsDB', ratio: '338%' },
    { rank: '8', bmd: 'EBID', ratio: '291%' },
    { rank: '9', bmd: 'ICD', ratio: '256%' },
    { rank: '10', bmd: 'BADEA', ratio: '255%' },
    { rank: '11', bmd: 'AFC', ratio: '245%' },
    { rank: '12', bmd: 'Eurofima', ratio: '238%' },
    { rank: '13', bmd: 'EADB', ratio: '236%' },
    { rank: '14', bmd: 'TCX', ratio: '234%' },
    { rank: '15', bmd: 'AfDB', ratio: '223%' },
    { rank: '16', bmd: 'CAF', ratio: '203%', color: '#3E7F2C' },
    { rank: '17', bmd: 'IDB Invest', ratio: '191%' },
    { rank: '18', bmd: 'AIIB', ratio: '179%' },
    { rank: '19', bmd: 'CABEI', ratio: '169%', color: '#0C2F6F' },
    { rank: '20', bmd: 'FONPLATA', ratio: '160%', color: '#D30505' },
    { rank: '', bmd: 'FONPLATA (2025)', ratio: '159%', color: '#D30505', compactLabel: true },
    { rank: '21', bmd: 'IDA', ratio: '150%' },
    { rank: '22', bmd: 'IFC', ratio: '147%' }
  ],
  [
    { rank: '23', bmd: 'EBRD', ratio: '145%' },
    { rank: '24', bmd: 'IFFIm', ratio: '138%' },
    { rank: '25', bmd: 'TDB', ratio: '128%' },
    { rank: '26', bmd: 'APICORP', ratio: '123%' },
    { rank: '27', bmd: 'IBRD', ratio: '122%' },
    { rank: '28', bmd: 'BOAD', ratio: '117%' },
    { rank: '29', bmd: 'NIB', ratio: '107%' },
    { rank: '30', bmd: 'ALCBF', ratio: '105%' },
    { rank: '31', bmd: 'AFREXIM', ratio: '98%' },
    { rank: '32', bmd: 'IADB', ratio: '94%' },
    { rank: '33', bmd: 'ADB', ratio: '84%' },
    { rank: '34', bmd: 'BSTDB', ratio: '67%' },
    { rank: '35', bmd: 'EAAIF', ratio: '54%' },
    { rank: '36', bmd: 'ITFC', ratio: '52%' },
    { rank: '37', bmd: 'EIB', ratio: '48%' },
    { rank: '38', bmd: 'GCPF', ratio: '47%' },
    { rank: '39', bmd: 'EFSF', ratio: '8%' },
    { rank: '40', bmd: 'FSA', ratio: '-81%' },
    { rank: '41', bmd: 'EIF', ratio: '-141%' },
    { rank: '42', bmd: 'FLAR', ratio: '-2610%' },
    { rank: '43', bmd: 'GIC', ratio: '-3721%' },
    { rank: '44', bmd: 'IFFEd', ratio: '-7589%' }
  ]
];

const spComparisonColumns: RatioTableRow[][] = [
  [
    { rank: '1', bmd: 'EIF', ratio: '6,3' },
    { rank: '2', bmd: 'CGIF', ratio: '4,4' },
    { rank: '3', bmd: 'ESM', ratio: '3,5' },
    { rank: '4', bmd: 'CDB', ratio: '2,9', color: '#F0C330', textColor: '#0b0b0b' },
    { rank: '5', bmd: 'AfDB', ratio: '2,1' },
    { rank: '6', bmd: 'AIIB', ratio: '2,1' },
    { rank: '7', bmd: 'BADEA', ratio: '2,1' },
    { rank: '8', bmd: 'OFID', ratio: '2,0' },
    { rank: '9', bmd: 'ICD', ratio: '1,9' },
    { rank: '10', bmd: 'IDB Invest', ratio: '1,8' },
    { rank: '11', bmd: 'ISDB', ratio: '1,8' },
    { rank: '12', bmd: 'IFAD', ratio: '1,8' },
    { rank: '13', bmd: 'EUROFIMA', ratio: '1,7' },
    { rank: '', bmd: 'FONPLATA (2025)', ratio: '1,6', color: '#D30505', compactLabel: true },
    { rank: '14', bmd: 'EBRD', ratio: '1,6' }
  ],
  [
    { rank: '15', bmd: 'NDB', ratio: '1,6' },
    { rank: '16', bmd: 'CEB', ratio: '1,5' },
    { rank: '17', bmd: 'NIB', ratio: '1,5' },
    { rank: '18', bmd: 'FLAR', ratio: '1,5' },
    { rank: '19', bmd: 'CAF', ratio: '1,4', color: '#3E7F2C' },
    { rank: '20', bmd: 'IADB', ratio: '1,4' },
    { rank: '21', bmd: 'IBRD', ratio: '1,3' },
    { rank: '22', bmd: 'IFC', ratio: '1,3' },
    { rank: '23', bmd: 'IDA', ratio: '1,3' },
    { rank: '24', bmd: 'FONPLATA', ratio: '1,3', color: '#D30505' },
    { rank: '25', bmd: 'CABEI', ratio: '1,3', color: '#0C2F6F' },
    { rank: '26', bmd: 'TAEF', ratio: '1,2' },
    { rank: '27', bmd: 'ADB', ratio: '1,1' },
    { rank: '28', bmd: 'BSTDB', ratio: '1,1' },
    { rank: '29', bmd: 'EIB', ratio: '1,0' }
  ]
];

const activosLiquidosComparisonColumns: RatioTableRow[][] = [
  [
    { rank: '1', bmd: 'FLAR', ratio: '95' },
    { rank: '2', bmd: 'CGIF', ratio: '89' },
    { rank: '3', bmd: 'EADB', ratio: '68' },
    { rank: '4', bmd: 'ICD', ratio: '63' },
    { rank: '5', bmd: 'ESM', ratio: '51' },
    { rank: '6', bmd: 'AIIB', ratio: '50' },
    { rank: '7', bmd: 'TAEF', ratio: '47' },
    { rank: '8', bmd: 'NIB', ratio: '42' },
    { rank: '9', bmd: 'BADEA', ratio: '41' },
    { rank: '10', bmd: 'EBRD', ratio: '41' },
    { rank: '11', bmd: 'IFC', ratio: '37' },
    { rank: '12', bmd: 'AfDB', ratio: '36' },
    { rank: '13', bmd: 'NDB', ratio: '36' },
    { rank: '', bmd: 'FONPLATA (2025)', ratio: '35,6', color: '#D30505', compactLabel: true },
    { rank: '14', bmd: 'ISDB', ratio: '35' },
    { rank: '15', bmd: 'CEB', ratio: '34' }
  ],
  [
    { rank: '16', bmd: 'EUROFIMA', ratio: '34' },
    { rank: '17', bmd: 'CABEI', ratio: '33', color: '#0C2F6F' },
    { rank: '18', bmd: 'CAF', ratio: '32', color: '#3E7F2C' },
    { rank: '19', bmd: 'IDB Invest', ratio: '30' },
    { rank: '20', bmd: 'OFID', ratio: '29' },
    { rank: '21', bmd: 'CDB', ratio: '25', color: '#F0C330', textColor: '#0b0b0b' },
    { rank: '22', bmd: 'FONPLATA', ratio: '24', color: '#D30505' },
    { rank: '23', bmd: 'IBRD', ratio: '23' },
    { rank: '24', bmd: 'IADB', ratio: '23' },
    { rank: '25', bmd: 'BSTDB', ratio: '22' },
    { rank: '26', bmd: 'IFAD', ratio: '17' },
    { rank: '27', bmd: 'ADB', ratio: '16' },
    { rank: '28', bmd: 'EIB', ratio: '16' },
    { rank: '29', bmd: 'IDA', ratio: '15' },
    { rank: '30', bmd: 'EIF', ratio: '15' }
  ]
];

const TableToggleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="5" width="16" height="14" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4 10h16M9 5v14M15 5v14" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const ChartToggleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 18h16M6.5 15.5l3.6-4.2 3 2.6 4.4-5.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="6.5" cy="15.5" r="1" fill="currentColor" />
    <circle cx="10.1" cy="11.3" r="1" fill="currentColor" />
    <circle cx="13.1" cy="13.9" r="1" fill="currentColor" />
    <circle cx="17.5" cy="8.5" r="1" fill="currentColor" />
  </svg>
);

const LineCardsSlide = ({ slide, globalLegendRef }: Props) => {
  const [flujosView, setFlujosView] = useState<'quarterly' | 'annual'>('quarterly');
  const [isMoodysTableView, setIsMoodysTableView] = useState(false);
  const [isSpTableView, setIsSpTableView] = useState(false);
  const [isActivosTableView, setIsActivosTableView] = useState(false);
  const supportsFlujosToggle =
    slide.id === 'flujos-pais' && slide.cards.some((card) => Boolean(card.chartAnnual));
  const resolveCardChart = (card: LineCardsSlideType['cards'][number]) =>
    flujosView === 'annual' ? card.chartAnnual ?? card.chart : card.chart;
  const suppressDebtWordInTooltip =
    slide.id === 'exposicion-cartera-riesgo-cards' ||
    slide.id === 'tablero-liquidez-4-cards' ||
    slide.id === 'flujos-pais';
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
  const sharedFlujosYAxis = useMemo(() => {
    if (slide.id !== 'flujos-pais') {
      return undefined;
    }

    const lineCharts = slide.cards
      .filter((card) => card.id !== 'flujos-pais-general')
      .map((card) => resolveCardChart(card))
      .filter((chart): chart is LineChartConfig => chart?.type === 'line');

    if (lineCharts.length === 0) {
      return undefined;
    }

    const extents = lineCharts.map((chart) => calculateLineChartExtents(chart));
    const globalMinRaw = Math.min(...extents.map((extent) => extent.min));
    const globalMaxRaw = Math.max(...extents.map((extent) => extent.max));
    const yMin = roundAxisNumber(globalMinRaw < 0 ? globalMinRaw * 1.08 : 0);
    const yMaxCandidate = roundAxisNumber(globalMaxRaw > 0 ? globalMaxRaw * 1.08 : 0);
    const yMax = yMaxCandidate <= yMin ? roundAxisNumber(yMin + 1) : yMaxCandidate;
    const yTickValues = buildAxisTicks(yMin, yMax);

    return { yMin, yMax, yTickValues };
  }, [slide, flujosView]);

  const flujosLegendItems = useMemo(() => {
    if (slide.id !== 'flujos-pais') return [];
    const firstChart = slide.cards
      .map((card) => resolveCardChart(card))
      .find((chart): chart is LineChartConfig => chart?.type === 'line');
    if (!firstChart) return [];
    const candidates = [...firstChart.series, ...(firstChart.barSeries ?? [])];
    const seen = new Map<string, { id: string; label: string; color: string }>();
    for (const item of candidates) {
      if (!seen.has(item.id)) {
        seen.set(item.id, { id: item.id, label: item.label, color: item.color ?? '#6b7280' });
      }
    }
    return Array.from(seen.values());
  }, [slide, flujosView]);

  const rootClassName = [
    'line-cards',
    slide.layout === 'stacked' ? 'line-cards--stacked' : '',
    slide.hideHeader ? 'line-cards--cards-only' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const renderChart = (card: NonNullable<LineCardsSlideType['cards'][number]['chart']>, key: string) => {
    const isLiquidityDashboardCard =
      slide.id === 'tablero-liquidez-4-cards' || key.startsWith('tablero-liquidez-');
    const hasFullscreenEnabled =
      isLiquidityDashboardCard || slide.id === 'flujos-pais' || slide.id === 'evolucion-rubros-balance';
    const compactCardClass = slide.id === 'flujos-pais' ? ' chart-card--compact' : '';
    const compactTooltipClass = slide.id === 'flujos-pais' ? ' flujos-tooltip--compact' : '';
    if (card.type === 'line') {
      const isRatioMoodysLiquidityCard =
        slide.id === 'tablero-liquidez-4-cards' && key === 'tablero-liquidez-card-2';
      const isRatioSpLiquidityCard =
        slide.id === 'tablero-liquidez-4-cards' && key === 'tablero-liquidez-card-3';
      const isRatioActivosLiquidityCard =
        slide.id === 'tablero-liquidez-4-cards' && key === 'tablero-liquidez-card-4';
      const cardFootnoteText = isRatioMoodysLiquidityCard
        ? 'Activos líquidos de alta calidad / salidas netas de efectivo 18 meses'
        : isRatioActivosLiquidityCard
          ? 'Activos Líquidos / Activos Totales'
          : null;
      const cardFootnote = cardFootnoteText ? <p className="liquidity-chart-footnote">{cardFootnoteText}</p> : null;
      const lineCardClassName = `line-cards__chart${suppressDebtWordInTooltip ? ' no-deuda-tooltip' : ''}${
        isRatioMoodysLiquidityCard
          ? ' ratio-moodys-liquidity-chart'
          : isRatioSpLiquidityCard
            ? ' ratio-sp-liquidity-chart'
            : isRatioActivosLiquidityCard
              ? ' ratio-activos-liquidity-chart'
              : ''
      }${isLiquidityDashboardCard ? ' chart-fullscreen--page' : ''}${compactCardClass}${compactTooltipClass}`;
      const moodysToggleButton = isRatioMoodysLiquidityCard
        ? (
            <button
              type="button"
              className={`chart-card__action-btn moodys-view-toggle-btn${isMoodysTableView ? ' is-table-active' : ''}`}
              onClick={() => setIsMoodysTableView((prev) => !prev)}
              aria-label={isMoodysTableView ? `Volver al gráfico de ${card.title}` : `Ver tabla de ${card.title}`}
              title={isMoodysTableView ? 'Ver gráfico' : 'Ver tabla'}
            >
              {isMoodysTableView ? <ChartToggleIcon /> : <TableToggleIcon />}
            </button>
          )
        : null;
      const spToggleButton = isRatioSpLiquidityCard ? (
        <button
          type="button"
          className={`chart-card__action-btn sp-view-toggle-btn${isSpTableView ? ' is-table-active' : ''}`}
          onClick={() => setIsSpTableView((prev) => !prev)}
          aria-label={isSpTableView ? `Volver al gráfico de ${card.title}` : `Ver tabla de ${card.title}`}
          title={isSpTableView ? 'Ver gráfico' : 'Ver tabla'}
        >
          {isSpTableView ? <ChartToggleIcon /> : <TableToggleIcon />}
        </button>
      ) : null;
      const activosToggleButton = isRatioActivosLiquidityCard ? (
        <button
          type="button"
          className={`chart-card__action-btn activos-view-toggle-btn${isActivosTableView ? ' is-table-active' : ''}`}
          onClick={() => setIsActivosTableView((prev) => !prev)}
          aria-label={
            isActivosTableView
              ? `Volver al gráfico de ${card.title}`
              : `Ver tabla de ${card.title}`
          }
          title={isActivosTableView ? 'Ver gráfico' : 'Ver tabla'}
        >
          {isActivosTableView ? <ChartToggleIcon /> : <TableToggleIcon />}
        </button>
      ) : null;
      const tableToggleButton = moodysToggleButton ?? spToggleButton ?? activosToggleButton;
      if (isRatioMoodysLiquidityCard && isMoodysTableView) {
        return (
          <section key={key} className={`chart-card ${lineCardClassName} moodys-table-card`}>
            <div className="chart-card__header">
              <div>
                {card.subtitle ? <p className="chart-card__eyebrow">{card.subtitle}</p> : null}
                <h3>{card.title}</h3>
              </div>
            </div>
            <div className="chart-card__actions">{tableToggleButton}</div>
            <div className="chart-card__body">
              <div className="moodys-ratio-table-view" role="table" aria-label="Tabla comparativa Ratio Moody's">
                <div className="moodys-ratio-table-view__header">
                  <span>Indicador de Moody's - Availability of Liquid Resources</span>
                </div>
                <div className="moodys-ratio-table-view__columns">
                  {moodysComparisonColumns.map((column, columnIndex) => (
                    <div key={`moodys-col-${columnIndex}`} className="moodys-ratio-table-view__column">
                      <div className="moodys-ratio-table-view__column-head" role="row">
                        <span className="moodys-ratio-table-view__rank">#</span>
                        <span className="moodys-ratio-table-view__bmd">BMD</span>
                        <span className="moodys-ratio-table-view__ratio">Ratio 2024</span>
                      </div>
                      <div className="moodys-ratio-table-view__rows">
                        {column.map((row) => (
                          <div
                            key={`${columnIndex}-${row.rank}-${row.bmd}`}
                            className={`moodys-ratio-table-view__row${row.color ? ' is-highlight' : ''}`}
                            role="row"
                            style={{
                              background: row.color ?? 'transparent',
                              color: row.textColor ?? (row.color ? '#ffffff' : '#111111')
                            }}
                          >
                            <span className="moodys-ratio-table-view__rank">{row.rank}</span>
                            <span
                              className={`moodys-ratio-table-view__bmd${
                                row.compactLabel ? ' moodys-ratio-table-view__bmd--small' : ''
                              }`}
                            >
                              {row.bmd}
                            </span>
                            <span className="moodys-ratio-table-view__ratio">{row.ratio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {cardFootnote ? <div className="chart-card__footer liquidity-chart-footnote-wrap">{cardFootnote}</div> : null}
          </section>
        );
      }
      if (isRatioSpLiquidityCard && isSpTableView) {
        return (
          <section key={key} className={`chart-card ${lineCardClassName} sp-table-card`}>
            <div className="chart-card__header">
              <div>
                {card.subtitle ? <p className="chart-card__eyebrow">{card.subtitle}</p> : null}
                <h3>{card.title}</h3>
              </div>
            </div>
            <div className="chart-card__actions">{tableToggleButton}</div>
            <div className="chart-card__body">
              <div className="sp-ratio-table-view" role="table" aria-label="Tabla comparativa Ratio S&P">
                <div className="sp-ratio-table-view__header">
                  <span>Indicador de S&amp;P - Cobertura de liquidez a 12 meses</span>
                </div>
                <div className="sp-ratio-table-view__columns">
                  {spComparisonColumns.map((column, columnIndex) => (
                    <div key={`sp-col-${columnIndex}`} className="sp-ratio-table-view__column">
                      <div className="sp-ratio-table-view__column-head" role="row">
                        <span className="sp-ratio-table-view__rank">#</span>
                        <span className="sp-ratio-table-view__bmd">BMD</span>
                        <span className="sp-ratio-table-view__ratio">Ratio 2024</span>
                      </div>
                      <div className="sp-ratio-table-view__rows">
                        {column.map((row) => (
                          <div
                            key={`${columnIndex}-${row.rank}-${row.bmd}`}
                            className={`sp-ratio-table-view__row${row.color ? ' is-highlight' : ''}`}
                            role="row"
                            style={{
                              background: row.color ?? 'transparent',
                              color: row.textColor ?? (row.color ? '#ffffff' : '#111111')
                            }}
                          >
                            <span className="sp-ratio-table-view__rank">{row.rank}</span>
                            <span
                              className={`sp-ratio-table-view__bmd${row.compactLabel ? ' sp-ratio-table-view__bmd--small' : ''}`}
                            >
                              {row.bmd}
                            </span>
                            <span className="sp-ratio-table-view__ratio">{row.ratio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {cardFootnote ? <div className="chart-card__footer liquidity-chart-footnote-wrap">{cardFootnote}</div> : null}
          </section>
        );
      }
      if (isRatioActivosLiquidityCard && isActivosTableView) {
        return (
          <section key={key} className={`chart-card ${lineCardClassName} activos-table-card`}>
            <div className="chart-card__header">
              <div>
                {card.subtitle ? <p className="chart-card__eyebrow">{card.subtitle}</p> : null}
                <h3>{card.title}</h3>
              </div>
            </div>
            <div className="chart-card__actions">{tableToggleButton}</div>
            <div className="chart-card__body">
              <div className="sp-ratio-table-view activos-ratio-table-view" role="table" aria-label="Tabla comparativa Ratio Activos Líquidos / Activos Totales">
                <div className="sp-ratio-table-view__header">
                  <span>Activos Líquidos / Activos Totales Ajustados</span>
                </div>
                <div className="sp-ratio-table-view__columns">
                  {activosLiquidosComparisonColumns.map((column, columnIndex) => (
                    <div key={`activos-col-${columnIndex}`} className="sp-ratio-table-view__column">
                      <div className="sp-ratio-table-view__column-head" role="row">
                        <span className="sp-ratio-table-view__rank">#</span>
                        <span className="sp-ratio-table-view__bmd">BMD</span>
                        <span className="sp-ratio-table-view__ratio">Ratio 2024</span>
                      </div>
                      <div className="sp-ratio-table-view__rows">
                        {column.map((row) => (
                          <div
                            key={`${columnIndex}-${row.rank}-${row.bmd}`}
                            className={`sp-ratio-table-view__row${row.color ? ' is-highlight' : ''}`}
                            role="row"
                            style={{
                              background: row.color ?? 'transparent',
                              color: row.textColor ?? (row.color ? '#ffffff' : '#111111')
                            }}
                          >
                            <span className="sp-ratio-table-view__rank">{row.rank}</span>
                            <span
                              className={`sp-ratio-table-view__bmd${row.compactLabel ? ' sp-ratio-table-view__bmd--small' : ''}`}
                            >
                              {row.bmd}
                            </span>
                            <span className="sp-ratio-table-view__ratio">{row.ratio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {cardFootnote ? <div className="chart-card__footer liquidity-chart-footnote-wrap">{cardFootnote}</div> : null}
          </section>
        );
      }
      const yAxisOverrides =
        slide.id === 'flujos-pais' && key !== 'flujos-pais-general' ? sharedFlujosYAxis : undefined;
      return (
        <LineChartCard
          key={key}
          config={card}
          yMinOverride={yAxisOverrides?.yMin}
          yMaxOverride={yAxisOverrides?.yMax}
          yTickValuesOverride={yAxisOverrides?.yTickValues}
          className={lineCardClassName}
          enableFullscreen={hasFullscreenEnabled}
          actions={tableToggleButton}
          footer={cardFootnote}
        />
      );
    }
    if (card.type === 'stacked-bar') {
      const isCancelacionesSlide = slide.id === 'aprobaciones-y-cancelaciones';
      return (
        <StackedBarChartCard
          key={key}
          config={card}
          yMaxOverride={sharedYAxisMax}
          showLegend={!isCancelacionesSlide}
          tooltipFixed={isCancelacionesSlide}
          tooltipRef={isCancelacionesSlide ? globalLegendRef : undefined}
          className={`line-cards__chart${
            isLiquidityDashboardCard ? ' chart-fullscreen--page' : ''
          }${compactCardClass}${compactTooltipClass}`}
          enableFullscreen={hasFullscreenEnabled}
        />
      );
    }
    return (
      <ChartCard
        key={key}
        config={card}
        variant="plain"
        hideHeader={slide.id === 'aprobaciones-y-cancelaciones'}
        yMaxOverride={sharedYAxisMax}
        enableFullscreen={hasFullscreenEnabled}
      />
    );
  };

  return (
    <div className={rootClassName}>
      {!slide.hideHeader && (
        <header className={`line-cards__header${supportsFlujosToggle ? ' line-cards__header--with-controls' : ''}`}>
          <div>
            {slide.eyebrow ? <p className="line-cards__eyebrow">{slide.eyebrow}</p> : null}
            <h2 className="line-cards__title">{slide.title}</h2>
            {slide.description && <p className="line-cards__description">{slide.description}</p>}
          </div>
          {supportsFlujosToggle && (
            <div className="chart-card__switch" role="group" aria-label="Vista de flujos">
              <button
                type="button"
                className={`chart-card__switch-btn${flujosView === 'quarterly' ? ' is-active' : ''}`}
                onClick={() => setFlujosView('quarterly')}
                aria-pressed={flujosView === 'quarterly'}
              >
                Q
              </button>
              <button
                type="button"
                className={`chart-card__switch-btn${flujosView === 'annual' ? ' is-active' : ''}`}
                onClick={() => setFlujosView('annual')}
                aria-pressed={flujosView === 'annual'}
              >
                Y
              </button>
            </div>
          )}
        </header>
      )}
      <div className="line-cards__grid" aria-label="Grilla de gráficos">
        {slide.cards.map((card) => {
          const chart = resolveCardChart(card);
          return chart ? (
            renderChart(chart, card.id)
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
          );
        })}
      </div>
      {flujosLegendItems.length > 0 && (
        <div className="line-cards__shared-legend" aria-hidden="true">
          {flujosLegendItems.map((item) => (
            <div key={item.id} className="line-cards__shared-legend-item">
              <span className="line-cards__shared-legend-dot" style={{ background: item.color }} />
              <span className="line-cards__shared-legend-label">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LineCardsSlide;
