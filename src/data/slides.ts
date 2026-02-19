import type {
  BarChartConfig,
  LineChartConfig,
  LineDrilldownConfig,
  LineDrilldownMetric,
  SlideDefinition,
  GroupedBarChartConfig,
  StackedBarChartConfig,
  InvestmentPortfolioAsset,
  SimpleTable,
  SimpleTableColumn
} from '../types/slides';
import {
  activitiesInVigencia2026ByCountry,
  countryOrder,
  countrySeriesByCode,
  countryStackedCharts,
  quarterLabels
} from './countryStacked';
import greenLogo from '../assets/green.png';
import usaLogo from '../assets/USA.png';
import cafLogo from '../assets/CAF.png';
import idbLogo from '../assets/IDB.png';
import australiaLogo from '../assets/australia2.png';
import japonLogo from '../assets/JAPON.png';
import icoLogo from '../assets/ico.png';
import indiaLogo from '../assets/indiav2.png';
import kfwLogo from '../assets/kfw.png';

const quarterEndByMonth: Record<string, string> = {
  '01': '03-31',
  '04': '06-30',
  '07': '09-30',
  '10': '12-31'
};

const toQuarterEndDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(value);
  if (!match) return value;
  const [, year, month] = match;
  const quarterEnd = quarterEndByMonth[month];
  return quarterEnd ? `${year}-${quarterEnd}` : value;
};

const toQuarterLabel = (value: string) => {
  const isoMatch = /^(\d{4})-(\d{2})-\d{2}$/.exec(value);
  if (isoMatch) {
    const [, year, monthText] = isoMatch;
    const month = Number(monthText);
    const quarter = Math.floor((month - 1) / 3) + 1;
    return `${quarter}Q${year.slice(-2)}`;
  }

  const axisMatch = /^(\d{2})\/(\d{2})$/.exec(value);
  if (axisMatch) {
    const [, monthText, shortYear] = axisMatch;
    const month = Number(monthText);
    const quarter = Math.floor((month - 1) / 3) + 1;
    return `${quarter}Q${shortYear}`;
  }

  return value;
};

const toYearLabel = (value: string) => {
  const isoMatch = /^(\d{4})-\d{2}-\d{2}$/.exec(value);
  if (isoMatch) return isoMatch[1];

  const axisMatch = /^(\d{2})\/(\d{2})$/.exec(value);
  if (axisMatch) return `20${axisMatch[2]}`;

  return value;
};

const normalizeQuarterlyLineChart = (chart: LineChartConfig): LineChartConfig => ({
  ...chart,
  barData: chart.barData?.map((row) => ({
    ...row,
    date: toQuarterEndDate(row.date)
  })),
  series: chart.series.map((seriesItem) => ({
    ...seriesItem,
    values: seriesItem.values.map((point) => ({
      ...point,
      date: toQuarterEndDate(point.date)
    }))
  }))
});

const removeYearFromLineChart = (chart: LineChartConfig, year: string): LineChartConfig => ({
  ...chart,
  barData: chart.barData?.filter((row) => !row.date.startsWith(`${year}-`)),
  series: chart.series.map((seriesItem) => ({
    ...seriesItem,
    values: seriesItem.values.filter((point) => !point.date.startsWith(`${year}-`))
  }))
});

const removeYearFromGroupedChart = (
  chart: GroupedBarChartConfig,
  year: string
): GroupedBarChartConfig => ({
  ...chart,
  data: chart.data.filter((datum) => !datum.label.startsWith(`${year}-`))
});

const normalizeQuarterlyGroupedChart = (
  chart: GroupedBarChartConfig
): GroupedBarChartConfig => ({
  ...chart,
  data: chart.data.map((datum) => {
    const quarterEndLabel = toQuarterEndDate(datum.label);
    return {
      ...datum,
      label: quarterEndLabel,
      displayLabel: toQuarterLabel(quarterEndLabel)
    };
  })
});

const cierreGeneralChart: LineChartConfig = {
  type: 'line',
  title: 'Stock por estado',
  subtitle: 'S/ millones · cortes trimestrales',
  unit: 'MM',
  series: [
    {
      id: 'aprobados',
      label: 'Aprobados no vigentes',
      values: [
        { date: '31/3/20', value: 212.0 },
        { date: '30/6/20', value: 244.0 },
        { date: '30/9/20', value: 363.9 },
        { date: '31/12/20', value: 477.1 },
        { date: '31/3/21', value: 460.1 },
        { date: '30/6/21', value: 496.3 },
        { date: '30/9/21', value: 432.8 },
        { date: '31/12/21', value: 690.1 },
        { date: '31/3/22', value: 674.8 },
        { date: '30/6/22', value: 428.5 },
        { date: '30/9/22', value: 339.1 },
        { date: '31/12/22', value: 427.1 },
        { date: '31/3/23', value: 427.1 },
        { date: '30/6/23', value: 393.5 },
        { date: '30/9/23', value: 596.8 },
        { date: '31/12/23', value: 357.7 },
        { date: '31/3/24', value: 357.7 },
        { date: '30/6/24', value: 523.4 },
        { date: '30/9/24', value: 368.4 },
        { date: '31/12/24', value: 252.0 },
        { date: '31/3/25', value: 282.0 },
        { date: '30/6/25', value: 351.0 },
        { date: '30/9/25', value: 425.6 },
        { date: '31/12/25', value: 313.8 }
      ]
    },
    {
      id: 'desembolsar',
      label: 'Por desembolsar',
      values: [
        { date: '31/3/20', value: 1060.3 },
        { date: '30/6/20', value: 953.4 },
        { date: '30/9/20', value: 929.6 },
        { date: '31/12/20', value: 892.5 },
        { date: '31/3/21', value: 877.3 },
        { date: '30/6/21', value: 893.2 },
        { date: '30/9/21', value: 841.5 },
        { date: '31/12/21', value: 701.0 },
        { date: '31/3/22', value: 766.7 },
        { date: '30/6/22', value: 992.1 },
        { date: '30/9/22', value: 1019.1 },
        { date: '31/12/22', value: 984.0 },
        { date: '31/3/23', value: 950.4 },
        { date: '30/6/23', value: 1005.5 },
        { date: '30/9/23', value: 1141.4 },
        { date: '31/12/23', value: 1347.5 },
        { date: '31/3/24', value: 1236.3 },
        { date: '30/6/24', value: 1435.9 },
        { date: '30/9/24', value: 1261.5 },
        { date: '31/12/24', value: 1394.4 },
        { date: '31/3/25', value: 1245.0 },
        { date: '30/6/25', value: 1153.3 },
        { date: '30/9/25', value: 1063.8 },
        { date: '31/12/25', value: 1022.4 }
      ]
    },
    {
      id: 'cobrar',
      label: 'Por cobrar',
      values: [
        { date: '31/3/20', value: 952.3 },
        { date: '30/6/20', value: 1104.5 },
        { date: '30/9/20', value: 1147.3 },
        { date: '31/12/20', value: 1251.5 },
        { date: '31/3/21', value: 1295.1 },
        { date: '30/6/21', value: 1319.0 },
        { date: '30/9/21', value: 1398.4 },
        { date: '31/12/21', value: 1519.6 },
        { date: '31/3/22', value: 1528.2 },
        { date: '30/6/22', value: 1577.6 },
        { date: '30/9/22', value: 1611.3 },
        { date: '31/12/22', value: 1760.8 },
        { date: '31/3/23', value: 1759.0 },
        { date: '30/6/23', value: 1744.2 },
        { date: '30/9/23', value: 1770.3 },
        { date: '31/12/23', value: 1877.2 },
        { date: '31/3/24', value: 1993.0 },
        { date: '30/6/24', value: 1997.9 },
        { date: '30/9/24', value: 2206.4 },
        { date: '31/12/24', value: 2382.0 },
        { date: '31/3/25', value: 2469.6 },
        { date: '30/6/25', value: 2448.5 },
        { date: '30/9/25', value: 2513.2 },
        { date: '31/12/25', value: 2590.6 }
      ]
    }
  ]
};

const stackedSeriesColors: Record<LineDrilldownMetric, string> = {
  aprobados: 'var(--series-1)',
  desembolsar: 'var(--series-2)',
  cobrar: 'var(--series-3)'
};

const buildStackedBarConfig = (
  source: LineChartConfig,
  seriesIds: LineDrilldownMetric[],
  overrides: Pick<StackedBarChartConfig, 'title' | 'subtitle' | 'unit'>
): StackedBarChartConfig => {
  const seriesById = new Map(source.series.map((series) => [series.id, series]));
  const series = seriesIds
    .map((id) => {
      const baseSeries = seriesById.get(id);
      if (!baseSeries) return null;
      return {
        id: baseSeries.id,
        label: baseSeries.label,
        color: stackedSeriesColors[id]
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const baseSeries = seriesById.get(seriesIds[0]) ?? source.series[0];
  const dateOrder = baseSeries?.values.map((point) => point.date) ?? [];
  const valuesBySeries = new Map(
    source.series.map((series) => [series.id, new Map(series.values.map((point) => [point.date, point.value]))])
  );

  const data = dateOrder.map((date) => {
    const values: Record<string, number> = {};
    series.forEach((seriesItem) => {
      values[seriesItem.id] = valuesBySeries.get(seriesItem.id)?.get(date) ?? 0;
    });
    return { label: date, values };
  });

  return {
    type: 'stacked-bar',
    title: overrides.title,
    subtitle: overrides.subtitle,
    unit: overrides.unit,
    series,
    data
  };
};

export const cierreGeneralStackedTwoSeries = buildStackedBarConfig(
  cierreGeneralChart,
  ['desembolsar', 'aprobados'],
  {
    title: cierreGeneralChart.title,
    subtitle: cierreGeneralChart.subtitle,
    unit: cierreGeneralChart.unit
  }
);

export const cierreGeneralStackedFull = buildStackedBarConfig(
  cierreGeneralChart,
  ['cobrar', 'aprobados', 'desembolsar'],
  {
    title: cierreGeneralChart.title,
    subtitle: cierreGeneralChart.subtitle,
    unit: cierreGeneralChart.unit
  }
);

export const cierreDrilldown: LineDrilldownConfig = {
  metrics: [
    { id: 'aprobados', label: 'Aprobados no vigentes' },
    { id: 'desembolsar', label: 'Por desembolsar' },
    { id: 'cobrar', label: 'Por cobrar' }
  ],
  rows: [
    { date: '31/3/20', country: 'ARG', aprobados: 20.0, desembolsar: 343.9, cobrar: 239.26 },
    { date: '31/3/20', country: 'BOL', aprobados: 0.0, desembolsar: 127.76, cobrar: 298.4 },
    { date: '31/3/20', country: 'BRA', aprobados: 50.0, desembolsar: 185.17, cobrar: 74.13 },
    { date: '31/3/20', country: 'PAR', aprobados: 142.0, desembolsar: 287.83, cobrar: 150.11 },
    { date: '31/3/20', country: 'URU', aprobados: 0.0, desembolsar: 115.68, cobrar: 190.41 },
    { date: '30/6/20', country: 'ARG', aprobados: 20.0, desembolsar: 291.95, cobrar: 306.5 },
    { date: '30/6/20', country: 'BOL', aprobados: 0.0, desembolsar: 119.26, cobrar: 302.07 },
    { date: '30/6/20', country: 'BRA', aprobados: 82.0, desembolsar: 172.79, cobrar: 84.72 },
    { date: '30/6/20', country: 'PAR', aprobados: 142.0, desembolsar: 279.04, cobrar: 155.53 },
    { date: '30/6/20', country: 'RNS', aprobados: 0.0, desembolsar: 0.0, cobrar: 36.0 },
    { date: '30/6/20', country: 'URU', aprobados: 0.0, desembolsar: 90.38, cobrar: 219.65 },
    { date: '30/9/20', country: 'ARG', aprobados: 70.0, desembolsar: 281.48, cobrar: 310.69 },
    { date: '30/9/20', country: 'BOL', aprobados: 0.0, desembolsar: 96.17, cobrar: 321.87 },
    { date: '30/9/20', country: 'BRA', aprobados: 94.88, desembolsar: 199.65, cobrar: 90.16 },
    { date: '30/9/20', country: 'PAR', aprobados: 142.0, desembolsar: 261.91, cobrar: 171.65 },
    { date: '30/9/20', country: 'RNS', aprobados: 36.0, desembolsar: 0.0, cobrar: 36.0 },
    { date: '30/9/20', country: 'URU', aprobados: 21.0, desembolsar: 90.38, cobrar: 216.92 },
    { date: '31/12/20', country: 'ARG', aprobados: 85.0, desembolsar: 287.54, cobrar: 322.86 },
    { date: '31/12/20', country: 'BOL', aprobados: 0.0, desembolsar: 116.72, cobrar: 331.64 },
    { date: '31/12/20', country: 'BRA', aprobados: 94.88, desembolsar: 180.74, cobrar: 106.05 },
    { date: '31/12/20', country: 'PAR', aprobados: 276.25, desembolsar: 250.41, cobrar: 179.77 },
    { date: '31/12/20', country: 'RNS', aprobados: 0.0, desembolsar: 0.0, cobrar: 72.0 },
    { date: '31/12/20', country: 'URU', aprobados: 21.0, desembolsar: 57.07, cobrar: 239.18 },
    { date: '31/3/21', country: 'ARG', aprobados: 68.0, desembolsar: 299.5, cobrar: 348.12 },
    { date: '31/3/21', country: 'BOL', aprobados: 0.0, desembolsar: 100.82, cobrar: 342.79 },
    { date: '31/3/21', country: 'BRA', aprobados: 94.88, desembolsar: 180.74, cobrar: 105.59 },
    { date: '31/3/21', country: 'PAR', aprobados: 276.25, desembolsar: 239.2, cobrar: 190.11 },
    { date: '31/3/21', country: 'RNS', aprobados: 0.0, desembolsar: 0.0, cobrar: 72.0 },
    { date: '31/3/21', country: 'URU', aprobados: 21.0, desembolsar: 57.07, cobrar: 236.45 },
    { date: '30/6/21', country: 'ARG', aprobados: 43.0, desembolsar: 336.25, cobrar: 352.16 },
    { date: '30/6/21', country: 'BOL', aprobados: 0.0, desembolsar: 96.79, cobrar: 341.39 },
    { date: '30/6/21', country: 'BRA', aprobados: 177.01, desembolsar: 167.1, cobrar: 116.2 },
    { date: '30/6/21', country: 'PAR', aprobados: 276.25, desembolsar: 233.07, cobrar: 192.87 },
    { date: '30/6/21', country: 'RNS', aprobados: 0.0, desembolsar: 0.0, cobrar: 72.0 },
    { date: '30/6/21', country: 'URU', aprobados: 0.0, desembolsar: 59.99, cobrar: 244.35 },
    { date: '30/9/21', country: 'ARG', aprobados: 0.0, desembolsar: 356.6, cobrar: 368.66 },
    { date: '30/9/21', country: 'BOL', aprobados: 0.0, desembolsar: 83.05, cobrar: 350.1 },
    { date: '30/9/21', country: 'BRA', aprobados: 156.51, desembolsar: 161.14, cobrar: 121.7 },
    { date: '30/9/21', country: 'PAR', aprobados: 276.25, desembolsar: 210.22, cobrar: 214.84 },
    { date: '30/9/21', country: 'RNS', aprobados: 0.0, desembolsar: 0.0, cobrar: 72.0 },
    { date: '30/9/21', country: 'URU', aprobados: 0.0, desembolsar: 30.47, cobrar: 271.14 },
    { date: '31/12/21', country: 'ARG', aprobados: 65.3, desembolsar: 313.21, cobrar: 403.81 },
    { date: '31/12/21', country: 'BOL', aprobados: 100.0, desembolsar: 71.39, cobrar: 355.39 },
    { date: '31/12/21', country: 'BRA', aprobados: 206.51, desembolsar: 136.56, cobrar: 143.24 },
    { date: '31/12/21', country: 'PAR', aprobados: 276.25, desembolsar: 146.14, cobrar: 275.55 },
    { date: '31/12/21', country: 'RNS', aprobados: 42.0, desembolsar: 6.0, cobrar: 72.0 },
    { date: '31/12/21', country: 'URU', aprobados: 0.0, desembolsar: 27.71, cobrar: 269.61 },
    { date: '31/3/22', country: 'ARG', aprobados: 0.0, desembolsar: 365.55, cobrar: 409.87 },
    { date: '31/3/22', country: 'BOL', aprobados: 140.0, desembolsar: 68.39, cobrar: 353.41 },
    { date: '31/3/22', country: 'BRA', aprobados: 216.51, desembolsar: 166.56, cobrar: 142.79 },
    { date: '31/3/22', country: 'PAR', aprobados: 276.25, desembolsar: 132.46, cobrar: 283.27 },
    { date: '31/3/22', country: 'RNS', aprobados: 42.0, desembolsar: 6.0, cobrar: 72.0 },
    { date: '31/3/22', country: 'URU', aprobados: 0.0, desembolsar: 27.71, cobrar: 266.88 },
    { date: '30/6/22', country: 'ARG', aprobados: 0.0, desembolsar: 403.2, cobrar: 433.27 },
    { date: '30/6/22', country: 'BOL', aprobados: 40.0, desembolsar: 164.19, cobrar: 349.41 },
    { date: '30/6/22', country: 'BRA', aprobados: 216.51, desembolsar: 156.08, cobrar: 148.94 },
    { date: '30/6/22', country: 'PAR', aprobados: 130.0, desembolsar: 251.4, cobrar: 295.2 },
    { date: '30/6/22', country: 'RNS', aprobados: 42.0, desembolsar: 6.0, cobrar: 72.0 },
    { date: '30/6/22', country: 'URU', aprobados: 0.0, desembolsar: 11.26, cobrar: 278.78 },
    { date: '30/9/22', country: 'ARG', aprobados: 0.0, desembolsar: 369.29, cobrar: 452.47 },
    { date: '30/9/22', country: 'BOL', aprobados: 0.0, desembolsar: 204.19, cobrar: 344.27 },
    { date: '30/9/22', country: 'BRA', aprobados: 164.13, desembolsar: 181.69, cobrar: 150.38 },
    { date: '30/9/22', country: 'PAR', aprobados: 175.0, desembolsar: 229.4, cobrar: 309.96 },
    { date: '30/9/22', country: 'RNS', aprobados: 0.0, desembolsar: 29.5, cobrar: 72.0 },
    { date: '30/9/22', country: 'URU', aprobados: 0.0, desembolsar: 5.06, cobrar: 282.26 },
    { date: '31/12/22', country: 'ARG', aprobados: 87.0, desembolsar: 341.51, cobrar: 490.46 },
    { date: '31/12/22', country: 'BOL', aprobados: 0.0, desembolsar: 140.39, cobrar: 395.01 },
    { date: '31/12/22', country: 'BRA', aprobados: 165.13, desembolsar: 279.74, cobrar: 178.99 },
    { date: '31/12/22', country: 'PAR', aprobados: 175.0, desembolsar: 193.95, cobrar: 342.04 },
    { date: '31/12/22', country: 'RNS', aprobados: 0.0, desembolsar: 25.5, cobrar: 76.0 },
    { date: '31/12/22', country: 'URU', aprobados: 0.0, desembolsar: 2.92, cobrar: 278.34 },
    { date: '31/3/23', country: 'ARG', aprobados: 87.0, desembolsar: 334.86, cobrar: 486.81 },
    { date: '31/3/23', country: 'BOL', aprobados: 0.0, desembolsar: 140.03, cobrar: 389.83 },
    { date: '31/3/23', country: 'BRA', aprobados: 165.13, desembolsar: 275.52, cobrar: 180.84 },
    { date: '31/3/23', country: 'PAR', aprobados: 175.0, desembolsar: 193.95, cobrar: 330.08 },
    { date: '31/3/23', country: 'RNS', aprobados: 0.0, desembolsar: 6.0, cobrar: 95.5 },
    { date: '31/3/23', country: 'URU', aprobados: 0.0, desembolsar: 0.0, cobrar: 275.9 },
    { date: '30/6/23', country: 'ARG', aprobados: 43.4, desembolsar: 374.68, cobrar: 478.75 },
    { date: '30/6/23', country: 'BOL', aprobados: 0.0, desembolsar: 140.03, cobrar: 381.45 },
    { date: '30/6/23', country: 'BRA', aprobados: 175.13, desembolsar: 296.63, cobrar: 185.13 },
    { date: '30/6/23', country: 'PAR', aprobados: 175.0, desembolsar: 172.8, cobrar: 347.85 },
    { date: '30/6/23', country: 'RNS', aprobados: 0.0, desembolsar: 21.33, cobrar: 80.17 },
    { date: '30/6/23', country: 'URU', aprobados: 0.0, desembolsar: 0.0, cobrar: 270.81 },
    { date: '30/9/23', country: 'ARG', aprobados: 43.4, desembolsar: 374.68, cobrar: 468.45 },
    { date: '30/9/23', country: 'BOL', aprobados: 57.25, desembolsar: 134.3, cobrar: 381.84 },
    { date: '30/9/23', country: 'BRA', aprobados: 346.13, desembolsar: 276.62, cobrar: 202.77 },
    { date: '30/9/23', country: 'PAR', aprobados: 0.0, desembolsar: 339.93, cobrar: 340.37 },
    { date: '30/9/23', country: 'RNS', aprobados: 0.0, desembolsar: 15.83, cobrar: 73.67 },
    { date: '30/9/23', country: 'URU', aprobados: 150.0, desembolsar: 0.0, cobrar: 303.18 },
    { date: '31/12/23', country: 'ARG', aprobados: 43.4, desembolsar: 374.68, cobrar: 460.84 },
    { date: '31/12/23', country: 'BOL', aprobados: 113.3, desembolsar: 67.3, cobrar: 440.62 },
    { date: '31/12/23', country: 'BRA', aprobados: 201.0, desembolsar: 402.54, cobrar: 206.26 },
    { date: '31/12/23', country: 'PAR', aprobados: 0.0, desembolsar: 334.65, cobrar: 342.27 },
    { date: '31/12/23', country: 'RNS', aprobados: 0.0, desembolsar: 29.17, cobrar: 98.33 },
    { date: '31/12/23', country: 'URU', aprobados: 0.0, desembolsar: 139.18, cobrar: 328.91 },
    { date: '31/3/24', country: 'ARG', aprobados: 43.4, desembolsar: 349.62, cobrar: 469.66 },
    { date: '31/3/24', country: 'BOL', aprobados: 113.3, desembolsar: 67.3, cobrar: 429.04 },
    { date: '31/3/24', country: 'BRA', aprobados: 141.0, desembolsar: 460.33, cobrar: 205.84 },
    { date: '31/3/24', country: 'PAR', aprobados: 0.0, desembolsar: 327.72, cobrar: 333.47 },
    { date: '31/3/24', country: 'RNS', aprobados: 0.0, desembolsar: 19.67, cobrar: 107.83 },
    { date: '31/3/24', country: 'URU', aprobados: 60.0, desembolsar: 11.65, cobrar: 447.14 },
    { date: '30/6/24', country: 'ARG', aprobados: 193.4, desembolsar: 320.43, cobrar: 466.01 },
    { date: '30/6/24', country: 'BOL', aprobados: 75.0, desembolsar: 174.79, cobrar: 426.92 },
    { date: '30/6/24', country: 'BRA', aprobados: 217.0, desembolsar: 525.3, cobrar: 227.28 },
    { date: '30/6/24', country: 'PAR', aprobados: 0.0, desembolsar: 314.72, cobrar: 343.09 },
    { date: '30/6/24', country: 'RNS', aprobados: 0.0, desembolsar: 29.0, cobrar: 92.5 },
    { date: '30/6/24', country: 'URU', aprobados: 37.96, desembolsar: 71.65, cobrar: 442.05 },
    { date: '30/9/24', country: 'ARG', aprobados: 43.4, desembolsar: 271.29, cobrar: 596.12 },
    { date: '30/9/24', country: 'BOL', aprobados: 75.0, desembolsar: 162.04, cobrar: 427.96 },
    { date: '30/9/24', country: 'BRA', aprobados: 217.0, desembolsar: 500.19, cobrar: 247.67 },
    { date: '30/9/24', country: 'PAR', aprobados: 0.0, desembolsar: 276.33, cobrar: 364.9 },
    { date: '30/9/24', country: 'RNS', aprobados: 20.0, desembolsar: 6.0, cobrar: 86.0 },
    { date: '30/9/24', country: 'URU', aprobados: 12.96, desembolsar: 45.65, cobrar: 483.75 },
    { date: '31/12/24', country: 'ARG', aprobados: 0.0, desembolsar: 282.49, cobrar: 643.22 },
    { date: '31/12/24', country: 'BOL', aprobados: 75.0, desembolsar: 147.69, cobrar: 434.01 },
    { date: '31/12/24', country: 'BRA', aprobados: 157.0, desembolsar: 534.43, cobrar: 268.52 },
    { date: '31/12/24', country: 'PAR', aprobados: 0.0, desembolsar: 257.99, cobrar: 379.87 },
    { date: '31/12/24', country: 'RNS', aprobados: 20.0, desembolsar: 12.0, cobrar: 129.0 },
    { date: '31/12/24', country: 'URU', aprobados: 0.0, desembolsar: 159.85, cobrar: 527.38 },
    { date: '31/3/25', country: 'ARG', aprobados: 0.0, desembolsar: 261.59, cobrar: 621.1 },
    { date: '31/3/25', country: 'BOL', aprobados: 75.0, desembolsar: 127.82, cobrar: 447.39 },
    { date: '31/3/25', country: 'BRA', aprobados: 207.0, desembolsar: 509.22, cobrar: 288.55 },
    { date: '31/3/25', country: 'PAR', aprobados: 0.0, desembolsar: 235.5, cobrar: 385.09 },
    { date: '31/3/25', country: 'RNS', aprobados: 0.0, desembolsar: 12.0, cobrar: 149.0 },
    { date: '31/3/25', country: 'URU', aprobados: 0.0, desembolsar: 98.83, cobrar: 578.5 },
    { date: '30/6/25', country: 'ARG', aprobados: 5.0, desembolsar: 193.53, cobrar: 611.06 },
    { date: '30/6/25', country: 'BOL', aprobados: 75.0, desembolsar: 113.27, cobrar: 448.4 },
    { date: '30/6/25', country: 'BRA', aprobados: 271.0, desembolsar: 496.58, cobrar: 294.59 },
    { date: '30/6/25', country: 'PAR', aprobados: 0.0, desembolsar: 231.63, cobrar: 385.59 },
    { date: '30/6/25', country: 'RNS', aprobados: 0.0, desembolsar: 19.5, cobrar: 135.5 },
    { date: '30/6/25', country: 'URU', aprobados: 0.0, desembolsar: 98.83, cobrar: 573.41 },
    { date: '30/9/25', country: 'ARG', aprobados: 65.0, desembolsar: 171.95, cobrar: 600.98 },
    { date: '30/9/25', country: 'BOL', aprobados: 92.8, desembolsar: 113.27, cobrar: 445.0 },
    { date: '30/9/25', country: 'BRA', aprobados: 267.8, desembolsar: 498.0, cobrar: 330.51 },
    { date: '30/9/25', country: 'PAR', aprobados: 0.0, desembolsar: 182.91, cobrar: 417.05 },
    { date: '30/9/25', country: 'RNS', aprobados: 0.0, desembolsar: 21.0, cobrar: 134.0 },
    { date: '30/9/25', country: 'URU', aprobados: 0.0, desembolsar: 76.71, cobrar: 585.63 },
    { date: '31/12/25', country: 'ARG', aprobados: 65.0, desembolsar: 96.97, cobrar: 598.85 },
    { date: '31/12/25', country: 'BOL', aprobados: 50.0, desembolsar: 150.77, cobrar: 431.73 },
    { date: '31/12/25', country: 'BRA', aprobados: 198.8, desembolsar: 546.85, cobrar: 379.01 },
    { date: '31/12/25', country: 'PAR', aprobados: 0.0, desembolsar: 140.89, cobrar: 455.69 },
    { date: '31/12/25', country: 'RNS', aprobados: 0.0, desembolsar: 28.5, cobrar: 126.5 },
    { date: '31/12/25', country: 'URU', aprobados: 0.0, desembolsar: 58.44, cobrar: 598.81 }
  ]
};

const investmentPortfolioTotal = 1_447_000_000;

const investmentPortfolioAssetClasses: InvestmentPortfolioAsset[] = [
  {
    id: 'bonos',
    label: 'Bonos',
    value: investmentPortfolioTotal * (0.71 / 1.004),
    color: '#141F52',
    labelColor: '#ffffff',
    labelPosition: 'inside'
  },
  {
    id: 'cds',
    label: 'CDs',
    value: investmentPortfolioTotal * (0.24 / 1.004),
    color: '#E3120B',
    labelColor: '#ffffff',
    labelPosition: 'inside'
  },
  {
    id: 'ecps',
    label: 'ECPs (incluye US T-Bills)',
    value: investmentPortfolioTotal * (0.01 / 1.004),
    color: '#F97A1F',
    labelColor: '#ffffff',
    labelPosition: 'inside'
  },
  {
    id: 'depositos',
    label: 'Depósitos a la vista',
    value: investmentPortfolioTotal * (0.004 / 1.004),
    color: '#F9C31F',
    labelColor: '#111111',
    labelPosition: 'outside'
  },
  {
    id: 'etfs',
    label: 'ETFs',
    value: investmentPortfolioTotal * (0.04 / 1.004),
    color: '#E1DFD0',
    labelColor: '#111111',
    labelPosition: 'outside'
  }
];

const investmentPortfolioMaturityProfile: BarChartConfig = {
  type: 'bar',
  title: 'Perfil de vencimientos nominal',
  subtitle: 'USD mill.',
  unit: 'MM',
  tickEvery: 2,
  showValueLabels: true,
  showValueLabelUnit: false,
  valueLabelFontSize: '0.62rem',
  data: [
    { label: '1Q26', value: 650, color: 'var(--accent)' },
    { label: '2Q26', value: 381, color: 'var(--accent)' },
    { label: '3Q26', value: 16, color: 'var(--accent)' },
    { label: '4Q26', value: 253, color: 'var(--accent)' },
    { label: '27', value: 275, color: 'var(--accent)' },
    { label: '28', value: 239, color: 'var(--accent)' },
    { label: '29', value: 95, color: 'var(--accent)' },
    { label: '30', value: 127, color: 'var(--accent)' }
  ]
};

const tasaRiesgoSoberanoChart: StackedBarChartConfig = {
  type: 'stacked-bar',
  title: 'Riesgo Soberano',
  subtitle: '',
  unit: '%',
  marginTop: 8,
  marginRight: 8,
  marginBottom: 20,
  marginLeft: 24,
  series: [
    { id: 'sofr', label: 'SOFR', color: '#adb5bd' },
    { id: 'margen', label: 'Margen Neto', color: '#E3120B' },
    { id: 'focom', label: 'FOCOM', color: '#38BDF8' }
  ],
  data: [
    { label: 'ene-24', values: { margen: 2.58, focom: 0.29, sofr: 5.36 } },
    { label: 'feb-24', values: { margen: 2.56, focom: 0.27, sofr: 5.39 } },
    { label: 'mar-24', values: { margen: 2.51, focom: 0.31, sofr: 5.39 } },
    { label: 'abr-24', values: { margen: 2.51, focom: 0.31, sofr: 5.35 } },
    { label: 'may-24', values: { margen: 2.51, focom: 0.31, sofr: 5.37 } },
    { label: 'jun-24', values: { margen: 2.51, focom: 0.31, sofr: 5.39 } },
    { label: 'jul-24', values: { margen: 2.51, focom: 0.31, sofr: 5.44 } },
    { label: 'ago-24', values: { margen: 2.51, focom: 0.30, sofr: 5.43 } },
    { label: 'sept-24', values: { margen: 2.49, focom: 0.31, sofr: 5.22 } },
    { label: 'oct-24', values: { margen: 2.47, focom: 0.34, sofr: 4.89 } },
    { label: 'nov-24', values: { margen: 2.46, focom: 0.35, sofr: 4.69 } },
    { label: 'dic-24', values: { margen: 2.45, focom: 0.35, sofr: 4.57 } },
    { label: 'ene-25', values: { margen: 2.43, focom: 0.36, sofr: 4.38 } },
    { label: 'feb-25', values: { margen: 2.42, focom: 0.37, sofr: 4.41 } },
    { label: 'mar-25', values: { margen: 2.42, focom: 0.37, sofr: 4.38 } },
    { label: 'abr-25', values: { margen: 2.42, focom: 0.38, sofr: 4.37 } },
    { label: 'may-25', values: { margen: 2.41, focom: 0.38, sofr: 4.33 } },
    { label: 'jun-25', values: { margen: 2.41, focom: 0.38, sofr: 4.34 } },
    { label: 'jul-25', values: { margen: 2.41, focom: 0.38, sofr: 4.38 } },
    { label: 'ago-25', values: { margen: 2.40, focom: 0.39, sofr: 4.40 } },
    { label: 'sept-25', values: { margen: 2.39, focom: 0.40, sofr: 4.36 } },
    { label: 'oct-25', values: { margen: 2.39, focom: 0.40, sofr: 4.21 } },
    { label: 'nov-25', values: { margen: 2.39, focom: 0.40, sofr: 4.01 } },
    { label: 'dic-25', values: { margen: 2.38, focom: 0.41, sofr: 3.78 } }
  ]
};

const tasaRiesgoNoSoberanoChart: StackedBarChartConfig = {
  type: 'stacked-bar',
  title: 'Riesgo no soberano',
  subtitle: '',
  unit: '%',
  marginTop: 8,
  marginRight: 8,
  marginBottom: 20,
  marginLeft: 24,
  series: [
    { id: 'sofr', label: 'SOFR', color: '#adb5bd' },
    { id: 'margen', label: 'Margen Neto', color: '#E3120B' }
  ],
  data: [
    { label: 'ene-24', values: { margen: 3.05, sofr: 5.36 } },
    { label: 'feb-24', values: { margen: 3.03, sofr: 5.37 } },
    { label: 'mar-24', values: { margen: 3.04, sofr: 5.40 } },
    { label: 'abr-24', values: { margen: 3.05, sofr: 5.41 } },
    { label: 'may-24', values: { margen: 3.04, sofr: 5.41 } },
    { label: 'jun-24', values: { margen: 3.03, sofr: 5.47 } },
    { label: 'jul-24', values: { margen: 3.06, sofr: 5.47 } },
    { label: 'ago-24', values: { margen: 3.09, sofr: 5.45 } },
    { label: 'sept-24', values: { margen: 3.09, sofr: 5.26 } },
    { label: 'oct-24', values: { margen: 3.09, sofr: 4.90 } },
    { label: 'nov-24', values: { margen: 3.08, sofr: 4.70 } },
    { label: 'dic-24', values: { margen: 3.08, sofr: 4.64 } },
    { label: 'ene-25', values: { margen: 3.28, sofr: 4.35 } },
    { label: 'feb-25', values: { margen: 3.28, sofr: 4.40 } },
    { label: 'mar-25', values: { margen: 3.27, sofr: 4.37 } },
    { label: 'abr-25', values: { margen: 3.23, sofr: 4.38 } },
    { label: 'may-25', values: { margen: 3.23, sofr: 4.36 } },
    { label: 'jun-25', values: { margen: 3.23, sofr: 4.44 } },
    { label: 'jul-25', values: { margen: 3.23, sofr: 4.41 } },
    { label: 'ago-25', values: { margen: 3.23, sofr: 4.44 } },
    { label: 'sept-25', values: { margen: 3.24, sofr: 4.35 } },
    { label: 'oct-25', values: { margen: 3.24, sofr: 4.22 } },
    { label: 'nov-25', values: { margen: 3.24, sofr: 3.98 } },
    { label: 'dic-25', values: { margen: 3.24, sofr: 3.79 } }
  ]
};

const perfilAmortizacionChart: StackedBarChartConfig = {
  type: 'stacked-bar',
  title: 'Perfil de amortización',
  subtitle: 'USD mm',
  valueFormat: 'integer',
  marginTop: 14,
  marginLeft: 28,
  marginRight: 2,
  marginBottom: 28,
  showTotalLabels: true,
  showTotalLabelUnit: false,
  totalLabelFontSize: '0.72rem',
  series: [
    { id: 'restante', label: 'Deuda Contratada hasta 2024', color: '#adb5bd' },
    { id: 'contratos_2025', label: 'Deuda contratada en 2025', color: '#E3120B' }
  ],
  data: [
    { label: '2026', values: { contratos_2025: 1.7, restante: 308.47 } },
    { label: '2027', values: { contratos_2025: 35.69, restante: 298.75 } },
    { label: '2028', values: { contratos_2025: 79.08, restante: 263.28 } },
    { label: '2029', values: { contratos_2025: 3.27, restante: 267.76 } },
    { label: '2030', values: { contratos_2025: 274.46, restante: 29.81 } },
    { label: '2031', values: { contratos_2025: 134.06, restante: 22.5 } },
    { label: '2032', values: { contratos_2025: 52.59, restante: 20 } },
    { label: '2033', values: { contratos_2025: 2.59, restante: 19.09 } },
    { label: '2034', values: { contratos_2025: 2.59, restante: 16.23 } },
    { label: '2035', values: { contratos_2025: 52.59, restante: 14.28 } },
    { label: '2036', values: { contratos_2025: 2.59, restante: 13.98 } },
    { label: '2037', values: { contratos_2025: 2.59, restante: 13.18 } },
    { label: '2038', values: { contratos_2025: 2.59, restante: 13.18 } },
    { label: '2039', values: { contratos_2025: 2.59, restante: 12.75 } },
    { label: '2040', values: { contratos_2025: 62.71, restante: 11.96 } },
    { label: '2041', values: { contratos_2025: 1.11, restante: 10.18 } },
    { label: '2042', values: { contratos_2025: 1.11, restante: 8.89 } },
    { label: '2043', values: { contratos_2025: 1.11, restante: 3.89 } },
    { label: '2044', values: { contratos_2025: 1.11, restante: 3.89 } },
    { label: '2045', values: { contratos_2025: 1.11, restante: 3.89 } },
    { label: '2046', values: { contratos_2025: 1.11, restante: 3.89 } }
  ]
};

const flujosChart: StackedBarChartConfig = {
  type: 'stacked-bar',
  title: 'Flujos',
  subtitle: 'USD mm',
  marginTop: 12,
  marginLeft: 4,
  marginRight: 8,
  marginBottom: 24,
  showTotalLabels: true,
  showTotalLabelUnit: false,
  tooltipSkipZero: true,
  series: [
    { id: 'ifd', label: 'IFD', color: '#adb5bd' },
    { id: 'mercado', label: 'Mercado', color: '#E3120B' },
    {
      id: 'ifd_2026',
      label: 'IFD (26)',
      color: 'rgba(173, 181, 189, 0.3)',
      stroke: '#adb5bd',
      strokeWidth: 1.7,
      strokeDasharray: '6 4'
    },
    {
      id: 'mercado_2026',
      label: 'Mercado (26)',
      color: 'rgba(227, 18, 11, 0.26)',
      stroke: '#E3120B',
      strokeWidth: 1.7,
      strokeDasharray: '6 4'
    }
  ],
  data: [
    { label: '2021', values: { ifd: 18, mercado: 487, ifd_2026: 0, mercado_2026: 0 } },
    { label: '2022', values: { ifd: 169, mercado: 0, ifd_2026: 0, mercado_2026: 0 } },
    { label: '2023', values: { ifd: 60, mercado: 54, ifd_2026: 0, mercado_2026: 0 } },
    { label: '2024', values: { ifd: 180, mercado: 484, ifd_2026: 0, mercado_2026: 0 } },
    { label: '2025', values: { ifd: 96, mercado: 622, ifd_2026: 0, mercado_2026: 0 } },
    { label: '2026', values: { ifd: 0, mercado: 0, ifd_2026: 50, mercado_2026: 700 } }
  ]
};

const stockChart: StackedBarChartConfig = {
  type: 'stacked-bar',
  title: 'Stock',
  subtitle: 'USD mm',
  marginTop: 12,
  marginLeft: 4,
  marginRight: 8,
  marginBottom: 24,
  showTotalLabels: true,
  showTotalLabelUnit: false,
  tooltipSkipZero: true,
  series: [
    { id: 'ifd_base', label: 'IFD (base)', color: '#adb5bd' },
    { id: 'mercado_base', label: 'Mercado (base)', color: '#E3120B' },
    {
      id: 'incremento_2026_ifd',
      label: 'IFD (26)',
      color: 'rgba(173, 181, 189, 0.3)',
      stroke: '#adb5bd',
      strokeWidth: 1.8,
      strokeDasharray: '6 4'
    },
    {
      id: 'incremento_2026_mercado',
      label: 'Mercado (26)',
      color: 'rgba(227, 18, 11, 0.26)',
      stroke: '#E3120B',
      strokeWidth: 1.8,
      strokeDasharray: '6 4'
    }
  ],
  data: [
    {
      label: '2020',
      values: { ifd_base: 399, mercado_base: 149, incremento_2026_ifd: 0, incremento_2026_mercado: 0 }
    },
    {
      label: '2021',
      values: { ifd_base: 282, mercado_base: 636, incremento_2026_ifd: 0, incremento_2026_mercado: 0 }
    },
    {
      label: '2022',
      values: { ifd_base: 284, mercado_base: 636, incremento_2026_ifd: 0, incremento_2026_mercado: 0 }
    },
    {
      label: '2023',
      values: { ifd_base: 357, mercado_base: 673, incremento_2026_ifd: 0, incremento_2026_mercado: 0 }
    },
    {
      label: '2024',
      values: { ifd_base: 430, mercado_base: 975, incremento_2026_ifd: 0, incremento_2026_mercado: 0 }
    },
    {
      label: '2025',
      values: { ifd_base: 515, mercado_base: 1563, incremento_2026_ifd: 0, incremento_2026_mercado: 0 }
    },
    {
      label: '2026',
      values: { ifd_base: 444, mercado_base: 1324, incremento_2026_ifd: 50, incremento_2026_mercado: 700 }
    }
  ]
};

const emisionesSegmentadasChart: StackedBarChartConfig = {
  type: 'stacked-bar',
  title: 'Endeudamiento 2025',
  subtitle: 'USD mm · por mes',
  unit: 'USD mm',
  xTickValues: [
    '2025-01',
    '2025-02',
    '2025-03',
    '2025-04',
    '2025-05',
    '2025-06',
    '2025-07',
    '2025-08',
    '2025-09',
    '2025-10',
    '2025-11',
    '2025-12'
  ],
  xBandPadding: 0.8,
  barWidthScale: 2.35,
  marginRight: 148,
  showLegend: false,
  showTooltip: false,
  projectedTailCount: 0,
  showSegmentLabels: true,
  tooltipSkipZero: true,
  segmentBorder: 'dashed',
  segmentLogos: [
    { label: '2025-02', seriesId: 'mercado_seg1', logos: [greenLogo, usaLogo] },
    { label: '2025-03', seriesId: 'mercado_seg1', logos: [usaLogo] },
    { label: '2025-03', seriesId: 'mercado_seg2', logos: [usaLogo] },
    { label: '2025-03', seriesId: 'mercado_seg3', logos: [usaLogo, greenLogo] },
    { label: '2025-03', seriesId: 'mercado_seg4', logos: [usaLogo, greenLogo] },
    { label: '2025-04', seriesId: 'ifd_seg1', logos: [cafLogo] },
    { label: '2025-04', seriesId: 'mercado_seg1', logos: [usaLogo, greenLogo] },
    { label: '2025-05', seriesId: 'mercado_seg1', logos: [usaLogo] },
    { label: '2025-05', seriesId: 'mercado_seg2', logos: [usaLogo] },
    { label: '2025-07', seriesId: 'ifd_seg1', logos: [idbLogo] },
    { label: '2025-08', seriesId: 'mercado_seg1', logos: [greenLogo, usaLogo] },
    { label: '2025-08', seriesId: 'mercado_seg2', logos: [greenLogo, australiaLogo] },
    { label: '2025-09', seriesId: 'mercado_seg1', logos: [usaLogo] },
    { label: '2025-09', seriesId: 'mercado_seg2', logos: [japonLogo] },
    { label: '2025-10', seriesId: 'ifd_seg1', logos: [icoLogo] },
    { label: '2025-11', seriesId: 'mercado_seg1', logos: [indiaLogo] },
    { label: '2025-12', seriesId: 'ifd_seg1', logos: [idbLogo] },
    { label: '2025-12', seriesId: 'ifd_seg2', logos: [kfwLogo] }
  ],
  series: [
    { id: 'mercado_seg1', label: 'Mercado · Segmento 1', color: '#E3120B' },
    { id: 'mercado_seg2', label: 'Mercado · Segmento 2', color: '#E3120B' },
    { id: 'mercado_seg3', label: 'Mercado · Segmento 3', color: '#E3120B' },
    { id: 'mercado_seg4', label: 'Mercado · Segmento 4', color: '#E3120B' },
    { id: 'ifd_seg1', label: 'IFD · Segmento 1', color: '#adb5bd' },
    { id: 'ifd_seg2', label: 'IFD · Segmento 2', color: '#adb5bd' },
    { id: 'ifd_seg3', label: 'IFD · Segmento 3', color: '#adb5bd' },
    { id: 'ifd_seg4', label: 'IFD · Segmento 4', color: '#adb5bd' }
  ],
  data: [
    { label: '2025-01', values: {} },
    { label: '2025-02', values: { mercado_seg1: 40.0 } },
    { label: '2025-03', values: { mercado_seg1: 50.0, mercado_seg2: 50.0, mercado_seg3: 40.0, mercado_seg4: 30.0 } },
    { label: '2025-04', values: { mercado_seg1: 50.0, ifd_seg1: 50.0 } },
    { label: '2025-05', values: { mercado_seg1: 100.0, mercado_seg2: 50.0 } },
    { label: '2025-06', values: {} },
    { label: '2025-07', values: { ifd_seg1: 11.4 } },
    { label: '2025-08', values: { mercado_seg1: 35.0, mercado_seg2: 25.1 } },
    { label: '2025-09', values: { mercado_seg1: 30.0, mercado_seg2: 20.4 } },
    { label: '2025-10', values: { ifd_seg1: 17.8 } },
    { label: '2025-11', values: { mercado_seg1: 101.5 } },
    { label: '2025-12', values: { ifd_seg1: 10.8, ifd_seg2: 6.4 } }
  ]
};

const endeudamientoChartQuarterly: LineChartConfig = removeYearFromLineChart(
  normalizeQuarterlyLineChart({
  type: 'line',
  title: 'Spread sobre SOFR',
  subtitle: '',
  unit: 'pbs',
  tooltipMode: 'shared-x',
  yMin: 100,
  valueFormat: 'integer',
  xTickFormatter: toQuarterLabel,
  barUnit: 'USD mm',
  barOpacity: 0.45,
  barSeries: [
    { id: 'ifd', label: 'IFD', color: '#595959' },
    { id: 'mercado', label: 'Mercado', color: '#E3120B' }
  ],
  barData: [
    { date: '2019-01-01', values: { ifd: 33.0, mercado: 148.81 } },
    { date: '2019-04-01', values: { ifd: 33.0, mercado: 148.81 } },
    { date: '2019-07-01', values: { ifd: 58.6, mercado: 148.81 } },
    { date: '2019-10-01', values: { ifd: 70.8, mercado: 148.81 } },
    { date: '2020-01-01', values: { ifd: 70.8, mercado: 148.81 } },
    { date: '2020-04-01', values: { ifd: 70.8, mercado: 148.81 } },
    { date: '2020-07-01', values: { ifd: 91.8, mercado: 148.81 } },
    { date: '2020-10-01', values: { ifd: 119.6, mercado: 148.81 } },
    { date: '2021-01-01', values: { ifd: 119.6, mercado: 371.48 } },
    { date: '2021-04-01', values: { ifd: 131.5, mercado: 471.48 } },
    { date: '2021-07-01', values: { ifd: 137.5, mercado: 471.48 } },
    { date: '2021-10-01', values: { ifd: 137.5, mercado: 635.95 } },
    { date: '2022-01-01', values: { ifd: 137.5, mercado: 635.95 } },
    { date: '2022-04-01', values: { ifd: 153.7, mercado: 635.95 } },
    { date: '2022-07-01', values: { ifd: 152.8, mercado: 635.95 } },
    { date: '2022-10-01', values: { ifd: 304.6, mercado: 635.95 } },
    { date: '2023-01-01', values: { ifd: 301.2, mercado: 689.97 } },
    { date: '2023-04-01', values: { ifd: 300.7, mercado: 689.97 } },
    { date: '2023-07-01', values: { ifd: 350.6, mercado: 689.97 } },
    { date: '2023-10-01', values: { ifd: 357.1, mercado: 673.30 } },
    { date: '2024-01-01', values: { ifd: 428.6, mercado: 524.49 } },
    { date: '2024-04-01', values: { ifd: 413.8, mercado: 713.58 } },
    { date: '2024-07-01', values: { ifd: 434.9, mercado: 713.58 } },
    { date: '2024-10-01', values: { ifd: 429.5, mercado: 974.85 } },
    { date: '2025-01-01', values: { ifd: 425.8, mercado: 1184.85 } },
    { date: '2025-04-01', values: { ifd: 475.3, mercado: 1368.18 } },
    { date: '2025-07-01', values: { ifd: 483.0, mercado: 1478.70 } },
    { date: '2025-10-01', values: { ifd: 514.7, mercado: 1563.49 } }
  ],
  series: [
    {
      id: 'ifd',
      label: 'IFD',
      color: '#595959',
      values: [
        { date: '2019-01-01', value: 164 },
        { date: '2019-04-01', value: 159 },
        { date: '2019-07-01', value: 154 },
        { date: '2019-10-01', value: 147 },
        { date: '2020-01-01', value: 147 },
        { date: '2020-04-01', value: 140 },
        { date: '2020-07-01', value: 140 },
        { date: '2020-10-01', value: 139 },
        { date: '2021-01-01', value: 143 },
        { date: '2021-04-01', value: 142 },
        { date: '2021-07-01', value: 142 },
        { date: '2021-10-01', value: 147 },
        { date: '2022-01-01', value: 139 },
        { date: '2022-04-01', value: 131 },
        { date: '2022-07-01', value: 135 },
        { date: '2022-10-01', value: 126 },
        { date: '2023-01-01', value: 127 },
        { date: '2023-04-01', value: 117 },
        { date: '2023-07-01', value: 118 },
        { date: '2023-10-01', value: 118 },
        { date: '2024-01-01', value: 127 },
        { date: '2024-04-01', value: 127 },
        { date: '2024-07-01', value: 127 },
        { date: '2024-10-01', value: 126 },
        { date: '2025-01-01', value: 126 },
        { date: '2025-04-01', value: 127 },
        { date: '2025-07-01', value: 127 },
        { date: '2025-10-01', value: 125 }
      ]
    },
    {
      id: 'mercado',
      label: 'Mercado',
      color: '#E3120B',
      values: [
        { date: '2019-01-01', value: 160 },
        { date: '2019-04-01', value: 160 },
        { date: '2019-07-01', value: 160 },
        { date: '2019-10-01', value: 160 },
        { date: '2020-01-01', value: 160 },
        { date: '2020-04-01', value: 160 },
        { date: '2020-07-01', value: 160 },
        { date: '2020-10-01', value: 160 },
        { date: '2021-01-01', value: 162 },
        { date: '2021-04-01', value: 161 },
        { date: '2021-07-01', value: 161 },
        { date: '2021-10-01', value: 152 },
        { date: '2022-01-01', value: 152 },
        { date: '2022-04-01', value: 152 },
        { date: '2022-07-01', value: 152 },
        { date: '2022-10-01', value: 152 },
        { date: '2023-01-01', value: 156 },
        { date: '2023-04-01', value: 156 },
        { date: '2023-07-01', value: 156 },
        { date: '2023-10-01', value: 156 },
        { date: '2024-01-01', value: 155 },
        { date: '2024-04-01', value: 163 },
        { date: '2024-07-01', value: 163 },
        { date: '2024-10-01', value: 171 },
        { date: '2025-01-01', value: 166 },
        { date: '2025-04-01', value: 162 },
        { date: '2025-07-01', value: 159 },
        { date: '2025-10-01', value: 160 }
      ]
    },
    {
      id: 'general',
      label: 'General',
      color: '#38BDF8',
      values: [
        { date: '2019-01-01', value: 161 },
        { date: '2019-04-01', value: 159 },
        { date: '2019-07-01', value: 157 },
        { date: '2019-10-01', value: 154 },
        { date: '2020-01-01', value: 154 },
        { date: '2020-04-01', value: 146 },
        { date: '2020-07-01', value: 146 },
        { date: '2020-10-01', value: 145 },
        { date: '2021-01-01', value: 152 },
        { date: '2021-04-01', value: 153 },
        { date: '2021-07-01', value: 153 },
        { date: '2021-10-01', value: 150 },
        { date: '2022-01-01', value: 148 },
        { date: '2022-04-01', value: 146 },
        { date: '2022-07-01', value: 148 },
        { date: '2022-10-01', value: 142 },
        { date: '2023-01-01', value: 146 },
        { date: '2023-04-01', value: 144 },
        { date: '2023-07-01', value: 143 },
        { date: '2023-10-01', value: 143 },
        { date: '2024-01-01', value: 142 },
        { date: '2024-04-01', value: 150 },
        { date: '2024-07-01', value: 149 },
        { date: '2024-10-01', value: 157 },
        { date: '2025-01-01', value: 155 },
        { date: '2025-04-01', value: 153 },
        { date: '2025-07-01', value: 151 },
        { date: '2025-10-01', value: 151 }
      ]
    }
  ]
  }),
  '2019'
);

const endeudamientoChartAnnual: LineChartConfig = removeYearFromLineChart(
  {
  type: 'line',
  title: 'Spread sobre SOFR',
  subtitle: '',
  unit: 'pbs',
  tooltipMode: 'shared-x',
  yMin: 100,
  valueFormat: 'integer',
  xTickFormatter: toYearLabel,
  barUnit: 'USD mm',
  barOpacity: 0.45,
  barSeries: [
    { id: 'ifd', label: 'IFD', color: '#595959' },
    { id: 'mercado', label: 'Mercado', color: '#E3120B' }
  ],
  barData: [
    { date: '2019-12-31', values: { ifd: 70.8, mercado: 148.81 } },
    { date: '2020-12-31', values: { ifd: 119.6, mercado: 148.81 } },
    { date: '2021-12-31', values: { ifd: 137.5, mercado: 635.95 } },
    { date: '2022-12-31', values: { ifd: 304.6, mercado: 635.95 } },
    { date: '2023-12-31', values: { ifd: 357.1, mercado: 673.3 } },
    { date: '2024-12-31', values: { ifd: 429.5, mercado: 974.85 } },
    { date: '2025-12-31', values: { ifd: 514.7, mercado: 1563.49 } }
  ],
  series: [
    {
      id: 'ifd',
      label: 'IFD',
      color: '#595959',
      values: [
        { date: '2019-12-31', value: 157 },
        { date: '2020-12-31', value: 141 },
        { date: '2021-12-31', value: 143 },
        { date: '2022-12-31', value: 134 },
        { date: '2023-12-31', value: 121 },
        { date: '2024-12-31', value: 127 },
        { date: '2025-12-31', value: 126 }
      ]
    },
    {
      id: 'mercado',
      label: 'Mercado',
      color: '#E3120B',
      values: [
        { date: '2019-12-31', value: 160 },
        { date: '2020-12-31', value: 160 },
        { date: '2021-12-31', value: 160 },
        { date: '2022-12-31', value: 152 },
        { date: '2023-12-31', value: 155 },
        { date: '2024-12-31', value: 163 },
        { date: '2025-12-31', value: 163 }
      ]
    },
    {
      id: 'general',
      label: 'General',
      color: '#38BDF8',
      values: [
        { date: '2019-12-31', value: 158.11 },
        { date: '2020-12-31', value: 146.71 },
        { date: '2021-12-31', value: 151.88 },
        { date: '2022-12-31', value: 145.87 },
        { date: '2023-12-31', value: 143.98 },
        { date: '2024-12-31', value: 150.42 },
        { date: '2025-12-31', value: 152.56 }
      ]
    }
  ]
  },
  '2019'
);

const endeudamientoChartQuarterlyMarginal: LineChartConfig = removeYearFromLineChart(
  normalizeQuarterlyLineChart({
  ...endeudamientoChartQuarterly,
  showLegend: false,
  yMin: undefined,
  lineMode: 'scatter',
  scatterSkipZero: true,
  barData: [
    { date: '2019-01-01', values: { ifd: 0.0, mercado: 148.81 } },
    { date: '2019-04-01', values: { ifd: 0.0, mercado: 0.0 } },
    { date: '2019-07-01', values: { ifd: 25.65, mercado: 0.0 } },
    { date: '2019-10-01', values: { ifd: 12.1, mercado: 0.0 } },
    { date: '2020-01-01', values: { ifd: 0.0, mercado: 0.0 } },
    { date: '2020-04-01', values: { ifd: 244.0, mercado: 0.0 } },
    { date: '2020-07-01', values: { ifd: 21.0, mercado: 0.0 } },
    { date: '2020-10-01', values: { ifd: 27.88, mercado: 0.0 } },
    { date: '2021-01-01', values: { ifd: 0.0, mercado: 222.67 } },
    { date: '2021-04-01', values: { ifd: 11.9, mercado: 100.0 } },
    { date: '2021-07-01', values: { ifd: 6.0, mercado: 0.0 } },
    { date: '2021-10-01', values: { ifd: 0.0, mercado: 164.47 } },
    { date: '2022-01-01', values: { ifd: 0.0, mercado: 0.0 } },
    { date: '2022-04-01', values: { ifd: 16.7, mercado: 0.0 } },
    { date: '2022-07-01', values: { ifd: 0.0, mercado: 0.0 } },
    { date: '2022-10-01', values: { ifd: 152.41, mercado: 0.0 } },
    { date: '2023-01-01', values: { ifd: 0.0, mercado: 54.02 } },
    { date: '2023-04-01', values: { ifd: 0.0, mercado: 0.0 } },
    { date: '2023-07-01', values: { ifd: 53.29, mercado: 0.0 } },
    { date: '2023-10-01', values: { ifd: 7.05, mercado: 0.0 } },
    { date: '2024-01-01', values: { ifd: 75.0, mercado: 0.0 } },
    { date: '2024-04-01', values: { ifd: 35.68, mercado: 205.75 } },
    { date: '2024-07-01', values: { ifd: 24.58, mercado: 0.0 } },
    { date: '2024-10-01', values: { ifd: 45.08, mercado: 277.94 } },
    { date: '2025-01-01', values: { ifd: 0.0, mercado: 210.0 } },
    { date: '2025-04-01', values: { ifd: 50.0, mercado: 200.0 } },
    { date: '2025-07-01', values: { ifd: 11.38, mercado: 110.51 } },
    { date: '2025-10-01', values: { ifd: 35.01, mercado: 101.47 } }
  ],
  series: [
    {
      id: 'ifd',
      label: 'IFD',
      color: '#595959',
      values: [
        { date: '2019-01-01', value: 0.0 },
        { date: '2019-04-01', value: 0.0 },
        { date: '2019-07-01', value: 136.83 },
        { date: '2019-10-01', value: 113.87 },
        { date: '2020-01-01', value: 0.0 },
        { date: '2020-04-01', value: 138.13 },
        { date: '2020-07-01', value: 158.74 },
        { date: '2020-10-01', value: 130.83 },
        { date: '2021-01-01', value: 0.0 },
        { date: '2021-04-01', value: 146.83 },
        { date: '2021-07-01', value: 95.03 },
        { date: '2021-10-01', value: 0.0 },
        { date: '2022-01-01', value: 0.0 },
        { date: '2022-04-01', value: 90.75 },
        { date: '2022-07-01', value: 0.0 },
        { date: '2022-10-01', value: 116.47 },
        { date: '2023-01-01', value: 0.0 },
        { date: '2023-04-01', value: 0.0 },
        { date: '2023-07-01', value: 104.26 },
        { date: '2023-10-01', value: 125.0 },
        { date: '2024-01-01', value: 175.0 },
        { date: '2024-04-01', value: 128.41 },
        { date: '2024-07-01', value: 116.4 },
        { date: '2024-10-01', value: 110.68 },
        { date: '2025-01-01', value: 0.0 },
        { date: '2025-04-01', value: 135.0 },
        { date: '2025-07-01', value: 121.0 },
        { date: '2025-10-01', value: 97.3 }
      ]
    },
    {
      id: 'mercado',
      label: 'Mercado',
      color: '#E3120B',
      values: [
        { date: '2019-01-01', value: 159.8 },
        { date: '2019-04-01', value: 0.0 },
        { date: '2019-07-01', value: 0.0 },
        { date: '2019-10-01', value: 0.0 },
        { date: '2020-01-01', value: 0.0 },
        { date: '2020-04-01', value: 0.0 },
        { date: '2020-07-01', value: 0.0 },
        { date: '2020-10-01', value: 0.0 },
        { date: '2021-01-01', value: 164.03 },
        { date: '2021-04-01', value: 157.83 },
        { date: '2021-07-01', value: 0.0 },
        { date: '2021-10-01', value: 125.2 },
        { date: '2022-01-01', value: 0.0 },
        { date: '2022-04-01', value: 0.0 },
        { date: '2022-07-01', value: 0.0 },
        { date: '2022-10-01', value: 0.0 },
        { date: '2023-01-01', value: 200.19 },
        { date: '2023-04-01', value: 0.0 },
        { date: '2023-07-01', value: 0.0 },
        { date: '2023-10-01', value: 0.0 },
        { date: '2024-01-01', value: 0.0 },
        { date: '2024-04-01', value: 185.15 },
        { date: '2024-07-01', value: 0.0 },
        { date: '2024-10-01', value: 189.17 },
        { date: '2025-01-01', value: 141.12 },
        { date: '2025-04-01', value: 143.18 },
        { date: '2025-07-01', value: 153.46 },
        { date: '2025-10-01', value: 130.0 }
      ]
    }
  ]
  }),
  '2019'
);

const endeudamientoChartAnnualMarginal: LineChartConfig = removeYearFromLineChart(
  {
  ...endeudamientoChartAnnual,
  showLegend: false,
  yMin: undefined,
  lineMode: 'scatter',
  scatterSkipZero: true,
  barData: [
    { date: '2019-12-31', values: { ifd: 37.75, mercado: 148.81 } },
    { date: '2020-12-31', values: { ifd: 292.88, mercado: 0.0 } },
    { date: '2021-12-31', values: { ifd: 17.9, mercado: 487.14 } },
    { date: '2022-12-31', values: { ifd: 169.11, mercado: 0.0 } },
    { date: '2023-12-31', values: { ifd: 60.34, mercado: 54.02 } },
    { date: '2024-12-31', values: { ifd: 180.34, mercado: 483.69 } },
    { date: '2025-12-31', values: { ifd: 96.39, mercado: 621.98 } }
  ],
  series: [
    {
      id: 'ifd',
      label: 'IFD',
      color: '#595959',
      scatterConnect: true,
      values: [
        { date: '2019-12-31', value: 129.47 },
        { date: '2020-12-31', value: 138.91 },
        { date: '2021-12-31', value: 129.46 },
        { date: '2022-12-31', value: 113.93 },
        { date: '2023-12-31', value: 106.68 },
        { date: '2024-12-31', value: 141.72 },
        { date: '2025-12-31', value: 119.65 }
      ]
    },
    {
      id: 'mercado',
      label: 'Mercado',
      color: '#E3120B',
      scatterConnect: true,
      scatterConnectLabels: ['2023-12-31', '2024-12-31', '2025-12-31'],
      values: [
        { date: '2019-12-31', value: 159.8 },
        { date: '2020-12-31', value: 0.0 },
        { date: '2021-12-31', value: 149.64 },
        { date: '2022-12-31', value: 0.0 },
        { date: '2023-12-31', value: 200.19 },
        { date: '2024-12-31', value: 187.46 },
        { date: '2025-12-31', value: 142.16 }
      ]
    }
  ]
  },
  '2019'
);

const endeudamientoPlazoPromedio: GroupedBarChartConfig = removeYearFromGroupedChart(
  normalizeQuarterlyGroupedChart({
    type: 'grouped-bar',
    title: 'Plazo',
    subtitle: 'Años',
    showValueLabels: true,
    valueLabelFontSize: '0.48rem',
    series: [
      { id: 'ifd', label: 'IFD', color: '#595959' },
      { id: 'mercado', label: 'Mercado', color: '#E3120B' }
    ],
    data: [
      { label: '2019-01-01', displayLabel: '2019.0-Q1.0', values: { ifd: 11.75, mercado: 5.01 } },
      { label: '2019-04-01', displayLabel: '2019.0-Q2.0', values: { ifd: 11.99, mercado: 5.01 } },
      { label: '2019-07-01', displayLabel: '2019.0-Q3.0', values: { ifd: 14.8, mercado: 5.01 } },
      { label: '2019-10-01', displayLabel: '2019.0-Q4.0', values: { ifd: 15.12, mercado: 5.01 } },
      { label: '2020-01-01', displayLabel: '2020.0-Q1.0', values: { ifd: 15.12, mercado: 5.01 } },
      { label: '2020-04-01', displayLabel: '2020.0-Q2.0', values: { ifd: 6.21, mercado: 5.01 } },
      { label: '2020-07-01', displayLabel: '2020.0-Q3.0', values: { ifd: 6.65, mercado: 5.01 } },
      { label: '2020-10-01', displayLabel: '2020.0-Q4.0', values: { ifd: 7.73, mercado: 5.01 } },
      { label: '2021-01-01', displayLabel: '2021.0-Q1.0', values: { ifd: 7.73, mercado: 5.31 } },
      { label: '2021-04-01', displayLabel: '2021.0-Q2.0', values: { ifd: 8.55, mercado: 5.24 } },
      { label: '2021-07-01', displayLabel: '2021.0-Q3.0', values: { ifd: 8.69, mercado: 5.24 } },
      { label: '2021-10-01', displayLabel: '2021.0-Q4.0', values: { ifd: 11.28, mercado: 5.69 } },
      { label: '2022-01-01', displayLabel: '2022.0-Q1.0', values: { ifd: 11.28, mercado: 5.69 } },
      { label: '2022-04-01', displayLabel: '2022.0-Q2.0', values: { ifd: 14.2, mercado: 5.69 } },
      { label: '2022-07-01', displayLabel: '2022.0-Q3.0', values: { ifd: 14.21, mercado: 5.69 } },
      { label: '2022-10-01', displayLabel: '2022.0-Q4.0', values: { ifd: 11.64, mercado: 5.69 } },
      { label: '2023-01-01', displayLabel: '2023.0-Q1.0', values: { ifd: 11.56, mercado: 5.71 } },
      { label: '2023-04-01', displayLabel: '2023.0-Q2.0', values: { ifd: 13.84, mercado: 5.71 } },
      { label: '2023-07-01', displayLabel: '2023.0-Q3.0', values: { ifd: 13.87, mercado: 5.71 } },
      { label: '2023-10-01', displayLabel: '2023.0-Q4.0', values: { ifd: 14.06, mercado: 5.73 } },
      { label: '2024-01-01', displayLabel: '2024.0-Q1.0', values: { ifd: 12.07, mercado: 5.94 } },
      { label: '2024-04-01', displayLabel: '2024.0-Q2.0', values: { ifd: 13.07, mercado: 5.24 } },
      { label: '2024-07-01', displayLabel: '2024.0-Q3.0', values: { ifd: 12.8, mercado: 5.24 } },
      { label: '2024-10-01', displayLabel: '2024.0-Q4.0', values: { ifd: 14.61, mercado: 5.18 } },
      { label: '2025-01-01', displayLabel: '2025.0-Q1.0', values: { ifd: 14.56, mercado: 5.16 } },
      { label: '2025-04-01', displayLabel: '2025.0-Q2.0', values: { ifd: 13.35, mercado: 5.32 } },
      { label: '2025-07-01', displayLabel: '2025.0-Q3.0', values: { ifd: 13.49, mercado: 5.69 } },
      { label: '2025-10-01', displayLabel: '2025.0-Q4.0', values: { ifd: 13.63, mercado: 5.68 } }
    ]
  }),
  '2019'
);

const endeudamientoPlazoPromedioAnnual: GroupedBarChartConfig = removeYearFromGroupedChart(
  {
    type: 'grouped-bar',
    title: 'Plazo',
    subtitle: 'Años',
    showValueLabels: true,
    valueLabelFontSize: '0.48rem',
    series: [
      { id: 'ifd', label: 'IFD', color: '#595959' },
      { id: 'mercado', label: 'Mercado', color: '#E3120B' }
    ],
    data: [
      { label: '2019-12-31', displayLabel: '2019', values: { ifd: 13.53, mercado: 5.01 } },
      { label: '2020-12-31', displayLabel: '2020', values: { ifd: 7.95, mercado: 5.01 } },
      { label: '2021-12-31', displayLabel: '2021', values: { ifd: 8.6, mercado: 5.3 } },
      { label: '2022-12-31', displayLabel: '2022', values: { ifd: 12.64, mercado: 5.69 } },
      { label: '2023-12-31', displayLabel: '2023', values: { ifd: 13.05, mercado: 5.71 } },
      { label: '2024-12-31', displayLabel: '2024', values: { ifd: 12.71, mercado: 5.39 } },
      { label: '2025-12-31', displayLabel: '2025', values: { ifd: 13.74, mercado: 5.46 } }
    ]
  },
  '2019'
);

const endeudamientoPlazoPromedioMarginal: GroupedBarChartConfig = removeYearFromGroupedChart(
  normalizeQuarterlyGroupedChart({
    type: 'grouped-bar',
    title: 'Plazo',
    subtitle: 'Años',
    showValueLabels: true,
    valueLabelFontSize: '0.48rem',
    series: [
      { id: 'ifd', label: 'IFD', color: '#595959' },
      { id: 'mercado', label: 'Mercado', color: '#E3120B' }
    ],
    data: [
      { label: '2019-01-01', displayLabel: '2019.0-Q1.0', values: { ifd: 0, mercado: 5 } },
      { label: '2019-07-01', displayLabel: '2019.0-Q3.0', values: { ifd: 23.16, mercado: 0 } },
      { label: '2019-10-01', displayLabel: '2019.0-Q4.0', values: { ifd: 15.54, mercado: 0 } },
      { label: '2020-04-01', displayLabel: '2020.0-Q2.0', values: { ifd: 2.12, mercado: 0 } },
      { label: '2020-07-01', displayLabel: '2020.0-Q3.0', values: { ifd: 14.11, mercado: 0 } },
      { label: '2020-10-01', displayLabel: '2020.0-Q4.0', values: { ifd: 21.87, mercado: 0 } },
      { label: '2021-01-01', displayLabel: '2021.0-Q1.0', values: { ifd: 0, mercado: 5.5 } },
      { label: '2021-04-01', displayLabel: '2021.0-Q2.0', values: { ifd: 21.22, mercado: 4.98 } },
      { label: '2021-07-01', displayLabel: '2021.0-Q3.0', values: { ifd: 18, mercado: 0 } },
      { label: '2021-10-01', displayLabel: '2021.0-Q4.0', values: { ifd: 0, mercado: 7 } },
      { label: '2022-04-01', displayLabel: '2022.0-Q2.0', values: { ifd: 16.4, mercado: 0 } },
      { label: '2022-10-01', displayLabel: '2022.0-Q4.0', values: { ifd: 7.69, mercado: 0 } },
      { label: '2023-01-01', displayLabel: '2023.0-Q1.0', values: { ifd: 0, mercado: 5.93 } },
      { label: '2023-07-01', displayLabel: '2023.0-Q3.0', values: { ifd: 14.4, mercado: 0 } },
      { label: '2023-10-01', displayLabel: '2023.0-Q4.0', values: { ifd: 22.94, mercado: 0 } },
      { label: '2024-01-01', displayLabel: '2024.0-Q1.0', values: { ifd: 3, mercado: 0 } },
      { label: '2024-04-01', displayLabel: '2024.0-Q2.0', values: { ifd: 9.39, mercado: 3.45 } },
      { label: '2024-07-01', displayLabel: '2024.0-Q3.0', values: { ifd: 9.36, mercado: 0 } },
      { label: '2024-10-01', displayLabel: '2024.0-Q4.0', values: { ifd: 17.94, mercado: 4.99 } },
      { label: '2025-01-01', displayLabel: '2025.0-Q1.0', values: { ifd: 0, mercado: 5.09 } },
      { label: '2025-04-01', displayLabel: '2025.0-Q2.0', values: { ifd: 3, mercado: 6.25 } },
      { label: '2025-07-01', displayLabel: '2025.0-Q3.0', values: { ifd: 21.35, mercado: 10.21 } },
      { label: '2025-10-01', displayLabel: '2025.0-Q4.0', values: { ifd: 13.72, mercado: 5.49 } }
    ]
  }),
  '2019'
);

const endeudamientoPlazoPromedioMarginalAnnual: GroupedBarChartConfig = removeYearFromGroupedChart(
  {
    type: 'grouped-bar',
    title: 'Plazo',
    subtitle: 'Años',
    showValueLabels: true,
    valueLabelFontSize: '0.48rem',
    series: [
      { id: 'ifd', label: 'IFD', color: '#595959' },
      { id: 'mercado', label: 'Mercado', color: '#E3120B' }
    ],
    data: [
      { label: '2019-12-31', displayLabel: '2019', values: { ifd: 12.1, mercado: 5 } },
      { label: '2020-12-31', displayLabel: '2020', values: { ifd: 3.5, mercado: 0 } },
      { label: '2021-12-31', displayLabel: '2021', values: { ifd: 11.4, mercado: 5.6 } },
      { label: '2022-12-31', displayLabel: '2022', values: { ifd: 5.6, mercado: 0 } },
      { label: '2023-12-31', displayLabel: '2023', values: { ifd: 9.7, mercado: 5.9 } },
      { label: '2024-12-31', displayLabel: '2024', values: { ifd: 5.4, mercado: 4 } },
      { label: '2025-12-31', displayLabel: '2025', values: { ifd: 5.9, mercado: 6.4 } }
    ]
  },
  '2019'
);

type SpreadPlazoRow = {
  instrument: string;
  year: number;
  spread: number;
  plazo: number;
};

const spreadPlazoYearColors: Record<number, string> = {
  2019: '#1F2E7A',
  2020: '#F97A1F',
  2021: '#C91D42',
  2022: '#36E2BD',
  2023: '#1DC9A4',
  2024: '#F9C31F',
  2025: '#475ED1'
};

const buildSpreadPlazoSeries = (rows: SpreadPlazoRow[]): LineChartConfig['series'] => {
  const byYear = rows.reduce<Map<number, SpreadPlazoRow[]>>((acc, row) => {
    const yearRows = acc.get(row.year);
    if (yearRows) {
      yearRows.push(row);
    } else {
      acc.set(row.year, [row]);
    }
    return acc;
  }, new Map());

  return Array.from(byYear.entries())
    .sort(([yearA], [yearB]) => yearA - yearB)
    .map(([year, points]) => {
      const ordered = [...points].sort((a, b) => a.plazo - b.plazo);
      return {
        id: String(year),
        label: String(year),
        color: spreadPlazoYearColors[year],
        values: ordered.map((point) => ({
          date: point.instrument,
          value: point.spread,
          x: point.plazo
        }))
      };
    });
};

const spreadPlazoBase: Omit<LineChartConfig, 'title' | 'series'> = {
  type: 'line',
  subtitle: 'Plazo (años) · Spread (pbs)',
  unit: 'pbs',
  xAxis: 'number',
  showPoints: true,
  sortByX: false,
  lineMode: 'scatter',
  scatterEnvelope: false
};

const debtSourcesScatterIfd: LineChartConfig = {
  ...spreadPlazoBase,
  title: 'IFD',
  series: buildSpreadPlazoSeries([
    { instrument: 'BID 1 - Desembolso 2', year: 2019, spread: 135.83, plazo: 13.18 },
    { instrument: 'BID 1 - Desembolso 3', year: 2019, spread: 135.83, plazo: 13.0 },
    { instrument: 'ICO 1', year: 2019, spread: 87.83, plazo: 4.75 },
    { instrument: 'AFD 1 - Desembolso 2', year: 2020, spread: 179.83, plazo: 7.16 },
    { instrument: 'BC Bolivia 3', year: 2020, spread: 122.83, plazo: 0.92 },
    { instrument: 'BC Uruguay 1', year: 2020, spread: 127.86, plazo: 0.88 },
    { instrument: 'BC Uruguay 2', year: 2020, spread: 150.36, plazo: 2.42 },
    { instrument: 'BEI 1', year: 2020, spread: 106.03, plazo: 11.05 },
    { instrument: 'BID 1 - Desembolso 4', year: 2020, spread: 130.83, plazo: 12.08 },
    { instrument: 'CAF 1 - Tramo 2', year: 2020, spread: 142.83, plazo: 1.44 },
    { instrument: 'BEI 2', year: 2021, spread: 95.03, plazo: 11.04 },
    { instrument: 'BID 1 - Desembolso 5', year: 2021, spread: 148.83, plazo: 11.21 },
    { instrument: 'BID 1 - Desembolso 6', year: 2021, spread: 148.83, plazo: 11.21 },
    { instrument: 'AFD 2 - Desembolso 1', year: 2022, spread: 144.25, plazo: 7.36 },
    { instrument: 'BEI 3', year: 2022, spread: 87.23, plazo: 10.84 },
    { instrument: 'BEI 4', year: 2022, spread: 81.3, plazo: 11.26 },
    { instrument: 'BID 2 - Desembolso 1', year: 2022, spread: 121.0, plazo: 14.18 },
    { instrument: 'CAF 2 - Tramo 1', year: 2022, spread: 104.0, plazo: 1.75 },
    { instrument: 'CAF 2 - Tramo 2', year: 2022, spread: 138.3, plazo: 1.75 },
    { instrument: 'ICO 2 - Tramo 1', year: 2022, spread: 96.0, plazo: 8.44 },
    { instrument: 'ICO 2 - Tramo 2', year: 2022, spread: 101.0, plazo: 8.7 },
    { instrument: 'BEI 5', year: 2023, spread: 93.1, plazo: 11.0 },
    { instrument: 'BID 2 - Desembolso 2', year: 2023, spread: 125.0, plazo: 13.31 },
    { instrument: 'BID 2 - Desembolso 3', year: 2023, spread: 125.0, plazo: 13.2 },
    { instrument: 'KfW - Desembolso 1', year: 2023, spread: 101.12, plazo: 4.97 },
    { instrument: 'AFD 2 - Desembolso 2', year: 2024, spread: 116.4, plazo: 5.46 },
    { instrument: 'BID 2 - Desembolso 4', year: 2024, spread: 121.0, plazo: 12.36 },
    { instrument: 'BID 2 - Desembolso 5', year: 2024, spread: 121.0, plazo: 12.19 },
    { instrument: 'CAF 3 - Tramo 1', year: 2024, spread: 175.0, plazo: 1.74 },
    { instrument: 'CDP', year: 2024, spread: 130.0, plazo: 3.88 },
    { instrument: 'KfW - Desembolso 2', year: 2024, spread: 78.5, plazo: 3.94 },
    { instrument: 'BID 2 - Desembolso 6', year: 2025, spread: 121.0, plazo: 11.38 },
    { instrument: 'BID 2 - Desembolso 7', year: 2025, spread: 121.0, plazo: 11.19 },
    { instrument: 'CAF 3 - Tramo 2', year: 2025, spread: 135.0, plazo: 1.95 },
    { instrument: 'ICO 3 - Tramo 1', year: 2025, spread: 88.0, plazo: 9.28 },
    { instrument: 'KfW - Desembolso 3', year: 2025, spread: 83.05, plazo: 4.42 }
  ])
};

const debtSourcesScatterMercado: LineChartConfig = {
  ...spreadPlazoBase,
  title: 'Mercado',
  series: buildSpreadPlazoSeries([
    { instrument: 'CHF 2024', year: 2019, spread: 159.8, plazo: 4.2 },
    { instrument: 'BBVA 1', year: 2021, spread: 157.83, plazo: 3.38 },
    { instrument: 'CHF 2026', year: 2021, spread: 164.03, plazo: 4.68 },
    { instrument: 'CHF 2028', year: 2021, spread: 125.2, plazo: 6.92 },
    { instrument: 'JPY 2028', year: 2023, spread: 192.75, plazo: 4.23 },
    { instrument: 'JPY 2029', year: 2023, spread: 205.5, plazo: 5.82 },
    { instrument: 'BBVA 2', year: 2024, spread: 172.37, plazo: 3.69 },
    { instrument: 'CHF 2027', year: 2024, spread: 189.75, plazo: 2.87 },
    { instrument: 'CHF 2029', year: 2024, spread: 202.9, plazo: 4.82 },
    { instrument: 'JPY 2027', year: 2024, spread: 166.4, plazo: 2.46 },
    { instrument: 'JPY 2029 - 2', year: 2024, spread: 188.4, plazo: 4.47 },
    { instrument: 'MTN 1', year: 2025, spread: 130.0, plazo: 2.14 },
    { instrument: 'MTN 10', year: 2025, spread: 130.0, plazo: 5.25 },
    { instrument: 'MTN 11 (INR - DB)', year: 2025, spread: 130.0, plazo: 5.42 },
    { instrument: 'MTN 2', year: 2025, spread: 145.0, plazo: 4.2 },
    { instrument: 'MTN 3', year: 2025, spread: 145.0, plazo: 4.22 },
    { instrument: 'MTN 4.1', year: 2025, spread: 136.5, plazo: 4.24 },
    { instrument: 'MTN 4.2', year: 2025, spread: 145.8, plazo: 6.24 },
    { instrument: 'MTN 5', year: 2025, spread: 167.7, plazo: 9.28 },
    { instrument: 'MTN 6', year: 2025, spread: 135.0, plazo: 4.38 },
    { instrument: 'MTN 7', year: 2025, spread: 135.0, plazo: 4.39 },
    { instrument: 'MTN 8.1', year: 2025, spread: 178.4, plazo: 14.67 },
    { instrument: 'MTN 8.2', year: 2025, spread: 180.0, plazo: 14.67 },
    { instrument: 'MTN 9', year: 2025, spread: 112.5, plazo: 2.75 }
  ])
};

const riskExposureQuarterLabels = ['Q1-25', 'Q2-25', 'Q3-25', 'Q4-25', 'Q1-26', 'Q2-26', 'Q3-26', 'Q4-26'];
const riskExposureProjected2026Labels = new Set(['Q1-26', 'Q2-26', 'Q3-26', 'Q4-26']);

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

const getCategoryTotalMMByQuarterIndex = (
  quarterIndex: number,
  category: 'cobrar' | 'desembolsar' | 'aprobados' | 'activar'
) =>
  countryOrder.reduce((sum, code) => {
    const values = countrySeriesByCode[code][category];
    return sum + ((values[quarterIndex] ?? 0) / 1_000_000);
  }, 0);

const riskExposureRows = riskExposureQuarterLabels.map((label) => {
  const quarterIndex = quarterLabels.indexOf(label);
  const cobrar = quarterIndex >= 0 ? getCategoryTotalMMByQuarterIndex(quarterIndex, 'cobrar') : 0;
  const desembolsar =
    quarterIndex >= 0 ? getCategoryTotalMMByQuarterIndex(quarterIndex, 'desembolsar') : 0;
  const aprobados = quarterIndex >= 0 ? getCategoryTotalMMByQuarterIndex(quarterIndex, 'aprobados') : 0;
  const used = cobrar + desembolsar + aprobados;
  const usedProjected2026 = riskExposureProjected2026Labels.has(label) ? used : 0;
  const usedHistorical = riskExposureProjected2026Labels.has(label) ? 0 : used;
  const patrimonio = patrimonioByQuarterLabel[label] ?? 0;
  // Capacidad máxima = 3 * patrimonio
  const capacidadMaxima = patrimonio * 3;
  const capacidadDisponible = Math.max(capacidadMaxima - used, 0);
  const porActivar = quarterIndex >= 0 ? getCategoryTotalMMByQuarterIndex(quarterIndex, 'activar') : 0;

  return {
    label,
    cobrar,
    desembolsar,
    aprobados,
    usedHistorical,
    usedProjected2026,
    used,
    capacidadMaxima,
    capacidadDisponible,
    porActivar
  };
});

const riskExposureLastRow = riskExposureRows[riskExposureRows.length - 1];
const activationAmount2026MM = countryOrder.reduce(
  (sum, code) => sum + ((activitiesInVigencia2026ByCountry[code] ?? 0) / 1_000_000),
  0
);
const activationAmountPost2026MM = Math.max(
  (riskExposureLastRow?.porActivar ?? 0) - activationAmount2026MM,
  0
);

const riskExposureUsedVsMaxChart: StackedBarChartConfig = {
  type: 'stacked-bar',
  title: 'Límite de Capacidad Prestable',
  subtitle: '',
  showTooltip: true,
  tooltipSkipZero: true,
  tooltipTotalLabel: 'Capacidad Prestable Máxima',
  tooltipTotalDotColor: 'transparent',
  projectedTailCount: 4,
  projectedTailFillOpacity: 0.4,
  segmentBorder: 'none',
  showSegmentLabels: true,
  segmentLabelColor: '#111111',
  showTotalLabels: true,
  totalLabelColor: '#111111',
  marginTop: 16,
  marginRight: 114,
  marginBottom: 34,
  marginLeft: 62,
  series: [
    { id: 'usada', label: 'Capacidad Prestable Utilizada', color: '#c1121f' },
    {
      id: 'disponible',
      label: 'Capacidad Prestable Disponible',
      color: '#B3B3B3',
      hollow: true,
      stroke: '#111111',
      strokeWidth: 1.8,
      strokeDasharray: '7 4'
    }
  ],
  data: riskExposureRows.map((row) => ({
    label: row.label,
    values: {
      usada: row.used,
      disponible: row.capacidadDisponible
    }
  }))
};

const riskExposureAvailableVsActivarChart: LineChartConfig = {
  type: 'line',
  title: 'Capacidad disponible vs. etapas por activar',
  subtitle: '',
  showTooltip: true,
  fixedTooltipGroupBySeries: false,
  xAxis: 'category',
  barAxis: 'left',
  barLayout: 'mixed',
  sortByX: false,
  barUnit: 'USD mm',
  barOpacity: 1,
  showBarLabels: true,
  showBarTotalLabels: true,
  categoryPadding: 0.36,
  categoryBarWidthRatio: 0.56,
  barSeries: [
    {
      id: 'capacidadDisponible',
      label: 'Capacidad Prestable Disponible',
      color: '#ffffff',
      stackGroup: 'capacidad-disponible'
    },
    {
      id: 'porActivarTotal',
      label: 'Etapas Por Activar',
      color: '#adb5bd',
      stackGroup: 'por-activar'
    }
  ],
  barData: [
    {
      date: riskExposureLastRow?.label ?? 'Q4-26',
      values: {
        capacidadDisponible: riskExposureLastRow?.capacidadDisponible ?? 0,
        porActivarTotal: activationAmount2026MM + activationAmountPost2026MM
      }
    }
  ],
  series: []
};

const formatUsdMillionsAxis = (value: number) => {
  if (Math.abs(value) < 1e-6) return '-';
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const activosPasivosComparativoChart: LineChartConfig = {
  type: 'line',
  title: 'Comparativo Dic-25 vs Dic-24',
  subtitle: 'USD MM',
  xAxis: 'category',
  sortByX: false,
  tooltipMode: 'shared-x',
  showLegend: true,
  showPoints: false,
  showTooltip: true,
  yMin: 0,
  yTickFormatter: formatUsdMillionsAxis,
  barAxis: 'left',
  barLayout: 'grouped',
  barUnit: 'USD MM',
  barOpacity: 1,
  showBarLabels: true,
  showBarTotalLabels: true,
  barValueFormat: 'integer',
  categoryPadding: 0.34,
  categoryBarWidthRatio: 0.62,
  barSeries: [
    { id: 'dic25', label: 'Dic-25', color: '#E3120B' },
    { id: 'dic24', label: 'Dic-24', color: '#8A8A8A' }
  ],
  barData: [
    { date: 'Préstamos', values: { dic25: 2590.7, dic24: 2382.0 } },
    { date: 'Inversiones', values: { dic25: 1433.9, dic24: 739.0 } },
    { date: 'Bancos', values: { dic25: 21.8, dic24: 28.0 } },
    { date: 'Endeudamientos', values: { dic25: 2187.7, dic24: 1387.9 } },
    { date: 'Patrimonio', values: { dic25: 1852.3, dic24: 1750.2 } }
  ],
  series: []
};

const aprobacionesCancelacionesYears = [
  2014,
  2015,
  2016,
  2017,
  2018,
  2019,
  2020,
  2021,
  2022,
  2023,
  2024,
  2025
] as const;

type AprobacionesCancelacionesYear = (typeof aprobacionesCancelacionesYears)[number];
type AprobacionesCancelacionesCountryBase = 'ARGENTINA' | 'BOLIVIA' | 'BRASIL' | 'PARAGUAY' | 'URUGUAY';
type AprobacionesCancelacionesCountry = AprobacionesCancelacionesCountryBase | 'GENERAL';

const aprobacionesCancelacionesCountryBaseOrder: AprobacionesCancelacionesCountryBase[] = [
  'ARGENTINA',
  'BOLIVIA',
  'BRASIL',
  'PARAGUAY',
  'URUGUAY'
];

const aprobacionesCancelacionesCountryOrder: AprobacionesCancelacionesCountry[] = [
  ...aprobacionesCancelacionesCountryBaseOrder,
  'GENERAL'
];

const aprobacionesCancelacionesLabelByCountry: Record<AprobacionesCancelacionesCountry, string> = {
  ARGENTINA: 'ARG',
  BOLIVIA: 'BOL',
  BRASIL: 'BRA',
  PARAGUAY: 'PAR',
  URUGUAY: 'URU',
  GENERAL: 'GENERAL'
};

const parseAprobacionesCancelacionesAmount = (value: string | undefined) => {
  const normalized = value?.trim() ?? '';
  if (!normalized || normalized === '-' || normalized === '—') return 0;
  const isNegative = normalized.startsWith('(') && normalized.endsWith(')');
  const noParens = isNegative ? normalized.slice(1, -1) : normalized;
  const plain = noParens.replaceAll('.', '').replace(',', '.');
  const parsed = Number.parseFloat(plain);
  if (!Number.isFinite(parsed)) return 0;
  return isNegative ? -parsed : parsed;
};

const toUsdMillions3 = (value: number) => Math.round((value / 1_000_000) * 1000) / 1000;
const toAprobacionesCancelacionesMillions = (value: string | undefined) =>
  toUsdMillions3(parseAprobacionesCancelacionesAmount(value));
const roundAprobacionesCancelaciones3 = (value: number) => Math.round(value * 1000) / 1000;

const aprobacionesRawByCountry: Record<
  AprobacionesCancelacionesCountryBase,
  Partial<Record<AprobacionesCancelacionesYear, string>>
> = {
  ARGENTINA: {
    2014: '56.523.383,0',
    2015: '70.000.000,0',
    2016: '142.500.000,0',
    2017: '92.200.000,0',
    2018: '105.063.770,0',
    2019: '150.000.000,0',
    2020: '147.000.000,0',
    2021: '121.300.000,0',
    2022: '177.000.000,0',
    2023: '0,0',
    2024: '200.000.000,0',
    2025: '95.000.000,0'
  },
  BOLIVIA: {
    2014: '59.931.123,0',
    2015: '55.000.000,0',
    2016: '60.000.000,0',
    2017: '50.000.000,0',
    2018: '65.000.000,0',
    2019: '41.942.761,0',
    2020: '35.000.000,0',
    2021: '100.000.000,0',
    2022: '40.000.000,0',
    2023: '113.296.082,0',
    2024: '75.000.000,0',
    2025: '17.800.000,0'
  },
  BRASIL: {
    2014: '40.000.000,0',
    2015: '0,0',
    2016: '0,0',
    2017: '141.950.000,0',
    2018: '62.500.000,0',
    2019: '68.597.360,0',
    2020: '112.880.000,0',
    2021: '132.130.000,0',
    2022: '194.000.000,0',
    2023: '211.000.000,0',
    2024: '167.000.000,0',
    2025: '224.000.000,0'
  },
  PARAGUAY: {
    2014: '0,0',
    2015: '93.500.000,0',
    2016: '85.661.000,0',
    2017: '42.857.143,0',
    2018: '82.000.000,0',
    2019: '200.000.000,0',
    2020: '134.245.764,0',
    2021: '0,0',
    2022: '45.000.000,0',
    2023: '0,0',
    2024: '0,0',
    2025: '0,0'
  },
  URUGUAY: {
    2014: '70.500.000,0',
    2015: '65.500.000,0',
    2016: '27.500.000,0',
    2017: '0,0',
    2018: '110.535.000,0',
    2019: '0,0',
    2020: '36.000.000,0',
    2021: '0,0',
    2022: '0,0',
    2023: '210.000.000,0',
    2024: '247.960.000,0',
    2025: '0,0'
  }
};

const cancelacionesRawByCountry: Record<
  AprobacionesCancelacionesCountryBase,
  Partial<Record<AprobacionesCancelacionesYear, string>>
> = {
  ARGENTINA: {
    2016: '580.463,3',
    2017: '29.690.000,0',
    2018: '15.593,0',
    2019: '54.868.363,7',
    2020: '40.303.484,7',
    2021: '7.376.682,8',
    2022: '3.998.999,6',
    2024: '85.626.227,7',
    2025: '195.735.701,0'
  },
  BOLIVIA: {
    2019: '29.566,8',
    2021: '630.000,0',
    2022: '4.776.351,0',
    2025: '1.748.851,87'
  },
  BRASIL: {
    2016: '3.321,8',
    2017: '65.644,2',
    2018: '50.000.000,0',
    2019: '34.700.000,0',
    2021: '20.497.360,0',
    2022: '46.880.000,0',
    2023: '11.130.000,0',
    2025: '35.166.204,15'
  },
  PARAGUAY: {
    2016: '220.000,0',
    2020: '123.767,4',
    2022: '12.000.000,0'
  },
  URUGUAY: {
    2015: '40.000.000,0',
    2016: '1.830.000,0',
    2017: '(1.830.000,0)',
    2021: '6.000.000,0',
    2022: '1.151.695,0'
  }
};

type AprobacionesCancelacionesRow = {
  year: string;
  aprobaciones: number;
  cancelaciones: number;
  aprobacionesNetas: number;
};

const buildAprobacionesCancelacionesRowsByCountry = () => {
  const byCountryBase = aprobacionesCancelacionesCountryBaseOrder.reduce<
    Record<AprobacionesCancelacionesCountryBase, AprobacionesCancelacionesRow[]>
  >((accumulator, country) => {
    accumulator[country] = aprobacionesCancelacionesYears.map((year) => {
      const aprobaciones = toAprobacionesCancelacionesMillions(aprobacionesRawByCountry[country][year]);
      const cancelacionesRaw = toAprobacionesCancelacionesMillions(cancelacionesRawByCountry[country][year]);
      const cancelaciones = cancelacionesRaw === 0 ? 0 : -Math.abs(cancelacionesRaw);
      const aprobacionesNetas = roundAprobacionesCancelaciones3(aprobaciones + cancelaciones);
      return {
        year: String(year),
        aprobaciones,
        cancelaciones,
        aprobacionesNetas
      };
    });
    return accumulator;
  }, {} as Record<AprobacionesCancelacionesCountryBase, AprobacionesCancelacionesRow[]>);

  const generalRows = aprobacionesCancelacionesYears.map((year) => {
    const approvalsTotal = aprobacionesCancelacionesCountryBaseOrder.reduce(
      (sum, country) => sum + toAprobacionesCancelacionesMillions(aprobacionesRawByCountry[country][year]),
      0
    );
    const cancelacionesTotal = aprobacionesCancelacionesCountryBaseOrder.reduce((sum, country) => {
      const rawValue = toAprobacionesCancelacionesMillions(cancelacionesRawByCountry[country][year]);
      const normalized = rawValue === 0 ? 0 : -Math.abs(rawValue);
      return sum + normalized;
    }, 0);

    return {
      year: String(year),
      aprobaciones: roundAprobacionesCancelaciones3(approvalsTotal),
      cancelaciones: roundAprobacionesCancelaciones3(cancelacionesTotal),
      aprobacionesNetas: roundAprobacionesCancelaciones3(approvalsTotal + cancelacionesTotal)
    };
  });

  return {
    ...byCountryBase,
    GENERAL: generalRows
  };
};

const aprobacionesCancelacionesRowsByCountry: Record<
  AprobacionesCancelacionesCountry,
  AprobacionesCancelacionesRow[]
> = buildAprobacionesCancelacionesRowsByCountry();

const aprobacionesCancelacionesAxisFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0
});
const formatAprobacionesCancelacionesAxisNoDecimals = (value: number) =>
  aprobacionesCancelacionesAxisFormatter.format(Math.round(value));

const formatAprobacionesCancelacionesYearShort = (label: string) => {
  const match = /^(\d{4})$/.exec(label.trim());
  return match ? match[1].slice(-2) : label;
};

const buildAprobacionesCancelacionesTickValues = (minValue: number, maxValue: number) => {
  const span = Math.max(1, maxValue - minValue);
  const roughStep = span / 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(roughStep) || 1)));
  const multipliers = [1, 2, 2.5, 5, 10];
  const step =
    (multipliers.find((multiplier) => roughStep <= multiplier * magnitude) ?? 10) * magnitude;
  const start = Math.floor(minValue / step) * step;
  const end = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];

  for (let current = start; current <= end + step * 0.5; current += step) {
    ticks.push(roundAprobacionesCancelaciones3(current));
  }

  if (!ticks.some((tick) => Math.abs(tick) < 0.0001)) {
    ticks.push(0);
    ticks.sort((a, b) => a - b);
  }

  return Array.from(new Set(ticks.map((tick) => Math.round(tick)))).sort((a, b) => a - b);
};

const buildAprobacionesCancelacionesChart = (
  country: AprobacionesCancelacionesCountry
): LineChartConfig => {
  const rows = aprobacionesCancelacionesRowsByCountry[country];
  const maxPositive = Math.max(
    0,
    ...rows.map((row) => row.aprobaciones),
    ...rows.map((row) => row.aprobacionesNetas)
  );
  const minNegative = Math.min(
    0,
    ...rows.map((row) => row.cancelaciones),
    ...rows.map((row) => row.aprobacionesNetas)
  );

  return {
    type: 'line',
    title: aprobacionesCancelacionesLabelByCountry[country],
    subtitle: '',
    unit: 'USD mm',
    xAxis: 'category',
    sortByX: false,
    xTickValues: rows.map((row) => row.year),
    xTickFormatter: formatAprobacionesCancelacionesYearShort,
    tooltipMode: 'shared-x',
    showLegend: false,
    showPoints: true,
    showTooltip: true,
    valueFormat: 'one-decimal',
    yMin: minNegative === 0 ? undefined : roundAprobacionesCancelaciones3(minNegative * 1.12),
    yTickValues: buildAprobacionesCancelacionesTickValues(minNegative, maxPositive),
    yTickFormatter: formatAprobacionesCancelacionesAxisNoDecimals,
    barAxis: 'left',
    barLayout: 'mixed',
    categoryPadding: 0.3,
    categoryBarWidthRatio: 0.72,
    barUnit: 'USD mm',
    barOpacity: 1,
    barValueFormat: 'one-decimal',
    barTooltipSkipZero: true,
    showBarLabels: false,
    barSeries: [
      { id: 'aprobaciones', label: 'Aprobaciones', color: '#E3120B', stackGroup: 'aprobaciones' },
      { id: 'cancelaciones', label: 'Cancelaciones', color: '#64748B', stackGroup: 'cancelaciones' }
    ],
    barData: rows.map((row) => ({
      date: row.year,
      values: {
        aprobaciones: row.aprobaciones,
        cancelaciones: row.cancelaciones
      }
    })),
    series: [
      {
        id: 'aprobaciones_netas',
        label: 'Aprobaciones netas',
        color: '#111827',
        lineWidth: 2.5,
        values: rows.map((row) => ({
          date: row.year,
          value: row.aprobacionesNetas
        }))
      }
    ]
  };
};

const aprobacionesCancelacionesChartsByCountry: Record<AprobacionesCancelacionesCountry, LineChartConfig> =
  aprobacionesCancelacionesCountryOrder.reduce(
    (accumulator, country) => {
      accumulator[country] = buildAprobacionesCancelacionesChart(country);
      return accumulator;
    },
    {} as Record<AprobacionesCancelacionesCountry, LineChartConfig>
  );

const proyeccionesDesembolsosColumns: SimpleTableColumn[] = [
  { label: 'País', align: 'left', width: '13%' },
  { label: 'Efectivo\nEne-26', align: 'right' },
  { label: 'Feb-26', align: 'right' },
  { label: 'Mar-26', align: 'right' },
  { label: 'Abr-26', align: 'right' },
  { label: 'May-26', align: 'right' },
  { label: 'Jun-26', align: 'right' },
  { label: 'Jul-26', align: 'right' },
  { label: 'Ago-26', align: 'right' },
  { label: 'Sep-26', align: 'right' },
  { label: 'Oct-26', align: 'right' },
  { label: 'Nov-26', align: 'right' },
  { label: 'Dic-26', align: 'right' },
  { label: 'Total', align: 'right' }
];

const proyeccionesDesembolsosSoberanoTable: SimpleTable = {
  title: 'Riesgo Soberano',
  columns: proyeccionesDesembolsosColumns,
  rows: [
    {
      cells: [
        'Argentina',
        '-',
        '14,58',
        '40,80',
        '4,60',
        '0,30',
        '4,90',
        '-',
        '-',
        '10,30',
        '19,00',
        '-',
        '0,05',
        '94,53'
      ]
    },
    {
      cells: [
        'Bolivia',
        '-',
        '-',
        '21,00',
        '6,00',
        '5,00',
        '5,75',
        '28,50',
        '2,00',
        '5,00',
        '2,50',
        '35,00',
        '5,50',
        '116,25'
      ]
    },
    {
      cells: [
        'Brasil',
        '3,44',
        '3,94',
        '11,90',
        '23,60',
        '13,32',
        '10,09',
        '5,00',
        '8,31',
        '11,41',
        '7,26',
        '13,10',
        '21,00',
        '132,38'
      ]
    },
    {
      cells: [
        'Paraguay',
        '-',
        '-',
        '-',
        '-',
        '-',
        '5,00',
        '23,04',
        '-',
        '-',
        '23,34',
        '-',
        '21,34',
        '72,72'
      ]
    },
    {
      cells: [
        'Uruguay',
        '-',
        '14,00',
        '4,00',
        '-',
        '4,00',
        '4,00',
        '-',
        '-',
        '18,37',
        '12,07',
        '-',
        '-',
        '56,44'
      ]
    },
    {
      cells: [
        'Total',
        '3,44',
        '32,52',
        '77,70',
        '34,20',
        '22,62',
        '29,74',
        '56,54',
        '10,31',
        '45,08',
        '64,17',
        '48,10',
        '47,89',
        '472,32'
      ],
      isTotal: true
    }
  ]
};

const proyeccionesDesembolsosNoSoberanoTable: SimpleTable = {
  title: 'Riesgo No Soberano',
  columns: proyeccionesDesembolsosColumns,
  rows: [
    { cells: ['Brasil', '-', '-', '-', '55,00', '-', '-', '-', '-', '-', '-', '-', '-', '55,00'] },
    { cells: ['Paraguay', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'] },
    { cells: ['Uruguay', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'] },
    {
      cells: ['Total', '-', '-', '-', '55,00', '-', '-', '-', '-', '-', '-', '-', '-', '55,00'],
      isTotal: true
    }
  ]
};

const debtAuthorizationDonut = {
  title: 'Endeudamiento autorizado',
  data: [
    { id: 'autorizado', label: 'Endeudamiento Autorizado', value: 2500, color: '#c1121f' },
    { id: 'no-autorizado', label: 'Sin Autorizar', value: 2945, color: '#adb5bd' }
  ],
  drilldown: {
    parentId: 'autorizado',
    title: 'Endeudamiento autorizado · desglose',
    data: [
      { id: 'contratada', label: 'Contratada', value: 2161, color: '#c1121f' },
      { id: 'pipeline', label: 'En pipeline', value: 339, color: '#e56b75' }
    ]
  }
};

const debtAuthorizationChart: LineChartConfig = {
  type: 'line',
  title: 'Evolución de endeudamiento y capacidad autorizada',
  subtitle: '',
  unit: 'USD mm',
  tooltipMode: 'shared-x',
  xAxis: 'category',
  xTickValues: ['2020', '2021', '2022', '2023', '2024', '2025'],
  categoryPadding: 0,
  sortByX: false,
  showTooltip: false,
  series: [
    {
      id: 'bruto',
      label: 'Endeudamiento Bruto',
      color: '#00b4d8',
      areaColor: '#00b4d8',
      areaOpacity: 0.2,
      lineWidth: 2.2,
      values: [
        { date: '2020', value: 548 },
        { date: '2021', value: 918 },
        { date: '2022', value: 1021 },
        { date: '2023', value: 1030 },
        { date: '2024', value: 1405 },
        { date: '2025', value: 2079 }
      ]
    },
    {
      id: 'limite_politica',
      label: 'Límite de Política',
      color: '#adb5bd',
      areaColor: '#adb5bd',
      areaOpacity: 0.14,
      lineWidth: 1.9,
      values: [
        { date: '2020', value: 2658 },
        { date: '2021', value: 3043 },
        { date: '2022', value: 3214 },
        { date: '2023', value: 3830 },
        { date: '2024', value: 4269 },
        { date: '2025', value: 5161 }
      ]
    },
    {
      id: 'envelope',
      label: 'Envelope Autorizado DEJ',
      color: '#c1121f',
      lineWidth: 1.8,
      values: [
        { date: '2020', value: 1200 },
        { date: '2021', value: 2500 },
        { date: '2022', value: 2500 },
        { date: '2023', value: 2500 },
        { date: '2024', value: 2500 },
        { date: '2025', value: 2500 }
      ]
    }
  ]
};

const debtAuthorizationExtraTooltip = [
  {
    id: 'limite_politica',
    label: 'Límite de Política',
    color: '#adb5bd',
    values: {
      '2020': 2658,
      '2021': 3043,
      '2022': 3214,
      '2023': 3830,
      '2024': 4269,
      '2025': 5161
    }
  },
  {
    id: 'limite',
    label: 'Envelope Autorizado DEJ',
    color: '#c1121f',
    values: {
      '2020': 1200,
      '2021': 2500,
      '2022': 2500,
      '2023': 2500,
      '2024': 2500,
      '2025': 2500
    }
  }
];

const minimaRequeridaVsLiquidezChart: LineChartConfig = {
  type: 'line',
  title: 'Monitoreo Liquidez (Política Financiera)',
  subtitle: '',
  unit: 'USD mm',
  showLegend: false,
  showPoints: true,
  showValueLabels: true,
  showValueLabelUnit: false,
  valueLabelFontSize: '0.6rem',
  valueLabelOffset: 13,
  valueFormat: 'integer',
  tooltipMode: 'shared-x',
  series: [
    {
      id: 'minima-requerida',
      label: 'Mínima requerida',
      color: '#E3120B',
      projectedFromLabel: '31/1/26',
      projectedDasharray: '6 4',
      valueLabelPosition: 'below',
      values: [
        { date: '31/12/25', value: 726 },
        { date: '31/1/26', value: 781 },
        { date: '28/2/26', value: 791 },
        { date: '31/3/26', value: 779 },
        { date: '30/4/26', value: 784 },
        { date: '31/5/26', value: 847 },
        { date: '30/6/26', value: 884 },
        { date: '31/7/26', value: 860 },
        { date: '31/8/26', value: 904 },
        { date: '30/9/26', value: 694 },
        { date: '31/10/26', value: 637 },
        { date: '30/11/26', value: 837 },
        { date: '31/12/26', value: 837 }
      ]
    },
    {
      id: 'liquidez',
      label: 'Liquidez',
      color: '#1F9D55',
      projectedFromLabel: '31/1/26',
      projectedDasharray: '6 4',
      values: [
        { date: '31/12/25', value: 1367 },
        { date: '31/1/26', value: 1396 },
        { date: '28/2/26', value: 1368 },
        { date: '31/3/26', value: 1328 },
        { date: '30/4/26', value: 1283 },
        { date: '31/5/26', value: 1276 },
        { date: '30/6/26', value: 1232 },
        { date: '31/7/26', value: 1174 },
        { date: '31/8/26', value: 1180 },
        { date: '30/9/26', value: 930 },
        { date: '31/10/26', value: 896 },
        { date: '30/11/26', value: 867 },
        { date: '31/12/26', value: 826 }
      ]
    }
  ]
};

const moodysThresholdRanges = [
  { label: 'A3', value: 75, seriesId: 'a3' },
  { label: 'A2', value: 90, seriesId: 'a2' },
  { label: 'A1', value: 105, seriesId: 'a1' },
  { label: 'AA3', value: 120, seriesId: 'aa3' },
  { label: 'AA2', value: 147, seriesId: 'aa2' },
  { label: 'AA1', value: 173, seriesId: 'aa1' },
  { label: 'AAA', value: 200, seriesId: 'aaa' }
] as const;

const fonplataRatingThresholdsChart: LineChartConfig = {
  type: 'line',
  title: 'Disponibilidad de Recursos Líquidos (Moodys)',
  subtitle: '',
  unit: '%',
  xAxis: 'category',
  sortByX: false,
  showLegend: false,
  showPoints: true,
  showTooltip: true,
  showValueLabels: true,
  valueLabelFontSize: '0.58rem',
  valueLabelOffset: 14,
  tooltipPrimarySeriesId: 'fonplata',
  tooltipPreferBelowPrimary: true,
  tooltipThresholdRanges: [...moodysThresholdRanges],
  yTickValues: moodysThresholdRanges.map((range) => range.value),
  yTickFormatter: (value: number) => {
    const roundedValue = Math.round(value);
    return String(roundedValue);
  },
  backgroundZones: [
    { label: 'A3', min: 75, max: 90, color: '#DCFCE7', opacity: 0.24, textColor: '#14532D' },
    { label: 'A2', min: 90, max: 105, color: '#CAF7DE', opacity: 0.22, textColor: '#14532D' },
    { label: 'A1', min: 105, max: 120, color: '#B6F1D4', opacity: 0.2, textColor: '#14532D' },
    { label: 'AA3', min: 120, max: 147, color: '#9DE8C5', opacity: 0.2, textColor: '#14532D' },
    { label: 'AA2', min: 147, max: 173, color: '#7DDBAF', opacity: 0.22, textColor: '#14532D' },
    { label: 'AA1', min: 173, max: 200, color: '#54CD93', opacity: 0.22, textColor: '#14532D' },
    { label: 'AAA', min: 200, color: '#22A86A', opacity: 0.2, textColor: '#14532D' }
  ],
  valueFormat: 'integer',
  yMin: 70,
  seriesLabelMode: 'none',
  series: [
    {
      id: 'fonplata',
      label: 'FONPLATA',
      color: '#E3120B',
      projectedFromLabel: '2026',
      projectedDasharray: '6 4',
      showPoints: true,
      lineWidth: 2.8,
      values: [
        { date: '2021', value: 162 },
        { date: '2022', value: 150 },
        { date: '2023', value: 103 },
        { date: '2024', value: 160 },
        { date: '2025', value: 159 },
        { date: '2026', value: 152 }
      ]
    },
    {
      id: 'a3',
      label: 'A3',
      color: '#DCFCE7',
      showPoints: false,
      lineVisible: false,
      lineWidth: 1.1,
      values: [
        { date: '2021', value: 75 },
        { date: '2022', value: 75 },
        { date: '2023', value: 75 },
        { date: '2024', value: 75 },
        { date: '2025', value: 75 },
        { date: '2026', value: 75 }
      ]
    },
    {
      id: 'a2',
      label: 'A2',
      color: '#CAF7DE',
      showPoints: false,
      lineVisible: false,
      lineWidth: 1.1,
      values: [
        { date: '2021', value: 90 },
        { date: '2022', value: 90 },
        { date: '2023', value: 90 },
        { date: '2024', value: 90 },
        { date: '2025', value: 90 },
        { date: '2026', value: 90 }
      ]
    },
    {
      id: 'a1',
      label: 'A1',
      color: '#B6F1D4',
      showPoints: false,
      lineVisible: false,
      lineWidth: 1.1,
      values: [
        { date: '2021', value: 105 },
        { date: '2022', value: 105 },
        { date: '2023', value: 105 },
        { date: '2024', value: 105 },
        { date: '2025', value: 105 },
        { date: '2026', value: 105 }
      ]
    },
    {
      id: 'aa3',
      label: 'AA3',
      color: '#9DE8C5',
      showPoints: false,
      lineVisible: false,
      lineWidth: 1.1,
      values: [
        { date: '2021', value: 120 },
        { date: '2022', value: 120 },
        { date: '2023', value: 120 },
        { date: '2024', value: 120 },
        { date: '2025', value: 120 },
        { date: '2026', value: 120 }
      ]
    },
    {
      id: 'aa2',
      label: 'AA2',
      color: '#7DDBAF',
      showPoints: false,
      lineVisible: false,
      lineWidth: 1.1,
      values: [
        { date: '2021', value: 147 },
        { date: '2022', value: 147 },
        { date: '2023', value: 147 },
        { date: '2024', value: 147 },
        { date: '2025', value: 147 },
        { date: '2026', value: 147 }
      ]
    },
    {
      id: 'aa1',
      label: 'AA1',
      color: '#54CD93',
      showPoints: false,
      lineVisible: false,
      lineWidth: 1.1,
      values: [
        { date: '2021', value: 173 },
        { date: '2022', value: 173 },
        { date: '2023', value: 173 },
        { date: '2024', value: 173 },
        { date: '2025', value: 173 },
        { date: '2026', value: 173 }
      ]
    },
    {
      id: 'aaa',
      label: 'AAA',
      color: '#22A86A',
      showPoints: false,
      lineVisible: false,
      lineWidth: 1.1,
      values: [
        { date: '2021', value: 200 },
        { date: '2022', value: 200 },
        { date: '2023', value: 200 },
        { date: '2024', value: 200 },
        { date: '2025', value: 200 },
        { date: '2026', value: 200 }
      ]
    }
  ]
};

const ratioSpChart: LineChartConfig = {
  type: 'line',
  title: 'Cobertura de liquidez a 12 meses (S&P)',
  subtitle: '',
  xAxis: 'category',
  sortByX: false,
  showLegend: false,
  showPoints: true,
  showTooltip: true,
  showValueLabels: true,
  valueLabelFontSize: '0.58rem',
  valueLabelOffset: 14,
  valueFormat: 'one-decimal',
  yMin: 0.6,
  backgroundZones: [
    {
      label: 'Weak',
      max: 1.0,
      color: '#FECACA',
      opacity: 0.28,
      textColor: '#B91C1C'
    },
    {
      label: 'Strong',
      min: 1.0,
      color: '#BBF7D0',
      opacity: 0.24,
      textColor: '#166534'
    }
  ],
  series: [
    {
      id: 'fonplata',
      label: 'FONPLATA',
      color: '#E3120B',
      projectedFromLabel: '2026',
      projectedDasharray: '6 4',
      lineWidth: 2.8,
      values: [
        { date: '2021', value: 1.5 },
        { date: '2022', value: 1.0 },
        { date: '2023', value: 1.0 },
        { date: '2024', value: 1.3 },
        { date: '2025', value: 1.6 },
        { date: '2026', value: 1.52 }
      ]
    }
  ]
};

const activosLiquidosTotalesRatioChart: LineChartConfig = {
  type: 'line',
  title: 'Ratio de Estructura de Activos',
  subtitle: '',
  unit: '%',
  xAxis: 'category',
  sortByX: false,
  tooltipMode: 'shared-x',
  showPoints: true,
  showTooltip: true,
  showValueLabels: true,
  valueLabelFontSize: '0.58rem',
  valueLabelOffset: 14,
  valueFormat: 'one-decimal',
  barAxis: 'none',
  series: [
    {
      id: 'ratio',
      label: 'Ratio',
      color: '#E3120B',
      projectedFromLabel: '2026',
      projectedDasharray: '6 4',
      lineWidth: 2.8,
      valueLabelPosition: 'above',
      values: [
        { date: '2021', value: 29.3 },
        { date: '2022', value: 23.8 },
        { date: '2023', value: 27.7 },
        { date: '2024', value: 24.2 },
        { date: '2025', value: 35.6 },
        { date: '2026', value: 34.9 }
      ]
    }
  ]
};

const flujosPaisCountryOrder = [
  'ARGENTINA',
  'BOLIVIA',
  'BRASIL',
  'PARAGUAY',
  'URUGUAY',
  'GENERAL'
] as const;
type FlujosPaisCountry = (typeof flujosPaisCountryOrder)[number];
type FlujosPaisCountryBase = Exclude<FlujosPaisCountry, 'GENERAL'>;
type FlujosPaisTipo = 'SOB' | 'NO_SOB';

type FlujosPaisRawRow = {
  desembolsos: string;
  flujoNeto: string;
};

type FlujosServicioComponentesRaw = {
  amortizacion?: string;
  aporteVoluntario?: string;
  comisionAdm?: string;
  comisionCompromiso?: string;
  compensacionReservaCredito?: string;
  comisionGestion?: string;
  servicioPagoCuentaUsd?: string;
  intereses?: string;
  interesesFocom?: string;
  interesesLineaVerde?: string;
  mora?: string;
};

type FlujosServicioComponentes = {
  amortizacion: number;
  aporteVoluntario: number;
  comisionAdm: number;
  comisionCompromiso: number;
  compensacionReservaCredito: number;
  comisionGestion: number;
  servicioPagoCuentaUsd: number;
  intereses: number;
  interesesFocom: number;
  interesesLineaVerde: number;
  mora: number;
};

type FlujosPaisRow = {
  year: string;
  desembolsos: number;
  servicioTotal: number;
  flujoNeto: number;
  componentes: FlujosServicioComponentes;
};

const flujosPaisLabelByCountry: Record<FlujosPaisCountry, string> = {
  ARGENTINA: 'ARG',
  BOLIVIA: 'BOL',
  BRASIL: 'BRA',
  GENERAL: 'GENERAL',
  PARAGUAY: 'PAR',
  URUGUAY: 'URU'
};

const formatFlujosYearShort = (label: string) => {
  const match = /^(\d{4})$/.exec(label.trim());
  return match ? match[1].slice(-2) : label;
};

const flujosAxisIntegerFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const formatFlujosAxisNoDecimals = (value: number) =>
  flujosAxisIntegerFormatter.format(Math.round(value));

const flujosPaisYears = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;

const parseLocalizedAmount = (value: string) => {
  const normalized = value.trim();
  if (!normalized || normalized === '-' || normalized === '—') return 0;
  const isNegative = normalized.startsWith('(') && normalized.endsWith(')');
  const noParens = isNegative ? normalized.slice(1, -1) : normalized;
  const plain = noParens.replaceAll('.', '').replace(',', '.');
  const parsed = Number.parseFloat(plain);
  if (!Number.isFinite(parsed)) return 0;
  return isNegative ? -parsed : parsed;
};

const toUsdMillions = (value: number) => Math.round((value / 1_000_000) * 1000) / 1000;

const buildFlujosComponentes = (raw?: FlujosServicioComponentesRaw): FlujosServicioComponentes => ({
  amortizacion: toUsdMillions(parseLocalizedAmount(raw?.amortizacion ?? '-')),
  aporteVoluntario: toUsdMillions(parseLocalizedAmount(raw?.aporteVoluntario ?? '-')),
  comisionAdm: toUsdMillions(parseLocalizedAmount(raw?.comisionAdm ?? '-')),
  comisionCompromiso: toUsdMillions(parseLocalizedAmount(raw?.comisionCompromiso ?? '-')),
  compensacionReservaCredito: toUsdMillions(parseLocalizedAmount(raw?.compensacionReservaCredito ?? '-')),
  comisionGestion: toUsdMillions(parseLocalizedAmount(raw?.comisionGestion ?? '-')),
  servicioPagoCuentaUsd: toUsdMillions(parseLocalizedAmount(raw?.servicioPagoCuentaUsd ?? '-')),
  intereses: toUsdMillions(parseLocalizedAmount(raw?.intereses ?? '-')),
  interesesFocom: toUsdMillions(parseLocalizedAmount(raw?.interesesFocom ?? '-')),
  interesesLineaVerde: toUsdMillions(parseLocalizedAmount(raw?.interesesLineaVerde ?? '-')),
  mora: toUsdMillions(parseLocalizedAmount(raw?.mora ?? '-'))
});

const sumFlujosComponentes = (componentes: FlujosServicioComponentes) =>
  componentes.amortizacion +
  componentes.aporteVoluntario +
  componentes.comisionAdm +
  componentes.comisionCompromiso +
  componentes.compensacionReservaCredito +
  componentes.comisionGestion +
  componentes.servicioPagoCuentaUsd +
  componentes.intereses +
  componentes.interesesFocom +
  componentes.interesesLineaVerde +
  componentes.mora;

const flujosPaisSobRaw: Record<FlujosPaisCountryBase, Record<number, FlujosPaisRawRow>> = {
  ARGENTINA: {
    2015: { desembolsos: '40.206.021,43', flujoNeto: '25.548.149,80' },
    2016: { desembolsos: '10.424.764,13', flujoNeto: '(5.044.444,15)' },
    2017: { desembolsos: '44.507.950,32', flujoNeto: '29.539.684,78' },
    2018: { desembolsos: '65.627.334,58', flujoNeto: '44.765.023,75' },
    2019: { desembolsos: '87.381.589,94', flujoNeto: '58.450.023,41' },
    2020: { desembolsos: '104.814.241,80', flujoNeto: '74.076.646,83' },
    2021: { desembolsos: '107.948.464,48', flujoNeto: '69.027.655,02' },
    2022: { desembolsos: '123.009.210,77', flujoNeto: '70.090.918,82' },
    2023: { desembolsos: '10.417.754,82', flujoNeto: '(71.678.087,85)' },
    2024: { desembolsos: '250.000.000,00', flujoNeto: '140.321.936,77' },
    2025: { desembolsos: '21.594.002,75', flujoNeto: '(90.232.348,55)' }
  },
  BOLIVIA: {
    2015: { desembolsos: '43.103.742,22', flujoNeto: '33.631.673,05' },
    2016: { desembolsos: '57.647.853,21', flujoNeto: '47.179.139,77' },
    2017: { desembolsos: '38.238.731,91', flujoNeto: '22.103.283,61' },
    2018: { desembolsos: '82.618.849,47', flujoNeto: '56.325.488,82' },
    2019: { desembolsos: '71.178.362,98', flujoNeto: '39.941.003,19' },
    2020: { desembolsos: '61.850.718,58', flujoNeto: '34.116.429,68' },
    2021: { desembolsos: '44.696.262,39', flujoNeto: '15.096.913,71' },
    2022: { desembolsos: '66.224.690,32', flujoNeto: '28.062.268,08' },
    2023: { desembolsos: '72.728.567,83', flujoNeto: '18.084.639,88' },
    2024: { desembolsos: '32.908.607,43', flujoNeto: '(42.200.224,18)' },
    2025: { desembolsos: '39.716.137,69', flujoNeto: '(34.311.767,42)' }
  },
  BRASIL: {
    2015: { desembolsos: '3.044.714,45', flujoNeto: '(15.690.748,60)' },
    2016: { desembolsos: '-', flujoNeto: '(17.965.920,34)' },
    2017: { desembolsos: '4.561.146,44', flujoNeto: '(13.492.917,51)' },
    2018: { desembolsos: '1.539.415,61', flujoNeto: '(14.317.403,60)' },
    2019: { desembolsos: '21.008.971,44', flujoNeto: '7.510.336,83' },
    2020: { desembolsos: '38.437.859,43', flujoNeto: '26.537.326,96' },
    2021: { desembolsos: '44.173.181,12', flujoNeto: '33.235.294,25' },
    2022: { desembolsos: '45.324.173,49', flujoNeto: '22.335.572,34' },
    2023: { desembolsos: '75.196.820,48', flujoNeto: '48.634.002,94' },
    2024: { desembolsos: '144.111.635,27', flujoNeto: '90.917.595,81' },
    2025: { desembolsos: '154.613.870,88', flujoNeto: '93.254.023,23' }
  },
  PARAGUAY: {
    2015: { desembolsos: '22.850.000,00', flujoNeto: '19.088.291,25' },
    2016: { desembolsos: '19.415.707,55', flujoNeto: '14.475.506,06' },
    2017: { desembolsos: '32.506.549,00', flujoNeto: '17.292.683,06' },
    2018: { desembolsos: '23.833.940,75', flujoNeto: '9.403.591,68' },
    2019: { desembolsos: '17.187.806,95', flujoNeto: '1.632.149,04' },
    2020: { desembolsos: '41.373.626,85', flujoNeto: '27.722.209,97' },
    2021: { desembolsos: '104.277.344,72', flujoNeto: '89.729.360,86' },
    2022: { desembolsos: '86.434.698,46', flujoNeto: '55.526.516,72' },
    2023: { desembolsos: '40.292.633,89', flujoNeto: '(21.720.102,17)' },
    2024: { desembolsos: '82.666.331,48', flujoNeto: '(3.529.037,24)' },
    2025: { desembolsos: '117.099.365,54', flujoNeto: '27.291.867,88' }
  },
  URUGUAY: {
    2015: { desembolsos: '10.106.119,82', flujoNeto: '8.022.458,40' },
    2016: { desembolsos: '39.644.918,46', flujoNeto: '36.113.972,71' },
    2017: { desembolsos: '51.297.753,44', flujoNeto: '38.943.915,94' },
    2018: { desembolsos: '22.744.592,70', flujoNeto: '8.170.353,98' },
    2019: { desembolsos: '17.541.138,46', flujoNeto: '(15.147.240,44)' },
    2020: { desembolsos: '73.617.648,00', flujoNeto: '38.716.603,27' },
    2021: { desembolsos: '44.356.025,48', flujoNeto: '24.279.149,59' },
    2022: { desembolsos: '33.636.599,41', flujoNeto: '10.590.046,96' },
    2023: { desembolsos: '93.247.271,18', flujoNeto: '49.239.089,66' },
    2024: { desembolsos: '227.285.347,89', flujoNeto: '147.427.666,36' },
    2025: { desembolsos: '101.411.282,10', flujoNeto: '30.819.648,84' }
  }
};

const flujosPaisNoSobOverrides: Partial<Record<FlujosPaisCountryBase, Record<number, FlujosPaisRawRow>>> = {
  BOLIVIA: {
    2023: { desembolsos: '155.505,00', flujoNeto: '38.668,00' }
  },
  BRASIL: {
    2023: { desembolsos: '34.000.000,00', flujoNeto: '21.989.708,00' },
    2024: { desembolsos: '65.000.000,00', flujoNeto: '41.007.402,00' },
    2025: { desembolsos: '20.000.000,00', flujoNeto: '12.062.828,00' }
  },
  PARAGUAY: {
    2023: { desembolsos: '6.000.000,00', flujoNeto: '(3.234.353,00)' },
    2024: { desembolsos: '6.000.000,00', flujoNeto: '(256.141,00)' }
  },
  URUGUAY: {
    2022: { desembolsos: '10.000.000,00', flujoNeto: '3.148.370,00' },
    2023: { desembolsos: '19.500.000,00', flujoNeto: '10.296.947,00' }
  }
};

const flujosPaisSobComponentesRaw: Record<FlujosPaisCountryBase, Record<number, FlujosServicioComponentesRaw>> = {
  ARGENTINA: {
    2015: {
      amortizacion: '11.754.788,23',
      comisionAdm: '395.664,00',
      comisionCompromiso: '670.526,43',
      intereses: '1.836.892,97'
    },
    2016: {
      amortizacion: '11.575.398,74',
      comisionAdm: '245.000,00',
      comisionCompromiso: '827.577,42',
      intereses: '2.821.232,12'
    },
    2017: {
      amortizacion: '10.337.556,29',
      comisionAdm: '591.500,00',
      comisionCompromiso: '591.427,03',
      compensacionReservaCredito: '21.611,10',
      intereses: '3.426.171,12'
    },
    2018: {
      amortizacion: '13.207.065,77',
      comisionAdm: '750.400,00',
      comisionCompromiso: '1.217.282,39',
      compensacionReservaCredito: '155.329,37',
      intereses: '5.550.654,17',
      mora: '42,83',
      servicioPagoCuentaUsd: '(18.463,70)'
    },
    2019: {
      amortizacion: '17.369.333,23',
      comisionAdm: '992.000,00',
      comisionCompromiso: '960.490,82',
      compensacionReservaCredito: '366,67',
      intereses: '9.609.066,72',
      mora: '309,09'
    },
    2020: {
      amortizacion: '18.782.011,70',
      comisionAdm: '1.056.510,00',
      comisionCompromiso: '1.174.850,71',
      intereses: '9.724.191,61',
      servicioPagoCuentaUsd: '30,95'
    },
    2021: {
      amortizacion: '27.000.233,10',
      comisionAdm: '845.500,00',
      comisionCompromiso: '1.264.968,32',
      intereses: '9.810.135,01',
      mora: '3,98',
      servicioPagoCuentaUsd: '(30,95)'
    },
    2022: {
      amortizacion: '36.355.654,72',
      aporteVoluntario: '30.000,00',
      comisionAdm: '876.650,00',
      comisionCompromiso: '1.190.272,89',
      intereses: '14.465.714,34'
    },
    2023: {
      amortizacion: '44.263.457,14',
      comisionCompromiso: '1.329.806,89',
      intereses: '36.502.578,64'
    },
    2024: {
      amortizacion: '67.617.422,68',
      comisionAdm: '1.220.000,00',
      comisionCompromiso: '1.371.194,30',
      intereses: '39.469.446,25'
    },
    2025: {
      amortizacion: '64.159.396,58',
      comisionAdm: '206.200,00',
      comisionCompromiso: '907.038,15',
      intereses: '46.553.716,57'
    }
  },
  BOLIVIA: {
    2015: {
      amortizacion: '6.239.244,20',
      comisionAdm: '705.170,00',
      comisionCompromiso: '753.781,87',
      intereses: '1.773.873,10'
    },
    2016: {
      amortizacion: '7.099.630,44',
      comisionAdm: '35.000,00',
      comisionCompromiso: '509.406,68',
      intereses: '2.824.676,32'
    },
    2017: {
      amortizacion: '10.762.253,10',
      comisionCompromiso: '551.744,18',
      intereses: '4.821.451,02'
    },
    2018: {
      amortizacion: '17.550.899,08',
      comisionAdm: '1.120.000,00',
      comisionCompromiso: '599.612,70',
      compensacionReservaCredito: '3.287,67',
      intereses: '7.019.561,20'
    },
    2019: {
      amortizacion: '19.549.437,72',
      comisionAdm: '641.657,00',
      comisionCompromiso: '564.404,52',
      intereses: '10.481.860,55'
    },
    2020: {
      amortizacion: '16.099.296,89',
      comisionAdm: '210.000,00',
      comisionCompromiso: '644.616,99',
      intereses: '10.780.375,02'
    },
    2021: {
      amortizacion: '20.939.187,02',
      comisionCompromiso: '502.113,55',
      intereses: '8.158.048,11'
    },
    2022: {
      amortizacion: '26.608.806,95',
      comisionAdm: '910.000,00',
      comisionCompromiso: '334.317,88',
      intereses: '10.309.297,41'
    },
    2023: {
      amortizacion: '26.964.722,93',
      comisionCompromiso: '645.421,80',
      intereses: '27.033.783,22'
    },
    2024: {
      amortizacion: '39.510.957,08',
      comisionAdm: '372.099,54',
      comisionCompromiso: '334.246,18',
      intereses: '34.891.528,81'
    },
    2025: {
      amortizacion: '40.244.289,19',
      comisionAdm: '526.825,00',
      comisionCompromiso: '592.808,05',
      intereses: '32.655.479,50',
      mora: '8.503,37'
    }
  },
  BRASIL: {
    2015: {
      amortizacion: '15.405.367,69',
      comisionCompromiso: '28.284,42',
      intereses: '3.301.810,94'
    },
    2016: {
      amortizacion: '14.715.425,29',
      comisionCompromiso: '4.947,27',
      intereses: '3.244.218,91',
      mora: '1.328,87'
    },
    2017: {
      amortizacion: '14.279.404,72',
      comisionAdm: '280.000,00',
      compensacionReservaCredito: '72.986,30',
      intereses: '3.415.544,51',
      mora: '6.014,78',
      servicioPagoCuentaUsd: '113,64'
    },
    2018: {
      amortizacion: '12.384.383,79',
      comisionCompromiso: '194.912,62',
      intereses: '3.275.568,17',
      mora: '1.892,50',
      servicioPagoCuentaUsd: '62,13'
    },
    2019: {
      amortizacion: '9.017.383,28',
      comisionAdm: '375.000,00',
      comisionCompromiso: '371.179,82',
      intereses: '3.732.638,12',
      mora: '2.535,54',
      servicioPagoCuentaUsd: '(102,15)'
    },
    2020: {
      amortizacion: '6.975.774,02',
      comisionAdm: '960.350,00',
      comisionCompromiso: '567.077,23',
      compensacionReservaCredito: '207.287,50',
      intereses: '3.188.131,31',
      mora: '1.932,74',
      servicioPagoCuentaUsd: '(20,32)'
    },
    2021: {
      amortizacion: '6.975.774,02',
      comisionCompromiso: '829.626,53',
      intereses: '3.132.202,09',
      mora: '52,43',
      servicioPagoCuentaUsd: '231,80'
    },
    2022: {
      amortizacion: '15.575.195,10',
      comisionCompromiso: '618.854,84',
      intereses: '6.794.551,21'
    },
    2023: {
      amortizacion: '12.372.594,13',
      comisionAdm: '1.153.250,00',
      comisionCompromiso: '916.058,26',
      intereses: '12.120.915,15'
    },
    2024: {
      amortizacion: '28.852.182,32',
      comisionAdm: '1.308.000,00',
      comisionCompromiso: '1.231.387,88',
      intereses: '21.802.469,26'
    },
    2025: {
      amortizacion: '30.121.408,05',
      comisionAdm: '1.044.500,00',
      comisionCompromiso: '1.922.452,27',
      intereses: '28.262.029,66',
      mora: '9.457,67'
    }
  },
  PARAGUAY: {
    2015: {
      amortizacion: '2.043.417,52',
      comisionCompromiso: '212.463,73',
      intereses: '1.505.827,50'
    },
    2016: {
      amortizacion: '2.043.417,52',
      comisionAdm: '85.000,00',
      comisionCompromiso: '477.023,08',
      intereses: '2.334.760,89'
    },
    2017: {
      amortizacion: '10.823.417,52',
      comisionAdm: '595.000,00',
      comisionCompromiso: '419.131,90',
      intereses: '3.376.316,52'
    },
    2018: {
      amortizacion: '8.797.079,18',
      comisionAdm: '299.250,00',
      comisionCompromiso: '602.281,00',
      intereses: '4.731.738,89'
    },
    2019: {
      amortizacion: '7.775.370,41',
      comisionAdm: '557.520,00',
      comisionCompromiso: '925.717,10',
      compensacionReservaCredito: '19.548,34',
      intereses: '6.277.502,06'
    },
    2020: {
      amortizacion: '7.628.734,16',
      comisionCompromiso: '1.110.667,29',
      compensacionReservaCredito: '(19.548,34)',
      intereses: '4.931.127,44',
      servicioPagoCuentaUsd: '436,33'
    },
    2021: {
      amortizacion: '8.503.806,66',
      comisionAdm: '910.000,00',
      comisionCompromiso: '1.049.831,71',
      intereses: '4.084.781,81',
      servicioPagoCuentaUsd: '(436,32)'
    },
    2022: {
      amortizacion: '19.938.786,04',
      comisionCompromiso: '899.075,06',
      intereses: '10.070.320,64'
    },
    2023: {
      amortizacion: '34.066.404,77',
      comisionAdm: '939.720,35',
      comisionCompromiso: '1.077.216,77',
      intereses: '25.929.394,17'
    },
    2024: {
      amortizacion: '51.067.883,27',
      comisionAdm: '910.000,00',
      comisionCompromiso: '2.688.162,16',
      intereses: '31.529.323,29'
    },
    2025: {
      amortizacion: '57.772.815,48',
      comisionAdm: '292.500,00',
      comisionCompromiso: '1.151.172,78',
      intereses: '30.591.009,40'
    }
  },
  URUGUAY: {
    2015: {
      comisionCompromiso: '98.518,93',
      intereses: '1.985.142,49'
    },
    2016: {
      comisionAdm: '437.500,00',
      comisionCompromiso: '147.536,15',
      intereses: '2.945.909,60'
    },
    2017: {
      amortizacion: '6.696.558,70',
      comisionAdm: '427.000,00',
      comisionCompromiso: '315.917,24',
      intereses: '4.914.310,53',
      mora: '1,03',
      servicioPagoCuentaUsd: '50,00'
    },
    2018: {
      amortizacion: '7.020.229,42',
      comisionCompromiso: '194.407,28',
      intereses: '7.359.652,02',
      servicioPagoCuentaUsd: '(50,00)'
    },
    2019: {
      amortizacion: '23.499.396,08',
      comisionAdm: '363.210,00',
      comisionCompromiso: '106.484,89',
      intereses: '8.719.437,93',
      servicioPagoCuentaUsd: '(150,00)'
    },
    2020: {
      amortizacion: '27.571.283,02',
      comisionAdm: '375.000,00',
      comisionCompromiso: '416.378,45',
      intereses: '6.538.224,76',
      servicioPagoCuentaUsd: '158,50'
    },
    2021: {
      amortizacion: '13.926.546,17',
      comisionAdm: '90.000,00',
      comisionCompromiso: '360.333,55',
      intereses: '5.700.004,67',
      servicioPagoCuentaUsd: '(8,50)'
    },
    2022: {
      amortizacion: '14.908.086,41',
      comisionCompromiso: '72.026,84',
      intereses: '7.991.439,20',
      comisionGestion: '75.000,00'
    },
    2023: {
      amortizacion: '23.175.174,63',
      comisionAdm: '260.000,00',
      comisionCompromiso: '6.177,53',
      intereses: '20.566.829,36'
    },
    2024: {
      amortizacion: '45.114.526,08',
      comisionAdm: '1.591.740,00',
      comisionCompromiso: '149.757,48',
      intereses: '33.001.657,97'
    },
    2025: {
      amortizacion: '29.982.533,26',
      comisionCompromiso: '278.027,15',
      intereses: '40.331.072,85'
    }
  }
};

const flujosPaisNoSobComponentesOverrides: Partial<Record<FlujosPaisCountryBase, Record<number, FlujosServicioComponentesRaw>>> = {
  BOLIVIA: {
    2023: {
      amortizacion: '57.655,00',
      comisionCompromiso: '1.380,00',
      intereses: '57.802,00'
    }
  },
  BRASIL: {
    2023: {
      amortizacion: '5.594.229,00',
      comisionAdm: '521.438,00',
      comisionCompromiso: '414.193,00',
      intereses: '5.480.433,00'
    },
    2024: {
      amortizacion: '13.013.466,00',
      comisionAdm: '589.959,00',
      comisionCompromiso: '555.404,00',
      intereses: '9.833.769,00'
    },
    2025: {
      amortizacion: '3.896.340,00',
      comisionAdm: '135.111,00',
      comisionCompromiso: '248.678,00',
      intereses: '3.655.821,00',
      mora: '1.223,00'
    }
  },
  PARAGUAY: {
    2023: {
      amortizacion: '5.072.849,00',
      comisionAdm: '139.934,00',
      comisionCompromiso: '160.409,00',
      intereses: '3.861.161,00'
    },
    2024: {
      amortizacion: '3.706.555,00',
      comisionAdm: '66.049,00',
      comisionCompromiso: '195.109,00',
      intereses: '2.288.428,00'
    }
  },
  URUGUAY: {
    2022: {
      amortizacion: '4.432.103,00',
      comisionCompromiso: '21.413,00',
      comisionGestion: '22.297,00',
      intereses: '2.375.817,00'
    },
    2023: {
      amortizacion: '4.846.425,00',
      comisionAdm: '54.372,00',
      comisionCompromiso: '1.292,00',
      intereses: '4.300.964,00'
    }
  }
};

const buildFlujosPaisCountryRows = (country: FlujosPaisCountryBase, tipo: FlujosPaisTipo): FlujosPaisRow[] =>
  flujosPaisYears.map((year) => {
    const source =
      tipo === 'SOB'
        ? flujosPaisSobRaw[country][year]
        : flujosPaisNoSobOverrides[country]?.[year] ?? { desembolsos: '-', flujoNeto: '-' };
    const componentesRaw =
      tipo === 'SOB'
        ? flujosPaisSobComponentesRaw[country][year]
        : flujosPaisNoSobComponentesOverrides[country]?.[year];
    const componentes = buildFlujosComponentes(componentesRaw);
    const desembolsos = toUsdMillions(parseLocalizedAmount(source?.desembolsos ?? '-'));
    const flujoNeto = toUsdMillions(parseLocalizedAmount(source?.flujoNeto ?? '-'));
    const servicioTotal = Math.round(sumFlujosComponentes(componentes) * 1000) / 1000;
    return {
      year: String(year),
      desembolsos,
      servicioTotal,
      flujoNeto,
      componentes
    };
  });

const buildFlujosPaisDataByTipo = (tipo: FlujosPaisTipo): Record<FlujosPaisCountry, FlujosPaisRow[]> => {
  const countriesForGeneral = flujosPaisCountryOrder.filter(
    (country): country is FlujosPaisCountryBase => country !== 'GENERAL'
  );
  const byCountryBase = Object.fromEntries(
    countriesForGeneral.map((country) => [country, buildFlujosPaisCountryRows(country, tipo)])
  ) as Record<FlujosPaisCountryBase, FlujosPaisRow[]>;

  const generalRows = flujosPaisYears.map((year) => {
    const yearLabel = String(year);
    const values = countriesForGeneral.map((country) => {
      return byCountryBase[country].find((row) => row.year === yearLabel) ?? {
        year: yearLabel,
        desembolsos: 0,
        servicioTotal: 0,
        flujoNeto: 0,
        componentes: {
          amortizacion: 0,
          aporteVoluntario: 0,
          comisionAdm: 0,
          comisionCompromiso: 0,
          compensacionReservaCredito: 0,
          comisionGestion: 0,
          servicioPagoCuentaUsd: 0,
          intereses: 0,
          interesesFocom: 0,
          interesesLineaVerde: 0,
          mora: 0
        }
      };
    });

    const sum = (selector: (row: FlujosPaisRow) => number) =>
      Math.round(values.reduce((acc, row) => acc + selector(row), 0) * 1000) / 1000;

    const componentes = {
      amortizacion: sum((row) => row.componentes.amortizacion),
      aporteVoluntario: sum((row) => row.componentes.aporteVoluntario),
      comisionAdm: sum((row) => row.componentes.comisionAdm),
      comisionCompromiso: sum((row) => row.componentes.comisionCompromiso),
      compensacionReservaCredito: sum((row) => row.componentes.compensacionReservaCredito),
      comisionGestion: sum((row) => row.componentes.comisionGestion),
      servicioPagoCuentaUsd: sum((row) => row.componentes.servicioPagoCuentaUsd),
      intereses: sum((row) => row.componentes.intereses),
      interesesFocom: sum((row) => row.componentes.interesesFocom),
      interesesLineaVerde: sum((row) => row.componentes.interesesLineaVerde),
      mora: sum((row) => row.componentes.mora)
    };

    return {
      year: yearLabel,
      desembolsos: sum((row) => row.desembolsos),
      servicioTotal: Math.round(sumFlujosComponentes(componentes) * 1000) / 1000,
      flujoNeto: sum((row) => row.flujoNeto),
      componentes
    };
  });

  return {
    ...byCountryBase,
    GENERAL: generalRows
  };
};

const flujosPaisDataByTipo: Record<FlujosPaisTipo, Record<FlujosPaisCountry, FlujosPaisRow[]>> = {
  SOB: buildFlujosPaisDataByTipo('SOB'),
  NO_SOB: buildFlujosPaisDataByTipo('NO_SOB')
};

const buildFlujosPaisChart = (country: FlujosPaisCountry, tipo: FlujosPaisTipo): LineChartConfig => {
  const rows = flujosPaisDataByTipo[tipo][country];
  const round3 = (value: number) => Math.round(value * 1000) / 1000;
  const xTickValues = rows.map((row) => row.year);
  const flujoNetoValues = rows.map((row) => round3(row.flujoNeto));
  const servicioNetoNegativoValues = rows.map((row) => round3(-row.servicioTotal));
  const maxPositive = Math.max(
    0,
    ...rows.map((row) => row.desembolsos),
    ...flujoNetoValues
  );
  const minNegative = Math.min(0, ...servicioNetoNegativoValues, ...flujoNetoValues);
  const buildTickValues = (minValue: number, maxValue: number) => {
    const span = Math.max(1, maxValue - minValue);
    const targetTicks = 5;
    const roughStep = span / targetTicks;
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(roughStep) || 1)));
    const multipliers = [1, 2, 2.5, 5, 10];
    const step =
      (multipliers.find((multiplier) => roughStep <= multiplier * magnitude) ?? 10) *
      magnitude;
    const start = Math.floor(minValue / step) * step;
    const end = Math.ceil(maxValue / step) * step;
    const ticks: number[] = [];
    for (let current = start; current <= end + step * 0.5; current += step) {
      ticks.push(round3(current));
    }
    if (!ticks.some((tick) => Math.abs(tick) < 0.0001)) {
      ticks.push(0);
      ticks.sort((a, b) => a - b);
    }
    return ticks;
  };
  const yTickValues = Array.from(new Set(buildTickValues(minNegative, maxPositive).map((tick) => Math.round(tick)))).sort(
    (a, b) => a - b
  );

  return {
    type: 'line',
    title: flujosPaisLabelByCountry[country],
    subtitle: '',
    unit: 'USD mm',
    xAxis: 'category',
    sortByX: false,
    xTickValues,
    xTickFormatter: formatFlujosYearShort,
    tooltipMode: 'shared-x',
    showLegend: false,
    showPoints: true,
    showTooltip: true,
    valueFormat: 'one-decimal',
    yMin: minNegative === 0 ? undefined : round3(minNegative * 1.12),
    yTickValues,
    yTickFormatter: formatFlujosAxisNoDecimals,
    barAxis: 'left',
    barLayout: 'mixed',
    categoryPadding: 0.32,
    categoryBarWidthRatio: 0.78,
    barUnit: 'USD mm',
    barValueFormat: 'one-decimal',
    barTooltipSkipZero: true,
    barOpacity: 1,
    showBarLabels: false,
    barSeries: [
      { id: 'desembolsos', label: 'Desembolsos', color: '#E3120B', stackGroup: 'desembolsos' },
      { id: 'amortizacion', label: 'Amortización', color: '#64748B', stackGroup: 'servicio' },
      { id: 'intereses', label: 'Intereses', color: '#38BDF8', stackGroup: 'servicio' },
      { id: 'comisiones', label: 'Comisiones', color: '#8B5CF6', stackGroup: 'servicio' },
      {
        id: 'compensacion_reserva_credito',
        label: 'Compensación Reserva Crédito',
        color: '#F97316',
        stackGroup: 'servicio'
      },
      { id: 'aporte_voluntario', label: 'Aporte Voluntario', color: '#14B8A6', stackGroup: 'servicio' },
      { id: 'mora', label: 'Mora', color: '#F59E0B', stackGroup: 'servicio' },
      {
        id: 'servicio_pago_cuenta_usd',
        label: 'Pago a Cuenta',
        color: '#F97316',
        stackGroup: 'servicio'
      }
    ],
    barData: rows.map((row) => ({
      date: row.year,
      values: {
        desembolsos: row.desembolsos,
        amortizacion: -row.componentes.amortizacion,
        intereses: -(row.componentes.intereses + row.componentes.interesesFocom + row.componentes.interesesLineaVerde),
        comisiones: -(row.componentes.comisionAdm + row.componentes.comisionCompromiso + row.componentes.comisionGestion),
        compensacion_reserva_credito: -row.componentes.compensacionReservaCredito,
        aporte_voluntario: -row.componentes.aporteVoluntario,
        mora: -row.componentes.mora,
        servicio_pago_cuenta_usd: -row.componentes.servicioPagoCuentaUsd
      }
    })),
    series: [
      {
        id: 'flujo_neto',
        label: 'Flujo neto',
        color: '#111827',
        lineWidth: 2.6,
        values: rows.map((row, index) => ({
          date: row.year,
          value: flujoNetoValues[index] ?? 0
        }))
      }
    ]
  };
};

const flujosPaisSobChartsByCountry: Record<FlujosPaisCountry, LineChartConfig> = {
  ARGENTINA: buildFlujosPaisChart('ARGENTINA', 'SOB'),
  BOLIVIA: buildFlujosPaisChart('BOLIVIA', 'SOB'),
  BRASIL: buildFlujosPaisChart('BRASIL', 'SOB'),
  GENERAL: buildFlujosPaisChart('GENERAL', 'SOB'),
  PARAGUAY: buildFlujosPaisChart('PARAGUAY', 'SOB'),
  URUGUAY: buildFlujosPaisChart('URUGUAY', 'SOB')
};

const flujosPaisNoSobChartsByCountry: Record<FlujosPaisCountry, LineChartConfig> = {
  ARGENTINA: buildFlujosPaisChart('ARGENTINA', 'NO_SOB'),
  BOLIVIA: buildFlujosPaisChart('BOLIVIA', 'NO_SOB'),
  BRASIL: buildFlujosPaisChart('BRASIL', 'NO_SOB'),
  GENERAL: buildFlujosPaisChart('GENERAL', 'NO_SOB'),
  PARAGUAY: buildFlujosPaisChart('PARAGUAY', 'NO_SOB'),
  URUGUAY: buildFlujosPaisChart('URUGUAY', 'NO_SOB')
};

const monthNamesEs = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'] as const;

const buildMonthlyTimeline = (startYear: number, startMonth: number, endYear: number, endMonth: number) => {
  const labels: Array<{ key: string; label: string }> = [];
  let cursorYear = startYear;
  let cursorMonth = startMonth;

  while (cursorYear < endYear || (cursorYear === endYear && cursorMonth <= endMonth)) {
    const key = `${cursorYear}-${String(cursorMonth).padStart(2, '0')}`;
    const label = `${monthNamesEs[cursorMonth - 1]}-${String(cursorYear).slice(-2)}`;
    labels.push({ key, label });

    cursorMonth += 1;
    if (cursorMonth > 12) {
      cursorMonth = 1;
      cursorYear += 1;
    }
  }

  return labels;
};

const coyunturaFundRateByMonth: Record<string, number> = {
  '2020-01': 1.55,
  '2020-02': 1.58,
  '2020-03': 0.66,
  '2020-04': 0.0,
  '2020-05': 0.0,
  '2020-06': 0.0,
  '2020-07': 0.0,
  '2020-08': 0.0,
  '2020-09': 0.0,
  '2020-10': 0.0,
  '2020-11': 0.0,
  '2020-12': 0.0,
  '2021-01': 0.0,
  '2021-02': 0.0,
  '2021-03': 0.0,
  '2021-04': 0.0,
  '2021-05': 0.0,
  '2021-06': 0.0,
  '2021-07': 0.0,
  '2021-08': 0.0,
  '2021-09': 0.0,
  '2021-10': 0.0,
  '2021-11': 0.0,
  '2021-12': 0.0,
  '2022-01': 0.0,
  '2022-02': 0.0,
  '2022-03': 0.16,
  '2022-04': 0.33,
  '2022-05': 0.77,
  '2022-06': 1.19,
  '2022-07': 1.63,
  '2022-08': 2.33,
  '2022-09': 2.63,
  '2022-10': 3.08,
  '2022-11': 3.78,
  '2022-12': 4.1,
  '2023-01': 4.33,
  '2023-02': 4.57,
  '2023-03': 4.65,
  '2023-04': 4.83,
  '2023-05': 5.06,
  '2023-06': 5.08,
  '2023-07': 5.12,
  '2023-08': 5.33,
  '2023-09': 5.33,
  '2023-10': 5.33,
  '2023-11': 5.33,
  '2023-12': 5.33,
  '2024-01': 5.33,
  '2024-02': 5.33,
  '2024-03': 5.33,
  '2024-04': 5.33,
  '2024-05': 5.33,
  '2024-06': 5.33,
  '2024-07': 5.33,
  '2024-08': 5.33,
  '2024-09': 5.13,
  '2024-10': 4.83,
  '2024-11': 4.64,
  '2024-12': 4.48,
  '2025-01': 4.33,
  '2025-02': 4.33,
  '2025-03': 4.33,
  '2025-04': 4.33,
  '2025-05': 4.33,
  '2025-06': 4.33,
  '2025-07': 4.33,
  '2025-08': 4.33,
  '2025-09': 4.23,
  '2025-10': 4.08
};

const coyunturaExpectativasByMonth: Record<string, number> = {
  '2025-10': 3.875,
  '2025-11': 3.875,
  '2025-12': 3.7,
  '2026-01': 3.625,
  '2026-02': 3.625,
  '2026-03': 3.625,
  '2026-04': 3.61,
  '2026-05': 3.375,
  '2026-06': 3.375,
  '2026-07': 3.375,
  '2026-08': 3.375,
  '2026-09': 3.25,
  '2026-10': 3.125,
  '2026-11': 3.125,
  '2026-12': 3.125
};

const coyunturaTasaInteresTimeline = buildMonthlyTimeline(2020, 1, 2026, 12);
const coyunturaTasaInteresTickValues = coyunturaTasaInteresTimeline
  .filter((_, index) => index % 6 === 0 || index === coyunturaTasaInteresTimeline.length - 1)
  .map((item) => item.label);
const coyunturaFundRateSeries = coyunturaTasaInteresTimeline
  .filter((item) => typeof coyunturaFundRateByMonth[item.key] === 'number')
  .map((item) => ({
    date: item.label,
    value: coyunturaFundRateByMonth[item.key] as number
  }));
const coyunturaExpectativasSeries = coyunturaTasaInteresTimeline
  .filter((item) => typeof coyunturaExpectativasByMonth[item.key] === 'number')
  .map((item) => ({
    date: item.label,
    value: coyunturaExpectativasByMonth[item.key] as number
  }));

const coyunturaTasaInteresChart: LineChartConfig = {
  type: 'line',
  title: 'Tasa de interés de referencia (%)',
  subtitle: '',
  unit: '%',
  valueFormat: 'three-decimal',
  xAxis: 'category',
  sortByX: false,
  xTickValues: coyunturaTasaInteresTickValues,
  tooltipMode: 'shared-x',
  showLegend: true,
  showTooltip: true,
  showPoints: false,
  showMonthlyAverageInTooltip: true,
  monthlyAverageTooltipLabel: 'Promedio del mes',
  annotations: [
    {
      date: 'jun-26',
      label: '25 Pbs',
      seriesId: 'expectativas',
      direction: 'down',
      color: '#6c757d',
      yOffset: -34
    },
    {
      date: 'sept-26',
      label: '25 Pbs',
      seriesId: 'expectativas',
      direction: 'down',
      color: '#6c757d',
      yOffset: -34
    }
  ],
  series: [
    {
      id: 'fund-rate',
      label: 'Fund Rate',
      color: '#E3120B',
      values: coyunturaFundRateSeries
    },
    {
      id: 'expectativas',
      label: 'Expectativas',
      color: '#adb5bd',
      projectedFromLabel: coyunturaExpectativasSeries[1]?.date,
      projectedDasharray: '5 4',
      values: coyunturaExpectativasSeries
    }
  ]
};

const projection2026Footnote =
  'Supuestos de proyección 2026: Aprobaciones por USD 750 M (objetivo DPP) y desembolsos por USD 550 M, conforme a la última proyección de VPO. Las aprobaciones se incorporan íntegramente a la cartera por desembolsar. Se asume ausencia de nuevas aprobaciones en el primer trimestre; por lo tanto, el monto anual se distribuye proporcionalmente en los tres trimestres restantes de 2026.';

const baseSlides: SlideDefinition[] = [
  {
    id: 'home',
    type: 'home',
    heroTitle: 'Comité de Finanzas',
    heroSubtitle: 'Jueves 19 de febrero',
    meta: 'Información al 31 de dic. de 2025',
    body: 'FONPLATA BANCO DE DESARROLLO'
  },
  {
    id: 'section-monitoreo-politica-financiera',
    type: 'section-title',
    title: 'Monitoreo de Riesgos y Política Financiera'
  },
  {
    id: 'section-cartera',
    type: 'section-title',
    title: 'Cartera'
  },
  {
    id: 'cartera-estado-pais',
    type: 'chart-grid',
    eyebrow: '',
    title: 'Cartera de Préstamos: Evolución y Proyecciones',
    description: 'USD MILLONES',
    footnote: projection2026Footnote,
    charts: countryStackedCharts
  },
  {
    id: 'proporciones-por-pais',
    type: 'donut-matrix',
    eyebrow: '',
    title: 'Cartera de Préstamos - País y Categorías',
    description: '',
    footnote: projection2026Footnote
  },
  {
    id: 'capacidad-prestable-riesgo',
    type: 'risk-capacity',
    eyebrow: '',
    title: 'Uso de la Capacidad Prestable por País',
    description: 'USD MILLONES',
    footnote: projection2026Footnote
  },
  {
    id: 'vigencia-activacion',
    type: 'vigencia-activacion',
    eyebrow: '',
    title: 'Proyección de Cartera: Operaciones Aprobadas No Vigentes y Etapas Pendientes de Activación',
    description: '',
    activationStages: [
      { country: 'ARGENTINA', code: 'ARG-65/2025 II', name: 'AGUA POTABLE MENDOZA', amount: 25_000_000 },
      { country: 'ARGENTINA', code: 'ARG-65/2025 III', name: 'AGUA POTABLE MENDOZA', amount: 25_000_000 },
      { country: 'BOLIVIA', code: 'BOL-38/2024 II', name: 'GENERACION EMPLEO IV', amount: 50_000_000 },
      {
        country: 'BOLIVIA',
        code: 'BOL-39/2024 II',
        name: 'INFRAESTRUCTURA COMPLEMENTARIA',
        amount: 25_000_000
      },
      { country: 'PARAGUAY', code: 'PAR-27/2019 II', name: 'YPEJHÚ', amount: 90_000_000 },
      { country: 'PARAGUAY', code: 'PAR-28/2020 II', name: 'BIOCEANICO', amount: 110_000_000 },
      { country: 'PARAGUAY', code: 'PAR-28/2020 III', name: 'BIOCEANICO', amount: 110_000_000 },
      {
        country: 'URUGUAY',
        code: 'URU-25/2024 II',
        name: 'UNIVERSALIZACIÓN DEL SANEAMIENTO',
        amount: 120_000_000
      },
      {
        country: 'URUGUAY',
        code: 'URU-25/2024 III',
        name: 'UNIVERSALIZACIÓN DEL SANEAMIENTO',
        amount: 125_000_000
      },
      {
        country: 'URUGUAY',
        code: 'URU-25/2024 IV',
        name: 'UNIVERSALIZACIÓN DEL SANEAMIENTO',
        amount: 20_000_000
      },
      { country: 'URUGUAY', code: 'URU-26/2024 II', name: 'CAJA BANCARIA', amount: 25_000_000 },
      { country: 'URUGUAY', code: 'URU-27/2024 II', name: 'SANEAMIENTO MALDONADO', amount: 22_540_000 },
      { country: 'URUGUAY', code: 'URU-27/2024 III', name: 'SANEAMIENTO MALDONADO', amount: 14_410_000 },
      { country: 'URUGUAY', code: 'URU-27/2024 IV', name: 'SANEAMIENTO MALDONADO', amount: 5_090_000 }
    ],
    approvedNotVigent: [
      { country: 'ARGENTINA', code: 'ARG-064#1', name: 'BIOCEANICO SALTA', amount: 35_000_000 },
      { country: 'ARGENTINA', code: 'ARG-066#1', name: 'INFRAESTRUCTURA PRIORITARIA CHACO', amount: 30_000_000 },
      { country: 'BOLIVIA', code: 'BOL-038#1', name: 'GENERACION EMPLEO IV', amount: 50_000_000 },
      { country: 'BRASIL', code: 'BRA-041#1', name: 'FLORIANOPOLIS', amount: 50_000_000 },
      { country: 'BRASIL', code: 'BRA-045#1', name: 'ITAPEVI', amount: 28_800_000 },
      { country: 'BRASIL', code: 'BRA-047#1', name: 'PRODESAN PARA LAGOS - COSANPA', amount: 50_000_000 },
      { country: 'BRASIL', code: 'BRA-050#1', name: 'MOVILIDAD Y DRENAJE PROMOD', amount: 50_000_000 },
      { country: 'BRASIL', code: 'BRA-051#1', name: 'PETROLINA', amount: 20_000_000 }
    ]
  },
  {
    id: 'section-inversiones',
    type: 'section-title',
    title: 'Inversiones'
  },
  {
    id: 'cartera-inversiones-fonplata',
    type: 'investment-portfolio',
    eyebrow: 'Cartera de inversiones',
    title: 'Cartera de Inversiones FONPLATA',
    description: '',
    highlights: [
      'Metodología time-weighted: muestra el rendimiento obtenido por cada dólar invertido al inicio del período de evaluación.',
      'Tasas efectivas del período: no están anualizadas.',
      'Base del índice: 100 = 01/enero/2025.',
      'Benchmark Bloomberg: U.S. Treasury Bills 1-3 meses (60%) y Bloomberg CUST US SSA 1-2 años (40%).'
    ],
    assetClasses: investmentPortfolioAssetClasses,
    maturityProfile: investmentPortfolioMaturityProfile,
    table: {
      title: 'Evolución Trimestral de Métricas',
      columns: [
        'jun-22',
        'sept-22',
        'dic-22',
        'mar-23',
        'jun-23',
        'sept-23',
        'dic-23',
        'mar-24',
        'jun-24',
        'sept-24',
        'dic-24',
        'mar-25',
        'jun-25',
        'sept-25',
        'dic-25'
      ],
      rows: [
        {
          metric: 'AUM (mm)',
          values: [
            '506',
            '465',
            '536',
            '694',
            '671',
            '723',
            '494',
            '494',
            '718',
            '667',
            '743',
            '927',
            '1.292',
            '1.404',
            '1.447'
          ]
        },
        {
          metric: 'Rend. Mensual',
          values: [
            '-0,05%',
            '0,20%',
            '0,34%',
            '0,56%',
            '0,26%',
            '0,23%',
            '0,67%',
            '0,44%',
            '0,46%',
            '0,63%',
            '0,44%',
            '0,37%',
            '0,55%',
            '0,27%',
            '0,27%'
          ]
        },
        {
          metric: 'Rend. YTD',
          values: [
            '1,00%',
            '1,00%',
            '1,08%',
            '1,13%',
            '1,96%',
            '3,06%',
            '4,64%',
            '1,06%',
            '2,61%',
            '4,56%',
            '5,22%',
            '1,24%',
            '2,49%',
            '3,62%',
            '4,72%'
          ]
        },
        {
          metric: 'Rend. Benchmark YTD',
          values: [
            '0,99%',
            '0,99%',
            '1,00%',
            '1,27%',
            '1,88%',
            '3,08%',
            '4,89%',
            '1,02%',
            '2,28%',
            '4,16%',
            '5,03%',
            '1,22%',
            '2,33%',
            '3,45%',
            '4,55%'
          ]
        },
        {
          metric: 'SOFR Promedio 12 m.',
          values: [
            '',
            '',
            '1,64%',
            '',
            '',
            '',
            '5,01%',
            '',
            '',
            '',
            '5,15%',
            '',
            '',
            '',
            '4,24%'
          ]
        },
        {
          metric: 'Calificación Promedio',
          values: [
            'AA',
            'AA+',
            'AA+',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA'
          ]
        },
        {
          metric: 'Duración Portafolio',
          values: [
            '0,37',
            '0,35',
            '0,37',
            '0,41',
            '0,46',
            '0,54',
            '0,83',
            '0,83',
            '0,49',
            '0,98',
            '0,63',
            '0,52',
            '1,04',
            '1,40',
            '1,44'
          ]
        },
        {
          metric: 'Duración Bonos',
          values: [
            '0,52',
            '0,01',
            '0,59',
            '0,59',
            '0,74',
            '1,07',
            '1,18',
            '1,16',
            '1,17',
            '1,42',
            '1,00',
            '1,06',
            '1,81',
            '1,90',
            '1,84'
          ]
        },
        {
          metric: 'Duración Benchmark',
          values: [
            '0,67',
            '0,67',
            '0,66',
            '0,69',
            '0,69',
            '0,68',
            '0,64',
            '0,65',
            '0,66',
            '0,67',
            '0,61',
            '0,64',
            '0,68',
            '0,68',
            '0,65'
          ]
        }
      ]
    }
  },
  {
    id: 'slide-7',
    type: 'liquidity-activity',
    eyebrow: 'Cartera de liquidez',
    title: 'Actividad del Trimestre',
    highlights: [
      'Portafolio de liquidez (31/12/2025): USD 1.447 mm.',
      'Transacciones totales: 11 + 10 constituciones BIS. Rollover de USD 207,5 mm y USD 48,2 mm adicionales en BIS. TEA ponderada: 3,78%.',
      'Bonos: 5 compras por USD 33 mm. Ticket promedio: USD 6,6 mm. TIR ponderada: 3,73%.',
      'ETF: 1 transacción por USD 4,4 mm (100.000,00 acciones INVESCO US TRES 1-3 YR ACC).',
      'Money market: 5 depósitos por USD 170 mm. TIR ponderada: 4,02%.',
      'BIS: 10 constituciones. Promedio: USD 81,5 mm. TEA: 3,59%.'
    ],
    considerations: [
      'Cifras en millones de dólares a valor de mercado.',
      'La calificación incluye saldos en depósitos a la vista.',
      "Se utiliza la menor calificación entre Moody's y S&P; sin calificación, se usa la del emisor.",
      'EE. UU. incluye notas y letras del tesoro y la posición de US Treasuries ETF.'
    ],
    donutGallery: {
      title: 'Composición del portafolio',
      subtitle: '',
      items: [
        {
          id: 'calificacion',
          title: 'Calificación',
          data: [
            { id: 'aaa', label: 'AAA', value: 48, color: '#141F52' },
            { id: 'aa', label: 'AA+/AA/AA-', value: 27, color: '#E3120B' },
            { id: 'a', label: 'A+/A/A-', value: 20, color: '#F97A1F' },
            { id: 'bbb', label: 'BBB+/BBB/BBB-', value: 5, color: '#F9C31F' }
          ]
        },
        {
          id: 'sector',
          title: 'Sector',
          data: [
            { id: 'soberano', label: 'Soberano', value: 40, color: '#141F52' },
            { id: 'multilateral', label: 'Multilateral', value: 40, color: '#E3120B' },
            { id: 'financiero', label: 'Financiero', value: 20, color: '#F97A1F' }
          ]
        },
        {
          id: 'region',
          title: 'Región',
          data: [
            { id: 'europa', label: 'Europa', value: 36, color: '#141F52' },
            { id: 'asia', label: 'Asia', value: 10, color: '#E3120B' },
            { id: 'usa-canada', label: 'USA & Canadá', value: 9, color: '#F97A1F' },
            { id: 'latam', label: 'LatAm', value: 5, color: '#F9C31F' },
            { id: 'multilateral', label: 'Multilateral', value: 40, color: '#E1DFD0' }
          ]
        }
      ]
    },
    table: {
      title: 'Posiciones de liquidez por Instrumentos',
      columns: [
        'Ticker',
        'Región',
        'Sector',
        'Calificación',
        'Posición (USD mm nominal)',
        '% liquidez'
      ],
      rows: [
        {
          ticker: 'IBRD',
          region: 'Multilateral',
          sector: 'Multilateral',
          rating: 'AAA',
          position: '110',
          liquidity: '8,0%'
        },
        {
          ticker: 'KFW',
          region: 'Multilateral',
          sector: 'Multilateral',
          rating: 'AAA',
          position: '105',
          liquidity: '8,0%'
        },
        {
          ticker: 'AFDB',
          region: 'Multilateral',
          sector: 'Multilateral',
          rating: 'AAA',
          position: '83',
          liquidity: '6,0%'
        },
        {
          ticker: 'BLADEX',
          region: 'LatAm',
          sector: 'Financiero',
          rating: 'BBB',
          position: '65',
          liquidity: '5,0%'
        },
        {
          ticker: 'CABEI',
          region: 'Multilateral',
          sector: 'Multilateral',
          rating: 'AA-',
          position: '61',
          liquidity: '4,0%'
        },
        {
          ticker: 'Total',
          region: '',
          sector: '',
          rating: '',
          position: '424',
          liquidity: '30,0%',
          isTotal: true
        }
      ]
    }
  },
  {
    id: 'cartera-inversiones-focem',
    type: 'investment-portfolio',
    eyebrow: 'Cartera de inversiones',
    title: 'Cartera de Inversiones FOCEM',
    description: 'Resumen de composición, vencimientos y desempeño histórico del portafolio.',
    highlights: [
      'Portafolio 31/Dic./2025: VM USD 106.416.058,05.',
      'Comisiones (devengadas) 2025: USD 528.216,73.',
      'Desembolsos realizados (2020-2025): USD 7.000.000,00 - 12/Dic./2022.',
      'Transacciones totales (2025): 48 transacciones; 37 en el mercado de dinero, depósitos y papel comercial, y 11 en el mercado de capitales y títulos valores.'
    ],
    assetChartFormat: 'percent',
    assetChartShowCenter: false,
    assetClasses: [
      {
        id: 'bonos',
        label: 'Bonos',
        value: 80,
        color: '#141F52'
      },
      {
        id: 'depositos-plazo',
        label: 'Depósitos a plazo',
        value: 20,
        color: '#E3120B'
      }
    ],
    maturityProfile: {
      type: 'bar',
      title: 'Perfil de vencimientos nominal',
      subtitle: 'USD mill.',
      unit: 'MM',
      tickEvery: 2,
      showValueLabels: true,
      showValueLabelUnit: false,
      valueLabelFontSize: '0.62rem',
      data: [
        { label: 'ene26', value: 19, color: 'var(--accent)' },
        { label: 'feb26', value: 19, color: 'var(--accent)' },
        { label: 'mar26', value: 7, color: 'var(--accent)' },
        { label: 'abr26', value: 4, color: 'var(--accent)' },
        { label: 'may26', value: 3, color: 'var(--accent)' },
        { label: 'ago26', value: 7, color: 'var(--accent)' },
        { label: 'oct26', value: 4, color: 'var(--accent)' },
        { label: '1Q27', value: 1, color: 'var(--accent)' },
        { label: '2Q27', value: 12, color: 'var(--accent)' },
        { label: '3Q27', value: 2, color: 'var(--accent)' },
        { label: '4Q27', value: 3, color: 'var(--accent)' },
        { label: '1Q28', value: 5, color: 'var(--accent)' },
        { label: '3Q28', value: 8, color: 'var(--accent)' },
        { label: '1Q29', value: 3, color: 'var(--accent)' },
        { label: '2Q30', value: 12, color: 'var(--accent)' }
      ]
    },
    table: {
      title: 'Comportamiento histórico',
      columns: ['dic-20', 'dic-21', 'dic-22', 'dic-23', 'dic-24', 'mar-25', 'jun-25', 'sept-25', 'dic-25'],
      rows: [
        {
          metric: 'AUM (mm)',
          values: ['100,3', '100,4', '94,0', '98,2', '102,0', '103,4', '104,5', '105,4', '106,4']
        },
        {
          metric: 'Rend. Acum. Neto',
          values: ['0,31%', '0,04%', '0,68%', '4,45%', '3,88%', '1,40%', '2,43%', '3,34%', '4,32%']
        },
        {
          metric: 'Rend. Acum. Bruto',
          values: ['0,41%', '0,07%', '0,62%', '4,94%', '4,43%', '1,43%', '2,61%', '3,81%', '4,88%']
        },
        {
          metric: 'SOFR Promedio 12 m.',
          values: ['0,36%', '0,04%', '1,64%', '5,01%', '5,15%', '', '', '', '4,24%']
        },
        {
          metric: 'Calificación Promedio',
          values: ['AA', 'AA', 'AA', 'AA-', 'AA', 'AA', 'AA', 'AA', 'AA']
        },
        {
          metric: 'Duración Portafolio',
          values: ['1,37', '0,66', '0,40', '0,16', '1,09', '0,89', '1,01', '1,35', '1,15']
        },
        {
          metric: 'Duración Benchmark',
          values: ['0,66', '0,67', '0,66', '0,64', '0,61', '0,64', '0,68', '0,68', '0,65']
        }
      ]
    }
  },
  {
    id: 'section-endeudamiento',
    type: 'section-title',
    title: 'Endeudamiento'
  },
  {
    id: 'analisis-tasas',
    type: 'rate-analysis',
    eyebrow: 'Tasas de referencia',
    title: 'Tasas Activas (Cartera): Evolución Reciente',
    description: '',
    highlights: [
      'Riesgo Soberano',
      'Base SOFR: Tendencia decreciente de la SOFR desde septiembre de 2024.',
      'Margen neto: El Margen neto que pagan los países se viene reduciendo desde hace aprox. 2 años',
      'FOCOM: La compensación de tasa muestra una tendencia creciente en los últimos 2 años, pasando de 27 pb en febrero de 2024 a poco más de 40 pbs al cierre del 2025.',
      'Riesgo No Soberano',
      'Base SOFR: Tendencia decreciente de la SOFR desde septiembre de 2024.',
      'Margen neto: El Margen neto tuvo un incremento en escalón al inicio del 2025. El mismo no obedece a un incremento de tasas sino al perfil crediticio de los prestatarios.'
    ],
    highlightEmphasisPrefixes: [
      'Riesgo Soberano',
      'Riesgo No Soberano',
      'Base SOFR:',
      'Margen neto:',
      'FOCOM:'
    ],
    highlightHeadingItems: ['Riesgo Soberano', 'Riesgo No Soberano'],
    charts: [
      { id: 'soberana', label: 'Riesgo soberano', chart: tasaRiesgoSoberanoChart },
      { id: 'no-soberana', label: 'Riesgo no soberano', chart: tasaRiesgoNoSoberanoChart }
    ]
  },
  {
    id: 'analisis-endeudamiento',
    type: 'content',
    eyebrow: 'Endeudamiento',
    title: 'Tasas Pasivas (Endeudamiento): Evolución Reciente',
    description: 'Evolución del saldo de deuda y su ritmo de crecimiento en los últimos cinco cierres anuales.',
    highlights: [
      'Crecimiento sostenido desde 2021.',
      'Desaceleración del incremento en 2025.',
      'Enfoque en refinanciamiento 2026-2027 para estabilizar el costo financiero.'
    ],
    chart: endeudamientoChartQuarterly,
    chartAnnual: endeudamientoChartAnnual,
    chartMarginal: endeudamientoChartQuarterlyMarginal,
    chartAnnualMarginal: endeudamientoChartAnnualMarginal,
    miniChart: endeudamientoPlazoPromedio,
    miniChartAnnual: endeudamientoPlazoPromedioAnnual,
    miniChartMarginal: endeudamientoPlazoPromedioMarginal,
    miniChartAnnualMarginal: endeudamientoPlazoPromedioMarginalAnnual,
    scatterCharts: {
      ifd: debtSourcesScatterIfd,
      mercado: debtSourcesScatterMercado
    }
  },
  {
    id: 'deuda-por-fuente',
    type: 'debt-sources',
    eyebrow: '',
    title: 'Endeudamiento por Instrumento y Tipo de Sector',
    tables: [
      {
        title: 'Instituciones Financieras para el Desarrollo (IFD)',
        columns: [
          { label: 'Instrumento', align: 'left', width: '52%' },
          { label: 'Circulante (USD mm)', align: 'right' },
          { label: 'Disponible (USD mm)', align: 'right' },
          { label: 'Total (USD mm)', align: 'right' },
          { label: 'Spread (pbs)', align: 'right' }
        ],
        rows: [
          { cells: ['AFD 1 - Préstamo (CZZ 2105)', '13,6', '0,0', '13,6', '179,8'] },
          { cells: ['AFD 2 - Préstamo (CZZ 2823)', '33,1', '0,0', '33,1', '123,6'] },
          { cells: ['BEI 1 - Tramo 1 - Línea (86645)', '5,6', '0,0', '5,6', '106,0'] },
          { cells: ['BEI 1 - Tramo 2 - Línea (86645)', '6,0', '0,0', '6,0', '95,0'] },
          { cells: ['BEI 1 - Tramo 3 - Línea (86645)', '10,0', '0,0', '10,0', '87,2'] },
          { cells: ['BEI 1 - Tramo 4 - Línea (86645)', '20,0', '0,0', '20,0', '81,3'] },
          { cells: ['BEI 1 - Tramo 5 - Línea (86645)', '18,0', '0,0', '18,0', '93,1'] },
          { cells: ['BID 1 - Préstamo (4377/OC-RG)', '85,0', '0,0', '85,0', '121,0'] },
          { cells: ['BID 2 - Préstamo (5442/OC-RG)', '100,0', '0,0', '100,0', '121,0'] },
          { cells: ['CAF 3 - Línea Revolvente', '0,0', '25,0', '25,0', '-'] },
          { cells: ['CAF 3 - Tramo 1 - Línea Revolvente', '75,0', '0,0', '75,0', '175,0'] },
          { cells: ['CAF 3 - Tramo 2 - Línea Revolvente', '50,0', '0,0', '50,0', '135,0'] },
          { cells: ['CDP 1', '27,5', '0,0', '27,5', '130,0'] },
          { cells: ['CDP 2', '0,0', '50,0', '50,0', '124,0'] },
          { cells: ['ICO 1 - Tramo 1 - Línea 1', '1,1', '0,0', '1,1', '87,8'] },
          { cells: ['ICO 2 - Tramo 1 - Línea 2', '6,7', '0,0', '6,7', '96,0'] },
          { cells: ['ICO 2 - Tramo 2 - Línea 2', '5,5', '0,0', '5,5', '101,0'] },
          { cells: ['ICO 3 - Línea', '0,0', '7,2', '7,2', '-'] },
          { cells: ['ICO 3.1 - Línea 1', '17,8', '0,0', '17,8', '88,0'] },
          { cells: ['KfW - Préstamo (29876)', '40,1', '0,0', '40,1', '93,8'] },
          { cells: ['Total', '515,0', '82,2', '597,2', '125'], isTotal: true }
        ]
      },
      {
        title: 'Mercado',
        columns: [
          { label: 'Instrumento', align: 'left', width: '60%' },
          { label: 'Monto (USD mm)', align: 'right' },
          { label: 'Spread (pbs)', align: 'right' }
        ],
        rows: [
          { cells: ['BBVA - Facilidad de Crédito 2021', '16,7', '157,8'] },
          { cells: ['BBVA 2 - Facilidad de Crédito 2024', '125,0', '172,4'] },
          { cells: ['CHF 3,5 años – 2027', '158,6', '189,8'] },
          { cells: ['CHF 5 años – 2029', '152,9', '202,9'] },
          { cells: ['CHF 5,5 años – 2026', '222,7', '164,0'] },
          { cells: ['CHF 7 años - 2028', '164,5', '125,2'] },
          { cells: ['JPY 3 años – 2027', '40,2', '166,4'] },
          { cells: ['JPY 5 años - 2028', '22,5', '192,8'] },
          { cells: ['JPY 5 años – 2029/Segunda Emisión', '7,0', '188,4'] },
          { cells: ['JPY 6,5 años – 2029/Primera Emisión', '31,5', '205,5'] },
          { cells: ['USD 3 años – 19/Feb/2028 – MTN 1', '40,0', '130,0'] },
          { cells: ['USD 5 años - 14/Mar/2030 – MTN 2', '40,0', '145,0'] },
          { cells: ['USD 5 años - 21/Mar/2030 – MTN 3', '50,0', '145,0'] },
          { cells: ['USD 5 años - 26/Mar/2030 – MTN 4.1', '30,0', '136,5'] },
          { cells: ['USD 7 años - 26/Mar/2032 – MTN 4.2', '50,0', '145,8'] },
          { cells: ['USD 10 años - 10/Abr/2035 – MTN 5', '50,0', '167,7'] },
          { cells: ['USD 5 años – 19/May/2030 – MTN 6', '50,0', '135,0'] },
          { cells: ['USD 5 años – 21/May/2030 – MTN 7', '100,0', '135,0'] },
          { cells: ['USD 15 años – 05/Ago/2040 – MTN 8.1', '35,0', '178,4'] },
          { cells: ['AUD 15 años – 05/Ago/2040 – MTN 8.2', '25,1', '180,0'] },
          { cells: ['JPY 3 años – 05/Sep/2028 – MTN 9', '20,4', '112,5'] },
          { cells: ['USD 5,5 años - 30/Mar/2031 – MTN 10', '30,0', '130,0'] },
          { cells: ['INR 5,5 años - 25/May/2031 – MTN 11', '101,5', '130,0'] },
          { cells: ['Total', '1.563,6', '159'], isTotal: true }
        ]
      }
    ]
  },
  {
    id: 'perfil-amortizacion',
    type: 'rate-analysis',
    eyebrow: '',
    title: 'Endeudamiento: Evolución y Proyecciones',
    description: 'Evolución de amortización, flujos y stock por fuente.',
    highlights: [
      'Separación entre contratos 2025 y amortización restante.',
      'Flujos proyectados por fuente.',
      'Stock base anual por IFD y Mercado.'
    ],
    charts: [
      { id: 'amortizacion', label: 'Perfil de amortización', chart: perfilAmortizacionChart },
      { id: 'flujos', label: 'Flujos', chart: flujosChart },
      { id: 'stock', label: 'Stock', chart: stockChart }
    ]
  },
  {
    id: 'slide-14',
    type: 'debt-authorization',
    eyebrow: 'Capacidad autorizada',
    title: 'Monitoreo del Endeudamiento',
    description:
      'Distribución del endeudamiento autorizado vs. sin autorizar y evolución del endeudamiento bruto y límite de política.',
    highlights: [
      'El donut superior muestra la proporción autorizada y su desglose.',
      'Las áreas representan endeudamiento bruto y límite de política.',
      'El Envelope Autorizado DEJ se muestra como línea de referencia.'
    ],
    donut: debtAuthorizationDonut,
    chart: debtAuthorizationChart,
    chartExtraTooltip: debtAuthorizationExtraTooltip
  },
  {
    id: 'emisiones-segmentadas-2025',
    type: 'content',
    eyebrow: 'Emisiones · Segmentación',
    title: 'Endeudamiento 2025',
    description:
      'Total emitido por mes. Cada barra está segmentada por tramos (bordes punteados) y coloreada según origen: Mercado (rojo) o IFD (gris).',
    highlights: [
      'Rojo: Mercado · Gris: IFD.',
      'Abril: 50% Mercado / 50% IFD.',
      'Julio, Octubre y Diciembre: 100% IFD.'
    ],
    chart: emisionesSegmentadasChart
  },
  {
    id: 'exposicion-cartera-riesgo',
    type: 'dual-charts',
    eyebrow: 'Riesgo de cartera',
    title: 'Exposición de Cartera al Riesgo',
    description: 'Políticia Financiera: Capacidad prestable',
    infoNote:
      'Los supuestos utilizados para las proyecciones consideran un objetivo de aprobaciones del DPP de USD 750 millones, desembolsos por USD 560 millones y endeudamiento por USD 750 millones.',
    highlights: [
      'Capacidad máxima calculada como (3 x Patrimonio).',
      'Capacidad disponible = Capacidad máxima - Capacidad usada (acotada a cero).',
      'Comparativo directo de capacidad disponible vs. por activar.'
    ],
    charts: [riskExposureUsedVsMaxChart, riskExposureAvailableVsActivarChart]
  },
  {
    id: 'exposicion-cartera-riesgo-cards',
    type: 'line-cards',
    eyebrow: 'Riesgo de cartera',
    title: 'Exposición de Cartera al Riesgo',
    description: '',
    infoNote:
      'Los supuestos utilizados para las proyecciones consideran un objetivo de aprobaciones del DPP de USD 750 millones, desembolsos por USD 560 millones y endeudamiento por USD 750 millones.',
    hideHeader: true,
    layout: 'grid',
    cards: [
      { id: 'capacidad-usada-vs-maxima' },
      { id: 'capacidad-disponible-vs-activar-general' },
      { id: 'capacidad-disponible-vs-activar-paises' }
    ]
  },
  {
    id: 'evolucion-rubros-balance',
    type: 'line-cards',
    eyebrow: '',
    title: 'Cambios en Activos y Pasivos Financieros',
    description: '',
    cards: [
      { id: 'comparativo-activos-pasivos', chart: activosPasivosComparativoChart }
    ]
  },
  {
    id: 'section-contabilidad-presupuestos',
    type: 'section-title',
    title: 'Situación Financiera'
  },
  {
    id: 'balance-activos-financieros',
    type: 'text-table',
    eyebrow: 'Posición financiera',
    title: 'Estado de Situación Patrimonial',
    description: '',
    highlights: [
      'Cartera de préstamos: crecimiento de $208,6 por desembolsos de $430,9 y amortizaciones de $222,3.',
      'Endeudamientos: aumento de $799,8 por captaciones de $718,2 y amortizaciones por $44,4, antes de la pérdida por ajuste a valor razonable de $126,1.',
      'Patrimonio: incremento explicado por cobro de cuotas de capital de Brasil ($8,8) y resultado neto del ejercicio ($95,1).'
    ],
    highlightEmphasisPrefixes: ['Cartera de préstamos:', 'Endeudamientos:', 'Patrimonio:'],
    table: {
      title: 'Comparativo dic-25 vs dic-24 (USD MM)',
      columns: [
        { label: 'Concepto', align: 'left', width: '44%' },
        { label: 'dic-25', align: 'right', width: '18%' },
        { label: 'dic-24', align: 'right', width: '18%' },
        { label: 'Var', align: 'right', width: '20%' }
      ],
      rows: [
        { cells: ['Efectivo en Bancos', '21,8', '28,0', '-22,1%'] },
        { cells: ['Inversiones', '1.433,9', '739,0', '94,0%'] },
        { cells: ['Préstamos por cobrar', '2.590,7', '2.382,0', '8,8%'] },
        {
          cells: ['Total activos financieros', '4.046,4', '3.149,0', '28,5%'],
          className: 'text-table__row-bold'
        },
        { cells: ['Endeudamientos', '(2.187,7)', '(1.387,9)', '57,6%'] },
        {
          cells: ['Activos financieros netos', '1.858,7', '1.761,1', '5,5%'],
          className: 'text-table__row-bold'
        },
        { cells: ['Activos no financieros y otros', '40,5', '28,3', '43,1%'] },
        { cells: ['Pasivos no financieros y otros', '(46,9)', '(39,1)', '19,9%'] },
        {
          cells: ['Patrimonio', '1.852,3', '1.750,2', '5,8%'],
          className: 'text-table__row-bold'
        },
        { cells: ['Capital', '1.329,9', '1.321,1', '0,7%'] },
        { cells: ['Reservas', '427,3', '330,4', '29,3%'] },
        {
          cells: ['Resultado del ejercicio', '95,1', '98,7', '-3,6%'],
          className: 'text-table__row-bold'
        }
      ]
    }
  },
  {
    id: 'adecuacion-del-capital',
    type: 'capital-adequacy',
    eyebrow: '',
    title: 'Adecuación del Capital',
    description: '',
    policyText:
      'FONPLATA mantendrá un límite mínimo de requerimiento de capital consistente con la gestión integral de riesgos de la institución que será del 35% del patrimonio respecto de los activos ajustados por los riesgos financieros y operacionales.',
    chart: {
      type: 'line',
      title: 'Ratio de Adecuación de Capital y Base Patrimonial',
      subtitle: '',
      unit: '%',
      xAxis: 'category',
      sortByX: false,
      xTickFormatter: (label: string) => label.slice(-2),
      yMin: 35,
      yTickFormatter: (value) => `${Math.round(value)}%`,
      valueFormat: 'one-decimal',
      showLegend: false,
      showPoints: true,
      showValueLabels: true,
      valueLabelFontSize: '0.58rem',
      barAxis: 'right',
      barLayout: 'grouped',
      barUnit: 'USD mm',
      barOpacity: 1,
      projectedBarFromLabel: '12/26',
      projectedBarOpacity: 0.34,
      barValueFormat: 'integer',
      fixedTooltipGroupBySeries: false,
      showBarLabels: false,
      series: [
        {
          id: 'ratio_capital',
          label: 'Ratio de Adecuación de Capital',
          color: '#E3120B',
          projectedFromLabel: '12/26',
          projectedDasharray: '6 4',
          valueLabelPosition: 'above',
          values: [
            { date: '12/20', value: 80.19 },
            { date: '12/21', value: 57.71 },
            { date: '12/22', value: 53.14 },
            { date: '12/23', value: 50.76 },
            { date: '12/24', value: 47.43 },
            { date: '12/25', value: 51.05 },
            { date: '12/26', value: 46.68 },
            { date: '12/27', value: 46.07 }
          ]
        }
      ],
      barSeries: [
        { id: 'activos_ajustados', label: 'Activos ajustados por riesgo', color: '#00b4d8' },
        { id: 'patrimonio', label: 'Patrimonio', color: '#adb5bd' }
      ],
      barData: [
        { date: '12/20', values: { activos_ajustados: 1113.397, patrimonio: 1388.467 } },
        { date: '12/21', values: { activos_ajustados: 1205.006, patrimonio: 2088.083 } },
        { date: '12/22', values: { activos_ajustados: 1328.891, patrimonio: 2500.855 } },
        { date: '12/23', values: { activos_ajustados: 1549.55, patrimonio: 3052.712 } },
        { date: '12/24', values: { activos_ajustados: 1750.171, patrimonio: 3690.107 } },
        { date: '12/25', values: { activos_ajustados: 1852.3, patrimonio: 3628.436 } },
        { date: '12/26', values: { activos_ajustados: 1947.974, patrimonio: 4173.473 } },
        { date: '12/27', values: { activos_ajustados: 2134.268, patrimonio: 4632.595 } }
      ]
    },
    table: {
      title: 'Detalle de Activos Ajustados y Suficiencia de Capital (USD mm)',
      columns: [
        { label: 'Concepto (en miles de USD)', align: 'left', width: '22%' },
        { label: 'dic-20', align: 'right' },
        { label: 'Δ', align: 'right' },
        { label: 'dic-21', align: 'right' },
        { label: 'Δ', align: 'right' },
        { label: 'dic-22', align: 'right' },
        { label: 'Δ', align: 'right' },
        { label: 'dic-23', align: 'right' },
        { label: 'Δ', align: 'right' },
        { label: 'dic-24', align: 'right' },
        { label: 'Δ', align: 'right' },
        { label: 'jun-25', align: 'right' },
        { label: 'Δ', align: 'right' },
        { label: 'Sep-25', align: 'right' },
        { label: 'Δ', align: 'right' },
        { label: 'dic-25', align: 'right' },
        { label: 'Δ', align: 'right' },
        { label: 'Dic-26 (e)', align: 'right' },
        { label: 'Δ', align: 'right' },
        { label: 'Dic-27 (e)', align: 'right' },
        { label: 'Δ', align: 'right' }
      ],
      rows: [
        {
          cells: [
            'Activos ajustados por riesgo de crédito',
            '1.370.475',
            '34%',
            '1.992.917',
            '45%',
            '2.391.086',
            '20%',
            '2.864.552',
            '20%',
            '3.405.075',
            '19%',
            '3.436.981',
            '1%',
            '3.424.372',
            '1%',
            '3.235.645',
            '-5%',
            '3.741.285',
            '16%',
            '4.169.940',
            '11%'
          ]
        },
        {
          cells: [
            'Activos ajustados por riesgo operativo',
            '17.992',
            '17%',
            '95.166',
            '429%',
            '109.770',
            '15%',
            '188.161',
            '71%',
            '285.032',
            '51%',
            '343.618',
            '21%',
            '368.839',
            '29%',
            '382.955',
            '34%',
            '421.520',
            '10%',
            '450.530',
            '7%'
          ]
        },
        {
          cells: [
            'Activos ajustados por riesgo de mercado',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '8.799',
            '-.-',
            '9.835',
            '-.-',
            '10.667',
            '8%',
            '12.125',
            '14%'
          ]
        },
        {
          cells: [
            'Activos ajustados',
            '1.388.467',
            '33%',
            '2.088.083',
            '50%',
            '2.500.855',
            '20%',
            '3.052.712',
            '22%',
            '3.690.107',
            '21%',
            '3.780.598',
            '2%',
            '3.802.010',
            '3%',
            '3.628.435',
            '-2%',
            '4.173.473',
            '15%',
            '4.632.595',
            '11%'
          ],
          isTotal: true
        },
        {
          cells: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
        },
        {
          cells: [
            'Patrimonio',
            '1.113.397',
            '8%',
            '1.205.006',
            '8%',
            '1.328.891',
            '10%',
            '1.549.550',
            '17%',
            '1.750.171',
            '13%',
            '1.813.300',
            '4%',
            '1.837.797',
            '5%',
            '1.852.300',
            '6%',
            '1.947.974',
            '5%',
            '2.134.268',
            '10%'
          ]
        },
        {
          cells: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
        },
        {
          cells: [
            'Ratio de Suficiencia de Capital',
            '80,2%',
            '-19%',
            '57,7%',
            '-22%',
            '53,1%',
            '-5%',
            '50,8%',
            '-2%',
            '47,4%',
            '-3%',
            '48,0%',
            '1%',
            '48,3%',
            '1%',
            '51,0%',
            '4%',
            '46,7%',
            '-4%',
            '46,1%',
            '-1%'
          ],
          className: 'capital-adequacy-table__row-ratio'
        }
      ]
    }
  },
  {
    id: 'prevision-perdida-cartera-prestamos',
    type: 'content',
    eyebrow: 'Previsión de cartera',
    title: 'Previsión para Pérdida de Cartera de Préstamos',
    description: 'Evolución anual del ratio de cobertura.',
    highlights: [
      'Se muestra solo el ratio de cobertura.',
      'Serie anual en porcentaje.',
      'Vista simplificada sin barras.'
    ],
    detailTable: {
      title: 'Detalle de cartera, calificación y previsión al 31/12/2025',
      columns: [
        { label: 'Código', align: 'left', width: '40px' },
        { label: 'País', align: 'left', width: '74px' },
        { label: 'Cartera 30/9/25', align: 'right', width: '62px' },
        { label: 'Cartera 31/12/25', align: 'right', width: '66px' },
        { label: 'Variación', align: 'right', width: '48px' },
        { label: "Moody's", align: 'center', width: '46px' },
        { label: 'S&P', align: 'center', width: '40px' },
        { label: 'Fitch', align: 'center', width: '40px' },
        { label: 'Rating c/ PCT', align: 'center', width: '62px' },
        { label: 'Previsión 30/9/25', align: 'right', width: '74px' },
        { label: 'Previsión 31/12/25', align: 'right', width: '76px' },
        { label: 'Variación', align: 'right', width: '48px' },
        { label: 'Previsión c/ USD 1.000', align: 'right', width: '84px' }
      ],
      rows: [
        {
          cells: ['ARG', 'ARGENTINA', '601,0', '598,8', '-2,1', 'Caa1', 'CCC+', 'CCC+', 'B+', '6,25', '6,21', '0,0', '10,4']
        },
        {
          cells: ['BOL', 'BOLIVIA', '445,0', '431,7', '-13,3', 'Ca', 'CCC-', 'CCC-', 'B-', '7,93', '7,76', '-0,2', '18,0']
        },
        {
          cells: ['BRA', 'BRASIL', '330,5', '379,0', '48,5', 'Ba1', 'BB', 'BB', 'BBB', '0,63', '0,73', '0,1', '1,9']
        },
        {
          cells: ['PAR', 'PARAGUAY', '417,1', '455,7', '38,6', 'Baa3', 'BBB-', 'BB+', 'A-', '0,40', '0,14', '-0,3', '0,3']
        },
        {
          cells: ['URU', 'URUGUAY', '585,6', '598,8', '13,2', 'Baa1', 'BBB+', 'BBB', 'A+', '1,87', '1,91', '0,0', '3,2']
        },
        {
          cells: ['SOB', 'SOB', '2.379,2', '2.464,1', '84,9', '', '', '', '', '17,07', '16,75', '-0,3', '6,8'],
          className: 'prevision-summary-table__subtotal'
        },
        {
          cells: ['', '', '', '', '', '', '', '', '', '', '', '', ''],
          className: 'prevision-summary-table__spacer'
        },
        {
          cells: ['BADESUL', 'BADESUL', '30,0', '30,0', '0,0', '', 'BB', '', 'BB+', '0,4', '0,4', '0,0', '13,3']
        },
        {
          cells: ['BDMG', 'BDMG', '34,0', '34,0', '0,0', '', 'BB-', '', 'BB', '0,7', '0,7', '0,0', '19,5']
        },
        {
          cells: ['CASAN', 'CASAN', '55,0', '55,0', '0,0', '', 'B+', '', 'BB-', '1,9', '1,9', '0,0', '35,3']
        },
        {
          cells: ['BNF', 'BNF', '15,0', '7,5', '-7,5', '', 'BB', '', 'BB+', '0,2', '0,1', '-0,1', '13,3']
        },
        {
          cells: ['NS', 'NS', '134,0', '126,5', '-7,5', '', '', '', '', '3,2', '3,1', '-0,1', '24,5'],
          className: 'prevision-summary-table__subtotal'
        },
        {
          cells: ['', '', '', '', '', '', '', '', '', '', '', '', ''],
          className: 'prevision-summary-table__spacer'
        },
        {
          cells: ['TOTAL', 'TOTAL', '2.513,2', '2.590,6', '77,4', '', '', '', '', '20,3', '19,85', '-0,4', '7,7'],
          isTotal: true
        }
      ]
    },
    chart: {
      type: 'line',
      title: 'Ratio de cobertura',
      subtitle: '',
      unit: '%',
      hideYAxis: true,
      xAxis: 'category',
      categoryPadding: 0,
      sortByX: false,
      tooltipMode: 'shared-x',
      showLegend: false,
      showPoints: true,
      showValueLabels: true,
      valueLabelFontSize: '0.7rem',
      showValueLabelUnit: false,
      yMin: 0.7,
      barAxis: 'left',
      showTooltip: true,
      series: [
        {
          id: 'ratio',
          label: 'Ratio de cobertura',
          color: '#c1121f',
          lineWidth: 2.1,
          valueLabelPosition: 'below',
          values: [
            { date: 'dic-20', value: 0.78 },
            { date: 'dic-21', value: 0.81 },
            { date: 'dic-22', value: 0.77 },
            { date: 'dic-23', value: 1.03 },
            { date: 'dic-24', value: 0.92 },
            { date: 'jun-25', value: 0.92 },
            { date: 'Sep-25', value: 0.89 },
            { date: 'dic-25', value: 0.77 }
          ]
        }
      ]
    }
  },
  {
    id: 'tablero-liquidez-4-cards',
    type: 'line-cards',
    eyebrow: '',
    title: 'Riesgo de Liquidez',
    description: '',
    infoNote:
      'Los supuestos utilizados para las proyecciones consideran un objetivo de aprobaciones del DPP de USD 750 millones, desembolsos por USD 560 millones y endeudamiento por USD 750 millones.',
    hideHeader: false,
    layout: 'grid',
    cards: [
      {
        id: 'tablero-liquidez-minima-vs-liquidez',
        chart: minimaRequeridaVsLiquidezChart
      },
      {
        id: 'tablero-liquidez-card-2',
        chart: fonplataRatingThresholdsChart
      },
      {
        id: 'tablero-liquidez-card-3',
        chart: ratioSpChart
      },
      {
        id: 'tablero-liquidez-card-4',
        chart: activosLiquidosTotalesRatioChart
      }
    ]
  },
  {
    id: 'flujos-pais',
    type: 'line-cards',
    eyebrow: '',
    title: 'Flujo Neto por País',
    description: 'USD MILLONES',
    cards: [
      {
        id: 'flujos-pais-argentina',
        chart: flujosPaisSobChartsByCountry.ARGENTINA,
        chartAnnual: flujosPaisNoSobChartsByCountry.ARGENTINA
      },
      {
        id: 'flujos-pais-bolivia',
        chart: flujosPaisSobChartsByCountry.BOLIVIA,
        chartAnnual: flujosPaisNoSobChartsByCountry.BOLIVIA
      },
      {
        id: 'flujos-pais-brasil',
        chart: flujosPaisSobChartsByCountry.BRASIL,
        chartAnnual: flujosPaisNoSobChartsByCountry.BRASIL
      },
      {
        id: 'flujos-pais-paraguay',
        chart: flujosPaisSobChartsByCountry.PARAGUAY,
        chartAnnual: flujosPaisNoSobChartsByCountry.PARAGUAY
      },
      {
        id: 'flujos-pais-uruguay',
        chart: flujosPaisSobChartsByCountry.URUGUAY,
        chartAnnual: flujosPaisNoSobChartsByCountry.URUGUAY
      },
      {
        id: 'flujos-pais-general',
        chart: flujosPaisSobChartsByCountry.GENERAL,
        chartAnnual: flujosPaisNoSobChartsByCountry.GENERAL
      }
    ]
  },
  {
    id: 'proyecciones-desembolsos',
    type: 'debt-sources',
    eyebrow: '',
    title: 'Proyecciones de Desembolsos',
    description: 'Programación mensual 2026 por riesgo soberano y no soberano.',
    tables: [proyeccionesDesembolsosSoberanoTable, proyeccionesDesembolsosNoSoberanoTable]
  },
  {
    id: 'aprobaciones-y-cancelaciones',
    type: 'line-cards',
    eyebrow: '',
    title: 'Aprobaciones y Cancelaciones',
    description: 'USD MILLONES',
    cards: [
      {
        id: 'aprobaciones-cancelaciones-argentina',
        chart: aprobacionesCancelacionesChartsByCountry.ARGENTINA
      },
      {
        id: 'aprobaciones-cancelaciones-bolivia',
        chart: aprobacionesCancelacionesChartsByCountry.BOLIVIA
      },
      {
        id: 'aprobaciones-cancelaciones-brasil',
        chart: aprobacionesCancelacionesChartsByCountry.BRASIL
      },
      {
        id: 'aprobaciones-cancelaciones-paraguay',
        chart: aprobacionesCancelacionesChartsByCountry.PARAGUAY
      },
      {
        id: 'aprobaciones-cancelaciones-uruguay',
        chart: aprobacionesCancelacionesChartsByCountry.URUGUAY
      },
      {
        id: 'aprobaciones-cancelaciones-general',
        chart: aprobacionesCancelacionesChartsByCountry.GENERAL
      }
    ]
  },
  {
    id: 'como-se-generan-los-ingresos',
    type: 'text-table',
    eyebrow: 'Resultado financiero',
    title: '¿Cómo se generan los ingresos?',
    description: '',
    highlights: [
      'Rendimiento de cartera y activos: 2025: cartera de prestamos 7,52% y activos financieros 6,52%. 2024: 8,30% y 7,37%.',
      'Costo y margen financiero: 2025: costo de endeudamiento 6,00% y margen financiero 7,03%. 2024: 6,34% y 8,12%.',
      'Eficiencia operativa: gastos administrativos 2025: $16,2 (0,90% sobre activos financieros netos promedio de $1.809,9). Previsiones y otros cargos 2025: $15,9 (0,88%). 2024: 0,81% y 1,35%.',
      'Resultado neto y retorno: ingresos netos 2025: $95,1 millones y rendimiento sobre patrimonio promedio 5,28%. 2024: $98,7 millones y 5,98%.'
    ],
    highlightEmphasisPrefixes: [
      'Rendimiento de cartera y activos:',
      'Costo y margen financiero:',
      'Eficiencia operativa:',
      'Resultado neto y retorno:'
    ],
    table: {
      title: '1 de enero al 31 de diciembre (2025 vs 2024) (USD MM)',
      columns: [
        { label: 'Concepto', align: 'left', width: '40%' },
        { label: '2025 Saldo Promedio', align: 'right', width: '10%' },
        { label: '2025 Ingresos', align: 'right', width: '10%' },
        { label: '2025 Retorno %', align: 'right', width: '10%' },
        { label: '2024 Saldo Promedio', align: 'right', width: '10%' },
        { label: '2024 Ingresos', align: 'right', width: '10%' },
        { label: '2024 Retorno %', align: 'right', width: '10%' }
      ],
      rows: [
        { cells: ['Préstamos por cobrar', '2.486,4', '187,1', '7,52%', '2.129,6', '166,7', '8,30%'] },
        { cells: ['Inversiones', '1.086,4', '46,9', '4,32%', '711,3', '34,9', '4,91%'] },
        { cells: ['Liquidez', '24,9', '0,4', '1,61%', '36,7', '0,4', '1,09%'] },
        {
          cells: ['Activos financieros', '3.597,7', '234,4', '6,52%', '2.877,6', '212,0', '7,37%'],
          className: 'text-table__row-bold ingresos-table__row-aggregate'
        },
        {
          cells: ['Endeudamientos', '(1.787,8)', '(107,2)', '6,00%', '(1.220,4)', '(77,4)', '6,34%']
        },
        {
          cells: ['Activos financieros netos', '1.809,9', '127,2', '7,03%', '1.657,2', '134,6', '8,12%'],
          className: 'text-table__row-bold ingresos-table__row-aggregate'
        },
        {
          cells: [
            'Previsiones, depreciación, diferencia de cambio y participación fondos especiales',
            '',
            '(15,9)',
            '-0,88%',
            '',
            '(22,4)',
            '-1,35%'
          ]
        },
        {
          cells: ['Gastos administrativos', '', '(16,2)', '-0,90%', '', '(13,5)', '-0,81%']
        },
        {
          cells: ['Activos netos', '1.809,9', '95,1', '5,25%', '1.657,2', '98,7', '5,96%'],
          className: 'text-table__row-bold ingresos-table__row-aggregate'
        },
        {
          cells: ['Patrimonio', '1.549,5', '95,1', '6,14%', '1.649,9', '98,7', '5,98%'],
          className: 'text-table__row-bold ingresos-table__row-aggregate'
        }
      ]
    }
  },
  {
    id: 'navigation-contenidos',
    type: 'navigation',
    title: 'Contenidos',
    description: 'Seleccione una categoría o una diapositiva específica para navegar rápidamente.',
    topics: [
      {
        id: 'evolucion-rubros-balance',
        tag: '01',
        title: 'Situación Financiera',
        description: 'Estado de situación y desempeño financiero.',
        slides: [
          { id: 'evolucion-rubros-balance', title: 'Cambios en Activos y Pasivos Financieros' },
          { id: 'balance-activos-financieros', title: 'Estado de Situación Patrimonial' },
          { id: 'como-se-generan-los-ingresos', title: '¿Cómo se generan los ingresos?' },
          { id: 'flujo-efectivo-2025', title: 'Flujos de Efectivo 2025' },
          { id: 'estado-de-resultados', title: 'Estado de Resultados' },
          { id: 'otras-perdidas-e-ingresos', title: 'Otras Pérdidas e Ingresos' }
        ]
      },
      {
        id: 'cartera-estado-pais',
        tag: '02',
        title: 'Cartera',
        description: 'Cartera por país, categorías, vigencia y seguimiento.',
        slides: [
          { id: 'cartera-estado-pais', title: 'Cartera de Préstamos: Evolución y Proyecciones' },
          { id: 'proporciones-por-pais', title: 'Cartera de Préstamos - País y Categorías' },
          { id: 'capacidad-prestable-riesgo', title: 'Uso de la Capacidad Prestable por País' },
          {
            id: 'vigencia-activacion',
            title:
              'Proyección de Cartera: Operaciones Aprobadas No Vigentes y Etapas Pendientes de Activación'
          },
          { id: 'analisis-tasas', title: 'Tasas Activas (Cartera): Evolución Reciente' },
          { id: 'flujos-pais', title: 'Flujos País' },
          { id: 'proyecciones-desembolsos', title: 'Proyecciones de Desembolsos' },
          { id: 'aprobaciones-y-cancelaciones', title: 'Aprobaciones y Cancelaciones' }
        ]
      },
      {
        id: 'cartera-inversiones-fonplata',
        tag: '03',
        title: 'Inversiones',
        description: 'Portafolios de inversión y actividad trimestral.',
        slides: [
          { id: 'cartera-inversiones-fonplata', title: 'Cartera de Inversiones FONPLATA' },
          { id: 'slide-7', title: 'Actividad del Trimestre' },
          { id: 'cartera-inversiones-focem', title: 'Cartera de Inversiones FOCEM' }
        ]
      },
      {
        id: 'analisis-endeudamiento',
        tag: '04',
        title: 'Endeudamiento',
        description: 'Costo financiero, fuentes y emisiones.',
        slides: [
          { id: 'analisis-endeudamiento', title: 'Tasas Pasivas (Endeudamiento): Evolución Reciente' },
          { id: 'deuda-por-fuente', title: 'Endeudamiento por Instrumento y Tipo de Sector' },
          { id: 'perfil-amortizacion', title: 'Endeudamiento: Evolución y Proyecciones' },
          { id: 'emisiones-segmentadas-2025', title: 'Endeudamiento 2025' }
        ]
      },
      {
        id: 'exposicion-cartera-riesgo',
        tag: '05',
        title: 'Monitoreo de Riesgos y Política Financiera',
        description: 'Indicadores clave y control de política financiera.',
        slides: [
          { id: 'exposicion-cartera-riesgo', title: 'Exposición de Cartera al Riesgo' },
          { id: 'exposicion-cartera-riesgo-cards', title: 'Exposición de Cartera al Riesgo (Cards)' },
          { id: 'tablero-liquidez-4-cards', title: 'Riesgo de Liquidez' },
          { id: 'prevision-perdida-cartera-prestamos', title: 'Previsión para Pérdida de Cartera de Préstamos' },
          { id: 'adecuacion-del-capital', title: 'Adecuación del Capital' },
          { id: 'slide-14', title: 'Monitoreo del Endeudamiento' }
        ]
      },
      {
        id: 'coyuntura-tasa-interes',
        tag: '06',
        title: 'Conyuntura Económica',
        description: 'Seguimiento de tasas, dólar y rendimientos.',
        slides: [
          { id: 'coyuntura-tasa-interes', title: '1. Tasa de interés' },
          { id: 'coyuntura-dolar', title: '2. Dólar' },
          { id: 'coyuntura-rendimientos', title: '3. Rendimientos' }
        ]
      }
    ]
  },
  {
    id: 'estado-de-resultados',
    type: 'text-table',
    eyebrow: 'Resultado financiero',
    title: 'Estado de Resultados',
    description: '',
    highlights: [
      'Ingresos por préstamos: crecieron por el aumento de cartera en $208,6 (8,75%), explicado por desembolsos de $430,9 frente a amortizaciones de principal de $222,3. La SOFR promedio cayó -17,7% (4,24% en 2025 vs 5,15% en 2024).',
      'Costo financiero: intereses y cargos por endeudamiento subieron 38,5% nominal ($107,2 en 2025 vs $77,4 en 2024), mientras el costo promedio bajó 34 pbs (-5,4%; 600 pbs vs 634 pbs).',
      'Gasto administrativo: aumentó $1,1 (7,9%) hasta $15,0, consistente con mayor dotación y beneficios al personal. Sobre activos financieros netos promedio, subió 9 pbs (0,90% vs 0,81%).',
      'Resultado del ejercicio 2025: positivo por $95,1 millones.'
    ],
    highlightEmphasisPrefixes: [
      'Ingresos por préstamos:',
      'Costo financiero:',
      'Gasto administrativo:',
      'Resultado del ejercicio 2025:'
    ],
    table: {
      title: 'Comparativo dic-25 vs dic-24 (USD MM)',
      columns: [
        { label: 'Concepto', align: 'left', width: '44%' },
        { label: 'dic-25', align: 'right', width: '18%' },
        { label: 'dic-24', align: 'right', width: '18%' },
        { label: 'Var', align: 'right', width: '20%' }
      ],
      rows: [
        { cells: ['Cartera de préstamos', '', '', ''], className: 'text-table__row-bold' },
        { cells: ['Intereses', '179,1', '169,6', '5,6%'] },
        { cells: ['Otros ingresos por préstamos', '8,0', '7,1', '12,7%'] },
        {
          cells: ['Ingresos por préstamos', '187,1', '176,7', '5,9%'],
          className: 'text-table__row-bold'
        },
        { cells: ['Inversiones', '', '', ''], className: 'text-table__row-bold' },
        { cells: ['Intereses', '46,2', '33,9', '36,3%'] },
        { cells: ['Otros ingresos por inversiones', '0,4', '0,4', '0,0%'] },
        {
          cells: ['Ingresos por inversiones', '46,6', '34,3', '35,9%'],
          className: 'text-table__row-bold'
        },
        {
          cells: ['Ingresos por activos financieros', '233,7', '211,0', '10,8%'],
          className: 'text-table__row-bold'
        },
        { cells: ['Gastos', '', '', ''], className: 'text-table__row-bold' },
        { cells: ['Intereses y cargos por endeudamiento', '(107,2)', '(77,4)', '38,5%'] },
        {
          cells: ['Ingresos por activos financieros netos', '126,5', '133,6', '-5,3%'],
          className: 'text-table__row-bold'
        },
        { cells: ['Otros ingresos/(pérdidas)', '(18,4)', '(18,6)', '-1,1%'] },
        {
          cells: ['Ingresos antes de provisiones y gastos administrativos', '108,1', '115,0', '-6,0%'],
          className: 'text-table__row-bold'
        },
        { cells: ['Provisión por deterioro de préstamos', '2,0', '(2,4)', '-183,3%'] },
        {
          cells: ['Ingresos después de la provisión por deterioro de préstamos', '110,1', '112,6', '-2,2%'],
          className: 'text-table__row-bold'
        },
        { cells: ['Gastos administrativos – Nota 12', '(15,0)', '(13,9)', '7,9%'] },
        {
          cells: ['Resultado neto', '95,1', '98,7', '-3,6%'],
          className: 'text-table__row-bold'
        }
      ]
    }
  },
  {
    id: 'otras-perdidas-e-ingresos',
    type: 'text-table',
    eyebrow: 'Resultado financiero',
    title: 'Otras Pérdidas e Ingresos',
    description: 'Detalle complementario de rubros no financieros.',
    highlights: [
      'Apertura de los componentes de otras pérdidas e ingresos.',
      'Comparativo interanual para facilitar el análisis de variaciones.',
      'Espacio preparado para completar con el detalle final.'
    ],
    table: {
      title: 'Detalle dic-25 vs dic-24',
      columns: [
        { label: '', align: 'left', width: '30%' },
        { label: '', align: 'left', width: '34%' },
        { label: 'dic-25', align: 'right', width: '12%' },
        { label: 'dic-24', align: 'right', width: '12%' },
        { label: 'Var', align: 'right', width: '12%' }
      ],
      rows: [
        {
          cells: [
            '4.3.01 - Intereses Prest. Funcionarios',
            'Intereses préstamos a funcionarios',
            '0,0',
            '0,0',
            '16,0%'
          ]
        },
        {
          cells: ['4.3.03 - Otros Ingresos', 'Otros ingresos/pérdidas', '0,1', '0,0', '267,7%']
        },
        {
          cells: ['4.3.04 - Ingreso Adm. Fideicomiso', 'Comisión de Administración FOCEM', '0,4', '0,5', '-21,3%']
        },
        {
          cells: ['', 'Subtotal de otros ingresos', '0,6', '0,6', '-2,8%'],
          className: 'text-table__row-bold'
        },
        {
          cells: [
            '4.3.05.01 - Ajuste VM. Deuda',
            'Ajuste a valor razonable de endeudamientos captados',
            '(125,2)',
            '36,8',
            '-440,2%'
          ]
        },
        {
          cells: ['', 'Ajuste a valor razonable swaps por recibir y por pagar', '105,8', '(56,0)', '-289,0%']
        },
        {
          cells: ['', 'Pérdida no realizada', '(19,3)', '(19,2)', '0,8%'],
          className: 'text-table__row-bold'
        },
        {
          cells: ['', 'Total otros ingresos/(pérdidas)', '(18,7)', '(18,6)', '0,9%'],
          className: 'text-table__row-bold'
        }
      ]
    }
  },
  {
    id: 'flujo-efectivo-2025',
    type: 'text-table',
    eyebrow: 'Flujo de efectivo',
    title: 'Flujos de Efectivo: Variación 2025',
    description: '',
    highlights: [
      'Flujo neto total 2025: +$41,3 millones.',
      'Flujo neto de préstamos: -$24,1.',
      'Flujo neto administrativo: -$17,9.',
      'Flujo neto de endeudamiento: +$680,3.',
      'Flujo por integración de capital: +$8,8.',
      'Flujo neto de inversiones: -$605,8.'
    ],
    highlightEmphasisPrefixes: [
      'Flujo neto total 2025:',
      'Flujo neto de préstamos:',
      'Flujo neto administrativo:',
      'Flujo neto de endeudamiento:',
      'Flujo por integración de capital:',
      'Flujo neto de inversiones:'
    ],
    table: {
      title: 'Estado de flujos de efectivo (USD MM)',
      columns: [
        { label: 'Concepto', align: 'left', width: '64%' },
        { label: '2025', align: 'right', width: '18%' },
        { label: '2024', align: 'right', width: '18%' }
      ],
      rows: [
        {
          cells: ['Flujos de efectivo de actividades operativas', '', ''],
          className: 'cashflow-table__section'
        },
        { cells: ['Préstamos', '', ''], className: 'cashflow-table__group' },
        { cells: ['Desembolsos', '(430,9)', '(737,0)'] },
        { cells: ['Efectivo recibido de amortizaciones', '222,3', '232,2'] },
        { cells: ['Exceso de desembolsos sobre amortizaciones', '(208,6)', '(504,8)'] },
        { cells: ['Efectivo recibido de intereses y otros cargos', '184,5', '172,2'] },
        {
          cells: ['Flujos netos de efectivo de préstamos', '(24,1)', '(332,6)'],
          className: 'cashflow-table__subtotal'
        },
        { cells: ['Otros flujos operativos:', '', ''], className: 'cashflow-table__group' },
        { cells: ['Pago de salarios, beneficios y otros gastos de personal', '(11,1)', '(7,9)'] },
        { cells: ['Pago de gastos administrativos', '(4,2)', '(4,5)'] },
        { cells: ['Aumento en saldos con proveedores, fondos especiales y otros', '(2,6)', '(3,1)'] },
        {
          cells: ['Flujos netos de otras actividades operativas', '(17,9)', '(15,5)'],
          className: 'cashflow-table__subtotal'
        },
        {
          cells: ['Flujos netos de efectivo de actividades operativas', '(42,0)', '(348,1)'],
          className: 'cashflow-table__total'
        },
        { cells: ['', '', ''], className: 'cashflow-table__spacer' },
        {
          cells: ['Flujos de efectivo de actividades de financiación', '', ''],
          className: 'cashflow-table__section'
        },
        { cells: ['Efectivo recibido por endeudamientos contraídos', '718,2', '662,5'] },
        { cells: ['Colateral recibido en derivados por operaciones de protección', '109,2', '(49,5)'] },
        { cells: ['Amortizaciones y servicios de deuda', '(147,1)', '(370,9)'] },
        {
          cells: ['Flujos netos de endeudamientos para el fondeo de préstamos', '680,3', '242,1'],
          className: 'cashflow-table__subtotal'
        },
        { cells: ['Cobro de suscripciones de capital en efectivo', '8,8', '110,7'] },
        {
          cells: ['Flujos netos de efectivo de actividades de financiación', '689,1', '352,8'],
          className: 'cashflow-table__total'
        },
        { cells: ['', '', ''], className: 'cashflow-table__spacer' },
        {
          cells: ['Flujos de efectivo de actividades de inversión', '', ''],
          className: 'cashflow-table__section'
        },
        { cells: ['Cobro de intereses y otros por inversiones', '35,5', '35,1'] },
        { cells: ['(Compra) venta de inversiones, neta', '(641,2)', '(24,3)'] },
        { cells: ['Erogaciones de capital', '(0,1)', '(0,3)'] },
        {
          cells: ['Flujos netos de efectivo de actividades de inversión', '(605,8)', '10,5'],
          className: 'cashflow-table__total'
        },
        { cells: ['', '', ''], className: 'cashflow-table__spacer' },
        {
          cells: ['Aumento en efectivo y sus equivalentes durante el ejercicio', '41,3', '15,2'],
          className: 'cashflow-table__result'
        },
        { cells: ['Efectivo y sus equivalentes al inicio del ejercicio', '339,4', '324,2'] },
        {
          cells: ['Efectivo y sus equivalentes al cierre del ejercicio', '380,7', '339,4'],
          className: 'cashflow-table__result'
        }
      ]
    }
  },
  {
    id: 'coyuntura-tasa-interes',
    type: 'line-cards',
    eyebrow: 'Conyuntura Económica',
    title: 'Tasa de interés',
    description: '',
    hideHeader: true,
    cards: [
      {
        id: 'coyuntura-tasa-interes-card',
        chart: coyunturaTasaInteresChart
      }
    ]
  },
  {
    id: 'coyuntura-dolar',
    type: 'line-cards',
    eyebrow: 'Conyuntura Económica',
    title: 'Dólar',
    description: '',
    hideHeader: true,
    cards: [
      {
        id: 'coyuntura-dolar-card',
        placeholderTitle: 'Dólar',
        placeholderSubtitle: 'Pendiente de datos'
      }
    ]
  },
  {
    id: 'coyuntura-rendimientos',
    type: 'line-cards',
    eyebrow: 'Conyuntura Económica',
    title: 'Rendimientos',
    description: '',
    hideHeader: true,
    cards: [
      {
        id: 'coyuntura-rendimientos-card',
        placeholderTitle: 'Rendimientos',
        placeholderSubtitle: 'Pendiente de datos'
      }
    ]
  }
];

const requestedSlideOrder = [
  1, 31, 22, 21, 23, 30, 34, 32, 33, 3, 4, 5, 6, 7, 13, 27, 28, 29, 8, 9, 10, 11, 12, 14, 15, 16, 18,
  2, 19, 20, 26, 25, 24, 17, 35, 36, 37
] as const;

const temporarilyHiddenSlideIds = new Set<string>([
  'otras-perdidas-e-ingresos',
  'coyuntura-tasa-interes',
  'coyuntura-dolar',
  'coyuntura-rendimientos'
]);

const orderedSlides: SlideDefinition[] = requestedSlideOrder.map((slideNumber) => {
  const slide = baseSlides[slideNumber - 1];
  if (!slide) {
    throw new Error(`Invalid slide number in requestedSlideOrder: ${slideNumber}`);
  }
  return slide;
});

const visibleSlides = orderedSlides.filter((slide) => !temporarilyHiddenSlideIds.has(slide.id));
const visibleSlideIds = new Set(visibleSlides.map((slide) => slide.id));

export const slides: SlideDefinition[] = visibleSlides.map((slide) => {
  if (slide.type !== 'navigation') {
    return slide;
  }

  const visibleTopics = slide.topics
    .map((topic) => ({
      ...topic,
      slides: topic.slides?.filter((topicSlide) => visibleSlideIds.has(topicSlide.id))
    }))
    .filter((topic) => (topic.slides?.length ?? 0) > 0);

  return {
    ...slide,
    topics: visibleTopics
  };
});
