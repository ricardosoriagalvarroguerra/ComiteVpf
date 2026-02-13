import { useMemo, useState } from 'react';
import type { RefObject } from 'react';
import TextCard from './TextCard';
import ChartCard from './ChartCard';
import LineChartCard from './LineChartCard';
import StackedBarChartCard from './StackedBarChartCard';
import DonutChart from './DonutChart';
import Navigation from './Navigation';
import FonplataMark from './FonplataMark';
import InvestmentPortfolioSlide from './InvestmentPortfolioSlide';
import DualChartsSlide from './DualChartsSlide';
import LiquidityActivitySlide from './LiquidityActivitySlide';
import DebtSourcesSlide from './DebtSourcesSlide';
import DebtSummarySlide from './DebtSummarySlide';
import DebtAuthorizationSlide from './DebtAuthorizationSlide';
import RateAnalysisSlide from './RateAnalysisSlide';
import LineCardsSlide from './LineCardsSlide';
import TextTableSlide from './TextTableSlide';
import CapitalAdequacySlide from './CapitalAdequacySlide';
import SectionTitleSlide from './SectionTitleSlide';
import {
  countryColors,
  countryOrder,
  countrySeriesByCode,
  countryStackedLegend,
  quarterLabels
} from '../data/countryStacked';
import type {
  GroupedBarChartConfig,
  LineChartConfig,
  LineDrilldownMetric,
  SlideDefinition,
  StackedBarChartConfig,
  TableRow
} from '../types/slides';

const formatMoneyMM = (value: number) => {
  const inMillions = value / 1_000_000;
  return `${new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(inMillions)}`;
};
type MiniTooltipSeries = Array<{
  id: string;
  label: string;
  color?: string;
  values: Record<string, number>;
}>;

const miniTooltipSeriesCache = new WeakMap<GroupedBarChartConfig, MiniTooltipSeries>();
const riskCapacityRatingRows = [
  { moodys: 'Aaa', sp: 'AAA', fitch: 'AAA', standard: 'Grado Inversor 1' },
  { moodys: 'Aa1', sp: 'AA+', fitch: 'AA+', standard: 'Grado Inversor 1' },
  { moodys: 'Aa2', sp: 'AA', fitch: 'AA', standard: 'Grado Inversor 1' },
  { moodys: 'Aa3', sp: 'AA-', fitch: 'AA-', standard: 'Grado Inversor 1' },
  { moodys: 'A1', sp: 'A+', fitch: 'A+', standard: 'Grado Inversor 1' },
  { moodys: 'A2', sp: 'A', fitch: 'A', standard: 'Grado Inversor 1' },
  { moodys: 'A3', sp: 'A-', fitch: 'A-', standard: 'Grado Inversor 1' },
  { moodys: 'Baa1', sp: 'BBB+', fitch: 'BBB+', standard: 'Grado Inversor 1' },
  { moodys: 'Baa2', sp: 'BBB', fitch: 'BBB', standard: 'Grado Inversor 2' },
  { moodys: 'Baa3', sp: 'BBB-', fitch: 'BBB-', standard: 'Grado Inversor 2' },
  { moodys: 'Ba1', sp: 'BB+', fitch: 'BB+', standard: 'Superior' },
  { moodys: 'Ba2', sp: 'BB', fitch: 'BB', standard: 'Superior' },
  { moodys: 'Ba3', sp: 'BB-', fitch: 'BB-', standard: 'Superior' },
  { moodys: 'B1', sp: 'B+', fitch: 'B+', standard: 'Intermedia' },
  { moodys: 'B2', sp: 'B', fitch: 'B', standard: 'Intermedia' },
  { moodys: 'B3', sp: 'B-', fitch: 'B-', standard: 'Intermedia' },
  { moodys: 'Caa1', sp: 'CCC+', fitch: 'CCC+', standard: 'Básica' },
  { moodys: 'Caa2', sp: 'CCC', fitch: 'CCC', standard: 'Básica' },
  { moodys: 'Caa3', sp: 'CCC-', fitch: 'CCC-', standard: 'Básica' },
  { moodys: 'Ca', sp: 'CC', fitch: 'CC', standard: 'Básica' },
  { moodys: 'C', sp: 'C', fitch: 'C', standard: 'Básica' },
  { moodys: 'D', sp: 'D', fitch: 'D', standard: 'Básica' }
] as const;

const getMiniTooltipSeries = (miniChart: GroupedBarChartConfig): MiniTooltipSeries => {
  const cached = miniTooltipSeriesCache.get(miniChart);
  if (cached) {
    return cached;
  }

  const built = miniChart.series.map((series) => ({
    id: series.id,
    label: `${series.label} Plazo`,
    color: series.color,
    values: miniChart.data.reduce<Record<string, number>>((acc, datum) => {
      acc[datum.label] = datum.values[series.id] ?? 0;
      return acc;
    }, {})
  }));

  miniTooltipSeriesCache.set(miniChart, built);
  return built;
};
const emptyMiniTooltipSeries: MiniTooltipSeries = [];
const miniLineConfigCache = new WeakMap<GroupedBarChartConfig, LineChartConfig>();
const getMiniLineConfig = (miniChart: GroupedBarChartConfig): LineChartConfig => {
  const cached = miniLineConfigCache.get(miniChart);
  if (cached) {
    return cached;
  }

  const built: LineChartConfig = {
    type: 'line',
    title: miniChart.title,
    subtitle: miniChart.subtitle,
    unit: miniChart.unit,
    sortByX: true,
    showLegend: false,
    hideYAxis: true,
    showPoints: true,
    showTooltip: false,
    showValueLabels: true,
    showValueLabelUnit: false,
    valueLabelFontSize: '0.44rem',
    barAxis: 'left',
    series: miniChart.series.map((seriesItem) => ({
      id: seriesItem.id,
      label: seriesItem.label,
      color: seriesItem.color,
      values: miniChart.data.map((datum) => ({
        date: datum.label,
        value: datum.values[seriesItem.id] ?? 0
      }))
    }))
  };

  miniLineConfigCache.set(miniChart, built);
  return built;
};

const riskExposureScenarioCountries = ['ARG', 'BOL', 'BRA', 'PAR', 'URU'] as const;
type RiskExposureScenarioCountry = (typeof riskExposureScenarioCountries)[number];

type VigenciaTableCardProps = {
  title: string;
  rows: TableRow[];
};

const VigenciaTableCard = ({ title, rows }: VigenciaTableCardProps) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [pinnedRow, setPinnedRow] = useState<string | null>(null);
  const total = rows.reduce((sum, row) => sum + (row.amount ?? 0), 0);
  const activeKey = pinnedRow ?? hoveredRow;

  return (
    <section className="table-card" aria-label={title}>
      <header className="table-card__header">
        <div>
          <h3 className="table-card__title">{title}</h3>
        </div>
        <div className="table-card__total">
          <span>Total (USD mm)</span>
          <strong>{formatMoneyMM(total)}</strong>
        </div>
      </header>
      <div className="table-card__body">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th className="data-table__amount">Monto</th>
              <th className="data-table__previsibilidad">Previsibilidad</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rowKey = `${row.code}-${index}`;
              const isPinned = pinnedRow === rowKey;
              const isActive = activeKey === rowKey;

              return (
                <tr
                  key={rowKey}
                  className={`${isActive ? 'is-row-active' : ''}${isPinned ? ' is-row-pinned' : ''}`}
                  onMouseEnter={() => setHoveredRow(rowKey)}
                  onMouseLeave={() => setHoveredRow((prev) => (prev === rowKey ? null : prev))}
                  onClick={() => setPinnedRow((prev) => (prev === rowKey ? null : rowKey))}
                >
                  <td className="data-table__code" data-label="Código" title={row.code}>
                    <strong>{row.code}</strong>
                  </td>
                  <td className="data-table__name" data-label="Nombre" title={row.name}>
                    <strong>{row.name}</strong>
                  </td>
                  <td className="data-table__amount" data-label="Monto">
                    {formatMoneyMM(row.amount)}
                  </td>
                  <td className="data-table__previsibilidad" data-label="Previsibilidad"></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
type ChartGridState = {
  showBreakdown: boolean;
  setShowBreakdown: (value: boolean | ((prev: boolean) => boolean)) => void;
  showRatio: boolean;
  setShowRatio: (value: boolean | ((prev: boolean) => boolean)) => void;
  chartGridView: 'quarterly' | 'annual';
  setChartGridView: (
    value: 'quarterly' | 'annual' | ((prev: 'quarterly' | 'annual') => 'quarterly' | 'annual')
  ) => void;
  activitiesInVigenciaMM: number;
  activitiesInVigenciaInput: string;
  setActivitiesInVigenciaInput: (value: string) => void;
  globalLegendRef: RefObject<HTMLDivElement | null>;
  selectedCountries: string[];
  setSelectedCountries: (value: string[] | ((prev: string[]) => string[])) => void;
  selectedCategories: string[];
  setSelectedCategories: (value: string[] | ((prev: string[]) => string[])) => void;
};

type RiskCapacityState = {
  riskCapacityPercent: boolean;
  setRiskCapacityPercent: (value: boolean | ((prev: boolean) => boolean)) => void;
};

type EndeudamientoState = {
  endeudamientoView: 'quarterly' | 'annual';
  setEndeudamientoView: (
    value: 'quarterly' | 'annual' | ((prev: 'quarterly' | 'annual') => 'quarterly' | 'annual')
  ) => void;
  endeudamientoMetric: 'ponderado' | 'marginal';
  setEndeudamientoMetric: (
    value:
      | 'ponderado'
      | 'marginal'
      | ((prev: 'ponderado' | 'marginal') => 'ponderado' | 'marginal')
  ) => void;
  endeudamientoVariant: 'v1' | 'v2';
  setEndeudamientoVariant: (value: 'v1' | 'v2' | ((prev: 'v1' | 'v2') => 'v1' | 'v2')) => void;
  endeudamientoScatterSource: 'ifd' | 'mercado';
  setEndeudamientoScatterSource: (
    value: 'ifd' | 'mercado' | ((prev: 'ifd' | 'mercado') => 'ifd' | 'mercado')
  ) => void;
  endeudamientoScatterYears: string[];
  setEndeudamientoScatterYears: (value: string[] | ((prev: string[]) => string[])) => void;
  endeudamientoHoverLabel: string | null;
  setEndeudamientoHoverLabel: (value: string | null) => void;
};

type PrevisionState = {
  previsionView: 'monto' | 'indice100';
  setPrevisionView: (
    value: 'monto' | 'indice100' | ((prev: 'monto' | 'indice100') => 'monto' | 'indice100')
  ) => void;
  previsionHoverLabel: string | null;
  setPrevisionHoverLabel: (value: string | null) => void;
};

type SlideRendererProps = {
  slide: SlideDefinition;
  onSelect: (targetId: string) => void;
  layoutOnly: boolean;
  cierreMetric: LineDrilldownMetric | null;
  setCierreMetric: (metric: LineDrilldownMetric | null) => void;
  chartGridState?: ChartGridState;
  riskCapacityState?: RiskCapacityState;
  endeudamientoState?: EndeudamientoState;
  previsionState?: PrevisionState;
};

const SlideRenderer = ({
  slide,
  onSelect,
  layoutOnly,
  cierreMetric,
  setCierreMetric,
  chartGridState,
  riskCapacityState,
  endeudamientoState,
  previsionState
}: SlideRendererProps) => {
  const [donutMatrixSelectedByCategory, setDonutMatrixSelectedByCategory] = useState<
    Record<string, string | null>
  >({});
  const [riskExposureScenarioCountry, setRiskExposureScenarioCountry] =
    useState<RiskExposureScenarioCountry>('ARG');

  if (slide.type === 'home') {
    return (
      <TextCard
        eyebrow={slide.meta}
        title={slide.heroTitle}
        description={slide.heroSubtitle}
        body={slide.body}
        variant="hero"
        align="center"
        footer={<FonplataMark />}
      />
    );
  }

  if (slide.type === 'navigation') {
    return <Navigation slide={slide} onSelect={onSelect} />;
  }

  if (slide.type === 'section-title') {
    return <SectionTitleSlide slide={slide} />;
  }

  if (slide.type === 'chart-grid') {
    if (!chartGridState) {
      return null;
    }

    const {
      showBreakdown,
      setShowBreakdown,
      showRatio,
      setShowRatio,
      chartGridView,
      setChartGridView,
      activitiesInVigenciaMM,
      activitiesInVigenciaInput,
      setActivitiesInVigenciaInput,
      globalLegendRef,
      selectedCountries,
      setSelectedCountries,
      selectedCategories,
      setSelectedCategories
    } = chartGridState;

    const toggleCountry = (code: string) => {
      setSelectedCountries((prev) => {
        if (prev.includes(code)) {
          return prev.length === 1 ? prev : prev.filter((item) => item !== code);
        }
        return [...prev, code];
      });
    };

    const toggleCategory = (categoryId: string) => {
      setSelectedCategories((prev) => {
        if (prev.includes(categoryId)) {
          return prev.length === 1 ? prev : prev.filter((item) => item !== categoryId);
        }
        return [...prev, categoryId];
      });
    };

    const activeCountries = selectedCountries.length ? selectedCountries : [...countryOrder];
    const activeCategories = selectedCategories.length
      ? selectedCategories
      : countryStackedLegend.map((item) => item.id);

    const aggregateSeries = countryStackedLegend.filter((item) =>
      activeCategories.includes(item.id)
    );

    const activitiesBaseTotal = 750_000_000;
    const activitiesTotal = Math.max(0, activitiesInVigenciaMM) * 1_000_000;
    const activitiesDelta = activitiesTotal - activitiesBaseTotal;
    const activitiesWeights: Record<string, number> = {
      ARG: 140_000_000,
      BOL: 135_000_000,
      BRA: 140_000_000,
      PAR: 135_000_000,
      RNS: 65_000_000,
      URU: 135_000_000
    };
    const activityQuarterIndices = new Set([25, 26, 27]);
    const activitiesDeltaByCountry = countryOrder.reduce<Record<string, number>>((acc, code) => {
      const weight = activitiesWeights[code] ?? 0;
      acc[code] = activitiesBaseTotal > 0 ? (activitiesDelta * weight) / activitiesBaseTotal : 0;
      return acc;
    }, {});

    const periodBuckets =
      chartGridView === 'annual'
        ? quarterLabels.reduce<Array<{ label: string; index: number }>>((acc, label, index) => {
            if (!label.startsWith('Q4-')) return acc;
            const [, shortYear] = label.split('-');
            acc.push({
              label: shortYear ? `20${shortYear}` : label,
              index
            });
            return acc;
          }, [])
        : quarterLabels.map((label, index) => ({ label, index }));

    const q4LabelPattern = /^Q4-(\d{2})$/;
    const quarterTickValues = periodBuckets
      .map(({ label }) => label)
      .filter((label) => q4LabelPattern.test(label));
    const formatQuarterTick = (label: string) => {
      const match = q4LabelPattern.exec(label);
      return match ? `4Q${match[1]}` : label;
    };

    const quarterAxisProps =
      chartGridView === 'quarterly'
        ? {
            xTickValues: quarterTickValues,
            xTickFormatter: formatQuarterTick
          }
        : {};

    const aggregateData = periodBuckets.map(({ label, index }) => {
      const values: Record<string, number> = {};
      aggregateSeries.forEach((seriesItem) => {
        const total = activeCountries.reduce((countrySum, code) => {
          const entry = countrySeriesByCode[code as keyof typeof countrySeriesByCode];
          const seriesValues = entry?.[seriesItem.id as keyof typeof entry] ?? [];
          const baseValue = seriesValues[index] ?? 0;
          const delta =
            seriesItem.id === 'desembolsar' && activityQuarterIndices.has(index)
              ? (activitiesDeltaByCountry[code] ?? 0) / 3
              : 0;
          return countrySum + baseValue + delta;
        }, 0);
        values[seriesItem.id] = total / 1_000_000;
      });
      return { label, values };
    });

    const aggregateConfig = {
      type: 'stacked-bar' as const,
      title: 'Cartera Total',
      subtitle:
        chartGridView === 'annual' ? 'USD · millones · corte anual (Q4)' : 'USD · millones',
      unit: 'MM',
      series: aggregateSeries,
      data: aggregateData,
      ...quarterAxisProps
    };
    const chartGridTitle = slide.title;

    const ratioSeries = periodBuckets.map(({ label, index }) => {
      const totals = activeCountries.reduce(
        (sum, code) => {
          const entry = countrySeriesByCode[code as keyof typeof countrySeriesByCode];
          const delta =
            activityQuarterIndices.has(index) && activitiesDeltaByCountry[code]
              ? activitiesDeltaByCountry[code] / 3
              : 0;
          return {
            cobrar: sum.cobrar + (entry?.cobrar[index] ?? 0),
            desembolsar: sum.desembolsar + (entry?.desembolsar[index] ?? 0) + delta,
            activar: sum.activar + (entry?.activar[index] ?? 0)
          };
        },
        { cobrar: 0, desembolsar: 0, activar: 0 }
      );
      const ratio = totals.cobrar > 0 ? (totals.activar + totals.desembolsar) / totals.cobrar : 0;
      return {
        date: label,
        value: Number(ratio.toFixed(2))
      };
    });

    const ratioConfig: LineChartConfig = {
      type: 'line',
      title: 'Ratio (Activar + Desembolsar) / Cobrar',
      subtitle:
        chartGridView === 'annual' ? 'Serie temporal · corte anual (Q4)' : 'Serie temporal',
      unit: 'x',
      showValueLabels: true,
      showValueLabelUnit: false,
      valueLabelFontSize: '0.56rem',
      xAxis: 'category',
      ...quarterAxisProps,
      series: [
        {
          id: 'ratio',
          label: 'Ratio',
          color: 'var(--accent)',
          values: ratioSeries
        }
      ]
    };

    const breakdownCountryOrder = [...countryOrder];
    if (slide.id === 'cartera-estado-pais') {
      const rnsIndex = breakdownCountryOrder.indexOf('RNS');
      const uruIndex = breakdownCountryOrder.indexOf('URU');
      if (rnsIndex >= 0 && uruIndex >= 0) {
        [breakdownCountryOrder[rnsIndex], breakdownCountryOrder[uruIndex]] = [
          breakdownCountryOrder[uruIndex],
          breakdownCountryOrder[rnsIndex]
        ];
      }
    }

    const filteredBreakdownCharts = breakdownCountryOrder.map((code) => {
      const deltaPerQuarter =
        activityQuarterIndices.size > 0
          ? (activitiesDeltaByCountry[code] ?? 0) / 3 / 1_000_000
          : 0;

      const sourceSeries = countrySeriesByCode[code as keyof typeof countrySeriesByCode];
      const data = periodBuckets.map(({ label, index }) => {
        const values: Record<string, number> = {};
        aggregateSeries.forEach((seriesItem) => {
          const baseRaw = sourceSeries?.[seriesItem.id as keyof typeof sourceSeries]?.[index] ?? 0;
          const base = baseRaw / 1_000_000;
          const delta =
            seriesItem.id === 'desembolsar' && activityQuarterIndices.has(index)
              ? deltaPerQuarter
              : 0;
          const total = base + delta;
          values[seriesItem.id] = total;
        });
        return { label, values };
      });

      return {
        type: 'stacked-bar' as const,
        title: code,
        subtitle:
          chartGridView === 'annual' ? 'USD · millones · corte anual (Q4)' : 'USD · millones',
        unit: 'MM',
        series: aggregateSeries,
        data,
        ...quarterAxisProps
      };
    });

    const breakdownYAxisMax = filteredBreakdownCharts.reduce((max, chart) => {
      chart.data.forEach((datum) => {
        const total = aggregateSeries.reduce((sum, seriesItem) => {
          return sum + (datum.values[seriesItem.id] ?? 0);
        }, 0);
        if (total > max) max = total;
      });
      return max;
    }, 0);
    const chartGridNote = slide.footnote?.trim();

    return (
      <div className="chart-grid">
        <div className="chart-grid__header">
          {slide.eyebrow && <p className="chart-grid__eyebrow">{slide.eyebrow}</p>}
          <h2 className="chart-grid__title">{chartGridTitle}</h2>
          {slide.description && <p className="chart-grid__description">{slide.description}</p>}
        </div>
        <div className="chart-grid__controls">
          {!showBreakdown && (
            <div className="chart-grid__filters chart-grid__filters--compact">
              <details className="chart-dropdown">
                <summary>
                  Países
                  <span className="chart-dropdown__count">
                    {activeCountries.length === countryOrder.length
                      ? 'Todos'
                      : `${activeCountries.length}`}
                  </span>
                </summary>
                <div className="chart-dropdown__menu">
                  {countryOrder.map((code) => {
                    const isActive = activeCountries.includes(code);
                    return (
                      <label key={code} className="chart-dropdown__item">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => toggleCountry(code)}
                        />
                        <span>{code}</span>
                      </label>
                    );
                  })}
                </div>
              </details>
              <details className="chart-dropdown">
                <summary>
                  Categorías
                  <span className="chart-dropdown__count">
                    {activeCategories.length === countryStackedLegend.length
                      ? 'Todas'
                      : `${activeCategories.length}`}
                  </span>
                </summary>
                <div className="chart-dropdown__menu">
                  {countryStackedLegend.map((item) => {
                    const isActive = activeCategories.includes(item.id);
                    return (
                      <label key={item.id} className="chart-dropdown__item">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => toggleCategory(item.id)}
                        />
                        <span
                          className="chart-dropdown__swatch"
                          style={{ background: item.color ?? 'currentColor' }}
                        />
                        <span>{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </details>
            </div>
          )}
          <div className="chart-grid__actions">
            <div className="chart-card__switch" role="group" aria-label="Frecuencia">
              <button
                type="button"
                className={`chart-card__switch-btn${
                  chartGridView === 'quarterly' ? ' is-active' : ''
                }`}
                onClick={() => setChartGridView('quarterly')}
                aria-pressed={chartGridView === 'quarterly'}
              >
                Q
              </button>
              <button
                type="button"
                className={`chart-card__switch-btn${chartGridView === 'annual' ? ' is-active' : ''}`}
                onClick={() => setChartGridView('annual')}
                aria-pressed={chartGridView === 'annual'}
              >
                Y
              </button>
            </div>
            <label className="chart-grid__parameter">
              <span>Aprobaciones 2026</span>
              <input
                type="text"
                inputMode="decimal"
                value={activitiesInVigenciaInput}
                onChange={(event) => {
                  setActivitiesInVigenciaInput(event.target.value);
                }}
                placeholder="0"
              />
            </label>
            {showBreakdown && (
              <details className="chart-dropdown chart-dropdown--inline">
                <summary>
                  Categorías
                  <span className="chart-dropdown__count">
                    {activeCategories.length === countryStackedLegend.length
                      ? 'Todas'
                      : `${activeCategories.length}`}
                  </span>
                </summary>
                <div className="chart-dropdown__menu">
                  {countryStackedLegend.map((item) => {
                    const isActive = activeCategories.includes(item.id);
                    return (
                      <label key={item.id} className="chart-dropdown__item">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => toggleCategory(item.id)}
                        />
                        <span
                          className="chart-dropdown__swatch"
                          style={{ background: item.color ?? 'currentColor' }}
                        />
                        <span>{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </details>
            )}
            {!showBreakdown && (
              <button
                type="button"
                className={`chart-grid__toggle${showRatio ? ' is-active' : ''}`}
                onClick={() => setShowRatio((prev) => !prev)}
                aria-pressed={showRatio}
              >
                Ratio
              </button>
            )}
            <button
              type="button"
              className="chart-grid__toggle"
              onClick={() =>
                setShowBreakdown((prev) => {
                  const next = !prev;
                  if (next) {
                    setShowRatio(false);
                  }
                  return next;
                })
              }
            >
              {showBreakdown ? 'Ocultar desglose' : 'Desglose'}
            </button>
            {showBreakdown && chartGridNote && (
              <details className="chart-grid__note chart-grid__note--inline">
                <summary aria-label="Ver nota metodológica" title="Ver nota metodológica">
                  <span aria-hidden="true">i</span>
                </summary>
                <div className="chart-grid__note-popover" role="note">
                  {chartGridNote}
                </div>
              </details>
            )}
          </div>
        </div>
        {!showBreakdown && (
          <div className="chart-grid__main">
            {showRatio ? (
              <LineChartCard config={ratioConfig} className="chart-card--primary" />
            ) : (
              <StackedBarChartCard
                config={aggregateConfig}
                enableFullscreen
                showLegend={false}
                className="chart-card--primary"
                tooltipFixed
                tooltipRef={globalLegendRef}
              />
            )}
            {!showRatio && chartGridNote && (
              <details className="chart-grid__note chart-grid__note--floating">
                <summary aria-label="Ver nota metodológica" title="Ver nota metodológica">
                  <span aria-hidden="true">i</span>
                </summary>
                <div className="chart-grid__note-popover" role="note">
                  {chartGridNote}
                </div>
              </details>
            )}
          </div>
        )}
        {showBreakdown && (
          <div className="chart-grid__breakdown">
            <div className="chart-grid__cards">
              {filteredBreakdownCharts.map((chart) => (
                <StackedBarChartCard
                  key={chart.title}
                  config={chart}
                  enableFullscreen
                  showLegend={false}
                  className="chart-card--compact"
                  tooltipFixed
                  yMaxOverride={breakdownYAxisMax}
                  tooltipRef={globalLegendRef}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (slide.type === 'donut-matrix') {
    const years = [
      { id: '2024', label: '4Q24' },
      { id: '2025', label: '4Q25' },
      { id: '2026', label: '4Q26 (P)' }
    ];

    const categories = [
      { id: 'cobrar', label: 'Por Cobrar' },
      { id: 'desembolsar', label: 'Por Desembolsar' },
      { id: 'aprobados', label: 'Aprobados no vigentes' }
    ];

    const yearIndexById: Record<string, number> = {
      '2024': 16,
      '2025': 20,
      '2026': 24
    };

    const buildDonutData = (yearId: string, categoryId: string) => {
      const startIndex = yearIndexById[yearId];
      if (startIndex === undefined) {
        return { data: [], placeholder: true };
      }

      const lastIndex = startIndex + 3;

      const data = countryOrder.map((code) => {
        const series = countrySeriesByCode[code];
        const values = series[categoryId as keyof typeof series] as number[];
        const total = values[lastIndex] ?? 0;
        return {
          id: code,
          label: code,
          value: total,
          color: countryColors[code]
        };
      });

      return { data, placeholder: false };
    };

    const legendPanel = (
      <div className="donut-matrix__legend donut-matrix__legend--panel" role="list">
        {countryOrder.map((code) => (
          <div key={code} className="donut-matrix__legend-item" role="listitem">
            <span
              className="donut-matrix__legend-swatch"
              style={{ background: countryColors[code] }}
            />
            <span>{code}</span>
          </div>
        ))}
      </div>
    );

    return (
      <div className="donut-matrix">
        <div className="donut-matrix__header">
          <div>
            {slide.eyebrow && <p className="donut-matrix__eyebrow">{slide.eyebrow}</p>}
            <h2 className="donut-matrix__title">{slide.title}</h2>
            {slide.description && <p className="donut-matrix__description">{slide.description}</p>}
          </div>
        </div>
        <div className="donut-matrix__grid">
          <div className="donut-matrix__row donut-matrix__row--header">
            <div className="donut-matrix__corner" aria-hidden="true" />
            {years.map((year) => (
              <div key={year.id} className="donut-matrix__year">
                <span className="donut-matrix__year-label">{year.label}</span>
              </div>
            ))}
          </div>
          {categories.map((category) => (
            <div key={category.id} className="donut-matrix__row">
              <div className="donut-matrix__label">{category.label}</div>
              {years.map((year) => {
                const hideCell = category.id === 'aprobados' && year.id === '2026';
                if (hideCell) {
                  return (
                    <div
                      key={`${category.id}-${year.id}`}
                      className="donut-matrix__cell donut-matrix__cell--empty donut-matrix__cell--legend"
                    >
                      {legendPanel}
                    </div>
                  );
                }
                const donut = buildDonutData(year.id, category.id);
                return (
                  <div key={`${category.id}-${year.id}`} className="donut-matrix__cell">
                    <DonutChart
                      data={donut.data}
                      placeholder={donut.placeholder}
                      selectedId={donutMatrixSelectedByCategory[category.id] ?? null}
                      onSelect={(id) => {
                        setDonutMatrixSelectedByCategory((prev) => ({
                          ...prev,
                          [category.id]: id
                        }));
                      }}
                      dimUnselectedOnSelect
                      tooltipFixed
                      radiusScale={1.06}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === 'vigencia-activacion') {
    return (
      <div className="vigencia-grid vigencia-grid--tables-only">
        <header className="vigencia-grid__header">
          {slide.eyebrow && <p className="vigencia-grid__eyebrow">{slide.eyebrow}</p>}
          <h2 className="vigencia-grid__title">{slide.title}</h2>
          {slide.description && <p className="vigencia-grid__description">{slide.description}</p>}
        </header>
        <div className="vigencia-grid__tables" aria-label="Tablas de vigencia y activación">
          <VigenciaTableCard title="Etapas de activación" rows={slide.activationStages} />
          <VigenciaTableCard title="Aprobadas no vigentes" rows={slide.approvedNotVigent} />
        </div>
      </div>
    );
  }

  if (slide.type === 'investment-portfolio') {
    return <InvestmentPortfolioSlide slide={slide} />;
  }

  if (slide.type === 'dual-charts') {
    if (slide.id === 'exposicion-cartera-riesgo') {
      const adjustedCharts = [...slide.charts] as [typeof slide.charts[0], typeof slide.charts[1]];
      const secondaryChart = adjustedCharts[1];

      if (secondaryChart.type === 'line' && (secondaryChart.barData?.length ?? 0) > 0) {
        const currentRow = secondaryChart.barData?.[0];
        const currentValues = currentRow?.values ?? {};
        const currentPorActivar2026 = currentValues.porActivar2026 ?? 0;
        const currentPorActivarPost2026 = currentValues.porActivarPost2026 ?? 0;
        const hasCombinedPorActivar =
          secondaryChart.barSeries?.some((series) => series.id === 'porActivarTotal') ||
          Object.prototype.hasOwnProperty.call(currentValues, 'porActivarTotal');

        const nextValues = hasCombinedPorActivar
          ? {
              ...currentValues,
              porActivarTotal:
                currentValues.porActivarTotal ?? currentPorActivar2026 + currentPorActivarPost2026
            }
          : (() => {
              const requestedActivation2026 = Math.max(
                0,
                chartGridState?.activitiesInVigenciaMM ?? currentPorActivar2026
              );
              const totalPorActivar = currentPorActivar2026 + currentPorActivarPost2026;
              const porActivar2026 = Math.min(requestedActivation2026, totalPorActivar);
              const porActivarPost2026 = Math.max(totalPorActivar - porActivar2026, 0);
              return {
                ...currentValues,
                porActivar2026,
                porActivarPost2026
              };
            })();

        adjustedCharts[1] = {
          ...secondaryChart,
          barData: [
            {
              date: currentRow?.date ?? 'Q4-26',
              values: nextValues
            }
          ]
        };
      }

      return <DualChartsSlide slide={{ ...slide, charts: adjustedCharts }} />;
    }

    return <DualChartsSlide slide={slide} />;
  }

  if (slide.type === 'liquidity-activity') {
    return <LiquidityActivitySlide slide={slide} />;
  }

  if (slide.type === 'debt-sources') {
    return <DebtSourcesSlide slide={slide} />;
  }

  if (slide.type === 'debt-summary') {
    return <DebtSummarySlide slide={slide} />;
  }

  if (slide.type === 'debt-authorization') {
    return <DebtAuthorizationSlide slide={slide} />;
  }

  if (slide.type === 'rate-analysis') {
    return <RateAnalysisSlide slide={slide} />;
  }

  if (slide.type === 'line-cards') {
    if (slide.id === 'exposicion-cartera-riesgo-cards') {
      const countryNameByCode: Record<RiskExposureScenarioCountry, string> = {
        ARG: 'Argentina',
        BOL: 'Bolivia',
        BRA: 'Brasil',
        PAR: 'Paraguay',
        URU: 'Uruguay'
      };

      const riskExposureQuarterLabels = ['Q1-25', 'Q2-25', 'Q3-25', 'Q4-25', 'Q1-26', 'Q2-26', 'Q3-26', 'Q4-26'];
      const patrimonioByQuarterLabel: Record<string, number> = {
        'Q1-25': 1777,
        'Q2-25': 1750,
        'Q3-25': 1838,
        'Q4-25': 1852,
        'Q1-26': 1885.05,
        'Q2-26': 1896.6,
        'Q3-26': 1918.95,
        'Q4-26': 1950.2
      };
      const scenarioSeries = countrySeriesByCode[riskExposureScenarioCountry];
      const scenarioRows = riskExposureQuarterLabels.map((label) => {
        const quarterIndex = quarterLabels.indexOf(label);
        const cobrar = quarterIndex >= 0 ? (scenarioSeries.cobrar[quarterIndex] ?? 0) / 1_000_000 : 0;
        const desembolsar =
          quarterIndex >= 0 ? (scenarioSeries.desembolsar[quarterIndex] ?? 0) / 1_000_000 : 0;
        const aprobados =
          quarterIndex >= 0 ? (scenarioSeries.aprobados[quarterIndex] ?? 0) / 1_000_000 : 0;
        const usada = cobrar + desembolsar + aprobados;
        const capacidadMaxima = (patrimonioByQuarterLabel[label] ?? 0) * 3 * 0.25;
        const capacidadDisponible = Math.max(capacidadMaxima - usada, 0);
        return {
          label,
          cobrar,
          desembolsar,
          aprobados,
          usada,
          capacidadMaxima,
          capacidadDisponible
        };
      });

      const capacidadPrestableChart: StackedBarChartConfig = {
        type: 'stacked-bar',
        title: 'Capacidad prestable',
        subtitle: '',
        unit: 'USD mm',
        tooltipTotalLabel: 'Capacidad Prestable Máxima',
        showSegmentLabels: true,
        showTotalLabels: true,
        showTotalLabelUnit: false,
        totalLabelFontSize: '0.66rem',
        totalLabelColor: '#111111',
        segmentLabelColor: '#111111',
        series: [
          { id: 'usada', label: 'Capacidad Prestable Utilizada', color: '#c1121f' },
          {
            id: 'disponible',
            label: 'Capacidad Prestable Disponible',
            color: '#B3B3B3',
            hollow: true,
            stroke: '#111111',
            strokeWidth: 1.7,
            strokeDasharray: '7 4'
          }
        ],
        data: scenarioRows.map((row) => ({
          label: row.label,
          values: {
            usada: row.usada,
            disponible: row.capacidadDisponible
          }
        }))
      };

      return (
        <div className="line-cards">
          <header className="line-cards__header line-cards__header--with-controls">
            <div>
              <h2 className="line-cards__title line-cards__title--risk">
                {(slide.eyebrow || slide.title).toUpperCase()}
              </h2>
              {slide.description && <p className="line-cards__description">{slide.description}</p>}
            </div>
            <details className="chart-dropdown chart-dropdown--inline line-cards__country-dropdown">
              <summary>
                Escenario país
                <span className="chart-dropdown__count">
                  {countryNameByCode[riskExposureScenarioCountry]}
                </span>
              </summary>
              <div className="chart-dropdown__menu">
                {riskExposureScenarioCountries.map((countryCode) => (
                  <label key={countryCode} className="chart-dropdown__item">
                    <input
                      type="radio"
                      name="risk-exposure-country-scenario"
                      checked={riskExposureScenarioCountry === countryCode}
                      onChange={() => setRiskExposureScenarioCountry(countryCode)}
                    />
                    <span>{countryNameByCode[countryCode]}</span>
                  </label>
                ))}
              </div>
            </details>
          </header>
          <div className="line-cards__grid" aria-label="Grilla de gráficos por país">
            <StackedBarChartCard config={capacidadPrestableChart} showLegend={false} />
            <ChartCard
              placeholder
              variant="plain"
              config={{
                title: ' ',
                subtitle: '',
                showValueLabels: false,
                data: []
              }}
            />
            <ChartCard
              placeholder
              variant="plain"
              config={{
                title: ' ',
                subtitle: '',
                showValueLabels: false,
                data: []
              }}
            />
          </div>
        </div>
      );
    }

    return <LineCardsSlide slide={slide} />;
  }

  if (slide.type === 'capital-adequacy') {
    return <CapitalAdequacySlide slide={slide} />;
  }

  if (slide.type === 'text-table') {
    return <TextTableSlide slide={slide} />;
  }

  if (slide.type === 'risk-capacity') {
    const riskPercentState = riskCapacityState ?? {
      riskCapacityPercent: false,
      setRiskCapacityPercent: () => {}
    };
    const { riskCapacityPercent, setRiskCapacityPercent } = riskPercentState;
    const includedCountries = countryOrder.filter((code) => code !== 'RNS');
    const years = [
      { id: '2024', label: '4Q24' },
      { id: '2025', label: '4Q25' },
      { id: '2026', label: '4Q26 (P)' }
    ] as const;
    type YearId = (typeof years)[number]['id'];

    const yearLastQuarterIndex: Record<YearId, number> = {
      '2024': 19,
      '2025': 23,
      '2026': 27
    };
    const yearRatingIndex: Record<YearId, number> = {
      '2024': 0,
      '2025': 1,
      '2026': 2
    };

    const ratingEquivalence: Record<string, number> = {
      Aaa: 1,
      'AAA': 1,
      Aa1: 2,
      'AA+': 2,
      Aa2: 3,
      AA: 3,
      Aa3: 4,
      'AA-': 4,
      A1: 5,
      'A+': 5,
      A2: 6,
      A: 6,
      A3: 7,
      'A-': 7,
      Baa1: 8,
      'BBB+': 8,
      Baa2: 9,
      BBB: 9,
      Baa3: 10,
      'BBB-': 10,
      Ba1: 11,
      'BB+': 11,
      Ba2: 12,
      BB: 12,
      Ba3: 13,
      'BB-': 13,
      B1: 14,
      'B+': 14,
      B2: 15,
      B: 15,
      B3: 16,
      'B-': 16,
      Caa1: 17,
      'CCC+': 17,
      Caa2: 18,
      CCC: 18,
      Caa3: 19,
      'CCC-': 19,
      Ca: 20,
      CC: 20,
      C: 21,
      D: 22
    };

    const gradeByEquivalence = (value: number) => {
      if (value <= 8) return 'GI1';
      if (value <= 10) return 'GI2';
      if (value <= 13) return 'BB';
      if (value <= 16) return 'B';
      return '< CCC';
    };

    const countryRatings: Record<string, [string, string, string]> = {
      ARG: ['Caa1', 'CCC+', 'CCC+'],
      BOL: ['Ca', 'CCC-', 'CCC-'],
      BRA: ['Ba1', 'BB', 'BB'],
      PAR: ['Baa3', 'BBB-', 'BBB-'],
      URU: ['Baa1', 'BBB+', 'BBB+'],
      RNS: ['CCC', 'CCC', 'CCC']
    };

    const countryNameByCode: Record<string, string> = {
      ARG: 'Argentina',
      BOL: 'Bolivia',
      BRA: 'Brasil',
      PAR: 'Paraguay',
      URU: 'Uruguay',
      RNS: 'Regional No Soberano'
    };

    // Worst -> best (left -> right)
    const gradeBuckets = [
      { id: '< CCC', label: 'Básica' },
      { id: 'B', label: 'Intermedia' },
      { id: 'BB', label: 'Superior' },
      { id: 'GI2', label: 'GI2' },
      { id: 'GI1', label: 'GI1' }
    ] as const;

    const buildCapacityByCountry = (yearId: YearId) =>
      includedCountries.reduce<Record<string, number>>((acc, code) => {
        const series = countrySeriesByCode[code];
        const index = yearLastQuarterIndex[yearId];
        acc[code] =
          (series.cobrar[index] ?? 0) +
          (series.desembolsar[index] ?? 0) +
          (series.aprobados[index] ?? 0);
        return acc;
      }, {});

    const buildCapacityDonutData = (yearId: YearId, asPercent: boolean) => {
      const capacityByCountry = buildCapacityByCountry(yearId);
      const total = includedCountries.reduce((sum, code) => sum + (capacityByCountry[code] ?? 0), 0);
      return includedCountries.map((code) => {
        const rawValue = capacityByCountry[code] ?? 0;
        const value = asPercent && total > 0 ? Number(((rawValue / total) * 100).toFixed(1)) : rawValue;
        return {
          id: code,
          label: code,
          value,
          color: countryColors[code]
        };
      });
    };

    const buildRiskConfig = (yearId: YearId, asPercent: boolean) => {
      const capacityByCountry = buildCapacityByCountry(yearId);
      const totalCapacity = includedCountries.reduce((sum, code) => sum + (capacityByCountry[code] ?? 0), 0);
      const totals = gradeBuckets.reduce<Record<string, number>>((acc, grade) => {
        acc[grade.id] = 0;
        return acc;
      }, {});
      const countriesByBucket = gradeBuckets.reduce<Record<string, string[]>>((acc, grade) => {
        acc[grade.id] = [];
        return acc;
      }, {});
      includedCountries.forEach((code) => {
        const rating = countryRatings[code]?.[yearRatingIndex[yearId]] ?? 'CCC';
        const equivalence = ratingEquivalence[rating] ?? 22;
        const grade = gradeByEquivalence(equivalence);
        totals[grade] += capacityByCountry[code] ?? 0;
        countriesByBucket[grade].push(countryNameByCode[code] ?? code);
      });

      return {
        type: 'bar' as const,
        title: `Riesgo-${yearId}`,
        subtitle: '',
        unit: asPercent ? '%' : 'MM',
        showValueLabels: true,
        showValueLabelUnit: false,
        data: gradeBuckets.map((grade) => {
          const rawValue = totals[grade.id] ?? 0;
          const value = asPercent
            ? totalCapacity > 0
              ? Number(((rawValue / totalCapacity) * 100).toFixed(1))
              : 0
            : rawValue / 1_000_000;
          return {
            label: grade.label,
            value,
            color: '#adb5bd',
            countries: countriesByBucket[grade.id]
          };
        })
      };
    };

    const riskConfigs = years.map((year) => buildRiskConfig(year.id, riskCapacityPercent));
    const riskGlobalMax = riskConfigs.reduce((max, cfg) => {
      cfg.data.forEach((d) => {
        if (d.value > max) max = d.value;
      });
      return max;
    }, 0);

    return (
      <div className="risk-capacity">
        <div className="risk-capacity__header">
          <p className="risk-capacity__eyebrow">{slide.eyebrow}</p>
          <div className="risk-capacity__title-row">
            <h2 className="risk-capacity__title">{slide.title}</h2>
            <details className="risk-capacity__info">
              <summary aria-label="Ver grilla de ratings" title="Ver grilla de ratings">
                i
              </summary>
              <div className="risk-capacity__info-popover" role="note">
                <p className="risk-capacity__info-title">Grilla de ratings y estandarización</p>
                <table className="risk-capacity__ratings-table">
                  <thead>
                    <tr>
                      <th>Moody&apos;s</th>
                      <th>S&amp;P</th>
                      <th>Fitch</th>
                      <th>Estándar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskCapacityRatingRows.map((row) => (
                      <tr key={`${row.moodys}-${row.sp}-${row.fitch}`}>
                        <td data-label="Moody's">{row.moodys}</td>
                        <td data-label="S&P">{row.sp}</td>
                        <td data-label="Fitch">{row.fitch}</td>
                        <td data-label="Estándar">{row.standard}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
          {slide.description && <p className="risk-capacity__description">{slide.description}</p>}
          <div className="risk-capacity__actions">
            <button
              type="button"
              className={`risk-capacity__toggle${riskCapacityPercent ? ' is-active' : ''}`}
              onClick={() => setRiskCapacityPercent((prev) => !prev)}
            >
              {riskCapacityPercent ? 'Ver MM' : 'Ver %'}
            </button>
          </div>
        </div>
        <div className="risk-capacity__year-grid">
          <section className="risk-capacity__section">
            <h3 className="risk-capacity__section-title">CAPACIDAD PRESTABLE UTILIZADA POR PAÍS</h3>
            <div className="risk-capacity__donuts">
              {years.map((year) => (
                <div key={`${year.id}-donut`} className="risk-capacity__year">
                  <h4 className="risk-capacity__year-title">{year.label}</h4>
                  <div className="risk-capacity__donut-card">
                    <div className="risk-capacity__donut-chart">
                      <DonutChart
                        data={buildCapacityDonutData(year.id, riskCapacityPercent)}
                        tooltipFixed
                        format={riskCapacityPercent ? 'percent' : 'millions'}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="risk-capacity__section">
            <h3 className="risk-capacity__section-title">
              CAPACIDAD PRESTABLE UTILIZADA POR PAÍS Y POR CALIFICACIÓN CREDITICIA
            </h3>
            <div className="risk-capacity__charts">
              {years.map((year, index) => (
                <div key={`${year.id}-bars`} className="risk-capacity__year">
                  <h4 className="risk-capacity__year-title">{year.label}</h4>
                  <ChartCard
                    config={riskConfigs[index]}
                    hideHeader
                    variant="plain"
                    yMaxOverride={riskGlobalMax}
                    tooltipFixed
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  const isEndeudamientoSlide =
    slide.type === 'content' && slide.id === 'analisis-endeudamiento' && Boolean(slide.chartAnnual);
  const isPrevisionSlide =
    slide.type === 'content' && slide.id === 'prevision-perdida-cartera-prestamos';
  const isPrevisionIndexView = isPrevisionSlide && previsionState?.previsionView === 'indice100';
  const scatterCharts =
    isEndeudamientoSlide && slide.type === 'content' ? slide.scatterCharts : null;
  const isV2 =
    isEndeudamientoSlide && endeudamientoState?.endeudamientoVariant === 'v2' && Boolean(scatterCharts);
  const isMarginal = isEndeudamientoSlide && endeudamientoState?.endeudamientoMetric === 'marginal';
  const endeudamientoQuarterChart = isMarginal ? slide.chartMarginal ?? slide.chart : slide.chart;
  const endeudamientoAnnualChart = isMarginal
    ? slide.chartAnnualMarginal ?? slide.chartAnnual ?? slide.chartMarginal ?? slide.chart
    : slide.chartAnnual ?? slide.chart;
  const endeudamientoChart =
    isEndeudamientoSlide && endeudamientoState?.endeudamientoView === 'annual'
      ? endeudamientoAnnualChart
      : endeudamientoQuarterChart;

  const drilldownConfig =
    slide.type === 'content' && slide.lineDrilldown && slide.chart.type === 'line'
      ? buildDrilldownConfig(slide, cierreMetric)
      : null;

  const isDrilldown = Boolean(drilldownConfig);
  const scatterSource = endeudamientoState?.endeudamientoScatterSource ?? 'ifd';
  const scatterSeries = scatterCharts ? scatterCharts[scatterSource] : null;
  const scatterAvailableYears = scatterSeries
    ? Array.from(new Set(scatterSeries.series.map((series) => series.id))).sort()
    : [];
  const scatterSelectedYears = endeudamientoState?.endeudamientoScatterYears ?? [];
  const scatterActiveYears = scatterSelectedYears.filter((year) =>
    scatterAvailableYears.includes(year)
  );
  const scatterYearsToShow =
    scatterActiveYears.length > 0 ? scatterActiveYears : scatterAvailableYears;
  const scatterChartConfig =
    isV2 && scatterSeries
      ? ({
          ...scatterSeries,
          series: scatterSeries.series.filter((series) => scatterYearsToShow.includes(series.id))
        } as LineChartConfig)
      : null;

  const chartConfig = isEndeudamientoSlide
    ? scatterChartConfig ?? endeudamientoChart
    : isPrevisionSlide && slide.type === 'content'
      ? isPrevisionIndexView
        ? slide.chartAnnual ?? slide.chart
        : slide.chart
      : drilldownConfig ?? slide.chart;

  const handleLegendClick = (seriesId: string) => {
    if (slide.type !== 'content' || !slide.lineDrilldown) return;

    if (cierreMetric) {
      setCierreMetric(null);
      return;
    }

    const matchingMetric = slide.lineDrilldown.metrics.find((metric) => metric.id === seriesId);
    if (matchingMetric) {
      setCierreMetric(matchingMetric.id);
    }
  };

  const endeudamientoHoverLabel = endeudamientoState?.endeudamientoHoverLabel ?? null;
  const setEndeudamientoHoverLabel = endeudamientoState?.setEndeudamientoHoverLabel;
  const hoverLabelHandler =
    isEndeudamientoSlide && !isV2 && setEndeudamientoHoverLabel
      ? setEndeudamientoHoverLabel
      : undefined;
  const previsionHoverLabel = previsionState?.previsionHoverLabel ?? null;
  const setPrevisionHoverLabel = previsionState?.setPrevisionHoverLabel;
  const previsionHoverLabelHandler =
    isPrevisionSlide && setPrevisionHoverLabel
      ? setPrevisionHoverLabel
      : undefined;
  const isAnnualView =
    isEndeudamientoSlide && !isV2 && endeudamientoState?.endeudamientoView === 'annual';
  const isAnnualLabel = (label: string | null) => Boolean(label && label.endsWith('-12-31'));
  const getYearFromLabel = (label: string | null) => (label ? label.slice(0, 4) : null);
  const toAnnualLabel = (label: string | null) => {
    if (!label) return null;
    if (isAnnualLabel(label)) return label;
    const year = getYearFromLabel(label);
    return year ? `${year}-12-31` : label;
  };
  const toQuarterLabel = (label: string | null) => {
    if (!label) return null;
    if (!isAnnualLabel(label)) return label;
    const year = getYearFromLabel(label);
    return year ? `${year}-10-01` : label;
  };
  const lineHoverLabel = isV2
    ? null
    : isAnnualView
      ? toAnnualLabel(endeudamientoHoverLabel)
      : endeudamientoHoverLabel;
  const useAnnualMiniChart =
    isEndeudamientoSlide &&
    isAnnualView &&
    (isMarginal ? Boolean(slide.miniChartAnnualMarginal) : Boolean(slide.miniChartAnnual));
  const miniHoverLabel = useAnnualMiniChart
    ? lineHoverLabel
    : isAnnualView
      ? toQuarterLabel(endeudamientoHoverLabel)
      : endeudamientoHoverLabel;

  const endeudamientoActions =
    isEndeudamientoSlide && endeudamientoState ? (
      <>
        <div className="chart-card__switch" role="group" aria-label="Promedio y vista">
          <button
            type="button"
            className={`chart-card__switch-btn chart-card__switch-btn--label${
              endeudamientoState.endeudamientoMetric === 'ponderado' ? ' is-active' : ''
            }`}
            onClick={() => {
              endeudamientoState.setEndeudamientoMetric('ponderado');
              endeudamientoState.setEndeudamientoVariant('v1');
            }}
            aria-pressed={endeudamientoState.endeudamientoMetric === 'ponderado'}
          >
            Prom Ponderado
          </button>
          <button
            type="button"
            className={`chart-card__switch-btn chart-card__switch-btn--label${
              endeudamientoState.endeudamientoMetric === 'marginal' ? ' is-active' : ''
            }`}
            onClick={() => {
              endeudamientoState.setEndeudamientoMetric('marginal');
              endeudamientoState.setEndeudamientoVariant('v1');
              endeudamientoState.setEndeudamientoView('annual');
            }}
            aria-pressed={endeudamientoState.endeudamientoMetric === 'marginal'}
          >
            Prom Pond. Marginal
          </button>
        </div>
        {!isV2 && (
          <div className="chart-card__switch" role="group" aria-label="Frecuencia">
            {!isMarginal && (
              <button
                type="button"
                className={`chart-card__switch-btn${
                  endeudamientoState.endeudamientoView === 'quarterly' ? ' is-active' : ''
                }`}
                onClick={() => endeudamientoState.setEndeudamientoView('quarterly')}
                aria-pressed={endeudamientoState.endeudamientoView === 'quarterly'}
              >
                Q
              </button>
            )}
            <button
              type="button"
              className={`chart-card__switch-btn${
                endeudamientoState.endeudamientoView === 'annual' ? ' is-active' : ''
              }`}
              onClick={() => endeudamientoState.setEndeudamientoView('annual')}
              aria-pressed={endeudamientoState.endeudamientoView === 'annual'}
            >
              Y
            </button>
          </div>
        )}
        {isV2 && scatterCharts && (
          <>
            <div className="chart-card__switch" role="group" aria-label="Origen">
              <button
                type="button"
                className={`chart-card__switch-btn${
                  endeudamientoState.endeudamientoScatterSource === 'ifd' ? ' is-active' : ''
                }`}
                onClick={() => endeudamientoState.setEndeudamientoScatterSource('ifd')}
                aria-pressed={endeudamientoState.endeudamientoScatterSource === 'ifd'}
              >
                IFD
              </button>
              <button
                type="button"
                className={`chart-card__switch-btn${
                  endeudamientoState.endeudamientoScatterSource === 'mercado' ? ' is-active' : ''
                }`}
                onClick={() => endeudamientoState.setEndeudamientoScatterSource('mercado')}
                aria-pressed={endeudamientoState.endeudamientoScatterSource === 'mercado'}
              >
                Mercado
              </button>
            </div>
            <details className="chart-dropdown chart-dropdown--inline">
              <summary>
                Años
                <span className="chart-dropdown__count">
                  {scatterYearsToShow.length === scatterAvailableYears.length
                    ? 'Todos'
                    : `${scatterYearsToShow.length}`}
                </span>
              </summary>
              <div className="chart-dropdown__menu">
                <label className="chart-dropdown__item">
                  <input
                    type="checkbox"
                    checked={scatterYearsToShow.length === scatterAvailableYears.length}
                    onChange={() =>
                      endeudamientoState.setEndeudamientoScatterYears(scatterAvailableYears)
                    }
                  />
                  <span>Todos</span>
                </label>
                {scatterAvailableYears.map((year) => (
                  <label key={year} className="chart-dropdown__item">
                    <input
                      type="checkbox"
                      checked={scatterYearsToShow.includes(year)}
                      onChange={() =>
                        endeudamientoState.setEndeudamientoScatterYears((prev) => {
                          const current = prev.filter((item) =>
                            scatterAvailableYears.includes(item)
                          );
                          if (current.includes(year)) {
                            const next = current.filter((item) => item !== year);
                            return next.length ? next : current;
                          }
                          return [...current, year].sort();
                        })
                      }
                    />
                    <span>{year}</span>
                  </label>
                ))}
              </div>
            </details>
          </>
        )}
      </>
    ) : null;

  const previsionActions =
    isPrevisionSlide && previsionState && Boolean(slide.chartAnnual) ? (
      <div className="chart-card__switch" role="group" aria-label="Vista de previsión">
        <button
          type="button"
          className={`chart-card__switch-btn${previsionState.previsionView === 'monto' ? ' is-active' : ''}`}
          onClick={() => previsionState.setPrevisionView('monto')}
          aria-pressed={previsionState.previsionView === 'monto'}
        >
          Monto
        </button>
        <button
          type="button"
          className={`chart-card__switch-btn${
            previsionState.previsionView === 'indice100' ? ' is-active' : ''
          }`}
          onClick={() => previsionState.setPrevisionView('indice100')}
          aria-pressed={previsionState.previsionView === 'indice100'}
        >
          Índice 100
        </button>
      </div>
    ) : null;

  const chartActions = endeudamientoActions ?? previsionActions;

  const endeudamientoMiniChart =
    isEndeudamientoSlide && !isV2 && slide.type === 'content'
      ? isMarginal
        ? isAnnualView
          ? slide.miniChartAnnualMarginal ?? slide.miniChartMarginal ?? slide.miniChart
          : slide.miniChartMarginal ?? slide.miniChart
        : isAnnualView
          ? slide.miniChartAnnual ?? slide.miniChart
          : slide.miniChart
      : null;

  const miniTooltipSeries = endeudamientoMiniChart
    ? getMiniTooltipSeries(endeudamientoMiniChart)
    : emptyMiniTooltipSeries;
  const endeudamientoMiniLineChart = endeudamientoMiniChart
    ? getMiniLineConfig(endeudamientoMiniChart)
    : null;
  const endeudamientoMiniTitle = endeudamientoMiniChart
    ? `${endeudamientoMiniChart.title}${
        endeudamientoMiniChart.subtitle ? ` (${endeudamientoMiniChart.subtitle})` : ''
      }`
    : '';

  const previsionMiniLineChart =
    isPrevisionSlide && slide.type === 'content' ? slide.miniLineChart : null;
  const previsionMiniTitle = previsionMiniLineChart
    ? `${previsionMiniLineChart.title}${
        previsionMiniLineChart.subtitle ? ` (${previsionMiniLineChart.subtitle})` : ''
      }`
    : '';
  const previsionTooltipSeries = useMemo(
    () =>
      previsionMiniLineChart
        ? previsionMiniLineChart.series.map((seriesItem) => ({
            id: seriesItem.id,
            label:
              seriesItem.label.includes('%') || seriesItem.label.toLowerCase().includes('ratio')
                ? seriesItem.label
                : `${seriesItem.label} (%)`,
            color: seriesItem.color,
            values: seriesItem.values.reduce<Record<string, number>>((acc, point) => {
              acc[point.date] = point.value;
              return acc;
            }, {})
          }))
        : emptyMiniTooltipSeries,
    [previsionMiniLineChart]
  );

  const lineChartClassName = isEndeudamientoSlide
    ? `endeudamiento-line-chart${isAnnualView ? ' is-annual' : ''}${
        isV2 ? ' endeudamiento-scatter' : ''
      }`
    : isPrevisionSlide
      ? `prevision-line-chart no-deuda-tooltip${isPrevisionIndexView ? ' is-index' : ''}`
      : undefined;

  const mainChart =
    chartConfig.type === 'line' ? (
      <LineChartCard
        config={chartConfig}
        placeholder={layoutOnly}
        activeLegendId={isDrilldown ? null : cierreMetric}
        onLegendClick={handleLegendClick}
        actions={chartActions}
        enableFullscreen
        tooltipFixed={isEndeudamientoSlide && !isV2}
        fixedTooltipEmptyOnIdle={isEndeudamientoSlide && !isV2}
        className={lineChartClassName}
        hoverLabel={
          isEndeudamientoSlide ? lineHoverLabel : isPrevisionSlide ? previsionHoverLabel : null
        }
        onHoverLabelChange={
          isEndeudamientoSlide ? hoverLabelHandler : isPrevisionSlide ? previsionHoverLabelHandler : undefined
        }
        extraTooltipSeries={isPrevisionSlide ? previsionTooltipSeries : miniTooltipSeries}
        footer={
          endeudamientoMiniChart ? (
            <div className="endeudamiento-mini-wrap">
              <p className="endeudamiento-mini-wrap__title">{endeudamientoMiniTitle}</p>
              <LineChartCard
                config={endeudamientoMiniLineChart ?? getMiniLineConfig(endeudamientoMiniChart)}
                className="endeudamiento-mini-line-chart"
                enableFullscreen={false}
                hideHeader
                hoverLabel={miniHoverLabel}
                onHoverLabelChange={setEndeudamientoHoverLabel ?? undefined}
              />
            </div>
          ) : previsionMiniLineChart ? (
            <div className="prevision-mini-wrap">
              <p className="prevision-mini-wrap__title">{previsionMiniTitle}</p>
              <LineChartCard
                config={previsionMiniLineChart}
                className="prevision-mini-line-chart"
                enableFullscreen={false}
                hideHeader
                hoverLabel={previsionHoverLabel}
                onHoverLabelChange={previsionHoverLabelHandler}
              />
            </div>
          ) : null
        }
      />
    ) : chartConfig.type === 'stacked-bar' ? (
      <StackedBarChartCard
        config={chartConfig}
        placeholder={layoutOnly}
        enableFullscreen
        actions={chartActions}
        showLegend={chartConfig.showLegend ?? true}
        className={slide.id === 'emisiones-segmentadas-2025' ? 'chart-card--fullscreen' : undefined}
      />
    ) : (
      <ChartCard config={chartConfig} placeholder={layoutOnly} enableFullscreen />
    );

  const isChartOnlyContentSlide = slide.id === 'emisiones-segmentadas-2025';

  return (
    <div
      className={`content-grid${layoutOnly ? ' content-grid--layout' : ''}${
        isChartOnlyContentSlide ? ' content-grid--chart-only' : ''
      }`}
    >
      {!isChartOnlyContentSlide && (
        <TextCard
          eyebrow={slide.eyebrow}
          title={slide.title}
          description={slide.description}
          highlights={slide.highlights}
          callout={slide.callout}
          placeholder={layoutOnly}
        />
      )}
      {mainChart}
    </div>
  );
};

const buildDrilldownConfig = (
  slide: Extract<SlideDefinition, { type: 'content' }>,
  metric: LineDrilldownMetric | null
): LineChartConfig | null => {
  if (!metric || !slide.lineDrilldown || slide.chart.type !== 'line') {
    return null;
  }

  const metricLabel =
    slide.lineDrilldown.metrics.find((entry) => entry.id === metric)?.label ?? metric;
  const grouped = new Map<string, Array<{ date: string; value: number }>>();

  slide.lineDrilldown.rows.forEach((row) => {
    const list = grouped.get(row.country) ?? [];
    list.push({ date: row.date, value: row[metric] });
    grouped.set(row.country, list);
  });

  return {
    type: 'line',
    title: `${metricLabel} por país`,
    subtitle: slide.chart.subtitle,
    unit: slide.chart.unit,
    series: Array.from(grouped.entries()).map(([country, values]) => ({
      id: country,
      label: country,
      values
    }))
  };
};

export default SlideRenderer;
